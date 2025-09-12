from flask import Blueprint, request, jsonify
from app.models.order import Order, OrderItem
from app.models.customer import Customer
from app.models.product import Product
from app.extensions import db
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.status_codes import (
    HTTP_200_OK, HTTP_201_CREATED, HTTP_400_BAD_REQUEST,
    HTTP_404_NOT_FOUND, HTTP_401_UNAUTHORIZED, HTTP_500_INTERNAL_SERVER_ERROR
)

order_bp = Blueprint('order', __name__, url_prefix='/api/v1/orders')

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

# Debug endpoint to check token contents
@order_bp.route('/debug-token', methods=['GET'])
@jwt_required()
def debug_token():
    identity = get_jwt_identity()
    customer_id = get_customer_id()
    
    return jsonify({
        'identity': identity,
        'identity_type': str(type(identity)),
        'is_admin': is_admin(),
        'is_customer': is_customer(),
        'customer_id': customer_id
    })

# Create a new order (customer only)
@order_bp.route('/', methods=['POST'])
@jwt_required()
def create_order():
    if not is_customer():
        return jsonify({'error': 'Customer access required'}), HTTP_401_UNAUTHORIZED
    
    customer_id = get_customer_id()
    if customer_id is None:
        return jsonify({'error': 'Customer ID not found in token'}), HTTP_401_UNAUTHORIZED
    
    data = request.get_json()
    if not data or 'items' not in data or not data['items']:
        return jsonify({'error': 'Order items are required'}), HTTP_400_BAD_REQUEST
    
    try:
        total_amount = 0.0
        order_items = []
        
        for item in data['items']:
            product_id = item.get('product_id')
            quantity = item.get('quantity', 1)
            
            product = Product.query.get(product_id)
            if not product:
                return jsonify({'error': f'Product with id {product_id} not found'}), HTTP_404_NOT_FOUND
            
            item_price = product.price * quantity
            total_amount += item_price
            
            order_item = OrderItem(
                product_id=product.id,
                quantity=quantity,
                price=product.price
            )
            order_items.append(order_item)
        
        new_order = Order(
            customer_id=customer_id,
            total_amount=total_amount,
            status='Pending'
        )
        
        db.session.add(new_order)
        db.session.flush()
        
        for oi in order_items:
            oi.order_id = new_order.id
            db.session.add(oi)
        
        db.session.commit()
        
        return jsonify({
            'message': 'Order placed successfully, pending commitment fee confirmation',
            'order_id': new_order.id,
            'total_amount': total_amount,
            'status': new_order.status
        }), HTTP_201_CREATED
    except Exception as e:
        db.session.rollback()
        print("Order creation error:", str(e))
        return jsonify({'error': 'Failed to place order'}), HTTP_500_INTERNAL_SERVER_ERROR

# Get orders for the logged-in user (customers see their orders, admins see all)
@order_bp.route('/', methods=['GET'])
@jwt_required()
def get_orders():
    if is_admin():
        orders = Order.query.all()
    elif is_customer():
        customer_id = get_customer_id()
        if customer_id is None:
            return jsonify({'error': 'Customer ID not found in token'}), HTTP_401_UNAUTHORIZED
        orders = Order.query.filter_by(customer_id=customer_id).all()
    else:
        return jsonify({'error': 'Unauthorized access'}), HTTP_401_UNAUTHORIZED
    
    if not orders:
        return jsonify({'message': 'No orders found'}), HTTP_404_NOT_FOUND
    
    try:
        orders_data = []
        for order in orders:
            items = [{
                'product_id': item.product_id,
                'quantity': item.quantity,
                'price': item.price
            } for item in order.items]
            orders_data.append({
                'order_id': order.id,
                'customer_id': order.customer_id,
                'order_date': order.order_date.isoformat(),
                'total_amount': order.total_amount,
                'status': order.status,
                'items': items
            })
        
        return jsonify({'orders': orders_data}), HTTP_200_OK
    except Exception as e:
        return jsonify({'error': 'Failed to retrieve orders'}), HTTP_500_INTERNAL_SERVER_ERROR

# Update order status (admin only, e.g., to mark delivered)
@order_bp.route('/<int:order_id>/status', methods=['PATCH'])
@jwt_required()
def update_order_status(order_id):
    if not is_admin():
        return jsonify({'error': 'Admin access required'}), HTTP_401_UNAUTHORIZED
    
    try:
        order = Order.query.get(order_id)
        if not order:
            return jsonify({'error': 'Order not found'}), HTTP_404_NOT_FOUND
        
        data = request.get_json()
        if not data or 'status' not in data:
            return jsonify({'error': 'Status field is required'}), HTTP_400_BAD_REQUEST
        
        old_status = order.status
        order.status = data['status']
        
        db.session.commit()
        return jsonify({
            'message': 'Order status updated successfully',
            'order_id': order_id,
            'old_status': old_status,
            'new_status': order.status
        }), HTTP_200_OK
    except Exception as e:
        db.session.rollback()
        print("Order status update error:", str(e))
        return jsonify({'error': 'Failed to update order status'}), HTTP_500_INTERNAL_SERVER_ERROR

# Get a single order by ID
@order_bp.route('/<int:order_id>', methods=['GET'])
@jwt_required()
def get_order(order_id):
    try:
        order = Order.query.get(order_id)
        if not order:
            return jsonify({'error': 'Order not found'}), HTTP_404_NOT_FOUND
        
        # Check if user is admin or the customer who placed the order
        if is_admin():
            pass  # Admin can access any order
        elif is_customer():
            customer_id = get_customer_id()
            if customer_id != order.customer_id:
                return jsonify({'error': 'Unauthorized to access this order'}), HTTP_401_UNAUTHORIZED
        else:
            return jsonify({'error': 'Unauthorized access'}), HTTP_401_UNAUTHORIZED
        
        items = [{
            'product_id': item.product_id,
            'quantity': item.quantity,
            'price': item.price
        } for item in order.items]
        
        return jsonify({
            'order': {
                'order_id': order.id,
                'customer_id': order.customer_id,
                'order_date': order.order_date.isoformat(),
                'total_amount': order.total_amount,
                'status': order.status,
                'items': items
            }
        }), HTTP_200_OK
    except Exception as e:
        return jsonify({'error': 'Failed to retrieve order'}), HTTP_500_INTERNAL_SERVER_ERROR

# Cancel an order (customer only, only if status is 'Pending')
@order_bp.route('/<int:order_id>/cancel', methods=['POST'])
@jwt_required()
def cancel_order(order_id):
    if not is_customer():
        return jsonify({'error': 'Customer access required'}), HTTP_401_UNAUTHORIZED
    
    customer_id = get_customer_id()
    if customer_id is None:
        return jsonify({'error': 'Customer ID not found in token'}), HTTP_401_UNAUTHORIZED
    
    try:
        order = Order.query.get(order_id)
        if not order:
            return jsonify({'error': 'Order not found'}), HTTP_404_NOT_FOUND
        
        # Check if the order belongs to the customer
        if order.customer_id != customer_id:
            return jsonify({'error': 'Unauthorized to cancel this order'}), HTTP_401_UNAUTHORIZED
        
        # Check if order can be cancelled (only if status is 'Pending')
        if order.status.lower() != 'pending':
            return jsonify({'error': 'Order can only be cancelled if status is Pending'}), HTTP_400_BAD_REQUEST
        
        order.status = 'Cancelled'
        db.session.commit()
        
        return jsonify({
            'message': 'Order cancelled successfully',
            'order_id': order_id,
            'status': order.status
        }), HTTP_200_OK
    except Exception as e:
        db.session.rollback()
        print("Order cancellation error:", str(e))
        return jsonify({'error': 'Failed to cancel order'}), HTTP_500_INTERNAL_SERVER_ERROR