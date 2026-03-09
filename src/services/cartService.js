import api from '../../src/api/axios';

class CartService {
  CART_KEY = 'fashion_cart'; // مفتاح مخصص لمشروع الفاشون

  /**
   * جلب محتويات السلة
   */
  async getCart() {
    // أولاً جلب من localStorage
    try {
      const storedCart = localStorage.getItem(this.CART_KEY);
      if (storedCart) {
        const items = JSON.parse(storedCart);
        const total = this.calculateTotal(items);
        return {
          status: true,
          message: '🛍 تم جلب السلة من المتصفح',
          data: { items, total }
        };
      }
    } catch (error) {
      console.error('خطأ في قراءة السلة من المتصفح:', error);
    }

    // إذا كان المستخدم مسجل دخول، حاول جلبها من API
    try {
      const token = localStorage.getItem('fashion_token');
      if (token) {
        const response = await api.get('/cart');
        return response.data;
      }
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('API السلة غير متوفرة، استخدام السلة المحلية');
        return {
          status: true,
          message: '🛍 استخدام السلة المحلية',
          data: { items: [], total: 0 }
        };
      }
      console.error('خطأ في جلب السلة من API:', error);
    }

    // القيمة الافتراضية
    return {
      status: true,
      message: '🛍 السلة فارغة',
      data: { items: [], total: 0 }
    };
  }

  /**
   * مزامنة السلة
   */
  async syncCart(items) {
    try {
      localStorage.setItem(this.CART_KEY, JSON.stringify(items));
      const total = this.calculateTotal(items);

      return {
        status: true,
        message: '✅ تمت المزامنة محلياً',
        data: { items, total }
      };
    } catch (error) {
      console.error('خطأ في مزامنة السلة:', error);
      return {
        status: false,
        message: '❌ حدث خطأ في حفظ السلة'
      };
    }
  }

  /**
   * إفراغ السلة
   */
  async clearCart() {
    try {
      localStorage.removeItem(this.CART_KEY);
      return {
        status: true,
        message: '🗑 تم إفراغ السلة',
        data: { items: [], total: 0 }
      };
    } catch (error) {
      console.error('خطأ في إفراغ السلة:', error);
      return {
        status: false,
        message: '❌ حدث خطأ في إفراغ السلة'
      };
    }
  }

  /**
   * إضافة منتج للسلة
   */
  async addToCart(product, quantity = 1) {
    try {
      const { data: { items } } = await this.getCart();
      const index = items.findIndex(item => item.id === product.id);

      if (index > -1) {
        items[index].quantity += quantity;
      } else {
        items.push({ ...product, quantity });
      }

      return await this.syncCart(items);
    } catch (error) {
      console.error('خطأ في إضافة المنتج للسلة:', error);
      return { status: false, message: '❌ حدث خطأ في إضافة المنتج للسلة' };
    }
  }

  /**
   * إزالة منتج من السلة
   */
  async removeFromCart(productId) {
    try {
      const { data: { items } } = await this.getCart();
      const updatedItems = items.filter(item => item.id !== productId);
      return await this.syncCart(updatedItems);
    } catch (error) {
      console.error('خطأ في إزالة المنتج من السلة:', error);
      return { status: false, message: '❌ حدث خطأ في إزالة المنتج من السلة' };
    }
  }

  /**
   * تحديث كمية منتج
   */
  async updateQuantity(productId, quantity) {
    try {
      if (quantity < 1) return await this.removeFromCart(productId);

      const { data: { items } } = await this.getCart();
      const index = items.findIndex(item => item.id === productId);

      if (index > -1) {
        items[index].quantity = quantity;
        return await this.syncCart(items);
      }

      return { status: false, message: '❌ المنتج غير موجود في السلة' };
    } catch (error) {
      console.error('خطأ في تحديث الكمية:', error);
      return { status: false, message: '❌ حدث خطأ في تحديث الكمية' };
    }
  }

  /**
   * حساب المجموع الكلي
   */
  calculateTotal(items) {
    return items.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
  }

  /**
   * التحقق من وجود منتج في السلة
   */
  async hasProduct(productId) {
    try {
      const { data: { items } } = await this.getCart();
      return items.some(item => item.id === productId);
    } catch {
      return false;
    }
  }

  /**
   * عدد العناصر الكلي
   */
  async getItemCount() {
    try {
      const { data: { items } } = await this.getCart();
      return items.reduce((count, item) => count + (item.quantity || 1), 0);
    } catch {
      return 0;
    }
  }
}

const cartService = new CartService();
export default cartService;