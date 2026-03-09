import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaSave, FaTimes, FaTrashAlt } from "react-icons/fa";
import productService from "../../../services/productService";
import categoryService from "../../../services/categoryService";
import { useAuth } from "../../../context/AuthContext";
import toast from "react-hot-toast";

const AddProduct = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [validationErrors, setValidationErrors] = useState({});

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    price: "",
    quantity: "",
    category_id: "",
    is_active: true,
  });

  useEffect(() => {
    if (!isAdmin) {
      toast.error("ليس لديك صلاحية للوصول إلى هذه الصفحة");
      navigate("/dashboard");
    }
    fetchCategories();
  }, [isAdmin, navigate]);

  const fetchCategories = async () => {
    try {
      const res = await categoryService.getCategories({ per_page: 100 });
      if (res?.status) setCategories(res.data?.data || res.data || []);
    } catch (err) {
      toast.error("فشل تحميل الأقسام");
    }
  };

  const generateSlug = (name) =>
    name
      .toLowerCase()
      .trim()
      .replace(/[^\u0600-\u06FFa-zA-Z0-9\s]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
      ...(name === "name" && { slug: generateSlug(value) }),
    }));

    if (validationErrors[name]) {
      setValidationErrors((prev) => {
        const errors = { ...prev };
        delete errors[name];
        return errors;
      });
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (selectedImages.length + files.length > 5) {
      toast.error("يمكنك إضافة 5 صور كحد أقصى");
      return;
    }

    files.forEach((file) => {
      if (!file.type.startsWith("image/")) return toast.error(`${file.name} ليس صورة`);
      if (file.size > 2 * 1024 * 1024) return toast.error(`${file.name} حجمها كبير`);

      setSelectedImages((prev) => [...prev, file]);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreviews((prev) => [...prev, reader.result]);
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = "اسم المنتج مطلوب";
    if (!formData.price || parseFloat(formData.price) <= 0) errors.price = "السعر مطلوب وأكبر من 0";
    if (!formData.quantity || parseInt(formData.quantity) < 0) errors.quantity = "الكمية مطلوبة";
    if (!formData.category_id) errors.category_id = "اختر القسم المناسب";
    if (selectedImages.length === 0) errors.images = "أضف صورة واحدة على الأقل";
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach((key) => {
        const value = formData[key];
        if (value !== null && value !== undefined && value !== "")
          formDataToSend.append(key, typeof value === "boolean" ? (value ? "1" : "0") : value);
      });
      selectedImages.forEach((file, index) => formDataToSend.append(`images[${index}]`, file));

      const res = await productService.createProduct(formDataToSend);
      if (res?.status) {
        toast.success("تم إضافة المنتج بنجاح");
        navigate("/dashboard/products");
      } else toast.error(res?.message || "فشل إضافة المنتج");
    } catch (err) {
      toast.error(err.message || "حدث خطأ أثناء الإضافة");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8" dir="rtl">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">إضافة منتج فاشون جديد</h1>
          <div className="flex gap-3">
            <button
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100"
              onClick={() => navigate("/dashboard/products")}
            >
              <FaTimes /> إلغاء
            </button>
            <button
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-l from-primary-600 to-skin-600 text-white hover:from-primary-700 hover:to-skin-700"
              onClick={handleSubmit}
              disabled={loading}
            >
              <FaSave /> حفظ المنتج
            </button>
          </div>
        </div>

        {/* الأخطاء */}
        {Object.keys(validationErrors).length > 0 && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <ul className="list-disc list-inside text-red-600">
              {Object.entries(validationErrors).map(([field, error]) => (
                <li key={field}>{Array.isArray(error) ? error.join(", ") : error}</li>
              ))}
            </ul>
          </div>
        )}

        <form className="space-y-6">
          {/* الاسم والسعر والكمية والقسم */}
          <div className="bg-white shadow rounded-xl p-6 space-y-4">
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="اسم المنتج (مثلاً: تيشيرت رجالي)"
              className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              placeholder="السعر (جنيه)"
              className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              placeholder="الكمية المتوفرة"
              className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <select
              name="category_id"
              value={formData.category_id}
              onChange={handleChange}
              className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">اختر القسم</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* الوصف */}
          <div className="bg-white shadow rounded-xl p-6 space-y-4">
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="وصف المنتج (مثلاً: خامة قطنية عالية الجودة)"
              rows={4}
              className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            />
          </div>

          {/* الصور */}
          <div className="bg-white shadow rounded-xl p-6 space-y-4">
            <label className="block text-gray-700 mb-2">صور المنتج (حد أقصى 5)</label>
            <input type="file" multiple accept="image/*" onChange={handleImageChange} />
            <div className="grid grid-cols-3 gap-4 mt-4">
              {imagePreviews.map((img, idx) => (
                <div key={idx} className="relative">
                  <img src={img} alt={`preview ${idx}`} className="w-full h-24 object-cover rounded" />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                  >
                    <FaTrashAlt className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;