// services/orderService.js
import api from '../api/axios';

const STORAGE_KEY = "fashion_orders";

class OrderService {

  // ==================== LocalStorage Helpers ====================
  getLocalOrders() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    } catch (error) {
      console.error('❌ خطأ في قراءة الطلبات المحلية:', error);
      return [];
    }
  }

  saveLocalOrders(orders) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
    } catch (error) {
      console.error('❌ خطأ في حفظ الطلبات المحلية:', error);
    }
  }

  // ==================== جلب الطلبات ====================
  async getOrders(params = {}) {
    try {
      const response = await api.get("/dashboard/orders", { params });
      return response.data;
    } catch (error) {
      console.warn("API غير متاح - استخدام الطلبات المحلية");

      let orders = [...this.getLocalOrders()];

      // بحث
      if (params.search) {
        const search = params.search.toLowerCase();
        orders = orders.filter(order =>
          order.order_number?.toLowerCase().includes(search) ||
          order.customer?.name?.toLowerCase().includes(search) ||
          order.customer?.email?.toLowerCase().includes(search)
        );
      }

      // فلتر الحالة
      if (params.status && params.status !== "all") {
        orders = orders.filter(order => order.status === params.status);
      }

      // فلتر طريقة الدفع
      if (params.payment_method && params.payment_method !== "all") {
        orders = orders.filter(order => order.payment_method === params.payment_method);
      }

      return {
        status: true,
        data: {
          data: orders,
          current_page: 1,
          last_page: 1,
          total: orders.length,
          per_page: params.per_page || 10
        }
      };
    }
  }

  // ==================== جلب طلب واحد ====================
  async getOrder(id) {
    try {
      const response = await api.get(`/dashboard/orders/${id}`);
      return response.data;
    } catch (error) {
      const order = this.getLocalOrders().find(o => o.id == id);
      if (order) return { status: true, data: order };
      throw new Error("❌ الطلب غير موجود");
    }
  }

  // ==================== تحديث حالة الطلب ====================
  async updateOrderStatus(id, status) {
    try {
      const response = await api.patch(`/dashboard/orders/${id}/status`, { status });
      return response.data;
    } catch (error) {
      const orders = this.getLocalOrders();
      const index = orders.findIndex(o => o.id == id);
      if (index !== -1) {
        orders[index].status = status;
        this.saveLocalOrders(orders);
        return { status: true, message: "✅ تم تحديث الحالة محلياً" };
      }
      throw new Error("❌ الطلب غير موجود");
    }
  }

  // ==================== تحديث معلومات الشحن ====================
  async updateShippingInfo(id, shippingData) {
    try {
      const response = await api.patch(`/dashboard/orders/${id}/shipping`, shippingData);
      return response.data;
    } catch (error) {
      const orders = this.getLocalOrders();
      const index = orders.findIndex(o => o.id == id);
      if (index !== -1) {
        orders[index].shipping = { ...orders[index].shipping, ...shippingData };
        this.saveLocalOrders(orders);
        return { status: true, message: "✅ تم تحديث الشحن محلياً" };
      }
      throw new Error("❌ الطلب غير موجود");
    }
  }

  // ==================== إضافة ملاحظة ====================
  async addOrderNote(id, note) {
    try {
      const response = await api.post(`/dashboard/orders/${id}/notes`, { note });
      return response.data;
    } catch (error) {
      const orders = this.getLocalOrders();
      const index = orders.findIndex(o => o.id == id);
      if (index !== -1) {
        orders[index].admin_note = note;
        this.saveLocalOrders(orders);
        return { status: true, message: "✅ تم حفظ الملاحظة محلياً" };
      }
      throw new Error("❌ الطلب غير موجود");
    }
  }

  // ==================== إنشاء طلب جديد ====================
  async createOrder(orderData) {
    try {
      const response = await api.post("/api/v1/orders", orderData);
      return response.data;
    } catch (error) {
      const orders = this.getLocalOrders();
      const newOrder = {
        id: Date.now(),
        order_number: "FS-" + Math.floor(Math.random() * 100000),
        customer: orderData.customer,
        items: orderData.items.map(item => ({
          product_id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
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
      orders.push(newOrder);
      this.saveLocalOrders(orders);
      return { status: true, data: newOrder, message: "✅ تم إنشاء الطلب بنجاح محلياً" };
    }
  }

}

const orderService = new OrderService();
export default orderService;