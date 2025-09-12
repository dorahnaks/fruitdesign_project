from app.extensions import db
from datetime import datetime

class BestSeller(db.Model):
    __tablename__ = 'best_sellers'
    id = db.Column(db.Integer, primary_key=True)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    display_order = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    product = db.relationship('Product', back_populates='best_seller_info')
    
    __table_args__ = (
        db.Index('idx_best_seller_order', 'display_order'),
    )
    
    def to_dict(self):
        return {
            'id': self.id,
            'product': self.product.to_dict() if self.product else None,
            'display_order': self.display_order
        }
    
    def __repr__(self):
        return f'<BestSeller {self.id} for Product {self.product_id}>'

class HealthTip(db.Model):
    __tablename__ = 'health_tips'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=False)
    icon = db.Column(db.String(100), nullable=False)
    color = db.Column(db.String(50), nullable=False)
    category = db.Column(db.String(50), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    __table_args__ = (
        db.Index('idx_health_tip_category', 'category'),
    )
    
    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'icon': self.icon,
            'color': self.color,
            'category': self.category
        }
    
    def __repr__(self):
        return f'<HealthTip {self.title}>'

class QuickTip(db.Model):
    __tablename__ = 'quick_tips'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=False)
    icon = db.Column(db.String(100), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'icon': self.icon
        }
    
    def __repr__(self):
        return f'<QuickTip {self.title}>'

class CompanyInfo(db.Model):
    __tablename__ = 'company_info'
    id = db.Column(db.Integer, primary_key=True)
    key = db.Column(db.String(100), unique=True, nullable=False)
    value = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'key': self.key,
            'value': self.value
        }
    
    def __repr__(self):
        return f'<CompanyInfo {self.key}>'

class TeamMember(db.Model):
    __tablename__ = 'team_members'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    role = db.Column(db.String(100), nullable=False)
    bio = db.Column(db.Text, nullable=False)
    image_url = db.Column(db.String(255), nullable=True)
    linkedin_url = db.Column(db.String(255), nullable=True)
    twitter_url = db.Column(db.String(255), nullable=True)
    display_order = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    __table_args__ = (
        db.Index('idx_team_member_order', 'display_order'),
    )
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'role': self.role,
            'bio': self.bio,
            'image_url': self.image_url,
            'linkedin_url': self.linkedin_url,
            'twitter_url': self.twitter_url,
            'display_order': self.display_order
        }
    
    def __repr__(self):
        return f'<TeamMember {self.name}>'

class CompanyStat(db.Model):
    __tablename__ = 'company_stats'
    id = db.Column(db.Integer, primary_key=True)
    label = db.Column(db.String(100), nullable=False)
    value = db.Column(db.String(50), nullable=False)
    display_order = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    __table_args__ = (
        db.Index('idx_company_stat_order', 'display_order'),
    )
    
    def to_dict(self):
        return {
            'id': self.id,
            'label': self.label,
            'value': self.value,
            'display_order': self.display_order
        }
    
    def __repr__(self):
        return f'<CompanyStat {self.label}>'