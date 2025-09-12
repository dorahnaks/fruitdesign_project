import React, { useState } from 'react';
import './OrderForm.css';
import ProductCard from '../components/ProductCard';

const OrderForm = () => {
  const [orderItems, setOrderItems] = useState([
    { id: 1, name: 'Orange Juice', quantity: 0, price: 5000 },
    { id: 2, name: 'Pineapple Juice', quantity: 0, price: 6000 },
    { id: 3, name: 'Berry Smoothie', quantity: 0, price: 7000 }
  ]);

  const [formData, setFormData] = useState({
    deliveryAddress: '',
    phone: '',
    paymentMethod: 'cash'
  });

  const handleQuantityChange = (id, change) => {
    setOrderItems(prev => 
      prev.map(item => 
        item.id === id 
          ? { ...item, quantity: Math.max(0, item.quantity + change) } 
          : item
      )
    );
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle order submission
  };

  const totalAmount = orderItems.reduce(
    (total, item) => total + item.quantity * item.price, 
    0
  );

  return (
    <div className="order-form">
      <h2>Place Your Order</h2>
      
      <div className="order-items">
        <h3>Order Items</h3>
        {orderItems.map(item => (
          <div key={item.id} className="order-item">
            <span>{item.name} - UGX {item.price}</span>
            <div className="quantity-controls">
              <button onClick={() => handleQuantityChange(item.id, -1)}>-</button>
              <span>{item.quantity}</span>
              <button onClick={() => handleQuantityChange(item.id, 1)}>+</button>
            </div>
          </div>
        ))}
        <div className="order-total">
          <strong>Total: UGX {totalAmount}</strong>
        </div>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="delivery-info">
          <h3>Delivery Information</h3>
          <div className="form-group">
            <input 
              type="text" 
              name="deliveryAddress" 
              placeholder="Delivery Address" 
              value={formData.deliveryAddress}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group">
            <input 
              type="tel" 
              name="phone" 
              placeholder="+256700000000" 
              value={formData.phone}
              onChange={handleInputChange}
            />
          </div>
        </div>
        
        <div className="payment-info">
          <h3>Payment Method</h3>
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
        
        <button type="submit">Confirm Order</button>
      </form>
    </div>
  );
};

export default OrderForm;