import api from '../../src/api/axios';

class CategoryService {
  getDefaultPaginatedData(perPage = 10) {
    return { current_page: 1, data: [], first_page_url: '', from: 0, last_page: 1, last_page_url: '', next_page_url: null, path: '', per_page: perPage, prev_page_url: null, to: 0, total: 0, links: [] };
  }

  handleError(error, defaultMessage) {
    if (error.response) throw new Error(error.response.data?.message || defaultMessage);
    else if (error.request) throw new Error('فشل الاتصال بالخادم');
    else throw new Error(error.message || defaultMessage);
  }

  // ===== لوحة التحكم =====
  async getCategories(params = {}) {
    try { const response = await api.get('/dashboard/categories', { params }); return response.data; }
    catch (error) {
      if (error.response?.status === 404) return { status: true, message: '👗 لا توجد أقسام في المتجر', data: this.getDefaultPaginatedData(params.per_page || 10) };
      this.handleError(error, 'حدث خطأ في جلب الأقسام');
    }
  }

  async getCategory(id) { try { const response = await api.get(`/dashboard/categories/${id}`); return response.data; }
    catch (error) { if (error.response?.status === 404) throw new Error('👗 القسم غير موجود'); this.handleError(error, 'حدث خطأ في جلب القسم'); } }

  async createCategory(formData) {
    try { const response = await api.post('/dashboard/categories', formData, { headers: { 'Content-Type': 'multipart/form-data' } }); return response.data; }
    catch (error) { this.handleError(error, '❌ حدث خطأ في إنشاء القسم'); }
  }

  async updateCategory(id, formData) {
    try { formData.append('_method', 'PUT'); const response = await api.post(`/dashboard/categories/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }); return response.data; }
    catch (error) { this.handleError(error, '❌ حدث خطأ في تحديث القسم'); }
  }

  async deleteCategory(id) { try { const response = await api.delete(`/dashboard/categories/${id}`); return response.data; }
    catch (error) { this.handleError(error, '❌ حدث خطأ في حذف القسم'); } }

  async getParentCategories() {
    try { const response = await api.get('/dashboard/categories', { params: { parent_only: 1, per_page: 100 } }); return response.data; }
    catch (error) { if (error.response?.status === 404) return { status: true, message: '👗 لا توجد أقسام رئيسية', data: [] }; this.handleError(error, '❌ حدث خطأ في جلب الأقسام الرئيسية'); }
  }

  // ===== الواجهة العامة =====
  async getInterfaceCategories(params = {}) {
    try { const response = await api.get('/interface/categories', { params }); return response.data; }
    catch (error) { if (error.response?.status === 404) return { status: true, message: '👗 لا توجد أقسام متاحة', data: [] }; this.handleError(error, '❌ حدث خطأ في جلب الأقسام'); }
  }

  async getInterfaceCategory(id) {
    try { const response = await api.get(`/interface/categories/${id}`); return response.data; }
    catch (error) { if (error.response?.status === 404) throw new Error('👗 القسم غير موجود'); this.handleError(error, '❌ حدث خطأ في جلب القسم'); }
  }

  async getCategoryProducts(id, params = {}) {
    try { const response = await api.get(`/interface/categories/${id}/products`, { params }); return response.data; }
    catch (error) { this.handleError(error, '❌ حدث خطأ في جلب منتجات القسم'); }
  }
}

const categoryService = new CategoryService();
export default categoryService;