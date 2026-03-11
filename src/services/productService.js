// services/productService.js
import api from '../api/axios';

class ProductService {

  // ==================== Helpers ====================
  getDefaultPaginatedData(perPage = 10) {
    return {
      current_page: 1,
      data: [],
      first_page_url: '',
      from: 0,
      last_page: 1,
      last_page_url: '',
      next_page_url: null,
      path: '',
      per_page: perPage,
      prev_page_url: null,
      to: 0,
      total: 0,
      links: []
    };
  }

  handleError(error, defaultMessage) {
    if (error.response) {
      throw new Error(error.response.data?.message || defaultMessage);
    } else if (error.request) {
      throw new Error('❌ فشل الاتصال بالخادم');
    } else {
      throw new Error(error.message || defaultMessage);
    }
  }

  // ==================== Dashboard ====================

  async getProducts(params = {}) {
    try {
      const response = await api.get('/dashboard/products', { params });
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        return {
          status: true,
          message: '👗 لا توجد منتجات',
          data: this.getDefaultPaginatedData(params.per_page || 10)
        };
      }
      this.handleError(error, '❌ حدث خطأ في جلب المنتجات');
    }
  }

  async getProduct(id) {
    try {
      const response = await api.get(`/dashboard/products/${id}`);
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        throw new Error('👗 المنتج غير موجود');
      }
      this.handleError(error, '❌ حدث خطأ في جلب المنتج');
    }
  }

  async createProduct(formData) {
    try {
      const response = await api.post(
        '/dashboard/products',
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' }, timeout: 60000 }
      );
      return response.data;
    } catch (error) {
      this.handleError(error, '❌ حدث خطأ في إنشاء المنتج');
    }
  }

  async updateProduct(id, formData) {
    try {
      const response = await api.post(
        `/dashboard/products/${id}`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      return response.data;
    } catch (error) {
      this.handleError(error, '❌ حدث خطأ في تحديث المنتج');
    }
  }

  async deleteProduct(id) {
    try {
      const response = await api.delete(`/dashboard/products/${id}`);
      return response.data;
    } catch (error) {
      this.handleError(error, '❌ حدث خطأ في حذف المنتج');
    }
  }

  // ==================== Interface (المتجر) ====================

  async getInterfaceProducts(params = {}) {
    try {
      const response = await api.get('/interface/products', {
        params: {
          search: params.search || '',
          category: params.category || '',
          size: params.size || '',
          color: params.color || '',
          min_price: params.min_price || '',
          max_price: params.max_price || '',
          sort: params.sort || 'latest'
        }
      });
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        return { status: true, message: '👗 لا توجد منتجات', data: [] };
      }
      this.handleError(error, '❌ حدث خطأ في جلب المنتجات');
    }
  }

  async getInterfaceProduct(id) {
    try {
      const response = await api.get(`/interface/products/${id}`);
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        throw new Error('👗 المنتج غير موجود');
      }
      this.handleError(error, '❌ حدث خطأ في جلب المنتج');
    }
  }

  async getRelatedProducts(id) {
    try {
      const response = await api.get(`/interface/products/${id}/related`);
      return response.data;
    } catch (error) {
      // fallback للمنتجات المشابهة فارغة عند فشل API
      console.warn('⚠️ خطأ في جلب المنتجات المشابهة:', error);
      return { status: true, data: [] };
    }
  }
}

const productService = new ProductService();
export default productService;