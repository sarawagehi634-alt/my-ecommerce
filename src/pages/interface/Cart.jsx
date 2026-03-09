import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { 
  FaTrashAlt, FaMinus, FaPlus, FaArrowLeft,
  FaTshirt, FaShoppingBag, FaCreditCard, FaTruck, FaShieldAlt
} from 'react-icons/fa';
import { BiSolidOffer } from 'react-icons/bi';
import toast from 'react-hot-toast';

const Cart = () => {
  const { cartItems, cartTotal, updateQuantity, removeFromCart, clearCart, saveCartToStorage } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // حفظ السلة في localStorage لو المستخدم مش مسجّل دخول
  useEffect(() => {
    if (!isAuthenticated) saveCartToStorage();
  }, [cartItems]);

  const handleCheckout = () => {
    if (!isAuthenticated) {
      toast.error('الرجاء تسجيل الدخول أولاً');
      navigate('/login', { state: { from: '/checkout' } });
    } else {
      navigate('/checkout');
    }
  };

  const handleIncrement = (item) => {
    updateQuantity(item.id, item.quantity + 1);
    toast.success(`تم زيادة كمية ${item.name}`);
  };

  const handleDecrement = (item) => {
    if (item.quantity > 1) {
      updateQuantity(item.id, item.quantity - 1);
      toast.success(`تم تقليل كمية ${item.name}`);
    }
  };

  const handleRemove = (item) => {
    removeFromCart(item.id);
    toast.success(`تم حذف ${item.name} من السلة`);
  };

  const handleClearCart = () => {
    if (window.confirm('هل أنت متأكد من إفراغ السلة؟')) {
      clearCart();
      toast.success('تم إفراغ السلة');
    }
  };

  const formatPrice = (price) => {
    if (price === null || price === undefined) return '0';
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    if (isNaN(numPrice)) return '0';
    return numPrice.toLocaleString('ar-EG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const DEFAULT_IMAGE = 'https://via.placeholder.com/200x200?text=Fashion+Product';

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen py-12 bg-gradient-to-b from-gray-50 to-white" dir="rtl">
        <div className="container-custom text-center py-16 max-w-md mx-auto">
          <div className="w-32 h-32 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-8">
            <FaShoppingBag className="w-16 h-16 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">سلتك فارغة</h2>
          <p className="text-gray-600 mb-8">لم تقم بإضافة أي ملابس أو إكسسوارات بعد</p>
          <Link 
            to="/products"
            className="inline-flex items-center gap-2 bg-gradient-to-l from-purple-600 to-yellow-400 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-yellow-500 transition-all transform hover:scale-105"
          >
            <FaTshirt className="w-5 h-5" />
            اكتشف الملابس
          </Link>
        </div>
      </div>
    );
  }

  const subtotal = cartTotal;
  const tax = subtotal * 0.15;
  const total = subtotal + tax;

  return (
    <div className="min-h-screen py-12 bg-gradient-to-b from-gray-50 to-white" dir="rtl">
      <div className="container-custom">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
            <FaShoppingBag className="w-6 h-6 text-purple-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">سلة التسوق</h1>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              {cartItems.map((item, index) => {
                const itemTotal = item.price * item.quantity;
                return (
                  <div key={item.id} className={`p-6 flex flex-col sm:flex-row gap-6 ${index !== cartItems.length - 1 ? 'border-b border-gray-200' : ''}`}>
                    <Link to={`/product/${item.id}`} className="sm:w-32 flex-shrink-0">
                      <div className="w-full h-32 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                        <img
                          src={item.main_image || item.image || DEFAULT_IMAGE}
                          alt={item.name}
                          className="w-full h-full object-cover"
                          onError={(e) => { e.target.src = DEFAULT_IMAGE; }}
                          loading="lazy"
                        />
                      </div>
                    </Link>

                    <div className="flex-1">
                      <Link to={`/product/${item.id}`}>
                        <h3 className="text-lg font-semibold hover:text-purple-600 transition-colors mb-2">{item.name}</h3>
                      </Link>
                      <div className="mb-4">
                        <span className="text-xl font-bold text-purple-600">{formatPrice(item.price)} ج.م</span>
                        {item.compare_price && item.compare_price > item.price && (
                          <span className="mr-2 text-sm text-gray-400 line-through">{formatPrice(item.compare_price)} ج.م</span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-4 justify-between">
                        <div className="flex items-center border-2 border-gray-200 rounded-lg">
                          <button onClick={() => handleDecrement(item)} className="px-3 py-2 text-gray-600 hover:bg-gray-100" disabled={item.quantity <= 1}><FaMinus className="w-3 h-3" /></button>
                          <span className="w-12 text-center font-semibold text-gray-900">{item.quantity}</span>
                          <button onClick={() => handleIncrement(item)} className="px-3 py-2 text-gray-600 hover:bg-gray-100"><FaPlus className="w-3 h-3" /></button>
                        </div>
                        <div className="text-left">
                          <p className="text-sm text-gray-500">الإجمالي</p>
                          <p className="text-lg font-bold text-purple-600">{formatPrice(itemTotal)} ج.م</p>
                        </div>
                        <button onClick={() => handleRemove(item)} className="text-red-500 hover:text-red-700 transition-colors p-2 rounded-lg">
                          <FaTrashAlt className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              <div className="p-6 bg-gray-50 flex flex-wrap justify-between gap-4">
                <button onClick={handleClearCart} className="text-red-600 hover:text-red-700 font-semibold flex items-center gap-2"><FaTrashAlt className="w-4 h-4" /> إفراغ السلة</button>
                <Link to="/products" className="text-purple-600 hover:text-purple-700 font-semibold flex items-center gap-2"><FaArrowLeft className="w-4 h-4" /> متابعة التسوق</Link>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><BiSolidOffer className="text-purple-600" /> ملخص الطلب</h2>
              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center"><span className="text-gray-600">المجموع الفرعي</span><span className="font-semibold text-gray-900">{formatPrice(subtotal)} ج.م</span></div>
                <div className="flex justify-between items-center"><span className="text-gray-600 flex items-center gap-2"><FaTruck className="text-gray-400" /> الشحن</span><span className="font-semibold text-green-600">مجاني</span></div>
                <div className="flex justify-between items-center"><span className="text-gray-600 flex items-center gap-2"><FaShieldAlt className="text-gray-400" /> الضريبة (15%)</span><span className="font-semibold text-gray-900">{formatPrice(tax)} ج.م</span></div>
                <div className="border-t border-gray-200 pt-4 flex justify-between items-center"><span className="text-lg font-bold">الإجمالي</span><span className="text-2xl font-bold text-purple-600">{formatPrice(total)} ج.م</span></div>
                <p className="text-sm text-gray-500 mt-1">شامل الضريبة</p>
              </div>

              <button onClick={handleCheckout} className="w-full bg-gradient-to-l from-purple-600 to-yellow-400 text-white px-6 py-4 rounded-xl font-semibold hover:from-purple-700 hover:to-yellow-500 flex items-center justify-center gap-2"><FaCreditCard className="w-5 h-5" /> إتمام الطلب</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;