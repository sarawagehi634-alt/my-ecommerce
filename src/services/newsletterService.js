import api from '../../src/api/axios';

class NewsletterService {
  isValidEmail(email){ return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); }
  cleanEmail(email){ return email?.trim().toLowerCase()||''; }

  async subscribe(email){
    if(!email) return {status:false,message:'📧 يرجى إدخال البريد الإلكتروني'};
    const clean=this.cleanEmail(email);
    if(!this.isValidEmail(clean)) return {status:false,message:'❌ البريد الإلكتروني غير صالح'};
    try{
      const response=await api.post('/newsletter/subscribe',{email:clean});
      return {status:response.data?.status??true,message:response.data?.message??'🎉 تم الاشتراك بنجاح'};
    }catch(error){
      console.error('Subscribe Error:',error);
      return {status:false,message:error.response?.data?.message||'❌ حدث خطأ'};
    }
  }

  async unsubscribe(email){
    if(!email) return {status:false,message:'📧 البريد الإلكتروني مطلوب'};
    const clean=this.cleanEmail(email);
    if(!this.isValidEmail(clean)) return {status:false,message:'❌ البريد الإلكتروني غير صالح'};
    try{
      const response=await api.post('/newsletter/unsubscribe',{email:clean});
      return {status:response.data?.status??true,message:response.data?.message??'تم إلغاء الاشتراك بنجاح'};
    }catch(error){ console.error('Unsubscribe Error:',error); return {status:false,message:error.response?.data?.message||'تعذر إلغاء الاشتراك'}; }
  }

  async checkSubscriptionStatus(email){
    if(!email) return {status:false,message:'البريد الإلكتروني مطلوب',isSubscribed:false};
    const clean=this.cleanEmail(email);
    if(!this.isValidEmail(clean)) return {status:false,message:'البريد الإلكتروني غير صالح',isSubscribed:false};
    try{ const response=await api.get('/newsletter/status',{params:{email:clean}}); return {status:true,isSubscribed:response.data?.isSubscribed||false,message:'تم التحقق من حالة الاشتراك'}; }
    catch(error){ console.error('Status Error:',error); return {status:false,message:'تعذر التحقق من حالة الاشتراك',isSubscribed:false}; }
  }

  async getNewsletterStats(){
    try{ const response=await api.get('/newsletter/stats'); return {status:true,data:{totalSubscribers:response.data?.totalSubscribers||0, activeSubscribers:response.data?.activeSubscribers||0, subscribedThisMonth:response.data?.subscribedThisMonth||0, unsubscribedThisMonth:response.data?.unsubscribedThisMonth||0}, message:'تم جلب إحصائيات النشرة'}; }
    catch(error){ console.error('Stats Error:',error); return {status:true,data:{totalSubscribers:0, activeSubscribers:0, subscribedThisMonth:0, unsubscribedThisMonth:0}, message:'بيانات تجريبية'}; }
  }

  async sendNewsletter(newsletterData){
    try{
      if(!newsletterData.subject?.trim()) return {status:false,message:'✉️ عنوان النشرة مطلوب'};
      if(!newsletterData.content?.trim()) return {status:false,message:'✏️ محتوى النشرة مطلوب'};
      const response=await api.post('/newsletter/send',{subject:newsletterData.subject.trim(),content:newsletterData.content.trim(),sendTo:newsletterData.sendTo||'all'});
      return {status:true,message:response.data?.message||'🚀 تم إرسال النشرة بنجاح',sentCount:response.data?.sentCount||0};
    }catch(error){ console.error('Send Error:',error); return {status:false,message:error.response?.data?.message||'تعذر إرسال النشرة'}; }
  }
}

const newsletterService = new NewsletterService();
export default newsletterService;