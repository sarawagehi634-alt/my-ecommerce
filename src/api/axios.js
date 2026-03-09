// @ts-nocheck
import axios from 'axios';

/**
 * إعدادات متقدمة لدعم تجربة الـ Fashion:
 * 1. دعم الـ Caching لسرعة التنقل بين الملابس.
 * 2. معالجة ذكية للصور والـ Assets.
 */
const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1',
  timeout: 15000, // زيادة المهلة قليلاً لتحميل صور الـ High-Resolution
  version: 'v1'
};

const api = axios.create({
  baseURL: API_CONFIG.baseURL,
  timeout: API_CONFIG.timeout,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-API-Version': API_CONFIG.version,
    'X-Requested-With': 'XMLHttpRequest'
  },
  withCredentials: true
});

// ذاكرة مؤقتة (Cache) بسيطة لتسريع عرض المنتجات التي تم زيارتها
const responseCache = new Map();

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // إضافة تتبع للوقت والـ Performance
    config.metadata = { startTime: new Date() };
    
    // تنظيف الـ URL
    if (config.url?.startsWith('/api/v1/')) {
      config.url = config.url.replace('/api/v1/', '');
    }

    // [Fashion Logic] إذا كانت البيانات موجودة في الكاش، نستخدمها فوراً لسرعة "خرافية"
    if (config.method === 'get' && responseCache.has(config.url)) {
       // يمكن تفعيل هذا الجزء عند استخدام React Query أو إدارة الحالة
    }

    console.log(`%c [Fashion API] Sending ${config.method?.toUpperCase()} to ${config.url}`, 'color: #00bfff; font-weight: bold');
    
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => {
    const duration = new Date() - response.config.metadata.startTime;
    console.log(`%c [Fashion API] Success: ${response.config.url} (${duration}ms)`, 'color: #32cd32; font-weight: bold');
    
    // تخزين البيانات في الكاش (مثلاً لصفحات الأقسام أو تفاصيل الملابس)
    if (response.config.method === 'get') {
        responseCache.set(response.config.url, response.data);
    }
    
    return response;
  },
  async (error) => {
    const { response, config } = error;
    
    // 1. التعامل مع انقطاع الإنترنت أو وقوع السيرفر (Retry Logic)
    if (!response) {
      if (!config?._retryCount || config._retryCount < 2) {
        config._retryCount = (config._retryCount || 0) + 1;
        console.warn(`[Network] محاولة إعادة الاتصال رقم ${config._retryCount}...`);
        return new Promise(resolve => setTimeout(() => resolve(api(config)), 1500));
      }
      return Promise.reject({ status: false, message: 'تأكد من اتصالك بالإنترنت' });
    }

    const status = response.status;

    // 2. إدارة الجلسة (Authentication)
    if (status === 401) {
      localStorage.clear(); // مسح كل البيانات لضمان نظافة الجلسة
      if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login?expired=true';
      }
      return Promise.reject({ status: false, message: 'انتهت الجلسة' });
    }

    // 3. أخطاء الموضة الشائعة (مثل نفاد الكمية Out of Stock)
    if (status === 422) {
      return Promise.reject({
        status: false,
        message: response.data?.message || 'تأكد من المقاسات أو الكميات المختارة',
        errors: response.data?.errors
      });
    }

    // 4. خطأ السيرفر العام
    if (status >= 500) {
        return Promise.reject({
            status: false,
            message: 'نواجه ضغطاً كبيراً حالياً، حاول مرة أخرى بعد قليل'
        });
    }

    return Promise.reject(response.data || { message: 'حدث خطأ غير متوقع' });
  }
);

export default api;
