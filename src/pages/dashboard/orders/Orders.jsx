import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaEye, FaSearch, FaSyncAlt, FaBox, FaChartBar, FaHourglassHalf, FaBoxOpen, FaCheckDouble, FaBan, FaMoneyBillWave, FaTruck } from 'react-icons/fa';
import { BiExport } from 'react-icons/bi';
import { MdRefresh } from 'react-icons/md';
import toast from 'react-hot-toast';
import orderService from '../../../services/orderService';

// تعريف الحالات والألوان والأيقونات
const ORDER_STATUS = {
  pending: { label: 'قيد الانتظار', color: 'bg-yellow-100 text-yellow-800', icon: FaHourglassHalf },
  processing: { label: 'قيد المعالجة', color: 'bg-blue-100 text-blue-800', icon: FaBoxOpen },
  shipped: { label: 'تم الشحن', color: 'bg-purple-100 text-purple-800', icon: FaTruck },
  delivered: { label: 'تم التوصيل', color: 'bg-green-100 text-green-800', icon: FaCheckDouble },
  completed: { label: 'مكتمل', color: 'bg-green-100 text-green-800', icon: FaCheckDouble },
  cancelled: { label: 'ملغي', color: 'bg-red-100 text-red-800', icon: FaBan },
  refunded: { label: 'مسترجع', color: 'bg-gray-100 text-gray-800', icon: FaMoneyBillWave }
};

// طرق الدفع
const PAYMENT_METHODS = {
  bank_transfer: { label: 'تحويل بنكي', color: 'bg-purple-100 text-purple-800' },
  cod: { label: 'الدفع عند الاستلام', color: 'bg-green-100 text-green-800' },
  credit_card: { label: 'بطاقة ائتمان', color: 'bg-blue-100 text-blue-800' },
  paypal: { label: 'باي بال', color: 'bg-indigo-100 text-indigo-800' },
  wallet: { label: 'محفظة إلكترونية', color: 'bg-teal-100 text-teal-800' }
};

// تنسيق التاريخ والوقت
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' });
};

const formatTime = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
};

const DashboardOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({ currentPage: 1, lastPage: 1, total: 0, perPage: 10 });
  const [showLocalOnly, setShowLocalOnly] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [stats, setStats] = useState({ total:0, pending:0, processing:0, delivered:0, cancelled:0, revenue:0, local:0 });

  // جلب الطلبات المحلية
  const fetchLocalOrders = () => {
    try {
      return JSON.parse(localStorage.getItem('local_orders') || '[]');
    } catch {
      return [];
    }
  };

  // جلب الطلبات
  const fetchOrders = async (page = 1) => {
    setLoading(true);
    setCurrentPage(page);

    try {
      const localData = fetchLocalOrders();
      const params = { search: search || undefined, page, per_page: pagination.perPage };
      if (statusFilter !== 'all') params.status = statusFilter;

      let apiOrders = [];
      try {
        const response = await orderService.getOrders(params);
        if (response?.status) apiOrders = response.data?.data || [];
      } catch {
        console.log('API غير متاح، عرض الطلبات المحلية فقط');
      }

      let allOrders = [...localData, ...apiOrders];

      // إزالة التكرار
      allOrders = allOrders.filter((order, idx, self) => idx === self.findIndex(o => o.id === order.id));

      // تطبيق الفلاتر
      if (statusFilter !== 'all') allOrders = allOrders.filter(o => o.status === statusFilter);
      if (search) allOrders = allOrders.filter(o => o.order_number?.includes(search) || o.customer?.name?.includes(search));
      if (showLocalOnly) allOrders = allOrders.filter(o => !o.id?.toString().includes('-'));

      setOrders(allOrders);

      setPagination(prev => ({ ...prev, currentPage: page, total: allOrders.length, lastPage: Math.ceil(allOrders.length / prev.perPage) }));

      // احصائيات
      const localOrders = localData;
      setStats({
        total: allOrders.length,
        pending: allOrders.filter(o=>o.status==='pending').length,
        processing: allOrders.filter(o=>o.status==='processing').length,
        delivered: allOrders.filter(o=>['delivered','completed'].includes(o.status)).length,
        cancelled: allOrders.filter(o=>o.status==='cancelled').length,
        revenue: allOrders.reduce((sum,o)=>sum + (o.total || o.total_amount || 0),0),
        local: localOrders.length
      });

    } catch (error) {
      toast.error('حدث خطأ أثناء تحميل الطلبات');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(()=>{ fetchOrders(1); }, [search,statusFilter,showLocalOnly]);

  const refreshOrders = ()=>{ fetchOrders(currentPage); toast.success('تم تحديث الطلبات'); };

  const handleExport = ()=>{
    const dataStr = JSON.stringify(orders,null,2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const link = document.createElement('a');
    link.setAttribute('href', dataUri);
    link.setAttribute('download', `orders_${new Date().toISOString().slice(0,10)}.json`);
    link.click();
    toast.success('تم تصدير الطلبات');
  };

  const syncLocalOrders = async ()=>{
    setSyncing(true);
    const localOrders = fetchLocalOrders();
    if(localOrders.length===0){ toast.info('لا توجد طلبات محلية'); setSyncing(false); return; }
    try {
      let synced = 0;
      for(const order of localOrders){
        try{
          const formData = new FormData();
          formData.append('customer_name', order.customer?.name||'');
          formData.append('customer_email', order.customer?.email||'');
          formData.append('customer_phone', order.customer?.phone||'');
          formData.append('total_amount', order.total || 0);
          order.items?.forEach((item,idx)=>{
            formData.append(`items[${idx}][product_id]`, item.id);
            formData.append(`items[${idx}][quantity]`, item.quantity);
            formData.append(`items[${idx}][price]`, item.price);
          });
          await fetch('/api/v1/orders',{method:'POST',body:formData});
          synced++;
        }catch{continue;}
      }
      if(synced>0){
        localStorage.removeItem('local_orders');
        toast.success(`تمت مزامنة ${synced} طلب`);
        fetchOrders();
      }
    }catch{ toast.error('حدث خطأ أثناء المزامنة'); }
    finally{ setSyncing(false); }
  };

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen" dir="rtl">

      {/* رأس الصفحة */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3"><FaBox className="text-primary-600"/> الطلبات</h1>
        <p className="text-gray-600">إدارة ومتابعة جميع الطلبات</p>
      </div>

      {/* شريط الأدوات */}
      <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex-1 relative w-full">
          <FaSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"/>
          <input type="text" value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="بحث برقم الطلب أو اسم العميل..." className="w-full pr-10 px-4 py-3 border border-gray-200 rounded-xl"/>
        </div>

        <div className="flex gap-3 flex-wrap w-full md:w-auto">
          <button onClick={()=>setShowLocalOnly(!showLocalOnly)} className={`flex items-center gap-2 px-4 py-3 border rounded-xl ${showLocalOnly?'bg-orange-600 text-white':'bg-white text-gray-700'}`}><FaBox/> محلي فقط</button>
          <button onClick={syncLocalOrders} disabled={syncing} className="flex items-center gap-2 px-4 py-3 bg-green-600 text-white rounded-xl">{syncing?<FaSyncAlt className="animate-spin"/>:<FaSyncAlt/>} مزامنة</button>
          <button onClick={refreshOrders} className="flex items-center gap-2 px-4 py-3 border rounded-xl"><MdRefresh/> تحديث</button>
          <button onClick={handleExport} className="flex items-center gap-2 px-4 py-3 bg-primary-600 text-white rounded-xl"><BiExport/> تصدير</button>
        </div>
      </div>

      {/* لوحة الإحصائيات */}
      <div className="mb-6 flex flex-wrap gap-4">
        <div className="bg-white shadow rounded-xl p-4 flex-1">
          <p className="text-gray-500 text-sm">إجمالي الطلبات</p>
          <h2 className="text-xl font-bold text-gray-800">{stats.total}</h2>
        </div>
        <div className="bg-white shadow rounded-xl p-4 flex-1">
          <p className="text-gray-500 text-sm">قيد الانتظار</p>
          <h2 className="text-xl font-bold text-yellow-600">{stats.pending}</h2>
        </div>
        <div className="bg-white shadow rounded-xl p-4 flex-1">
          <p className="text-gray-500 text-sm">قيد المعالجة</p>
          <h2 className="text-xl font-bold text-blue-600">{stats.processing}</h2>
        </div>
        <div className="bg-white shadow rounded-xl p-4 flex-1">
          <p className="text-gray-500 text-sm">تم التوصيل</p>
          <h2 className="text-xl font-bold text-green-600">{stats.delivered}</h2>
        </div>
        <div className="bg-white shadow rounded-xl p-4 flex-1">
          <p className="text-gray-500 text-sm">ملغية</p>
          <h2 className="text-xl font-bold text-red-600">{stats.cancelled}</h2>
        </div>
        <div className="bg-white shadow rounded-xl p-4 flex-1">
          <p className="text-gray-500 text-sm">الإيرادات</p>
          <h2 className="text-xl font-bold text-teal-600">{stats.revenue.toLocaleString('ar-EG')} ج.م</h2>
        </div>
        <div className="bg-white shadow rounded-xl p-4 flex-1">
          <p className="text-gray-500 text-sm">الطلبات المحلية</p>
          <h2 className="text-xl font-bold text-orange-600">{stats.local}</h2>
        </div>
      </div>

      {/* جدول الطلبات */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-4 px-6 text-right">رقم الطلب</th>
                <th className="py-4 px-6 text-right">العميل</th>
                <th className="py-4 px-6 text-right">التاريخ</th>
                <th className="py-4 px-6 text-right">الإجمالي</th>
                <th className="py-4 px-6 text-right">الحالة</th>
                <th className="py-4 px-6 text-right">طريقة الدفع</th>
                <th className="py-4 px-6 text-right">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="py-12 text-center">جاري تحميل الطلبات...</td></tr>
              ):orders.length===0?(
                <tr><td colSpan={7} className="py-12 text-center text-gray-400">لا توجد طلبات</td></tr>
              ):(orders.map(order=>{
                const status = ORDER_STATUS[order.status]||ORDER_STATUS.pending;
                const StatusIcon = status.icon;
                const payment = PAYMENT_METHODS[order.payment_method]||{label:order.payment_method||'غير محدد',color:'bg-gray-100 text-gray-800'};
                const isLocal = !order.id?.toString().includes('-');
                return(
                  <tr key={order.id} className={`border-b border-gray-100 hover:bg-gray-50 ${isLocal?'bg-orange-50/30':''}`}>
                    <td className="py-4 px-6"><Link to={`/dashboard/orders/${order.id}`} className="text-primary-600 font-bold hover:underline">#{order.order_number||order.id}</Link>{isLocal && <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">محلي</span>}</td>
                    <td className="py-4 px-6">{order.customer?.name||'غير معروف'}</td>
                    <td className="py-4 px-6">{formatDate(order.created_at)}<br/><span className="text-gray-500 text-xs">{formatTime(order.created_at)}</span></td>
                    <td className="py-4 px-6">{(order.total||0).toLocaleString('ar-EG')} ج.م</td>
                    <td className="py-4 px-6"><div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm ${status.color}`}><StatusIcon className="w-4 h-4"/>{status.label}</div></td>
                    <td className="py-4 px-6"><span className={`text-sm px-3 py-1 rounded-full ${payment.color}`}>{payment.label}</span></td>
                    <td className="py-4 px-6"><Link to={`/dashboard/orders/${order.id}`} className="flex items-center gap-2 px-4 py-2 bg-primary-50 text-primary-600 rounded-lg"><FaEye/> عرض</Link></td>
                  </tr>
                )
              }))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default DashboardOrders;