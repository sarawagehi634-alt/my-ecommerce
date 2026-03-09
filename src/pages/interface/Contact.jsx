// Contact.jsx
import React, { useState, useEffect } from 'react';
import { 
  FaMapMarkerAlt, 
  FaPhone, 
  FaEnvelope, 
  FaClock, 
  FaPaperPlane,
  FaInstagram,
  FaFacebook,
  FaTwitter,
  FaTiktok,
  FaCheckCircle
} from 'react-icons/fa';
import contactService from '../../services/contactService';
import staticService from '../../services/staticService';
import Loader from '../../components/common/Loader';
import toast from 'react-hot-toast';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [contactInfo, setContactInfo] = useState({
    about: null,
    branches: [],
    hours: []
  });
  const [fetching, setFetching] = useState(true);
  const [sendSuccess, setSendSuccess] = useState(false);

  useEffect(() => {
    fetchContactInfo();
  }, []);

  const fetchContactInfo = async () => {
    try {
      setFetching(true);
      const results = await Promise.allSettled([
        staticService.getAboutInfo(),
        staticService.getBranches(),
        staticService.getWorkingHours()
      ]);
      
      setContactInfo({ 
        about: results[0].status === 'fulfilled' ? results[0].value || {} : {},
        branches: results[1].status === 'fulfilled' ? results[1].value || [] : [],
        hours: results[2].status === 'fulfilled' ? results[2].value || [] : []
      });
    } catch (error) {
      console.error('خطأ في جلب معلومات الاتصال:', error);
      toast.error('حدث خطأ في تحميل معلومات الاتصال');
    } finally {
      setFetching(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const cleanPhoneNumber = (phone) => phone ? phone.replace(/\D/g, '') : '';
  const resetForm = () => {
    setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    setSendSuccess(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name?.trim()) return toast.error('الاسم مطلوب');
    if (!formData.email?.trim()) return toast.error('البريد الإلكتروني مطلوب');
    if (!isValidEmail(formData.email)) return toast.error('البريد الإلكتروني غير صالح');
    if (!formData.subject?.trim()) return toast.error('الموضوع مطلوب');
    if (!formData.message?.trim() || formData.message.trim().length < 10) 
      return toast.error('الرسالة يجب أن تكون 10 أحرف على الأقل');

    setLoading(true);
    setSendSuccess(false);

    try {
      const cleanData = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: cleanPhoneNumber(formData.phone),
        subject: formData.subject.trim(),
        message: formData.message.trim()
      };

      const response = await contactService.sendMessage(cleanData);

      if (response?.status) {
        toast.success(response.message);
        setSendSuccess(true);
        resetForm();
        toast.success('(وضع التطوير) تم حفظ الرسالة محلياً', { icon: '', duration: 4000 });
      } else {
        toast.error(response?.message || 'حدث خطأ في إرسال الرسالة');
      }
    } catch (error) {
      console.error('خطأ في إرسال الرسالة:', error);
      toast.error('حدث خطأ في إرسال الرسالة');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <Loader text="جاري تحميل معلومات الاتصال..." />;

  return (
    <div className="min-h-screen py-12 bg-gradient-to-b from-gray-50 to-white" dir="rtl">
      <div className="container-custom">
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-purple-500 rounded-2xl mx-auto mb-4 flex items-center justify-center">
            <FaEnvelope className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">اتصل بنا</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            نحن هنا للإجابة على استفساراتك ومساعدتك في أي وقت
          </p>
        </div>

        {sendSuccess && (
          <div className="mb-8 bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
            <FaCheckCircle className="text-green-600 w-6 h-6 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-green-800 font-medium">تم إرسال رسالتك بنجاح!</p>
              <p className="text-green-600 text-sm">سنتواصل معك في أقرب وقت ممكن</p>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* معلومات الاتصال */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold mb-6">معلومات الاتصال</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="bg-pink-100 p-3 rounded-lg flex-shrink-0">
                    <FaMapMarkerAlt className="w-6 h-6 text-pink-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">العنوان</h3>
                    <p className="text-gray-600">{contactInfo.about?.address || 'القاهرة، مصر'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-pink-100 p-3 rounded-lg flex-shrink-0">
                    <FaPhone className="w-6 h-6 text-pink-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">الهاتف</h3>
                    {contactInfo.branches?.length > 0 ? (
                      contactInfo.branches.map((branch, index) => (
                        <p key={index} className="text-gray-600" dir="ltr">{branch.phone || '+20 10 0000 0000'}</p>
                      ))
                    ) : (
                      <p className="text-gray-600" dir="ltr">+20 10 0000 0000</p>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-pink-100 p-3 rounded-lg flex-shrink-0">
                    <FaEnvelope className="w-6 h-6 text-pink-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">البريد الإلكتروني</h3>
                    <p className="text-gray-600">info@fashionista.com</p>
                    <p className="text-gray-600">support@fashionista.com</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-pink-100 p-3 rounded-lg flex-shrink-0">
                    <FaClock className="w-6 h-6 text-pink-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">ساعات العمل</h3>
                    {contactInfo.hours?.length > 0 ? (
                      contactInfo.hours.map((hour, index) => (
                        <p key={index} className="text-gray-600">{hour.day || 'السبت - الخميس'}: {hour.hours || '10:00 ص - 8:00 م'}</p>
                      ))
                    ) : (
                      <p className="text-gray-600">السبت - الخميس: 10:00 ص - 8:00 م</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4">تابعنا على</h2>
              <div className="flex gap-3">
                <a href="https://instagram.com/fashionista" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-pink-500 text-white rounded-lg flex items-center justify-center hover:bg-pink-600">
                  <FaInstagram />
                </a>
                <a href="https://facebook.com/fashionista" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-blue-600 text-white rounded-lg flex items-center justify-center hover:bg-blue-700">
                  <FaFacebook />
                </a>
                <a href="https://twitter.com/fashionista" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-blue-400 text-white rounded-lg flex items-center justify-center hover:bg-blue-500">
                  <FaTwitter />
                </a>
                <a href="https://www.tiktok.com/@fashionista" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-black text-white rounded-lg flex items-center justify-center hover:bg-gray-800">
                  <FaTiktok />
                </a>
              </div>
            </div>
          </div>

          {/* نموذج الاتصال */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold mb-6">أرسل لنا رسالة</h2>
              <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                <div className="grid md:grid-cols-2 gap-4">
                  <inputField label="الاسم الكامل" name="name" placeholder="أدخل اسمك" value={formData.name} onChange={handleChange} />
                  <inputField label="البريد الإلكتروني" name="email" placeholder="example@email.com" value={formData.email} onChange={handleChange} dir="ltr" />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <inputField label="رقم الهاتف" name="phone" placeholder="01012345678" value={formData.phone} onChange={handleChange} dir="ltr" />
                  <inputField label="الموضوع" name="subject" placeholder="موضوع الرسالة" value={formData.subject} onChange={handleChange} />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">الرسالة</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-pink-500 resize-none"
                    placeholder="اكتب رسالتك هنا..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-l from-pink-500 to-purple-500 text-white px-6 py-4 rounded-xl font-semibold hover:from-pink-600 hover:to-purple-600 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <FaPaperPlane />
                  {loading ? 'جاري الإرسال...' : 'إرسال الرسالة'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const inputField = ({ label, name, placeholder, value, onChange, dir }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
    <input
      type="text"
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      dir={dir || 'rtl'}
      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-pink-500"
    />
  </div>
);

export default Contact;