from app.extensions import db
from app.models.product import Product
from app.models.content import BestSeller, HealthTip, QuickTip, CompanyInfo, TeamMember, CompanyStat
from app.models.customer import Customer
from app.models.admin_user import AdminUser
import bcrypt  # Import bcrypt directly
import os
import logging

def seed_database():
    """Seed the database with initial data"""
    
    # Set up logging
    logging.basicConfig(level=logging.INFO)
    logger = logging.getLogger(__name__)
    
    # Clear existing data (optional - only for development)
    # db.drop_all()
    # db.create_all()
    
    # Create sample products
    products_data = [
        {
            'name': 'Fresh Orange Juice',
            'description': '100% pure orange juice squeezed from fresh oranges',
            'price': 4.99,
            'category': 'Juice',
            'stock_quantity': 50,
            'image_url': '/static/uploads/product_images/orange_juice.jpg',
            'is_active': True,
            'is_featured': True
        },
        {
            'name': 'Organic Apples',
            'description': 'Crisp and juicy organic apples, perfect for snacking',
            'price': 3.49,
            'category': 'Fruit',
            'stock_quantity': 100,
            'image_url': '/static/uploads/product_images/apples.jpg',
            'is_active': True,
            'is_featured': True
        },
        {
            'name': 'Berry Smoothie',
            'description': 'Delicious blend of strawberries, blueberries, and raspberries',
            'price': 5.99,
            'category': 'Juice',
            'stock_quantity': 30,
            'image_url': '/static/uploads/product_images/berry_smoothie.jpg',
            'is_active': True,
            'is_featured': False
        },
        {
            'name': 'Tropical Fruit Salad',
            'description': 'Fresh mix of mango, pineapple, and papaya',
            'price': 6.49,
            'category': 'Fruit',
            'stock_quantity': 25,
            'image_url': '/static/uploads/product_images/tropical_salad.jpg',
            'is_active': True,
            'is_featured': True
        },
        {
            'name': 'Green Juice',
            'description': 'Healthy blend of spinach, kale, apple, and lemon',
            'price': 5.49,
            'category': 'Juice',
            'stock_quantity': 40,
            'image_url': '/static/uploads/product_images/green_juice.jpg',
            'is_active': True,
            'is_featured': False
        }
    ]
    
    # Add products
    for product_data in products_data:
        # Check if product already exists
        existing = Product.query.filter_by(name=product_data['name']).first()
        if not existing:
            product = Product(**product_data)
            db.session.add(product)
    
    # Commit products to get their IDs
    db.session.commit()
    
    # Define which products should be best sellers
    best_seller_names = [
        'Fresh Orange Juice',
        'Organic Apples',
        'Berry Smoothie',
        'Tropical Fruit Salad'
    ]
    
    # Create best sellers entries
    for i, product_name in enumerate(best_seller_names):
        product = Product.query.filter_by(name=product_name).first()
        if product:
            # Check if best seller entry already exists
            existing = BestSeller.query.filter_by(product_id=product.id).first()
            if not existing:
                best_seller = BestSeller(product_id=product.id, display_order=i+1)
                db.session.add(best_seller)
    
    # Create health tips
    health_tips_data = [
        {
            'title': 'Citrus Fruits Boost Immunity',
            'description': 'Citrus fruits like oranges, lemons, and grapefruits are rich in vitamin C, which is essential for a healthy immune system.',
            'icon': '🍊',
            'color': '#FFA500',
            'category': 'citrus'
        },
        {
            'title': 'Tropical Fruits for Energy',
            'description': 'Tropical fruits like mangoes and pineapples are packed with natural sugars and enzymes that provide a quick energy boost.',
            'icon': '🥭',
            'color': '#FFD700',
            'category': 'tropical'
        },
        {
            'title': 'Berries for Brain Health',
            'description': 'Berries are rich in antioxidants that help protect brain cells from damage and may improve memory.',
            'icon': '🫐',
            'color': '#6A0DAD',
            'category': 'berries'
        },
        {
            'title': 'Watermelon for Hydration',
            'description': 'Watermelon is over 90% water, making it an excellent choice for staying hydrated in hot weather.',
            'icon': '🍉',
            'color': '#FF6B6B',
            'category': 'hydrating'
        }
    ]
    
    for tip_data in health_tips_data:
        existing = HealthTip.query.filter_by(title=tip_data['title']).first()
        if not existing:
            tip = HealthTip(**tip_data)
            db.session.add(tip)
    
    # Create quick tips
    quick_tips_data = [
        {
            'title': 'Morning Citrus Boost',
            'description': 'Start your day with a glass of warm water and lemon to kickstart your digestion.',
            'icon': '🍋'
        },
        {
            'title': 'Berry Antioxidant Power',
            'description': 'Add a handful of mixed berries to your breakfast for a powerful antioxidant boost.',
            'icon': '🍓'
        },
        {
            'title': 'Hydration Reminder',
            'description': 'Keep a water bottle with you throughout the day to stay properly hydrated.',
            'icon': '💧'
        }
    ]
    
    for tip_data in quick_tips_data:
        existing = QuickTip.query.filter_by(title=tip_data['title']).first()
        if not existing:
            tip = QuickTip(**tip_data)
            db.session.add(tip)
    
    # Create company info
    company_info_data = [
        {'key': 'story', 'value': 'Founded in 2019 with a simple vision: to make healthy living delicious and accessible. What began as a small juice stand has blossomed into a beloved destination for fresh fruits and nutritious beverages.'},
        {'key': 'mission', 'value': 'To provide the freshest, highest-quality fruits and juices while supporting sustainable farming practices and promoting healthy lifestyles in our community.'},
        {'key': 'values', 'value': 'Freshness, Quality, Sustainability, Community, Integrity'}
    ]
    
    for info_data in company_info_data:
        existing = CompanyInfo.query.filter_by(key=info_data['key']).first()
        if not existing:
            info = CompanyInfo(**info_data)
            db.session.add(info)
    
    # Create team members
    team_members_data = [
        {
            'name': 'Alex Morgan',
            'role': 'Founder & CEO',
            'bio': 'With a background in nutrition and a passion for sustainable agriculture, Alex founded our company to make healthy living accessible to everyone.',
            'image_url': '/static/uploads/team/founder.jpg',
            'display_order': 1
        },
        {
            'name': 'Jamie Wilson',
            'role': 'Head of Operations',
            'bio': 'Jamie ensures our supply chain runs smoothly from farm to table, maintaining our commitment to freshness and quality at every step.',
            'image_url': '/static/uploads/team/manager.jpg',
            'display_order': 2
        },
        {
            'name': 'Taylor Reed',
            'role': 'Nutrition Specialist',
            'bio': 'Taylor develops our juice recipes and wellness programs, ensuring every product delivers maximum nutritional benefits and delicious flavor.',
            'image_url': '/static/uploads/team/nutritionist.jpg',
            'display_order': 3
        }
    ]
    
    for member_data in team_members_data:
        existing = TeamMember.query.filter_by(name=member_data['name']).first()
        if not existing:
            member = TeamMember(**member_data)
            db.session.add(member)
    
    # Create company stats
    stats_data = [
        {'label': 'Year Founded', 'value': '2019', 'display_order': 1},
        {'label': 'Partner Farms', 'value': '20+', 'display_order': 2},
        {'label': 'Happy Customers', 'value': '50K+', 'display_order': 3}
    ]
    
    for stat_data in stats_data:
        existing = CompanyStat.query.filter_by(label=stat_data['label']).first()
        if not existing:
            stat = CompanyStat(**stat_data)
            db.session.add(stat)
    
    # Create super admin user with your credentials
    super_admin = AdminUser.query.filter_by(user_name='superadmin').first()
    if not super_admin:
        # Use your provided credentials
        super_admin_email = os.environ.get('SUPERADMIN_EMAIL', 'dorahnakslove@gmail.com')
        super_admin_password = os.environ.get('SUPERADMIN_PASSWORD', 'fruitDorah111')
        
        super_admin = AdminUser(
            user_name='superadmin',
            email=super_admin_email,
            full_name='Super Administrator',
            role='super_admin',
            is_active=True
        )
        
        # Hash the password using bcrypt
        password_bytes = super_admin_password.encode('utf-8')
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw(password_bytes, salt)
        super_admin.password = hashed.decode('utf-8')
        
        db.session.add(super_admin)
        logger.info(f"Created super admin with username: superadmin")
        logger.info(f"Email: {super_admin_email}")
        logger.info("IMPORTANT: Remember your credentials for login!")
    
    # Create regular admin user
    admin_user = AdminUser.query.filter_by(user_name='admin').first()
    if not admin_user:
        admin_user = AdminUser(
            user_name='admin',
            email='admin@fruitdesign.com',
            full_name='System Administrator',
            role='admin',
            is_active=True
        )
        
        # Hash the password using bcrypt
        password_bytes = 'admin123'.encode('utf-8')
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw(password_bytes, salt)
        admin_user.password = hashed.decode('utf-8')
        
        db.session.add(admin_user)
    
    # Create sample customer
    customer = Customer.query.filter_by(email='customer@example.com').first()
    if not customer:
        customer = Customer(
            name='Julie Kay',
            email='customer@example.com',
            phone='+256 700 000 000',
            is_active=True
        )
        
        # Hash the password using bcrypt
        password_bytes = 'password123'.encode('utf-8')
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw(password_bytes, salt)
        customer.password = hashed.decode('utf-8')
        
        db.session.add(customer)
    
    # Commit all changes
    db.session.commit()
    logger.info("Database seeded successfully!")
    logger.info("Superadmin credentials:")
    logger.info("Username: superadmin")
    logger.info(f"Email: {super_admin_email}")
    logger.info("Password: [The password you set in environment variables]")