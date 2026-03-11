// @ts-nocheck
import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  FaInstagram,
  FaTiktok,
  FaPinterestP,
  FaFacebookF,
  FaWhatsapp,
} from "react-icons/fa";
import {
  FiSend,
  FiArrowUpRight,
  FiMapPin,
  FiPhone,
  FiGlobe,
} from "react-icons/fi";
import toast from "react-hot-toast";

const CONTACT_INFO = {
  phone: "+20 123 456 789",
  location: "القليوبية، مصر",
  language: "العربية",
  currency: "EGP"
};

const Footer = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return toast.error("بريدك الإلكتروني يهمنا");
    setLoading(true);
    try {
      // محاكاة الاشتراك
      await new Promise((res) => setTimeout(res, 1000));
      toast.success("أهلاً بكِ في عالمنا");
      setEmail("");
    } catch {
      toast.error("حدث خطأ ما");
    }
    setLoading(false);
  };

  const sections = {
    shop: {
      title: "التسوق",
      links: [
        { to: "/products", text: "وصلنا حديثاً" },
        { to: "/category/dresses", text: "فساتين السهرة" },
        { to: "/category/casual", text: "ملابس كاجوال" },
        { to: "/offers", text: "العروض الحصرية" },
      ],
    },
    support: {
      title: "المساعدة",
      links: [
        { to: "/orders", text: "تتبع طلبك" },
        { to: "/shipping", text: "معلومات الشحن" },
        { to: "/returns", text: "سياسة الإرجاع" },
        { to: "/faq", text: "الأسئلة الشائعة" },
      ],
    },
    brand: {
      title: "عن سوو",
      links: [
        { to: "/about", text: "قصتنا" },
        { to: "/sustainability", text: "الاستدامة" },
        { to: "/contact", text: "تواصل معنا" },
        { to: "/terms", text: "الشروط والأحكام" },
      ],
    },
  };

  const SOCIAL_ICONS = [FaInstagram, FaTiktok, FaPinterestP, FaFacebookF, FaWhatsapp];

  return (
    <footer className="bg-white border-t border-gray-100 text-gray-900 pt-20 pb-8">
      <div className="container mx-auto px-6">
        
        {/* الجزء العلوي: براندنج واشتراك */}
        <div className="grid lg:grid-cols-12 gap-16 mb-20">
          
          {/* Brand & Social */}
          <div className="lg:col-span-4 space-y-8">
            <Link to="/" className="inline-block">
               <h2 className="text-3xl font-black tracking-tighter uppercase italic">SOO STYLE</h2>
               <p className="text-[10px] tracking-[0.3em] text-gray-400 uppercase mt-1">Soo Fashion House</p>
            </Link>
            
            <p className="text-gray-500 text-sm leading-relaxed max-w-xs font-light">
              نحن نؤمن أن الملابس ليست مجرد قطع نرتديها، بل هي تعبير عن الهوية. اكتشفي مجموعتنا المختارة بعناية.
            </p>

            <div className="flex gap-5">
              {SOCIAL_ICONS.map((Icon, i) => (
                <a key={i} href="#" className="text-gray-400 hover:text-black transition-colors duration-300">
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* القوائم */}
          <div className="lg:col-span-5 grid grid-cols-2 md:grid-cols-3 gap-8">
            {Object.values(sections).map((section) => (
              <div key={section.title}>
                <h4 className="text-xs font-bold uppercase tracking-widest text-gray-900 mb-6 italic">
                  {section.title}
                </h4>
                <ul className="space-y-4">
                  {section.links.map((link) => (
                    <li key={link.text}>
                      <Link to={link.to} className="text-sm text-gray-400 hover:text-black transition-colors flex items-center group gap-1">
                        {link.text}
                        <FiArrowUpRight className="opacity-0 group-hover:opacity-100 transition-opacity" size={12}/>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* النشرة البريدية */}
          <div className="lg:col-span-3">
             <h4 className="text-xs font-bold uppercase tracking-widest text-gray-900 mb-6 italic">اشتركي الآن</h4>
             <p className="text-xs text-gray-400 mb-6 leading-relaxed">
                كوني أول من يعرف عن مجموعاتنا الجديدة والخصومات السرية.
             </p>
             <form onSubmit={handleSubscribe} className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="عنوان بريدك الإلكتروني"
                  className="w-full bg-transparent border-b border-gray-200 py-3 pr-2 pl-10 focus:border-black outline-none transition-all text-sm font-light"
                />
                <button type="submit" className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors">
                  {loading ? "..." : <FiSend size={18} />}
                </button>
             </form>
          </div>

        </div>

        {/* الجزء السفلي */}
        <div className="pt-10 border-t border-gray-50">
          <div className="flex flex-wrap justify-between items-center gap-8">
            
            <div className="flex flex-wrap gap-8 text-[11px] text-gray-400 uppercase tracking-[0.15em] font-medium">
               <div className="flex items-center gap-2">
                 <FiMapPin /> {CONTACT_INFO.location}
               </div>
               <div className="flex items-center gap-2">
                 <FiPhone /> {CONTACT_INFO.phone}
               </div>
               <div className="flex items-center gap-2">
                 <FiGlobe /> {CONTACT_INFO.language} | {CONTACT_INFO.currency}
               </div>
            </div>

            <div className="flex items-center gap-8">
               <p className="text-[11px] text-gray-400 uppercase tracking-widest">
                  © {new Date().getFullYear()} Soo Fashion. All Rights Reserved
               </p>
               <div className="flex gap-4 opacity-20 grayscale text-[10px] font-black">
                  <span>VISA</span>
                  <span>MASTERCARD</span>
                  <span>CASH</span>
               </div>
            </div>

          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;