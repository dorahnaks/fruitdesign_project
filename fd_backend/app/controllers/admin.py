from flask import Blueprint, request, jsonify
from app.models.admin_user import AdminUser
from app.extensions import db
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
from app.status_codes import (
    HTTP_200_OK, HTTP_201_CREATED, HTTP_400_BAD_REQUEST,
    HTTP_404_NOT_FOUND, HTTP_401_UNAUTHORIZED, HTTP_500_INTERNAL_SERVER_ERROR
)
from datetime import datetime, timedelta
import uuid

admin_bp = Blueprint('admin', __name__, url_prefix='/api/v1/admins')

# Helper function to check if current user is superadmin
def is_superadmin():
    identity = get_jwt_identity()
    if isinstance(identity, dict):
        return identity.get('role') == 'superadmin'
    elif isinstance(identity, str):
        return identity.startswith('superadmin_')
    return False

# Helper function to check if current user is admin or superadmin
def is_admin_or_superadmin():
    identity = get_jwt_identity()
    if isinstance(identity, dict):
        return identity.get('role') in ['admin', 'superadmin']
    elif isinstance(identity, str):
        return identity.startswith('admin_') or identity.startswith('superadmin_')
    return False

# Get current user ID from identity
def get_current_user_id():
    identity = get_jwt_identity()
    if isinstance(identity, dict):
        return identity.get('id')
    elif isinstance(identity, str):
        parts = identity.split('_', 1)
        if len(parts) == 2:
            try:
                return int(parts[1])
            except ValueError:
                return None
    return None

# Admin logout route
@admin_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout_admin():
    user_id = get_current_user_id()
    user_role = None
    
    # Try to get admin details if it's an admin
    admin_details = None
    if user_id:
        admin = AdminUser.query.get(user_id)
        if admin:
            admin_details = {
                'id': admin.id,
                'user_name': admin.user_name,
                'email': admin.email
            }
            user_role = admin.role
    
    # Prepare response with details
    response_data = {
        'status': 'success',
        'message': 'You have been logged out successfully',
        'data': {
            'timestamp': datetime.utcnow().isoformat(),
            'user_role': user_role
        }
    }
    
    # Add admin details if available
    if admin_details:
        response_data['data']['admin'] = admin_details
    
    return jsonify(response_data), HTTP_200_OK

# Get all admins (superadmin only)
@admin_bp.route('/', methods=['GET'])
@jwt_required()
def get_all_admins():
    if not is_superadmin():
        return jsonify({
            'status': 'error',
            'message': 'Access denied. Only superadmins can view all admin accounts.',
            'code': 'insufficient_privileges'
        }), HTTP_401_UNAUTHORIZED
    
    try:
        admins = AdminUser.query.all()
        admins_data = []
        
        for admin in admins:
            admins_data.append({
                'id': admin.id,
                'user_name': admin.user_name,
                'email': admin.email,
                'phone_number': admin.phone_number,
                'full_name': admin.full_name,
                'is_active': admin.is_active,
                'last_login': admin.last_login.isoformat() if admin.last_login else None,
                'created_at': admin.created_at.isoformat() if admin.created_at else None,
                'updated_at': admin.updated_at.isoformat() if admin.updated_at else None,
            })
        
        return jsonify({
            'status': 'success',
            'message': f'Retrieved {len(admins_data)} admin accounts',
            'data': {
                'admins': admins_data,
                'count': len(admins_data)
            }
        }), HTTP_200_OK
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': 'Failed to retrieve admin accounts',
            'error': str(e)
        }), HTTP_500_INTERNAL_SERVER_ERROR

# Get specific admin (admin or superadmin only)
@admin_bp.route('/<int:admin_id>', methods=['GET'])
@jwt_required()
def get_admin(admin_id):
    if not is_admin_or_superadmin():
        return jsonify({
            'status': 'error',
            'message': 'Access denied. Only admins can view admin account details.',
            'code': 'insufficient_privileges'
        }), HTTP_401_UNAUTHORIZED
    
    try:
        admin = AdminUser.query.get(admin_id)
        
        if not admin:
            return jsonify({
                'status': 'error',
                'message': f'Admin account with ID {admin_id} not found',
                'code': 'admin_not_found'
            }), HTTP_404_NOT_FOUND
        
        # Check if admin is trying to view another admin's details (only superadmin can do that)
        current_user_id = get_current_user_id()
        is_current_user = current_user_id == admin.id
        
        if not is_current_user and not is_superadmin():
            return jsonify({
                'status': 'error',
                'message': 'Access denied. You can only view your own account details.',
                'code': 'insufficient_privileges'
            }), HTTP_401_UNAUTHORIZED
        
        return jsonify({
            'status': 'success',
            'message': 'Admin account retrieved successfully',
            'data': {
                'id': admin.id,
                'user_name': admin.user_name,
                'email': admin.email,
                'phone_number': admin.phone_number,
                'full_name': admin.full_name,
                'is_active': admin.is_active,
                'last_login': admin.last_login.isoformat() if admin.last_login else None,
                'created_at': admin.created_at.isoformat() if admin.created_at else None,
                'updated_at': admin.updated_at.isoformat() if admin.updated_at else None,
            }
        }), HTTP_200_OK
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': 'Failed to retrieve admin account',
            'error': str(e)
        }), HTTP_500_INTERNAL_SERVER_ERROR

# Update admin details (superadmin only)
@admin_bp.route('/<int:admin_id>', methods=['PUT', 'PATCH'])
@jwt_required()
def update_admin(admin_id):
    if not is_superadmin():
        return jsonify({
            'status': 'error',
            'message': 'Access denied. Only superadmins can update admin accounts.',
            'code': 'insufficient_privileges'
        }), HTTP_401_UNAUTHORIZED
    
    try:
        admin = AdminUser.query.get(admin_id)
        
        if not admin:
            return jsonify({
                'status': 'error',
                'message': f'Admin account with ID {admin_id} not found',
                'code': 'admin_not_found'
            }), HTTP_404_NOT_FOUND
        
        data = request.get_json()
        
        if not data:
            return jsonify({
                'status': 'error',
                'message': 'No data provided for update',
                'code': 'no_data'
            }), HTTP_400_BAD_REQUEST
        
        # Track which fields were updated
        updated_fields = []
        
        # Only allow updating certain fields
        for field in ['user_name', 'email', 'phone_number', 'full_name', 'is_active']:
            if field in data:
                # Check for duplicates if updating username or email
                if field == 'user_name' and data[field] != admin.user_name:
                    if AdminUser.query.filter_by(user_name=data[field]).first():
                        return jsonify({
                            'status': 'error',
                            'message': 'This username is already taken',
                            'field': 'user_name',
                            'code': 'username_exists'
                        }), HTTP_400_BAD_REQUEST
                
                if field == 'email' and data[field] != admin.email:
                    if AdminUser.query.filter_by(email=data[field]).first():
                        return jsonify({
                            'status': 'error',
                            'message': 'An admin with this email already exists',
                            'field': 'email',
                            'code': 'email_exists'
                        }), HTTP_400_BAD_REQUEST
                
                if field == 'phone_number' and data[field] != admin.phone_number:
                    if AdminUser.query.filter_by(phone_number=data[field]).first():
                        return jsonify({
                            'status': 'error',
                            'message': 'This phone number is already registered',
                            'field': 'phone_number',
                            'code': 'phone_number_exists'
                        }), HTTP_400_BAD_REQUEST
                
                # Convert boolean fields from string to actual boolean
                if field == 'is_active':
                    if isinstance(data[field], str):
                        if data[field].lower() in ['true', '1', 'yes', 'on']:
                            data[field] = True
                        elif data[field].lower() in ['false', '0', 'no', 'off']:
                            data[field] = False
                        else:
                            return jsonify({
                                'status': 'error',
                                'message': 'Invalid boolean value for is_active field',
                                'field': 'is_active',
                                'code': 'invalid_boolean'
                            }), HTTP_400_BAD_REQUEST
                
                setattr(admin, field, data[field])
                updated_fields.append(field)
        
        if not updated_fields:
            return jsonify({
                'status': 'error',
                'message': 'No valid fields provided for update',
                'code': 'no_valid_fields'
            }), HTTP_400_BAD_REQUEST
        
        db.session.commit()
        
        return jsonify({
            'status': 'success',
            'message': f'Admin account {admin.user_name} has been updated successfully',
            'data': {
                'id': admin.id,
                'user_name': admin.user_name,
                'email': admin.email,
                'phone_number': admin.phone_number,
                'full_name': admin.full_name,
                'is_active': admin.is_active,
                'updated_fields': updated_fields
            }
        }), HTTP_200_OK
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'status': 'error',
            'message': 'Failed to update admin account due to a server error',
            'error': str(e),
            'code': 'server_error'
        }), HTTP_500_INTERNAL_SERVER_ERROR

# Delete admin (superadmin only)
@admin_bp.route('/<int:admin_id>', methods=['DELETE'])
@jwt_required()
def delete_admin(admin_id):
    if not is_superadmin():
        return jsonify({
            'status': 'error',
            'message': 'Access denied. Only superadmins can delete admin accounts.',
            'code': 'insufficient_privileges'
        }), HTTP_401_UNAUTHORIZED
    
    try:
        admin = AdminUser.query.get(admin_id)
        
        if not admin:
            return jsonify({
                'status': 'error',
                'message': f'Admin account with ID {admin_id} not found',
                'code': 'admin_not_found'
            }), HTTP_404_NOT_FOUND
        
        admin_name = admin.user_name  # Save name before deletion
        
        db.session.delete(admin)
        db.session.commit()
        
        return jsonify({
            'status': 'success',
            'message': f'Admin account for {admin_name} has been permanently deleted',
            'data': {
                'deleted_admin_id': admin_id,
                'deleted_admin_name': admin_name
            }
        }), HTTP_200_OK
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'status': 'error',
            'message': 'Failed to delete admin account due to a server error',
            'error': str(e),
            'code': 'server_error'
        }), HTTP_500_INTERNAL_SERVER_ERROR