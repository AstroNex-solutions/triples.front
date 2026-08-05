import React, { createContext, useState, useEffect, useContext } from 'react';
import API from '../api/axios';
import { AuthContext } from './AuthContext';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [cart, setCart] = useState(null);
  const [cartCount, setCartCount] = useState(0);

  const fetchCart = async () => {
    if (!user) {
      setCart(null);
      setCartCount(0);
      return;
    }
    try {
      const res = await API.get('/store/cart');
      setCart(res.data);
      setCartCount(res.data.cart?.items?.length || 0);
    } catch (err) {
      console.error('Error fetching cart:', err);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [user]);

  const addToCart = async (course_id) => {
    if (!user) throw new Error('يرجى تسجيل الدخول أولاً لإضافة الدورة إلى السلة');
    const res = await API.post('/store/cart', { course_id });
    await fetchCart();
    return res.data;
  };

  return (
    <CartContext.Provider value={{ cart, cartCount, fetchCart, addToCart }}>
      {children}
    </CartContext.Provider>
  );
};
