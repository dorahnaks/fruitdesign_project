# # Importing all models to ensure they are registered with SQLAlchemy
from app.extensions import db  # Importing the database extension
from .customer import Customer
from .order import Order, OrderItem
from .product import Product
from .feedback import Feedback
from .admin_user import AdminUser
from .contact_info import ContactInfo
from .cart import Cart, CartItem 