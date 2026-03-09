import api from '../../src/api/axios'; 

class WishlistService {
  /**
   * مفتاح التخزين في localStorage
   * @private
   */
  STORAGE_KEY = 'beautycare_wishlist';

  /**
   * معالجة الأخطاء بشكل موحد
   * @param {Error} error - الخطأ المراد معالجته
   * @param {string} defaultMessage - الرسالة الافتراضية
   * @returns {Object} كائن الخطأ
   * @private
   */
  handleError(error, defaultMessage) {
    console.error(defaultMessage, error);
    
    if (error.response) {
      return {
        status: false,
        message: error.response.data?.message || defaultMessage
      };
    } else if (error.request) {
      return {
        status: false,
        message: 'فشل الاتصال بالخادم'
      };
    } else {
      return {
        status: false,
        message: error.message || defaultMessage
      };
    }
  }

  /**
   * جلب المفضلة من localStorage
   * @returns {Array} المنتجات في المفضلة
   * @private
   */
  getLocalWishlist() {
    try {
      const storedWishlist = localStorage.getItem(this.STORAGE_KEY);
      return storedWishlist ? JSON.parse(storedWishlist) : [];
    } catch (error) {
      console.error('خطأ في قراءة المفضلة من المتصفح:', error);
      return [];
    }
  }

  /**
   * حفظ المفضلة في localStorage
   * @param {Array} wishlist - قائمة المنتجات
   * @returns {boolean} نجاح الحفظ
   * @private
   */
  saveLocalWishlist(wishlist) {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(wishlist));
      return true;
    } catch (error) {
      console.error('خطأ في حفظ المفضلة:', error);
      return false;
    }
  }

  /**
   * مزامنة المفضلة مع API
   * @param {Array} localWishlist - المفضلة المحلية
   * @returns {Promise<boolean>} نجاح المزامنة
   * @private
   */
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

  /**
   * جلب المفضلة
   * يحاول جلب البيانات من API أولاً، ثم يعتمد على localStorage
   * @returns {Promise<Array>} المنتجات في المفضلة
   */
  async getWishlist() {
    // ✅ محاولة جلب البيانات من API أولاً (إذا كان المستخدم مسجل دخوله)
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const response = await api.get('/wishlist');
        
        // إذا نجح الطلب، احفظ البيانات في localStorage وأرجعها
        if (response.data?.data) {
          const apiWishlist = response.data.data;
          this.saveLocalWishlist(apiWishlist);
          return apiWishlist;
        }
      }
    } catch (error) {
      // إذا كان الخطأ 404 (غير موجود)، تجاهله
      if (error.response?.status !== 404) {
        console.error('خطأ في جلب المفضلة من API:', error);
      }
    }

    // ✅ الرجوع إلى localStorage في حالة الفشل
    return this.getLocalWishlist();
  }

  /**
   * إضافة منتج للمفضلة
   * @param {number} productId - معرف المنتج
   * @param {Object} productData - بيانات المنتج الكاملة (اختياري)
   * @returns {Promise<Object>} نتيجة العملية
   */
  async addToWishlist(productId, productData = null) {
    try {
      // التحقق من صحة المعطيات
      if (!productId) {
        return {
          status: false,
          message: 'معرف المنتج مطلوب'
        };
      }

      // جلب المفضلة الحالية
      const currentWishlist = await this.getWishlist();
      
      // التحقق إذا كان المنتج موجود بالفعل
      if (currentWishlist.some(item => item.id === productId)) {
        return {
          status: false,
          message: 'المنتج موجود بالفعل في المفضلة'
        };
      }

      // إنشاء كائن المنتج الجديد
      let newProduct;
      
      if (productData) {
        // استخدام البيانات المقدمة
        newProduct = { ...productData, id: productId };
      } else {
        // محاولة جلب بيانات المنتج من API
        try {
          const response = await api.get(`/products/${productId}`);
          newProduct = response.data?.data || { id: productId };
        } catch {
          // إذا فشل، أنشئ كائن بسيط
          newProduct = { 
            id: productId,
            name: `منتج ${productId}`,
            price: 0
          };
        }
      }

      // إضافة المنتج للمفضلة
      const updatedWishlist = [...currentWishlist, newProduct];
      
      // حفظ في localStorage
      const saved = this.saveLocalWishlist(updatedWishlist);
      
      if (!saved) {
        return {
          status: false,
          message: 'حدث خطأ في حفظ المفضلة'
        };
      }

      // مزامنة مع API إذا كان المستخدم مسجل دخوله
      await this.syncWithApi(updatedWishlist);

      return {
        status: true,
        message: 'تمت إضافة المنتج إلى المفضلة بنجاح',
        data: updatedWishlist
      };
      
    } catch (error) {
      return this.handleError(error, 'حدث خطأ في إضافة المنتج للمفضلة');
    }
  }

  /**
   * إزالة منتج من المفضلة
   * @param {number} productId - معرف المنتج
   * @returns {Promise<Object>} نتيجة العملية
   */
  async removeFromWishlist(productId) {
    try {
      // التحقق من صحة المعطيات
      if (!productId) {
        return {
          status: false,
          message: 'معرف المنتج مطلوب'
        };
      }

      // جلب المفضلة الحالية
      const currentWishlist = await this.getWishlist();
      
      // تصفية المنتجات (إزالة المنتج المطلوب)
      const updatedWishlist = currentWishlist.filter(item => item.id !== productId);
      
      // التحقق إذا تمت الإزالة بالفعل
      if (updatedWishlist.length === currentWishlist.length) {
        return {
          status: false,
          message: 'المنتج غير موجود في المفضلة'
        };
      }

      // حفظ في localStorage
      const saved = this.saveLocalWishlist(updatedWishlist);
      
      if (!saved) {
        return {
          status: false,
          message: 'حدث خطأ في حفظ المفضلة'
        };
      }

      // مزامنة مع API إذا كان المستخدم مسجل دخوله
      await this.syncWithApi(updatedWishlist);

      return {
        status: true,
        message: 'تمت إزالة المنتج من المفضلة بنجاح',
        data: updatedWishlist
      };
      
    } catch (error) {
      return this.handleError(error, 'حدث خطأ في إزالة المنتج من المفضلة');
    }
  }

  /**
   * التحقق إذا المنتج في المفضلة
   * @param {number} productId - معرف المنتج
   * @returns {Promise<boolean>} هل المنتج في المفضلة
   */
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

  /**
   * الحصول على عدد المنتجات في المفضلة
   * @returns {Promise<number>} عدد المنتجات
   */
  async getWishlistCount() {
    try {
      const wishlist = await this.getWishlist();
      return wishlist.length;
    } catch (error) {
      console.error('خطأ في جلب عدد المفضلة:', error);
      return 0;
    }
  }

  /**
   * تفريغ المفضلة بالكامل
   * @returns {Promise<Object>} نتيجة العملية
   */
  async clearWishlist() {
    try {
      // حفظ مصفوفة فارغة في localStorage
      const saved = this.saveLocalWishlist([]);
      
      if (!saved) {
        return {
          status: false,
          message: 'حدث خطأ في تفريغ المفضلة'
        };
      }

      // مزامنة مع API إذا كان المستخدم مسجل دخوله
      await this.syncWithApi([]);

      return {
        status: true,
        message: 'تم تفريغ المفضلة بنجاح'
      };
      
    } catch (error) {
      return this.handleError(error, 'حدث خطأ في تفريغ المفضلة');
    }
  }

  /**
   * إضافة عدة منتجات للمفضلة دفعة واحدة
   * @param {Array<number>} productIds - مصفوفة معرفات المنتجات
   * @returns {Promise<Object>} نتيجة العملية
   */
  async addMultipleToWishlist(productIds) {
    try {
      if (!Array.isArray(productIds) || productIds.length === 0) {
        return {
          status: false,
          message: 'مصفوفة معرفات المنتجات مطلوبة'
        };
      }

      // جلب المفضلة الحالية
      const currentWishlist = await this.getWishlist();
      
      // إنشاء Set للمنتجات الموجودة للبحث السريع
      const existingIds = new Set(currentWishlist.map(item => item.id));
      
      // إضافة المنتجات الجديدة (مع تجنب التكرار)
      const newProducts = productIds
        .filter(id => !existingIds.has(id))
        .map(id => ({ id, name: `منتج ${id}`, price: 0 }));
      
      if (newProducts.length === 0) {
        return {
          status: false,
          message: 'جميع المنتجات موجودة بالفعل في المفضلة'
        };
      }

      // تحديث المفضلة
      const updatedWishlist = [...currentWishlist, ...newProducts];
      
      // حفظ في localStorage
      const saved = this.saveLocalWishlist(updatedWishlist);
      
      if (!saved) {
        return {
          status: false,
          message: 'حدث خطأ في حفظ المفضلة'
        };
      }

      // مزامنة مع API
      await this.syncWithApi(updatedWishlist);

      return {
        status: true,
        message: `تمت إضافة ${newProducts.length} منتج إلى المفضلة بنجاح`,
        added: newProducts.length,
        data: updatedWishlist
      };
      
    } catch (error) {
      return this.handleError(error, 'حدث خطأ في إضافة المنتجات للمفضلة');
    }
  }

  /**
   * تصدير المفضلة
   * @returns {Promise<Array>} المنتجات في المفضلة
   */
  async exportWishlist() {
    try {
      return await this.getWishlist();
    } catch (error) {
      console.error('خطأ في تصدير المفضلة:', error);
      return [];
    }
  }

  /**
   * استيراد مفضلة
   * @param {Array} importedWishlist - المنتجات المستوردة
   * @param {boolean} merge - دمج مع المفضلة الحالية أو استبدالها
   * @returns {Promise<Object>} نتيجة العملية
   */
  async importWishlist(importedWishlist, merge = true) {
    try {
      if (!Array.isArray(importedWishlist)) {
        return {
          status: false,
          message: 'بيانات المفضلة غير صالحة'
        };
      }

      let updatedWishlist;

      if (merge) {
        // دمج مع المفضلة الحالية
        const currentWishlist = await this.getWishlist();
        const existingIds = new Set(currentWishlist.map(item => item.id));
        
        const newItems = importedWishlist.filter(item => !existingIds.has(item.id));
        updatedWishlist = [...currentWishlist, ...newItems];
      } else {
        // استبدال المفضلة الحالية
        updatedWishlist = importedWishlist;
      }

      // حفظ في localStorage
      const saved = this.saveLocalWishlist(updatedWishlist);
      
      if (!saved) {
        return {
          status: false,
          message: 'حدث خطأ في حفظ المفضلة'
        };
      }

      // مزامنة مع API
      await this.syncWithApi(updatedWishlist);

      return {
        status: true,
        message: merge ? 'تم دمج المفضلة بنجاح' : 'تم استيراد المفضلة بنجاح',
        data: updatedWishlist
      };
      
    } catch (error) {
      return this.handleError(error, 'حدث خطأ في استيراد المفضلة');
    }
  }
}

// تصدير نسخة واحدة من الخدمة
const wishlistService = new WishlistService();
export default wishlistService;