import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FiSave,
  FiX,
  FiImage,
  FiFolder,
  FiLink
} from "react-icons/fi";

import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import categoryService from "../../../services/categoryService";
import toast from "react-hot-toast";

const EditCategory = () => {

  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);

  const [parentCategories, setParentCategories] = useState([]);

  const [imagePreview, setImagePreview] = useState(null);
  const [currentImage, setCurrentImage] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    note: "",
    category_id: "",
    image: null
  });

  /* ============================= */
  /* Fetch Category */
  /* ============================= */

  const fetchCategory = useCallback(async () => {

    try {

      const res = await categoryService.getCategory(id);

      if (res?.status || res?.data) {

        const cat = res.data;

        setFormData({
          name: cat?.name || "",
          slug: cat?.slug || "",
          note: cat?.note || "",
          category_id: cat?.category_id?.toString() || "",
          image: null
        });

        setCurrentImage(cat?.image || "");

      }

    } catch (err) {

      toast.error("فشل تحميل القسم");

    } finally {

      setFetchLoading(false);

    }

  }, [id]);


  /* ============================= */
  /* Fetch Parent Categories */
  /* ============================= */

  const fetchParentCategories = useCallback(async () => {

    try {

      const res = await categoryService.getCategories({ perPage: 100 });

      if (res?.status || res?.data) {

        const data = res?.data?.data || [];

        const filtered = data.filter(
          (cat) => cat.id !== Number(id)
        );

        setParentCategories(filtered);

      }

    } catch (err) {

      console.error(err);

    }

  }, [id]);


  useEffect(() => {

    fetchCategory();
    fetchParentCategories();

  }, [fetchCategory, fetchParentCategories]);


  /* ============================= */
  /* Generate Slug */
  /* ============================= */

  const generateSlug = (text) => {

    return text
      .toLowerCase()
      .trim()
      .replace(/[\s\W-]+/g, "-")
      .replace(/^-+|-+$/g, "");

  };


  /* ============================= */
  /* Handle Change */
  /* ============================= */

  const handleChange = (e) => {

    const { name, value } = e.target;

    if (name === "name") {

      setFormData((prev) => ({
        ...prev,
        name: value,
        slug: generateSlug(value)
      }));

    } else {

      setFormData((prev) => ({
        ...prev,
        [name]: value
      }));

    }

  };


  /* ============================= */
  /* Handle Image Upload */
  /* ============================= */

  const handleImageChange = (e) => {

    const file = e.target.files[0];

    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("الصورة يجب أن تكون أقل من 2MB");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      image: file
    }));

    const reader = new FileReader();

    reader.onloadend = () => {
      setImagePreview(reader.result);
    };

    reader.readAsDataURL(file);

  };


  /* ============================= */
  /* Submit */
  /* ============================= */

  const handleSubmit = async (e) => {

    e.preventDefault();

    if (!formData.name) {
      toast.error("اسم القسم مطلوب");
      return;
    }

    setLoading(true);

    try {

      const data = new FormData();

      data.append("_method", "PUT");
      data.append("name", formData.name);
      data.append("slug", formData.slug);

      if (formData.note) {
        data.append("note", formData.note);
      }

      if (formData.category_id) {
        data.append("category_id", formData.category_id);
      }

      if (formData.image) {
        data.append("image", formData.image);
      }

      const res = await categoryService.updateCategory(id, data);

      if (res?.status) {

        toast.success("تم تحديث القسم بنجاح");

        navigate("/dashboard/categories");

      }

    } catch (err) {

      toast.error("حدث خطأ أثناء التحديث");

    } finally {

      setLoading(false);

    }

  };


  /* ============================= */
  /* Loading Skeleton */
  /* ============================= */

  if (fetchLoading) {

    return (

      <div className="p-6 space-y-4">
        <div className="h-10 bg-gray-200 animate-pulse rounded"></div>
        <div className="h-64 bg-gray-200 animate-pulse rounded"></div>
        <div className="h-40 bg-gray-200 animate-pulse rounded"></div>
      </div>

    );

  }


  /* ============================= */
  /* UI */
  /* ============================= */

  return (

    <div className="min-h-screen bg-gray-50 p-8" dir="rtl">

      <div className="max-w-4xl mx-auto">

        {/* Header */}

        <div className="bg-white shadow rounded-xl p-6 mb-6 flex justify-between items-center">

          <div>

            <h1 className="text-xl font-bold">
              تعديل القسم
            </h1>

            <p className="text-gray-500 text-sm">
              تعديل بيانات القسم
            </p>

          </div>

          <div className="flex gap-3">

            <Button
              variant="outline"
              onClick={() => navigate("/dashboard/categories")}
              leftIcon={<FiX />}
            >
              إلغاء
            </Button>

            <Button
              type="submit"
              form="category-form"
              isLoading={loading}
              leftIcon={<FiSave />}
            >
              حفظ
            </Button>

          </div>

        </div>


        {/* Form */}

        <form
          id="category-form"
          onSubmit={handleSubmit}
          className="space-y-6"
        >

          {/* Name */}

          <div className="bg-white p-6 rounded-xl shadow">

            <Input
              label="اسم القسم"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="مثال: ملابس نسائية"
              leftIcon={<FiFolder />}
            />

            <div className="mt-4">

              <Input
                label="Slug"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                placeholder="women-fashion"
                leftIcon={<FiLink />}
              />

            </div>

          </div>


          {/* Parent */}

          <div className="bg-white p-6 rounded-xl shadow">

            <label className="text-sm font-medium mb-2 block">
              القسم الرئيسي
            </label>

            <select
              name="category_id"
              value={formData.category_id}
              onChange={handleChange}
              className="w-full border rounded-lg p-3"
            >

              <option value="">
                بدون
              </option>

              {parentCategories.map((cat) => (

                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>

              ))}

            </select>

          </div>


          {/* Image */}

          <div className="bg-white p-6 rounded-xl shadow">

            <h3 className="font-semibold mb-4 flex gap-2 items-center">
              <FiImage /> صورة القسم
            </h3>

            {currentImage && !imagePreview && (

              <img
                src={currentImage}
                className="w-40 h-40 object-cover rounded-lg mb-4"
                alt=""
              />

            )}

            {imagePreview && (

              <img
                src={imagePreview}
                className="w-40 h-40 object-cover rounded-lg mb-4"
                alt=""
              />

            )}

            <input
              type="file"
              onChange={handleImageChange}
            />

          </div>

        </form>

      </div>

    </div>

  );

};

export default EditCategory;