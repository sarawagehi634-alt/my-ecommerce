import React from 'react';
import { Link } from 'react-router-dom';
import { FiHeart, FiEye, FiShoppingCart, FiStar } from 'react-icons/fi';
import { useWishlist } from '../../context/WishlistContext';

/**
 * كارت منتج احترافي للفاشون
 */

const ProductCard = ({ product }) => {

  const { toggleWishlist, wishlist } = useWishlist();

  const isInWishlist = wishlist.some(item => item.id === product.id);

  const image =
    product?.image ||
    'https://via.placeholder.com/400x500?text=Fashion+Product';

  return (
    <div className="bg-white rounded-3xl shadow-md overflow-hidden relative group transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">

      {/* صورة المنتج */}
      <Link to={`/product/${product.id}`} className="block overflow-hidden">
        <img
          src={image}
          alt={product.name}
          className="w-full h-72 object-cover transition-transform duration-500 group-hover:scale-110"
        />
      </Link>

      {/* Badges */}
      <div className="absolute top-3 left-3 flex flex-col gap-2">

        {product.discount && (
          <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow">
            خصم {product.discount}%
          </span>
        )}

        {product.isNew && (
          <span className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow">
            جديد
          </span>
        )}

      </div>

      {/* أزرار جانبية */}
      <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">

        {/* زر المفضلة */}
        <button
          onClick={() => toggleWishlist(product)}
          className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow hover:bg-primary-50 transition"
        >
          <FiHeart
            className={`text-lg ${
              isInWishlist ? 'text-red-500 scale-110' : 'text-gray-400'
            }`}
          />
        </button>

        {/* زر عرض المنتج */}
        <Link
          to={`/product/${product.id}`}
          className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow hover:bg-primary-50 transition"
        >
          <FiEye className="text-gray-500 text-lg" />
        </Link>

      </div>

      {/* زر Add To Cart يظهر عند hover */}
      <div className="absolute bottom-28 left-0 right-0 px-4 opacity-0 group-hover:opacity-100 transition-all duration-300">

        <button className="w-full bg-black text-white py-2 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-800 transition">

          <FiShoppingCart />

          إضافة للسلة

        </button>

      </div>

      {/* تفاصيل المنتج */}
      <div className="p-4 space-y-2">

        {/* اسم المنتج */}
        <h3 className="text-gray-900 font-semibold text-lg truncate">
          {product.name}
        </h3>

        {/* التقييم */}
        <div className="flex items-center gap-1 text-yellow-400 text-sm">

          {[...Array(5)].map((_, i) => (
            <FiStar key={i} />
          ))}

          <span className="text-gray-500 text-xs ml-2">
            ({product.reviews || 0})
          </span>

        </div>

        {/* السعر */}
        <div className="flex items-center gap-2">

          {product.discount ? (
            <>
              <span className="text-gray-400 line-through text-sm">
                {product.oldPrice} ج.م
              </span>

              <span className="text-primary-600 font-bold text-lg">
                {product.price} ج.م
              </span>
            </>
          ) : (
            <span className="text-gray-900 font-bold text-lg">
              {product.price} ج.م
            </span>
          )}

        </div>

        {/* وصف المنتج */}
        {product.shortDescription && (
          <p className="text-gray-500 text-sm line-clamp-2">
            {product.shortDescription}
          </p>
        )}

      </div>

    </div>
  );
};

export default ProductCard;