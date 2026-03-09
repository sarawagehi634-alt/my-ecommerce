import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import orderService from "../../../services/orderService";
import toast from "react-hot-toast";
import { 
  FaBox, 
  FaCheckCircle, 
  FaTruck, 
  FaMoneyBillWave, 
  FaBan, 
  FaHourglassHalf, 
  FaSyncAlt, 
  FaShoppingCart, 
  FaGift 
} from "react-icons/fa";

const ORDER_STATUS = {
  pending: { label: "قيد الانتظار", color: "bg-yellow-100 text-yellow-800", icon: FaHourglassHalf },
  processing: { label: "قيد المعالجة", color: "bg-blue-100 text-blue-800", icon: FaBox },
  shipped: { label: "تم الشحن", color: "bg-purple-100 text-purple-800", icon: FaTruck },
  delivered: { label: "تم التوصيل", color: "bg-green-100 text-green-800", icon: FaCheckCircle },
  completed: { label: "مكتمل", color: "bg-green-100 text-green-800", icon: FaCheckCircle },
  cancelled: { label: "ملغي", color: "bg-red-100 text-red-800", icon: FaBan }
};

const PAYMENT_METHODS = {
  bank_transfer: { label: "تحويل بنكي", icon: "🏦" },
  cod: { label: "الدفع عند الاستلام", icon: "💵" },
  credit_card: { label: "بطاقة ائتمان", icon: "💳" },
  paypal: { label: "باي بال", icon: "🌐" },
  wallet: { label: "محفظة إلكترونية", icon: "📱" }
};

const getImageUrl = (imagePath) => {
  if (!imagePath) return 'https://via.placeholder.com/50x50/0284c7/ffffff?text=No+Image';
  if (imagePath.startsWith('http')) return imagePath;
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  return `${API_URL}/${imagePath}`.replace(/([^:]\/)\/+/g, '$1');
};

const OrderDetails = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchOrder = async () => {
    setLoading(true);
    try {
      const res = await orderService.getOrder(id);
      if (res?.status) setOrder(res.data);
    } catch (error) {
      console.error("Error fetching order", error);
      toast.error("فشل تحميل بيانات الطلب");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrder(); }, [id]);

  const handleChangeStatus = async (newStatus) => {
    if (!order) return;
    setUpdatingStatus(true);
    try {
      const res = await orderService.updateOrderStatus(order.id, newStatus);
      if (res?.status) {
        toast.success(`تم تغيير الحالة إلى "${ORDER_STATUS[newStatus].label}"`);
        setOrder(prev => ({ ...prev, status: newStatus }));
      } else {
        toast.error("فشل تغيير الحالة");
      }
    } catch (error) {
      console.error("Error updating status", error);
      toast.error("حدث خطأ أثناء تغيير الحالة");
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading) return <p className="p-6">جاري تحميل الطلب...</p>;
  if (!order) return <p className="p-6 text-red-500">فشل تحميل بيانات الطلب</p>;

  const status = ORDER_STATUS[order.status] || ORDER_STATUS.pending;
  const StatusIcon = status.icon;
  const paymentMethod = PAYMENT_METHODS[order.payment_method] || { label: order.payment_method || "غير محدد" };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold mb-4">تفاصيل الطلب #{order.id}</h1>

      {/* إحصائيات الطلب مع أيقونات */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white shadow rounded-xl p-4 flex flex-col items-center">
          <FaShoppingCart className="text-primary-600 w-6 h-6 mb-2" />
          <span className="text-gray-500 text-sm">عدد المنتجات</span>
          <span className="font-bold text-xl">{order.items?.length || 0}</span>
        </div>
        <div className="bg-white shadow rounded-xl p-4 flex flex-col items-center">
          <FaMoneyBillWave className="text-green-600 w-6 h-6 mb-2" />
          <span className="text-gray-500 text-sm">الإجمالي</span>
          <span className="font-bold text-xl">{(order.total || order.total_amount || 0).toLocaleString('ar-EG')} ج.م</span>
        </div>
        <div className="bg-white shadow rounded-xl p-4 flex flex-col items-center">
          <FaGift className="text-purple-600 w-6 h-6 mb-2" />
          <span className="text-gray-500 text-sm">حالة الدفع</span>
          <span className="font-bold text-xl">{paymentMethod.icon} {paymentMethod.label}</span>
        </div>
        <div className="bg-white shadow rounded-xl p-4 flex flex-col items-center">
          <StatusIcon className="w-6 h-6 mb-2" />
          <span className="text-gray-500 text-sm">حالة الطلب</span>
          <span className="font-bold text-xl">{status.label}</span>
        </div>
      </div>

      {/* تحديث الحالة وطريقة الدفع */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${status.color}`}>
          <StatusIcon className="w-4 h-4" />
          {status.label}
        </div>
        <div className="ml-0 sm:ml-4 inline-flex items-center gap-2 text-sm font-medium">
          <span>طريقة الدفع:</span>
          <span>{paymentMethod.icon} {paymentMethod.label}</span>
        </div>
        <button onClick={fetchOrder} className="flex items-center gap-2 bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">
          <FaSyncAlt /> تحديث
        </button>
      </div>

      {/* زر تغيير الحالة */}
      <div className="flex flex-wrap gap-2 mb-6">
        {Object.keys(ORDER_STATUS).map(key => (
          <button
            key={key}
            disabled={updatingStatus || order.status === key}
            onClick={() => handleChangeStatus(key)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
              order.status === key
                ? "bg-gray-400 text-white cursor-not-allowed"
                : `${ORDER_STATUS[key].color} hover:opacity-80`
            }`}
          >
            {ORDER_STATUS[key].label}
          </button>
        ))}
      </div>

      {/* بيانات العميل */}
      <div className="bg-white shadow rounded-xl p-6">
        <h2 className="font-bold mb-3">بيانات العميل</h2>
        <p>الاسم: {order.customer?.name || order.user?.name || "غير معروف"}</p>
        <p>الايميل: {order.customer?.email || order.user?.email || "غير محدد"}</p>
        <p>الموبايل: {order.customer?.phone || order.user?.phone || "غير محدد"}</p>
      </div>

      {/* عنوان الشحن */}
      <div className="bg-white shadow rounded-xl p-6">
        <h2 className="font-bold mb-3">عنوان الشحن</h2>
        <p>{order.shipping?.address || "غير محدد"}</p>
        <p>{order.shipping?.city || ""}</p>
      </div>

      {/* المنتجات */}
      <div className="bg-white shadow rounded-xl p-6">
        <h2 className="font-bold mb-3">المنتجات</h2>
        <div className="space-y-2">
          {order.items?.map(item => (
            <div key={item.id} className="flex justify-between items-center border-b py-2">
              <div className="flex items-center gap-2">
                <img src={getImageUrl(item.product?.image)} alt={item.product?.name} className="w-12 h-12 object-cover rounded" />
                <span>{item.product?.name || item.name}</span>
              </div>
              <div>{item.quantity} × {item.price?.toLocaleString('ar-EG') || 0} ج.م</div>
            </div>
          ))}
        </div>
        <div className="mt-4 font-bold text-lg">الإجمالي: {(order.total || order.total_amount || 0).toLocaleString('ar-EG')} ج.م</div>
        {order.tax && <div className="text-sm text-gray-600">الضريبة: {order.tax.toLocaleString('ar-EG')} ج.م</div>}
        {order.discount && <div className="text-sm text-gray-600">الخصم: {order.discount.toLocaleString('ar-EG')} ج.م</div>}
      </div>
    </div>
  );
};

export default OrderDetails;