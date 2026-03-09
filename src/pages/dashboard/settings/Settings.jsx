import React, { useState } from 'react';
import { 
  FiSave, FiUser, FiLock, FiBell, FiGlobe, FiTruck, FiCreditCard, FiCamera, FiTrash2 
} from 'react-icons/fi';
import { useAuth } from '../../../context/AuthContext';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import toast from 'react-hot-toast';

const TABS = [
  { id: 'profile', name: 'الملف الشخصي', icon: FiUser },
  { id: 'security', name: 'الأمان', icon: FiLock },
  { id: 'notifications', name: 'الإشعارات', icon: FiBell },
  { id: 'preferences', name: 'التفضيلات', icon: FiGlobe },
  { id: 'shipping', name: 'الشحن', icon: FiTruck },
  { id: 'payment', name: 'طرق الدفع', icon: FiCreditCard },
];

const Settings = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);

  const [profileData, setProfileData] = useState({
    name: user?.name || 'رقية محمد',
    email: user?.email || 'roka@beautycare.com',
    phone: user?.phone || '+20012345957',
    address: user?.address || 'الرياض، حي العليا',
    bio: 'مدير نظام في بيوتي طوما'
  });

  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    orderUpdates: true,
    promotions: false,
    newUserAlerts: true,
    systemAlerts: true
  });

  const [preferences, setPreferences] = useState({ language: 'ar', currency: 'SAR', timezone: 'Asia/Riyadh', dateFormat: 'DD/MM/YYYY' });

  const [shipping, setShipping] = useState({ defaultWeight: 0.5, freeShippingThreshold: 200, shippingCost: 25, internationalShipping: false });

  const [payment, setPayment] = useState({ bankTransfer: true, cashOnDelivery: true, creditCard: false, applePay: false });

  const handleChange = (setter) => (e) => {
    const { name, value, type, checked } = e.target;
    setter(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSave = async (type) => {
    setLoading(true);
    try {
      await new Promise(res => setTimeout(res, 800)); // محاكاة API
      toast.success(`تم حفظ ${type} بنجاح`);
      if (type === 'password') setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error('حدث خطأ أثناء الحفظ');
    } finally {
      setLoading(false);
    }
  };

  const getUserInitial = () => profileData.name?.charAt(0) || 'أ';

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <div className="container-custom py-8">
        <h1 className="text-3xl font-bold mb-2">الإعدادات</h1>
        <p className="text-gray-600 mb-8">إدارة إعدادات حسابك وتفضيلات النظام</p>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <aside className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-4 sticky top-24">
              <nav className="space-y-1">
                {TABS.map(tab => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                        activeTab === tab.id ? 'bg-gradient-to-l from-primary-50 to-skin-50 text-primary-600' : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{tab.name}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </aside>

          <main className="lg:col-span-3 bg-white rounded-2xl shadow-lg p-6 space-y-6">
            {/* الملف الشخصي */}
            {activeTab === 'profile' && (
              <section>
                <h2 className="text-xl font-bold mb-6">الملف الشخصي</h2>
                <div className="flex items-center gap-6 mb-6">
                  <div className="relative">
                    <div className="w-24 h-24 bg-gradient-to-r from-primary-100 to-skin-100 rounded-full flex items-center justify-center text-3xl font-bold text-primary-600">
                      {getUserInitial()}
                    </div>
                    <button className="absolute bottom-0 right-0 bg-primary-600 text-white p-2 rounded-full hover:bg-primary-700 transition-colors">
                      <FiCamera className="w-4 h-4" />
                    </button>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{profileData.name}</h3>
                    <p className="text-gray-500">{profileData.email}</p>
                    <button className="text-sm text-red-600 hover:text-red-700 mt-2 flex items-center gap-1">
                      <FiTrash2 className="w-4 h-4" /> حذف الصورة
                    </button>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  {['name','email','phone','address'].map(field => (
                    <Input
                      key={field}
                      label={field === 'name' ? 'الاسم الكامل' : field === 'email' ? 'البريد الإلكتروني' : field === 'phone' ? 'رقم الجوال' : 'العنوان'}
                      name={field}
                      value={profileData[field]}
                      onChange={handleChange(setProfileData)}
                    />
                  ))}
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">نبذة عني</label>
                  <textarea
                    name="bio"
                    value={profileData.bio}
                    onChange={handleChange(setProfileData)}
                    rows={4}
                    className="input-field w-full rounded-lg border-gray-300"
                    placeholder="اكتب نبذة عنك..."
                  />
                </div>
                <div className="flex justify-end mt-6">
                  <Button onClick={() => handleSave('الملف الشخصي')} isLoading={loading} leftIcon={<FiSave />}>حفظ التغييرات</Button>
                </div>
              </section>
            )}

            {/* الأمان */}
            {activeTab === 'security' && (
              <section>
                <h2 className="text-xl font-bold mb-6">تغيير كلمة المرور</h2>
                <div className="grid md:grid-cols-1 gap-4 max-w-md">
                  {['currentPassword','newPassword','confirmPassword'].map(field => (
                    <Input
                      key={field}
                      label={field === 'currentPassword' ? 'كلمة المرور الحالية' : field === 'newPassword' ? 'كلمة المرور الجديدة' : 'تأكيد كلمة المرور الجديدة'}
                      name={field}
                      type="password"
                      value={passwordData[field]}
                      onChange={handleChange(setPasswordData)}
                    />
                  ))}
                </div>
                <div className="flex justify-end mt-6">
                  <Button onClick={() => handleSave('password')} isLoading={loading} leftIcon={<FiLock />}>تغيير كلمة المرور</Button>
                </div>
              </section>
            )}

            {/* الإشعارات */}
            {activeTab === 'notifications' && (
              <section>
                <h2 className="text-xl font-bold mb-6">إعدادات الإشعارات</h2>
                <div className="space-y-4">
                  {Object.entries(notifications).map(([key, value]) => (
                    <label key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer">
                      <div>
                        <p className="font-medium">
                          {key==='emailNotifications'?'الإشعارات عبر البريد': key==='orderUpdates'?'تحديثات الطلبات': key==='promotions'?'العروض الترويجية': key==='newUserAlerts'?'مستخدمين جدد':'تنبيهات النظام'}
                        </p>
                        <p className="text-sm text-gray-500">
                          {key==='emailNotifications'?'استلام الإشعارات على البريد الإلكتروني': key==='orderUpdates'?'إشعارات عند الطلبات': key==='promotions'?'استلام العروض والخصومات':'إشعارات مهمة عن النظام'}
                        </p>
                      </div>
                      <input type="checkbox" name={key} checked={value} onChange={handleChange(setNotifications)} className="toggle-checkbox" />
                    </label>
                  ))}
                </div>
                <div className="flex justify-end mt-6">
                  <Button onClick={() => handleSave('الإشعارات')} isLoading={loading} leftIcon={<FiSave />}>حفظ الإعدادات</Button>
                </div>
              </section>
            )}

            {/* التفضيلات */}
            {activeTab === 'preferences' && (
              <section>
                <h2 className="text-xl font-bold mb-6">التفضيلات</h2>
                <div className="grid md:grid-cols-2 gap-4 max-w-md">
                  <Input label="اللغة" name="language" value={preferences.language} onChange={handleChange(setPreferences)} placeholder="ar / en" />
                  <Input label="العملة" name="currency" value={preferences.currency} onChange={handleChange(setPreferences)} placeholder="SAR / USD" />
                  <Input label="المنطقة الزمنية" name="timezone" value={preferences.timezone} onChange={handleChange(setPreferences)} placeholder="Asia/Riyadh" />
                  <Input label="صيغة التاريخ" name="dateFormat" value={preferences.dateFormat} onChange={handleChange(setPreferences)} placeholder="DD/MM/YYYY" />
                </div>
                <div className="flex justify-end mt-6">
                  <Button onClick={() => handleSave('التفضيلات')} isLoading={loading} leftIcon={<FiSave />}>حفظ التفضيلات</Button>
                </div>
              </section>
            )}

            {/* الشحن */}
            {activeTab === 'shipping' && (
              <section>
                <h2 className="text-xl font-bold mb-6">إعدادات الشحن</h2>
                <div className="grid md:grid-cols-2 gap-4 max-w-md">
                  <Input label="الوزن الافتراضي (كجم)" name="defaultWeight" type="number" value={shipping.defaultWeight} onChange={handleChange(setShipping)} />
                  <Input label="الحد الأدنى للشحن المجاني" name="freeShippingThreshold" type="number" value={shipping.freeShippingThreshold} onChange={handleChange(setShipping)} />
                  <Input label="تكلفة الشحن" name="shippingCost" type="number" value={shipping.shippingCost} onChange={handleChange(setShipping)} />
                  <label className="flex items-center gap-2 mt-4">
                    <input type="checkbox" name="internationalShipping" checked={shipping.internationalShipping} onChange={handleChange(setShipping)} className="toggle-checkbox" />
                    <span>الشحن الدولي متاح</span>
                  </label>
                </div>
                <div className="flex justify-end mt-6">
                  <Button onClick={() => handleSave('الشحن')} isLoading={loading} leftIcon={<FiSave />}>حفظ إعدادات الشحن</Button>
                </div>
              </section>
            )}

            {/* الدفع */}
            {activeTab === 'payment' && (
              <section>
                <h2 className="text-xl font-bold mb-6">طرق الدفع</h2>
                <div className="space-y-4 max-w-md">
                  {Object.entries(payment).map(([key, value]) => (
                    <label key={key} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" name={key} checked={value} onChange={handleChange(setPayment)} className="toggle-checkbox" />
                      <span>{key==='bankTransfer'?'تحويل بنكي' : key==='cashOnDelivery'?'الدفع عند الاستلام' : key==='creditCard'?'بطاقة ائتمان':'Apple Pay'}</span>
                    </label>
                  ))}
                </div>
                <div className="flex justify-end mt-6">
                  <Button onClick={() => handleSave('طرق الدفع')} isLoading={loading} leftIcon={<FiSave />}>حفظ طرق الدفع</Button>
                </div>
              </section>
            )}

          </main>
        </div>
      </div>

      <style>{`
        .toggle-checkbox {
          width: 3rem; height: 1.5rem; appearance: none; border-radius: 9999px; position: relative; cursor: pointer; transition: all 0.3s; background-color: #e5e7eb;
        }
        .toggle-checkbox:checked { background-color: #0284c7; }
        .toggle-checkbox::before { content:''; position:absolute; width:1.25rem; height:1.25rem; background:white; border-radius:50%; top:0.125rem; left:0.125rem; transition:transform 0.3s; }
        .toggle-checkbox:checked::before { transform: translateX(1.5rem); }
      `}</style>
    </div>
  );
};

export default Settings;