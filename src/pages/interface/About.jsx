import React, { useState, useEffect } from 'react';
import { 
  FaHeart, FaStar, FaUsers, FaAward, FaMapMarkerAlt,
  FaPhone, FaClock, FaStore, FaRegClock,
  FaRegSmile, FaTshirt, FaShoppingBag, FaCalendarAlt
} from 'react-icons/fa';
import { MdLocalShipping, MdLocationOn } from 'react-icons/md';
import { BiStore } from 'react-icons/bi';
import staticService from '../../services/staticService';
import Loader from '../../components/common/Loader';
import toast from 'react-hot-toast';

const About = () => {
  const [aboutInfo, setAboutInfo] = useState(null);
  const [branches, setBranches] = useState([]);
  const [workingHours, setWorkingHours] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAboutData();
  }, []);

  const fetchAboutData = async () => {
    setLoading(true);
    try {
      const [about, branchesData, hoursData] = await Promise.all([
        staticService.getAboutInfo(),
        staticService.getBranches(),
        staticService.getWorkingHours()
      ]);

      setAboutInfo(about || {});
      setBranches(branchesData || []);
      setWorkingHours(hoursData || []);
    } catch (error) {
      console.error('خطأ في تحميل البيانات:', error);
      toast.error('حدث خطأ في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  const values = [
    { icon: FaHeart, title: 'تصاميم مبتكرة', description: 'نقدّم ملابس تجمع بين الأناقة والراحة في كل قطعة', color: 'primary' },
    { icon: FaStar, title: 'خامات فاخرة', description: 'نختار أفضل الأقمشة لضمان الجودة والراحة', color: 'accent' },
    { icon: FaUsers, title: 'رضا العملاء', description: 'نسعى دائماً لإرضاء عملائنا بأحدث صيحات الموضة', color: 'primary' },
    { icon: FaAward, title: 'موثوقية', description: 'منتجاتنا معتمدة وتحقق معايير الجودة العالمية', color: 'accent' }
  ];

  const deliveryCities = aboutInfo?.deliveryCities || ['القاهرة','الجيزة','الإسكندرية','طنطا','بورسعيد','القليوبيه','السويس'];
  const defaultStory = [
    'بدأت علامتنا التجارية بحلم تقديم ملابس عصرية وأنيقة لكل محبي الموضة.',
    'نسعى منذ 5 سنوات لابتكار تصاميم تجمع بين الراحة والأناقة لتناسب كل الأذواق.',
    'اليوم، أصبحت ماركتنا مرجعاً للأزياء العصرية مع آلاف العملاء السعداء في جميع أنحاء مصر.'
  ];

  if (loading) return <Loader text="جاري تحميل الصفحة..." />;

  return (
    <div className="min-h-screen py-12 bg-gray-50" dir="rtl">
      <div className="container-custom">

        {/* عنوان الصفحة */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">من نحن</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {aboutInfo?.description || 'نقدّم أحدث صيحات الموضة مع لمسة من الأناقة والراحة في كل تصميم'}
          </p>
        </div>

        {/* قصة الشركة */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-12">
          <div className="grid md:grid-cols-2">
            <div className="p-8 md:p-12">
              <h2 className="text-3xl font-bold mb-6">قصتنا</h2>
              <div className="text-gray-700 leading-relaxed space-y-4">
                {(aboutInfo?.story || defaultStory).map((paragraph, idx) => (
                  <p key={idx}>{paragraph}</p>
                ))}
              </div>
              <div className="flex items-center gap-2 mt-6 text-purple-600">
                <FaMapMarkerAlt className="w-5 h-5" />
                <span>{aboutInfo?.address || 'القاهرة - شارع النصر'}</span>
              </div>
            </div>
            <div className="relative h-64 md:h-auto">
              <img
                src={aboutInfo?.image || 'https://images.unsplash.com/photo-1614282746187-f1d1f646b6d1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'}
                alt="فريق العمل"
                className="w-full h-full object-cover"
                onError={(e)=> e.target.src='https://via.placeholder.com/600x400?text=Fashion+Team'}
                loading="lazy"
              />
              <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-2 text-sm">
                <p className="font-semibold text-gray-800 flex items-center gap-1">
                  <MdLocationOn className="text-purple-600" />
                  {aboutInfo?.location || 'القاهرة - مصر'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* القيم */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {values.map((val, idx) => {
            const Icon = val.icon;
            const bg = val.color==='primary' ? 'bg-purple-100' : 'bg-yellow-100';
            const txt = val.color==='primary' ? 'text-purple-600' : 'text-yellow-600';
            return (
              <div key={idx} className="bg-white rounded-2xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow duration-300">
                <div className={`${bg} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4`}>
                  <Icon className={`w-8 h-8 ${txt}`} />
                </div>
                <h3 className="text-xl font-bold mb-2">{val.title}</h3>
                <p className="text-gray-600">{val.description}</p>
              </div>
            )
          })}
        </div>

        {/* الإحصائيات */}
        <div className="bg-gradient-to-r from-purple-600 to-yellow-400 text-white rounded-3xl shadow-xl p-12 mb-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <FaRegSmile className="w-12 h-12 mx-auto mb-4 opacity-80" />
              <p className="text-5xl font-bold mb-2">{aboutInfo?.stats?.customers || '+3000'}</p>
              <p className="text-xl opacity-90">عملاء سعداء</p>
            </div>
            <div>
              <FaTshirt className="w-12 h-12 mx-auto mb-4 opacity-80" />
              <p className="text-5xl font-bold mb-2">{aboutInfo?.stats?.products || '+150'}</p>
              <p className="text-xl opacity-90">تصميمات فريدة</p>
            </div>
            <div>
              <FaCalendarAlt className="w-12 h-12 mx-auto mb-4 opacity-80" />
              <p className="text-5xl font-bold mb-2">{aboutInfo?.stats?.years || '5'}</p>
              <p className="text-xl opacity-90">سنوات خبرة</p>
            </div>
          </div>
        </div>

        {/* الفروع ومواعيد العمل */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* الفروع */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <FaStore className="text-purple-600" />
              فروعنا
            </h3>
            {branches.length ? (
              <div className="space-y-4">
                {branches.map((b,i)=>(
                  <div key={i} className="border-b pb-4 last:border-0 hover:bg-gray-50 transition-colors rounded-lg p-2">
                    <p className="font-semibold text-purple-600 flex items-center gap-2">
                      <BiStore /> {b.name}
                    </p>
                    <p className="text-gray-600 mr-7">{b.address}</p>
                    <p className="text-gray-500 text-sm mr-7 flex items-center gap-2" dir="ltr">
                      <FaPhone className="text-xs"/> {b.phone || '+20 12 3456 7890'}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">
                <p>القاهرة - شارع النصر</p>
                <p dir="ltr" className="flex items-center justify-center gap-2">
                  <FaPhone className="text-xs"/> +20 12 3456 7890
                </p>
              </div>
            )}
          </div>

          {/* مواعيد العمل */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <FaRegClock className="text-purple-600" /> مواعيد العمل
            </h3>
            {workingHours.length ? (
              <div className="space-y-4">
                {workingHours.map((h,i)=>(
                  <div key={i} className="flex justify-between border-b pb-3 last:border-0">
                    <span className="font-semibold flex items-center gap-2">
                      <FaClock className="text-gray-400 text-sm"/> {h.day}:
                    </span>
                    <span className="text-gray-600">{h.hours}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="font-semibold flex items-center gap-2">
                    <FaClock className="text-gray-400 text-sm"/> السبت - الخميس:
                  </span>
                  <span className="text-gray-600">10:00 صباحاً - 10:00 مساءً</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold flex items-center gap-2">
                    <FaClock className="text-gray-400 text-sm"/> الجمعة:
                  </span>
                  <span className="text-gray-600">مغلق</span>
                </div>
              </div>
            )}

            {/* المدن */}
            <div className="mt-8">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <MdLocalShipping className="text-purple-600 text-xl"/> توصيل سريع لجميع المدن:
              </h4>
              <div className="flex flex-wrap gap-2">
                {deliveryCities.map((city,idx)=>(
                  <span key={idx} className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                    <FaMapMarkerAlt className="text-xs"/> {city}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
};

export default About;