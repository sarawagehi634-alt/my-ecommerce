import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import MainLayout from '../layouts/MainLayout';
import DashboardLayout from '../layouts/DashboardLayout';

import { useAuth } from '../context/AuthContext';
import Loader from '../components/common/Loader';

/* ===========================
   صفحات الواجهة العامة
=========================== */

import Home from '../pages/interface/Home';
import Products from '../pages/interface/Products';
import ProductDetails from '../pages/interface/ProductDetails';
import Categories from '../pages/interface/Categories';
import CategoryPage from '../pages/interface/CategoryPage';
import Cart from '../pages/interface/Cart';
import Checkout from '../pages/interface/Checkout';
import Orders from '../pages/interface/Orders';
import OrderDetails from '../pages/interface/OrderDetails';
import About from '../pages/interface/About';
import Contact from '../pages/interface/Contact';
import FAQ from '../pages/interface/FAQ';
import Shipping from '../pages/interface/Shipping';
import Returns from '../pages/interface/Returns';
import Wishlist from '../pages/interface/Wishlist';
import Privacy from '../pages/interface/Privacy';
import Terms from '../pages/interface/Terms';

/* ===========================
   صفحات المصادقة
=========================== */

import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';

/* ===========================
   صفحات لوحة التحكم
=========================== */

import DashboardHome from '../pages/dashboard/DashboardHome';

import DashboardProducts from '../pages/dashboard/products/Products';
import AddProduct from '../pages/dashboard/products/AddProduct';
import EditProduct from '../pages/dashboard/products/EditProduct';

import DashboardCategories from '../pages/dashboard/categories/Categories';
import AddCategory from '../pages/dashboard/categories/AddCategory';
import EditCategory from '../pages/dashboard/categories/EditCategory';

import DashboardOrders from '../pages/dashboard/orders/Orders';
import DashboardOrderDetails from '../pages/dashboard/orders/OrderDetails';

import DashboardUsers from '../pages/dashboard/users/Users';
import DashboardSettings from '../pages/dashboard/settings/Settings';
import ContactMessages from '../pages/dashboard/ContactMessages';


/* ===========================
   حماية المسارات
=========================== */

const ProtectedRoute = ({ children, requireAdmin = false }) => {

  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return <Loader text="جاري التحقق من الصلاحيات..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
};


/* ===========================
   منع دخول صفحات تسجيل الدخول
   إذا كان المستخدم مسجل بالفعل
=========================== */

const PublicRoute = ({ children }) => {

  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <Loader text="جاري التحميل..." />;
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
};


/* ===========================
   الراوتر الرئيسي
=========================== */

const AppRouter = () => {

  return (

    <BrowserRouter>

      <Routes>

        {/* =====================
            الواجهة العامة
        ====================== */}

        <Route path="/" element={<MainLayout />}>

          <Route index element={<Home />} />

          <Route path="products" element={<Products />} />

          <Route path="product/:id" element={<ProductDetails />} />

          <Route path="categories" element={<Categories />} />

          <Route path="category/:id" element={<CategoryPage />} />

          <Route path="cart" element={<Cart />} />

          <Route path="about" element={<About />} />

          <Route path="contact" element={<Contact />} />

          <Route path="faq" element={<FAQ />} />

          <Route path="shipping" element={<Shipping />} />

          <Route path="returns" element={<Returns />} />

          <Route path="privacy" element={<Privacy />} />

          <Route path="terms" element={<Terms />} />

          {/* صفحات تحتاج تسجيل دخول */}

          <Route
            path="wishlist"
            element={
              <ProtectedRoute>
                <Wishlist />
              </ProtectedRoute>
            }
          />

          <Route
            path="checkout"
            element={
              <ProtectedRoute>
                <Checkout />
              </ProtectedRoute>
            }
          />

          <Route
            path="orders"
            element={
              <ProtectedRoute>
                <Orders />
              </ProtectedRoute>
            }
          />

          <Route
            path="order/:id"
            element={
              <ProtectedRoute>
                <OrderDetails />
              </ProtectedRoute>
            }
          />

        </Route>


        {/* =====================
            صفحات المصادقة
        ====================== */}

        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />


        {/* =====================
            لوحة التحكم
        ====================== */}

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute requireAdmin>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >

          <Route index element={<DashboardHome />} />

          {/* المنتجات */}

          <Route path="products" element={<DashboardProducts />} />

          <Route path="products/add" element={<AddProduct />} />

          <Route path="products/edit/:id" element={<EditProduct />} />

          {/* التصنيفات */}

          <Route path="categories" element={<DashboardCategories />} />

          <Route path="categories/add" element={<AddCategory />} />

          <Route path="categories/edit/:id" element={<EditCategory />} />

          {/* الطلبات */}

          <Route path="orders" element={<DashboardOrders />} />

          <Route path="orders/:id" element={<DashboardOrderDetails />} />

          {/* المستخدمين */}

          <Route path="users" element={<DashboardUsers />} />

          {/* الإعدادات */}

          <Route path="settings" element={<DashboardSettings />} />

          {/* رسائل التواصل */}

          <Route path="contact-messages" element={<ContactMessages />} />

        </Route>


        {/* تحويل /admin إلى لوحة التحكم */}

        <Route path="/admin" element={<Navigate to="/dashboard" replace />} />


        {/* أي مسار غير موجود */}

        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>

    </BrowserRouter>

  );
};

export default AppRouter;