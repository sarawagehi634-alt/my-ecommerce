// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowLeft } from 'react-icons/fi';
import toast from 'react-hot-toast';
import Button from '../../components/common/Button'; // الزرار الفخم اللي عملناه
import Input from '../../components/common/Input';   // حقل الإدخال المطور

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({});

  const { login, loading: authLoading, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  useEffect(() => {
    if (isAuthenticated) {
      navigate(isAdmin ? '/dashboard' : from, { replace: true });
    }
  }, [isAuthenticated, isAdmin, navigate, from]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await login({ email, password });
    if (success && rememberMe) {
      localStorage.setItem('remembered_email', email);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col lg:flex-row" dir="rtl">
      
      {/* الجانب الأيسر: صورة فاشون كبيرة (تعطي واقعية وفخامة) */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden bg-gray-100">
        <img 
          src="https://unsplash.com" 
          alt="Fashion Model" 
          className="absolute inset-0 w-full h-full object-cover grayscale-[20%] hover:grayscale-0 transition-all duration-1000"
        />
        <div className="absolute inset-0 bg-black/10" />
        <div className="absolute bottom-12 right-12 text-white">
          <h2 className="text-5xl font-black tracking-tighter uppercase italic">SOO STYLE</h2>
          <p className="text-sm tracking-[0.3em] uppercase mt-2 opacity-80">Spring Collection 2024</p>
        </div>
      </div>

      {/* الجانب الأيمن: نموذج الدخول */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-24">
        <div className="w-full max-w-sm space-y-12">
          
          {/* Header */}
          <div className="space-y-4">
            <h1 className="text-3xl font-black tracking-tighter uppercase italic">تسجيل الدخول</h1>
            <p className="text-xs tracking-widest text-gray-400 uppercase">الأناقة تبدأ من هنا</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-6">
              <Input
                label="البريد الإلكتروني"
                type="email"
                placeholder="EMAIL@EXAMPLE.COM"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftIcon={<FiMail />}
                error={errors.email}
              />

              <div className="space-y-2">
                <Input
                  label="كلمة المرور"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  leftIcon={<FiLock />}
                  rightIcon={
                    <button type="button" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <FiEyeOff /> : <FiEye />}
                    </button>
                  }
                />
                <div className="flex justify-end">
                   <Link to="/forgot-password" size="sm" className="text-[10px] uppercase tracking-widest text-gray-400 hover:text-black">
                     نسيتي كلمة المرور؟
                   </Link>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 accent-black border-gray-200"
              />
              <label htmlFor="remember" className="text-[10px] uppercase tracking-widest text-gray-500 cursor-pointer">تذكريني</label>
            </div>

            <div className="space-y-4">
              <Button 
                fullWidth 
                size="lg" 
                isLoading={authLoading}
                type="submit"
              >
                دخول <FiArrowLeft className="mr-2" />
              </Button>
              
              <p className="text-center text-[10px] text-gray-400 uppercase tracking-widest">
                ليس لديكِ حساب؟ {' '}
                <Link to="/register" className="text-black font-black border-b border-black pb-0.5">
                  انضمي إلينا الآن
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
