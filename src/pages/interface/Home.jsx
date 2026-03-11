// HomeFashion.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import ProductCard from '../../components/cards/ProductCard';
import CategoryCard from '../../components/cards/CategoryCard';
import Loader from '../../components/common/Loader';
import { FiArrowLeft } from 'react-icons/fi';
import { FaStar, FaShoppingBag, FaTruck, FaHeart } from 'react-icons/fa';
import homeService from '../../services/homeService';
import toast from 'react-hot-toast';

const fadeInUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5 } };
const staggerContainer = { animate: { transition: { staggerChildren: 0.1 } } };

const FEATURES = [
  { icon: FaShoppingBag, title: 'أحدث صيحات الموضة', desc: 'مجموعة منتقاة بعناية لتواكب الموضة العالمية' },
  { icon: FaHeart, title: 'مصممة بعناية', desc: 'تصاميم فريدة وأنيقة لكل المناسبات' },
  { icon: FaStar, title: 'أعلى جودة', desc: 'خامات ممتازة لضمان الراحة والمتانة' },
  { icon: FaTruck, title: 'توصيل سريع', desc: 'خدمة توصيل لجميع المدن خلال 48 ساعة' }
];

const HomeFashion = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchHomeData(); }, []);

  const fetchHomeData = async () => {
    try {
      setLoading(true);
      const [featured, best, newArrivalsData, cats] = await Promise.all([
        homeService.getFeaturedProducts(6),
        homeService.getBestSellers(3),
        homeService.getNewArrivals(3),
        homeService.getHomeCategories(6)
      ]);
      setFeaturedProducts(featured || []);
      setBestSellers(best || []);
      setNewArrivals(newArrivalsData || []);
      setCategories(cats || []);
    } catch (error) {
      console.error('خطأ في جلب بيانات الصفحة الرئيسية:', error);
      toast.error('حدث خطأ في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader text="جاري تحميل الصفحة..." />;

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50" dir="rtl">

      {/* Hero Section */}
      <section className="relative bg-gradient-to-l from-purple-600 via-pink-500 to-pink-400 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10" aria-hidden="true">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-white rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white rounded-full blur-3xl"></div>
        </div>
        <div className="container-custom relative z-10 py-16 md:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                اكتشفي <span className="text-yellow-300">أحدث صيحات الملابس</span>
              </h1>
              <p className="text-xl mb-8 text-gray-100 leading-relaxed">
                تشكيلة واسعة من الملابس العصرية للنساء، مختارة بعناية لتتناسب مع جميع المناسبات.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/products" className="bg-white text-purple-600 px-8 py-4 rounded-xl font-bold text-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center gap-2">
                  تسوقي الآن <FiArrowLeft aria-hidden="true" />
                </Link>
                <Link to="/about" className="border-2 border-white text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white hover:text-purple-600 transition-all duration-300">
                  تعرفي علينا
                </Link>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.2 }} className="relative">
              <img
                src="https://images.unsplash.com/photo-1541099649105-f69ad21f3246?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                alt="مجموعة ملابس نسائية عصرية"
                className="rounded-3xl shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-500"
                loading="eager"
              />
              <div className="absolute -bottom-6 -left-6 bg-white text-gray-900 p-4 rounded-2xl shadow-xl">
                <p className="font-bold text-lg">توصيل مجاني</p>
                <p className="text-sm text-gray-600">للطلبات فوق 500 ر.س</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* المميزات */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8" variants={staggerContainer} initial="initial" whileInView="animate" viewport={{ once: true, amount: 0.3 }}>
            {FEATURES.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div key={index} variants={fadeInUp} className="text-center group">
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 w-24 h-24 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                    <Icon className="w-12 h-12 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                  <p className="text-gray-600">{item.desc}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* الأقسام */}
      {categories.length > 0 && (
        <section className="py-16 bg-purple-50/30">
          <div className="container-custom">
            <motion.div className="flex justify-between items-center mb-12" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-2">تسوقي حسب الأقسام</h2>
                <p className="text-gray-600">استعرضي ملابسنا المتنوعة حسب النوع والمناسبة</p>
              </div>
              <Link to="/categories" className="text-purple-600 hover:text-purple-700 font-semibold flex items-center gap-2 group">
                عرض الكل <FiArrowLeft className="group-hover:-translate-x-1 transition-transform"/>
              </Link>
            </motion.div>
            <motion.div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6" variants={staggerContainer} initial="initial" whileInView="animate" viewport={{ once: true, amount: 0.3 }}>
              {categories.map(category => (
                <motion.div key={category.id} variants={fadeInUp}>
                  <CategoryCard category={category} variant="grid" />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      )}

      {/* المنتجات المميزة */}
      {featuredProducts.length > 0 && (
        <section className="py-16 bg-white">
          <div className="container-custom">
            <motion.div className="flex justify-between items-center mb-12" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-2">منتجات مميزة</h2>
                <p className="text-gray-600">أفضل الملابس الأكثر طلباً</p>
              </div>
              <Link to="/products" className="text-purple-600 hover:text-purple-700 font-semibold flex items-center gap-2 group">
                عرض الكل <FiArrowLeft className="group-hover:-translate-x-1 transition-transform"/>
              </Link>
            </motion.div>
            <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" variants={staggerContainer} initial="initial" whileInView="animate" viewport={{ once: true, amount: 0.3 }}>
              {featuredProducts.map(product => (
                <motion.div key={product.id} variants={fadeInUp}>
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      )}

      {/* الأكثر مبيعاً */}
      {bestSellers.length > 0 && (
        <section className="py-16 bg-purple-50/20">
          <div className="container-custom">
            <motion.div className="text-center mb-12" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <h2 className="text-3xl md:text-4xl font-bold mb-2">الأكثر مبيعاً</h2>
              <p className="text-gray-600">ملابس نالت إعجاب آلاف النساء</p>
            </motion.div>
            <div className="grid lg:grid-cols-3 gap-6">
              {bestSellers.map((product, index) => (
                <motion.div key={product.id} initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.2 }}>
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* أحدث المنتجات */}
      {newArrivals.length > 0 && (
        <section className="py-16 bg-white">
          <div className="container-custom">
            <motion.div className="text-center mb-12" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <h2 className="text-3xl md:text-4xl font-bold mb-2">أحدث المنتجات</h2>
              <p className="text-gray-600">تعرفي على أحدث إضافاتنا من الملابس</p>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {newArrivals.map((product, index) => (
                <motion.div key={product.id} initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.2 }}>
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* آراء العملاء */}
      <section className="py-16 bg-purple-50/30">
        <div className="container-custom">
          <motion.div className="text-center mb-12" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl md:text-4xl font-bold mb-2">آراء العملاء</h2>
            <p className="text-gray-600">آلاف النساء جربن ملابسنا وأعجبن بها</p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6">
            {/* يمكن لاحقاً إضافة مراجعات العملاء من API */}
          </div>
        </div>
      </section>

    </div>
  );
};

export default HomeFashion;