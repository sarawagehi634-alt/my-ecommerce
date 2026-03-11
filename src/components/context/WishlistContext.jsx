// @ts-nocheck
// src/context/WishlistContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

/**
 * 🔹 مفتاح التخزين في localStorage
 */
const STORAGE_KEY = "wishlist";

/**
 * 🔹 إنشاء Context للمفضلة
 */
const WishlistContext = createContext();

/**
 * 🔹 المزود الرئيسي (Provider) للمفضلة
 */
export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([]);

  // ✅ تحميل المفضلة من localStorage عند البداية
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setWishlist(JSON.parse(stored));
      } catch (error) {
        console.error("خطأ في قراءة المفضلة من المتصفح:", error);
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  // ✅ حفظ المفضلة في localStorage عند أي تغيير
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(wishlist));
  }, [wishlist]);

  /**
   * 🔹 إضافة منتج للمفضلة
   */
  const addToWishlist = useCallback((product) => {
    setWishlist(prev => {
      if (prev.some(item => item.id === product.id)) return prev;
      return [...prev, product];
    });
  }, []);

  /**
   * 🔹 إزالة منتج من المفضلة
   */
  const removeFromWishlist = useCallback((productId) => {
    setWishlist(prev => prev.filter(item => item.id !== productId));
  }, []);

  /**
   * 🔹 التحقق إذا المنتج موجود في المفضلة
   */
  const isInWishlist = useCallback(
    (productId) => wishlist.some(item => item.id === productId),
    [wishlist]
  );

  return (
    <WishlistContext.Provider value={{ wishlist, addToWishlist, removeFromWishlist, isInWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};

/**
 * 🔹 Hook لاستخدام المفضلة في أي مكان
 */
export const useWishlist = () => useContext(WishlistContext);