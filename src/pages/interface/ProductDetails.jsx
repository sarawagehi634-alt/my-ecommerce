import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import Loader from '../../components/common/Loader';
import ProductCard from '../../components/cards/ProductCard';
import { 
  FaShoppingCart, FaHeart, FaMinus, FaPlus, FaTruck, FaShieldAlt, FaUndo, 
  FaStar, FaStarHalf, FaRegStar, FaCheckCircle, FaBox 
} from 'react-icons/fa';
import { MdVerified } from 'react-icons/md';
import toast from 'react-hot-toast';
import productService from '../../services/productService';

const ProductDetailsFashion = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  useEffect(() => { if (id) fetchProductDetails(); }, [id]);

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      const response = await productService.getInterfaceProduct(id);
      if (response?.status) {
        setProduct(response.data);

        if (response.data?.category_id) {
          const filters = { category_id: response.data.category_id, per_page: 4, page: 1 };
          const relatedResponse = await productService.getInterfaceProducts(filters);
          if (relatedResponse?.status) {
            const productsData = relatedResponse.data?.data || [];
            const filtered = productsData.filter(p => p.id !== response.data.id);
            setRelatedProducts(filtered.slice(0, 4));
          }
        }
      } else {
        toast.error('المنتج غير موجود');
        navigate('/products');
      }
    } catch (error) {
      console.error('خطأ في جلب المنتج:', error);
      toast.error(error.message || 'حدث خطأ في تحميل المنتج');
      navigate('/products');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity);
      toast.success('تمت إضافة المنتج إلى السلة', { icon: '🛒', duration: 3000 });
    }
  };

  const handleToggleWishlist = () => {
    if (!product) return;
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
      toast.success('تم إزالة المنتج من المفضلة', { icon: '❤️', duration: 3000 });
    } else {
      addToWishlist(product);
      toast.success('تمت إضافة المنتج إلى المفضلة', { icon: '❤️', duration: 3000 });
    }
  };

  const handleQuantityChange = (type) => {
    if (!product) return;
    if (type === 'increment' && quantity < (product.quantity || 10)) setQuantity(prev => prev + 1);
    else if (type === 'decrement' && quantity > 1) setQuantity(prev => prev - 1);
  };

  const renderStars = (rating = 0) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) stars.push(<FaStar key={i} className="text-yellow-400 w-5 h-5" />);
      else if (i === fullStars && hasHalfStar) stars.push(<FaStarHalf key={i} className="text-yellow-400 w-5 h-5" />);
      else stars.push(<FaRegStar key={i} className="text-gray-300 w-5 h-5" />);
    }
    return stars;
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return 'https://via.placeholder.com/600x600/fuchsia/ffffff?text=Fashion';
    if (imagePath.startsWith('http')) return imagePath;
    return `${API_URL}/${imagePath}`.replace(/([^:]\/)\/+/g, '$1');
  };

  if (loading) return <Loader text="جاري تحميل المنتج..." />;
  if (!product) return (
    <div className="min-h-screen flex items-center justify-center" dir="rtl">
      <div className="text-center">
        <FaBox className="w-20 h-20 mx-auto text-gray-300 mb-4" />
        <p className="text-xl text-gray-600 mb-4">المنتج غير موجود</p>
        <button onClick={() => navigate('/products')} className="text-pink-500 hover:text-pink-600 font-semibold px-4 py-2 rounded border border-pink-300">
          العودة إلى المنتجات
        </button>
      </div>
    </div>
  );

  const isFavorite = product ? isInWishlist(product.id) : false;

  let images = [];
  if (product.images && Array.isArray(product.images) && product.images.length > 0) images = product.images.map(img => img.url || img);
  else if (product.main_image) images = [product.main_image];
  else if (product.image) images = [product.image];

  return (
    <div className="min-h-screen py-12 bg-gradient-to-b from-pink-50 to-white" dir="rtl">
      <div className="container-custom">

        {/* تفاصيل المنتج */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 mb-12">
          <div className="grid lg:grid-cols-2 gap-12">

            {/* معرض الصور */}
            <div>
              <div className="mb-4 aspect-square rounded-2xl overflow-hidden bg-gray-100 border border-gray-200 hover:shadow-lg transition-shadow">
                <img
                  src={images.length > 0 ? getImageUrl(images[selectedImage]) : getImageUrl(product.main_image)}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  loading="eager"
                />
              </div>
              {images.length > 1 && (
                <div className="grid grid-cols-4 gap-4">
                  {images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`aspect-square rounded-lg overflow-hidden border-2 transition-all focus:outline-none focus:ring-2 focus:ring-pink-400 ${selectedImage === index ? 'border-pink-500' : 'border-transparent'}`}
                      aria-label={`عرض الصورة ${index + 1}`}
                    >
                      <img src={getImageUrl(img)} alt={`صورة ${index + 1}`} className="w-full h-full object-cover" loading="lazy" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* معلومات المنتج */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>

              {/* التقييم */}
              {product.rating !== undefined && (
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex gap-1" aria-label={`تقييم ${product.rating} من 5 نجوم`}>
                    {renderStars(product.rating)}
                  </div>
                  <span className="text-sm text-gray-600">({product.reviews_count?.toLocaleString('ar-EG') || 0} تقييم)</span>
                </div>
              )}

              {/* السعر */}
              <div className="mb-6 flex flex-wrap gap-3 items-center">
                <span className="text-4xl font-bold text-pink-500">{product.price?.toLocaleString('ar-EG')} ج.م</span>
                {product.compare_price && product.compare_price > product.price && (
                  <>
                    <span className="text-2xl text-gray-400 line-through">{product.compare_price?.toLocaleString('ar-EG')} ج.م</span>
                    <span className="bg-pink-500 text-white px-3 py-1 rounded-full text-sm">وفر {Math.round(((product.compare_price - product.price) / product.compare_price) * 100)}%</span>
                  </>
                )}
                <p className="text-sm text-gray-600 w-full">شامل الضريبة</p>
              </div>

              {/* الكمية */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-3">الكمية</h3>
                <div className="flex items-center gap-4">
                  <div className="flex items-center border-2 border-gray-200 rounded-lg">
                    <button onClick={() => handleQuantityChange('decrement')} disabled={quantity <= 1} className="px-4 py-3 text-gray-600 hover:bg-gray-100 transition-colors rounded-l-lg">
                      <FaMinus />
                    </button>
                    <span className="w-16 text-center font-semibold text-lg">{quantity}</span>
                    <button onClick={() => handleQuantityChange('increment')} disabled={quantity >= (product.quantity || 10)} className="px-4 py-3 text-gray-600 hover:bg-gray-100 transition-colors rounded-r-lg">
                      <FaPlus />
                    </button>
                  </div>
                  <span className="text-sm text-gray-600">{product.quantity || 10} قطعة متوفرة</span>
                </div>
              </div>

              {/* أزرار الإجراء */}
              <div className="flex gap-4 mb-8 flex-wrap">
                <button onClick={handleAddToCart} disabled={product.quantity === 0}
                  className="flex-1 bg-gradient-to-l from-pink-500 to-pink-300 text-white px-6 py-4 rounded-xl hover:from-pink-600 hover:to-pink-400 transition-all transform hover:scale-105 flex items-center justify-center gap-2 disabled:opacity-50">
                  <FaShoppingCart /> أضف إلى السلة
                </button>
                <button onClick={handleToggleWishlist}
                  className={`p-4 border-2 rounded-xl transition-all transform hover:scale-105 ${isFavorite ? 'border-pink-500 bg-pink-50 text-pink-500' : 'border-gray-200 hover:border-pink-500'}`}>
                  <FaHeart className="w-5 h-5" />
                </button>
              </div>

              {/* معلومات إضافية */}
              <div className="border-t border-gray-200 pt-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex items-center gap-3 p-4 bg-pink-50 rounded-xl">
                    <FaTruck className="w-6 h-6 text-pink-500" />
                    <div>
                      <h4 className="font-semibold text-gray-900">توصيل سريع</h4>
                      <p className="text-sm text-gray-600">خلال 2-3 أيام عمل</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-pink-50 rounded-xl">
                    <FaShieldAlt className="w-6 h-6 text-pink-500" />
                    <div>
                      <h4 className="font-semibold text-gray-900">منتج أصلي</h4>
                      <p className="text-sm text-gray-600">ضمان الجودة 100%</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-pink-50 rounded-xl">
                    <FaUndo className="w-6 h-6 text-pink-500" />
                    <div>
                      <h4 className="font-semibold text-gray-900">إرجاع مجاني</h4>
                      <p className="text-sm text-gray-600">خلال 14 يوم</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* منتجات مشابهة */}
        {relatedProducts.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-8 flex items-center gap-2 text-pink-600">
              <FaBox /> منتجات مشابهة
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((product) => <ProductCard key={product.id} product={product} />)}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default ProductDetailsFashion;