from flask import Blueprint, request, jsonify
from flask_cors import cross_origin
from app.models import ContactInfo
from app.extensions import db
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.status_codes import (
    HTTP_200_OK, HTTP_201_CREATED, HTTP_400_BAD_REQUEST, HTTP_401_UNAUTHORIZED,
    HTTP_404_NOT_FOUND, HTTP_500_INTERNAL_SERVER_ERROR
)
import json

contact_bp = Blueprint('contact', __name__, url_prefix='/api/v1/contact')

# Helper function to check admin access
def is_admin():
    identity = get_jwt_identity()
    
    if isinstance(identity, dict):
        role = identity.get('role')
        return role in ['admin', 'superadmin']
    
    elif isinstance(identity, str):
        if identity.startswith('admin_') or identity.startswith('superadmin_'):
            return True
            
        try:
            identity = json.loads(identity)
            role = identity.get('role')
            return role in ['admin', 'superadmin']
        except json.JSONDecodeError:
            return False
    
    return False

# GET: Public endpoint to view contact info
@contact_bp.route('', methods=['GET'])
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
        return jsonify({'error': 'Failed to retrieve contact info'}), HTTP_500_INTERNAL_SERVER_ERROR

# PUT: Admin-only endpoint to update or create contact info
@contact_bp.route('', methods=['PUT'])
@contact_bp.route('/', methods=['PUT'])
@jwt_required()
@cross_origin(origin='http://localhost:3000', headers=['Content-Type', 'Authorization'])
def update_contact():
    if not is_admin():
        return jsonify({'error': 'Admin access only'}), HTTP_401_UNAUTHORIZED
        
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No input data provided'}), HTTP_400_BAD_REQUEST
        
    try:
        contact = ContactInfo.query.first()
        if not contact:
            contact = ContactInfo()
            
        contact.phone = data.get('phone', contact.phone)
        contact.email = data.get('email', contact.email)
        contact.location = data.get('location', contact.location)
        contact.map_link = data.get('map_link', contact.map_link)
        
        social_links = data.get('social_media_links')
        if social_links and isinstance(social_links, dict):
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
        print("Contact update error:", str(e))
        return jsonify({'error': 'Failed to update contact info'}), HTTP_500_INTERNAL_SERVER_ERROR