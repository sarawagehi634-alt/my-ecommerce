import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FaEye,
  FaSearch,
  FaSyncAlt,
  FaBox,
  FaHourglassHalf,
  FaTruck,
  FaCheckDouble,
  FaBan,
  FaMoneyBillWave
} from "react-icons/fa";
import { BiExport } from "react-icons/bi";
import { MdRefresh } from "react-icons/md";
import toast from "react-hot-toast";
import orderService from "../../../services/orderService";

const ORDER_STATUS = {
  pending: {
    label: "قيد الانتظار",
    color: "bg-yellow-100 text-yellow-800",
    icon: FaHourglassHalf
  },
  processing: {
    label: "قيد المعالجة",
    color: "bg-blue-100 text-blue-800",
    icon: FaBox
  },
  shipped: {
    label: "تم الشحن",
    color: "bg-purple-100 text-purple-800",
    icon: FaTruck
  },
  delivered: {
    label: "تم التوصيل",
    color: "bg-green-100 text-green-800",
    icon: FaCheckDouble
  },
  cancelled: {
    label: "ملغي",
    color: "bg-red-100 text-red-800",
    icon: FaBan
  }
};

const PAYMENT_METHODS = {
  bank_transfer: { label: "تحويل بنكي", color: "bg-purple-100 text-purple-800" },
  cod: { label: "الدفع عند الاستلام", color: "bg-green-100 text-green-800" },
  credit_card: { label: "بطاقة ائتمان", color: "bg-blue-100 text-blue-800" },
  paypal: { label: "باي بال", color: "bg-indigo-100 text-indigo-800" }
};

const formatDate = (date) => {
  if (!date) return "";
  return new Date(date).toLocaleDateString("ar-EG");
};

const DashboardOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchOrders = async () => {
    setLoading(true);

    try {
      const res = await orderService.getOrders();

      if (res?.status) {
        setOrders(res.data?.data || []);
      }
    } catch (err) {
      toast.error("فشل تحميل الطلبات");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = orders.filter(
    (o) =>
      o.order_number?.includes(search) ||
      o.customer?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const exportOrders = () => {
    const data = JSON.stringify(orders, null, 2);
    const link = document.createElement("a");

    link.href =
      "data:application/json;charset=utf-8," + encodeURIComponent(data);

    link.download = "orders.json";

    link.click();

    toast.success("تم تصدير الطلبات");
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen" dir="rtl">

      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <FaBox /> الطلبات
      </h1>

      {/* search */}
      <div className="flex gap-3 mb-6">

        <div className="relative flex-1">
          <FaSearch className="absolute right-3 top-3 text-gray-400" />
          <input
            className="w-full pr-10 px-4 py-2 border rounded-lg"
            placeholder="بحث..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <button
          onClick={fetchOrders}
          className="flex items-center gap-2 px-4 py-2 border rounded-lg"
        >
          <MdRefresh /> تحديث
        </button>

        <button
          onClick={exportOrders}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          <BiExport /> تصدير
        </button>
      </div>

      <div className="bg-white rounded-xl shadow overflow-x-auto">

        <table className="w-full">

          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 text-right">رقم الطلب</th>
              <th className="p-3 text-right">العميل</th>
              <th className="p-3 text-right">التاريخ</th>
              <th className="p-3 text-right">الإجمالي</th>
              <th className="p-3 text-right">الحالة</th>
              <th className="p-3 text-right">الدفع</th>
              <th className="p-3 text-right">عرض</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" className="text-center p-6">
                  جاري التحميل...
                </td>
              </tr>
            ) : filteredOrders.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center p-6">
                  لا توجد طلبات
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => {
                const status =
                  ORDER_STATUS[order.status] || ORDER_STATUS.pending;

                const StatusIcon = status.icon;

                const payment =
                  PAYMENT_METHODS[order.payment_method] || {
                    label: "غير محدد",
                    color: "bg-gray-100 text-gray-800"
                  };

                return (
                  <tr key={order.id} className="border-b">

                    <td className="p-3 font-bold">
                      #{order.order_number || order.id}
                    </td>

                    <td className="p-3">
                      {order.customer?.name || "غير معروف"}
                    </td>

                    <td className="p-3">
                      {formatDate(order.created_at)}
                    </td>

                    <td className="p-3">
                      {(order.total || 0).toLocaleString("ar-EG")} ج.م
                    </td>

                    <td className="p-3">
                      <span
                        className={`px-3 py-1 rounded-full text-sm flex items-center gap-1 ${status.color}`}
                      >
                        <StatusIcon /> {status.label}
                      </span>
                    </td>

                    <td className="p-3">
                      <span className={`px-3 py-1 rounded ${payment.color}`}>
                        {payment.label}
                      </span>
                    </td>

                    <td className="p-3">
                      <Link
                        to={`/dashboard/orders/${order.id}`}
                        className="flex items-center gap-1 text-blue-600"
                      >
                        <FaEye /> عرض
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>

        </table>
      </div>
    </div>
  );
};

export default DashboardOrders;