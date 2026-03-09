// services/contactService.js
class ContactService {
  /**
   * التحقق من صحة بيانات نموذج الاتصال
   * @param {Object} data - بيانات النموذج
   * @returns {Object} نتيجة التحقق
   * @private
   */
  validateFormData(data) {
    const errors = [];

    if (!data.name?.trim()) {
      errors.push('📝 الاسم مطلوب');
    }

    if (!data.email?.trim()) {
      errors.push('📧 البريد الإلكتروني مطلوب');
    } else if (!this.isValidEmail(data.email)) {
      errors.push('📧 البريد الإلكتروني غير صالح');
    }

    if (!data.subject?.trim()) {
      errors.push('✏️ الموضوع مطلوب');
    }

    if (!data.message?.trim()) {
      errors.push('💌 الرسالة مطلوبة');
    } else if (data.message.length < 10) {
      errors.push('💌 الرسالة يجب أن تكون 10 أحرف على الأقل');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * التحقق من صحة البريد الإلكتروني
   * @param {string} email - البريد الإلكتروني
   * @returns {boolean} صحة البريد الإلكتروني
   * @private
   */
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * الحصول على جميع الرسائل من localStorage
   * @returns {Array} قائمة الرسائل
   */
  getAllMessages() {
    try {
      const messages = JSON.parse(localStorage.getItem('contact_messages') || '[]');
      return messages.map(msg => ({
        ...msg,
        id: msg.id || Date.now(),
        created_at: msg.date || new Date().toISOString()
      })).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } catch (error) {
      console.error('❌ خطأ في قراءة الرسائل:', error);
      return [];
    }
  }

  /**
   * حفظ جميع الرسائل في localStorage
   * @param {Array} messages - قائمة الرسائل
   */
  saveAllMessages(messages) {
    try {
      localStorage.setItem('contact_messages', JSON.stringify(messages));
    } catch (error) {
      console.error('❌ خطأ في حفظ الرسائل:', error);
    }
  }

  /**
   * إرسال رسالة اتصال (حفظ في localStorage)
   * @param {Object} data - بيانات نموذج الاتصال
   * @returns {Promise<Object>} نتيجة الإرسال
   */
  async sendMessage(data) {
    try {
      const validation = this.validateFormData(data);

      if (!validation.isValid) {
        return {
          status: false,
          message: '❌ يرجى تصحيح الأخطاء التالية',
          errors: validation.errors
        };
      }

      const cleanData = {
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
        phone: data.phone?.trim() || null,
        subject: data.subject.trim(),
        message: data.message.trim()
      };

      const messages = this.getAllMessages();

      const newMessage = {
        ...cleanData,
        id: Date.now(),
        date: new Date().toISOString(),
        status: 'unread',
        read_at: null
      };

      messages.push(newMessage);
      this.saveAllMessages(messages);

      return {
        status: true,
        message: '📩 تم إرسال رسالتك بنجاح. سنتواصل معك قريباً!',
        data: newMessage
      };

    } catch (error) {
      console.error('❌ خطأ في إرسال الرسالة:', error);
      return {
        status: false,
        message: error.message || 'حدث خطأ في إرسال الرسالة'
      };
    }
  }

  /**
   * الحصول على قائمة الرسائل (للوحة التحكم)
   */
  async getMessages() {
    try {
      const messages = this.getAllMessages();
      return {
        status: true,
        data: messages
      };
    } catch (error) {
      console.error('❌ خطأ في جلب الرسائل:', error);
      return {
        status: false,
        data: []
      };
    }
  }

  /**
   * تحديث حالة الرسالة
   */
  async updateMessageStatus(id, status) {
    try {
      const messages = this.getAllMessages();
      const updatedMessages = messages.map(msg =>
        msg.id === id ? { ...msg, status, read_at: new Date().toISOString() } : msg
      );

      this.saveAllMessages(updatedMessages);

      return {
        status: true,
        message: '✅ تم تحديث حالة الرسالة'
      };
    } catch (error) {
      console.error('❌ خطأ في تحديث الحالة:', error);
      return { status: false, message: 'حدث خطأ في تحديث الحالة' };
    }
  }

  /**
   * حذف رسالة
   */
  async deleteMessage(id) {
    try {
      const messages = this.getAllMessages();
      const updatedMessages = messages.filter(msg => msg.id !== id);
      this.saveAllMessages(updatedMessages);

      return { status: true, message: '🗑️ تم حذف الرسالة بنجاح' };
    } catch (error) {
      console.error('❌ خطأ في حذف الرسالة:', error);
      return { status: false, message: 'حدث خطأ في حذف الرسالة' };
    }
  }

  /**
   * حذف جميع الرسائل
   */
  async deleteAllMessages() {
    try {
      localStorage.removeItem('contact_messages');
      return { status: true, message: '🗑️ تم حذف جميع الرسائل' };
    } catch (error) {
      console.error('❌ خطأ في حذف الرسائل:', error);
      return { status: false, message: 'حدث خطأ في حذف الرسائل' };
    }
  }

  /**
   * الحصول على إحصائيات الرسائل
   */
  async getStats() {
    try {
      const messages = this.getAllMessages();
      const total = messages.length;
      const unread = messages.filter(m => m.status === 'unread').length;
      const read = total - unread;

      return {
        status: true,
        data: { total, unread, read }
      };
    } catch (error) {
      console.error('❌ خطأ في جلب الإحصائيات:', error);
      return { status: false, data: { total: 0, unread: 0, read: 0 } };
    }
  }
}

const contactService = new ContactService();
export default contactService;