// OrderDetailsFashion.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import orderService from '../../services/orderService';
import Loader from '../../components/common/Loader';
import { 
  FiPackage, 
  FiClock, 
  FiCheckCircle, 
  FiXCircle, 
  FiTruck,
  FiArrowLeft,
  FiDownload,
  FiPrinter
} from 'react-icons/fi';
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

const translatePaymentMethod = (method) => {
  const methods = {
    bank_transfer: 'تحويل بنكي',
    cod: 'الدفع عند الاستلام',
    credit_card: 'بطاقة ائتمان',
    paypal: 'باي بال'
  };
  return methods[method] || method || 'غير محدد';
};

const OrderDetailsFashion = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (id) fetchOrderDetails(); }, [id]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await orderService.getUserOrder(id);
      if (response?.status) setOrder(response.data);
    } catch (error) {
      console.error(error);
      toast.error('حدث خطأ أثناء تحميل الطلب');
      navigate('/orders');
    } finally { setLoading(false); }
  };

  const handlePrint = () => window.print();
  const handleDownloadPDF = () => toast.success('جاري تجهيز ملف PDF...');

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleDateString('ar-SA', {
        year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });
    } catch { return ''; }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return 'https://via.placeholder.com/100x100?text=Clothes';
    if (imagePath.startsWith('http')) return imagePath;
    return `${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/${imagePath}`;
  };

  if (loading) return <Loader text="جاري تحميل تفاصيل الطلب..." />;

  if (!order) return (
    <div className="min-h-screen flex items-center justify-center" dir="rtl">
      <div className="text-center">
        <p className="text-xl text-gray-600 mb-4">الطلب غير موجود</p>
        <Link to="/orders" className="text-purple-600 hover:text-purple-700 font-semibold">العودة إلى الطلبات</Link>
      </div>
    </div>
  );

  const StatusIcon = STATUS_ICON[order.status] || FiPackage;

  return (
    <div className="min-h-screen py-12 bg-pink-50" dir="rtl">
      <div className="container mx-auto px-4 max-w-4xl">

        {/* رأس الصفحة */}
        <div className="mb-6">
          <Link
            to="/orders"
            className="inline-flex items-center text-purple-600 hover:text-purple-700 mb-4 focus:outline-none focus:ring-2 focus:ring-purple-500 rounded-lg px-3 py-2"
          >
            <FiArrowLeft className="ml-2" />
            العودة إلى الطلبات
          </Link>
        </div>

        {/* بطاقة الطلب */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          {/* حالة الطلب */}
          <div className={`p-6 ${STATUS_COLORS[order.status] || 'bg-gray-100'} flex flex-wrap items-center justify-between gap-4`}>
            <div className="flex items-center gap-3">
              <StatusIcon className="w-8 h-8" />
              <div>
                <h2 className="text-xl font-bold">{STATUS_TEXT[order.status] || order.status}</h2>
                <p className="text-sm opacity-90">آخر تحديث: {formatDate(order.updated_at)}</p>
              </div>
            </div>
            <div className="text-left">
              <p className="text-3xl font-bold text-purple-700">{order.total_amount?.toLocaleString('ar-SA')} ر.س</p>
            </div>
          </div>

          {/* معلومات الطلب */}
          <div className="p-6 space-y-6">

            {/* رقم الطلب والتاريخ */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">رقم الطلب</p>
                <p className="text-lg font-bold text-purple-600">#{order.order_number || order.id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">تاريخ الطلب</p>
                <p className="text-lg font-semibold">{formatDate(order.created_at)}</p>
              </div>
            </div>

            {/* المنتجات */}
            <div>
              <h3 className="text-lg font-bold mb-4 text-purple-700">الملابس</h3>
              <div className="space-y-4">
                {order.items?.map((item) => (
                  <div key={item.id} className="flex flex-wrap items-center gap-4 border-b pb-4 last:border-0 hover:bg-pink-50 transition-colors rounded-xl p-2">
                    <img
                      src={getImageUrl(item.product?.main_image)}
                      alt={item.product?.name || item.product_name}
                      className="w-24 h-24 object-cover rounded-xl shadow-sm"
                      onError={(e)=>{ e.target.src='https://via.placeholder.com/100x100?text=Clothes'; }}
                      loading="lazy"
                    />
                    <div className="flex-1 min-w-[200px]">
                      <Link 
                        to={`/product/${item.product_id}`}
                        className="font-semibold hover:text-purple-600 transition-colors rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        {item.product?.name || item.product_name}
                      </Link>
                      <p className="text-sm text-gray-600">
                        الكمية: {item.quantity} × {item.unit_price?.toLocaleString('ar-SA')} ر.س
                      </p>
                    </div>
                    <p className="text-lg font-bold text-purple-600">{item.subtotal?.toLocaleString('ar-SA')} ر.س</p>
                  </div>
                ))}
              </div>
            </div>

            {/* ملخص المبالغ */}
            <div className="border-t border-gray-200 pt-4">
              <div className="space-y-2">
                <div className="flex justify-between"><span className="text-gray-600">المجموع الفرعي</span><span className="font-semibold">{order.total_amount?.toLocaleString('ar-SA')} ر.س</span></div>
                <div className="flex justify-between"><span className="text-gray-600">الشحن</span><span className="font-semibold text-green-600">مجاني</span></div>
                <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-2 mt-2">
                  <span>الإجمالي</span>
                  <span className="text-purple-700">{order.total_amount?.toLocaleString('ar-SA')} ر.س</span>
                </div>
              </div>
            </div>

            {/* أزرار الإجراءات */}
            <div className="border-t border-gray-200 pt-6 flex flex-wrap gap-4">
              <button
                onClick={handlePrint}
                className="flex-1 min-w-[200px] flex items-center justify-center gap-2 border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:border-purple-600 hover:text-purple-600 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <FiPrinter className="w-5 h-5" /> طباعة
              </button>
              <button
                onClick={handleDownloadPDF}
                className="flex-1 min-w-[200px] flex items-center justify-center gap-2 border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:border-purple-600 hover:text-purple-600 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <FiDownload className="w-5 h-5" /> تحميل PDF
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsFashion;