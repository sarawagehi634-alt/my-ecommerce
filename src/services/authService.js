import api from '../../src/api/axios';

class AuthService {
  TOKEN_KEY = 'fashion_token';
  USER_KEY = 'fashion_user';

  // تسجيل الدخول
  async login(data) {
    try {
      if (!data?.email || !data?.password) throw new Error('📌 يرجى إدخال البريد الإلكتروني وكلمة المرور');
      const response = await api.post('/login', data);
      if (response.data?.token) this.setSession(response.data);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || '❌ فشل الاتصال بالخادم';
      throw new Error(message);
    }
  }

  // تسجيل مستخدم جديد
  async register(data) {
    try {
      if (!data?.name || !data?.email || !data?.password) throw new Error('📌 جميع الحقول مطلوبة');
      if (data.password !== data.password_confirmation) throw new Error('❌ كلمة المرور غير متطابقة');
      const response = await api.post('/register', data);
      if (response.data?.token) this.setSession(response.data);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || '❌ فشل الاتصال بالخادم';
      throw new Error(message);
    }
  }

  // تسجيل الخروج
  async logout() {
    try { await api.post('/logout'); } catch (error) { console.error('Logout error:', error); }
    finally { this.clearSession(); if (typeof window !== 'undefined') window.location.href = '/login'; }
  }

  // جلب المستخدم الحالي
  async getCurrentUser() {
    try {
      if (!this.getToken()) return null;
      const response = await api.get('/user');
      if (response.data?.data) { this.setUser(response.data.data); return response.data.data; }
      return null;
    } catch (error) {
      if (error.response?.status === 401) this.clearSession();
      return null;
    }
  }

  // إدارة الجلسة
  setSession(authResponse) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.TOKEN_KEY, authResponse.token);
      localStorage.setItem(this.USER_KEY, JSON.stringify(authResponse.user));
    }
  }

  setUser(user) { if (typeof window !== 'undefined') localStorage.setItem(this.USER_KEY, JSON.stringify(user)); }
  getUser() { if (typeof window !== 'undefined') { try { return JSON.parse(localStorage.getItem(this.USER_KEY)); } catch { return null; } } return null; }
  getToken() { return typeof window !== 'undefined' ? localStorage.getItem(this.TOKEN_KEY) : null; }
  isAuthenticated() { return !!this.getToken(); }
  isAdmin() { const user = this.getUser(); return user?.role === 'admin'; }
  clearSession() { if (typeof window !== 'undefined') { localStorage.removeItem(this.TOKEN_KEY); localStorage.removeItem(this.USER_KEY); } }
}

const authService = new AuthService();
export default authService;