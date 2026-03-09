import React, { useState, useEffect } from 'react';
import { FiRefreshCw, FiCheckCircle, FiXCircle, FiClock } from 'react-icons/fi';
import staticService from '../../services/staticService';
import Loader from '../../components/common/Loader';
import toast from 'react-hot-toast';

const DEFAULT_RETURN_POLICY = {
  duration: 14,
  conditions: [
    'المنتج بحالته الأصلية: يجب أن يكون المنتج غير مستخدم وفي نفس الحالة التي استلمته بها',
    'العبوة الأصلية: يجب إرجاع المنتج مع عبوته الأصلية وجميع ملصقاته',
    'الفاتورة: يجب إرفاق فاتورة الشراء مع المنتج المرتجع',
    'المنتجات التالفة: إذا وصل المنتج تالفاً، يرجى التواصل معنا خلال 48 ساعة من الاستلام'
  ],
  exceptions: [
    'المنتجات المخصصة (حسب الطلب)',
    'المنتجات الرقمية (قوائم العناية، كتب إلكترونية)',
    'المنتجات المفتوحة (منتجات العناية المفتوحة)',
    'المنتجات المخفضة (فوق 50% خصم)'
  ],
  refundTime: {
    cod: '5-7 أيام عمل',
    bank: '3-5 أيام عمل',
    credit: '7-14 يوم عمل'
  }
};

const ReturnsFashion = () => {
  const [returnPolicy, setReturnPolicy] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchReturnPolicy(); }, []);

  const fetchReturnPolicy = async () => {
    try {
      setLoading(true);
      const data = await staticService.getReturnPolicy();
      setReturnPolicy(data || DEFAULT_RETURN_POLICY);
    } catch (error) {
      console.error('خطأ في جلب سياسة الإرجاع:', error);
      toast.error('حدث خطأ في تحميل سياسة الإرجاع');
      setReturnPolicy(DEFAULT_RETURN_POLICY);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader text="جاري تحميل سياسة الإرجاع..." />;

  return (
    <div className="min-h-screen py-12 bg-gradient-to-b from-pink-50 to-white" dir="rtl">
      <div className="container-custom max-w-4xl">
        <h1 className="text-4xl font-bold text-pink-600 mb-8 text-center">سياسة الإرجاع والاستبدال</h1>

        <div className="bg-white rounded-3xl shadow-2xl p-8 space-y-10">

          {/* شروط الإرجاع */}
          <section>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-pink-500">
              <FiRefreshCw className="w-6 h-6" /> شروط الإرجاع
            </h2>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <FiCheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-2 text-gray-800">مدة الإرجاع</h3>
                  <p className="text-gray-600">
                    يمكن إرجاع المنتج خلال <span className="font-semibold">{returnPolicy?.duration || 14}</span> يوم من تاريخ الاستلام
                  </p>
                </div>
              </div>

              {returnPolicy?.conditions?.map((condition, index) => {
                const parts = condition.split(':');
                const title = parts[0];
                const description = parts.slice(1).join(':');
                return (
                  <div key={index} className="flex items-start gap-4">
                    <FiCheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold mb-1 text-gray-800">{title}</h3>
                      <p className="text-gray-600">{description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* حالات لا يمكن الإرجاع */}
          <section>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-red-500">
              <FiXCircle className="w-6 h-6" /> حالات لا يمكن إرجاعها
            </h2>
            <ul className="list-disc list-inside text-gray-600 space-y-2 mr-4">
              {returnPolicy?.exceptions?.map((exception, index) => (
                <li key={index}>{exception}</li>
              ))}
            </ul>
          </section>

          {/* خطوات الإرجاع */}
          <section>
            <h2 className="text-2xl font-bold mb-6 text-pink-500">خطوات الإرجاع</h2>
            <div className="space-y-4">
              {[1,2,3,4,5].map(step => (
                <div key={step} className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-pink-400 to-pink-600 text-white rounded-full flex items-center justify-center font-bold shadow-lg">
                    {step}
                  </div>
                  <p className="text-gray-700">
                    {step === 1 && 'تسجيل الدخول إلى حسابك واختيار الطلب المراد إرجاعه'}
                    {step === 2 && 'اختيار المنتجات المراد إرجاعها وسبب الإرجاع'}
                    {step === 3 && 'انتظار موافقة فريق الدعم على طلب الإرجاع'}
                    {step === 4 && 'شحن المنتج إلينا عبر شركة الشحن المتفق عليها'}
                    {step === 5 && 'استرداد المبلغ خلال 5-7 أيام عمل بعد استلام المنتج'}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* مدة استرداد المبلغ */}
          <section className="bg-pink-50 p-6 rounded-2xl shadow-inner">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-pink-600">
              <FiClock className="w-5 h-5" /> مدة استرداد المبلغ
            </h2>
            <p className="text-gray-700 mb-4">
              بعد استلامنا للمنتج المرتجع والتأكد من مطابقته للشروط، سيتم استرداد المبلغ خلال:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mr-4">
              <li><span className="font-semibold">الدفع عند الاستلام:</span> {returnPolicy?.refundTime?.cod}</li>
              <li><span className="font-semibold">التحويل البنكي:</span> {returnPolicy?.refundTime?.bank}</li>
              <li><span className="font-semibold">بطاقات الائتمان:</span> {returnPolicy?.refundTime?.credit} (حسب سياسة البنك)</li>
            </ul>
          </section>

          {/* ملاحظات إضافية */}
          <section className="border-t border-gray-200 pt-6">
            <h2 className="text-xl font-bold mb-4 text-pink-500">ملاحظات مهمة</h2>
            <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400">
              <p className="text-yellow-800">
                تكاليف الشحن للإرجاع يتحملها العميل إلا في حالة وصول المنتج تالفاً أو خطأ من المتجر.
              </p>
            </div>
            <div className="mt-4">
              <p className="text-gray-600">
                للاستفسارات حول سياسة الإرجاع، يرجى التواصل مع فريق الدعم عبر{' '}
                <a href="/contact" className="text-pink-600 hover:underline font-semibold">
                  صفحة الاتصال بنا
                </a>
              </p>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
};

export default ReturnsFashion;