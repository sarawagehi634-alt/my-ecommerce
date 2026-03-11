// @ts-nocheck
// src/context/CartContext.jsx
import React, { createContext, useState, useContext, useEffect, useCallback, useMemo } from 'react';
import toast from 'react-hot-toast';
import cartService from '../services/cartService';
import { useAuth } from './AuthContext';

const CartContext = createContext(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated, initialized } = useAuth();

  useEffect(() => {
    const saved = localStorage.getItem('bt_cart');
    if (saved) {
      try {
        setCartItems(JSON.parse(saved));
      } catch {
        localStorage.removeItem('bt_cart');
      }
    }

    if (initialized && isAuthenticated) {
      fetchCartFromAPI();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, initialized]);

  const fetchCartFromAPI = async () => {
    try {
      const response = await cartService.getCart();
      if (response?.data?.items) {
        setCartItems(response.data.items);
        localStorage.setItem('bt_cart', JSON.stringify(response.data.items));
      }
    } catch {
      console.error('API Cart Load Failed');
    } finally {
      setLoading(false);
    }
  };

  const { cartTotal, cartCount } = useMemo(() => {
    return cartItems.reduce((acc, item) => ({
      cartTotal: acc.cartTotal + (Number(item.price) * (item.quantity || 1)),
      cartCount: acc.cartCount + (item.quantity || 1)
    }), { cartTotal: 0, cartCount: 0 });
  }, [cartItems]);

  useEffect(() => {
    localStorage.setItem('bt_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = useCallback((product, quantity = 1) => {
    setCartItems(prev => {
      const exists = prev.find(i => i.id === product.id);
      const newItems = exists 
        ? prev.map(i => i.id === product.id ? { ...i, quantity: i.quantity + quantity } : i)
        : [...prev, { ...product, quantity }];
      
      if (isAuthenticated) cartService.syncCart(newItems).catch(() => null);
      return newItems;
    });

    toast.success('تمت الإضافة للسلة', {
      icon: '🛍️',
      style: { borderRadius: '0px', background: '#000', color: '#fff', fontSize: '12px', fontWeight: 'bold' }
    });
  }, [isAuthenticated]);

  const updateQuantity = useCallback((productId, delta) => {
    setCartItems(prev => {
      const newItems = prev.map(item => {
        if (item.id === productId) {
          return { ...item, quantity: Math.max(1, item.quantity + delta) };
        }
        return item;
      });
      if (isAuthenticated) cartService.syncCart(newItems).catch(() => null);
      return newItems;
    });
  }, [isAuthenticated]);

  const removeFromCart = useCallback((productId) => {
    setCartItems(prev => {
      const newItems = prev.filter(i => i.id !== productId);
      if (isAuthenticated) cartService.syncCart(newItems).catch(() => null);
      return newItems;
    });
    toast.error('تم الحذف من السلة', { icon: '🗑️', style: { fontSize: '12px' } });
  }, [isAuthenticated]);

  const clearCart = useCallback(() => {
    setCartItems([]);
    if (isAuthenticated) cartService.clearCart();
  }, [isAuthenticated]);

  const value = useMemo(() => ({
    cartItems, cartTotal, cartCount, loading,
    addToCart, updateQuantity, removeFromCart, clearCart
  }), [cartItems, cartTotal, cartCount, loading, addToCart, updateQuantity, removeFromCart, clearCart]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};