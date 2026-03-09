import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import categoryService from '../../services/categoryService';
import Loader from '../../components/common/Loader';
import { FaTshirt, FaShoppingBag, FaArrowLeft } from 'react-icons/fa';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

/**
 * صفحة عرض جميع الأقسام (ملابس وفاشون) - تصميم عصري متناسق مع مشروع الفاشون
 */
const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await categoryService.getInterfaceCategories({ per_page: 20 });

      if (response?.status) {
        let categoriesData = [];
        if (Array.isArray(response.data)) {
          categoriesData = response.data;
        } else if (response.data?.data && Array.isArray(response.data.data)) {
          categoriesData = response.data.data;
        } else {
          categoriesData = [];
        }
        setCategories(categoriesData);
      } else {
        setError('حدث خطأ أثناء تحميل الأقسام');
      }
    } catch (error) {
      console.error('خطأ في جلب الأقسام:', error);
      setError(error.response?.data?.message || 'حدث خطأ أثناء تحميل الأقسام');
      toast.error('فشل تحميل الأقسام');
    } finally {
      setLoading(false);
    }
  };

  const handleImageError = (e) => {
    e.target.src = 'https://via.placeholder.com/600x400/800080/FFD700?text=Fashion';
  };

  const getCategoryImage = (image) => {
    if (!image) return 'https://via.placeholder.com/600x400/800080/FFD700?text=Fashion';
    if (image.startsWith('http')) return image;
    return `${API_URL}/${image}`.replace(/([^:]\/)\/+/g, '$1');
  };

  if (loading) return <Loader text="جاري تحميل الأقسام..." />;

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
            onClick={fetchCategories}
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
          <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-yellow-400 rounded-2xl mx-auto mb-4 flex items-center justify-center">
            <FaTshirt className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">الأقسام</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            تصفحي تشكيلتنا من أحدث صيحات الموضة حسب الأقسام المختلفة
          </p>
        </div>

        {categories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((category) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -5 }}
                transition={{ duration: 0.3 }}
              >
                <Link
                  to={`/category/${category.id}`}
                  className="group relative bg-white rounded-2xl shadow-lg overflow-hidden block focus:outline-none focus:ring-2 focus:ring-purple-500 hover:shadow-xl transition-shadow"
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                      src={getCategoryImage(category.image)}
                      alt={category.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={handleImageError}
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <h3 className="text-2xl font-bold text-white mb-2">{category.name}</h3>
                      <p className="text-gray-200 mb-3">
                        {category.products_count?.toLocaleString('ar-EG') || 0} منتج
                      </p>
                      <div className="flex items-center text-white text-sm font-semibold group-hover:gap-2 transition-all">
                        <span>استكشفي الآن</span>
                        <FaArrowLeft className="mr-2 group-hover:mr-3 transition-all" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
            <FaShoppingBag className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <p className="text-xl text-gray-600">لا توجد أقسام حالياً</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Categories;