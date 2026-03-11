// DashboardHome.jsx
import React, { useState, useEffect } from 'react';
import { 
  FaBox, FaShoppingBag, FaUsers, FaMoneyBillWave, FaChartLine,
  FaEye, FaCheckCircle, FaClock, FaSpinner, FaBan
} from 'react-icons/fa';
import { Link } from 'react-router-dom';
import dashboardService from '../../services/dashboardService';
import Loader from '../../components/common/Loader';
import toast from 'react-hot-toast';

// ==============================
// ثوابت ألوان وحالات الطلب
// ==============================
const STATUS_COLORS = {
  completed: 'bg-green-100 text-green-800 border-green-200',
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  processing: 'bg-blue-100 text-blue-800 border-blue-200',
  cancelled: 'bg-red-100 text-red-800 border-red-200'
};

const STATUS_LABELS = {
  completed: { text: 'مكتمل', icon: FaCheckCircle },
  pending: { text: 'قيد الانتظار', icon: FaClock },
  processing: { text: 'قيد المعالجة', icon: FaSpinner },
  cancelled: { text: 'ملغي', icon: FaBan }
};

const ITEMS_PER_PAGE = 5;

// ==============================
// دوال مساعدة
// ==============================
const formatDate = (dateString) => {
  if (!dateString) return '';
  try {
    return new Date(dateString).toLocaleDateString('ar-EG', { year:'numeric', month:'short', day:'numeric' });
  } catch {
    return dateString;
  }
};

const formatRelativeTime = (dateString) => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    if (diffHours < 1) return 'منذ دقائق';
    if (diffHours < 24) return `منذ ${diffHours} ساعة`;
    if (diffHours < 48) return 'منذ يوم';
    return `منذ ${Math.floor(diffHours / 24)} يوم`;
  } catch {
    return '';
  }
};

const formatPrice = (price) => price?.toLocaleString('ar-EG') || '0';

// ==============================
// مكون DashboardHome
// ==============================
const DashboardHome = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [orderFilter, setOrderFilter] = useState('all');
  const [orderSearch, setOrderSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // ==============================
  // جلب بيانات لوحة التحكم
  // ==============================
  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, ordersRes, productsRes, usersRes] = await Promise.all([
        dashboardService.getStats(),
        dashboardService.getRecentOrders(),
        dashboardService.getBestSellers(),
        dashboardService.getRecentUsers()
      ]);
      if (statsRes?.status) setStats(statsRes.data || []);
      if (ordersRes?.status) setRecentOrders(ordersRes.data || []);
      if (productsRes?.status) setBestSellers(productsRes.data || []);
      if (usersRes?.status) setRecentUsers(usersRes.data || []);
    } catch (err) {
      console.error(err);
      toast.error('حدث خطأ في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(() => {
      // يمكنك تحسين هذه الإشعارات لاحقًا لتجنب الـ toast المتكرر
      fetchDashboardData();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // ==============================
  // فلترة الطلبات والصفحات
  // ==============================
  const filteredOrders = recentOrders
    .filter(o => orderFilter === 'all' || o.status === orderFilter)
    .filter(o => 
      o.order_number?.toString().includes(orderSearch) ||
      o.user?.name?.toLowerCase().includes(orderSearch.toLowerCase())
    );

  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  if (loading) return <Loader text="جاري تحميل لوحة التحكم..." />;

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen" dir="rtl">
      
      {/* رأس الصفحة */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">لوحة التحكم</h1>
          <p className="text-gray-600">مرحباً بك في لوحة تحكم بيوتي طوما</p>
        </div>
        <div className="flex items-center gap-2 text-sm bg-white px-4 py-2 rounded-xl shadow-sm">
          <FaChartLine className="text-primary-600" />
          <span className="text-gray-600">
            آخر تحديث: {new Date().toLocaleDateString('ar-EG')}
          </span>
        </div>
      </div>

      {/* الإحصائيات */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, i) => {
          const icons = [FaBox, FaShoppingBag, FaUsers, FaMoneyBillWave];
          const colors = ['bg-blue-500','bg-green-500','bg-purple-500','bg-yellow-500'];
          const Icon = icons[i % icons.length];
          const color = colors[i % colors.length];
          return (
            <Link key={i} to={stat.link || '#'} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  {stat.change && (
                    <p className={`text-xs mt-1 flex items-center gap-1 ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                      <span>{stat.change.startsWith('+') ? '↑' : '↓'}</span>
                      {stat.change} عن الأمس
                    </p>
                  )}
                </div>
                <div className={`${color} w-12 h-12 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* آخر الطلبات */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
        <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-3">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <FaShoppingBag className="text-primary-600"/> آخر الطلبات
          </h2>
          <div className="flex items-center gap-2">
            <input type="text" placeholder="ابحث عن رقم الطلب أو العميل..." value={orderSearch} onChange={e=>{setOrderSearch(e.target.value); setCurrentPage(1);}} className="px-4 py-2 border rounded-lg text-gray-700 focus:outline-none focus:border-primary-500"/>
            <select value={orderFilter} onChange={e=>{setOrderFilter(e.target.value); setCurrentPage(1);}} className="px-4 py-2 border rounded-lg focus:outline-none focus:border-primary-500">
              <option value="all">كل الحالات</option>
              <option value="completed">مكتمل</option>
              <option value="pending">قيد الانتظار</option>
              <option value="processing">قيد المعالجة</option>
              <option value="cancelled">ملغي</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">رقم الطلب</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">العميل</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">التاريخ</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">المبلغ</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">الحالة</th>
              </tr>
            </thead>
            <tbody>
              {paginatedOrders.length ? paginatedOrders.map(order => {
                const status = STATUS_LABELS[order.status] || { text: order.status, icon: FaClock };
                const StatusIcon = status.icon;
                return (
                  <tr key={order.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4"><Link to={`/dashboard/orders/${order.id}`} className="font-medium text-primary-600 hover:text-primary-700">#{order.order_number || order.id}</Link></td>
                    <td className="py-3 px-4 text-gray-700">{order.user?.name || 'غير معروف'}</td>
                    <td className="py-3 px-4 text-gray-600">{formatDate(order.created_at)}</td>
                    <td className="py-3 px-4 font-semibold text-gray-900">{formatPrice(order.total_amount)} ج.م</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm ${STATUS_COLORS[order.status] || 'bg-gray-100'}`}>
                        <StatusIcon className="w-3 h-3"/> {status.text}
                      </span>
                    </td>
                  </tr>
                )
              }) : (
                <tr><td colSpan={5} className="text-center py-8 text-gray-500">لا توجد طلبات</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-4">
            {Array.from({ length: totalPages }, (_, i) => (
              <button key={i} onClick={()=>setCurrentPage(i+1)} className={`px-3 py-1 rounded-lg border ${currentPage===i+1 ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-700 border-gray-300'}`}>
                {i+1}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* إحصائيات إضافية */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* أكثر المنتجات مبيعاً */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><FaBox className="text-primary-600"/> أكثر المنتجات مبيعاً</h3>
          <div className="space-y-3">
            {bestSellers.length ? bestSellers.map(product => (
              <div key={product.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors">
                <div className="flex items-center gap-3">
                  <img src={product.main_image || 'https://via.placeholder.com/50x50'} alt={product.name} className="w-12 h-12 object-cover rounded-lg border border-gray-200" onError={e=>e.target.src='https://via.placeholder.com/50x50/0284c7/ffffff?text=Product'} />
                  <div>
                    <p className="font-medium text-gray-900">{product.name}</p>
                    <p className="text-sm text-gray-500">تم بيع {product.sold_count} وحدة</p>
                  </div>
                </div>
                <span className="font-semibold text-primary-600">{formatPrice(product.total_sales)} ج.م</span>
              </div>
            )) : <p className="text-center text-gray-500 py-4">لا توجد منتجات</p>}
          </div>
        </div>

        {/* آخر المستخدمين */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><FaUsers className="text-primary-600"/> آخر المستخدمين</h3>
          <div className="space-y-3">
            {recentUsers.length ? recentUsers.map(user => (
              <Link key={user.id} to={`/dashboard/users/${user.id}`} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl transition-colors">
                <div className="w-10 h-10 bg-gradient-to-l from-primary-100 to-skin-100 rounded-full flex items-center justify-center">
                  <span className="text-primary-600 font-bold text-sm">{user.name?.charAt(0) || '?'}</span>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500">{formatRelativeTime(user.created_at)}</p>
                </div>
                {user.role===1 && <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">مدير</span>}
              </Link>
            )) : <p className="text-center text-gray-500 py-4">لا يوجد مستخدمين</p>}
          </div>
          <Link to="/dashboard/users" className="mt-4 text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center justify-center gap-1 transition-colors">
            <span>عرض جميع المستخدمين</span> <FaEye className="w-4 h-4"/>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;