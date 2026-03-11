// @ts-nocheck
import React from "react";
import { Link } from "react-router-dom";
import {
  FiPackage,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiTruck,
  FiArrowUpRight
} from "react-icons/fi";
import { motion } from "framer-motion";

/* CONFIG لكل حالة طلب */
const STATUS_CONFIG = {
  pending: { color: "text-amber-600 bg-amber-50", icon: FiClock, text: "قيد المراجعة", progress: 20 },
  processing: { color: "text-blue-600 bg-blue-50", icon: FiPackage, text: "تجهيز الطلب", progress: 45 },
  shipped: { color: "text-indigo-600 bg-indigo-50", icon: FiTruck, text: "خرج للشحن", progress: 75 },
  delivered: { color: "text-emerald-600 bg-emerald-50", icon: FiCheckCircle, text: "تم الاستلام", progress: 100 },
  completed: { color: "text-emerald-600 bg-emerald-50", icon: FiCheckCircle, text: "مكتمل", progress: 100 },
  cancelled: { color: "text-slate-400 bg-slate-100", icon: FiXCircle, text: "ملغي", progress: 0 }
};

const OrderCard = ({ order }) => {
  const status = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
  const StatusIcon = status.icon;

  const getImageUrl = (image) => {
    if (!image) return "https://via.placeholder.com/80x100?text=No+Image";
    return image.startsWith("http") ? image : `${import.meta.env.VITE_API_URL || "http://localhost:8000"}/storage/${image}`;
  };

  return (
    <motion.div 
      whileHover={{ y: -4 }}
      className="bg-white border border-gray-100 rounded-xl overflow-hidden hover:shadow-2xl transition-all duration-500 mb-6"
    >
      <Link to={`/order/${order.id}`} className="block">

        {/* Header */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-gray-50 bg-gray-50/30">
          <div className="flex items-center gap-4">
            <span className="text-[11px] font-black uppercase tracking-widest text-gray-400">Order Ref.</span>
            <span className="font-mono font-bold text-gray-900">#{order.order_number || order.id}</span>
          </div>
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-tighter ${status.color}`}>
            <StatusIcon size={14} />
            {status.text}
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">

            {/* صور المنتجات */}
            <div className="md:col-span-4">
              <div className="flex items-center">
                <div className="flex -space-x-4">
                  {order.items?.slice(0, 3).map((item, idx) => (
                    <div key={idx} className="relative group">
                      <img
                        src={getImageUrl(item.product?.main_image || item.image)}
                        alt={item.product?.name || "Product"}
                        className="w-16 h-20 object-cover rounded-md border-2 border-white shadow-sm transition-transform group-hover:-translate-y-2"
                      />
                    </div>
                  ))}
                  {order.items?.length > 3 && (
                    <div className="w-16 h-20 rounded-md bg-gray-900 text-white flex items-center justify-center text-xs font-bold border-2 border-white">
                      +{order.items.length - 3}
                    </div>
                  )}
                </div>
                <div className="mr-6">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-1">Items</p>
                  <p className="font-bold text-gray-900">{order.items?.length || 0} قطع فريدة</p>
                </div>
              </div>
            </div>

            {/* السعر والوقت */}
            <div className="md:col-span-5 grid grid-cols-2 gap-4 border-r border-gray-50 pr-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-1">Date</p>
                <p className="text-sm font-medium text-gray-700">
                  {new Date(order.created_at).toLocaleDateString('ar-EG', { day: 'numeric', month: 'long' })}
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-1">Amount</p>
                <p className="text-lg font-black text-black">
                  {order.total_amount?.toLocaleString()} <span className="text-[10px]">ج.م</span>
                </p>
              </div>
            </div>

            {/* زر التفاصيل */}
            <div className="md:col-span-3 flex justify-end">
              <div className="flex items-center gap-2 text-gray-900 font-bold text-sm group-hover:gap-4 transition-all">
                <span>تفاصيل الطلب</span>
                <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center">
                  <FiArrowUpRight size={16} />
                </div>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          {order.status !== "cancelled" && (
            <div className="mt-8">
              <div className="flex justify-between text-[9px] uppercase tracking-widest text-gray-400 mb-2">
                <span>Order Placed</span>
                <span>In Transit</span>
                <span>Arrived</span>
              </div>
              <div className="w-full h-[3px] bg-gray-100 rounded-full">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${status.progress}%` }}
                  className="h-full bg-black transition-all duration-1000"
                />
              </div>
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
};

export default OrderCard;