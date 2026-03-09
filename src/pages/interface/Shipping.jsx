import React, { useState, useEffect } from 'react';
import { FiTruck, FiPackage, FiClock, FiMapPin } from 'react-icons/fi';
import { Link } from 'react-router-dom'; 
import staticService from '../../services/staticService';
import Loader from '../../components/common/Loader';
import toast from 'react-hot-toast';

const DEFAULT_SHIPPING_POLICY = {
  methods: [
    { name: 'شحن عادي', description: 'توصيل خلال 3-5 أيام عمل', duration: '3-5 أيام', cost: 20 },
    { name: 'شحن سريع', description: 'توصيل خلال 1-2 يوم عمل', duration: '1-2 يوم', cost: 35 },
    { name: 'شحن مجاني', description: 'للطلبات فوق 2000 جنية مصري', duration: '3-5 أيام', cost: 0 }
  ],
  cities: ['الدقهلية', 'حلوان', 'مدينة نصر', 'اسكندرية', 'الفيوم', 'القليوبية', 'الجيزة', 'القاهرة'],
  notes: [
    'يتم الشحن عبر شركات شحن موثوقة',
    'سيتم إرسال رقم تتبع الشحنة بعد الشحن',
    'يمكنك تتبع شحنتك عبر موقعنا أو موقع شركة الشحن',
    'في حال وجود أي استفسار، يرجى التواصل مع فريق الدعم'
  ]
};

const ShippingFashion = () => {
  const [shippingPolicy, setShippingPolicy] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchShippingPolicy(); }, []);

  const fetchShippingPolicy = async () => {
    try {
      setLoading(true);
      const data = await staticService.getShippingPolicy();
      setShippingPolicy(data || DEFAULT_SHIPPING_POLICY);
    } catch (error) {
      console.error('خطأ في جلب سياسة الشحن:', error);
      toast.error('حدث خطأ في تحميل سياسة الشحن');
      setShippingPolicy(DEFAULT_SHIPPING_POLICY);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader text="جاري تحميل سياسة الشحن..." />;

  return (
    <div className="min-h-screen py-12 bg-gradient-to-b from-pink-50 to-white" dir="rtl">
      <div className="container-custom max-w-4xl">
        <h1 className="text-4xl font-bold text-pink-600 mb-8 text-center">سياسة الشحن والتوصيل</h1>

        <div className="bg-white rounded-3xl shadow-2xl p-8 space-y-10">

          {/* طرق الشحن */}
          <section>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-pink-500">
              <FiTruck className="w-6 h-6" /> طرق الشحن
            </h2>
            <div className="space-y-4">
              {shippingPolicy?.methods?.map((method, index) => (
                <div key={index} className="border-b border-gray-200 pb-4 last:border-0 rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow">
                  <h3 className="font-semibold mb-2 text-gray-800">{method.name}</h3>
                  <p className="text-gray-600">{method.description}</p>
                  <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-500">
                    <p><span className="font-medium">مدة التوصيل:</span> {method.duration}</p>
                    <p><span className="font-medium">التكلفة:</span> {method.cost === 0 ? <span className="text-green-600 font-semibold">مجاني</span> : <span>{method.cost} ج.م</span>}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* مناطق التوصيل */}
          <section>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-pink-500">
              <FiMapPin className="w-6 h-6" /> مناطق التوصيل
            </h2>
            <p className="text-gray-600 mb-4">نوفر خدمة التوصيل لجميع مدن جمهورية مصر العربية</p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-pink-50 p-4 rounded-xl shadow-sm">
                <h3 className="font-semibold mb-3 text-pink-600">المدن الرئيسية</h3>
                <div className="flex flex-wrap gap-2">
                  {shippingPolicy?.cities?.map((city, index) => (
                    <span key={index} className="bg-pink-100 text-pink-700 px-3 py-1 rounded-full text-sm">{city}</span>
                  ))}
                </div>
              </div>
              <div className="bg-pink-50 p-4 rounded-xl shadow-sm">
                <h3 className="font-semibold mb-3 text-pink-600">شحن لجميع المدن</h3>
                <p className="text-gray-600 text-sm">
                  نوفر خدمة الشحن لجميع مدن الجمهورية بما فيها المناطق النائية. قد تختلف مدة التوصيل حسب المنطقة.
                </p>
              </div>
            </div>
          </section>

          {/* وقت التوصيل */}
          <section>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-pink-500">
              <FiClock className="w-6 h-6" /> وقت التوصيل
            </h2>
            <div className="bg-pink-50 p-4 rounded-xl shadow-sm space-y-3">
              <p className="text-gray-700"><span className="font-semibold">أيام العمل:</span> من السبت إلى الخميس</p>
              <p className="text-gray-700"><span className="font-semibold">ساعات التوصيل:</span> من 9 صباحاً حتى 9 مساءً</p>
              <p className="text-gray-700"><span className="font-semibold">ملاحظة:</span> لا يوجد توصيل يوم الجمعة</p>
            </div>
          </section>

          {/* تتبع الشحنة */}
          <section>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-pink-500">
              <FiPackage className="w-6 h-6" /> تتبع الشحنة
            </h2>
            <div className="bg-pink-50 p-4 rounded-xl shadow-sm">
              <p className="text-gray-700 mb-4">
                بعد شحن الطلب، ستصلك رسالة نصية على رقم جوالك تحتوي على:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mr-4">
                <li>رقم تتبع الشحنة</li>
                <li>رابط لتتبع الشحنة</li>
                <li>تاريخ التوصيل المتوقع</li>
              </ul>
              <p className="text-gray-700 mt-4">
                يمكنك أيضاً تتبع شحنتك من خلال{' '}
                <Link to="/orders" className="text-pink-600 hover:underline font-semibold">
                  صفحة طلباتي
                </Link>
              </p>
            </div>
          </section>

          {/* ملاحظات مهمة */}
          <section className="bg-pink-50 p-6 rounded-2xl shadow-inner">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-pink-600">
              <FiTruck className="w-5 h-5" /> ملاحظات مهمة
            </h2>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mr-4">
              {shippingPolicy?.notes?.map((note, index) => (
                <li key={index}>{note}</li>
              ))}
              <li className="text-yellow-700 mt-2">
                في حالة وجود أي تأخير في الشحن، سيتم إشعارك عبر البريد الإلكتروني أو رسالة نصية.
              </li>
            </ul>
          </section>

          {/* استفسار إضافي */}
          <section className="border-t border-gray-200 pt-6">
            <h2 className="text-xl font-bold mb-4 text-pink-500">هل لديك استفسار؟</h2>
            <p className="text-gray-600">
              إذا كان لديك أي استفسار حول سياسة الشحن، يرجى التواصل مع فريق الدعم عبر{' '}
              <Link to="/contact" className="text-pink-600 hover:underline font-semibold">
                صفحة الاتصال بنا
              </Link>
            </p>
          </section>

        </div>
      </div>
    </div>
  );
};

export default ShippingFashion;