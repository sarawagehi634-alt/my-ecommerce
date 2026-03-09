import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSave, FiX, FiUpload, FiTag, FiLayers, FiEye, FiSettings } from 'react-icons/fi';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import categoryService from '../../../services/categoryService';
import { useAuth } from '../../../context/AuthContext';
import toast from 'react-hot-toast';

const AddCategory = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [parentCategories, setParentCategories] = useState([]); 
  const [imagePreview, setImagePreview] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    parent_id: '',
    image: null,
    is_active: true,
    sort_order: 0
  });

  useEffect(() => {
    if (!isAdmin) {
      toast.error('صلاحية المدير مطلوبة');
      navigate('/dashboard');
    }
    fetchParentCategories();
  }, [isAdmin]);

  const fetchParentCategories = async () => {
    try {
      const response = await categoryService.getParentCategories();
      // تأكد من استلام مصفوفة الأقسام الكبرى (مثل: رجالي، حريمي، أحذية)
      setParentCategories(response?.data?.data || response?.data || []);
    } catch (error) {
      console.error("Error fetching parents");
    }
  };

  const generateSlug = (name) => {
    return name.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w-\u0621-\u064A]+/g, '');
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === 'name') {
      setFormData(prev => ({ ...prev, name: value, slug: generateSlug(value) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, image: file }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const data = new FormData();
    Object.keys(formData).forEach(key => {
      if (formData[key] !== null) data.append(key, formData[key]);
    });

    try {
      await categoryService.createCategory(data);
      toast.success('تم إنشاء قسم الموضة بنجاح ✨');
      navigate('/dashboard/categories');
    } catch (error) {
      toast.error('حدث خطأ في الحفظ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfcfc] py-10" dir="rtl">
      <div className="container mx-auto px-4 max-w-5xl">
        
        {/* Header - Fashion Style */}
        <div className="flex justify-between items-center mb-10 border-b pb-6">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-800 tracking-tight">إضافة خط موضة جديد</h1>
            <p className="text-gray-500 mt-2">قم بتنظيم تشكيلات الملابس (Collections) الخاصة بك</p>
          </div>
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <FiX size={24} className="text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Info Card */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="اسم القسم (مثلاً: فساتين سهرة، شتوي 2024)"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
                <Input
                  label="الرابط (Slug)"
                  name="slug"
                  value={formData.slug}
                  onChange={handleChange}
                  icon={<FiTag />}
                />
                <div className="col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-2">وصف التشكيلة</label>
                  <textarea
                    name="description"
                    className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-black min-h-[120px]"
                    placeholder="اكتب نبذة عن هذا القسم لجذب الزبائن..."
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* Settings Card */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
               <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                 <FiSettings /> إعدادات الظهور
               </h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm text-gray-500 mb-2">القسم الرئيسي</label>
                    <select 
                      name="parent_id" 
                      onChange={handleChange}
                      className="w-full p-3 bg-gray-50 rounded-xl border-none ring-1 ring-gray-200"
                    >
                      <option value="">هذا قسم رئيسي (مثل: نساء)</option>
                      {parentCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <Input
                    label="ترتيب العرض"
                    type="number"
                    name="sort_order"
                    value={formData.sort_order}
                    onChange={handleChange}
                  />
               </div>
            </div>
          </div>

          {/* Media & Action Card */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
              <label className="block text-sm font-bold text-gray-700 mb-4">صورة الغلاف (Cover Photo)</label>
              <div 
                className="relative h-64 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center overflow-hidden hover:border-black transition-all cursor-pointer bg-gray-50"
                onClick={() => document.getElementById('fileInput').click()}
              >
                {imagePreview ? (
                  <img src={imagePreview} className="w-full h-full object-cover" alt="Fashion Preview" />
                ) : (
                  <>
                    <FiUpload size={30} className="text-gray-300 mb-2" />
                    <span className="text-xs text-gray-400 text-center px-4">يفضل استخدام صور احترافية للموديل</span>
                  </>
                )}
                <input id="fileInput" type="file" hidden onChange={handleImageChange} accept="image/*" />
              </div>
            </div>

            <div className="bg-black p-6 rounded-3xl shadow-lg">
              <label className="flex items-center gap-3 cursor-pointer mb-6">
                <input 
                  type="checkbox" 
                  name="is_active" 
                  checked={formData.is_active} 
                  onChange={handleChange}
                  className="w-5 h-5 rounded-full accent-white" 
                />
                <span className="text-white font-medium">نشر القسم الآن</span>
              </label>
              <Button 
                type="submit" 
                isLoading={loading} 
                className="w-full bg-white text-black hover:bg-gray-100 py-4 rounded-2xl font-bold"
              >
                حفظ البيانات
              </Button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
};

export default AddCategory;
