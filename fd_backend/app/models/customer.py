# app/models/customer.py
from app.extensions import db
from datetime import datetime
import bcrypt  # Import bcrypt directly

class Customer(db.Model):
    __tablename__ = 'customers'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(255), nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=True)
    address = db.Column(db.String(255), nullable=True)
    password = db.Column(db.String(255), nullable=False)
    date_of_birth = db.Column(db.Date, nullable=True)
    profile_picture = db.Column(db.String(255), nullable=True)
    email_verified = db.Column(db.Boolean, default=False)
    is_active = db.Column(db.Boolean, default=True)
    last_login = db.Column(db.DateTime, nullable=True)
    password_reset_token = db.Column(db.String(255), nullable=True)
    password_reset_expiry = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    feedbacks = db.relationship('Feedback', back_populates='customer', cascade='all, delete-orphan')
    orders = db.relationship('Order', back_populates='customer', cascade='all, delete-orphan')
    
    __table_args__ = (
        db.Index('idx_customer_email', 'email'),
        db.Index('idx_customer_active', 'is_active'),
    )
    
    def set_password(self, password):
        """Hash password with bcrypt"""
        try:
            # Encode password to bytes
            password_bytes = password.encode('utf-8')
            # Generate salt and hash password
            salt = bcrypt.gensalt()
            hashed = bcrypt.hashpw(password_bytes, salt)
            # Store as string
            self.password = hashed.decode('utf-8')
        except Exception as e:
            print(f"Error hashing password: {str(e)}")
            raise
    
    def check_password(self, password):
        """Check if the input password matches the hashed password"""
        try:
            # Get stored password and encode to bytes
            stored_password = self.password.encode('utf-8')
            # Encode input password to bytes
            input_password = password.encode('utf-8')
            # Check if passwords match
            return bcrypt.checkpw(input_password, stored_password)
        except Exception as e:
            print(f"Error checking password: {str(e)}")
            return False
    
    def __repr__(self):
        return f'<Customer {self.name}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'phone': self.phone,
            'address': self.address,
            'date_of_birth': self.date_of_birth.strftime('%Y-%m-%d') if self.date_of_birth else None,
            'profile_picture': self.profile_picture,
            'email_verified': self.email_verified,
            'is_active': self.is_active,
            'last_login': self.last_login.strftime('%Y-%m-%d %H:%M:%S') if self.last_login else None,
            'created_at': self.created_at.strftime('%Y-%m-%d %H:%M:%S'),
            'updated_at': self.updated_at.strftime('%Y-%m-%d %H:%M:%S')
        }