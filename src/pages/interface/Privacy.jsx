// PrivacyFashion.jsx
import React, { useState, useEffect } from 'react';
import { FiShield, FiLock, FiEye, FiDatabase, FiMail } from 'react-icons/fi';
import staticService from '../../services/staticService';
import Loader from '../../components/common/Loader';
import toast from 'react-hot-toast';

/**
 * صفحة سياسة الخصوصية لموقع الفاشون
 */
const PrivacyFashion = () => {
  const [privacyContent, setPrivacyContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState('20 فبراير 2026');

  useEffect(() => {
    fetchPrivacyPolicy();
  }, []);

  const fetchPrivacyPolicy = async () => {
    try {
      setLoading(true);
      const data = await staticService.getPrivacyPolicy();
      setPrivacyContent(data || '');
    } catch (error) {
      console.error('خطأ في جلب سياسة الخصوصية:', error);
      toast.error('حدث خطأ في تحميل سياسة الخصوصية');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader text="جاري تحميل سياسة الخصوصية..." />;

  return (
    <div className="min-h-screen py-12 bg-pink-50" dir="rtl">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* عنوان الصفحة */}
        <div className="text-center mb-12">
          <div className="w-24 h-24 bg-gradient-to-br from-pink-500 to-pink-300 rounded-3xl mx-auto mb-4 flex items-center justify-center shadow-lg">
            <FiShield className="w-12 h-12 text-white" aria-hidden="true" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">سياسة الخصوصية</h1>
          <p className="text-lg text-gray-600">آخر تحديث: {lastUpdated}</p>
        </div>

        {/* المحتوى الرئيسي */}
        {privacyContent ? (
          <div
            className="bg-white rounded-3xl shadow-xl p-8 prose prose-pink prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: privacyContent }}
          />
        ) : (
          <div className="bg-white rounded-3xl shadow-xl p-8 space-y-10">
            {/* مقدمة */}
            <section className="border-b border-gray-200 pb-6">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 text-pink-600">
                <FiEye aria-hidden="true" />
                مقدمة
              </h2>
              <p className="text-gray-700 leading-relaxed">
                نحن في <span className="font-bold text-pink-600">Soo Style Fashion</span> نلتزم بحماية خصوصيتك وأمان بياناتك الشخصية. 
                توضح سياسة الخصوصية هذه كيفية جمع واستخدام وحماية المعلومات عند استخدام موقعنا الإلكتروني وخدماتنا.
              </p>
            </section>

            {/* المعلومات التي نجمعها */}
            <section className="border-b border-gray-200 pb-6">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 text-pink-600">
                <FiDatabase aria-hidden="true" />
                المعلومات التي نجمعها
              </h2>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mr-4">
                <li>الاسم الكامل</li>
                <li>البريد الإلكتروني</li>
                <li>رقم الجوال</li>
                <li>عنوان الشحن</li>
                <li>تاريخ الميلاد (اختياري)</li>
                <li>معلومات الدفع (مشفر بالكامل)</li>
                <li>سجل المشتريات وطرق الدفع المفضلة</li>
                <li>معلومات تلقائية (IP، المتصفح، الصفحات، الوقت على الموقع)</li>
              </ul>
            </section>

            {/* استخدام المعلومات */}
            <section className="border-b border-gray-200 pb-6">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 text-pink-600">
                <FiLock aria-hidden="true" />
                كيفية استخدام معلوماتك
              </h2>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mr-4">
                <li>معالجة طلباتك وتوصيل منتجات الموضة المميزة</li>
                <li>تحسين خدمات الموقع وتجربة التسوق</li>
                <li>إرسال تحديثات حول حالة الطلبات</li>
                <li>عروض وتخفيضات حصرية (بموافقتك)</li>
                <li>الرد على استفسارات الدعم</li>
                <li>حماية الموقع من الاحتيال</li>
              </ul>
            </section>

            {/* حماية البيانات */}
            <section className="border-b border-gray-200 pb-6">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 text-pink-600">
                <FiShield aria-hidden="true" />
                حماية البيانات
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                نتخذ إجراءات أمنية صارمة لحماية معلوماتك الشخصية، مثل:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mr-4">
                <li>تشفير البيانات باستخدام SSL/TLS</li>
                <li>الوصول المقيد للمعلومات الشخصية</li>
                <li>مراجعة أمنية دورية للأنظمة</li>
                <li>الامتثال لمعايير PCI DSS للمدفوعات</li>
              </ul>
            </section>

            {/* التواصل معنا */}
            <section className="border-b border-gray-200 pb-6">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 text-pink-600">
                <FiMail aria-hidden="true" />
                التواصل معنا
              </h2>
              <div className="bg-pink-50 p-4 rounded-xl space-y-2">
                <p><span className="font-semibold">البريد الإلكتروني:</span> privacy@soostyle.com</p>
                <p><span className="font-semibold">الهاتف:</span> 012-345-6789</p>
                <p><span className="font-semibold">العنوان:</span> القاهرة - شارع الموضة - مصر</p>
              </div>
            </section>

            {/* الموافقة */}
            <div className="bg-pink-100 p-6 rounded-2xl mt-8 text-center">
              <p className="text-gray-800 font-medium">
                باستخدامك لموقعنا، فإنك توافق على سياسة الخصوصية وشروط الاستخدام الخاصة بـ 
                <span className="font-bold text-pink-600"> Soo Style Fashion</span>.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PrivacyFashion;