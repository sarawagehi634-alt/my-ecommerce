import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiSave, FiX, FiTrash2, FiUpload, FiImage } from 'react-icons/fi';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import productService from '../../../services/productService';
import categoryService from '../../../services/categoryService';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [currentMainImage, setCurrentMainImage] = useState('');
  const [currentImages, setCurrentImages] = useState([]);
  const [newMainImagePreview, setNewMainImagePreview] = useState(null);
  const [newImagePreviews, setNewImagePreviews] = useState([]);

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    price: 0,
    compare_price: '',
    quantity: 0,
    description: '',
    features: '',
    details: '',
    category_id: '',
    main_image: null,
    images: []
  });

  useEffect(() => {
    if (!id) return;
    fetchProduct();
    fetchCategories();
  }, [id]);

  useEffect(() => {
    return () => {
      if (newMainImagePreview) URL.revokeObjectURL(newMainImagePreview);
      newImagePreviews.forEach(url => URL.revokeObjectURL(url));
    };
  }, [newMainImagePreview, newImagePreviews]);

  const fetchProduct = async () => {
    setFetchLoading(true);
    try {
      const response = await productService.getProduct(id);
      if (response?.status) {
        const product = response.data;
        setFormData({
          name: product.name || '',
          sku: product.sku || '',
          price: product.price || 0,
          compare_price: product.compare_price || '',
          quantity: product.quantity || 0,
          description: product.description || '',
          features: product.features || '',
          details: product.details || '',
          category_id: product.category_id?.toString() || '',
          main_image: null,
          images: []
        });
        setCurrentMainImage(product.main_image || '');
        setCurrentImages(product.images?.map(img => img.url) || []);
      }
    } catch (error) {
      console.error('خطأ في جلب المنتج:', error);
      toast.error('حدث خطأ أثناء جلب بيانات المنتج');
      navigate('/dashboard/products');
    } finally {
      setFetchLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await categoryService.getCategories({ perPage: 100 });
      if (response?.status) setCategories(response.data?.data || []);
    } catch (error) {
      console.error('خطأ في جلب الأقسام:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'number' ? (value === '' ? '' : Number(value)) : value }));
  };

  const handleMainImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) return toast.error('حجم الصورة يجب ألا يتجاوز 2 ميجابايت');
    if (!file.type.startsWith('image/')) return toast.error('الرجاء اختيار صورة صالحة');
    setFormData(prev => ({ ...prev, main_image: file }));
    setNewMainImagePreview(URL.createObjectURL(file));
  };

  const handleImagesChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    if (formData.images.length + files.length > 5) return toast.error('يمكنك إضافة 5 صور كحد أقصى');

    const validFiles = files.filter(file => {
      if (file.size > 2 * 1024 * 1024) { toast.error(`حجم الصورة ${file.name} كبير`); return false; }
      if (!file.type.startsWith('image/')) { toast.error(`الملف ${file.name} ليس صورة`); return false; }
      return true;
    });

    if (!validFiles.length) return;
    setFormData(prev => ({ ...prev, images: [...prev.images, ...validFiles] }));
    setNewImagePreviews(prev => [...prev, ...validFiles.map(f => URL.createObjectURL(f))]);
  };

  const removeNewImage = (index) => {
    setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
    URL.revokeObjectURL(newImagePreviews[index]);
    setNewImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const removeNewMainImage = () => {
    setFormData(prev => ({ ...prev, main_image: null }));
    if (newMainImagePreview) {
      URL.revokeObjectURL(newMainImagePreview);
      setNewMainImagePreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return toast.error('اسم المنتج مطلوب');
    if (!formData.price || formData.price <= 0) return toast.error('السعر يجب أن يكون أكبر من 0');
    if (!formData.category_id) return toast.error('يرجى اختيار قسم للمنتج');

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('_method', 'PUT');
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null && key !== 'images' && key !== 'main_image') fd.append(key, value);
      });
      if (formData.main_image) fd.append('main_image', formData.main_image);
      formData.images.forEach((img, i) => fd.append(`images[${i}]`, img));

      const response = await productService.updateProduct(id, fd);
      if (response?.status) {
        toast.success('تم تحديث المنتج بنجاح');
        navigate('/dashboard/products');
      }
    } catch (error) {
      console.error('خطأ في تحديث المنتج:', error);
      if (error.response?.data?.errors) Object.values(error.response.data.errors).flat().forEach(msg => toast.error(msg));
      else toast.error(error.message || 'حدث خطأ أثناء تحديث المنتج');
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (path) => path?.startsWith('http') ? path : `${API_URL}/${path}`;

  if (fetchLoading) return (
    <div className="flex justify-center items-center h-64">
      <div className="relative">
        <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
        <span className="sr-only">جاري تحميل بيانات المنتج...</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8" dir="rtl">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">تعديل المنتج الفاشون</h1>
            <p className="text-gray-600">قم بتعديل بيانات المنتج حسب الحاجة</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => navigate('/dashboard/products')} leftIcon={<FiX />}>إلغاء</Button>
            <Button type="submit" form="product-form" isLoading={loading} leftIcon={<FiSave />}>حفظ التعديلات</Button>
          </div>
        </div>

        <form id="product-form" onSubmit={handleSubmit} encType="multipart/form-data" className="space-y-6" noValidate>
          {/* المعلومات الأساسية */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-l from-primary-600 to-skin-600 px-6 py-4">
              <h2 className="text-xl font-bold text-white">المعلومات الأساسية</h2>
            </div>
            <div className="p-6 grid md:grid-cols-2 gap-6">
              <Input label="اسم المنتج" name="name" value={formData.name} onChange={handleChange} required placeholder="مثال: تيشيرت رجالي" />
              <Input label="SKU" name="sku" value={formData.sku} onChange={handleChange} placeholder="PRD-001" />
              <Input label="السعر" type="number" name="price" value={formData.price} onChange={handleChange} required min="0" step="0.01" />
              <Input label="سعر المقارنة" type="number" name="compare_price" value={formData.compare_price} onChange={handleChange} min="0" step="0.01" />
              <Input label="الكمية" type="number" name="quantity" value={formData.quantity} onChange={handleChange} required min="0" step="1" />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">القسم *</label>
                <select name="category_id" value={formData.category_id} onChange={handleChange} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all bg-white" required>
                  <option value="">اختر القسم</option>
                  {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* الوصف والمميزات */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-l from-primary-600 to-skin-600 px-6 py-4">
              <h2 className="text-xl font-bold text-white">الوصف والمميزات</h2>
            </div>
            <div className="p-6 space-y-6">
              {['description', 'features', 'details'].map(field => (
                <div key={field}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{field === 'description' ? 'الوصف' : field === 'features' ? 'المميزات' : 'التفاصيل الإضافية'}</label>
                  <textarea name={field} value={formData[field]} onChange={handleChange} rows={4} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all resize-none" placeholder={`أدخل ${field}`} />
                </div>
              ))}
            </div>
          </div>

          {/* الصور */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-l from-primary-600 to-skin-600 px-6 py-4">
              <h2 className="text-xl font-bold text-white">صور المنتج</h2>
            </div>
            <div className="p-6 space-y-6">
              {/* الصورة الرئيسية */}
              {currentMainImage && !newMainImagePreview && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">الصورة الرئيسية الحالية</label>
                  <img src={getImageUrl(currentMainImage)} alt="الرئيسية" className="w-32 h-32 object-cover rounded-lg border-2 border-gray-200" />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{newMainImagePreview ? 'الصورة الرئيسية الجديدة' : 'تغيير الصورة الرئيسية'}</label>
                <div className={`border-2 border-dashed rounded-xl p-6 text-center ${newMainImagePreview ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-primary-500 hover:bg-gray-50'}`}>
                  {!newMainImagePreview ? (
                    <>
                      <FiUpload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                      <p className="text-gray-600 mb-2">اختر صورة جديدة إذا أردت تغيير الصورة الرئيسية</p>
                      <input type="file" accept="image/*" onChange={handleMainImageChange} className="hidden" id="main-image" />
                      <label htmlFor="main-image" className="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold cursor-pointer hover:bg-primary-700">اختيار صورة جديدة</label>
                    </>
                  ) : (
                    <div className="relative inline-block">
                      <img src={newMainImagePreview} alt="جديدة" className="max-h-64 rounded-lg shadow-lg" />
                      <button type="button" onClick={removeNewMainImage} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600">
                        <FiTrash2 className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* الصور الإضافية */}
              {currentImages.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">الصور الإضافية الحالية</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {currentImages.map((img, index) => (
                      <div key={index} className="relative group">
                        <img src={getImageUrl(img)} alt={`صورة ${index + 1}`} className="w-full h-24 object-cover rounded-lg" onError={(e) => { e.target.style.display = 'none'; }} />
                        <button
                          type="button"
                          onClick={async () => {
                            if (!window.confirm('هل أنت متأكد من حذف هذه الصورة؟')) return;
                            try {
                              await productService.deleteProductImage(id, img);
                              toast.success('تم حذف الصورة بنجاح');
                              setCurrentImages(prev => prev.filter((_, i) => i !== index));
                            } catch (error) {
                              console.error('خطأ في حذف الصورة:', error);
                              toast.error('حدث خطأ أثناء حذف الصورة');
                            }
                          }}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 hover:bg-red-600"
                          aria-label={`حذف الصورة ${index + 1}`}
                        >
                          <FiTrash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* إضافة صور جديدة */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">إضافة صور جديدة (اختياري - حتى 5 صور)</label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-primary-500 hover:bg-gray-50">
                  <FiImage className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <input type="file" accept="image/*" multiple onChange={handleImagesChange} className="hidden" id="additional-images" disabled={formData.images.length >= 5} />
                  <label htmlFor="additional-images" className={`inline-block px-6 py-3 rounded-lg font-semibold cursor-pointer ${formData.images.length >= 5 ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary-600 text-white hover:bg-primary-700'}`}>اختيار صور</label>

                  {newImagePreviews.length > 0 && (
                    <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {newImagePreviews.map((preview, index) => (
                        <div key={index} className="relative group">
                          <img src={preview} alt={`جديدة ${index + 1}`} className="w-full h-24 object-cover rounded-lg" />
                          <button type="button" onClick={() => removeNewImage(index)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 hover:bg-red-600">
                            <FiTrash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProduct;