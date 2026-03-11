import api from '../../src/api/axios';

class HomeService {
  getDefaultHomeData() {
    return {
      featuredProducts:[{id:1,name:'👗 فستان سهرة',price:450,main_image:null},{id:2,name:'👜 حقيبة يد',price:320,main_image:null},{id:3,name:'👠 حذاء كعب عالي',price:280,main_image:null}],
      bestSellers:[{id:1,name:'👗 جاكيت جلد',sold_count:50,price:700,main_image:null},{id:2,name:'🧥 معطف صوفي',sold_count:45,price:850,main_image:null}],
      newArrivals:[{id:1,name:'👚 بلوزة أنيقة',price:180,main_image:null},{id:2,name:'👖 بنطال جينز',price:220,main_image:null}],
      categories:[{id:1,name:'👗 فساتين',slug:'dresses'},{id:2,name:'👜 حقائب',slug:'bags'},{id:3,name:'👠 أحذية',slug:'shoes'}],
      specialOffers:[{id:1,name:'💖 عرض الصيف',discount:'20%',main_image:null},{id:2,name:'🛍️ خصم الأعضاء',discount:'15%',main_image:null}],
      stats:{happyCustomers:1200,products:156,yearsExperience:5,orders:540,categories:12},
      latestReviews:[],
      latestBlogs:[]
    };
  }

  validateLimit(limit,defaultValue){const num=Number(limit); return !isNaN(num)&&num>0&&num<=50?num:defaultValue;}

  async getHomeData(){
    try{
      const response=await api.get('/home');
      if(!response.data) return this.getDefaultHomeData();
      return { featuredProducts: response.data.featuredProducts||[], bestSellers: response.data.bestSellers||[], newArrivals: response.data.newArrivals||[], categories: response.data.categories||[], specialOffers: response.data.specialOffers||[], stats: response.data.stats||this.getDefaultHomeData().stats, latestReviews: response.data.latestReviews||[], latestBlogs: response.data.latestBlogs||[] };
    }catch(error){console.error('❌ خطأ في جلب بيانات الصفحة الرئيسية:',error); return this.getDefaultHomeData();}
  }

  async getFeaturedProducts(limit=8){ try{ const validLimit=this.validateLimit(limit,8); const response=await api.get('/products/featured',{params:{limit:validLimit}}); return Array.isArray(response.data)?response.data:this.getDefaultHomeData().featuredProducts; }catch(error){console.error('❌ خطأ في جلب المنتجات المميزة:',error); return this.getDefaultHomeData().featuredProducts;} }
  async getBestSellers(limit=4){ try{ const validLimit=this.validateLimit(limit,4); const response=await api.get('/products/best-sellers',{params:{limit:validLimit}}); return Array.isArray(response.data)?response.data:this.getDefaultHomeData().bestSellers; }catch(error){console.error('❌ خطأ في جلب المنتجات الأكثر مبيعاً:',error); return this.getDefaultHomeData().bestSellers;} }
  async getNewArrivals(limit=4){ try{ const validLimit=this.validateLimit(limit,4); const response=await api.get('/products/new-arrivals',{params:{limit:validLimit}}); return Array.isArray(response.data)?response.data:this.getDefaultHomeData().newArrivals; }catch(error){console.error('❌ خطأ في جلب أحدث المنتجات:',error); return this.getDefaultHomeData().newArrivals;} }
  async getHomeCategories(limit=6){ try{ const validLimit=this.validateLimit(limit,6); const response=await api.get('/categories/home',{params:{limit:validLimit}}); return Array.isArray(response.data)?response.data:this.getDefaultHomeData().categories; }catch(error){console.error('❌ خطأ في جلب الأقسام:',error); return this.getDefaultHomeData().categories;} }
  async getSpecialOffers(limit=3){ try{ const validLimit=this.validateLimit(limit,3); const response=await api.get('/products/special-offers',{params:{limit:validLimit}}); return Array.isArray(response.data)?response.data:this.getDefaultHomeData().specialOffers; }catch(error){console.error('❌ خطأ في جلب العروض الخاصة:',error); return this.getDefaultHomeData().specialOffers;} }

  async quickSearch(query){ try{ if(!query?.trim()) return {products:[],categories:[],blogs:[]}; const response=await api.get('/search/quick',{params:{q:query.trim()}}); return {products:response.data?.products||[], categories:response.data?.categories||[], blogs:response.data?.blogs||[]}; }catch(error){console.error('❌ خطأ في البحث السريع:',error); return {products:[],categories:[],blogs:[]};} }
}

const homeService = new HomeService();
export default homeService;