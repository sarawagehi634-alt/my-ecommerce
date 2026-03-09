import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ProductCard from '../../components/cards/ProductCard';
import Loader from '../../components/common/Loader';
import {
  FaArrowLeft, FaTh, FaList, FaSlidersH, FaTimes, FaFilter,
  FaChevronDown, FaChevronLeft, FaChevronRight, FaStar, FaStarHalf, FaRegStar
} from 'react-icons/fa';
import { BiSort } from 'react-icons/bi';
import categoryService from '../../services/categoryService';
import productService from '../../services/productService';
import toast from 'react-hot-toast';

const SORT_OPTIONS = [
  { value: 'newest', label: 'الأحدث' },
  { value: 'price_low', label: 'السعر: من الأقل إلى الأعلى' },
  { value: 'price_high', label: 'السعر: من الأعلى إلى الأقل' },
  { value: 'popular', label: 'الأكثر مبيعاً' },
  { value: 'rating', label: 'التقييم' }
];

const CategoryPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filters, setFilters] = useState({
    sort: 'newest',
    priceRange: { min: 0, max: 10000 },
    brands: [],
    inStock: false,
    onSale: false,
    subcategory: ''
  });

  const [priceLimits, setPriceLimits] = useState({ min: 0, max: 10000 });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [viewMode, setViewMode] = useState('grid');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [availableBrands, setAvailableBrands] = useState([]);
  const [perPage] = useState(12);

  useEffect(() => {
    if (id) {
      fetchCategoryData();
      fetchProducts();
    }
  }, [id]);

  useEffect(() => {
    applyFilters();
  }, [products, filters]);

  const fetchCategoryData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await categoryService.getInterfaceCategory(id);
      if (response?.status) {
        setCategory(response.data);
        if (response.data.subcategories) setSubcategories(response.data.subcategories);
      } else setError('القسم غير موجود');
    } catch (err) {
      console.error(err);
      setError(err.message || 'حدث خطأ في تحميل القسم');
      toast.error('حدث خطأ في تحميل القسم');
    }
  };

  const fetchProducts = async () => {
    try {
      const params = { category_id: id, per_page: 50, sort: filters.sort };
      const response = await productService.getInterfaceProducts(params);
      if (response?.status) {
        const productsData = response.data?.data || [];
        setProducts(productsData);
        setFilteredProducts(productsData);
        setTotalProducts(response.data?.total || 0);
        const prices = productsData.map(p => p.price).filter(Boolean);
        if (prices.length > 0) {
          const min = Math.min(...prices), max = Math.max(...prices);
          setPriceLimits({ min, max });
          setFilters(prev => ({ ...prev, priceRange: { min, max } }));
        }
        setAvailableBrands([...new Set(productsData.map(p => p.brand).filter(Boolean))]);
        setTotalPages(Math.ceil(productsData.length / perPage));
      }
    } catch (err) {
      console.error(err);
      toast.error('حدث خطأ في تحميل المنتجات');
    } finally { setLoading(false); }
  };

  const sortProducts = (items) => {
    const sorted = [...items];
    switch (filters.sort) {
      case 'price_low': return sorted.sort((a,b)=> (a.price||0)-(b.price||0));
      case 'price_high': return sorted.sort((a,b)=> (b.price||0)-(a.price||0));
      case 'rating': return sorted.sort((a,b)=> (b.rating||0)-(a.rating||0));
      case 'popular': return sorted.sort((a,b)=> (b.sold_count||0)-(a.sold_count||0));
      default: return sorted.sort((a,b)=> new Date(b.created_at)-new Date(a.created_at));
    }
  };

  const applyFilters = () => {
    let filtered = [...products];
    filtered = filtered.filter(p => (p.price||0) >= filters.priceRange.min && (p.price||0) <= filters.priceRange.max);
    if (filters.brands.length) filtered = filtered.filter(p => p.brand && filters.brands.includes(p.brand));
    if (filters.inStock) filtered = filtered.filter(p => p.quantity > 0);
    if (filters.onSale) filtered = filtered.filter(p => p.compare_price && p.compare_price > p.price);
    if (filters.subcategory) filtered = filtered.filter(p => p.subcategory_id === parseInt(filters.subcategory));
    filtered = sortProducts(filtered);
    setFilteredProducts(filtered);
    setTotalPages(Math.ceil(filtered.length / perPage));
    setCurrentPage(1);
  };

  const toggleBrand = (brand) => {
    setFilters(prev => ({
      ...prev,
      brands: prev.brands.includes(brand) ? prev.brands.filter(b => b!==brand) : [...prev.brands, brand]
    }));
  };

  const resetFilters = () => {
    setFilters({
      sort: 'newest',
      priceRange: { min: priceLimits.min, max: priceLimits.max },
      brands: [],
      inStock: false,
      onSale: false,
      subcategory: ''
    });
  };

  const handlePageChange = (page) => { setCurrentPage(page); window.scrollTo({ top:0, behavior:'smooth' }); };

  if (loading) return <Loader text="جاري تحميل المنتجات..." />;

  if (error) return (
    <div className="min-h-[60vh] flex items-center justify-center" dir="rtl">
      <div className="text-center bg-white p-8 rounded-2xl shadow-lg max-w-md">
        <p className="text-red-600 text-xl mb-4" role="alert">{error}</p>
        <button onClick={()=>navigate('/categories')} className="bg-gradient-to-l from-primary-600 to-skin-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-primary-700 hover:to-skin-700 transition-all">
          العودة للأقسام
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8" dir="rtl">
      <div className="container-custom">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-600 mb-6">
          <Link to="/" className="hover:text-primary-600 transition-colors">الرئيسية</Link>
          <FaArrowLeft className="w-3 h-3"/>
          <Link to="/categories" className="hover:text-primary-600 transition-colors">الأقسام</Link>
          <FaArrowLeft className="w-3 h-3"/>
          <span className="text-primary-600 font-semibold">{category?.name}</span>
        </nav>

        {/* عنوان القسم */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h1 className="text-3xl font-bold mb-2">{category?.name}</h1>
          <p className="text-gray-600 mb-2">{category?.description || 'جميع منتجات هذا القسم'}</p>
          <p className="text-sm text-gray-500">{filteredProducts.length} من أصل {totalProducts} منتج</p>
        </div>

        <div className="flex gap-8">
          {/* فلاتر جانبية */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-lg flex items-center gap-2"><FaFilter className="text-primary-600"/> تصفية النتائج</h3>
                <button onClick={resetFilters} className="text-sm text-primary-600 hover:text-primary-700">إعادة تعيين</button>
              </div>
              {/* فلتر السعر */}
              <div className="mb-6">
                <h4 className="font-semibold mb-4">السعر (ج.م)</h4>
                <div className="flex items-center gap-2 mb-2">
                  <input type="number" value={filters.priceRange.min} onChange={e=>setFilters(prev=>({...prev, priceRange:{...prev.priceRange,min:Number(e.target.value)}}))} className="w-24 px-3 py-2 border border-gray-200 rounded-lg" placeholder="من"/>
                  <span>-</span>
                  <input type="number" value={filters.priceRange.max} onChange={e=>setFilters(prev=>({...prev, priceRange:{...prev.priceRange,max:Number(e.target.value)}}))} className="w-24 px-3 py-2 border border-gray-200 rounded-lg" placeholder="إلى"/>
                </div>
                <input type="range" min={priceLimits.min} max={priceLimits.max} value={filters.priceRange.max} onChange={e=>setFilters(prev=>({...prev, priceRange:{...prev.priceRange,max:Number(e.target.value)}}))} className="w-full"/>
              </div>

              {/* الماركات */}
              {availableBrands.length>0 && (
                <div className="mb-6">
                  <h4 className="font-semibold mb-4">الماركات</h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {availableBrands.map(b=>(
                      <label key={b} className="flex items-center gap-2 cursor-pointer p-1 hover:bg-gray-50 rounded">
                        <input type="checkbox" checked={filters.brands.includes(b)} onChange={()=>toggleBrand(b)} className="rounded border-gray-300 text-primary-600"/>
                        <span>{b}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* خيارات إضافية */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={filters.inStock} onChange={e=>setFilters(prev=>({...prev,inStock:e.target.checked}))} className="rounded border-gray-300 text-primary-600"/> متوفر فقط</label>
                <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={filters.onSale} onChange={e=>setFilters(prev=>({...prev,onSale:e.target.checked}))} className="rounded border-gray-300 text-primary-600"/> عروض وتخفيضات</label>
              </div>
            </div>
          </aside>

          {/* المنتجات */}
          <main className="flex-1">
            <div className={`grid ${viewMode==='grid'?'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6':'grid-cols-1 gap-4'}`}>
              {filteredProducts.length>0 ? filteredProducts.slice((currentPage-1)*perPage,currentPage*perPage).map(p=><ProductCard key={p.id} product={p}/>) : <p className="text-center text-gray-500 py-12">لا توجد منتجات</p>}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default CategoryPage;