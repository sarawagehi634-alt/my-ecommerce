// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  FiHome, FiPackage, FiShoppingBag, FiUsers, FiSettings, FiLogOut,
  FiChevronDown, FiChevronUp, FiBarChart2, FiStar, FiTag, FiTruck, FiMail
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import categoryService from '../../../services/categoryService';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const Sidebar = ({ isOpen, onClose }) => {
  const [openMenus, setOpenMenus] = useState(['المتجر']);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await categoryService.getCategories({ perPage: 10 });
      if (response?.status) setCategories(response.data?.data || []);
    } catch (error) {
      console.error('Error fetching categories', error);
    } finally {
      setLoading(false);
    }
  };

  const menuItems = [
    { title: 'نظرة عامة', icon: FiBarChart2, path: '/dashboard' },
    { 
      title: 'المتجر', 
      icon: FiPackage, 
      submenu: [
        { title: 'كل الملابس', path: '/dashboard/products' },
        { title: 'إضافة قطعة جديدة', path: '/dashboard/products/add' },
        { title: 'إدارة التصنيفات', path: '/dashboard/categories' },
      ]
    },
    { 
      title: 'المبيعات', 
      icon: FiShoppingBag, 
      submenu: [
        { title: 'جميع الطلبات', path: '/dashboard/orders' },
        { title: 'بانتظار التجهيز', path: '/dashboard/orders?status=processing' },
        { title: 'تم التوصيل', path: '/dashboard/orders?status=completed' },
      ]
    },
    { title: 'العملاء', icon: FiUsers, path: '/dashboard/users' },
    { title: 'العروض والخصومات', icon: FiTag, path: '/dashboard/offers' },
    { title: 'التقييمات', icon: FiStar, path: '/dashboard/reviews' },
    { title: 'الرسائل', icon: FiMail, path: '/dashboard/contact-messages', badge: 3 },
    { title: 'إعدادات المتجر', icon: FiSettings, path: '/dashboard/settings' },
  ];

  const toggleMenu = (title) => {
    setOpenMenus(prev => prev.includes(title) ? prev.filter(i => i !== title) : [...prev, title]);
  };

  const isActive = (path) => path && location.pathname.startsWith(path.split('?')[0]);

  return (
    <>
      {/* Overlay for Mobile */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      <aside className={`fixed top-0 right-0 h-full w-72 bg-white z-50 border-l border-gray-100 transform transition-transform duration-500 ease-in-out
        ${isOpen ? 'translate-x-0' : 'translate-x-full'} lg:translate-x-0 lg:static`}>
        
        {/* Branding Area */}
        <div className="p-8 border-b border-gray-50">
          <Link to="/dashboard" className="block">
            <h2 className="text-xl font-black tracking-tighter uppercase italic">SOO STYLE</h2>
            <p className="text-[9px] tracking-[0.3em] text-gray-400 uppercase font-bold">Control Panel</p>
          </Link>
          
          <div className="mt-8 flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
             <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-bold text-xs uppercase">
               {user?.name?.charAt(0) || 'A'}
             </div>
             <div className="overflow-hidden">
               <p className="text-xs font-bold text-gray-900 truncate">{user?.name || 'Admin'}</p>
               <p className="text-[10px] text-gray-400 truncate">{user?.email || 'admin@example.com'}</p>
             </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100vh-250px)]">
          {menuItems.map((item) => (
            <div key={item.title} className="mb-1">
              {item.path ? (
                <Link
                  to={item.path}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 group
                  ${isActive(item.path) ? 'bg-black text-white shadow-lg shadow-black/10' : 'text-gray-500 hover:bg-gray-50 hover:text-black'}`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon size={18} />
                    <span className="text-xs font-bold uppercase tracking-widest">{item.title}</span>
                  </div>
                  {item.badge && <span className="bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold">{item.badge}</span>}
                </Link>
              ) : (
                <div>
                  <button
                    onClick={() => toggleMenu(item.title)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all
                    ${openMenus.includes(item.title) ? 'bg-gray-50 text-black' : 'text-gray-500 hover:bg-gray-50'}`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon size={18} />
                      <span className="text-xs font-bold uppercase tracking-widest">{item.title}</span>
                    </div>
                    {openMenus.includes(item.title) ? <FiChevronUp size={14}/> : <FiChevronDown size={14}/> }
                  </button>
                  
                  <AnimatePresence>
                    {openMenus.includes(item.title) && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden pl-6 border-r border-gray-100 mt-1">
                        {item.submenu.map(sub => (
                          <Link key={sub.title} to={sub.path} className={`block py-2.5 text-[11px] font-medium transition-colors ${isActive(sub.path) ? 'text-black font-bold' : 'text-gray-400 hover:text-black'}`}>
                            {sub.title}
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Logout at Bottom */}
        <div className="absolute bottom-0 w-full p-4 bg-white border-t border-gray-50">
          <button 
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-colors duration-300"
          >
            <FiLogOut size={18} />
            <span className="text-xs font-bold uppercase tracking-widest">تسجيل الخروج</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;