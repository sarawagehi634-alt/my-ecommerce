// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  FiHome, FiPackage, FiGrid, FiShoppingBag, 
  FiUsers, FiSettings, FiMenu, FiX, 
  FiLogOut, FiBell, FiMail, FiArrowUpRight 
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const NAVIGATION_ITEMS = [
  { name: 'نظرة عامة', href: '/dashboard', icon: FiHome },
  { name: 'المخزون', href: '/dashboard/products', icon: FiPackage },
  { name: 'التصنيفات', href: '/dashboard/categories', icon: FiGrid },
  { name: 'المبيعات', href: '/dashboard/orders', icon: FiShoppingBag },
  { name: 'قاعدة العملاء', href: '/dashboard/users', icon: FiUsers },
  { name: 'الرسائل', href: '/dashboard/contact-messages', icon: FiMail },
  { name: 'الإعدادات', href: '/dashboard/settings', icon: FiSettings },
];

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout, isAdmin, initialized } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // حماية المسار
  useEffect(() => {
    if (initialized && !isAdmin) {
      toast.error('دخول غير مصرح به');
      navigate('/');
    }
  }, [isAdmin, navigate, initialized]);

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans selection:bg-black selection:text-white">
      
      {/* Top Header */}
      <header className="h-16 border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-50 px-6 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 hover:bg-gray-50 rounded-full">
            <FiMenu size={20} />
          </button>
          
          <Link to="/dashboard" className="flex flex-col">
            <span className="text-xl font-black tracking-tighter uppercase italic leading-none">SOO STYLE</span>
            <span className="text-[8px] tracking-[0.4em] uppercase text-gray-400 font-bold">Studio Admin</span>
          </Link>
        </div>

        <div className="flex items-center gap-6">
          <button className="relative p-2 text-gray-400 hover:text-black transition-colors">
            <FiBell size={18} />
            <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-black rounded-full border border-white"></span>
          </button>

          <div className="flex items-center gap-3 pl-4 border-l border-gray-100">
            <div className="hidden sm:block text-right">
              <p className="text-[11px] font-black uppercase tracking-widest leading-none mb-1">{user?.name || 'Admin'}</p>
              <p className="text-[9px] text-gray-400 uppercase tracking-tighter italic">Creative Director</p>
            </div>
            <div className="w-9 h-9 rounded-none bg-black text-white flex items-center justify-center text-xs font-bold shadow-xl shadow-black/10">
              {user?.name?.charAt(0) || 'A'}
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex flex-col w-72 border-l border-gray-50 bg-white">
          <nav className="flex-1 px-6 py-10 space-y-2">
            {NAVIGATION_ITEMS.map(item => (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center justify-between px-5 py-3.5 transition-all duration-300 group ${
                  isActive(item.href) 
                  ? 'bg-black text-white' 
                  : 'text-gray-400 hover:text-black hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-4">
                  <item.icon size={16} className={isActive(item.href) ? 'text-white' : 'text-gray-300 group-hover:text-black'} />
                  <span className="text-[11px] font-bold uppercase tracking-[0.2em]">{item.name}</span>
                </div>
                {isActive(item.href) && <FiArrowUpRight size={14} />}
              </Link>
            ))}
          </nav>

          <div className="p-6 border-t border-gray-50">
            <button
              onClick={() => { logout(); navigate('/login'); }}
              className="w-full flex items-center gap-4 px-5 py-3 text-red-500 hover:bg-red-50 transition-colors"
            >
              <FiLogOut size={16} />
              <span className="text-[11px] font-bold uppercase tracking-widest">تسجيل الخروج</span>
            </button>
          </div>
        </aside>

        {/* Mobile Sidebar */}
        <AnimatePresence>
          {sidebarOpen && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
                onClick={() => setSidebarOpen(false)} className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 lg:hidden" />
              <motion.aside initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25 }}
                className="fixed top-0 right-0 h-full w-80 bg-white z-50 shadow-2xl p-8 flex flex-col">
                <button onClick={() => setSidebarOpen(false)} className="self-end mb-12 p-2 hover:bg-gray-50 rounded-full"><FiX size={24}/></button>
                <nav className="space-y-4">
                  {NAVIGATION_ITEMS.map(item => (
                    <Link key={item.name} to={item.href} onClick={() => setSidebarOpen(false)} 
                      className={`block py-4 border-b border-gray-50 text-sm font-bold uppercase tracking-widest ${isActive(item.href) ? 'text-black' : 'text-gray-400'}`}>
                      {item.name}
                    </Link>
                  ))}
                </nav>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-[#fafafa] p-6 lg:p-12">
          <div className="max-w-7xl mx-auto">
            <header className="mb-10">
               <h2 className="text-[10px] uppercase tracking-[0.4em] text-gray-400 font-black mb-2">Management</h2>
               <h3 className="text-3xl font-serif italic text-black">لوحة التحكم المركزية</h3>
            </header>
            
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;