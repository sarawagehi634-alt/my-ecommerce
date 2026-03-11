import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import productService from '../../services/productService';
import Loader from '../../components/common/Loader';
import { FaArrowLeft, FaShoppingCart } from 'react-icons/fa';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const Products = () => {
  const { categoryId } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  useEffect(() => {
    fetchProducts();
  }, [categoryId]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await productService.getCategoryProducts(categoryId, { per_page: 20 });

      if (response?.status) {
        let productsData = [];
        if (Array.isArray(response.data)) productsData = response.data;
        else if (response.data?.data && Array.isArray(response.data.data)) productsData = response.data.data;
        else productsData = [];
        setProducts(productsData);
      } else {
        setError('حدث خطأ أثناء تحميل المنتجات');
      }
    } catch (err) {
      console.error('خطأ في جلب المنتجات:', err);
      setError(err.response?.data?.message || 'حدث خطأ أثناء تحميل المنتجات');
      toast.error('فشل تحميل المنتجات');
    } finally {
      setLoading(false);
    }
  };

  const getProductImage = (image) => {
    if (!image) return 'https://via.placeholder.com/400x400/800080/FFD700?text=Product';
    if (image.startsWith('http')) return image;
    return `${API_URL}/${image}`.replace(/([^:]\/)\/+/g, '$1');
  };

  const handleImageError = (e) => {
    e.target.src = 'https://via.placeholder.com/400x400/800080/FFD700?text=Product';
  };

  const formatPrice = (price) => {
    if (!price) return '0';
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    if (isNaN(numPrice)) return '0';
    return numPrice.toLocaleString('ar-EG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  if (loading) return <Loader text="جاري تحميل المنتجات..." />;

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center" dir="rtl">
        <div className="text-center bg-white p-8 rounded-2xl shadow-lg max-w-md">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-red-600 text-xl mb-4" role="alert">{error}</p>
          <button 
            onClick={fetchProducts}
            className="bg-gradient-to-l from-purple-600 to-yellow-400 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-yellow-500 transition-all"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 bg-gradient-to-b from-gray-50 to-white" dir="rtl">
      <div className="container-custom">
        <div className="text-center mb-12">
          <Link to="/categories" className="inline-flex items-center gap-2 text-purple-600 font-semibold mb-4 hover:underline">
            <FaArrowLeft /> العودة للأقسام
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">المنتجات</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            اكتشفي تشكيلتنا الرائعة من الملابس ضمن هذا القسم
          </p>
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {products.map((product) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -5 }}
                transition={{ duration: 0.3 }}
              >
                <Link
                  to={`/product/${product.id}`}
                  className="group relative bg-white rounded-2xl shadow-lg overflow-hidden block focus:outline-none focus:ring-2 focus:ring-purple-500 hover:shadow-xl transition-shadow"
                >
                  <div className="relative aspect-square overflow-hidden">
                    <img
                      src={getProductImage(product.image || product.main_image)}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={handleImageError}
                      loading="lazy"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{product.name}</h3>
                    <div className="flex items-center justify-between">
                      <span className="text-primary-600 font-bold text-lg">{formatPrice(product.price)} ج.م</span>
                      {product.compare_price && product.compare_price > product.price && (
                        <span className="text-gray-400 line-through text-sm">{formatPrice(product.compare_price)} ج.م</span>
                      )}
                    </div>
                    <button 
                      className="mt-3 w-full bg-gradient-to-l from-purple-600 to-yellow-400 text-white py-2 rounded-xl font-semibold flex items-center justify-center gap-2 hover:from-purple-700 hover:to-yellow-500 transition-all"
                    >
                      <FaShoppingCart /> أضف للسلة
                    </button>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
            <FaShoppingCart className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <p className="text-xl text-gray-600">لا توجد منتجات حالياً في هذا القسم</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;