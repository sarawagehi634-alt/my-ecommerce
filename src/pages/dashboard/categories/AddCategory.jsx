import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiX, FiUpload, FiTag, FiSettings } from 'react-icons/fi';
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
      return;
    }

    fetchParentCategories();

  }, [isAdmin, navigate]);

  const fetchParentCategories = async () => {
    try {

      const response = await categoryService.getParentCategories();

      const data =
        response?.data?.data ||
        response?.data ||
        [];

      setParentCategories(Array.isArray(data) ? data : []);

    } catch (error) {
      console.error('Parent categories error', error);
    }
  };

  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w-\u0621-\u064A]+/g, '');
  };

  const handleChange = (e) => {

    const { name, value, type, checked } = e.target;

    if (name === 'name') {

      setFormData(prev => ({
        ...prev,
        name: value,
        slug: generateSlug(value)
      }));

    } else {

      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));

    }

  };

  const handleImageChange = (e) => {

    const file = e.target.files[0];

    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error('الصورة يجب أن تكون أقل من 2MB');
      return;
    }

    setFormData(prev => ({
      ...prev,
      image: file
    }));

    const preview = URL.createObjectURL(file);
    setImagePreview(preview);

  };

  const handleSubmit = async (e) => {

    e.preventDefault();

    if (!formData.name) {
      toast.error('اسم القسم مطلوب');
      return;
    }

    setLoading(true);

    try {

      const data = new FormData();

      Object.keys(formData).forEach(key => {

        if (formData[key] !== null && formData[key] !== '') {
          data.append(key, formData[key]);
        }

      });

      await categoryService.createCategory(data);

      toast.success('تم إنشاء القسم بنجاح ✨');

      navigate('/dashboard/categories');

    } catch (error) {

      toast.error('حدث خطأ أثناء الحفظ');

    } finally {

      setLoading(false);

    }

  };

  return (
    <div className="min-h-screen bg-[#fcfcfc] py-10" dir="rtl">

      <div className="container mx-auto px-4 max-w-5xl">

        <div className="flex justify-between items-center mb-10 border-b pb-6">

          <div>
            <h1 className="text-4xl font-extrabold text-gray-800">إضافة قسم جديد</h1>
            <p className="text-gray-500 mt-2">تنظيم تصنيفات المنتجات</p>
          </div>

          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <FiX size={24} />
          </button>

        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          <div className="lg:col-span-2 space-y-6">

            <div className="bg-white p-8 rounded-3xl shadow-sm border">

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                <Input
                  label="اسم القسم"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />

                <Input
                  label="Slug"
                  name="slug"
                  value={formData.slug}
                  onChange={handleChange}
                  icon={<FiTag />}
                />

                <div className="col-span-2">

                  <label className="block text-sm font-bold mb-2">
                    وصف القسم
                  </label>

                  <textarea
                    name="description"
                    className="w-full p-4 bg-gray-50 rounded-2xl"
                    onChange={handleChange}
                  />

                </div>

              </div>

            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border">

              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <FiSettings /> إعدادات
              </h3>

              <div className="grid grid-cols-2 gap-6">

                <div>

                  <label className="text-sm text-gray-500">
                    القسم الرئيسي
                  </label>

                  <select
                    name="parent_id"
                    onChange={handleChange}
                    className="w-full p-3 bg-gray-50 rounded-xl"
                  >

                    <option value="">
                      قسم رئيسي
                    </option>

                    {parentCategories.map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}

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

          <div className="space-y-6">

            <div className="bg-white p-6 rounded-3xl shadow-sm border">

              <label className="block text-sm font-bold mb-4">
                صورة القسم
              </label>

              <div
                className="relative h-64 rounded-2xl border-2 border-dashed flex items-center justify-center cursor-pointer"
                onClick={() => document.getElementById('fileInput').click()}
              >

                {imagePreview ? (
                  <img
                    src={imagePreview}
                    className="w-full h-full object-cover"
                    alt=""
                  />
                ) : (
                  <>
                    <FiUpload size={30} className="text-gray-300" />
                  </>
                )}

                <input
                  id="fileInput"
                  type="file"
                  hidden
                  onChange={handleImageChange}
                  accept="image/*"
                />

              </div>

            </div>

            <div className="bg-black p-6 rounded-3xl">

              <label className="flex items-center gap-3 cursor-pointer mb-6">

                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleChange}
                  className="accent-white"
                />

                <span className="text-white">
                  نشر القسم
                </span>

              </label>

              <Button
                type="submit"
                isLoading={loading}
                className="w-full bg-white text-black py-4 rounded-2xl"
              >
                حفظ
              </Button>

            </div>

          </div>

        </form>

      </div>

    </div>
  );
};

export default AddCategory;