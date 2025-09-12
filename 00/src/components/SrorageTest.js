// src/components/StorageTest.js
import React from 'react';
import { storage } from '../utils/storage';

const StorageTest = () => {
  const testStorage = () => {
    console.log('Testing storage...');
    
    // Test auth storage
    console.log('Auth token:', storage.auth.getToken());
    console.log('User:', storage.auth.getUser());
    console.log('Is admin:', storage.auth.isAdmin());
    
    // Test cart storage
    console.log('Cart:', storage.cart.getCart());
    console.log('Cart count:', storage.cart.getItemCount());
    console.log('Cart total:', storage.cart.getTotal());
    
    // Test adding to cart
    const testItem = {
      productId: 1,
      name: 'Test Product',
      price: 10.99,
      quantity: 2
    };
    
    storage.cart.addItem(testItem);
    console.log('Cart after adding item:', storage.cart.getCart());
    
    // Test clearing cart
    storage.cart.clearCart();
    console.log('Cart after clearing:', storage.cart.getCart());
  };

  return (
    <div>
      <h2>Storage Test</h2>
      <button onClick={testStorage}>Test Storage</button>
    </div>
  );
};

export default StorageTest;