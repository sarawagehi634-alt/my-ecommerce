import React, { useState, useEffect } from 'react';
import { FiTruck, FiPackage, FiClock, FiMapPin } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import staticService from '../../services/staticService';
import Loader from '../../components/common/Loader';
import toast from 'react-hot-toast';

/**
 * سياسة الشحن الافتراضية في حالة عدم وجود بيانات من API
 */
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

/**
 * صفحة سياسة الشحن والتوصيل
 */
const Shipping = () => {

  const [shippingPolicy, setShippingPolicy] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchShippingPolicy();
  }, []);

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

  if (loading) {
    return <Loader text="جاري تحميل سياسة الشحن..." />;
  }

  const policy = shippingPolicy || DEFAULT_SHIPPING_POLICY;

  return (

    <div className="min-h-screen py-12 bg-gray-50" dir="rtl">

      <div className="container-custom max-w-5xl">

        <h1 className="text-4xl font-bold text-gray-900 mb-12 text-center">
          سياسة الشحن والتوصيل
        </h1>

        <div className="bg-white rounded-3xl shadow-xl p-8 space-y-12">

          {/* طرق الشحن */}

          <section>

            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <FiTruck className="text-primary-600" />
              طرق الشحن
            </h2>

            <div className="grid md:grid-cols-3 gap-6">

              {policy.methods.map((method, index) => (

                <div
                  key={index}
                  className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                >

                  <h3 className="font-semibold text-lg mb-2 text-gray-800">
                    {method.name}
                  </h3>

                  <p className="text-gray-600 mb-4">
                    {method.description}
                  </p>

                  <div className="flex flex-wrap gap-4 text-sm text-gray-500">

                    <p>
                      <span className="font-medium">مدة التوصيل:</span>
                      {' '} {method.duration}
                    </p>

                    <p>

                      <span className="font-medium">التكلفة:</span>{' '}

                      {method.cost === 0
                        ? <span className="text-green-600 font-semibold">مجاني</span>
                        : <span>{method.cost} ج.م</span>
                      }

                    </p>

                  </div>

                </div>

              ))}

            </div>

          </section>


          {/* مناطق التوصيل */}

          <section>

            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <FiMapPin className="text-primary-600" />
              مناطق التوصيل
            </h2>

            <p className="text-gray-600 mb-6">
              نوفر خدمة التوصيل لجميع مدن جمهورية مصر العربية
            </p>

            <div className="grid md:grid-cols-2 gap-6">

              <div className="bg-gray-50 p-6 rounded-2xl shadow-sm">

                <h3 className="font-semibold mb-3 text-gray-800">
                  المدن الرئيسية
                </h3>

                <div className="flex flex-wrap gap-2">

                  {policy.cities.map((city, index) => (

                    <span
                      key={index}
                      className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm"
                    >
                      {city}
                    </span>

                  ))}

                </div>

              </div>

              <div className="bg-gray-50 p-6 rounded-2xl shadow-sm">

                <h3 className="font-semibold mb-3 text-gray-800">
                  شحن لجميع المدن
                </h3>

                <p className="text-gray-600 text-sm">
                  نوفر خدمة الشحن لجميع مدن الجمهورية بما فيها المناطق النائية.
                  قد تختلف مدة التوصيل حسب المنطقة.
                </p>

              </div>

            </div>

          </section>


          {/* وقت التوصيل */}

          <section>

            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <FiClock className="text-primary-600" />
              وقت التوصيل
            </h2>

            <div className="bg-gray-50 p-6 rounded-2xl shadow-sm space-y-3">

              <p className="text-gray-700">
                <span className="font-semibold">أيام العمل:</span>
                {' '}من السبت إلى الخميس
              </p>

              <p className="text-gray-700">
                <span className="font-semibold">ساعات التوصيل:</span>
                {' '}من 9 صباحاً حتى 9 مساءً
              </p>

              <p className="text-gray-700">
                <span className="font-semibold">ملاحظة:</span>
                {' '}لا يوجد توصيل يوم الجمعة
              </p>

            </div>

          </section>


          {/* تتبع الشحنة */}

          <section>

            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <FiPackage className="text-primary-600" />
              تتبع الشحنة
            </h2>

            <div className="bg-gray-50 p-6 rounded-2xl shadow-sm">

              <p className="text-gray-700 mb-4">
                بعد شحن الطلب، ستصلك رسالة نصية تحتوي على:
              </p>

              <ul className="list-disc list-inside text-gray-600 space-y-2 mr-4">

                <li>رقم تتبع الشحنة</li>
                <li>رابط تتبع الشحنة</li>
                <li>تاريخ التوصيل المتوقع</li>

              </ul>

              <p className="text-gray-600 mt-4">

                يمكنك أيضاً تتبع شحنتك من خلال{' '}

                <Link
                  to="/orders"
                  className="text-primary-600 hover:underline font-medium"
                >
                  صفحة طلباتي
                </Link>

              </p>

            </div>

          </section>


          {/* ملاحظات */}

          <section className="bg-primary-50 p-6 rounded-2xl shadow-sm">

            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <FiTruck className="text-primary-600" />
              ملاحظات مهمة
            </h2>

            <ul className="list-disc list-inside text-gray-700 space-y-2 mr-4">

              {policy.notes.map((note, index) => (
                <li key={index}>{note}</li>
              ))}

              <li className="text-yellow-700 mt-2">
                في حالة تأخير الشحن سيتم إشعارك عبر البريد الإلكتروني أو رسالة نصية.
              </li>

            </ul>

          </section>


          {/* استفسار */}

          <section className="border-t border-gray-200 pt-6">

            <h2 className="text-xl font-bold mb-4">
              هل لديك استفسار؟
            </h2>

            <p className="text-gray-600">

              إذا كان لديك أي استفسار حول سياسة الشحن يرجى التواصل معنا عبر{' '}

              <Link
                to="/contact"
                className="text-primary-600 hover:underline font-medium"
              >
                صفحة الاتصال بنا
              </Link>

            </p>

          </section>

        </div>

      </div>

    </div>

  );

};

export default Shipping;