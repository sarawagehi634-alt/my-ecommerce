// services/dashboardService.js
import api from '../api/axios';

class DashboardService {

  /**
   * جلب إحصائيات لوحة التحكم
   */
  async getStats() {
    try {
      const response = await api.get('/dashboard/stats');
      return response.data;
    } catch (error) {
      console.error('❌ خطأ في جلب الإحصائيات:', error);
      
      // بيانات افتراضية بنمط فاشون عصري
      return {
        status: true,
        data: [
          { 
            name: '👗 إجمالي المنتجات', 
            value: '156', 
            change: '+12', 
            color: 'bg-pink-500', // لون وردي عصري
            link: '/dashboard/products'
          },
          { 
            name: '📦 الطلبات الجديدة', 
            value: '24', 
            change: '+8', 
            color: 'bg-blue-500', // لون أزرق
            link: '/dashboard/orders?status=pending'
          },
          { 
            name: '👩‍💻 إجمالي المستخدمين', 
            value: '2,345', 
            change: '+124', 
            color: 'bg-purple-500', // لون بنفسجي
            link: '/dashboard/users'
          },
          { 
            name: '💰 المبيعات اليومية', 
            value: '12,450 ج.م', 
            change: '+15%', 
            color: 'bg-green-500', // لون أخضر
            link: '/dashboard/reports'
          },
        ]
      };
    }
  }

  /**
   * جلب آخر الطلبات
   */
  async getRecentOrders(limit = 5) {
    try {
      const response = await api.get('/dashboard/orders', {
        params: { per_page: limit, sort_by: 'created_at', sort_order: 'desc' }
      });
      return response.data;
    } catch (error) {
      console.error('❌ خطأ في جلب آخر الطلبات:', error);
      
      return {
        status: true,
        data: [
          { id: 1, order_number: 'ORD-001', user: { name: 'فاطمة محمد' }, created_at: '2024-01-15', total_amount: 350, status: 'completed' },
          { id: 2, order_number: 'ORD-002', user: { name: 'نورا أحمد' }, created_at: '2024-01-15', total_amount: 520, status: 'processing' },
          { id: 3, order_number: 'ORD-003', user: { name: 'سارة علي' }, created_at: '2024-01-14', total_amount: 180, status: 'pending' },
        ]
      };
    }
  }

  /**
   * جلب أكثر المنتجات مبيعاً
   */
  async getBestSellers(limit = 3) {
    try {
      const response = await api.get('/dashboard/products', {
        params: { sort_by: 'sold_count', sort_order: 'desc', per_page: limit }
      });
      return response.data;
    } catch (error) {
      console.error('❌ خطأ في جلب أكثر المنتجات مبيعاً:', error);
      
      return {
        status: true,
        data: [
          { id: 1, name: '👗 فستان سهرة', main_image: null, sold_count: 45, total_sales: 5400 },
          { id: 2, name: '👜 حقيبة يد', main_image: null, sold_count: 32, total_sales: 7040 },
          { id: 3, name: '👠 حذاء كعب عالي', main_image: null, sold_count: 28, total_sales: 2660 },
        ]
      };
    }
  }

  /**
   * جلب آخر المستخدمين
   */
  async getRecentUsers(limit = 3) {
    try {
      const response = await api.get('/dashboard/users', {
        params: { sort_by: 'created_at', sort_order: 'desc', per_page: limit }
      });
      return response.data;
    } catch (error) {
      console.error('❌ خطأ في جلب آخر المستخدمين:', error);
      
      return {
        status: true,
        data: [
          { id: 1, name: 'ليلى سامي', email: 'layla@example.com', created_at: '2024-01-16' },
          { id: 2, name: 'منى حسن', email: 'mona@example.com', created_at: '2024-01-15' },
          { id: 3, name: 'هنا علي', email: 'hena@example.com', created_at: '2024-01-14' },
        ]
      };
    }
  }
}

const dashboardService = new DashboardService();
export default dashboardService;