// services/wishlistService.js
import api from '../../src/api/axios';

class WishlistService {
  STORAGE_KEY = 'beautycare_wishlist';

  // ==================== Helpers ====================
  handleError(error, defaultMessage) {
    console.error('⚠️', defaultMessage, error);

    if (error.response) {
      return { status: false, message: error.response.data?.message || defaultMessage };
    } else if (error.request) {
      return { status: false, message: 'فشل الاتصال بالخادم' };
    } else {
      return { status: false, message: error.message || defaultMessage };
    }
  }

  getLocalWishlist() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('خطأ في قراءة المفضلة من المتصفح:', error);
      return [];
    }
  }

  saveLocalWishlist(wishlist) {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(wishlist));
      return true;
    } catch (error) {
      console.error('خطأ في حفظ المفضلة:', error);
      return false;
    }
  }

  async syncWithApi(localWishlist) {
    try {
      const token = localStorage.getItem('token');
      if (!token) return false;
      await api.post('/wishlist/sync', { items: localWishlist });
      return true;
    } catch (error) {
      console.error('خطأ في مزامنة المفضلة مع API:', error);
      return false;
    }
  }

  // ==================== CRUD ====================
  async getWishlist() {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const response = await api.get('/wishlist');
        if (response.data?.data) {
          const apiWishlist = response.data.data;
          this.saveLocalWishlist(apiWishlist);
          return apiWishlist;
        }
      }
    } catch (error) {
      if (error.response?.status !== 404) console.error('خطأ في جلب المفضلة من API:', error);
    }
    return this.getLocalWishlist();
  }

  async addToWishlist(productId, productData = null) {
    try {
      if (!productId) return { status: false, message: 'معرف المنتج مطلوب' };

      const wishlist = await this.getWishlist();
      if (wishlist.some(item => item.id === productId))
        return { status: false, message: 'المنتج موجود بالفعل في المفضلة' };

      let newProduct = productData ? { ...productData, id: productId } : { id: productId, name: `منتج ${productId}`, price: 0 };

      const updated = [...wishlist, newProduct];
      if (!this.saveLocalWishlist(updated)) return { status: false, message: 'حدث خطأ في حفظ المفضلة' };

      await this.syncWithApi(updated);
      return { status: true, message: 'تمت إضافة المنتج إلى المفضلة بنجاح', data: updated };
    } catch (error) {
      return this.handleError(error, 'حدث خطأ في إضافة المنتج للمفضلة');
    }
  }

  async removeFromWishlist(productId) {
    try {
      if (!productId) return { status: false, message: 'معرف المنتج مطلوب' };

      const wishlist = await this.getWishlist();
      const updated = wishlist.filter(item => item.id !== productId);

      if (updated.length === wishlist.length)
        return { status: false, message: 'المنتج غير موجود في المفضلة' };

      if (!this.saveLocalWishlist(updated)) return { status: false, message: 'حدث خطأ في حفظ المفضلة' };

      await this.syncWithApi(updated);
      return { status: true, message: 'تمت إزالة المنتج من المفضلة بنجاح', data: updated };
    } catch (error) {
      return this.handleError(error, 'حدث خطأ في إزالة المنتج من المفضلة');
    }
  }

  async checkInWishlist(productId) {
    try {
      if (!productId) return false;
      const wishlist = await this.getWishlist();
      return wishlist.some(item => item.id === productId);
    } catch (error) {
      console.error('خطأ في التحقق من المفضلة:', error);
      return false;
    }
  }

  async getWishlistCount() {
    try {
      const wishlist = await this.getWishlist();
      return wishlist.length;
    } catch (error) {
      console.error('خطأ في جلب عدد المفضلة:', error);
      return 0;
    }
  }

  async clearWishlist() {
    try {
      if (!this.saveLocalWishlist([])) return { status: false, message: 'حدث خطأ في تفريغ المفضلة' };
      await this.syncWithApi([]);
      return { status: true, message: 'تم تفريغ المفضلة بنجاح' };
    } catch (error) {
      return this.handleError(error, 'حدث خطأ في تفريغ المفضلة');
    }
  }

  async addMultipleToWishlist(productIds) {
    try {
      if (!Array.isArray(productIds) || !productIds.length)
        return { status: false, message: 'مصفوفة معرفات المنتجات مطلوبة' };

      const wishlist = await this.getWishlist();
      const existingIds = new Set(wishlist.map(item => item.id));
      const newItems = productIds.filter(id => !existingIds.has(id)).map(id => ({ id, name: `منتج ${id}`, price: 0 }));

      if (!newItems.length) return { status: false, message: 'جميع المنتجات موجودة بالفعل في المفضلة' };

      const updated = [...wishlist, ...newItems];
      if (!this.saveLocalWishlist(updated)) return { status: false, message: 'حدث خطأ في حفظ المفضلة' };

      await this.syncWithApi(updated);
      return { status: true, message: `تمت إضافة ${newItems.length} منتج إلى المفضلة بنجاح`, data: updated };
    } catch (error) {
      return this.handleError(error, 'حدث خطأ في إضافة المنتجات للمفضلة');
    }
  }

  async exportWishlist() {
    try {
      return await this.getWishlist();
    } catch (error) {
      console.error('خطأ في تصدير المفضلة:', error);
      return [];
    }
  }

  async importWishlist(importedWishlist, merge = true) {
    try {
      if (!Array.isArray(importedWishlist)) return { status: false, message: 'بيانات المفضلة غير صالحة' };

      let updated;
      if (merge) {
        const wishlist = await this.getWishlist();
        const existingIds = new Set(wishlist.map(item => item.id));
        const newItems = importedWishlist.filter(item => !existingIds.has(item.id));
        updated = [...wishlist, ...newItems];
      } else {
        updated = importedWishlist;
      }

      if (!this.saveLocalWishlist(updated)) return { status: false, message: 'حدث خطأ في حفظ المفضلة' };
      await this.syncWithApi(updated);

      return { status: true, message: merge ? 'تم دمج المفضلة بنجاح' : 'تم استيراد المفضلة بنجاح', data: updated };
    } catch (error) {
      return this.handleError(error, 'حدث خطأ في استيراد المفضلة');
    }
  }
}

// ==================== Export ====================
const wishlistService = new WishlistService();
export default wishlistService;