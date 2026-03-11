// services/dashboardService.js
import api from '../api/axios';

class DashboardService {

  /**
   * البيانات الافتراضية لإحصائيات لوحة التحكم
   */
  getDefaultStats() {
    return [
      { name: '👗 إجمالي المنتجات', value: '156', change: '+12', color: 'bg-pink-500', link: '/dashboard/products' },
      { name: '📦 الطلبات الجديدة', value: '24', change: '+8', color: 'bg-blue-500', link: '/dashboard/orders?status=pending' },
      { name: '👩‍💻 إجمالي المستخدمين', value: '2,345', change: '+124', color: 'bg-purple-500', link: '/dashboard/users' },
      { name: '💰 المبيعات اليومية', value: '12,450 ج.م', change: '+15%', color: 'bg-green-500', link: '/dashboard/reports' },
    ];
  }

  /**
   * البيانات الافتراضية للطلبات الأخيرة
   */
  getDefaultRecentOrders() {
    return [
      { id: 1, order_number: 'ORD-001', user: { name: 'فاطمة محمد' }, created_at: '2024-01-15', total_amount: 350, status: 'completed' },
      { id: 2, order_number: 'ORD-002', user: { name: 'ندي مسعد' }, created_at: '2024-01-15', total_amount: 520, status: 'processing' },
      { id: 3, order_number: 'ORD-003', user: { name: 'سارة بركات' }, created_at: '2024-01-14', total_amount: 180, status: 'pending' },
    ];
  }

  /**
   * البيانات الافتراضية لأكثر المنتجات مبيعاً
   */
  getDefaultBestSellers() {
    return [
      { id: 1, name: '👗 فستان سهرة', main_image: null, sold_count: 45, total_sales: 5400 },
      { id: 2, name: '👜 حقيبة يد', main_image: null, sold_count: 32, total_sales: 7040 },
      { id: 3, name: '👠 حذاء كعب عالي', main_image: null, sold_count: 28, total_sales: 2660 },
    ];
  }

  /**
   * البيانات الافتراضية لآخر المستخدمين
   */
  getDefaultRecentUsers() {
    return [
      { id: 1, name: 'ليلى سامي', email: 'layla@example.com', created_at: '2024-01-16' },
      { id: 2, name: 'منى حسن', email: 'mona@example.com', created_at: '2024-01-15' },
      { id: 3, name: 'هنا علي', email: 'hena@example.com', created_at: '2024-01-14' },
    ];
  }

  /**
   * جلب إحصائيات لوحة التحكم
   */
  async getStats() {
    try {
      const response = await api.get('/dashboard/stats');
      return response.data || { status: true, data: this.getDefaultStats() };
    } catch (error) {
      console.error('❌ خطأ في جلب الإحصائيات:', error);
      return { status: true, data: this.getDefaultStats() };
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
      return response.data || { status: true, data: this.getDefaultRecentOrders() };
    } catch (error) {
      console.error('❌ خطأ في جلب آخر الطلبات:', error);
      return { status: true, data: this.getDefaultRecentOrders() };
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
      return response.data || { status: true, data: this.getDefaultBestSellers() };
    } catch (error) {
      console.error('❌ خطأ في جلب أكثر المنتجات مبيعاً:', error);
      return { status: true, data: this.getDefaultBestSellers() };
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
      return response.data || { status: true, data: this.getDefaultRecentUsers() };
    } catch (error) {
      console.error('❌ خطأ في جلب آخر المستخدمين:', error);
      return { status: true, data: this.getDefaultRecentUsers() };
    }
  }
}

const dashboardService = new DashboardService();
export default dashboardService;