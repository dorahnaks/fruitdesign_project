from flask import Blueprint, jsonify, request, current_app
from app.models.content import BestSeller, HealthTip, QuickTip, CompanyInfo, TeamMember, CompanyStat
from app.models.product import Product
from app.extensions import db
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.admin_user import AdminUser
from app.status_codes import (
    HTTP_200_OK, HTTP_201_CREATED, HTTP_400_BAD_REQUEST,
    HTTP_404_NOT_FOUND, HTTP_401_UNAUTHORIZED, HTTP_500_INTERNAL_SERVER_ERROR
)

content_bp = Blueprint('content', __name__, url_prefix='/api/v1/content')

# Helper function to check admin access
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

# Home Page Content
@content_bp.route('/home/best-sellers', methods=['GET'])
def get_best_sellers():
    try:
        best_sellers = BestSeller.query.join(Product).order_by(BestSeller.display_order).all()
        return jsonify([bs.to_dict() for bs in best_sellers])
    except Exception as e:
        current_app.logger.error(f"Error fetching best sellers: {str(e)}")
        return jsonify({'error': 'Failed to fetch best sellers'}), HTTP_500_INTERNAL_SERVER_ERROR

# About Page Content
@content_bp.route('/about/company-info', methods=['GET'])
def get_company_info():
    try:
        info = CompanyInfo.query.all()
        return jsonify({item.key: item.value for item in info})
    except Exception as e:
        current_app.logger.error(f"Error fetching company info: {str(e)}")
        return jsonify({'error': 'Failed to fetch company info'}), HTTP_500_INTERNAL_SERVER_ERROR

@content_bp.route('/about/team-members', methods=['GET'])
def get_team_members():
    try:
        members = TeamMember.query.order_by(TeamMember.display_order).all()
        return jsonify([member.to_dict() for member in members])
    except Exception as e:
        current_app.logger.error(f"Error fetching team members: {str(e)}")
        return jsonify({'error': 'Failed to fetch team members'}), HTTP_500_INTERNAL_SERVER_ERROR

@content_bp.route('/about/stats', methods=['GET'])
def get_company_stats():
    try:
        stats = CompanyStat.query.order_by(CompanyStat.display_order).all()
        return jsonify([stat.to_dict() for stat in stats])
    except Exception as e:
        current_app.logger.error(f"Error fetching company stats: {str(e)}")
        return jsonify({'error': 'Failed to fetch company stats'}), HTTP_500_INTERNAL_SERVER_ERROR

# Health Tips Page Content
@content_bp.route('/health-tips', methods=['GET'])
def get_health_tips():
    try:
        category = request.args.get('category', 'all')
        search = request.args.get('search', '')
        
        query = HealthTip.query
        
        if category != 'all':
            query = query.filter(HealthTip.category == category)
        
        if search:
            term = f"%{search}%"
            query = query.filter(
                db.or_(
                    HealthTip.title.ilike(term),
                    HealthTip.description.ilike(term)
                )
            )
        
        tips = query.order_by(HealthTip.created_at.desc()).all()
        return jsonify([tip.to_dict() for tip in tips])
    except Exception as e:
        current_app.logger.error(f"Error fetching health tips: {str(e)}")
        return jsonify({'error': 'Failed to fetch health tips'}), HTTP_500_INTERNAL_SERVER_ERROR

@content_bp.route('/quick-tips', methods=['GET'])
def get_quick_tips():
    try:
        tips = QuickTip.query.order_by(QuickTip.created_at.desc()).all()
        return jsonify([tip.to_dict() for tip in tips])
    except Exception as e:
        current_app.logger.error(f"Error fetching quick tips: {str(e)}")
        return jsonify({'error': 'Failed to fetch quick tips'}), HTTP_500_INTERNAL_SERVER_ERROR

# Admin endpoints for managing content
@content_bp.route('/admin/best-sellers', methods=['POST'])
@jwt_required()
def add_best_seller():
    if not is_admin():
        return jsonify({'error': 'Unauthorized access'}), HTTP_401_UNAUTHORIZED
    
    try:
        data = request.get_json()
        product_id = data.get('product_id')
        display_order = data.get('display_order', 0)
        
        if not product_id:
            return jsonify({'error': 'Product ID is required'}), HTTP_400_BAD_REQUEST
        
        product = Product.query.get(product_id)
        if not product:
            return jsonify({'error': 'Product not found'}), HTTP_404_NOT_FOUND
        
        # Remove existing best seller for this product if it exists
        existing = BestSeller.query.filter_by(product_id=product_id).first()
        if existing:
            db.session.delete(existing)
        
        best_seller = BestSeller(product_id=product_id, display_order=display_order)
        db.session.add(best_seller)
        db.session.commit()
        
        return jsonify(best_seller.to_dict()), HTTP_201_CREATED
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error adding best seller: {str(e)}")
        return jsonify({'error': 'Failed to add best seller'}), HTTP_500_INTERNAL_SERVER_ERROR

@content_bp.route('/admin/health-tips', methods=['POST'])
@jwt_required()
def add_health_tip():
    if not is_admin():
        return jsonify({'error': 'Unauthorized access'}), HTTP_401_UNAUTHORIZED
    
    try:
        data = request.get_json()
        
        required_fields = ['title', 'description', 'icon', 'color', 'category']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'{field} is required'}), HTTP_400_BAD_REQUEST
        
        tip = HealthTip(
            title=data['title'],
            description=data['description'],
            icon=data['icon'],
            color=data['color'],
            category=data['category']
        )
        
        db.session.add(tip)
        db.session.commit()
        
        return jsonify(tip.to_dict()), HTTP_201_CREATED
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error adding health tip: {str(e)}")
        return jsonify({'error': 'Failed to add health tip'}), HTTP_500_INTERNAL_SERVER_ERROR

@content_bp.route('/admin/health-tips/<int:tip_id>', methods=['PUT'])
@jwt_required()
def update_health_tip(tip_id):
    if not is_admin():
        return jsonify({'error': 'Unauthorized access'}), HTTP_401_UNAUTHORIZED
    
    try:
        tip = HealthTip.query.get(tip_id)
        if not tip:
            return jsonify({'error': 'Health tip not found'}), HTTP_404_NOT_FOUND
        
        data = request.get_json()
        
        if 'title' in data:
            tip.title = data['title']
        if 'description' in data:
            tip.description = data['description']
        if 'icon' in data:
            tip.icon = data['icon']
        if 'color' in data:
            tip.color = data['color']
        if 'category' in data:
            tip.category = data['category']
        
        db.session.commit()
        return jsonify(tip.to_dict())
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error updating health tip: {str(e)}")
        return jsonify({'error': 'Failed to update health tip'}), HTTP_500_INTERNAL_SERVER_ERROR

@content_bp.route('/admin/health-tips/<int:tip_id>', methods=['DELETE'])
@jwt_required()
def delete_health_tip(tip_id):
    if not is_admin():
        return jsonify({'error': 'Unauthorized access'}), HTTP_401_UNAUTHORIZED
    
    try:
        tip = HealthTip.query.get(tip_id)
        if not tip:
            return jsonify({'error': 'Health tip not found'}), HTTP_404_NOT_FOUND
        
        db.session.delete(tip)
        db.session.commit()
        
        return jsonify({'message': 'Health tip deleted successfully'})
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error deleting health tip: {str(e)}")
        return jsonify({'error': 'Failed to delete health tip'}), HTTP_500_INTERNAL_SERVER_ERROR

@content_bp.route('/admin/company-info', methods=['POST'])
@jwt_required()
def add_company_info():
    if not is_admin():
        return jsonify({'error': 'Unauthorized access'}), HTTP_401_UNAUTHORIZED
    
    try:
        data = request.get_json()
        
        if 'key' not in data or 'value' not in data:
            return jsonify({'error': 'Key and value are required'}), HTTP_400_BAD_REQUEST
        
        # Check if key already exists
        existing = CompanyInfo.query.filter_by(key=data['key']).first()
        if existing:
            existing.value = data['value']
            db.session.commit()
            return jsonify(existing.to_dict())
        
        info = CompanyInfo(key=data['key'], value=data['value'])
        db.session.add(info)
        db.session.commit()
        
        return jsonify(info.to_dict()), HTTP_201_CREATED
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error adding company info: {str(e)}")
        return jsonify({'error': 'Failed to add company info'}), HTTP_500_INTERNAL_SERVER_ERROR

@content_bp.route('/admin/team-members', methods=['POST'])
@jwt_required()
def add_team_member():
    if not is_admin():
        return jsonify({'error': 'Unauthorized access'}), HTTP_401_UNAUTHORIZED
    
    try:
        data = request.get_json()
        
        required_fields = ['name', 'role', 'bio']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'{field} is required'}), HTTP_400_BAD_REQUEST
        
        member = TeamMember(
            name=data['name'],
            role=data['role'],
            bio=data['bio'],
            image_url=data.get('image_url'),
            linkedin_url=data.get('linkedin_url'),
            twitter_url=data.get('twitter_url'),
            display_order=data.get('display_order', 0)
        )
        
        db.session.add(member)
        db.session.commit()
        
        return jsonify(member.to_dict()), HTTP_201_CREATED
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error adding team member: {str(e)}")
        return jsonify({'error': 'Failed to add team member'}), HTTP_500_INTERNAL_SERVER_ERROR

@content_bp.route('/admin/team-members/<int:member_id>', methods=['PUT'])
@jwt_required()
def update_team_member(member_id):
    if not is_admin():
        return jsonify({'error': 'Unauthorized access'}), HTTP_401_UNAUTHORIZED
    
    try:
        member = TeamMember.query.get(member_id)
        if not member:
            return jsonify({'error': 'Team member not found'}), HTTP_404_NOT_FOUND
        
        data = request.get_json()
        
        if 'name' in data:
            member.name = data['name']
        if 'role' in data:
            member.role = data['role']
        if 'bio' in data:
            member.bio = data['bio']
        if 'image_url' in data:
            member.image_url = data['image_url']
        if 'linkedin_url' in data:
            member.linkedin_url = data['linkedin_url']
        if 'twitter_url' in data:
            member.twitter_url = data['twitter_url']
        if 'display_order' in data:
            member.display_order = data['display_order']
        
        db.session.commit()
        return jsonify(member.to_dict())
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error updating team member: {str(e)}")
        return jsonify({'error': 'Failed to update team member'}), HTTP_500_INTERNAL_SERVER_ERROR

@content_bp.route('/admin/team-members/<int:member_id>', methods=['DELETE'])
@jwt_required()
def delete_team_member(member_id):
    if not is_admin():
        return jsonify({'error': 'Unauthorized access'}), HTTP_401_UNAUTHORIZED
    
    try:
        member = TeamMember.query.get(member_id)
        if not member:
            return jsonify({'error': 'Team member not found'}), HTTP_404_NOT_FOUND
        
        db.session.delete(member)
        db.session.commit()
        
        return jsonify({'message': 'Team member deleted successfully'})
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error deleting team member: {str(e)}")
        return jsonify({'error': 'Failed to delete team member'}), HTTP_500_INTERNAL_SERVER_ERROR

@content_bp.route('/admin/company-stats', methods=['POST'])
@jwt_required()
def add_company_stat():
    if not is_admin():
        return jsonify({'error': 'Unauthorized access'}), HTTP_401_UNAUTHORIZED
    
    try:
        data = request.get_json()
        
        if 'label' not in data or 'value' not in data:
            return jsonify({'error': 'Label and value are required'}), HTTP_400_BAD_REQUEST
        
        stat = CompanyStat(
            label=data['label'],
            value=data['value'],
            display_order=data.get('display_order', 0)
        )
        
        db.session.add(stat)
        db.session.commit()
        
        return jsonify(stat.to_dict()), HTTP_201_CREATED
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error adding company stat: {str(e)}")
        return jsonify({'error': 'Failed to add company stat'}), HTTP_500_INTERNAL_SERVER_ERROR

@content_bp.route('/admin/company-stats/<int:stat_id>', methods=['PUT'])
@jwt_required()
def update_company_stat(stat_id):
    if not is_admin():
        return jsonify({'error': 'Unauthorized access'}), HTTP_401_UNAUTHORIZED
    
    try:
        stat = CompanyStat.query.get(stat_id)
        if not stat:
            return jsonify({'error': 'Company stat not found'}), HTTP_404_NOT_FOUND
        
        data = request.get_json()
        
        if 'label' in data:
            stat.label = data['label']
        if 'value' in data:
            stat.value = data['value']
        if 'display_order' in data:
            stat.display_order = data['display_order']
        
        db.session.commit()
        return jsonify(stat.to_dict())
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error updating company stat: {str(e)}")
        return jsonify({'error': 'Failed to update company stat'}), HTTP_500_INTERNAL_SERVER_ERROR

@content_bp.route('/admin/company-stats/<int:stat_id>', methods=['DELETE'])
@jwt_required()
def delete_company_stat(stat_id):
    if not is_admin():
        return jsonify({'error': 'Unauthorized access'}), HTTP_401_UNAUTHORIZED
    
    try:
        stat = CompanyStat.query.get(stat_id)
        if not stat:
            return jsonify({'error': 'Company stat not found'}), HTTP_404_NOT_FOUND
        
        db.session.delete(stat)
        db.session.commit()
        
        return jsonify({'message': 'Company stat deleted successfully'})
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error deleting company stat: {str(e)}")
        return jsonify({'error': 'Failed to delete company stat'}), HTTP_500_INTERNAL_SERVER_ERROR