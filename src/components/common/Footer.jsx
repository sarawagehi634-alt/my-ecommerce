// @ts-nocheck
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FaFacebookF, FaInstagram, FaTwitter, FaYoutube, 
  FaTiktok, FaWhatsapp, FaPinterestP
} from 'react-icons/fa';
import { FiMail, FiSend, FiArrowUpRight, FiGlobe } from 'react-icons/fi';
import toast from 'react-hot-toast';

// تغيير اللوجو ليكون Minimalist أسود أو أبيض حسب الخلفية
const logo = 'https://placehold.co';

const FOOTER_SECTIONS = {
  shop: {
    title: 'تسوقي الآن',
    links: [
      { to: '/category/new', text: 'وصلنا حديثاً' },
      { to: '/category/dresses', text: 'الفساتين' },
      { to: '/category/tops', text: 'البلوزات' },
      { to: '/category/accessories', text: 'الإكسسوارات' },
      { to: '/offers', text: 'التخفيضات %' },
    ]
  },
  support: {
    title: 'مساعدة',
    links: [
      { to: '/orders', text: 'تتبع الطلب' },
      { to: '/shipping', text: 'معلومات الشحن' },
      { to: '/returns', text: 'سياسة الإرجاع' },
      { to: '/faq', text: 'الأسئلة الشائعة' },
    ]
  },
  company: {
    title: 'الشركة',
    links: [
      { to: '/about', text: 'قصتنا' },
      { to: '/sustainability', text: 'الاستدامة' },
      { to: '/contact', text: 'تواصل معنا' },
      { to: '/terms', text: 'الشروط والأحكام' },
    ]
  }
};

const SOCIAL_ICONS = [
  { icon: FaInstagram, link: '#' },
  { icon: FaTiktok, link: '#' },
  { icon: FaPinterestP, link: '#' }, // الفاشون بيحب بينترست جداً
  { icon: FaFacebookF, link: '#' },
  { icon: FaWhatsapp, link: '#' },
];

const Footer = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return toast.error('الرجاء إدخال البريد الإلكتروني');
    setLoading(true);
    try {
      // محاكاة اشتراك
      await new Promise(res => setTimeout(res, 1000));
      toast.success('مرحباً بكِ في عالمنا!');
      setEmail('');
    } catch (error) {
      toast.error('حدث خطأ');
    }
    setLoading(false);
  };

  return (
    <footer className="bg-white border-t border-gray-100 text-gray-900 pt-20 pb-10">
      <div className="container mx-auto px-6">
        
        {/* الجزء العلوي: النشرة البريدية بتصميم "Minimal" */}
        <div className="grid lg:grid-cols-12 gap-12 pb-16 border-b border-gray-100">
          <div className="lg:col-span-5">
            <h3 className="text-2xl font-serif italic mb-4">انضمي إلى مجتمعنا</h3>
            <p className="text-gray-500 text-sm mb-6 max-w-md">
              اشتركي للحصول على إشعارات حصرية بأحدث صيحات الموضة والخصومات قبل أي شخص آخر.
            </p>
            <form onSubmit={handleSubscribe} className="relative max-w-md group">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="بريدك الإلكتروني"
                className="w-full bg-transparent border-b-2 border-gray-200 py-3 pr-2 pl-12 focus:border-black outline-none transition-colors"
              />
              <button className="absolute left-0 top-1/2 -translate-y-1/2 hover:scale-110 transition-transform">
                {loading ? '...' : <FiSend size={20} />}
              </button>
            </form>
          </div>

          <div className="lg:col-span-7 flex flex-wrap justify-between gap-8">
            {Object.entries(FOOTER_SECTIONS).map(([key, section]) => (
              <div key={key} className="min-w-[120px]">
                <h4 className="text-xs font-black uppercase tracking-[0.2em] mb-6 text-gray-400">
                  {section.title}
                </h4>
                <ul className="space-y-4">
                  {section.links.map((link, i) => (
                    <li key={i}>
                      <Link to={link.to} className="text-sm text-gray-600 hover:text-black flex items-center group gap-1">
                        {link.text}
                        <FiArrowUpRight className="opacity-0 group-hover:opacity-100 transition-opacity" size={12}/>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* الجزء الأوسط: معلومات التواصل واللوجو */}
        <div className="py-12 flex flex-col lg:flex-row justify-between items-center gap-10">
          <div className="flex flex-col items-center lg:items-start gap-4">
            <img src={logo} className="h-10 grayscale hover:grayscale-0 transition-all cursor-pointer" alt="Logo" />
            <p className="text-[10px] uppercase tracking-widest text-gray-400 text-center lg:text-right italic">
              الأناقة تبدأ من الداخل، ونحن نكملها.
            </p>
          </div>

          <div className="flex gap-6">
            {SOCIAL_ICONS.map((social, i) => (
              <a
                key={i}
                href={social.link}
                className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-100 text-gray-500 hover:bg-black hover:text-white transition-all duration-300"
              >
                <social.icon size={16} />
              </a>
            ))}
          </div>
        </div>

        {/* الجزء السفلي: الحقوق والعملة */}
        <div className="pt-8 border-t border-gray-50 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-6 text-[11px] font-medium text-gray-400 uppercase tracking-widest">
            <span>© {new Date().getFullYear()} Beauty Toma</span>
            <span className="flex items-center gap-2 cursor-pointer hover:text-black">
              <FiGlobe /> Egypt | AR
            </span>
          </div>

          <div className="flex gap-8">
             {/* أيقونات دفع نظيفة (Placeholders) */}
             <div className="flex items-center gap-4 opacity-30 grayscale tracking-tighter text-[10px] font-bold">
                <span>VISA</span>
                <span>MASTERCARD</span>
                <span>CASH</span>
             </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
