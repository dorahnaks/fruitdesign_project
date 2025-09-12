from flask import Blueprint, request, jsonify
from app.models.customer import Customer
from app.extensions import db
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
from flask_mail import Message
from app import mail
from app.status_codes import (
    HTTP_200_OK, HTTP_201_CREATED, HTTP_400_BAD_REQUEST,
    HTTP_404_NOT_FOUND, HTTP_401_UNAUTHORIZED, HTTP_500_INTERNAL_SERVER_ERROR
)
from datetime import datetime, timedelta
import uuid

customer_bp = Blueprint('customer', __name__, url_prefix='/api/v1/customers')

# Helper function to check if current user is a customer
def is_customer():
    identity = get_jwt_identity()
    if isinstance(identity, dict):
        return identity.get('role') == 'customer'
    elif isinstance(identity, str):
        return identity.startswith('customer_')
    return False

# Helper function to check if current user is an admin
def is_admin():
    identity = get_jwt_identity()
    if isinstance(identity, dict):
        return identity.get('role') in ['admin', 'superadmin']
    elif isinstance(identity, str):
        return identity.startswith('admin_') or identity.startswith('superadmin_')
    return False

# Helper function to check if current user is a superadmin
def is_superadmin():
    identity = get_jwt_identity()
    if isinstance(identity, dict):
        return identity.get('role') == 'superadmin'
    elif isinstance(identity, str):
        return identity.startswith('superadmin_')
    return False

# Helper function to check if current user is an admin or superadmin
def is_admin_or_superadmin():
    return is_admin() or is_superadmin()

# Helper function to extract customer ID from JWT token
def get_current_customer_id():
    identity = get_jwt_identity()
    if isinstance(identity, dict):
        if identity.get('role') == 'customer':
            return identity.get('id')
    elif isinstance(identity, str):
        if identity.startswith('customer_'):
            try:
                return int(identity.split('_')[1])
            except (IndexError, ValueError):
                pass
    return None

# Get all customers - admin or superadmin only
@customer_bp.route('/', methods=['GET'])
@jwt_required()
def get_all_customers():
    if not is_admin_or_superadmin():
        return jsonify({
            'error': 'Admin or superadmin access required',
            'code': 'insufficient_privileges'
        }), HTTP_401_UNAUTHORIZED
    
    try:
        customers = Customer.query.all()
        customers_data = []
        
        for customer in customers:
            customers_data.append({
                'id': customer.id,
                'name': customer.name,
                'email': customer.email,
                'phone': customer.phone,
                'address': customer.address,
                'date_of_birth': customer.date_of_birth,
                'profile_picture': customer.profile_picture,
                'email_verified': customer.email_verified,
                'is_active': customer.is_active,
                'last_login': customer.last_login.isoformat() if customer.last_login else None,
                'created_at': customer.created_at.isoformat(),
                'updated_at': customer.updated_at.isoformat()
            })
        
        return jsonify({
            'message': f'Retrieved {len(customers_data)} customers',
            'data': {
                'customers': customers_data,
                'count': len(customers_data)
            }
        }), HTTP_200_OK
    except Exception as e:
        return jsonify({
            'error': 'Failed to retrieve customers due to a server error',
            'details': str(e)
        }), HTTP_500_INTERNAL_SERVER_ERROR

# Get specific customer - admin, superadmin, or the customer themselves
@customer_bp.route('/<int:customer_id>', methods=['GET'])
@jwt_required()
def get_customer(customer_id):
    current_customer_id = get_current_customer_id()
    is_current_user = is_customer() and current_customer_id == customer_id
    is_authorized = is_admin_or_superadmin() or is_current_user
    
    if not is_authorized:
        return jsonify({
            'error': 'Access denied. You can only view your own profile.',
            'code': 'insufficient_privileges'
        }), HTTP_401_UNAUTHORIZED
    
    try:
        customer = Customer.query.get(customer_id)
        if not customer:
            return jsonify({
                'error': 'Customer not found',
                'code': 'customer_not_found'
            }), HTTP_404_NOT_FOUND
        
        return jsonify({
            'message': 'Customer retrieved successfully',
            'data': {
                'id': customer.id,
                'name': customer.name,
                'email': customer.email,
                'phone': customer.phone,
                'address': customer.address,
                'date_of_birth': customer.date_of_birth,
                'profile_picture': customer.profile_picture,
                'email_verified': customer.email_verified,
                'is_active': customer.is_active,
                'last_login': customer.last_login.isoformat() if customer.last_login else None,
                'created_at': customer.created_at.isoformat(),
                'updated_at': customer.updated_at.isoformat()
            }
        }), HTTP_200_OK
    except Exception as e:
        return jsonify({
            'error': 'Failed to retrieve customer',
            'details': str(e)
        }), HTTP_500_INTERNAL_SERVER_ERROR

# Update customer by admin/superadmin
@customer_bp.route('/<int:customer_id>', methods=['PUT', 'PATCH'])
@jwt_required()
def update_customer_by_admin(customer_id):
    if not is_admin_or_superadmin():
        return jsonify({
            'error': 'Admin or superadmin access required',
            'code': 'insufficient_privileges'
        }), HTTP_401_UNAUTHORIZED
    
    try:
        customer = Customer.query.get(customer_id)
        if not customer:
            return jsonify({
                'error': 'Customer not found',
                'code': 'customer_not_found'
            }), HTTP_404_NOT_FOUND
        
        data = request.get_json()
        if not data:
            return jsonify({
                'error': 'No data provided',
                'code': 'no_data'
            }), HTTP_400_BAD_REQUEST
        
        # Fields allowed to update
        updatable_fields = ['name', 'email', 'phone', 'address', 'date_of_birth', 'profile_picture', 'is_active']
        updated_fields = []
        
        # Process each field
        for field in updatable_fields:
            if field in data:
                # Handle boolean conversion for is_active field
                if field == 'is_active':
                    if isinstance(data[field], str):
                        if data[field].lower() in ['true', '1', 'yes', 'on']:
                            data[field] = True
                        elif data[field].lower() in ['false', '0', 'no', 'off']:
                            data[field] = False
                        else:
                            return jsonify({
                                'error': 'Invalid boolean value for is_active field',
                                'code': 'invalid_boolean'
                            }), HTTP_400_BAD_REQUEST
                
                # Check for duplicate email if updating email
                if field == 'email' and data[field] != customer.email:
                    if Customer.query.filter_by(email=data[field]).first():
                        return jsonify({
                            'error': 'Email already registered',
                            'field': 'email',
                            'code': 'email_exists'
                        }), HTTP_400_BAD_REQUEST
                
                # Update the field
                setattr(customer, field, data[field])
                updated_fields.append(field)
        
        if not updated_fields:
            return jsonify({
                'error': 'No valid fields provided for update',
                'code': 'no_valid_fields'
            }), HTTP_400_BAD_REQUEST
        
        db.session.commit()
        
        return jsonify({
            'message': f'Customer {customer.name} has been updated successfully',
            'data': {
                'id': customer.id,
                'name': customer.name,
                'email': customer.email,
                'updated_fields': updated_fields
            }
        }), HTTP_200_OK
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'error': 'Failed to update customer due to a server error',
            'details': str(e)
        }), HTTP_500_INTERNAL_SERVER_ERROR

# Delete customer - admin or superadmin only
@customer_bp.route('/<int:customer_id>', methods=['DELETE'])
@jwt_required()
def delete_customer(customer_id):
    if not is_admin_or_superadmin():
        return jsonify({
            'error': 'Admin or superadmin access required',
            'code': 'insufficient_privileges'
        }), HTTP_401_UNAUTHORIZED
    
    try:
        customer = Customer.query.get(customer_id)
        if not customer:
            return jsonify({
                'error': 'Customer not found',
                'code': 'customer_not_found'
            }), HTTP_404_NOT_FOUND
        
        customer_name = customer.name
        
        db.session.delete(customer)
        db.session.commit()
        
        return jsonify({
            'message': f'Customer {customer_name} has been permanently deleted',
            'data': {
                'deleted_customer_id': customer_id,
                'deleted_customer_name': customer_name
            }
        }), HTTP_200_OK
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'error': 'Failed to delete customer due to a server error',
            'details': str(e)
        }), HTTP_500_INTERNAL_SERVER_ERROR

# Search customers - admin or superadmin only
@customer_bp.route('/search', methods=['GET'])
@jwt_required()
def search_customers():
    if not is_admin_or_superadmin():
        return jsonify({
            'error': 'Admin or superadmin access required',
            'code': 'insufficient_privileges'
        }), HTTP_401_UNAUTHORIZED
    
    query = request.args.get('q', '')
    if not query:
        return jsonify({
            'error': 'Search query is required',
            'code': 'missing_query'
        }), HTTP_400_BAD_REQUEST
    
    try:
        customers = Customer.query.filter(
            db.or_(
                Customer.name.contains(query),
                Customer.email.contains(query),
                Customer.phone.contains(query)
            )
        ).all()
        
        customers_data = []
        for customer in customers:
            customers_data.append({
                'id': customer.id,
                'name': customer.name,
                'email': customer.email,
                'phone': customer.phone,
                'is_active': customer.is_active,
                'created_at': customer.created_at.isoformat()
            })
        
        return jsonify({
            'message': f'Found {len(customers_data)} customers matching "{query}"',
            'data': {
                'customers': customers_data,
                'count': len(customers_data),
                'query': query
            }
        }), HTTP_200_OK
    except Exception as e:
        return jsonify({
            'error': 'Search failed due to a server error',
            'details': str(e)
        }), HTTP_500_INTERNAL_SERVER_ERROR

# Request password reset - public endpoint
@customer_bp.route('/password-reset-request', methods=['POST'])
def request_password_reset():
    data = request.get_json()
    if not data or 'email' not in data:
        return jsonify({
            'error': 'Email is required',
            'code': 'missing_email'
        }), HTTP_400_BAD_REQUEST
    
    try:
        customer = Customer.query.filter_by(email=data['email']).first()
        
        # Even if no customer is found, return a success message for security
        if not customer:
            return jsonify({
                'message': 'If this email exists, password reset instructions have been sent'
            }), HTTP_200_OK
        
        reset_token = str(uuid.uuid4())
        
        customer.password_reset_token = reset_token
        customer.password_reset_expiry = datetime.utcnow() + timedelta(hours=1)
        
        db.session.commit()
        
        reset_link = f"http://localhost:3000/reset-password?token={reset_token}&email={customer.email}"
        
        msg = Message(
            subject="Password Reset Request",
            recipients=[customer.email],
            html=f"""
            <p>Hello {customer.name},</p>
            <p>We received a request to reset your password. Click the link below to reset it:</p>
            <p><a href="{reset_link}">Reset Password</a></p>
            <p>This link will expire in 1 hour.</p>
            <p>If you didn't request this, please ignore this email.</p>
            <p>Best regards,<br>Fruit Design Team</p>
            """
        )
        
        mail.send(msg)
        
        return jsonify({
            'message': 'Password reset instructions have been sent to your email',
            'data': {
                'password_reset_expiry': customer.password_reset_expiry.isoformat()
            }
        }), HTTP_200_OK
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'error': 'Failed to process password reset request',
            'details': str(e)
        }), HTTP_500_INTERNAL_SERVER_ERROR

# Reset password with token - public endpoint
@customer_bp.route('/password-reset', methods=['POST'])
def reset_password():
    data = request.get_json()
    required_fields = ['email', 'reset_token', 'new_password']
    
    if not data or not all(field in data for field in required_fields):
        return jsonify({
            'error': 'Email, reset token, and new password are required',
            'code': 'missing_fields'
        }), HTTP_400_BAD_REQUEST
    
    try:
        customer = Customer.query.filter_by(email=data['email']).first()
        
        if not customer:
            return jsonify({
                'error': 'Invalid email or reset token',
                'code': 'invalid_credentials'
            }), HTTP_400_BAD_REQUEST
        
        if customer.password_reset_token != data['reset_token']:
            return jsonify({
                'error': 'Invalid reset token',
                'code': 'invalid_token'
            }), HTTP_400_BAD_REQUEST
        
        if customer.password_reset_expiry < datetime.utcnow():
            return jsonify({
                'error': 'Reset token has expired',
                'code': 'token_expired'
            }), HTTP_400_BAD_REQUEST
        
        hashed_password = generate_password_hash(data['new_password'])
        customer.password = hashed_password
        
        customer.password_reset_token = None
        customer.password_reset_expiry = None
        
        db.session.commit()
        
        return jsonify({
            'message': 'Password has been reset successfully'
        }), HTTP_200_OK
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'error': 'Failed to reset password due to a server error',
            'details': str(e)
        }), HTTP_500_INTERNAL_SERVER_ERROR

# Verify email address - public endpoint
@customer_bp.route('/verify-email', methods=['POST'])
def verify_email():
    data = request.get_json()
    if not data or 'email' not in data or 'verification_token' not in data:
        return jsonify({
            'error': 'Email and verification token are required',
            'code': 'missing_fields'
        }), HTTP_400_BAD_REQUEST
    
    try:
        customer = Customer.query.filter_by(email=data['email']).first()
        
        if not customer:
            return jsonify({
                'error': 'Invalid email or verification token',
                'code': 'invalid_credentials'
            }), HTTP_400_BAD_REQUEST
        
        customer.email_verified = True
        
        db.session.commit()
        
        return jsonify({
            'message': 'Email has been verified successfully'
        }), HTTP_200_OK
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'error': 'Failed to verify email due to a server error',
            'details': str(e)
        }), HTTP_500_INTERNAL_SERVER_ERROR

# Get customer profile - requires authentication
@customer_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_customer_profile():
    if not is_customer():
        return jsonify({'error': 'Customer access required'}), HTTP_401_UNAUTHORIZED
    
    customer_id = get_current_customer_id()
    if not customer_id:
        return jsonify({'error': 'Invalid token format'}), HTTP_401_UNAUTHORIZED
    
    try:
        customer = Customer.query.get(customer_id)
        if not customer:
            return jsonify({'error': 'Customer not found'}), HTTP_404_NOT_FOUND
        
        return jsonify({
            'id': customer.id,
            'name': customer.name,
            'email': customer.email,
            'phone': customer.phone,
            'address': customer.address,
            'date_of_birth': customer.date_of_birth,
            'profile_picture': customer.profile_picture,
            'email_verified': customer.email_verified,
            'is_active': customer.is_active,
            'last_login': customer.last_login.isoformat() if customer.last_login else None,
            'created_at': customer.created_at.isoformat(),
            'updated_at': customer.updated_at.isoformat()
        }), HTTP_200_OK
    except Exception as e:
        return jsonify({
            'error': 'Failed to retrieve customer profile',
            'details': str(e)
        }), HTTP_500_INTERNAL_SERVER_ERROR

# Update customer profile - requires authentication
@customer_bp.route('/profile', methods=['PUT', 'PATCH'])
@jwt_required()
def update_customer_profile():
    if not is_customer():
        return jsonify({'error': 'Customer access required'}), HTTP_401_UNAUTHORIZED
    
    customer_id = get_current_customer_id()
    if not customer_id:
        return jsonify({'error': 'Invalid token format'}), HTTP_401_UNAUTHORIZED
    
    try:
        customer = Customer.query.get(customer_id)
        if not customer:
            return jsonify({'error': 'Customer not found'}), HTTP_404_NOT_FOUND
        
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), HTTP_400_BAD_REQUEST
        
        # Fields allowed to update (excluding email for security)
        updatable_fields = ['name', 'phone', 'address', 'date_of_birth', 'profile_picture']
        updated_fields = []
        
        # Process each field
        for field in updatable_fields:
            if field in data:
                setattr(customer, field, data[field])
                updated_fields.append(field)
        
        if not updated_fields:
            return jsonify({'error': 'No valid fields provided for update'}), HTTP_400_BAD_REQUEST
        
        db.session.commit()
        
        return jsonify({
            'message': 'Customer profile updated successfully',
            'data': {
                'updated_fields': updated_fields
            }
        }), HTTP_200_OK
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'error': 'Failed to update customer profile due to a server error',
            'details': str(e)
        }), HTTP_500_INTERNAL_SERVER_ERROR