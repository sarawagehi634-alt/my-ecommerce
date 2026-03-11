import React, { useState, useEffect } from 'react';
import { 
  FaSearch, FaEdit, FaTrashAlt, FaUserPlus, FaEnvelope, FaPhone,
  FaTimes, FaEye, FaUserTie, FaUser, FaShoppingBag, FaMoneyBillWave,
  FaCheckCircle, FaBan
} from 'react-icons/fa';
import Table from '../../../components/ui/Table';
import Button from '../../../components/ui/Button';
import toast from 'react-hot-toast';

/* ==============================
   ثوابت الألوان والايقونات
================================ */
const ROLE_COLORS = {
  1:'bg-purple-100 text-purple-800 border-purple-200',
  0:'bg-blue-100 text-blue-800 border-blue-200'
};

const ROLE_LABELS = {
  1:{text:'مدير', icon: FaUserTie},
  0:{text:'عميل', icon: FaUser}
};

const STATUS_COLORS = {
  active:'bg-green-100 text-green-800 border-green-200',
  inactive:'bg-gray-100 text-gray-800 border-gray-200',
  banned:'bg-red-100 text-red-800 border-red-200'
};

const STATUS_LABELS = {
  active:{text:'نشط', icon: FaCheckCircle},
  inactive:{text:'غير نشط', icon: FaBan},
  banned:{text:'محظور', icon: FaBan}
};

/* ==============================
   دوال مساعدة
================================ */

const formatEgyptPhone = (phone) => {
  if (!phone) return 'غير متوفر';
  const cleaned = phone.replace(/\D/g, '');

  if (cleaned.startsWith('20')) return `+${cleaned}`;
  if (cleaned.length === 11) return `+2${cleaned}`;
  if (cleaned.length === 10) return `+20${cleaned}`;

  return phone;
};

const formatPrice = (price) =>
  price?.toLocaleString('ar-EG') + ' ج.م' || '0 ج.م';

const getInitial = (name) =>
  name?.charAt(0) || '?';


/* ==============================
   FormField
================================ */

const FormField = ({
  label,
  type="text",
  name,
  value,
  onChange,
  options,
  placeholder,
  required
}) => (

  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      {label}
    </label>

    {type==="select" ? (

      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-primary-500"
      >
        {options.map(opt=>(
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

    ) : type==="textarea" ? (

      <textarea
        name={name}
        value={value}
        onChange={onChange}
        rows={3}
        placeholder={placeholder}
        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none"
      />

    ) : (

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none"
      />

    )}
  </div>
);


/* ==============================
   UserModal
================================ */

const UserModal = ({
  show,
  onClose,
  onSubmit,
  formData,
  onChange,
  loading,
  title
}) => {

  if (!show) return null;

  return (

    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">

      <div
        className="fixed inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />

      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl">

        <div className="flex justify-between items-center border-b px-6 py-4">

          <h2 className="text-xl font-bold">
            {title}
          </h2>

          <button onClick={onClose}>
            <FaTimes/>
          </button>

        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-4">

          <div className="grid md:grid-cols-2 gap-4">

            <FormField
              label="الاسم الكامل"
              name="name"
              value={formData.name}
              onChange={onChange}
              required
            />

            <FormField
              label="البريد الإلكتروني"
              type="email"
              name="email"
              value={formData.email}
              onChange={onChange}
              required
            />

            <FormField
              label="رقم الهاتف"
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={onChange}
            />

            {title!=="عرض المستخدم" && (
              <FormField
                label="كلمة المرور"
                type="password"
                name="password"
                value={formData.password}
                onChange={onChange}
              />
            )}

            <FormField
              label="نوع الحساب"
              type="select"
              name="role"
              value={formData.role}
              onChange={onChange}
              options={[
                {value:'0', label:'عميل'},
                {value:'1', label:'مدير'}
              ]}
            />

            <FormField
              label="الحالة"
              type="select"
              name="status"
              value={formData.status}
              onChange={onChange}
              options={[
                {value:'active', label:'نشط'},
                {value:'inactive', label:'غير نشط'},
                {value:'banned', label:'محظور'}
              ]}
            />

          </div>

          {title!=="عرض المستخدم" && (

            <div className="flex gap-3 pt-4 border-t">

              <Button type="submit" isLoading={loading}>
                حفظ
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={onClose}
              >
                إلغاء
              </Button>

            </div>

          )}

        </form>

      </div>

    </div>

  );

};


/* ==============================
   DashboardUsers
================================ */

const DashboardUsers = () => {

  const [users,setUsers] = useState([]);

  const [search,setSearch] = useState('');

  const [debouncedSearch,setDebouncedSearch] = useState('');

  const [modalType,setModalType] = useState('');

  const [currentUser,setCurrentUser] = useState(null);

  const [loading,setLoading] = useState(false);

  const [formData,setFormData] = useState({
    name:'',
    email:'',
    phone:'',
    password:'',
    role:'0',
    status:'active'
  });


  useEffect(()=>{

    const t = setTimeout(()=>{
      setDebouncedSearch(search)
    },300)

    return ()=>clearTimeout(t)

  },[search]);


  const filteredUsers = users.filter(u=>{

    if(!debouncedSearch) return true

    const s = debouncedSearch.toLowerCase()

    return (
      u.name?.toLowerCase().includes(s) ||
      u.email?.toLowerCase().includes(s) ||
      u.phone?.includes(s)
    )

  });


  const handleInputChange = e => {

    const {name,value} = e.target

    setFormData(prev=>({
      ...prev,
      [name]:value
    }))

  }


  const openModal = (type,user=null)=>{

    setModalType(type)

    setCurrentUser(user)

    if(user){

      setFormData({...user,password:''})

    }else{

      setFormData({
        name:'',
        email:'',
        phone:'',
        password:'',
        role:'0',
        status:'active'
      })

    }

  }


  const closeModal = ()=>{

    setModalType('')

    setCurrentUser(null)

  }


  const handleSubmit = async e => {

    e.preventDefault()

    if(!formData.name || !formData.email){

      toast.error('الرجاء تعبئة الحقول المطلوبة')

      return

    }

    setLoading(true)

    await new Promise(r=>setTimeout(r,500))

    if(modalType==='add'){

      const newUser = {
        ...formData,
        id:Date.now(),
        role:parseInt(formData.role),
        orders_count:0,
        total_spent:0
      }

      setUsers(prev=>[...prev,newUser])

      toast.success('تم إضافة المستخدم')

    }

    if(modalType==='edit'){

      setUsers(prev=>
        prev.map(u=>
          u.id===currentUser.id
            ? {...u,...formData,role:parseInt(formData.role)}
            : u
        )
      )

      toast.success('تم تعديل المستخدم')

    }

    setLoading(false)

    closeModal()

  }


  const handleDelete = id => {

    if(window.confirm('هل تريد حذف المستخدم؟')){

      setUsers(prev=>prev.filter(u=>u.id!==id))

      toast.success('تم الحذف')

    }

  }


  const columns = [

    {
      key:'name',
      title:'المستخدم',

      render:(item)=>(

        <div className="flex items-center gap-3">

          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">

            <span className="font-bold text-blue-600">

              {getInitial(item.name)}

            </span>

          </div>

          <div>

            <p className="font-medium">

              {item.name}

            </p>

            <p className="text-sm text-gray-500">

              {item.email}

            </p>

          </div>

        </div>

      )
    },

    {
      key:'phone',
      title:'الهاتف',
      render:(item)=>formatEgyptPhone(item.phone)
    },

    {
      key:'actions',
      title:'العمليات',

      render:(item)=>(

        <div className="flex gap-2">

          <Button
            size="sm"
            onClick={()=>openModal('view',item)}
          >
            <FaEye/>
          </Button>

          <Button
            size="sm"
            onClick={()=>openModal('edit',item)}
          >
            <FaEdit/>
          </Button>

          <Button
            size="sm"
            onClick={()=>handleDelete(item.id)}
          >
            <FaTrashAlt/>
          </Button>

        </div>

      )
    }

  ]


  return (

    <div className="p-6" dir="rtl">

      <div className="flex justify-between mb-6">

        <h1 className="text-2xl font-bold">

          المستخدمين

        </h1>

        <Button
          onClick={()=>openModal('add')}
          leftIcon={<FaUserPlus/>}
        >

          إضافة مستخدم

        </Button>

      </div>


      <input
        type="text"
        placeholder="بحث..."
        value={search}
        onChange={e=>setSearch(e.target.value)}
        className="w-full mb-6 px-4 py-3 border rounded-lg"
      />


      <Table
        columns={columns}
        data={filteredUsers}
      />


      <UserModal
        show={modalType!==''}
        onClose={closeModal}
        onSubmit={handleSubmit}
        formData={formData}
        onChange={handleInputChange}
        loading={loading}
        title={
          modalType==='add'
            ? 'إضافة مستخدم'
            : modalType==='edit'
            ? 'تعديل المستخدم'
            : 'عرض المستخدم'
        }
      />

    </div>

  )

}

export default DashboardUsers;