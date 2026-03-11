// Checkout.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import axios from '../../api/axios';
import toast from 'react-hot-toast';
import { 
  FaTruck, FaCreditCard, FaMapMarkerAlt, FaPhone, FaUser,
  FaMoneyBillWave, FaUniversity, FaUpload
} from 'react-icons/fa';

const EGYPT_CITIES = [
  'القاهرة','الإسكندرية','الجيزة','شبرا الخيمة','بورسعيد','السويس',
  'المحلة الكبرى','المنصورة','طنطا','أسيوط','الفيوم','الزقازيق',
  'الإسماعيلية','كفر الشيخ','دمياط','دمنهور','بني سويف','المنيا',
  'سوهاج','قنا','الأقصر','أسوان','العريش','الغردقة','مرسى مطروح'
].sort();

const Checkout = () => {
  const navigate = useNavigate();
  const { cartItems, cartTotal, clearCart } = useCart();
  const { user } = useAuth();

  const [loading, setLoading] = useState(false);
  const [transferImage, setTransferImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    city: '',
    district: '',
    landmark: '',
    paymentMethod: 'bank_transfer',
    notes: ''
  });

  const subtotal = cartTotal || 0;
  const tax = subtotal * 0.14;
  const codFee = 20;
  const total = subtotal + tax + (formData.paymentMethod === 'cod' ? codFee : 0);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return toast.error('حجم الصورة يجب ألا يتجاوز 5 ميجابايت');
    if (!file.type.startsWith('image/')) return toast.error('الرجاء اختيار صورة صالحة (JPG, PNG)');

    setTransferImage(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const removeImage = () => { setTransferImage(null); setImagePreview(null); setUploadProgress(0); };

  const cleanPhoneNumber = (phone) => phone ? phone.replace(/\D/g, '') : '';

  const generateOrderNumber = () => {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
    return `ORD-${year}${month}${day}-${random}`;
  };

  const saveOrderLocally = () => {
    const cleanPhone = cleanPhoneNumber(formData.phone);
    const newOrder = {
      id: Date.now(),
      order_number: generateOrderNumber(),
      date: new Date().toISOString(),
      status: 'pending',
      payment_status: 'pending',
      payment_method: formData.paymentMethod,
      customer: { name: formData.name.trim(), email: formData.email.trim().toLowerCase(), phone: cleanPhone },
      shipping: {
        address: formData.address.trim(),
        city: formData.city.trim(),
        district: formData.district?.trim() || null,
        landmark: formData.landmark?.trim() || null
      },
      items: cartItems.map(item => ({
        id: item.id, name: item.name, price: item.price, quantity: item.quantity,
        subtotal: item.price * item.quantity, image: item.image || null
      })),
      totals: { subtotal, tax, cod_fee: formData.paymentMethod==='cod'?codFee:0, total },
      notes: formData.notes?.trim() || null,
      receipt: imagePreview || null,
      user_id: user?.id || null
    };
    const existingOrders = JSON.parse(localStorage.getItem('local_orders')||'[]');
    existingOrders.push(newOrder);
    localStorage.setItem('local_orders', JSON.stringify(existingOrders));
    localStorage.setItem('last_order', JSON.stringify(newOrder));
    return newOrder;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (cartItems.length === 0) return toast.error('سلة التسوق فارغة');
    if (!formData.name?.trim()) return toast.error('الاسم مطلوب');
    if (!formData.email?.trim()) return toast.error('البريد الإلكتروني مطلوب');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) return toast.error('البريد الإلكتروني غير صالح');
    if (!formData.phone?.trim()) return toast.error('رقم الهاتف مطلوب');
    const phoneRegex = /^(010|011|012|015)[0-9]{8}$/;
    const cleanPhone = cleanPhoneNumber(formData.phone);
    if (!phoneRegex.test(cleanPhone)) return toast.error('رقم الهاتف غير صالح (11 رقم ويبدأ بـ010,011,012,015)');
    if (!formData.address?.trim()) return toast.error('العنوان مطلوب');
    if (!formData.city?.trim()) return toast.error('المدينة مطلوبة');
    if (formData.paymentMethod==='bank_transfer' && !transferImage) return toast.error('الرجاء رفع صورة إيصال التحويل البنكي');

    setLoading(true);
    setUploadProgress(0);
    const interval = setInterval(()=>setUploadProgress(prev=>prev>=90?(clearInterval(interval),90):prev+10),200);

    try {
      const formDataToSend = new FormData();
      cartItems.forEach((item,idx)=>{
        formDataToSend.append(`items[${idx}][product_id]`, item.id);
        formDataToSend.append(`items[${idx}][quantity]`, item.quantity);
        formDataToSend.append(`items[${idx}][price]`, item.price);
      });
      formDataToSend.append('customer_name', formData.name.trim());
      formDataToSend.append('customer_email', formData.email.trim().toLowerCase());
      formDataToSend.append('customer_phone', cleanPhone);
      formDataToSend.append('shipping_address', formData.address.trim());
      formDataToSend.append('shipping_city', formData.city.trim());
      if(formData.district?.trim()) formDataToSend.append('shipping_district',formData.district.trim());
      if(formData.landmark?.trim()) formDataToSend.append('shipping_landmark',formData.landmark.trim());
      formDataToSend.append('payment_method', formData.paymentMethod);
      formDataToSend.append('subtotal', subtotal);
      formDataToSend.append('tax', tax);
      formDataToSend.append('cod_fee', formData.paymentMethod==='cod'?codFee:0);
      formDataToSend.append('total_amount', total);
      if(formData.notes?.trim()) formDataToSend.append('notes',formData.notes.trim());
      if(transferImage) formDataToSend.append('transfer_receipt', transferImage);

      const mainEndpoint = '/api/v1/orders';
      const fallbackEndpoints = ['/orders','/api/orders','/v1/orders','/checkout','/api/checkout'];

      try {
        const response = await axios.post(mainEndpoint, formDataToSend,{ headers:{'Content-Type':'multipart/form-data'}, timeout:5000 });
        clearInterval(interval); setUploadProgress(100);
        toast.success(formData.paymentMethod==='bank_transfer'?'تم استلام طلبك وإيصال التحويل':'تم إنشاء الطلب بنجاح');
        clearCart(); setTimeout(()=>navigate(`/order-success/${response.data.id||response.data.order_id||'new'}`),1000);
      } catch(mainError){
        if(mainError.response?.status===404){
          let fallbackSuccess=false;
          for(const endpoint of fallbackEndpoints){
            try{
              const response = await axios.post(endpoint, formDataToSend,{ headers:{'Content-Type':'multipart/form-data'}, timeout:5000 });
              clearInterval(interval); setUploadProgress(100);
              toast.success(formData.paymentMethod==='bank_transfer'?'تم استلام طلبك وإيصال التحويل':'تم إنشاء الطلب بنجاح');
              clearCart(); setTimeout(()=>navigate(`/order-success/${response.data.id||response.data.order_id||'new'}`),1000);
              fallbackSuccess=true; break;
            }catch(fallbackError){ if(fallbackError.response?.status!==404) throw fallbackError; }
          }
          if(!fallbackSuccess){ const savedOrder = saveOrderLocally(); clearInterval(interval); setUploadProgress(100); toast.success('تم حفظ طلبك بنجاح (وضع التطوير)',{icon:'💾',duration:5000}); clearCart(); setTimeout(()=>navigate(`/order-success/${savedOrder.id}`),1500);}
        }else throw mainError;
      }

    } catch(error){
      clearInterval(interval);
      const savedOrder = saveOrderLocally();
      toast.success('تم حفظ طلبك محلياً للاختبار',{icon:'💾',duration:5000});
      clearCart();
      setTimeout(()=>navigate(`/order-success/${savedOrder.id}`),1500);
    } finally {
      setLoading(false); setTimeout(()=>setUploadProgress(0),2000);
    }
  };

  const formatPrice = (price)=>{
    const num = typeof price==='string'?parseFloat(price):price;
    return isNaN(num)?'0.00':num.toLocaleString('ar-EG',{minimumFractionDigits:2});
  };

  return (
    <div className="min-h-screen py-12 bg-gradient-to-b from-gray-50 to-white" dir="rtl">
      <div className="container-custom px-4 md:px-0">
        <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
          <FaCreditCard className="text-primary-600"/> إتمام الطلب
        </h1>

        {cartItems.length===0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow">
            <p className="text-xl text-gray-600 mb-4">سلة التسوق فارغة</p>
            <Link to="/products" className="bg-gradient-to-l from-primary-600 to-skin-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-primary-700 hover:to-skin-700 transition-all inline-block">
              تسوق الآن
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-8" noValidate>
            {/* LEFT: Form */}
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow space-y-6">
              {/* Name & Contact */}
              <div className="grid sm:grid-cols-2 gap-4">
                <input name="name" value={formData.name} onChange={handleChange} placeholder="الاسم الكامل" className="input-field" required/>
                <input name="email" value={formData.email} onChange={handleChange} placeholder="البريد الإلكتروني" className="input-field" required/>
                <input name="phone" value={formData.phone} onChange={handleChange} placeholder="رقم الهاتف" className="input-field" required/>
              </div>

              {/* Address & City */}
              <div className="grid sm:grid-cols-2 gap-4">
                <input name="address" value={formData.address} onChange={handleChange} placeholder="العنوان" className="input-field" required/>
                <select name="city" value={formData.city} onChange={handleChange} className="input-field" required>
                  <option value="">اختر المدينة</option>
                  {EGYPT_CITIES.map(c=><option key={c} value={c}>{c}</option>)}
                </select>
                <input name="district" value={formData.district} onChange={handleChange} placeholder="الحى" className="input-field"/>
                <input name="landmark" value={formData.landmark} onChange={handleChange} placeholder="معلم قريب (اختياري)" className="input-field"/>
              </div>

              {/* Payment Method */}
              <div className="space-y-2">
                <label className="flex items-center gap-2"><input type="radio" name="paymentMethod" value="bank_transfer" checked={formData.paymentMethod==='bank_transfer'} onChange={handleChange} className="radio-field"/> تحويل بنكي</label>
                <label className="flex items-center gap-2"><input type="radio" name="paymentMethod" value="cod" checked={formData.paymentMethod==='cod'} onChange={handleChange} className="radio-field"/> الدفع عند الاستلام</label>
              </div>

              {/* Upload Transfer Receipt */}
              {formData.paymentMethod==='bank_transfer' && (
                <div>
                  <label className="flex flex-col items-start gap-2 cursor-pointer bg-gray-100 p-4 rounded-lg hover:bg-gray-200 transition-all">
                    <FaUpload /> رفع صورة التحويل البنكي
                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden"/>
                  </label>
                  {imagePreview && (
                    <div className="mt-2 relative">
                      <img src={imagePreview} alt="إيصال التحويل" className="w-32 h-32 object-cover rounded"/>
                      <button type="button" onClick={removeImage} className="absolute top-0 right-0 text-red-600 bg-white rounded-full p-1">×</button>
                    </div>
                  )}
                  {uploadProgress>0 && (
                    <div className="w-full bg-gray-200 h-2 rounded mt-2">
                      <div className="bg-green-500 h-2 rounded" style={{width:`${uploadProgress}%`}}></div>
                    </div>
                  )}
                </div>
              )}

              <textarea name="notes" value={formData.notes} onChange={handleChange} placeholder="ملاحظات إضافية" className="input-field"/>
            </div>

            {/* RIGHT: Summary */}
            <div className="bg-white p-6 rounded-2xl shadow space-y-4">
              <h2 className="text-xl font-bold mb-2">ملخص الطلب</h2>
              <div className="flex justify-between"><span>المجموع الفرعي:</span><span>{formatPrice(subtotal)} ج.م</span></div>
              <div className="flex justify-between"><span>الضريبة (14%):</span><span>{formatPrice(tax)} ج.م</span></div>
              {formData.paymentMethod==='cod' && <div className="flex justify-between"><span>رسوم الدفع عند الاستلام:</span><span>{formatPrice(codFee)} ج.م</span></div>}
              <div className="flex justify-between font-bold text-lg"><span>الإجمالي:</span><span>{formatPrice(total)} ج.م</span></div>
              <button type="submit" disabled={loading} className="w-full bg-gradient-to-l from-purple-600 to-yellow-400 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-yellow-500 transition-all">
                {loading?'جاري إنشاء الطلب...':'تأكيد الطلب'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Checkout;