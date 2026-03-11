import api from '../../src/api/axios';

class CartService {
  CART_KEY = 'fashion_cart';

  async getCart() {
    try {
      const storedCart = localStorage.getItem(this.CART_KEY);
      if (storedCart) {
        const items = JSON.parse(storedCart);
        return { status: true, message: '🛍 تم جلب السلة من المتصفح', data: { items, total: this.calculateTotal(items) } };
      }
    } catch (error) { console.error('خطأ قراءة السلة:', error); }

    try {
      const token = localStorage.getItem('fashion_token');
      if (token) {
        const response = await api.get('/cart');
        return response.data;
      }
    } catch (error) { console.error('خطأ API السلة:', error); }

    return { status: true, message: '🛍 السلة فارغة', data: { items: [], total: 0 } };
  }

  async syncCart(items) {
    try {
      localStorage.setItem(this.CART_KEY, JSON.stringify(items));
      return { status: true, message: '✅ تمت المزامنة محلياً', data: { items, total: this.calculateTotal(items) } };
    } catch (error) { console.error('خطأ المزامنة:', error); return { status: false, message: '❌ حدث خطأ في حفظ السلة' }; }
  }

  async addToCart(product, quantity = 1) {
    try {
      const { data: { items } } = await this.getCart();
      const index = items.findIndex(i => i.id === product.id);
      index > -1 ? items[index].quantity += quantity : items.push({ ...product, quantity });
      return await this.syncCart(items);
    } catch (error) { console.error('خطأ إضافة للسلة:', error); return { status: false, message: '❌ حدث خطأ في إضافة المنتج للسلة' }; }
  }

  async removeFromCart(productId) {
    try {
      const { data: { items } } = await this.getCart();
      return await this.syncCart(items.filter(item => item.id !== productId));
    } catch (error) { console.error('خطأ إزالة منتج:', error); return { status: false, message: '❌ حدث خطأ في إزالة المنتج من السلة' }; }
  }

  async updateQuantity(productId, quantity) {
    try {
      if (quantity < 1) return await this.removeFromCart(productId);
      const { data: { items } } = await this.getCart();
      const index = items.findIndex(i => i.id === productId);
      if (index > -1) { items[index].quantity = quantity; return await this.syncCart(items); }
      return { status: false, message: '❌ المنتج غير موجود في السلة' };
    } catch (error) { console.error('خطأ تحديث الكمية:', error); return { status: false, message: '❌ حدث خطأ في تحديث الكمية' }; }
  }

  calculateTotal(items) { return items.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0); }
  async hasProduct(productId) { try { const { data: { items } } = await this.getCart(); return items.some(i => i.id === productId); } catch { return false; } }
  async getItemCount() { try { const { data: { items } } = await this.getCart(); return items.reduce((count, i) => count + (i.quantity || 1), 0); } catch { return 0; } }
}

const cartService = new CartService();
export default cartService;