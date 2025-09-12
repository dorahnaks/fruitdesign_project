from flask import Blueprint, request, jsonify, current_app, send_from_directory
from app.models.product import Product
from app.models.content import BestSeller
from app.extensions import db
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.status_codes import (
    HTTP_200_OK, HTTP_201_CREATED, HTTP_400_BAD_REQUEST,
    HTTP_404_NOT_FOUND, HTTP_401_UNAUTHORIZED, HTTP_500_INTERNAL_SERVER_ERROR
)
import os
from werkzeug.utils import secure_filename

product_bp = Blueprint('product', __name__, url_prefix='/api/v1/products')

def get_upload_folder():
    """
    Get the upload folder path from app config or calculate it.
    """
    if 'UPLOAD_FOLDER' in current_app.config:
        return current_app.config['UPLOAD_FOLDER']
    
    # Fallback: Calculate the path relative to the app root
    app_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    return os.path.join(app_root, 'static', 'uploads', 'product_images')

def handle_file_upload(file):
    """
    Helper function to handle file upload and return the image URL.
    """
    if not file:
        return None
    
    filename = secure_filename(file.filename)
    upload_folder = get_upload_folder()
    
    # Create directory if it doesn't exist
    os.makedirs(upload_folder, exist_ok=True)
    file_path = os.path.join(upload_folder, filename)
    
    try:
        file.save(file_path)
        # Return a complete URL including the domain
        return f"{request.host_url}static/uploads/product_images/{filename}"
    except Exception as e:
        current_app.logger.error(f"Error saving file: {e}")
        return None

def is_admin():
    """
    Check if the current user has admin privileges.
    """
    identity = get_jwt_identity()
    
    # Handle dictionary format
    if isinstance(identity, dict):
        role = identity.get('role')
        return role in ['admin', 'super_admin']
    
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
            return role in ['admin', 'super_admin']
        except json.JSONDecodeError:
            return False
    
    return False

@product_bp.route('/public', methods=['GET', 'OPTIONS'])
def get_public_products():
    """
    Get all active products for public viewing without authentication.
    """
    if request.method == 'OPTIONS':
        return '', 200
        
    try:
        products = Product.query.filter_by(is_active=True).all()
        return jsonify({
            'products': [product.to_dict() for product in products],
            'count': len(products)
        }), HTTP_200_OK
    except Exception as e:
        current_app.logger.error(f"Error retrieving products: {str(e)}")
        return jsonify({'error': 'Failed to retrieve products'}), HTTP_500_INTERNAL_SERVER_ERROR

@product_bp.route('', methods=['GET', 'OPTIONS'])
@jwt_required()
def get_all_products():
    """
    Get all products without pagination.
    """
    if request.method == 'OPTIONS':
        return '', 200
        
    try:
        products = Product.query.all()
        return jsonify({
            'products': [product.to_dict() for product in products],
            'count': len(products)
        }), HTTP_200_OK
    except Exception as e:
        current_app.logger.error(f"Error retrieving products: {str(e)}")
        return jsonify({'error': 'Failed to retrieve products'}), HTTP_500_INTERNAL_SERVER_ERROR

@product_bp.route('/<int:product_id>', methods=['GET', 'OPTIONS'])
def get_product(product_id):
    """
    Get a single product by ID.
    """
    if request.method == 'OPTIONS':
        return '', 200
        
    try:
        product = Product.query.get(product_id)
        
        if not product:
            return jsonify({'error': 'Product not found'}), HTTP_404_NOT_FOUND
        
        return jsonify({
            'product': product.to_dict()
        }), HTTP_200_OK
    except Exception as e:
        current_app.logger.error(f"Error retrieving product: {str(e)}")
        return jsonify({'error': 'Failed to retrieve product'}), HTTP_500_INTERNAL_SERVER_ERROR

@product_bp.route('', methods=['POST', 'OPTIONS'])
@jwt_required()
def create_product():
    """
    Create a new product.
    """
    if request.method == 'OPTIONS':
        return '', 200
        
    if not is_admin():
        return jsonify({'error': 'Admin access required'}), HTTP_401_UNAUTHORIZED
    
    if not request.content_type or not request.content_type.startswith('multipart/form-data'):
        return jsonify({'error': 'Content-Type must be multipart/form-data'}), HTTP_400_BAD_REQUEST
    
    if 'name' not in request.form or 'price' not in request.form or 'category' not in request.form:
        return jsonify({'error': 'name, price, and category are required'}), HTTP_400_BAD_REQUEST
    
    try:
        # Extract form data
        name = request.form['name']
        description = request.form.get('description')
        price = float(request.form['price'])
        category = request.form['category']
        stock_quantity = int(request.form.get('stock_quantity', 0))
        is_active = request.form.get('is_active', 'True').lower() in ['true', '1', 'yes', 'on']
        is_featured = request.form.get('is_featured', 'False').lower() in ['true', '1', 'yes', 'on']
        
        # Validate data
        if not name or not name.strip():
            return jsonify({'error': 'Product name is required'}), HTTP_400_BAD_REQUEST
        
        if price <= 0:
            return jsonify({'error': 'Price must be greater than 0'}), HTTP_400_BAD_REQUEST
        
        if stock_quantity < 0:
            return jsonify({'error': 'Stock quantity cannot be negative'}), HTTP_400_BAD_REQUEST
        
        # Handle file upload
        file = request.files.get('image')
        image_url = handle_file_upload(file)
        
        # Create new Product object
        new_product = Product(
            name=name,
            description=description,
            price=price,
            category=category,
            stock_quantity=stock_quantity,
            image_url=image_url,
            is_active=is_active,
            is_featured=is_featured
        )
        
        db.session.add(new_product)
        db.session.commit()
        
        # If marked as best seller, create BestSeller entry
        if is_featured:
            # Get the highest display order
            max_order = db.session.query(db.func.max(BestSeller.display_order)).scalar() or 0
            best_seller = BestSeller(
                product_id=new_product.id,
                display_order=max_order + 1
            )
            db.session.add(best_seller)
            db.session.commit()
        
        return jsonify({
            'message': 'Product added successfully',
            'product': new_product.to_dict()
        }), HTTP_201_CREATED
    except ValueError as e:
        db.session.rollback()
        return jsonify({'error': f'Invalid data: {str(e)}'}), HTTP_400_BAD_REQUEST
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Product creation error: {str(e)}")
        return jsonify({'error': 'Failed to add product'}), HTTP_500_INTERNAL_SERVER_ERROR

@product_bp.route('/<int:product_id>', methods=['PUT', 'OPTIONS'])
@jwt_required()
def update_product(product_id):
    """
    Update a product.
    """
    if request.method == 'OPTIONS':
        return '', 200
        
    if not is_admin():
        return jsonify({'error': 'Admin access required'}), HTTP_401_UNAUTHORIZED
    
    try:
        product = Product.query.get(product_id)
        
        if not product:
            return jsonify({'error': 'Product not found'}), HTTP_404_NOT_FOUND
        
        # Check if request is JSON or form-data
        if request.is_json:
            data = request.get_json()
            name = data.get('name', product.name)
            description = data.get('description', product.description)
            price = data.get('price', product.price)
            category = data.get('category', product.category)
            stock_quantity = data.get('stock_quantity', product.stock_quantity)
            image_url = data.get('image_url', product.image_url)
            is_active = data.get('is_active', product.is_active)
            is_featured = data.get('is_featured', product.is_featured)
        else:
            name = request.form.get('name', product.name)
            description = request.form.get('description', product.description)
            price = request.form.get('price', product.price)
            category = request.form.get('category', product.category)
            stock_quantity = request.form.get('stock_quantity', product.stock_quantity)
            image_url = request.form.get('image_url', product.image_url)
            is_active = request.form.get('is_active', product.is_active)
            is_featured = request.form.get('is_featured', product.is_featured)
            
            # Handle file upload if present
            file = request.files.get('image')
            if file:
                image_url = handle_file_upload(file)
        
        # Update product attributes
        product.name = name
        product.description = description
        product.price = price
        product.category = category
        product.stock_quantity = stock_quantity
        product.image_url = image_url
        product.is_active = is_active
        product.is_featured = is_featured
        
        db.session.commit()
        
        # Update BestSeller entry if needed
        if is_featured != product.is_best_seller:
            if is_featured:
                # Add to best sellers
                max_order = db.session.query(db.func.max(BestSeller.display_order)).scalar() or 0
                best_seller = BestSeller(
                    product_id=product.id,
                    display_order=max_order + 1
                )
                db.session.add(best_seller)
            else:
                # Remove from best sellers
                best_seller = BestSeller.query.filter_by(product_id=product.id).first()
                if best_seller:
                    db.session.delete(best_seller)
            
            db.session.commit()
        
        return jsonify({
            'message': 'Product updated successfully',
            'product': product.to_dict()
        }), HTTP_200_OK
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error updating product: {str(e)}")
        return jsonify({'error': 'Failed to update product'}), HTTP_500_INTERNAL_SERVER_ERROR

@product_bp.route('/<int:product_id>', methods=['DELETE', 'OPTIONS'])
@jwt_required()
def delete_product(product_id):
    """
    Delete a product.
    """
    if request.method == 'OPTIONS':
        return '', 200
        
    if not is_admin():
        return jsonify({'error': 'Admin access required'}), HTTP_401_UNAUTHORIZED
    
    try:
        product = Product.query.get(product_id)
        
        if not product:
            return jsonify({'error': 'Product not found'}), HTTP_404_NOT_FOUND
        
        # Delete the product image file if it exists
        if product.image_url and product.image_url.startswith("/static/uploads/product_images/"):
            filename = os.path.basename(product.image_url)
            file_path = os.path.join(get_upload_folder(), filename)
            if os.path.exists(file_path):
                os.remove(file_path)
        
        # Delete associated BestSeller entry if it exists
        best_seller = BestSeller.query.filter_by(product_id=product_id).first()
        if best_seller:
            db.session.delete(best_seller)
        
        db.session.delete(product)
        db.session.commit()
        
        return jsonify({
            'message': 'Product deleted successfully',
            'product_id': product_id
        }), HTTP_200_OK
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error deleting product: {str(e)}")
        return jsonify({'error': 'Failed to delete product'}), HTTP_500_INTERNAL_SERVER_ERROR

# Additional business-specific endpoints
@product_bp.route('/search', methods=['GET', 'OPTIONS'])
def search_products():
    """
    Search products by name or category.
    """
    if request.method == 'OPTIONS':
        return '', 200
        
    try:
        query = request.args.get('q')
        if not query:
            return jsonify({'error': 'Search query is required'}), HTTP_400_BAD_REQUEST
        
        # Search in name and category (case-insensitive)
        products = Product.query.filter(
            db.or_(
                Product.name.ilike(f'%{query}%'),
                Product.category.ilike(f'%{query}%')
            )
        ).all()
        
        return jsonify({
            'products': [product.to_dict() for product in products],
            'count': len(products),
            'query': query
        }), HTTP_200_OK
    except Exception as e:
        current_app.logger.error(f"Error searching products: {str(e)}")
        return jsonify({'error': 'Failed to search products'}), HTTP_500_INTERNAL_SERVER_ERROR

@product_bp.route('/category/<category_name>', methods=['GET', 'OPTIONS'])
def get_products_by_category(category_name):
    """
    Get all products in a specific category.
    """
    if request.method == 'OPTIONS':
        return '', 200
        
    try:
        # Get products by category (case-insensitive)
        products = Product.query.filter(
            Product.category.ilike(category_name)
        ).all()
        
        return jsonify({
            'products': [product.to_dict() for product in products],
            'category': category_name,
            'count': len(products)
        }), HTTP_200_OK
    except Exception as e:
        current_app.logger.error(f"Error retrieving products by category: {str(e)}")
        return jsonify({'error': 'Failed to retrieve products by category'}), HTTP_500_INTERNAL_SERVER_ERROR

@product_bp.route('/<int:product_id>/stock', methods=['PUT', 'OPTIONS'])
@jwt_required()
def update_product_stock(product_id):
    """
    Update the stock quantity of a product.
    """
    if request.method == 'OPTIONS':
        return '', 200
        
    if not is_admin():
        return jsonify({'error': 'Admin access required'}), HTTP_401_UNAUTHORIZED
    
    try:
        product = Product.query.get(product_id)
        
        if not product:
            return jsonify({'error': 'Product not found'}), HTTP_404_NOT_FOUND
        
        if not request.is_json:
            return jsonify({'error': 'Request must be JSON'}), HTTP_400_BAD_REQUEST
        
        data = request.get_json()
        stock_quantity = data.get('stock_quantity')
        
        if stock_quantity is None:
            return jsonify({'error': 'stock_quantity is required'}), HTTP_400_BAD_REQUEST
        
        # Ensure stock_quantity is a non-negative integer
        try:
            stock_quantity = int(stock_quantity)
            if stock_quantity < 0:
                return jsonify({'error': 'stock_quantity must be non-negative'}), HTTP_400_BAD_REQUEST
        except (ValueError, TypeError):
            return jsonify({'error': 'stock_quantity must be a valid integer'}), HTTP_400_BAD_REQUEST
        
        old_quantity = product.stock_quantity
        product.stock_quantity = stock_quantity
        db.session.commit()
        
        return jsonify({
            'message': 'Stock updated successfully',
            'product_id': product_id,
            'old_quantity': old_quantity,
            'new_quantity': stock_quantity
        }), HTTP_200_OK
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error updating product stock: {str(e)}")
        return jsonify({'error': 'Failed to update product stock'}), HTTP_500_INTERNAL_SERVER_ERROR

@product_bp.route('/low-stock', methods=['GET', 'OPTIONS'])
@jwt_required()
def get_low_stock_products():
    """
    Get products with low stock (below threshold).
    """
    if request.method == 'OPTIONS':
        return '', 200
        
    if not is_admin():
        return jsonify({'error': 'Admin access required'}), HTTP_401_UNAUTHORIZED
    
    try:
        # Get threshold from query parameter (default: 10)
        threshold = request.args.get('threshold', 10, type=int)
        
        # Get products with stock below threshold
        products = Product.query.filter(
            Product.stock_quantity < threshold
        ).order_by(Product.stock_quantity).all()
        
        return jsonify({
            'products': [product.to_dict() for product in products],
            'count': len(products),
            'threshold': threshold
        }), HTTP_200_OK
    except Exception as e:
        current_app.logger.error(f"Error retrieving low stock products: {str(e)}")
        return jsonify({'error': 'Failed to retrieve low stock products'}), HTTP_500_INTERNAL_SERVER_ERROR

@product_bp.route('/featured', methods=['GET', 'OPTIONS'])
def get_featured_products():
    """
    Get all featured products.
    """
    if request.method == 'OPTIONS':
        return '', 200
        
    try:
        products = Product.query.filter_by(is_featured=True).all()
        
        return jsonify({
            'products': [product.to_dict() for product in products],
            'count': len(products)
        }), HTTP_200_OK
    except Exception as e:
        current_app.logger.error(f"Error retrieving featured products: {str(e)}")
        return jsonify({'error': 'Failed to retrieve featured products'}), HTTP_500_INTERNAL_SERVER_ERROR

@product_bp.route('/<int:product_id>/toggle-featured', methods=['PUT', 'OPTIONS'])
@jwt_required()
def toggle_featured(product_id):
    """
    Toggle the featured status of a product.
    """
    if request.method == 'OPTIONS':
        return '', 200
        
    if not is_admin():
        return jsonify({'error': 'Admin access required'}), HTTP_401_UNAUTHORIZED
    
    try:
        product = Product.query.get(product_id)
        
        if not product:
            return jsonify({'error': 'Product not found'}), HTTP_404_NOT_FOUND
        
        # Toggle featured status
        product.is_featured = not product.is_featured
        db.session.commit()
        
        return jsonify({
            'message': f'Product featured status updated to {product.is_featured}',
            'product_id': product_id,
            'is_featured': product.is_featured
        }), HTTP_200_OK
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error toggling featured status: {str(e)}")
        return jsonify({'error': 'Failed to update product featured status'}), HTTP_500_INTERNAL_SERVER_ERROR

@product_bp.route('/<int:product_id>/toggle-best-seller', methods=['PUT', 'OPTIONS'])
@jwt_required()
def toggle_best_seller(product_id):
    """
    Toggle the best seller status of a product.
    """
    if request.method == 'OPTIONS':
        return '', 200
        
    if not is_admin():
        return jsonify({'error': 'Admin access required'}), HTTP_401_UNAUTHORIZED
    
    try:
        product = Product.query.get(product_id)
        
        if not product:
            return jsonify({'error': 'Product not found'}), HTTP_404_NOT_FOUND
        
        # Toggle best seller status
        old_status = product.is_best_seller
        product.is_best_seller = not product.is_best_seller
        
        # Update BestSeller entry
        if product.is_best_seller and not old_status:
            # Add to best sellers
            max_order = db.session.query(db.func.max(BestSeller.display_order)).scalar() or 0
            best_seller = BestSeller(
                product_id=product.id,
                display_order=max_order + 1
            )
            db.session.add(best_seller)
        elif not product.is_best_seller and old_status:
            # Remove from best sellers
            best_seller = BestSeller.query.filter_by(product_id=product.id).first()
            if best_seller:
                db.session.delete(best_seller)
        
        db.session.commit()
        
        return jsonify({
            'message': f'Product best seller status updated to {product.is_best_seller}',
            'product_id': product_id,
            'is_best_seller': product.is_best_seller
        }), HTTP_200_OK
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error toggling best seller status: {str(e)}")
        return jsonify({'error': 'Failed to update product best seller status'}), HTTP_500_INTERNAL_SERVER_ERROR

@product_bp.route('/<int:product_id>/toggle-active', methods=['PUT', 'OPTIONS'])
@jwt_required()
def toggle_active(product_id):
    """
    Toggle the active status of a product.
    """
    if request.method == 'OPTIONS':
        return '', 200
        
    if not is_admin():
        return jsonify({'error': 'Admin access required'}), HTTP_401_UNAUTHORIZED
    
    try:
        product = Product.query.get(product_id)
        
        if not product:
            return jsonify({'error': 'Product not found'}), HTTP_404_NOT_FOUND
        
        # Toggle active status
        product.is_active = not product.is_active
        db.session.commit()
        
        return jsonify({
            'message': f'Product active status updated to {product.is_active}',
            'product_id': product_id,
            'is_active': product.is_active
        }), HTTP_200_OK
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error toggling active status: {str(e)}")
        return jsonify({'error': 'Failed to update product active status'}), HTTP_500_INTERNAL_SERVER_ERROR