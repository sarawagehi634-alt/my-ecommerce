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
  FaShoppingCart
} from "react-icons/fa";

const ORDER_STATUS = {
  pending: { label: "قيد الانتظار", color: "bg-yellow-100 text-yellow-800", icon: FaHourglassHalf },
  processing: { label: "قيد المعالجة", color: "bg-blue-100 text-blue-800", icon: FaBox },
  shipped: { label: "تم الشحن", color: "bg-purple-100 text-purple-800", icon: FaTruck },
  delivered: { label: "تم التوصيل", color: "bg-green-100 text-green-800", icon: FaCheckCircle },
  cancelled: { label: "ملغي", color: "bg-red-100 text-red-800", icon: FaBan }
};

const OrderDetails = () => {

  const { id } = useParams();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchOrder = async () => {

    setLoading(true);

    try {

      const res = await orderService.getOrder(id);

      if (res?.status) {
        setOrder(res.data);
      }

    } catch (error) {

      toast.error("فشل تحميل الطلب");

    } finally {

      setLoading(false);

    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  if (loading) return <p className="p-6">جاري التحميل...</p>;

  if (!order) return <p className="p-6 text-red-500">لم يتم العثور على الطلب</p>;

  const status = ORDER_STATUS[order.status] || ORDER_STATUS.pending;
  const StatusIcon = status.icon;

  return (
    <div className="p-6 space-y-6">

      <h1 className="text-2xl font-bold">
        تفاصيل الطلب #{order.id}
      </h1>

      <div className="grid md:grid-cols-3 gap-4">

        <div className="bg-white p-4 rounded-xl shadow text-center">
          <FaShoppingCart className="mx-auto text-blue-600 text-xl mb-2" />
          <p>عدد المنتجات</p>
          <p className="font-bold">{order.items?.length || 0}</p>
        </div>

        <div className="bg-white p-4 rounded-xl shadow text-center">
          <FaMoneyBillWave className="mx-auto text-green-600 text-xl mb-2" />
          <p>الإجمالي</p>
          <p className="font-bold">
            {(order.total || 0).toLocaleString("ar-EG")} ج.م
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl shadow text-center">
          <StatusIcon className="mx-auto text-purple-600 text-xl mb-2" />
          <p>الحالة</p>
          <p className="font-bold">{status.label}</p>
        </div>

      </div>

      <div className="bg-white p-6 rounded-xl shadow">

        <h2 className="font-bold mb-3">العميل</h2>

        <p>{order.customer?.name}</p>
        <p>{order.customer?.email}</p>
        <p>{order.customer?.phone}</p>

      </div>

      <div className="bg-white p-6 rounded-xl shadow">

        <h2 className="font-bold mb-3">المنتجات</h2>

        {order.items?.map((item) => (

          <div key={item.id} className="flex justify-between border-b py-2">

            <span>{item.product?.name}</span>

            <span>
              {item.quantity} × {item.price} ج.م
            </span>

          </div>

        ))}

      </div>

    </div>
  );
};

export default OrderDetails;