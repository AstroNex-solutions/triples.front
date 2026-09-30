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

  const addToCart = async (item_id, type = 'course', package_id = null, feature_type = null) => {
    if (!user) throw new Error('يرجى تسجيل الدخول أولاً لإضافة المنتج إلى السلة');
    
    const payload = {};
    if (type === 'flashcard_product') {
      payload.flashcard_product_id = item_id;
    } else {
      payload.course_id = item_id;
      if (package_id) payload.package_id = package_id;
      if (feature_type) payload.feature_type = feature_type;
    }

    const res = await API.post('/store/cart', payload);
    await fetchCart();
    return res.data;
  };

  return (
    <CartContext.Provider value={{ cart, cartCount, fetchCart, addToCart }}>
      {children}
    </CartContext.Provider>
  );
};
