// @ts-nocheck
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import { FiPlus, FiHeart, FiEye } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const [isHovered, setIsHovered] = useState(false);

  // التأكد من جودة البيانات القادمة من الـ API
  const p = {
    id: product.id || 0,
    name: product.name || "قطعة مميزة",
    price: product.price || 0,
    compare_price: product.compare_price || 0,
    image: product.main_image || product.image || "",
    inStock: (product.quantity || 0) > 0,
    category: product.category?.name || "New Arrival"
  };

  const isFavorite = isInWishlist(p.id);
  const discount = p.compare_price > p.price 
    ? Math.round(((p.compare_price - p.price) / p.compare_price) * 100) 
    : 0;

  const getImageUrl = () => {
    if (p.image?.startsWith("http")) return p.image;
    return `${import.meta.env.VITE_API_URL || "http://localhost:8000"}/storage/${p.image}`;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      className="group relative bg-white rounded-lg shadow-sm overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Container الصورة */}
      <div className="relative aspect-[3/4] overflow-hidden bg-[#fdfdfd] rounded-t-lg">
        <Link to={`/product/${p.id}`}>
          <motion.img
            src={getImageUrl()}
            alt={p.name}
            className="w-full h-full object-cover object-top transition-transform duration-700 ease-out"
            animate={{ scale: isHovered ? 1.08 : 1 }}
          />
        </Link>

        {/* Badges */}
        <div className="absolute top-3 right-3 flex flex-col gap-2">
          {discount > 0 && (
            <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-1 uppercase rounded-sm shadow-md">
              -{discount}%
            </span>
          )}
          {!p.inStock && (
            <span className="bg-gray-200 text-gray-500 text-[10px] font-bold px-2 py-1 uppercase rounded-sm border border-gray-300">
              Sold Out
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            isFavorite ? removeFromWishlist(p.id) : addToWishlist(p);
          }}
          className={`absolute top-3 left-3 p-2.5 rounded-full transition-all duration-300 shadow-sm
            ${isFavorite ? "bg-red-500 text-white" : "bg-white/90 backdrop-blur-sm text-gray-900 hover:bg-black hover:text-white"}`}
        >
          <FiHeart size={16} />
        </button>

        {/* Quick Actions */}
        <AnimatePresence>
          {isHovered && p.inStock && (
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 10, opacity: 0 }}
              className="absolute inset-x-4 bottom-4 flex gap-2"
            >
              <button
                onClick={() => addToCart(p, 1)}
                className="flex-1 bg-black text-white py-3 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 rounded-lg hover:bg-gray-800 transition-all"
              >
                <FiPlus /> إضافة للسلة
              </button>
              <Link 
                to={`/product/${p.id}`}
                className="w-12 bg-white text-black flex items-center justify-center border border-gray-200 rounded-lg hover:bg-gray-50 transition-all"
              >
                <FiEye />
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Product Details */}
      <div className="mt-4 flex flex-col items-center text-center px-2">
        <span className="text-[10px] text-gray-400 uppercase tracking-[0.2em] mb-1">
          {p.category}
        </span>
        <Link to={`/product/${p.id}`} className="group-hover:text-gray-600 transition-colors">
          <h3 className="text-sm font-medium text-gray-900 leading-tight line-clamp-1">
            {p.name}
          </h3>
        </Link>
        
        <div className="mt-2 flex items-center gap-2">
          <span className="text-sm font-bold text-gray-900">
             {p.price.toLocaleString()} ج.م
          </span>
          {p.compare_price > p.price && (
            <span className="text-xs text-gray-400 line-through decoration-red-400/50">
              {p.compare_price.toLocaleString()} ج.م
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;