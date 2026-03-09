// @ts-nocheck
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// استيراد الـ Providers
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';

// استيراد الـ Layouts
import MainLayout from './layouts/MainLayout';
import DashboardLayout from './layouts/DashboardLayout';

// صفحات افتراضية (تقدري تستبدليها بصفحات حقيقية)
const Home = () => (
  <div className="text-center py-20 font-serif italic text-4xl text-gray-900">
    Soo Style: New Collection Coming Soon 👗💖
  </div>
);

const Products = () => (
  <div className="p-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
    {/* هنا ممكن تضعي ProductCard لكل منتج */}
    <div className="p-6 border rounded shadow-sm text-center">Sample Product</div>
    <div className="p-6 border rounded shadow-sm text-center">Sample Product</div>
    <div className="p-6 border rounded shadow-sm text-center">Sample Product</div>
  </div>
);

const Login = () => (
  <div className="p-10 max-w-md mx-auto">
    <h2 className="text-2xl font-semibold mb-4 text-center">تسجيل الدخول</h2>
    <p className="text-sm text-gray-500 text-center">سجلي دخولك لتجربة التسوق المميزة</p>
  </div>
);

const DashboardHome = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold mb-4">Dashboard Overview</h1>
    <p>هنا بيانات لوحة التحكم للفاشون</p>
  </div>
);

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>

            {/* Toasts للفاشون */}
            <Toaster 
              position="top-center"
              toastOptions={{
                duration: 3000,
                style: {
                  background: '#000',
                  color: '#fff',
                  borderRadius: '6px',
                  padding: '12px 18px',
                  fontSize: '13px',
                  letterSpacing: '0.5px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
                }
              }} 
            />

            <Routes>
              {/* === واجهة المتجر (العميل) === */}
              <Route path="/" element={<MainLayout />}>
                <Route index element={<Home />} />
                <Route path="products" element={<Products />} />
                <Route path="login" element={<Login />} />
              </Route>

              {/* === لوحة التحكم (الآدمن) === */}
              <Route path="/dashboard" element={<DashboardLayout />}>
                <Route index element={<DashboardHome />} />
              </Route>

              {/* تحويل أي مسار غير معروف للرئيسية */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>

          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;