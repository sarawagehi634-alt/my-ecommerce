// services/orderService.js
import api from '../api/axios';

const STORAGE_KEY = "fashion_orders";

const orderService = {

  // جلب جميع الطلبات
  getOrders: async (params = {}) => {
    try {
      const response = await api.get("/dashboard/orders", { params });
      return response.data;

    } catch (error) {

      console.log("API غير متاح - استخدام الطلبات المحلية");

      const localOrders = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");

      let filteredOrders = [...localOrders];

      // البحث
      if (params.search) {
        const search = params.search.toLowerCase();

        filteredOrders = filteredOrders.filter(order =>
          order.order_number?.toLowerCase().includes(search) ||
          order.customer?.name?.toLowerCase().includes(search) ||
          order.customer?.email?.toLowerCase().includes(search)
        );
      }

      // فلتر الحالة
      if (params.status && params.status !== "all") {
        filteredOrders = filteredOrders.filter(order => order.status === params.status);
      }

      // فلتر الدفع
      if (params.payment_method && params.payment_method !== "all") {
        filteredOrders = filteredOrders.filter(order => order.payment_method === params.payment_method);
      }

      return {
        status: true,
        data: {
          data: filteredOrders,
          current_page: 1,
          last_page: 1,
          total: filteredOrders.length,
          per_page: params.per_page || 10
        }
      };
    }
  },

  // جلب طلب واحد
  getOrder: async (id) => {
    try {

      const response = await api.get(`/dashboard/orders/${id}`);
      return response.data;

    } catch (error) {

      const localOrders = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");

      const order = localOrders.find(o => o.id == id);

      if (order) {
        return {
          status: true,
          data: order
        };
      }

      throw new Error("الطلب غير موجود");
    }
  },

  // تحديث حالة الطلب
  updateOrderStatus: async (id, status) => {
    try {

      const response = await api.patch(`/dashboard/orders/${id}/status`, { status });

      return response.data;

    } catch (error) {

      const localOrders = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");

      const index = localOrders.findIndex(o => o.id == id);

      if (index !== -1) {

        localOrders[index].status = status;

        localStorage.setItem(STORAGE_KEY, JSON.stringify(localOrders));

        return {
          status: true,
          message: "تم تحديث الحالة محلياً"
        };
      }

      throw new Error("الطلب غير موجود");
    }
  },

  // تحديث معلومات الشحن
  updateShippingInfo: async (id, shippingData) => {
    try {

      const response = await api.patch(`/dashboard/orders/${id}/shipping`, shippingData);

      return response.data;

    } catch (error) {

      const localOrders = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");

      const index = localOrders.findIndex(o => o.id == id);

      if (index !== -1) {

        localOrders[index].shipping = {
          ...localOrders[index].shipping,
          ...shippingData
        };

        localStorage.setItem(STORAGE_KEY, JSON.stringify(localOrders));

        return {
          status: true,
          message: "تم تحديث الشحن محلياً"
        };
      }

      throw new Error("الطلب غير موجود");
    }
  },

  // إضافة ملاحظة
  addOrderNote: async (id, note) => {
    try {

      const response = await api.post(`/dashboard/orders/${id}/notes`, { note });

      return response.data;

    } catch (error) {

      const localOrders = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");

      const index = localOrders.findIndex(o => o.id == id);

      if (index !== -1) {

        localOrders[index].admin_note = note;

        localStorage.setItem(STORAGE_KEY, JSON.stringify(localOrders));

        return {
          status: true,
          message: "تم حفظ الملاحظة"
        };
      }

      throw new Error("الطلب غير موجود");
    }
  },

  // إنشاء طلب جديد (مهم لمتجر الفاشون)
  createOrder: async (orderData) => {
    try {

      const response = await api.post("/api/v1/orders", orderData);

      return response.data;

    } catch (error) {

      const localOrders = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");

      const newOrder = {
        id: Date.now(),

        order_number: "FS-" + Math.floor(Math.random() * 100000),

        customer: orderData.customer,

        items: orderData.items.map(item => ({
          product_id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,

          // مهم للفاشون
          size: item.size || null,
          color: item.color || null,
          image: item.image || null
        })),

        total: orderData.total,

        payment_method: orderData.payment_method || "cash",

        status: "pending",

        shipping: orderData.shipping || {},

        created_at: new Date().toISOString()
      };

      localOrders.push(newOrder);

      localStorage.setItem(STORAGE_KEY, JSON.stringify(localOrders));

      return {
        status: true,
        data: newOrder,
        message: "تم إنشاء الطلب بنجاح"
      };
    }
  }

};

export default orderService;