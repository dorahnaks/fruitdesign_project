from app.extensions import db
from datetime import datetime

class Feedback(db.Model):
    __tablename__ = 'feedback'
    id = db.Column(db.Integer, primary_key=True)
    customer_id = db.Column(db.Integer, db.ForeignKey('customers.id'), nullable=False)
    title = db.Column(db.String(255), nullable=True)
    feedback_message = db.Column(db.Text, nullable=False)
    rating = db.Column(db.Integer, nullable=True)
    response = db.Column(db.Text, nullable=True)
    status = db.Column(db.String(50), default='new')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    customer = db.relationship('Customer', back_populates='feedbacks')
    
    __table_args__ = (
        db.Index('idx_feedback_customer', 'customer_id'),
        db.Index('idx_feedback_status', 'status'),
    )
    
    def __repr__(self):
        return f'<Feedback {self.id} by Customer {self.customer_id}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'customer_id': self.customer_id,
            'title': self.title,
            'message': self.feedback_message,
            'rating': self.rating,
            'response': self.response,
            'status': self.status,
            'created_at': self.created_at.strftime('%Y-%m-%d %H:%M:%S'),
            'updated_at': self.updated_at.strftime('%Y-%m-%d %H:%M:%S')
        }