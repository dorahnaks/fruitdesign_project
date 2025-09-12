from flask import Blueprint, request, jsonify
from app.models.cart import Cart, CartItem
from app.models.product import Product
from app.models.order import Order, OrderItem
from app.extensions import db
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.status_codes import (
    HTTP_200_OK, HTTP_201_CREATED, HTTP_400_BAD_REQUEST,
    HTTP_404_NOT_FOUND, HTTP_401_UNAUTHORIZED, HTTP_500_INTERNAL_SERVER_ERROR
)
from datetime import datetime

cart_bp = Blueprint('cart', __name__, url_prefix='/api/v1/carts')

# Helper function to check if current user is admin
def is_admin():
    identity = get_jwt_identity()
    if isinstance(identity, dict):
        return identity.get('role') in ['admin', 'superadmin']
    elif isinstance(identity, str):
        return identity.startswith('admin_') or identity.startswith('superadmin_')
    return False

# Helper function to check if current user is customer
def is_customer():
    identity = get_jwt_identity()
    if isinstance(identity, dict):
        return identity.get('role') == 'customer'
    elif isinstance(identity, str):
        return identity.startswith('customer_')
    return False

# Helper function to extract user info from token
def get_user_info():
    identity = get_jwt_identity()
    user_id = None
    user_role = None
    
    if isinstance(identity, dict):
        user_id = identity.get('id')
        user_role = identity.get('role')
    elif isinstance(identity, str):
        parts = identity.split('_')
        if len(parts) >= 2:
            user_role = parts[0]
            try:
                user_id = int(parts[1])
            except ValueError:
                pass
    
    return user_id, user_role

# Debug endpoint to check token format
@cart_bp.route('/debug-token', methods=['GET'])
@jwt_required()
def debug_token():
    identity = get_jwt_identity()
    user_id, user_role = get_user_info()
    
    return jsonify({
        'identity': identity,
        'identity_type': str(type(identity)),
        'user_id': user_id,
        'user_role': user_role,
        'is_admin': is_admin(),
        'is_customer': is_customer()
    })

# Get current user's cart (admin or customer)
@cart_bp.route('', methods=['GET'])
@jwt_required()
def get_cart():
    user_id, user_role = get_user_info()
    
    if not user_id or not user_role:
        return jsonify({'error': 'User identity missing'}), HTTP_401_UNAUTHORIZED
    
    # Find cart based on user id and role
    if user_role == 'customer':
        cart = Cart.query.filter_by(customer_id=user_id).first()
    elif user_role in ['admin', 'superadmin']:
        cart = Cart.query.filter_by(admin_id=user_id).first()
    else:
        return jsonify({'error': 'Invalid user role'}), HTTP_401_UNAUTHORIZED
    
    if not cart:
        # If no cart, return empty list (user may not have added items yet)
        return jsonify({'cart': [], 'message': 'Cart is empty'}), HTTP_200_OK
    
    # Prepare cart items data for response
    items_data = []
    for item in cart.items:
        items_data.append({
            'cart_item_id': item.id,
            'product_id': item.product_id,
            'product_name': item.product.name if item.product else None,
            'quantity': item.quantity,
            'price': item.price if hasattr(item, 'price') else None
        })
    
    return jsonify({'cart': items_data}), HTTP_200_OK

# Add item to cart (customer or admin can add)
@cart_bp.route('/items', methods=['POST'])
@jwt_required()
def add_to_cart():
    user_id, user_role = get_user_info()
    
    if not user_id or not user_role:
        return jsonify({'error': 'User identity missing'}), HTTP_401_UNAUTHORIZED
    
    data = request.get_json()
    if not data or 'product_id' not in data:
        return jsonify({'error': 'product_id is required'}), HTTP_400_BAD_REQUEST
    
    product_id = data['product_id']
    quantity = data.get('quantity', 1)
    
    # Validate product existence
    product = Product.query.get(product_id)
    if not product:
        return jsonify({'error': 'Product not found'}), HTTP_404_NOT_FOUND
    
    # Find or create the cart for this user
    if user_role == 'customer':
        cart = Cart.query.filter_by(customer_id=user_id).first()
        if not cart:
            cart = Cart(customer_id=user_id)
            db.session.add(cart)
            db.session.flush()  # Flush to get cart.id before adding items
    elif user_role in ['admin', 'superadmin']:
        cart = Cart.query.filter_by(admin_id=user_id).first()
        if not cart:
            cart = Cart(admin_id=user_id)
            db.session.add(cart)
            db.session.flush()  # Flush to get cart.id before adding items
    else:
        return jsonify({'error': 'Invalid user role'}), HTTP_401_UNAUTHORIZED
    
    # Check if item already exists in cart to update quantity
    existing_item = CartItem.query.filter_by(cart_id=cart.id, product_id=product_id).first()
    if existing_item:
        existing_item.quantity += quantity  # Increase quantity
    else:
        # Create new CartItem and add to session
        new_item = CartItem(
            cart_id=cart.id,
            product_id=product_id,
            quantity=quantity
        )
        db.session.add(new_item)
    
    try:
        db.session.commit()  # Commit all changes together
        return jsonify({'message': 'Item added to cart successfully'}), HTTP_201_CREATED
    except Exception as e:
        db.session.rollback()  # Rollback in case of error
        print("Add to cart error:", str(e))
        return jsonify({'error': 'Failed to add item to cart'}), HTTP_500_INTERNAL_SERVER_ERROR

# Update quantity of a cart item
@cart_bp.route('/items/<int:item_id>', methods=['PUT', 'PATCH'])
@jwt_required()
def update_cart_item(item_id):
    user_id, user_role = get_user_info()
    
    if not user_id or not user_role:
        return jsonify({'error': 'User identity missing'}), HTTP_401_UNAUTHORIZED
    
    item = CartItem.query.get(item_id)
    if not item:
        return jsonify({'error': 'Cart item not found'}), HTTP_404_NOT_FOUND
    
    # Check ownership of the cart item: user must own the cart item or be admin
    if user_role == 'customer':
        if item.cart.customer_id != user_id:
            return jsonify({'error': 'Unauthorized to update this cart item'}), HTTP_401_UNAUTHORIZED
    elif user_role in ['admin', 'superadmin']:
        if item.cart.admin_id != user_id and not is_admin():
            return jsonify({'error': 'Unauthorized to update this cart item'}), HTTP_401_UNAUTHORIZED
    else:
        return jsonify({'error': 'Invalid user role'}), HTTP_401_UNAUTHORIZED
    
    data = request.get_json()
    if not data or 'quantity' not in data:
        return jsonify({'error': 'Quantity field is required'}), HTTP_400_BAD_REQUEST
    
    quantity = data['quantity']
    if not isinstance(quantity, int) or quantity < 1:
        return jsonify({'error': 'Quantity must be a positive integer'}), HTTP_400_BAD_REQUEST
    
    item.quantity = quantity
    try:
        db.session.commit()
        return jsonify({'message': 'Cart item updated successfully'}), HTTP_200_OK
    except Exception as e:
        db.session.rollback()
        print("Update cart item error:", str(e))
        return jsonify({'error': 'Failed to update cart item'}), HTTP_500_INTERNAL_SERVER_ERROR

# Delete an item from cart
@cart_bp.route('/items/<int:item_id>', methods=['DELETE'])
@jwt_required()
def delete_cart_item(item_id):
    user_id, user_role = get_user_info()
    
    if not user_id or not user_role:
        return jsonify({'error': 'User identity missing'}), HTTP_401_UNAUTHORIZED
    
    item = CartItem.query.get(item_id)
    if not item:
        return jsonify({'error': 'Cart item not found'}), HTTP_404_NOT_FOUND
    
    # Verify ownership or admin status before deletion
    if user_role == 'customer':
        if item.cart.customer_id != user_id:
            return jsonify({'error': 'Unauthorized to delete this cart item'}), HTTP_401_UNAUTHORIZED
    elif user_role in ['admin', 'superadmin']:
        if item.cart.admin_id != user_id and not is_admin():
            return jsonify({'error': 'Unauthorized to delete this cart item'}), HTTP_401_UNAUTHORIZED
    else:
        return jsonify({'error': 'Invalid user role'}), HTTP_401_UNAUTHORIZED
    
    try:
        db.session.delete(item)
        db.session.commit()
        return jsonify({'message': 'Cart item deleted successfully'}), HTTP_200_OK
    except Exception as e:
        db.session.rollback()
        print("Delete cart item error:", str(e))
        return jsonify({'error': 'Failed to delete cart item'}), HTTP_500_INTERNAL_SERVER_ERROR

# Checkout - Create order from cart and clear cart
@cart_bp.route('/checkout', methods=['POST'])
@jwt_required()
def checkout():
    user_id, user_role = get_user_info()
    
    if not user_id or not user_role:
        return jsonify({'error': 'User identity missing'}), HTTP_401_UNAUTHORIZED
    
    # Only customers can checkout
    if user_role != 'customer':
        return jsonify({'error': 'Only customers can place orders'}), HTTP_401_UNAUTHORIZED
    
    # Find the user's cart
    cart = Cart.query.filter_by(customer_id=user_id).first()
    if not cart or not cart.items:
        return jsonify({'error': 'Cart is empty'}), HTTP_400_BAD_REQUEST
    
    # Prepare order items from cart items
    order_items = []
    total_amount = 0.0
    
    for cart_item in cart.items:
        product = Product.query.get(cart_item.product_id)
        if not product:
            continue  # Skip if product doesn't exist
        
        # Calculate price (use current product price)
        price = product.price
        item_total = price * cart_item.quantity
        total_amount += item_total
        
        # Create order item
        order_item = OrderItem(
            product_id=cart_item.product_id,
            quantity=cart_item.quantity,
            price=price
        )
        order_items.append(order_item)
    
    if not order_items:
        return jsonify({'error': 'No valid products in cart'}), HTTP_400_BAD_REQUEST
    
    # Create a new order
    new_order = Order(
        customer_id=user_id,
        order_date=datetime.utcnow(),
        total_amount=total_amount,
        status='Pending'
    )
    
    try:
        # Add order to database
        db.session.add(new_order)
        db.session.flush()  # Get order ID
        
        # Add order items to database
        for order_item in order_items:
            order_item.order_id = new_order.id
            db.session.add(order_item)
        
        # Clear the cart by deleting all cart items
        CartItem.query.filter_by(cart_id=cart.id).delete()
        
        # Commit all changes
        db.session.commit()
        
        # Return success response with order details
        return jsonify({
            'message': 'Order placed successfully',
            'order': {
                'order_id': new_order.id,
                'customer_id': new_order.customer_id,
                'order_date': new_order.order_date.isoformat(),
                'status': new_order.status,
                'total_amount': float(new_order.total_amount),
                'items': [
                    {
                        'product_id': item.product_id,
                        'quantity': item.quantity,
                        'price': float(item.price)
                    } for item in new_order.items
                ]
            }
        }), HTTP_201_CREATED
    
    except Exception as e:
        db.session.rollback()
        print("Checkout error:", str(e))
        return jsonify({'error': 'Failed to place order'}), HTTP_500_INTERNAL_SERVER_ERROR