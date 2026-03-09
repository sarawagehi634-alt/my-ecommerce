// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import categoryService from '../../services/categoryService';

import { 
  FiMenu, FiX, FiShoppingCart, FiLogOut,
  FiHeart, FiSearch, FiChevronDown, FiUser, FiArrowLeft
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState([]);
  const [scrolled, setScrolled] = useState(false);

  const { user, isAuthenticated, logout, isAdmin } = useAuth();
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    // جلب الأقسام مع الاحتفاظ بأسماء فاشون
    const fetchCats = async () => {
      try {
        const res = await categoryService.getCategories();
        setCategories(res?.data || []);
      } catch {
        setCategories([
          { id: 1, name: 'وصلنا حديثاً' },
          { id: 2, name: 'الفساتين' },
          { id: 3, name: 'التوب والبلوزات' },
          { id: 4, name: 'الأطقم الكاملة' }
        ]);
      }
    };
    fetchCats();
  }, []);

  return (
    <nav className={`fixed top-0 w-full z-[100] transition-all duration-500 ${
      scrolled ? "bg-white/90 backdrop-blur-md py-3 shadow-sm" : "bg-white py-5"
    }`}>
      <div className="container mx-auto px-6 flex items-center justify-between">
        
        {/* Left: Search & Menu (Mobile) */}
        <div className="flex items-center gap-4 lg:hidden">
          <button onClick={() => setIsOpen(true)} className="p-2"><FiMenu size={24}/></button>
          <button onClick={() => setIsSearchOpen(true)}><FiSearch size={22}/></button>
        </div>

        {/* Center: Logo - البراند هو البطل */}
        <Link to="/" className="absolute left-1/2 -translate-x-1/2 lg:static lg:translate-x-0 order-2">
          <div className="flex flex-col items-center">
            <span className="text-2xl md:text-3xl font-black tracking-tighter uppercase italic leading-none">
             SOO STYLE
            </span>
            <span className="text-[9px] tracking-[0.4em] uppercase text-gray-400 font-bold">Fashion House</span>
          </div>
        </Link>

        {/* Desktop Menu - راقي وبسيط */}
        <div className="hidden lg:flex items-center gap-10 order-1">
          <Link to="/" className={`text-xs font-bold uppercase tracking-widest hover:text-gray-400 transition-colors ${location.pathname === '/' ? 'border-b-2 border-black pb-1' : ''}`}>الرئيسية</Link>
          <Link to="/products" className="text-xs font-bold uppercase tracking-widest hover:text-gray-400 transition-colors">المتجر</Link>
          
          <div className="relative group">
            <button className="flex items-center gap-1 text-xs font-bold uppercase tracking-widest">
              الأقسام <FiChevronDown size={14} className="group-hover:rotate-180 transition-transform duration-300"/>
            </button>
            <div className="absolute top-full -right-4 mt-4 w-56 bg-white shadow-2xl opacity-0 invisible group-hover:visible group-hover:opacity-100 transition-all duration-300 border border-gray-50 py-4">
              {categories.map(cat => (
                <button key={cat.id} onClick={() => navigate(`/category/${cat.id}`)} 
                  className="w-full text-right px-6 py-3 text-[11px] font-bold uppercase tracking-widest hover:bg-gray-50 hover:pr-8 transition-all">
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Icons - نظيفة ومرتبة */}
        <div className="flex items-center gap-3 md:gap-6 order-3">
          <button onClick={() => setIsSearchOpen(true)} className="hidden lg:block hover:scale-110 transition-transform"><FiSearch size={20}/></button>
          
          <Link to="/wishlist" className="relative group">
            <FiHeart size={20} className="group-hover:fill-black transition-colors"/>
            {wishlistCount > 0 && <span className="absolute -top-2 -right-2 bg-black text-white text-[9px] w-4 h-4 flex items-center justify-center rounded-full font-bold">{wishlistCount}</span>}
          </Link>

          <Link to="/cart" className="relative group">
            <FiShoppingCart size={20} />
            {cartCount > 0 && <span className="absolute -top-2 -right-2 bg-black text-white text-[9px] w-4 h-4 flex items-center justify-center rounded-full font-bold">{cartCount}</span>}
          </Link>

          <div className="relative">
            {isAuthenticated ? (
              <button onClick={() => setIsProfileOpen(!isProfileOpen)} className="flex items-center gap-2 border-l border-gray-200 pl-4">
                 <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-[10px] font-bold uppercase">
                   {user?.name?.charAt(0)}
                 </div>
              </button>
            ) : (
              <Link to="/login" className="text-[10px] font-black uppercase tracking-widest border border-black px-4 py-2 hover:bg-black hover:text-white transition-all">دخول</Link>
            )}
          </div>
        </div>
      </div>

      {/* Full Screen Search Overlay - واجهة فاشون حقيقية */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
            className="fixed inset-0 bg-white z-[200] flex flex-col items-center justify-center p-6">
            <button onClick={() => setIsSearchOpen(false)} className="absolute top-10 right-10 p-2 hover:rotate-90 transition-transform"><FiX size={30}/></button>
            <form onSubmit={(e) => { e.preventDefault(); navigate(`/products?search=${searchQuery}`); setIsSearchOpen(false); }} className="w-full max-w-3xl">
              <input 
                autoFocus 
                type="text" 
                placeholder="عما تبحثين اليوم؟" 
                className="w-full text-4xl md:text-6xl font-serif italic border-b-2 border-gray-100 py-4 focus:outline-none focus:border-black transition-colors text-center"
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <p className="text-center mt-6 text-gray-400 uppercase tracking-[0.3em] text-xs">اضغطي Enter للبحث</p>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsOpen(false)} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[150]" />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25 }}
              className="fixed top-0 right-0 h-full w-80 bg-white z-[160] p-10 flex flex-col">
              <button onClick={() => setIsOpen(false)} className="mb-10 flex items-center gap-2 uppercase tracking-widest text-xs font-bold"><FiArrowLeft /> إغلاق</button>
              <div className="flex flex-col gap-8">
                {['الرئيسية', 'المتجر', 'من نحن', 'تواصل معنا'].map(link => (
                  <Link key={link} to="#" className="text-2xl font-serif italic hover:pr-4 transition-all">{link}</Link>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
