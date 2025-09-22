import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/CheckoutForm.css';

const CheckoutForm = () => {
  const { cart, clearCart, checkout } = useCart();
  const { isAuthenticated, user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    deliveryAddress: '',
    phone: '',
    paymentMethod: 'cash'
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Check if user was redirected from login with checkout=true
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const checkoutParam = params.get('checkout');
    
    if (checkoutParam === 'true' && !isAuthenticated) {
      // If user was redirected to login but isn't authenticated, 
      // they might have cancelled login, so redirect them back to login
      navigate('/login?checkout=true');
    }
  }, [isAuthenticated, location, navigate]);

  // Pre-fill form with user data if available
  useEffect(() => {
    if (isAuthenticated && user) {
      setFormData(prev => ({
        ...prev,
        deliveryAddress: user.address || prev.deliveryAddress,
        phone: user.phone || prev.phone
      }));
    }
  }, [isAuthenticated, user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if user is authenticated
    if (!isAuthenticated) {
      // Save checkout intent to localStorage
      localStorage.setItem('checkoutIntent', 'true');
      navigate('/login?checkout=true');
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // Update user's delivery information
      await updateUser({
        address: formData.deliveryAddress,
        phone: formData.phone
      });
      
      // Process order with cart context's checkout function
      await checkout({
        deliveryAddress: formData.deliveryAddress,
        phone: formData.phone,
        paymentMethod: formData.paymentMethod
      });
      
      // Clear checkout intent
      localStorage.removeItem('checkoutIntent');
      
      // Show success message and redirect
      alert('Order placed successfully!');
      clearCart();
      navigate('/order-confirmation');
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Failed to place order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const totalAmount = cart.reduce(
    (total, item) => total + item.price * item.quantity, 
    0
  );

  // If cart is empty, redirect to products page
  useEffect(() => {
    if (cart.length === 0) {
      navigate('/products');
    }
  }, [cart, navigate]);

  return (
    <div className="checkout-container">
      <h1>Checkout</h1>
      
      {!isAuthenticated && (
        <div className="login-prompt">
          <p>Please login to complete your purchase</p>
          <button 
            className="btn-primary" 
            onClick={() => {
              localStorage.setItem('checkoutIntent', 'true');
              navigate('/login?checkout=true');
            }}
          >
            Login to Continue
          </button>
        </div>
      )}
      
      {isAuthenticated && (
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
          
          <button 
            type="submit" 
            className="btn-primary" 
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <span className="loading-spinner"></span>
                Processing...
              </>
            ) : (
              'Confirm Order'
            )}
          </button>
        </form>
      )}
    </div>
  );
};

export default CheckoutForm;