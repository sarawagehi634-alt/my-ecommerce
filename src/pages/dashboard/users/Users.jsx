import React, { useState, useEffect } from 'react';
import { 
  FaSearch, FaEdit, FaTrashAlt, FaUserPlus, FaEnvelope, FaPhone,
  FaTimes, FaEye, FaUserTie, FaUser, FaShoppingBag, FaMoneyBillWave,
  FaCheckCircle, FaBan
} from 'react-icons/fa';
import Table from '../../../components/ui/Table';
import Button from '../../../components/ui/Button';
import toast from 'react-hot-toast';

/** ==============================
 * ثوابت الألوان والايقونات
 * ============================== */
const ROLE_COLORS = { 1:'bg-purple-100 text-purple-800 border-purple-200', 0:'bg-blue-100 text-blue-800 border-blue-200' };
const ROLE_LABELS = { 1:{text:'مدير', icon: FaUserTie}, 0:{text:'عميل', icon: FaUser} };
const STATUS_COLORS = { active:'bg-green-100 text-green-800 border-green-200', inactive:'bg-gray-100 text-gray-800 border-gray-200', banned:'bg-red-100 text-red-800 border-red-200' };
const STATUS_LABELS = { active:{text:'نشط', icon: FaCheckCircle}, inactive:{text:'غير نشط', icon: FaBan}, banned:{text:'محظور', icon: FaBan} };

/** ==============================
 * دوال مساعدة
 * ============================== */
const formatEgyptPhone = (phone) => {
  if (!phone) return 'غير متوفر';
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('20')) return `+${cleaned}`;
  if (cleaned.length === 11) return `+2${cleaned}`;
  if (cleaned.length === 10) return `+20${cleaned}`;
  return phone;
};
const formatPrice = (price) => price?.toLocaleString('ar-EG') + ' ج.م' || '0 ج.م';
const getInitial = (name) => name?.charAt(0) || '?';

/** ==============================
 * مكون FormField موحد
 * ============================== */
const FormField = ({ label, type="text", name, value, onChange, options, placeholder, required }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
    {type==="select" ? (
      <select name={name} value={value} onChange={onChange} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all bg-white">
        {options.map(opt=><option key={opt.value} value={opt.value}>{opt.label}</option>)}
      </select>
    ) : type==="textarea" ? (
      <textarea name={name} value={value} onChange={onChange} rows={3} placeholder={placeholder} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all resize-none"/>
    ) : (
      <input type={type} name={name} value={value} onChange={onChange} placeholder={placeholder} required={required} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all"/>
    )}
  </div>
);

/** ==============================
 * مودال المستخدم
 * ============================== */
const UserModal = ({ show, onClose, onSubmit, formData, onChange, loading, title }) => {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose}/>
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 rounded"><FaTimes className="w-5 h-5"/></button>
        </div>
        <form onSubmit={onSubmit} className="p-6 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <FormField label="الاسم الكامل" name="name" value={formData.name} onChange={onChange} required placeholder="أدخل الاسم الكامل"/>
            <FormField label="البريد الإلكتروني" type="email" name="email" value={formData.email} onChange={onChange} required placeholder="example@email.com"/>
            <FormField label="رقم الهاتف" type="tel" name="phone" value={formData.phone} onChange={onChange} placeholder="01xxxxxxxxx"/>
            {title!=="عرض المستخدم" && <FormField label="كلمة المرور" type="password" name="password" value={formData.password} onChange={onChange} placeholder="********"/>}
            <FormField label="نوع الحساب" type="select" name="role" value={formData.role} onChange={onChange} options={[{value:'0', label:'عميل'},{value:'1', label:'مدير'}]}/>
            <FormField label="الحالة" type="select" name="status" value={formData.status} onChange={onChange} options={[{value:'active', label:'نشط'},{value:'inactive', label:'غير نشط'},{value:'banned', label:'محظور'}]}/>
            <FormField label="العنوان" name="address" value={formData.address} onChange={onChange} placeholder="العنوان (اختياري)"/>
            <FormField label="ملاحظات" type="textarea" name="notes" value={formData.notes} onChange={onChange} placeholder="ملاحظات إضافية (اختياري)"/>
          </div>
          {title!=="عرض المستخدم" && <div className="flex gap-3 pt-4 border-t border-gray-100">
            <Button type="submit" isLoading={loading} className="flex-1">حفظ</Button>
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">إلغاء</Button>
          </div>}
        </form>
      </div>
    </div>
  );
};

/** ==============================
 * DashboardUsers
 * ============================== */
const DashboardUsers = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const [modalType, setModalType] = useState(''); // add | edit | view
  const [currentUser, setCurrentUser] = useState(null);
  const [formData, setFormData] = useState({ name:'', email:'', phone:'', password:'', role:'0', status:'active', address:'', notes:'' });

  // debounce
  useEffect(()=>{ const t=setTimeout(()=>setDebouncedSearch(search),300); return ()=>clearTimeout(t); },[search]);

  const filteredUsers = users.filter(u=>{
    if(!debouncedSearch) return true;
    const s = debouncedSearch.toLowerCase();
    return u.name?.toLowerCase().includes(s) || u.email?.toLowerCase().includes(s) || u.phone?.includes(s);
  });

  const handleInputChange = e => { const {name,value}=e.target; setFormData(prev=>({...prev,[name]:value})); };

  const openModal = (type, user=null) => {
    setModalType(type);
    setCurrentUser(user);
    if(user) setFormData({...user, password:''});
    else setFormData({ name:'', email:'', phone:'', password:'', role:'0', status:'active', address:'', notes:'' });
  };
  const closeModal = () => { setModalType(''); setCurrentUser(null); setFormData({ name:'', email:'', phone:'', password:'', role:'0', status:'active', address:'', notes:'' }); };

  const handleSubmit = async e => {
    e.preventDefault();
    if(!formData.name || !formData.email){ toast.error('الرجاء تعبئة الحقول المطلوبة'); return; }
    setLoading(true);
    try{
      await new Promise(r=>setTimeout(r,500));
      if(modalType==='add'){ 
        const newUser={...formData,id:Date.now(),role:parseInt(formData.role),orders_count:0,total_spent:0,created_at:new Date().toISOString(),last_login:null};
        setUsers(prev=>[...prev,newUser]); toast.success('تم إضافة المستخدم بنجاح'); 
      }
      if(modalType==='edit'){ 
        setUsers(prev=>prev.map(u=>u.id===currentUser.id ? {...u,...formData,role:parseInt(formData.role)} : u)); toast.success('تم تعديل المستخدم بنجاح');
      }
      closeModal();
    }catch{toast.error('حدث خطأ');} finally{setLoading(false);}
  };

  const handleDelete = userId => {
    if(window.confirm('هل أنت متأكد من حذف هذا المستخدم؟')){
      setUsers(prev=>prev.filter(u=>u.id!==userId));
      toast.success('تم حذف المستخدم');
    }
  };

  /** ==============================
   * أعمدة الجدول
   * ============================== */
  const columns = [
    { key:'name', title:'المستخدم', render:(item)=>(
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${item.role===1?'bg-purple-100':'bg-blue-100'}`}><span className={`font-bold ${item.role===1?'text-purple-600':'text-blue-600'}`}>{getInitial(item.name)}</span></div>
        <div>
          <p className="font-medium text-gray-900">{item.name}</p>
          <div className="flex items-center gap-2 text-sm text-gray-500"><FaEnvelope className="w-3 h-3"/><span>{item.email}</span></div>
        </div>
      </div>
    )},
    { key:'phone', title:'الهاتف', render:(item)=><div className="flex items-center gap-2 text-gray-600"><FaPhone className="w-4 h-4 text-gray-400"/><span dir="ltr">{formatEgyptPhone(item.phone)}</span></div> },
    { key:'role', title:'نوع الحساب', render:(item)=>{ const RoleIcon=ROLE_LABELS[item.role]?.icon||FaUser; return <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm ${ROLE_COLORS[item.role]||'bg-gray-100'}`}><RoleIcon className="w-4 h-4"/>{ROLE_LABELS[item.role]?.text}</span>; }},
    { key:'status', title:'الحالة', render:(item)=>{ const {text,icon:Icon}=STATUS_LABELS[item.status]||STATUS_LABELS.inactive; return <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm ${STATUS_COLORS[item.status]||STATUS_COLORS.inactive}`}><Icon className="w-4 h-4"/>{text}</span>; }},
    { key:'orders_count', title:'عدد الطلبات', render:(item)=><div className="flex items-center gap-2"><FaShoppingBag className="w-4 h-4 text-gray-400"/><span className="font-semibold text-gray-900">{item.orders_count}</span></div> },
    { key:'total_spent', title:'إجمالي المشتريات', render:(item)=><div className="flex items-center gap-2"><FaMoneyBillWave className="w-4 h-4 text-gray-400"/><span className="font-bold text-primary-600">{formatPrice(item.total_spent)}</span></div> },
    { key:'actions', title:'العمليات', render:(item)=>(
      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={()=>openModal('view',item)}><FaEye/></Button>
        <Button size="sm" variant="outline" onClick={()=>openModal('edit',item)}><FaEdit/></Button>
        <Button size="sm" variant="outline" onClick={()=>handleDelete(item.id)}><FaTrashAlt/></Button>
      </div>
    ) }
  ];

  return (
    <div className="p-6" dir="rtl">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">المستخدمين</h1>
          <p className="text-gray-500 text-sm mt-1">إدارة حسابات المستخدمين والصلاحيات</p>
        </div>
        <Button onClick={()=>openModal('add')} leftIcon={<FaUserPlus/>}>إضافة مستخدم جديد</Button>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <div className="relative">
          <FaSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"/>
          <input type="text" value={search} onChange={e=>setSearch(e.target.value)} placeholder="بحث باسم المستخدم أو البريد الإلكتروني أو رقم الهاتف..." className="w-full pr-10 px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"/>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <Table columns={columns} data={filteredUsers} loading={false} emptyMessage={<div className="text-center py-12"><FaUser className="text-5xl mx-auto mb-4 text-gray-300"/><p className="text-lg text-gray-500">لا يوجد مستخدمين</p></div>} />
      </div>

      {/* مودال المستخدم */}
      <UserModal show={modalType!=='add' && modalType!==''} onClose={closeModal} onSubmit={handleSubmit} formData={formData} onChange={handleInputChange} loading={loading} title={modalType==='add'?'إضافة مستخدم':modalType==='edit'?'تعديل المستخدم':'عرض المستخدم'} />
      {modalType==='add' && <UserModal show={true} onClose={closeModal} onSubmit={handleSubmit} formData={formData} onChange={handleInputChange} loading={loading} title="إضافة مستخدم" />}
    </div>
  );
};

export default DashboardUsers;