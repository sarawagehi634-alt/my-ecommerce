// services/newsletterService.js
import api from '../../src/api/axios';

class NewsletterService {

  /**
   * التحقق من صحة البريد الإلكتروني
   */
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * تنظيف البريد الإلكتروني
   */
  cleanEmail(email) {
    return email?.trim().toLowerCase() || '';
  }

  /**
   * الاشتراك في نشرة الفاشون البريدية
   */
  async subscribe(email) {

    if (!email) {
      return {
        status: false,
        message: '📧 يرجى إدخال البريد الإلكتروني'
      };
    }

    const cleanEmail = this.cleanEmail(email);

    if (!this.isValidEmail(cleanEmail)) {
      return {
        status: false,
        message: '❌ البريد الإلكتروني غير صالح'
      };
    }

    try {

      const response = await api.post('/newsletter/subscribe', {
        email: cleanEmail
      });

      return {
        status: response.data?.status ?? true,
        message: response.data?.message ?? '🎉 تم الاشتراك في نشرة الموضة بنجاح'
      };

    } catch (error) {

      console.error('Newsletter Subscribe Error:', error);

      if (error.response) {
        return {
          status: false,
          message: error.response.data?.message || '❌ هذا البريد مشترك بالفعل'
        };
      }

      if (error.request) {
        return {
          status: false,
          message: '🌐 تعذر الاتصال بالخادم'
        };
      }

      return {
        status: false,
        message: '⚠️ حدث خطأ غير متوقع'
      };
    }
  }

  /**
   * إلغاء الاشتراك من النشرة البريدية
   */
  async unsubscribe(email) {

    if (!email) {
      return {
        status: false,
        message: '📧 البريد الإلكتروني مطلوب'
      };
    }

    const cleanEmail = this.cleanEmail(email);

    if (!this.isValidEmail(cleanEmail)) {
      return {
        status: false,
        message: '❌ البريد الإلكتروني غير صالح'
      };
    }

    try {

      const response = await api.post('/newsletter/unsubscribe', {
        email: cleanEmail
      });

      return {
        status: response.data?.status ?? true,
        message: response.data?.message ?? 'تم إلغاء الاشتراك من نشرة الموضة'
      };

    } catch (error) {

      console.error('Newsletter Unsubscribe Error:', error);

      if (error.response) {
        return {
          status: false,
          message: error.response.data?.message || 'تعذر إلغاء الاشتراك'
        };
      }

      if (error.request) {
        return {
          status: false,
          message: '🌐 مشكلة في الاتصال بالخادم'
        };
      }

      return {
        status: false,
        message: '⚠️ حدث خطأ غير متوقع'
      };
    }
  }

  /**
   * التحقق من حالة الاشتراك
   */
  async checkSubscriptionStatus(email) {

    if (!email) {
      return {
        status: false,
        message: 'البريد الإلكتروني مطلوب',
        isSubscribed: false
      };
    }

    const cleanEmail = this.cleanEmail(email);

    if (!this.isValidEmail(cleanEmail)) {
      return {
        status: false,
        message: 'البريد الإلكتروني غير صالح',
        isSubscribed: false
      };
    }

    try {

      const response = await api.get('/newsletter/status', {
        params: { email: cleanEmail }
      });

      return {
        status: true,
        isSubscribed: response.data?.isSubscribed || false,
        message: 'تم التحقق من حالة الاشتراك'
      };

    } catch (error) {

      console.error('Newsletter Status Error:', error);

      return {
        status: false,
        message: 'تعذر التحقق من حالة الاشتراك',
        isSubscribed: false
      };
    }
  }

  /**
   * إحصائيات النشرة البريدية (Dashboard)
   */
  async getNewsletterStats() {

    try {

      const response = await api.get('/newsletter/stats');

      return {
        status: true,
        data: {
          totalSubscribers: response.data?.totalSubscribers || 0,
          activeSubscribers: response.data?.activeSubscribers || 0,
          subscribedThisMonth: response.data?.subscribedThisMonth || 0,
          unsubscribedThisMonth: response.data?.unsubscribedThisMonth || 0
        },
        message: 'تم جلب إحصائيات نشرة الفاشون'
      };

    } catch (error) {

      console.error('Newsletter Stats Error:', error);

      return {
        status: true,
        data: {
          totalSubscribers: 0,
          activeSubscribers: 0,
          subscribedThisMonth: 0,
          unsubscribedThisMonth: 0
        },
        message: 'بيانات تجريبية'
      };
    }
  }

  /**
   * إرسال نشرة بريدية (لوحة التحكم)
   */
  async sendNewsletter(newsletterData) {

    try {

      if (!newsletterData.subject?.trim()) {
        return {
          status: false,
          message: '✉️ عنوان النشرة مطلوب'
        };
      }

      if (!newsletterData.content?.trim()) {
        return {
          status: false,
          message: '✏️ محتوى النشرة مطلوب'
        };
      }

      const response = await api.post('/newsletter/send', {
        subject: newsletterData.subject.trim(),
        content: newsletterData.content.trim(),
        sendTo: newsletterData.sendTo || 'all'
      });

      return {
        status: true,
        message: response.data?.message || '🚀 تم إرسال نشرة الموضة بنجاح',
        sentCount: response.data?.sentCount || 0
      };

    } catch (error) {

      console.error('Send Newsletter Error:', error);

      return {
        status: false,
        message: error.response?.data?.message || 'تعذر إرسال النشرة البريدية'
      };
    }
  }

}

const newsletterService = new NewsletterService();
export default newsletterService;