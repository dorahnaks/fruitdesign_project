from flask import Blueprint, request, jsonify, current_app
from app.models.customer import Customer
from app.models.admin_user import AdminUser
from app.extensions import db, bcrypt, jwt
from flask_jwt_extended import (
    create_access_token, jwt_required, get_jwt_identity, 
    get_jwt, create_refresh_token, get_jti
)
from app.status_codes import (
    HTTP_200_OK, HTTP_201_CREATED, HTTP_400_BAD_REQUEST,
    HTTP_404_NOT_FOUND, HTTP_401_UNAUTHORIZED, HTTP_500_INTERNAL_SERVER_ERROR
)
import re
import traceback
import sys
import bcrypt
from datetime import datetime, timedelta

auth_bp = Blueprint('auth', __name__, url_prefix='/api/v1/auth')

# Helper functions
def validate_email(email):
    """Validate email format"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def validate_phone(phone):
    """Validate phone number format"""
    clean_phone = re.sub(r'[^\d]', '', phone)
    return len(clean_phone) >= 10

def validate_password(password):
    """Validate password strength"""
    if len(password) < 8:
        return False, "Password must be at least 8 characters long"
    if not re.search(r'[A-Z]', password):
        return False, "Password must contain at least one uppercase letter"
    if not re.search(r'[a-z]', password):
        return False, "Password must contain at least one lowercase letter"
    if not re.search(r'\d', password):
        return False, "Password must contain at least one digit"
    return True, "Password is valid"

def hash_password(password):
    """Hash password with bcrypt"""
    try:
        # Encode password to bytes
        password_bytes = password.encode('utf-8')
        # Generate salt and hash password
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw(password_bytes, salt)
        # Return as string
        return hashed.decode('utf-8')
    except Exception as e:
        print(f"Error hashing password: {str(e)}", file=sys.stderr)
        raise

def check_password(hashed_password, input_password):
    """Check if the input password matches the hashed password"""
    try:
        # Get stored password and encode to bytes
        stored_password = hashed_password.encode('utf-8')
        # Encode input password to bytes
        input_password = input_password.encode('utf-8')
        # Check if passwords match
        return bcrypt.checkpw(input_password, stored_password)
    except Exception as e:
        print(f"Error checking password: {str(e)}", file=sys.stderr)
        print(f"Hashed password: {hashed_password}", file=sys.stderr)
        print(f"Input password: {input_password}", file=sys.stderr)
        return False

# Store blacklisted tokens (in production, use Redis or database)
blacklisted_tokens = set()

# Routes
@auth_bp.route('/register', methods=['POST'])
def register_customer():
    """Register a new customer account"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['name', 'phone', 'password']
        missing_fields = []
        
        for field in required_fields:
            if not data.get(field):
                missing_fields.append(field)
                
        if missing_fields:
            return jsonify({
                'error': f'Missing required fields: {", ".join(missing_fields)}'
            }), HTTP_400_BAD_REQUEST
        
        name = data.get('name').strip()
        phone = data.get('phone').strip()
        password = data.get('password')
        email = data.get('email', '').strip().lower()
        address = data.get('address', '').strip()
        
        # Detailed logging for debugging
        current_app.logger.info(f"Registration attempt for email: {email}")
        
        # Email validation if provided
        if email and not validate_email(email):
            return jsonify({
                'error': 'Invalid email format. Please use a valid email address.'
            }), HTTP_400_BAD_REQUEST
        
        # Phone validation
        if not validate_phone(phone):
            return jsonify({
                'error': 'Invalid phone number format. Please enter a valid phone number.'
            }), HTTP_400_BAD_REQUEST
        
        # Password validation
        is_valid, message = validate_password(password)
        if not is_valid:
            return jsonify({
                'error': f'Password validation failed: {message}'
            }), HTTP_400_BAD_REQUEST
        
        # Check for existing customer by email if provided
        if email:
            existing_customer = Customer.query.filter_by(email=email).first()
            if existing_customer:
                return jsonify({
                    'error': 'Email already registered. Please use a different email address.'
                }), HTTP_400_BAD_REQUEST
        
        # Hash password
        hashed_password = hash_password(password)
        
        # Create new customer
        new_customer = Customer(
            name=name,
            email=email,
            password=hashed_password,
            phone=phone,
            address=address
        )
        
        # Save to database
        db.session.add(new_customer)
        db.session.commit()
        
        # Create tokens with string identity and role in claims
        access_token = create_access_token(
            identity=str(new_customer.id),  # String identity
            additional_claims={'role': 'customer'}
        )
        
        refresh_token = create_refresh_token(
            identity=str(new_customer.id),  # String identity
            additional_claims={'role': 'customer'}
        )
        
        current_app.logger.info(f"Customer registered successfully: {email}")
        
        return jsonify({
            'message': 'Customer registered successfully!',
            'access_token': access_token,
            'refresh_token': refresh_token,
            'user': {
                'id': new_customer.id,
                'name': new_customer.name,
                'email': new_customer.email,
                'phone': new_customer.phone,
                'address': new_customer.address,
                'role': 'customer'
            }
        }), HTTP_201_CREATED
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Registration error: {str(e)}")
        current_app.logger.error(traceback.format_exc())
        
        return jsonify({
            'error': 'An unexpected error occurred during registration. Please contact support.'
        }), HTTP_500_INTERNAL_SERVER_ERROR

@auth_bp.route('/login', methods=['POST'])
def login():
    """Authenticate user and return JWT tokens"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), HTTP_400_BAD_REQUEST
        
        # Get credentials
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        
        if not email or not password:
            return jsonify({'error': 'Email and password are required'}), HTTP_400_BAD_REQUEST
        
        current_app.logger.info(f"Login attempt for email: {email}")
        
        # Try to find user in both tables
        user = None
        user_type = None
        
        # Check customer table
        customer = Customer.query.filter_by(email=email).first()
        if customer:
            current_app.logger.info(f"Found customer with email {email}")
            is_valid = check_password(customer.password, password)
            current_app.logger.info(f"Password valid for customer: {is_valid}")
            if is_valid:
                user = customer
                user_type = 'customer'
                # Update last login
                customer.last_login = datetime.utcnow()
        else:
            current_app.logger.info(f"Customer not found with email {email}")
        
        # If not found as customer, check admin table
        if not user:
            admin = AdminUser.query.filter_by(email=email).first()
            if admin:
                current_app.logger.info(f"Found admin with email {email}")
                is_valid = check_password(admin.password, password)
                current_app.logger.info(f"Password valid for admin: {is_valid}")
                if is_valid:
                    user = admin
                    user_type = admin.role  # Use the role from the admin table (admin or super_admin)
                    # Update last login
                    admin.last_login = datetime.utcnow()
            else:
                current_app.logger.info(f"Admin not found with email {email}")
        
        if not user:
            current_app.logger.warning(f"Login failed for email {email}")
            return jsonify({'error': 'Invalid credentials'}), HTTP_401_UNAUTHORIZED
        
        # Commit the last login update
        db.session.commit()
        
        # Create tokens with string identity and role in claims
        access_token = create_access_token(
            identity=str(user.id),  # String identity
            additional_claims={'role': user_type}
        )
        
        refresh_token = create_refresh_token(
            identity=str(user.id),  # String identity
            additional_claims={'role': user_type}
        )
        
        # Prepare response data with consistent structure
        response_data = {
            'message': 'Login successful',
            'access_token': access_token,
            'refresh_token': refresh_token,
            'role': user_type,
            'user_id': user.id
        }
        
        # Add user-specific data with consistent 'user' key
        if user_type == 'customer':
            response_data['user'] = {
                'id': user.id,
                'name': user.name,
                'email': user.email,
                'phone': user.phone,
                'address': user.address,
                'role': 'customer'
            }
        else:
            response_data['user'] = {
                'id': user.id,
                'name': user.full_name,
                'email': user.email,
                'phone': user.phone_number,
                'role': user.role
            }
        
        current_app.logger.info(f"Login successful for {email} as {user_type}")
        return jsonify(response_data), HTTP_200_OK
        
    except Exception as e:
        current_app.logger.error(f"Login error: {str(e)}")
        current_app.logger.error(traceback.format_exc())
        return jsonify({'error': 'Login failed'}), HTTP_500_INTERNAL_SERVER_ERROR

@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    """Refresh access token"""
    try:
        # Get identity (string user ID) and claims from refresh token
        identity = get_jwt_identity()
        claims = get_jwt()
        role = claims.get('role')
        
        # Create new access token with same identity and role
        access_token = create_access_token(
            identity=identity,  # Already a string
            additional_claims={'role': role}
        )
        
        return jsonify({
            'access_token': access_token
        }), HTTP_200_OK
    except Exception as e:
        current_app.logger.error(f"Token refresh error: {str(e)}")
        current_app.logger.error(traceback.format_exc())
        return jsonify({'error': 'Could not refresh token'}), HTTP_401_UNAUTHORIZED

@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    """Logout user and blacklist token"""
    try:
        jti = get_jti()
        blacklisted_tokens.add(jti)
        
        return jsonify({
            'message': 'Successfully logged out'
        }), HTTP_200_OK
    except Exception as e:
        current_app.logger.error(f"Logout error: {str(e)}")
        return jsonify({'error': 'Logout failed'}), HTTP_500_INTERNAL_SERVER_ERROR

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    """Get current user information"""
    try:
        # Get identity (string user ID) and claims from token
        identity = get_jwt_identity()
        claims = get_jwt()
        role = claims.get('role')
        
        # Convert identity to integer
        try:
            user_id = int(identity)
        except ValueError:
            return jsonify({'error': 'Invalid user ID in token'}), HTTP_400_BAD_REQUEST
        
        # Find user based on role
        if role == 'customer':
            user = Customer.query.get(user_id)
            if not user:
                return jsonify({'error': 'User not found'}), HTTP_404_NOT_FOUND
            
            # Return customer data
            return jsonify({
                'id': user.id,
                'name': user.name,
                'email': user.email,
                'phone': user.phone,
                'address': user.address,
                'role': 'customer'
            }), HTTP_200_OK
        
        elif role in ['admin', 'super_admin']:
            user = AdminUser.query.get(user_id)
            if not user:
                return jsonify({'error': 'User not found'}), HTTP_404_NOT_FOUND
            
            # Return admin data
            return jsonify({
                'id': user.id,
                'name': user.full_name,
                'email': user.email,
                'phone': user.phone_number,
                'role': user.role
            }), HTTP_200_OK
        
        else:
            return jsonify({'error': 'Invalid user role'}), HTTP_400_BAD_REQUEST
            
    except Exception as e:
        current_app.logger.error(f"Get current user error: {str(e)}")
        current_app.logger.error(traceback.format_exc())
        return jsonify({'error': 'Failed to get user information'}), HTTP_500_INTERNAL_SERVER_ERROR

@auth_bp.route('/me', methods=['PUT'])
@jwt_required()
def update_user_profile():
    """Update current user profile"""
    try:
        # Get identity (string user ID) and claims from token
        identity = get_jwt_identity()
        claims = get_jwt()
        role = claims.get('role')
        
        # Convert identity to integer
        try:
            user_id = int(identity)
        except ValueError:
            return jsonify({'error': 'Invalid user ID in token'}), HTTP_400_BAD_REQUEST
        
        data = request.get_json()
        
        current_app.logger.info("=== PROFILE UPDATE DEBUG ===")
        current_app.logger.info(f"Update profile request for user {user_id} with role {role}")
        current_app.logger.info(f"Raw request data: {data}")
        current_app.logger.info(f"Request content type: {request.content_type}")
        current_app.logger.info(f"Request headers: {dict(request.headers)}")
        
        if not data:
            current_app.logger.error("No data provided in request")
            return jsonify({'error': 'No data provided'}), HTTP_400_BAD_REQUEST
        
        if role == 'customer':
            user = Customer.query.get(user_id)
            if not user:
                current_app.logger.error(f"Customer not found with ID {user_id}")
                return jsonify({'error': 'User not found'}), HTTP_404_NOT_FOUND
            
            current_app.logger.info(f"Found customer: {user.name} (ID: {user.id})")
            
            # Handle name field
            if 'name' in data:
                name = data['name']
                current_app.logger.info(f"Processing name field: {name} (type: {type(name)})")
                if name is not None:
                    name = name.strip()
                    if not name:
                        current_app.logger.error("Name cannot be empty")
                        return jsonify({'error': 'Name cannot be empty'}), HTTP_400_BAD_REQUEST
                    user.name = name
                    current_app.logger.info(f"Updated name to: {user.name}")
            
            # Handle email update
            if 'email' in data:
                email = data['email']
                current_app.logger.info(f"Processing email field: {email} (type: {type(email)})")
                if email is not None:
                    email = email.strip().lower() if email else None
                    if email:
                        if not validate_email(email):
                            current_app.logger.error(f"Invalid email format: {email}")
                            return jsonify({'error': 'Invalid email format'}), HTTP_400_BAD_REQUEST
                        
                        existing_customer = Customer.query.filter_by(email=email).first()
                        if existing_customer and existing_customer.id != user.id:
                            current_app.logger.error(f"Email already in use by customer {existing_customer.id}")
                            return jsonify({'error': 'Email already in use by another customer'}), HTTP_400_BAD_REQUEST
                    
                    user.email = email
                    current_app.logger.info(f"Updated email to: {user.email}")
            
            # Handle phone update
            if 'phone' in data:
                phone = data['phone']
                current_app.logger.info(f"Processing phone field: {phone} (type: {type(phone)})")
                if phone is not None:
                    phone = phone.strip()
                    if not phone:
                        current_app.logger.error("Phone number is required")
                        return jsonify({'error': 'Phone number is required'}), HTTP_400_BAD_REQUEST
                    if not validate_phone(phone):
                        current_app.logger.error(f"Invalid phone number format: {phone}")
                        return jsonify({'error': 'Invalid phone number format'}), HTTP_400_BAD_REQUEST
                    user.phone = phone
                    current_app.logger.info(f"Updated phone to: {user.phone}")
            
            # Handle address
            if 'address' in data:
                address = data['address']
                current_app.logger.info(f"Processing address field: {address} (type: {type(address)})")
                if address is not None:
                    user.address = address.strip() if address else None
                    current_app.logger.info(f"Updated address to: {user.address}")
            
            current_app.logger.info(f"User object before commit: {user.to_dict()}")
            
            db.session.commit()
            current_app.logger.info("Database commit successful")
            
            response_data = {
                'id': user.id,
                'name': user.name,
                'email': user.email,
                'phone': user.phone,
                'address': user.address,
                'role': 'customer'
            }
            current_app.logger.info(f"Returning response data: {response_data}")
            current_app.logger.info("=== END DEBUG ===")
            return jsonify(response_data), HTTP_200_OK
        
        elif role in ['admin', 'super_admin']:
            user = AdminUser.query.get(user_id)
            if not user:
                current_app.logger.error(f"Admin not found with ID {user_id}")
                return jsonify({'error': 'User not found'}), HTTP_404_NOT_FOUND
            
            if 'name' in data:
                name = data['name']
                if name is not None:
                    name = name.strip()
                    if not name:
                        return jsonify({'error': 'Name cannot be empty'}), HTTP_400_BAD_REQUEST
                    user.full_name = name
            
            if 'phone' in data:
                phone = data['phone']
                if phone is not None:
                    phone = phone.strip()
                    if phone and not validate_phone(phone):
                        return jsonify({'error': 'Invalid phone number format'}), HTTP_400_BAD_REQUEST
                    user.phone_number = phone
            
            db.session.commit()
            
            return jsonify({
                'id': user.id,
                'name': user.full_name,
                'email': user.email,
                'phone': user.phone_number,
                'role': user.role
            }), HTTP_200_OK
        
        else:
            current_app.logger.error(f"Invalid user role: {role}")
            return jsonify({'error': 'Invalid user role'}), HTTP_400_BAD_REQUEST
            
    except Exception as e:
        db.session.rollback()
        current_app.logger.error("=== PROFILE UPDATE EXCEPTION ===")
        current_app.logger.error(f"Update user profile error: {str(e)}")
        current_app.logger.error(traceback.format_exc())
        current_app.logger.error("=== END EXCEPTION ===")
        return jsonify({'error': 'Failed to update user profile'}), HTTP_500_INTERNAL_SERVER_ERROR
    
# JWT token blacklist check
@jwt.token_in_blocklist_loader
def check_if_token_revoked(jwt_header, jwt_payload):
    jti = jwt_payload['jti']
    return jti in blacklisted_tokens