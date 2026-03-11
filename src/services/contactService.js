class ContactService {
  validateFormData(data) {
    const errors = [];
    if (!data.name?.trim()) errors.push('📝 الاسم مطلوب');
    if (!data.email?.trim()) errors.push('📧 البريد الإلكتروني مطلوب');
    else if (!this.isValidEmail(data.email)) errors.push('📧 البريد الإلكتروني غير صالح');
    if (!data.subject?.trim()) errors.push('✏️ الموضوع مطلوب');
    if (!data.message?.trim()) errors.push('💌 الرسالة مطلوبة');
    else if (data.message.length < 10) errors.push('💌 الرسالة يجب أن تكون 10 أحرف على الأقل');
    return { isValid: errors.length === 0, errors };
  }

  isValidEmail(email) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); }
  getAllMessages() { try { const messages = JSON.parse(localStorage.getItem('contact_messages') || '[]'); return messages.map(msg => ({ ...msg, id: msg.id || Date.now(), created_at: msg.date || new Date().toISOString() })).sort((a,b)=>new Date(b.created_at)-new Date(a.created_at)); } catch (e) { console.error('❌ خطأ قراءة الرسائل:', e); return []; } }
  saveAllMessages(messages) { try { localStorage.setItem('contact_messages', JSON.stringify(messages)); } catch (e) { console.error('❌ خطأ حفظ الرسائل:', e); } }

  async sendMessage(data) {
    try {
      const validation = this.validateFormData(data);
      if (!validation.isValid) return { status:false, message:'❌ يرجى تصحيح الأخطاء', errors: validation.errors };
      const cleanData = { name:data.name.trim(), email:data.email.trim().toLowerCase(), phone:data.phone?.trim()||null, subject:data.subject.trim(), message:data.message.trim() };
      const messages = this.getAllMessages();
      const newMessage = { ...cleanData, id: Date.now(), date: new Date().toISOString(), status: 'unread', read_at: null };
      messages.push(newMessage); this.saveAllMessages(messages);
      return { status:true, message:'📩 تم إرسال رسالتك بنجاح', data:newMessage };
    } catch (error) { console.error('❌ خطأ إرسال الرسالة:', error); return { status:false, message: error.message||'حدث خطأ في إرسال الرسالة' }; }
  }

  async getMessages() { try { return { status:true, data:this.getAllMessages() }; } catch { return { status:false, data:[] }; } }
  async updateMessageStatus(id,status) { try { const messages=this.getAllMessages(); this.saveAllMessages(messages.map(msg => msg.id===id ? {...msg,status,read_at:new Date().toISOString()}:msg)); return { status:true, message:'✅ تم تحديث حالة الرسالة' }; } catch { return { status:false, message:'حدث خطأ في تحديث الحالة' }; } }
  async deleteMessage(id) { try { const messages=this.getAllMessages(); this.saveAllMessages(messages.filter(msg=>msg.id!==id)); return { status:true, message:'🗑️ تم حذف الرسالة' }; } catch { return { status:false, message:'حدث خطأ في حذف الرسالة' }; } }
  async deleteAllMessages() { try { localStorage.removeItem('contact_messages'); return { status:true, message:'🗑️ تم حذف جميع الرسائل' }; } catch { return { status:false, message:'حدث خطأ في حذف الرسائل' }; } }
  async getStats() { try { const messages=this.getAllMessages(); const total=messages.length, unread=messages.filter(m=>m.status==='unread').length; return { status:true, data:{total, unread, read:total-unread} }; } catch { return { status:false, data:{total:0, unread:0, read:0} }; } }
}

const contactService = new ContactService();
export default contactService;