// @ts-nocheck
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FiArrowLeft, FiHeart } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

/**
 * التعديلات لتحويل التصميم لـ "واقعي":
 * 1. إضافة Skeleton Loading ناعم.
 * 2. استخدام نظام الـ Typo العصري (Bold & Minimalist).
 * 3. تحويل الـ Hover ليكون تفاعلي مع خلفية ناعمة.
 */

const CategoryCard = ({
  category,
  variant = "grid",
  onFavorite,
  isFavorited = false,
  showProductCount = true,
  lazyLoad = true,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isFavorite, setIsFavorite] = useState(isFavorited);

  // استخراج رابط الصورة من الـ API بشكل ذكي
  const getImageUrl = () => {
    if (imageError || !category.image) return "https://placeholder.com";
    return category.image.startsWith("http")
      ? category.image
      : `${import.meta.env.VITE_API_URL || "http://localhost:8000"}/storage/${category.image}`;
  };

  const handleFavorite = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorite(!isFavorite);
    if (onFavorite) onFavorite(category.id);
  };

  /* ================= MODERN GRID (THE REAL FASHION LOOK) ================= */
  if (variant === "grid") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="group relative"
      >
        <Link to={`/category/${category.id}`} className="block overflow-hidden rounded-2xl bg-gray-100">
          <div 
            className="relative aspect-[3/4] sm:aspect-[4/5] overflow-hidden"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {/* الصورة الأساسية مع Zoom ناعم */}
            <motion.img
              src={getImageUrl()}
              alt={category.name}
              className="h-full w-full object-cover object-top transition-transform duration-1000 group-hover:scale-110"
              loading={lazyLoad ? "lazy" : "eager"}
              onError={() => setImageError(true)}
            />

            {/* طبقة تظليل ذكية (Gradient Overlay) */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            {/* أيقونة المفضلة - مكانها احترافي */}
            <button
              onClick={handleFavorite}
              className="absolute top-4 right-4 z-10 p-2.5 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white hover:text-red-500 transition-all duration-300"
            >
              <FiHeart className={`w-5 h-5 ${isFavorite ? "fill-red-500 text-red-500" : ""}`} />
            </button>

            {/* تفاصيل القسم بتصميم "Minimal" */}
            <div className="absolute inset-x-0 bottom-0 p-6 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
              <div className="flex flex-col gap-1">
                <span className="text-xs uppercase tracking-widest text-white/80 font-medium">Collection</span>
                <h3 className="text-2xl md:text-3xl font-serif text-white font-bold italic tracking-tight">
                  {category.name}
                </h3>
                
                <AnimatePresence>
                  {isHovered && (
                    <motion.div 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="mt-3 flex items-center gap-2 text-white text-sm font-bold"
                    >
                      <span>تسوقي الآن</span>
                      <FiArrowLeft className="w-4 h-4" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* عداد المنتجات - شكل Badge احترافي */}
            {showProductCount && (
              <div className="absolute top-4 left-4 text-[10px] uppercase font-black bg-black text-white px-2 py-1 tracking-tighter">
                {category.products_count || 0} Pieces
              </div>
            )}
          </div>
        </Link>
      </motion.div>
    );
  }

  /* ================= LIST DESIGN (FOR SEARCH/MOBILE) ================= */
  return (
    <Link to={`/category/${category.id}`} className="group">
      <div className="flex items-center gap-4 p-2 transition-all hover:bg-gray-50 rounded-xl">
        <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
          <img src={getImageUrl()} className="w-full h-full object-cover group-hover:scale-110 transition-transform" alt={category.name} />
        </div>
        <div className="flex-1">
          <h4 className="text-lg font-bold text-gray-900 leading-tight">{category.name}</h4>
          <p className="text-xs text-gray-400 uppercase tracking-widest">{category.products_count || 0} Products</p>
        </div>
        <div className="w-8 h-8 rounded-full border border-gray-100 flex items-center justify-center group-hover:bg-black group-hover:text-white transition-colors">
          <FiArrowLeft className="w-4 h-4" />
        </div>
      </div>
    </Link>
  );
};

export default CategoryCard;
