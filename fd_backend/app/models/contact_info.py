from app.extensions import db
from datetime import datetime
import json

class ContactInfo(db.Model):
    __tablename__ = 'contact_info'
    id = db.Column(db.Integer, primary_key=True)
    phone = db.Column(db.String(20))
    email = db.Column(db.String(100))
    location = db.Column(db.String(255))
    map_link = db.Column(db.String(255))
    social_media_links = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def set_social_links(self, links_dict): 
        self.social_media_links = json.dumps(links_dict)
    
    def get_social_links(self): 
        try:
            return json.loads(self.social_media_links or "{}")
        except (TypeError, ValueError):
            return {}  # Return empty dict if parsing fails
    
    def __repr__(self):
        return f'<ContactInfo {self.id}>'