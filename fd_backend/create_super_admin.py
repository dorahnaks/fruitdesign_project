# create_super_admin.py
from app import create_app, db
from app.models.admin_user import AdminUser
import bcrypt

def hash_password(password):
    """Hash password with bcrypt"""
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')

app = create_app()

with app.app_context():
    # Check if super admin already exists
    existing_super_admin = AdminUser.query.filter_by(email='superadmin@example.com').first()
    if not existing_super_admin:
        # Create super admin
        super_admin = AdminUser(
            user_name="superadmin_1",
            full_name="Super Admin",
            email="dorothy@example.com",
            password=hash_password("Super123!"),
            role="super_admin",
            phone_number="1234567890"
        )
        db.session.add(super_admin)
        db.session.commit()
        print("Super Admin created successfully!")
        print(f"Email: {super_admin.email}")
        print(f"Password: {super_admin.password}")
    else:
        print("Super Admin already exists")