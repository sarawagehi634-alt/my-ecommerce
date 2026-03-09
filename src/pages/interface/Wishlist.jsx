import React from 'react';
import { Link } from 'react-router-dom';
import { FiHeart, FiEye } from 'react-icons/fi';
import { useWishlist } from '../../context/WishlistContext';

/**
 * كارت منتج احترافي للفاشون
 */
const ProductCard = ({ product }) => {
  const { toggleWishlist, wishlist } = useWishlist();
  const isInWishlist = wishlist.some(item => item.id === product.id);

  return (
    <div className="bg-white rounded-3xl shadow-md overflow-hidden relative group transition-transform transform hover:scale-105 hover:shadow-xl">
      
      {/* صورة المنتج */}
      <Link to={`/product/${product.id}`} className="block overflow-hidden">
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-110"
        />
      </Link>

      {/* خصم */}
      {product.discount && (
        <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
          خصم {product.discount}%
        </span>
      )}

      {/* أزرار سريعة */}
      <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all">
        <button 
          onClick={() => toggleWishlist(product)}
          className={`w-10 h-10 bg-white rounded-full flex items-center justify-center shadow hover:bg-primary-50 transition-all`}
          aria-label="إضافة إلى المفضلة"
        >
          <FiHeart className={`text-lg ${isInWishlist ? 'text-red-500' : 'text-gray-400'}`} />
        </button>
        <Link 
          to={`/product/${product.id}`}
          className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow hover:bg-primary-50 transition-all"
          aria-label="عرض سريع"
        >
          <FiEye className="text-gray-500 text-lg" />
        </Link>
      </div>

      {/* تفاصيل المنتج */}
      <div className="p-4 space-y-2">
        <h3 className="text-gray-900 font-semibold text-lg truncate">{product.name}</h3>
        <div className="flex items-center gap-2">
          {product.discount ? (
            <>
              <span className="text-gray-400 line-through text-sm">{product.oldPrice} ج.م</span>
              <span className="text-primary-600 font-bold">{product.price} ج.م</span>
            </>
          ) : (
            <span className="text-gray-900 font-bold">{product.price} ج.م</span>
          )}
        </div>
        <p className="text-gray-500 text-sm truncate">{product.shortDescription}</p>
      </div>
    </div>
  );
};

export default ProductCard;