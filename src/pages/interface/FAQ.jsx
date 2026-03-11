// FAQ.jsx
import React, { useState, useEffect } from 'react';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';
import staticService from '../../services/staticService';
import Loader from '../../components/common/Loader';
import toast from 'react-hot-toast';

// أسئلة افتراضية
const DEFAULT_FAQS = [
  { question: 'ما هي طرق الدفع المتاحة؟', answer: 'يمكنك الدفع عبر بطاقة الائتمان، الدفع عند الاستلام، أو التحويل البنكي.' },
  { question: 'كم تستغرق عملية الشحن؟', answer: 'تستغرق عملية الشحن من 3 إلى 7 أيام عمل حسب المنطقة.' },
  { question: 'كيف يمكنني تتبع طلبي؟', answer: 'يمكنك تتبع طلبك من خلال حسابك في الموقع أو عبر رابط التتبع المرسل إلى بريدك الإلكتروني.' },
  { question: 'ما هي سياسة الإرجاع؟', answer: 'يمكنك إرجاع المنتجات خلال 14 يوم من تاريخ الاستلام بشرط أن تكون بحالتها الأصلية.' },
  { question: 'هل المنتجات طبيعية 100%؟', answer: 'نعم، جميع منتجاتنا طبيعية 100% وخالية من المواد الكيميائية الضارة.' }
];

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchFAQs(); }, []);

  const fetchFAQs = async () => {
    try {
      setLoading(true);
      const data = await staticService.getFAQs();
      setFaqs(data && data.length ? data : DEFAULT_FAQS);
    } catch (error) {
      console.error('خطأ في جلب الأسئلة:', error);
      toast.error('حدث خطأ في تحميل الأسئلة');
      setFaqs(DEFAULT_FAQS);
    } finally { setLoading(false); }
  };

  const toggleQuestion = index => setOpenIndex(openIndex === index ? null : index);

  if (loading) return <Loader text="جاري تحميل الأسئلة الشائعة..." />;

  return (
    <div className="min-h-screen py-12 bg-gradient-to-b from-purple-50 to-pink-50" dir="rtl">
      <div className="container-custom max-w-3xl px-4 md:px-0">
        {/* عنوان الصفحة */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">الأسئلة الشائعة</h1>
          <p className="text-xl text-gray-600">إجابات على أكثر الأسئلة شيوعاً حول منتجاتنا وخدماتنا</p>
        </div>

        {/* قائمة الأسئلة */}
        {faqs.length > 0 ? (
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-lg overflow-hidden border border-purple-100 transition-all duration-300">
                <button
                  onClick={() => toggleQuestion(index)}
                  className="w-full px-6 py-4 text-right flex items-center justify-between hover:bg-purple-50 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-inset"
                  aria-expanded={openIndex === index}
                  aria-controls={`faq-answer-${index}`}
                >
                  <span className="font-semibold text-lg text-gray-900">{faq.question}</span>
                  {openIndex === index ? <FiChevronUp className="w-5 h-5 text-purple-600" aria-hidden="true"/> : <FiChevronDown className="w-5 h-5 text-gray-400" aria-hidden="true"/>}
                </button>

                <div
                  id={`faq-answer-${index}`}
                  role="region"
                  className={`px-6 overflow-hidden transition-all duration-300 text-gray-700 ${openIndex === index ? 'max-h-96 py-4 bg-purple-50/50' : 'max-h-0'}`}
                >
                  {faq.answer}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl shadow">
            <p className="text-gray-600">لا توجد أسئلة حالياً</p>
          </div>
        )}

        {/* قسم المساعدة */}
        <div className="mt-12 text-center bg-gradient-to-l from-purple-100 via-pink-100 to-pink-200 rounded-2xl p-8">
          <h2 className="text-2xl font-bold mb-4 text-gray-900">لم تجد إجابة لسؤالك؟</h2>
          <p className="text-gray-700 mb-6">فريقنا جاهز لمساعدتك، تواصل معنا وسنرد عليك في أقرب وقت</p>
          <a
            href="/contact"
            className="inline-block bg-gradient-to-l from-purple-600 to-pink-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-600 transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
            aria-label="الانتقال إلى صفحة الاتصال"
          >
            تواصل معنا
          </a>
        </div>
      </div>
    </div>
  );
};

export default FAQ;