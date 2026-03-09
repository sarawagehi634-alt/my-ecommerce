import api from '../api/axios';

class StaticService {

  // ================= FAQ =================

  getDefaultFAQs() {
    return [
      {
        question: 'كيف أختار المقاس المناسب؟',
        answer: 'يمكنك مراجعة دليل المقاسات الموجود في صفحة المنتج لاختيار المقاس المناسب لك.'
      },
      {
        question: 'هل يمكن استبدال أو إرجاع الملابس؟',
        answer: 'نعم يمكن الإرجاع أو الاستبدال خلال 14 يوم من استلام الطلب بشرط أن يكون المنتج بحالته الأصلية.'
      },
      {
        question: 'كم يستغرق الشحن؟',
        answer: 'يستغرق الشحن عادة من 2 إلى 5 أيام عمل حسب المدينة.'
      },
      {
        question: 'هل يوجد شحن مجاني؟',
        answer: 'نعم، الشحن مجاني للطلبات التي تتجاوز 300 ريال.'
      }
    ];
  }

  // ================= Error Handler =================

  handleError(error, defaultMessage, defaultData = null) {

    console.error(defaultMessage, error);

    if (error.response?.status === 404 && defaultData !== null) {
      return defaultData;
    }

    throw error;
  }

  // ================= FAQ =================

  async getFAQs() {
    try {

      const response = await api.get('/faqs');

      return response.data;

    } catch (error) {

      return this.handleError(
        error,
        'خطأ في جلب الأسئلة الشائعة',
        this.getDefaultFAQs()
      );
    }
  }

  // ================= About Brand =================

  async getAboutInfo() {

    try {

      const response = await api.get('/about');

      return response.data;

    } catch (error) {

      const defaultAbout = {
        brand: "SOO Fashion",
        founded: "2022",

        description:
          "SOO Fashion هي علامة تجارية متخصصة في الملابس العصرية التي تجمع بين الأناقة والراحة.",

        vision:
          "أن نصبح من أفضل متاجر الفاشون في المنطقة.",

        mission:
          "تقديم ملابس عالية الجودة بتصاميم عصرية وأسعار مناسبة.",

        values: [
          "الجودة",
          "الأناقة",
          "الراحة",
          "رضا العملاء"
        ]
      };

      return this.handleError(error, 'خطأ في جلب معلومات المتجر', defaultAbout);
    }
  }

  // ================= Shipping =================

  async getShippingPolicy() {

    try {

      const response = await api.get('/shipping');

      return response.data;

    } catch (error) {

      const defaultShipping = {

        methods: [
          {
            name: "شحن عادي",
            duration: "3-5 أيام",
            cost: 25
          },
          {
            name: "شحن سريع",
            duration: "1-2 يوم",
            cost: 50
          }
        ],

        freeShippingAbove: 300,

        notes: [
          "يتم تجهيز الطلب خلال 24 ساعة",
          "سيتم إرسال رقم التتبع بعد الشحن"
        ]
      };

      return this.handleError(
        error,
        'خطأ في جلب سياسة الشحن',
        defaultShipping
      );
    }
  }

  // ================= Return Policy =================

  async getReturnPolicy() {

    try {

      const response = await api.get('/returns');

      return response.data;

    } catch (error) {

      const defaultReturn = {

        duration: 14,

        conditions: [
          "المنتج بحالته الأصلية",
          "لم يتم ارتداء المنتج",
          "وجود بطاقة المنتج"
        ],

        exceptions: [
          "الملابس الداخلية",
          "المنتجات المخفضة"
        ]
      };

      return this.handleError(
        error,
        'خطأ في جلب سياسة الإرجاع',
        defaultReturn
      );
    }
  }

  // ================= Contact =================

  async getContactInfo() {

    try {

      const response = await api.get('/contact-info');

      return response.data;

    } catch (error) {

      const defaultContact = {

        email: "support@soo-fashion.com",

        phone: "+966500000000",

        whatsapp: "+966500000000",

        address: "الرياض - المملكة العربية السعودية",

        social: {
          instagram: "https://instagram.com/soo-fashion",
          tiktok: "https://tiktok.com/@soo-fashion",
          snapchat: "https://snapchat.com/add/soo-fashion"
        }

      };

      return this.handleError(
        error,
        'خطأ في جلب معلومات التواصل',
        defaultContact
      );
    }
  }

  // ================= Media =================

  async getMediaAssets() {

    try {

      const response = await api.get('/media');

      return response.data;

    } catch (error) {

      const defaultMedia = {

        logo: "/images/fashion-logo.png",

        favicon: "/images/favicon.ico",

        defaultProductImage: "/images/fashion-product.jpg",

        banners: {
          home: "/images/banners/fashion-home.jpg",
          sale: "/images/banners/fashion-sale.jpg"
        }

      };

      return this.handleError(
        error,
        'خطأ في جلب الوسائط',
        defaultMedia
      );
    }
  }

  // ================= Site Settings =================

  async getSiteSettings() {

    try {

      const response = await api.get('/settings');

      return response.data;

    } catch (error) {

      const defaultSettings = {

        siteName: "SOO Fashion",

        siteDescription:
          "متجر أونلاين لأحدث صيحات الموضة للرجال والنساء",

        currency: "SAR",

        currencySymbol: "ر.س",

        language: "ar",

        taxRate: 15

      };

      return this.handleError(
        error,
        'خطأ في جلب إعدادات الموقع',
        defaultSettings
      );
    }
  }

}

const staticService = new StaticService();

export default staticService;