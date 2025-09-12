from flask import Flask, jsonify, make_response, send_from_directory, render_template_string
from app.extensions import db, migrate, bcrypt, jwt, mail
from flask_cors import CORS
from config import config_by_name
from app.models import *
import os
from app.status_codes import (
    HTTP_200_OK, HTTP_201_CREATED, HTTP_400_BAD_REQUEST,
    HTTP_404_NOT_FOUND, HTTP_401_UNAUTHORIZED, HTTP_500_INTERNAL_SERVER_ERROR
)

def create_app(config_class=None):
    app = Flask(__name__)
    
    # Load configuration
    if config_class is None:
        config_name = os.environ.get('FLASK_ENV', 'development')
        config_class = config_by_name.get(config_name)
    
    app.config.from_object(config_class)
    
    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    bcrypt.init_app(app)
    jwt.init_app(app)
    mail.init_app(app)
    
    # Configure CORS
    CORS(app, resources={
        r"/api/*": {
            "origins": app.config.get('CORS_ORIGINS', ['http://localhost:3000']),
            "methods": ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"],
            "supports_credentials": True
        }
    })
    
    @app.after_request
    def after_request(response):
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
        return response
    
    # Register blueprints - FIXED: Removed duplicate URL prefix
    from app.controllers.auth import auth_bp
    app.register_blueprint(auth_bp)
    from app.controllers.customer import customer_bp
    app.register_blueprint(customer_bp)
    from app.controllers.admin import admin_bp
    app.register_blueprint(admin_bp)
    from app.controllers.product import product_bp
    app.register_blueprint(product_bp)  
    from app.controllers.order import order_bp
    app.register_blueprint(order_bp)
    from app.controllers.feedback import feedback_bp
    app.register_blueprint(feedback_bp)
    from app.controllers.contact import contact_bp
    app.register_blueprint(contact_bp)
    from app.controllers.cart import cart_bp
    app.register_blueprint(cart_bp)
    from app.controllers.content import content_bp
    app.register_blueprint(content_bp)
    
    # Create directories
    with app.app_context():
        directories = [
            os.path.join(app.root_path, 'static', 'uploads', 'product_images'),
            os.path.join(app.root_path, 'static', 'uploads', 'team'),
            os.path.join(app.root_path, 'static', 'uploads', 'company')
        ]
        
        for directory in directories:
            try:
                os.makedirs(directory, exist_ok=True)
            except OSError as e:
                app.logger.error(f"Error creating directory {directory}: {e}")
        
        db.create_all()
        
        # Seed database if empty
        if Product.query.count() == 0:
            from app.seed_data import seed_database
            seed_database()
    
    # Health check endpoint
    @app.route('/health')
    def health_check():
        try:
            db.session.execute('SELECT 1')
            return jsonify({
                'status': 'healthy',
                'database': 'connected'
            }), 200
        except Exception as e:
            return jsonify({
                'status': 'unhealthy',
                'database': 'disconnected',
                'error': str(e)
            }), 503
    
    @app.route('/test-cors')
    def test_cors():
        return jsonify({'message': 'CORS is working!'})
    
    # Test endpoint to verify API routes are working
    @app.route('/test-api')
    def test_api():
        return jsonify({
            'message': 'API is working',
            'endpoints': {
                'public_products': '/api/v1/products/public',
                'admin_products': '/api/v1/products'
            }
        })
    
    # Static files
    @app.route('/static/<path:filename>')
    def serve_static_files(filename):
        return send_from_directory('static', filename)
    
    @app.route('/static/uploads/product_images/<filename>')
    def serve_product_images(filename):
        return send_from_directory(os.path.join('static', 'uploads', 'product_images'), filename)
    
    @app.route('/static/uploads/team/<filename>')
    def serve_team_images(filename):
        return send_from_directory(os.path.join('static', 'uploads', 'team'), filename)
    
    @app.route('/static/uploads/company/<filename>')
    def serve_company_images(filename):
        return send_from_directory(os.path.join('static', 'uploads', 'company'), filename)
    
    # Root route
    @app.route("/")
    def index():
        return render_template_string("""
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>FruitDesign API</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            color: #333;
        }
        
        .container {
            background: white;
            padding: 40px;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
            text-align: center;
            max-width: 600px;
        }
        
        .logo {
            font-size: 60px;
            color: #6a0dad;
            margin-bottom: 20px;
        }
        
        h1 {
            color: #6a0dad;
            font-size: 2.5em;
            margin-bottom: 15px;
        }
        
        p {
            font-size: 1.1em;
            color: #666;
            margin-bottom: 30px;
            line-height: 1.6;
        }
        
        .btn {
            display: inline-block;
            background: #6a0dad;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 1em;
            font-weight: 500;
            text-decoration: none;
            margin: 5px;
            transition: background 0.3s ease;
        }
        
        .btn:hover {
            background: #530baf;
        }
        
        .btn-outline {
            background: transparent;
            border: 2px solid #6a0dad;
            color: #6a0dad;
        }
        
        .btn-outline:hover {
            background: #6a0dad;
            color: white;
        }
        
        .status {
            display: inline-block;
            width: 10px;
            height: 10px;
            background: #28a745;
            border-radius: 50%;
            margin-left: 10px;
            animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.5; }
            100% { opacity: 1; }
        }
        
        .endpoints {
            margin-top: 30px;
            text-align: left;
        }
        
        .endpoint {
            background: #f8f9fa;
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 10px;
            font-family: monospace;
        }
        
        .method {
            display: inline-block;
            padding: 3px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: bold;
            color: white;
            margin-right: 10px;
        }
        
        .get { background: #28a745; }
        .post { background: #007bff; }
        
        .footer {
            margin-top: 30px;
            font-size: 0.9em;
            color: #999;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">🍎</div>
        <h1>FruitDesign API</h1>
        <p>Your backend is running successfully! <span class="status"></span></p>
        
        <a href="/health" class="btn">Health Check</a>
        <a href="/test-api" class="btn btn-outline">Test API</a>
        <a href="/api/v1/products/public" class="btn btn-outline">View Products</a>
        
        <div class="endpoints">
            <h3>Quick API Access:</h3>
            <div class="endpoint">
                <span class="method get">GET</span>/api/v1/products/public
            </div>
            <div class="endpoint">
                <span class="method post">POST</span>/api/v1/auth/login
            </div>
            <div class="endpoint">
                <span class="method get">GET</span>/api/v1/feedback
            </div>
        </div>
        
        <div class="footer">
            &copy; 2025 FruitDesign. All rights reserved.
        </div>
    </div>
</body>
</html>
        """)
    
    return app