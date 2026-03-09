import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiPlus, FiEdit, FiTrash2, FiSearch, FiImage } from 'react-icons/fi';
import Table from '../../../components/ui/Table';
import categoryService from '../../../services/categoryService';
import toast from 'react-hot-toast';

/**
 * صفحة إدارة أقسام الفاشون في لوحة التحكم
 */
const DashboardCategories = () => {
  const [search, setSearch] = useState('');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0,
  });

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchCategories(1);
    }, 500); // تأخير بسيط للبحث لتحسين الأداء

    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  const fetchCategories = async (page = 1) => {
    try {
      setLoading(true);
      setCurrentPage(page);
      const params = {
        search: search?.trim() || undefined,
        perPage: 10,
        page: page
      };

      const response = await categoryService.getCategories(params);
      if (response?.status) {
        setCategories(response.data?.data || []);
        setPagination({
          currentPage: response.data?.current_page || 1,
          totalPages: response.data?.last_page || 1,
          total: response.data?.total || 0,
        });
      }
    } catch (error) {
      toast.error('فشل تحميل تشكيلات الملابس');
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('هل تريد حذف هذا القسم؟ سيؤثر ذلك على عرض الملابس المرتبطة به.')) {
      try {
        const response = await categoryService.deleteCategory(id);
        if (response?.status) {
          toast.success('تم إزالة القسم بنجاح');
          fetchCategories(currentPage);
        }
      } catch (error) {
        toast.error('عذراً، لم يتم الحذف بنجاح');
      }
    }
  };

  // أعمدة الجدول بتصميم يناسب الفاشون
  const columns = [
    {
      key: 'image',
      title: 'الصورة',
      render: (item) => (
        <div className="w-12 h-16 bg-gray-100 rounded-md overflow-hidden border border-gray-100 shadow-sm">
          {item.image_url ? (
            <img 
              src={item.image_url} 
              alt={item.name} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300">
              <FiImage size={20} />
            </div>
          )}
        </div>
      )
    },
    {
      key: 'name',
      title: 'القسم / التشكيلة',
      render: (item) => (
        <div>
          <p className="font-bold text-gray-800">{item.name}</p>
          <p className="text-xs text-gray-400 font-mono">{item.slug}</p>
          {item.parent && (
            <span className="text-[10px] bg-gray-100 px-1 rounded text-gray-500">
              ينتمي لـ: {item.parent.name}
            </span>
          )}
        </div>
      )
    },
    {
      key: 'products_count',
      title: 'القطع المتوفرة',
      render: (item) => (
        <span className="font-medium text-gray-600">
          {item.products_count || 0} قطعة
        </span>
      )
    },
    {
      key: 'status',
      title: 'الحالة',
      render: (item) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          item.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
        }`}>
          {item.is_active ? 'معروض' : 'مخفي'}
        </span>
      )
    },
    {
      key: 'actions',
      title: 'التحكم',
      render: (item) => (
        <div className="flex gap-1">
          <Link
            to={`/dashboard/categories/edit/${item.id}`}
            className="p-2 text-gray-600 hover:bg-black hover:text-white rounded-full transition-all"
            title="تعديل"
          >
            <FiEdit size={16} />
          </Link>
          <button
            onClick={() => handleDelete(item.id)}
            className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-all"
            title="حذف"
          >
            <FiTrash2 size={16} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="p-8 bg-[#fafafa] min-h-screen" dir="rtl">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 mb-1">أقسام المتجر</h1>
          <p className="text-gray-500 text-sm">إدارة تصنيفات الملابس، الأحذية، والإكسسوارات</p>
        </div>

        <Link
          to="/dashboard/categories/add"
          className="flex items-center gap-2 bg-black text-white px-6 py-3 rounded-full hover:bg-gray-800 transition-all shadow-lg shadow-black/10"
        >
          <FiPlus strokeWidth={3} />
          <span className="font-bold">إضافة تشكيلة جديدة</span>
        </Link>
      </div>

      {/* Search & Filter */}
      <div className="bg-white p-2 rounded-2xl shadow-sm border border-gray-100 mb-6 flex items-center">
        <div className="relative flex-1">
          <FiSearch className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="ابحث عن تشكيلة (صيفي، شتوي، فساتين...)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pr-12 pl-4 py-3 bg-transparent outline-none text-gray-700"
          />
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <Table
          columns={columns}
          data={categories}
          loading={loading}
          emptyMessage="لا يوجد أقسام مضافة لهذا الموسم بعد"
        />
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center items-center mt-8 gap-3">
          <button 
            disabled={pagination.currentPage === 1}
            onClick={() => fetchCategories(pagination.currentPage - 1)}
            className="p-2 rounded-lg border hover:bg-gray-50 disabled:opacity-30"
          >
            السابق
          </button>
          
          <div className="flex gap-1">
            {[...Array(pagination.totalPages)].map((_, i) => (
              <button
                key={i + 1}
                onClick={() => fetchCategories(i + 1)}
                className={`w-10 h-10 rounded-xl font-bold transition-all ${
                  pagination.currentPage === i + 1
                    ? 'bg-black text-white'
                    : 'bg-white text-gray-400 hover:text-black'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          <button 
            disabled={pagination.currentPage === pagination.totalPages}
            onClick={() => fetchCategories(pagination.currentPage + 1)}
            className="p-2 rounded-lg border hover:bg-gray-50 disabled:opacity-30"
          >
            التالي
          </button>
        </div>
      )}
    </div>
  );
};

export default DashboardCategories;
