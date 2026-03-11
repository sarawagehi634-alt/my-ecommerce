// OrdersFashion.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import orderService from '../../services/orderService';
import { useAuth } from '../../context/AuthContext';
import Loader from '../../components/common/Loader';
import { FiPackage, FiClock, FiCheckCircle, FiXCircle, FiTruck, FiArrowRight } from 'react-icons/fi';
import toast from 'react-hot-toast';

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-purple-100 text-purple-800',
  shipped: 'bg-pink-100 text-pink-800',
  delivered: 'bg-green-100 text-green-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  refunded: 'bg-gray-100 text-gray-800'
};

const STATUS_TEXT = {
  pending: 'قيد الانتظار',
  processing: 'قيد المعالجة',
  shipped: 'تم الشحن',
  delivered: 'تم التوصيل',
  completed: 'مكتمل',
  cancelled: 'ملغي',
  refunded: 'مسترجع'
};

const STATUS_ICON = {
  pending: FiClock,
  processing: FiPackage,
  shipped: FiTruck,
  delivered: FiCheckCircle,
  completed: FiCheckCircle,
  cancelled: FiXCircle,
  refunded: FiXCircle
};

const OrdersFashion = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) fetchOrders();
    else setLoading(false);
  }, [isAuthenticated]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await orderService.getUserOrders();
      if (response?.status) setOrders(response.data?.data || []);
    } catch (error) {
      console.error('خطأ في جلب الطلبات:', error);
      toast.error('حدث خطأ أثناء تحميل الطلبات');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleDateString('ar-SA', {
        year: 'numeric', month: 'short', day: 'numeric'
      });
    } catch { return ''; }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return 'https://via.placeholder.com/50x50?text=Product';
    if (imagePath.startsWith('http')) return imagePath;
    return `${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/${imagePath}`;
  };

  if (loading) return <Loader text="جاري تحميل طلباتك..." />;

  if (!isAuthenticated) return (
    <div className="min-h-screen py-12 bg-pink-50" dir="rtl">
      <div className="container mx-auto px-4 text-center">
        <div className="bg-white rounded-3xl shadow-xl p-12 max-w-md mx-auto">
          <FiPackage className="w-20 h-20 text-purple-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">تسجيل الدخول مطلوب</h2>
          <p className="text-gray-600 mb-8">يرجى تسجيل الدخول لعرض طلباتك</p>
          <Link 
            to="/login" 
            className="bg-purple-600 text-white px-6 py-3 rounded-xl hover:bg-purple-700 transition-colors inline-block focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
          >
            تسجيل الدخول
          </Link>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen py-12 bg-pink-50" dir="rtl">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8 text-purple-700">طلباتي</h1>

        {orders.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl shadow-lg">
            <FiPackage className="w-20 h-20 text-purple-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">لا توجد طلبات</h2>
            <p className="text-gray-600 mb-8">لم تقم بإنشاء أي طلبات بعد</p>
            <Link 
              to="/products" 
              className="bg-purple-600 text-white px-6 py-3 rounded-xl hover:bg-purple-700 transition-colors inline-block"
            >
              تسوق الآن
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const StatusIcon = STATUS_ICON[order.status] || FiPackage;
              return (
                <Link
                  key={order.id}
                  to={`/order/${order.id}`}
                  className="block bg-white rounded-3xl shadow-md hover:shadow-xl transition-shadow p-6 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-4 mb-2">
                        <span className="text-lg font-bold text-purple-600">
                          #{order.order_number || order.id}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1 ${STATUS_COLORS[order.status] || 'bg-gray-100'}`}>
                          <StatusIcon className="w-4 h-4" />
                          {STATUS_TEXT[order.status] || order.status}
                        </span>
                      </div>
                      <p className="text-gray-600">
                        تاريخ الطلب: {formatDate(order.created_at)}
                      </p>

                      {/* شريط حالة مختصر */}
                      <div className="flex items-center mt-2 gap-1">
                        {['pending', 'processing', 'shipped', 'delivered'].map((step, idx) => {
                          const isCompleted = ['pending', 'processing', 'shipped', 'delivered'].indexOf(order.status) >= idx;
                          return (
                            <div key={idx} className={`flex-1 h-2 rounded-full ${isCompleted ? 'bg-purple-600' : 'bg-gray-300'}`} />
                          );
                        })}
                      </div>
                    </div>

                    <div className="text-left">
                      <p className="text-2xl font-bold text-purple-600">
                        {order.total_amount?.toLocaleString('ar-SA')} ر.س
                      </p>
                      <p className="text-sm text-gray-600">
                        {order.items?.length || 0} {order.items?.length === 1 ? 'منتج' : 'منتجات'}
                      </p>
                    </div>
                  </div>

                  {order.items && order.items.length > 0 && (
                    <div className="mt-4 border-t border-gray-200 pt-4">
                      <div className="flex flex-wrap items-center gap-4">
                        {order.items.slice(0, 3).map((item) => (
                          <div key={item.id} className="flex items-center gap-2">
                            <img
                              src={getImageUrl(item.product?.main_image)}
                              alt={item.product?.name || item.product_name}
                              className="w-12 h-12 object-cover rounded-lg shadow-sm"
                              onError={(e) => e.target.src = 'https://via.placeholder.com/50x50?text=Product'}
                              loading="lazy"
                            />
                            <span className="text-sm text-gray-600">
                              {item.product?.name || item.product_name} × {item.quantity}
                            </span>
                          </div>
                        ))}
                        {order.items.length > 3 && (
                          <span className="text-sm text-gray-500">
                            +{order.items.length - 3} منتجات أخرى
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="mt-4 flex items-center gap-2 text-sm text-purple-600 font-semibold">
                    <span>عرض التفاصيل</span>
                    <FiArrowRight className="w-4 h-4" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersFashion;