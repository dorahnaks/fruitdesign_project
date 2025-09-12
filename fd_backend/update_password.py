# update_password.py
from app import create_app
from app.models.admin_user import AdminUser
import bcrypt
import os

def update_admin_password():
    app = create_app()
    with app.app_context():
        # Get the super admin user
        super_admin = AdminUser.query.filter_by(user_name='superadmin').first()
        
        if super_admin:
            # Get password from environment variables
            super_admin_password = os.environ.get('SUPERADMIN_PASSWORD', 'fruitDorah111')
            
            # Hash the password using bcrypt
            password_bytes = super_admin_password.encode('utf-8')
            salt = bcrypt.gensalt()
            hashed = bcrypt.hashpw(password_bytes, salt)
            
            # Update the password
            super_admin.password = hashed.decode('utf-8')
            
            # Save changes
            from app.extensions import db
            db.session.commit()
            
            print("Super admin password updated successfully!")
        else:
            print("Super admin user not found!")

if __name__ == '__main__':
    update_admin_password()