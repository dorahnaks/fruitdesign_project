from flask import Blueprint, request, jsonify
from app.models.feedback import Feedback
from app.models.customer import Customer
from app.extensions import db
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.status_codes import (
    HTTP_200_OK, HTTP_201_CREATED, HTTP_400_BAD_REQUEST, HTTP_401_UNAUTHORIZED,
    HTTP_404_NOT_FOUND, HTTP_500_INTERNAL_SERVER_ERROR
)
from datetime import datetime

feedback_bp = Blueprint('feedback', __name__, url_prefix='/api/v1/feedback')

# Helper function to check if current user is admin
def is_admin():
    identity = get_jwt_identity()
    
    # Handle dictionary format
    if isinstance(identity, dict):
        role = identity.get('role')
        return role in ['admin', 'superadmin']
    
    # Handle string format
    elif isinstance(identity, str):
        # Check for format like "admin_1" or "superadmin_1"
        if identity.startswith('admin_') or identity.startswith('superadmin_'):
            return True
            
        # Try to parse as JSON
        try:
            import json
            identity = json.loads(identity)
            role = identity.get('role')
            return role in ['admin', 'superadmin']
        except json.JSONDecodeError:
            return False
    
    return False

# Helper function to check if current user is customer
def is_customer():
    identity = get_jwt_identity()
    
    # Handle dictionary format
    if isinstance(identity, dict):
        role = identity.get('role')
        return role == 'customer'
    
    # Handle string format
    elif isinstance(identity, str):
        # Check for format like "customer_1"
        if identity.startswith('customer_'):
            return True
            
        # Try to parse as JSON
        try:
            import json
            identity = json.loads(identity)
            role = identity.get('role')
            return role == 'customer'
        except json.JSONDecodeError:
            return False
    
    return False

# Helper function to get customer ID from token
def get_customer_id():
    identity = get_jwt_identity()
    
    # Handle dictionary format
    if isinstance(identity, dict):
        role = identity.get('role')
        if role == 'customer':
            return identity.get('id')
    
    # Handle string format
    elif isinstance(identity, str):
        # Check for format like "customer_1"
        if identity.startswith('customer_'):
            try:
                # Extract ID from "customer_1"
                return int(identity.split('_')[1])
            except (IndexError, ValueError):
                pass
        
        # Try to parse as JSON
        try:
            import json
            identity = json.loads(identity)
            role = identity.get('role')
            if role == 'customer':
                return identity.get('id')
        except json.JSONDecodeError:
            pass
    
    return None

# Submit feedback (customer only)
@feedback_bp.route('/', methods=['POST'], strict_slashes=False)
def submit_feedback():
    # Check if the user is authenticated
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({'error': 'Authentication required to submit feedback'}), HTTP_401_UNAUTHORIZED
    
    if not is_customer():
        return jsonify({'error': 'Only customers can submit feedback'}), HTTP_401_UNAUTHORIZED
    
    customer_id = get_customer_id()
    if customer_id is None:
        return jsonify({'error': 'Customer ID not found in token'}), HTTP_401_UNAUTHORIZED
    
    # Verify customer exists
    try:
        customer = Customer.query.get(customer_id)
        if not customer:
            return jsonify({'error': 'Customer not found'}), HTTP_404_NOT_FOUND
    except Exception as e:
        return jsonify({'error': 'Failed to verify customer'}), HTTP_500_INTERNAL_SERVER_ERROR
    
    data = request.get_json()
    
    title = data.get('title')
    message = data.get('message')
    rating = data.get('rating')  # Optional
    
    if not message:
        return jsonify({'error': 'Feedback message is required'}), HTTP_400_BAD_REQUEST
    
    try:
        feedback = Feedback(
            customer_id=customer_id,
            title=title,
            feedback_message=message,
            rating=rating,
            status='new',
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        
        db.session.add(feedback)
        db.session.commit()
        return jsonify({'message': 'Feedback submitted successfully'}), HTTP_201_CREATED
    except Exception as e:
        db.session.rollback()
        print("❌ Feedback submission error:", str(e))
        return jsonify({'error': 'Failed to submit feedback'}), HTTP_500_INTERNAL_SERVER_ERROR

# Get own feedback (customer)
@feedback_bp.route('/mine', methods=['GET'], strict_slashes=False)
@jwt_required()
def get_my_feedback():
    if not is_customer():
        return jsonify({'error': 'Access denied'}), HTTP_401_UNAUTHORIZED
    
    customer_id = get_customer_id()
    if customer_id is None:
        return jsonify({'error': 'Customer ID not found in token'}), HTTP_401_UNAUTHORIZED
    
    try:
        feedbacks = Feedback.query.filter_by(customer_id=customer_id).all()
        
        if not feedbacks:
            return jsonify({'message': 'No feedback found'}), HTTP_404_NOT_FOUND
        
        return jsonify({'feedbacks': [
            {
                'id': fb.id,
                'title': fb.title,
                'message': fb.feedback_message,
                'rating': fb.rating,
                'response': fb.response,
                'status': fb.status,
                'submitted_at': fb.created_at.strftime('%Y-%m-%d %H:%M')
            } for fb in feedbacks
        ]}), HTTP_200_OK
    except Exception as e:
        return jsonify({'error': 'Failed to retrieve feedback'}), HTTP_500_INTERNAL_SERVER_ERROR

# Admin: View all feedback
@feedback_bp.route('/', methods=['GET'], strict_slashes=False)
@jwt_required()
def get_all_feedback():
    if not is_admin():
        return jsonify({'error': 'Admin or superadmin access only'}), HTTP_401_UNAUTHORIZED
    
    try:
        feedbacks = Feedback.query.all()
        
        if not feedbacks:
            return jsonify({'message': 'No feedback found'}), HTTP_404_NOT_FOUND
        
        return jsonify({'feedbacks': [
            {
                'id': fb.id,
                'customer_id': fb.customer_id,
                'title': fb.title,
                'message': fb.feedback_message,
                'rating': fb.rating,
                'response': fb.response,
                'status': fb.status,
                'submitted_at': fb.created_at.strftime('%Y-%m-%d %H:%M')
            } for fb in feedbacks
        ]}), HTTP_200_OK
    except Exception as e:
        return jsonify({'error': 'Failed to retrieve feedback'}), HTTP_500_INTERNAL_SERVER_ERROR

# Admin: View feedback by ID
@feedback_bp.route('/<int:id>', methods=['GET'], strict_slashes=False)
@jwt_required()
def get_feedback_by_id(id):
    if not is_admin():
        return jsonify({'error': 'Admin or superadmin access only'}), HTTP_401_UNAUTHORIZED
    
    try:
        fb = Feedback.query.get(id)
        
        if not fb:
            return jsonify({'error': 'Feedback not found'}), HTTP_404_NOT_FOUND
        
        return jsonify({
            'id': fb.id,
            'customer_id': fb.customer_id,
            'title': fb.title,
            'message': fb.feedback_message,
            'rating': fb.rating,
            'response': fb.response,
            'status': fb.status,
            'submitted_at': fb.created_at.strftime('%Y-%m-%d %H:%M')
        }), HTTP_200_OK
    except Exception as e:
        return jsonify({'error': 'Failed to retrieve feedback'}), HTTP_500_INTERNAL_SERVER_ERROR

# Admin: Respond to feedback
@feedback_bp.route('/<int:id>/respond', methods=['PUT'], strict_slashes=False)
@jwt_required()
def respond_to_feedback(id):
    if not is_admin():
        return jsonify({'error': 'Admin or superadmin access only'}), HTTP_401_UNAUTHORIZED
    
    try:
        fb = Feedback.query.get(id)
        
        if not fb:
            return jsonify({'error': 'Feedback not found'}), HTTP_404_NOT_FOUND
        
        data = request.get_json()
        response = data.get('response')
        status = data.get('status', 'reviewed')
        
        if not response:
            return jsonify({'error': 'Response is required'}), HTTP_400_BAD_REQUEST
        
        fb.response = response
        fb.status = status
        fb.updated_at = datetime.utcnow()
        db.session.commit()
        return jsonify({'message': 'Feedback response submitted successfully'}), HTTP_200_OK
    except Exception as e:
        db.session.rollback()
        print("❌ Feedback update error:", str(e))
        return jsonify({'error': 'Failed to update feedback'}), HTTP_500_INTERNAL_SERVER_ERROR