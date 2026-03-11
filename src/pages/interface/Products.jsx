// ProductsFashion.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductCard from '../../components/cards/ProductCard';
import Loader from '../../components/common/Loader';
import { 
  FaTimes, 
  FaChevronLeft, 
  FaChevronRight 
} from 'react-icons/fa';
import { BiFilterAlt } from 'react-icons/bi';
import productService from '../../services/productService';
import categoryService from '../../services/categoryService';
import toast from 'react-hot-toast';

const SORT_OPTIONS = [
  { value: 'newest', label: 'الأحدث' },
  { value: 'price_low', label: 'السعر: من الأقل للأعلى' },
  { value: 'price_high', label: 'السعر: من الأعلى للأقل' },
  { value: 'popular', label: 'الأكثر مبيعاً' },
  { value: 'rating', label: 'التقييم' }
];

const ProductsFashion = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ category: '', priceMin: '', priceMax: '', sort: 'newest' });
  const [showFilters, setShowFilters] = useState(false);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({ currentPage: 1, lastPage: 1, total: 0, perPage: 12 });

  useEffect(() => fetchCategories(), []);
  useEffect(() => fetchProducts(1), [filters]);

  const fetchProducts = async (page = 1) => {
    setLoading(true);
    try {
      const params = { per_page: pagination.perPage, page, sort: filters.sort };
      if (filters.category) params.category_id = filters.category;
      if (filters.priceMin) params.min_price = parseInt(filters.priceMin);
      if (filters.priceMax) params.max_price = parseInt(filters.priceMax);

      const response = await productService.getInterfaceProducts(params);
      if (response?.status) {
        setProducts(response.data?.data || []);
        setPagination({
          currentPage: response.data?.current_page || 1,
          lastPage: response.data?.last_page || 1,
          total: response.data?.total || 0,
          perPage: response.data?.per_page || 12
        });
      } else setProducts([]);
    } catch (error) {
      console.error('خطأ في جلب المنتجات:', error);
      toast.error(error.message || 'حدث خطأ أثناء تحميل المنتجات');
      setProducts([]);
    } finally { setLoading(false); }
  };

  const fetchCategories = async () => {
    try {
      const response = await categoryService.getInterfaceCategories({ per_page: 100 });
      if (response?.status) {
        const categoriesData = response.data?.data || response.data || [];
        setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      }
    } catch (error) { console.error('خطأ في جلب الأقسام:', error); }
  };

  const handleFilterChange = (e) => setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const clearFilters = () => setFilters({ category: '', priceMin: '', priceMax: '', sort: 'newest' });
  const handlePageChange = (page) => { if(page >= 1 && page <= pagination.lastPage){ fetchProducts(page); window.scrollTo({ top: 0, behavior: 'smooth' }); } };

  if (loading && products.length === 0) return <Loader text="جاري تحميل المنتجات..." />;

  return (
    <div className="min-h-screen py-12 bg-gradient-to-b from-pink-50 to-white" dir="rtl">
      <div className="container-custom">

        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-24 h-24 bg-gradient-to-br from-pink-500 to-pink-300 rounded-3xl mx-auto mb-4 flex items-center justify-center shadow-lg">
            <BiFilterAlt className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">تشكيلة الموضة</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            اكتشفي أفضل تشكيلات الفاشون من الملابس والاكسسوارات العصرية
          </p>
        </div>

        {/* Toggle filters for mobile */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="lg:hidden w-full mb-6 bg-gradient-to-l from-pink-500 to-pink-300 text-white px-6 py-4 rounded-xl font-semibold hover:from-pink-600 hover:to-pink-400 transition-all flex items-center justify-center gap-2"
        >
          <BiFilterAlt className="w-5 h-5" /> فلتر ومنتجات
        </button>

        <div className="flex flex-col lg:flex-row gap-8">

          {/* Filters */}
          <div className={`lg:w-1/4 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-pink-600 flex items-center gap-2">فلترة المنتجات</h2>
                <button onClick={clearFilters} className="text-sm text-pink-600 hover:text-pink-700">إعادة تعيين</button>
                <button onClick={() => setShowFilters(false)} className="lg:hidden text-gray-500 hover:text-gray-700"><FaTimes /></button>
              </div>

              {/* التصنيف */}
              <div className="mb-6">
                <h3 className="font-semibold mb-3">التصنيف</h3>
                <select name="category" value={filters.category} onChange={handleFilterChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 bg-white">
                  <option value="">جميع التصنيفات</option>
                  {categories.map((cat) => (<option key={cat.id} value={cat.id}>{cat.name}</option>))}
                </select>
              </div>

              {/* السعر */}
              <div className="mb-6">
                <h3 className="font-semibold mb-3">السعر (ج.م)</h3>
                <div className="flex gap-2">
                  <input type="number" name="priceMin" value={filters.priceMin} onChange={handleFilterChange} placeholder="من"
                    className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400" min="0" />
                  <input type="number" name="priceMax" value={filters.priceMax} onChange={handleFilterChange} placeholder="إلى"
                    className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400" min="0" />
                </div>
              </div>

              {/* الترتيب */}
              <div>
                <h3 className="font-semibold mb-3">الترتيب</h3>
                <select name="sort" value={filters.sort} onChange={handleFilterChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 bg-white">
                  {SORT_OPTIONS.map(option => (<option key={option.value} value={option.value}>{option.label}</option>))}
                </select>
              </div>
            </div>
          </div>

          {/* Products List */}
          <div className="lg:w-3/4">
            <div className="bg-white rounded-xl shadow-sm p-4 mb-6 flex items-center justify-between">
              <p className="text-gray-600">
                تم العثور على <span className="font-bold text-pink-600">{pagination.total.toLocaleString('ar-EG')}</span> منتج
              </p>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl shadow-lg p-4 animate-pulse">
                    <div className="aspect-square bg-gray-200 rounded-xl mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => <ProductCard key={product.id} product={product} />)}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-2xl shadow">
                <p className="text-xl text-gray-600 mb-4">لا توجد منتجات مطابقة</p>
                <button onClick={clearFilters} className="text-pink-600 hover:text-pink-700 font-semibold">إعادة تعيين الفلاتر</button>
              </div>
            )}

            {/* Pagination */}
            {pagination.lastPage > 1 && (
              <nav className="mt-8 flex items-center justify-center gap-2">
                <button onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                  className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-200 hover:border-pink-400 disabled:opacity-50">
                  <FaChevronRight />
                </button>

                {[...Array(Math.min(pagination.lastPage, 5))].map((_, index) => {
                  let pageNumber;
                  if (pagination.lastPage <= 5) pageNumber = index + 1;
                  else if (pagination.currentPage <= 3) pageNumber = index + 1;
                  else if (pagination.currentPage >= pagination.lastPage - 2) pageNumber = pagination.lastPage - 4 + index;
                  else pageNumber = pagination.currentPage - 2 + index;

                  return (
                    <button key={pageNumber} onClick={() => handlePageChange(pageNumber)}
                      className={`w-10 h-10 rounded-lg font-semibold transition-all ${
                        pagination.currentPage === pageNumber
                          ? 'bg-gradient-to-l from-pink-500 to-pink-300 text-white'
                          : 'bg-white hover:bg-gray-100 border border-gray-200 text-gray-700'
                      }`}>
                      {pageNumber}
                    </button>
                  );
                })}

                <button onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.lastPage}
                  className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-200 hover:border-pink-400 disabled:opacity-50">
                  <FaChevronLeft />
                </button>
              </nav>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductsFashion;