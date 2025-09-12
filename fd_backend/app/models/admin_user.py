# app/models/admin_user.py
from app.extensions import db
from datetime import datetime
import bcrypt

class AdminUser(db.Model):
    __tablename__ = 'admin_users'
    id = db.Column(db.Integer, primary_key=True)
    user_name = db.Column(db.String(255), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    full_name = db.Column(db.String(255), nullable=True)
    phone_number = db.Column(db.String(20), nullable=True)
    profile_picture = db.Column(db.String(255), nullable=True)
    role = db.Column(db.String(50), default='admin', nullable=False)
    is_active = db.Column(db.Boolean, default=True)
    last_login = db.Column(db.DateTime, nullable=True)
    reset_password_token = db.Column(db.String(255), nullable=True)
    reset_password_expiry = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Added index for frequently queried fields
    __table_args__ = (
        db.Index('idx_admin_user_email', 'email'),
        db.Index('idx_admin_user_active', 'is_active'),
    )
    
    def is_super_admin(self): 
        return self.role == 'super_admin'
    
    def is_admin(self): 
        return self.role == 'admin'
    
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
        return f'<AdminUser {self.user_name}>'