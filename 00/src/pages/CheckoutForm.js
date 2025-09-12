// src/pages/CheckoutForm.js
import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import '../styles/CheckoutForm.css';

const CheckoutForm = () => {
  const { cart, clearCart } = useCart();
  const [formData, setFormData] = useState({
    deliveryAddress: '',
    phone: '',
    paymentMethod: 'cash'
  });
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isLoggedIn) {
      navigate('/login?checkout=true');
      return;
    }
    
    // Process order
    alert('Order placed successfully!');
    clearCart();
    navigate('/order-confirmation');
  };

  const totalAmount = cart.reduce(
    (total, item) => total + item.price * item.quantity, 
    0
  );

  return (
    <div className="checkout-container">
      <h1>Checkout</h1>
      
      {!isLoggedIn && (
        <div className="login-prompt">
          <p>Please login to complete your purchase</p>
          <button 
            className="btn-primary" 
            onClick={() => navigate('/login?checkout=true')}
          >
            Login
          </button>
        </div>
      )}
      
      {isLoggedIn && (
        <form onSubmit={handleSubmit} className="checkout-form">
          <div className="order-items">
            <h2>Order Items</h2>
            {cart.map(item => (
              <div key={item.id} className="order-item">
                <span>{item.title} x {item.quantity}</span>
                <span>UGX {(item.price * item.quantity).toLocaleString()}</span>
              </div>
            ))}
            <div className="order-total">
              <h3>Total: UGX {totalAmount.toLocaleString()}</h3>
            </div>
          </div>
          
          <div className="delivery-info">
            <h2>Delivery Information</h2>
            <div className="form-group">
              <label>Delivery Address</label>
              <input 
                type="text" 
                name="deliveryAddress" 
                value={formData.deliveryAddress}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Phone Number</label>
              <input 
                type="tel" 
                name="phone" 
                placeholder="+256700000000" 
                value={formData.phone}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>
          
          <div className="payment-info">
            <h2>Payment Method</h2>
            <div className="payment-options">
              <label>
                <input 
                  type="radio" 
                  name="paymentMethod" 
                  value="cash" 
                  checked={formData.paymentMethod === 'cash'}
                  onChange={handleInputChange}
                />
                Cash on Delivery
              </label>
              <label>
                <input 
                  type="radio" 
                  name="paymentMethod" 
                  value="mobile" 
                  checked={formData.paymentMethod === 'mobile'}
                  onChange={handleInputChange}
                />
                Mobile Money
              </label>
            </div>
          </div>
          
          <button type="submit" className="btn-primary">Confirm Order</button>
        </form>
      )}
    </div>
  );
};

export default CheckoutForm;