from app.extensions import db
from datetime import datetime

class OrderItem(db.Model):
    __tablename__ = 'order_items'
    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey('orders.id'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    quantity = db.Column(db.Integer, nullable=False, default=1)
    price = db.Column(db.Float, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    order = db.relationship('Order', back_populates='items')
    product = db.relationship('Product', back_populates='order_items')
    
    __table_args__ = (
        db.Index('idx_order_item_product', 'product_id'),
    )
    
    @property 
    # The @property decorator allows you to define methods in a class that can be accessed like attributes. 
    # In this case, it allows you to get the total price of the order item by simply accessing order_item.total_price instead of calling a method.
    def total_price(self):
        return self.quantity * self.price
    
    def __repr__(self):
        return f'<OrderItem {self.id} for Order {self.order_id}>'

class Order(db.Model):
    __tablename__ = 'orders'
    id = db.Column(db.Integer, primary_key=True)
    customer_id = db.Column(db.Integer, db.ForeignKey('customers.id'), nullable=False)
    order_date = db.Column(db.DateTime, default=datetime.utcnow)
    total_amount = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(50), default='Pending')
    commitment_fee_paid = db.Column(db.Boolean, default=False)
    payment_date = db.Column(db.DateTime, nullable=True)
    delivery_date = db.Column(db.DateTime, nullable=True)
    delivery_address = db.Column(db.String(255), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    customer = db.relationship('Customer', back_populates='orders')
    items = db.relationship('OrderItem', back_populates='order', cascade='all, delete-orphan')
    
    __table_args__ = (
        db.Index('idx_order_customer', 'customer_id'),
        db.Index('idx_order_status', 'status'),
        db.Index('idx_order_date', 'order_date'),
    )
    
    def __repr__(self):
        return f'<Order {self.id} by Customer {self.customer_id}>'