from flask import Blueprint, request, jsonify, current_app
from flask_cors import cross_origin
from app.models import ContactInfo
from app.extensions import db
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt, decode_token
from app.status_codes import (
    HTTP_200_OK, HTTP_201_CREATED, HTTP_400_BAD_REQUEST, HTTP_401_UNAUTHORIZED,
    HTTP_404_NOT_FOUND, HTTP_500_INTERNAL_SERVER_ERROR
)
import json

contact_bp = Blueprint('contact', __name__, url_prefix='/api/v1/contact')

# Helper function to check admin access
def is_admin():
    try:
        # Get JWT claims instead of identity
        claims = get_jwt()
        role = claims.get('role')
        return role in ['admin', 'super_admin']  # Note: using super_admin to match auth controller
    except Exception as e:
        current_app.logger.error(f"Admin check error: {str(e)}")
        return False

# GET: Public endpoint to view contact info
@contact_bp.route('/', methods=['GET'])
@cross_origin(origin='http://localhost:3000', headers=['Content-Type', 'Authorization'])
def get_contact():
    try:
        contact = ContactInfo.query.first()
        if not contact:
            return jsonify({'error': 'Contact info not found'}), HTTP_404_NOT_FOUND
        
        return jsonify({
            'phone': contact.phone,
            'email': contact.email,
            'location': contact.location,
            'map_link': contact.map_link,
            'social_media_links': contact.get_social_links()
        }), HTTP_200_OK
    except Exception as e:
        current_app.logger.error(f"Error retrieving contact info: {str(e)}")
        return jsonify({'error': 'Failed to retrieve contact info'}), HTTP_500_INTERNAL_SERVER_ERROR

# PUT: Admin-only endpoint to update or create contact info
@contact_bp.route('/', methods=['PUT'])
@jwt_required()
@cross_origin(origin='http://localhost:3000', headers=['Content-Type', 'Authorization'])
def update_contact():
    try:
        if not is_admin():
            return jsonify({'error': 'Admin access only'}), HTTP_401_UNAUTHORIZED
    except Exception as e:
        current_app.logger.error(f"Authorization error: {str(e)}")
        return jsonify({'error': 'Invalid token'}), HTTP_401_UNAUTHORIZED
        
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No input data provided'}), HTTP_400_BAD_REQUEST
        
    try:
        contact = ContactInfo.query.first()
        if not contact:
            contact = ContactInfo()
            
        # Validate required fields
        required_fields = ['phone', 'email', 'location']
        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({'error': f'Missing required field: {field}'}), HTTP_400_BAD_REQUEST
        
        # Update fields with validation
        contact.phone = data['phone']
        contact.email = data['email']
        contact.location = data['location']
        contact.map_link = data.get('map_link', contact.map_link)
        
        # Handle social media links
        social_links = data.get('social_media_links')
        if social_links:
            if not isinstance(social_links, dict):
                return jsonify({'error': 'social_media_links must be a dictionary'}), HTTP_400_BAD_REQUEST
            contact.set_social_links(social_links)
            
        db.session.add(contact)
        db.session.commit()
        
        return jsonify({
            'message': 'Contact info updated successfully',
            'contact': {
                'phone': contact.phone,
                'email': contact.email,
                'location': contact.location,
                'map_link': contact.map_link,
                'social_media_links': contact.get_social_links()
            }
        }), HTTP_200_OK
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Contact update error: {str(e)}")
        return jsonify({'error': 'Failed to update contact info'}), HTTP_500_INTERNAL_SERVER_ERROR