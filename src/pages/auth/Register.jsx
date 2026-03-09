// @ts-nocheck
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiArrowLeft } from 'react-icons/fi';
import toast from 'react-hot-toast';
import Button from '../../components/common/Button'; // الزرار الأسود الفخم
import Input from '../../components/common/Input';   // الحقل النظيف اللي عملناه

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await register(formData);
    if (success) {
      toast.success('مرحباً بكِ في عالم سوو للأزياء');
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col lg:flex-row-reverse" dir="rtl">
      
      {/* الجانب الأيمن: صورة إلهامية (Editorial Image) */}
      <div className="hidden lg:block lg:w-1/2 relative bg-gray-50">
        <img 
          src="https://unsplash.com" 
          alt="Fashion Editorial" 
          className="absolute inset-0 w-full h-full object-cover grayscale-[30%]"
        />
        <div className="absolute inset-0 bg-black/5" />
        <div className="absolute top-12 left-12 text-white text-left">
          <h2 className="text-6xl font-black tracking-tighter uppercase italic leading-none">Join Soo Style<br/>Elite</h2>
          <p className="text-xs tracking-[0.4em] uppercase mt-4 font-bold opacity-90">Discover Our New Collection Exclusively</p>
        </div>
      </div>

      {/* الجانب الأيسر: نموذج التسجيل */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-20">
        <div className="w-full max-w-md space-y-10">
          
          {/* Header */}
          <div className="space-y-3">
            <h1 className="text-3xl font-black tracking-tighter uppercase italic">إنشاء حساب جديد</h1>
            <p className="text-[10px] tracking-[0.3em] text-gray-400 uppercase">ابدئي رحلتكِ في عالم الموضة الراقية</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="الاسم الكامل"
              name="name"
              placeholder="NAME"
              value={formData.name}
              onChange={handleChange}
              leftIcon={<FiUser />}
              error={errors.name}
            />

            <Input
              label="البريد الإلكتروني"
              name="email"
              type="email"
              placeholder="EMAIL@EXAMPLE.COM"
              value={formData.email}
              onChange={handleChange}
              leftIcon={<FiMail />}
              error={errors.email}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="كلمة المرور"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                leftIcon={<FiLock />}
                rightIcon={
                  <button type="button" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <FiEyeOff size={16}/> : <FiEye size={16}/>}
                  </button>
                }
              />

              <Input
                label="تأكيد كلمة المرور"
                name="password_confirmation"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={formData.password_confirmation}
                onChange={handleChange}
                leftIcon={<FiLock />}
              />
            </div>

            <div className="pt-4 space-y-6">
              <Button 
                fullWidth 
                size="lg" 
                isLoading={loading}
                type="submit"
              >
                إنشاء الحساب <FiArrowLeft className="mr-2" />
              </Button>

              <div className="text-center">
                <p className="text-[10px] text-gray-400 uppercase tracking-[0.2em]">
                  لديكِ حساب بالفعل؟ {' '}
                  <Link to="/login" className="text-black font-black border-b border-black pb-0.5 hover:text-gray-600 transition-colors">
                    سجلي دخولكِ هنا
                  </Link>
                </p>
              </div>
            </div>
          </form>

          {/* تذييل بسيط للفخامة */}
          <div className="pt-10 flex justify-center gap-8 opacity-20 grayscale scale-75">
             <span className="text-[10px] font-black uppercase tracking-widest">Premium Quality Fabrics</span>
             <span className="text-[10px] font-black uppercase tracking-widest">Secure Checkout</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
