import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import API from '../api/axios';
import CourseCard from '../components/CourseCard';
import { 
  PlayCircle, ShieldCheck, Star, Play, BookOpen, 
  Brain, Sparkles, ChevronDown, Activity, Dna, Award, CheckCircle2,
  Quote, Building, HeartHandshake, Users
} from 'lucide-react';

export default function HomePage() {
  const [courses, setCourses] = useState([]);
  const [banners, setBanners] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [partners, setPartners] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFaq, setActiveFaq] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cRes, bRes, tRes, pRes, fRes] = await Promise.all([
          API.get('/courses?featured=true').catch(() => ({ data: { courses: [] } })),
          API.get('/extras/banners').catch(() => ({ data: { banners: [] } })),
          API.get('/extras/testimonials').catch(() => ({ data: { testimonials: [] } })),
          API.get('/extras/partners').catch(() => ({ data: { partners: [] } })),
          API.get('/extras/faqs').catch(() => ({ data: { faqs: [] } }))
        ]);
        setCourses(cRes.data?.courses || []);
        setBanners(bRes.data?.banners || []);
        setTestimonials(tRes.data?.testimonials || []);
        setPartners(pRes.data?.partners || []);
        setFaqs(fRes.data?.faqs || []);
      } catch (err) {
        console.error('Error loading homepage:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const banner = banners[0] || {
    title_ar: 'ارتقِ بمسيرتك الطبية مع أفضل الخبراء',
    badge_ar: 'مستقبل التعليم الطبي الحديث',
    description_ar: 'تعليم طبي مهني متميز بأدوات تعلم ذكية مصممة خصيصاً لتناسب احتياجات الأطباء وطلاب الطب المعاصرين. ابدأ رحلتك الآن نحو التميز.'
  };

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.6, ease: "easeOut" } 
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.12 }
    }
  };

  return (
    <div className="flex flex-col w-full bg-background text-on-background font-sans overflow-hidden dir-rtl ">
      
      {/* 1. Hero Section */}
      <section className="relative min-h-[90vh] flex items-center pt-20 pb-20 overflow-hidden bg-gradient-to-b from-primary-container/30 via-surface to-background" dir="rtl">
        
        {/* خلفية تفاعلية بوضوح أعلى */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(#4f46e5_1.2px,transparent_1.2px)] [background-size:20px_20px] opacity-[0.08]"></div>
          
          {/* دوائر ضوئية خفيفة */}
          <div className="absolute -top-20 -right-20 w-[500px] h-[500px] bg-primary/15 rounded-full blur-[100px]"></div>
          <div className="absolute bottom-0 -left-20 w-[400px] h-[400px] bg-secondary/15 rounded-full blur-[100px]"></div>

          {/* أيقونات الخلفية أصبحت أكثر وضوحاً وبألوان طبية جذابة */}
          <motion.div 
            animate={{ y: [0, -15, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-20 left-12 text-primary/20 hidden lg:block"
          >
            <Dna className="w-28 h-28" />
          </motion.div>
          
          <motion.div 
            animate={{ y: [0, 15, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute bottom-20 right-12 text-secondary/20 hidden lg:block"
          >
            <Activity className="w-24 h-24" />
          </motion.div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* النصوص والأزرار */}
          <motion.div 
            initial="hidden" animate="visible" variants={staggerContainer}
            className="flex flex-col items-start text-right"
          >
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-container border border-primary/20 mb-6 shadow-sm">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-on-primary-container font-bold text-sm">{banner.badge_ar}</span>
            </motion.div>
            
            <motion.h1 variants={fadeUp} className="text-2xl lg:text-3xl font-extrabold text-on-background mb-6 leading-tight">
              {banner.title_ar}
            </motion.h1>
            
            <motion.p variants={fadeUp} className="text-lg text-on-surface-variant mb-8 max-w-xl leading-relaxed">
              {banner.description_ar}
            </motion.p>
            
            <motion.div variants={fadeUp} className="flex flex-wrap gap-4 justify-start w-full">
              <Link 
                to="/register" 
                className="px-8 py-4 bg-primary hover:bg-primary-hover text-on-primary font-bold rounded-2xl shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2"
              >
                ابدأ التعلم مجاناً
              </Link>
              <Link 
                to="/courses" 
                className="px-8 py-4 bg-surface text-on-surface hover:text-primary font-bold rounded-2xl border border-outline-variant hover:border-primary/40 transition-all duration-200 flex items-center justify-center gap-2 shadow-sm"
              >
                <PlayCircle className="w-5 h-5 text-primary" />
                استكشف الدورات
              </Link>
            </motion.div>

            {/* التقييم وعدد الطلاب */}
            <motion.div variants={fadeUp} className="mt-10 flex items-center gap-4 bg-surface/80 p-3.5 rounded-2xl border border-outline-variant shadow-sm backdrop-blur-md">
              <div className="flex -space-x-3 space-x-reverse">
                {[1, 2, 3, 4].map((i) => (
                  <img key={i} src={`https://i.pravatar.cc/100?img=${i + 12}`} alt="Student" className="w-10 h-10 rounded-full border-2 border-white shadow-sm object-cover" />
                ))}
              </div>
              <div className="text-sm">
                <div className="flex items-center gap-1 text-amber-400 mb-0.5">
                  {[...Array(5)].map((_, index) => (
                    <Star key={index} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <span className="text-on-surface-variant font-medium">انضم لأكثر من <b className="text-on-background font-bold">15,000+</b> طبيب وطالب</span>
              </div>
            </motion.div>
          </motion.div>

          {/* قسم الصورة الرئيسية مع تحسين الوضوح والأيقونات */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="relative hidden lg:block"
          >
            {/* إطار مضيء خلف الصورة */}
            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-secondary rounded-3xl blur-lg opacity-30 group-hover:opacity-100 transition duration-1000"></div>

            <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-surface bg-surface">
              {/* صورة高清 واضحة جداً */}
              <img
                alt="Medical Education"
                className="w-full h-[460px] object-cover rounded-2xl"
                src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=90"
              />

              {/* بطاقة عائمة 1: اعتماد دولي (واضحة وبألوان بارزة) */}
              <motion.div 
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute bottom-6 -right-6 z-20 bg-surface p-4 rounded-2xl shadow-xl border border-outline-variant/50 flex items-center gap-4"
              >
                <div className="w-12 h-12 rounded-xl bg-secondary text-on-secondary flex items-center justify-center shadow-md shadow-secondary/30">
                  <ShieldCheck className="w-7 h-7" />
                </div>
                <div>
                  <div className="text-xs font-bold text-on-surface-variant/70 uppercase tracking-wider">اعتماد دولي</div>
                  <div className="font-bold text-on-surface text-base">منهج معتمد طبياً</div>
                </div>
              </motion.div>

              {/* بطاقة عائمة 2: محتوى محدث */}
              <motion.div 
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                className="absolute top-6 -left-6 z-20 bg-surface p-3.5 rounded-2xl shadow-xl border border-outline-variant/50 flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-xl bg-primary text-on-primary flex items-center justify-center shadow-md shadow-primary/30">
                  <Activity className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <div className="text-xs font-bold text-on-surface-variant/70">محتوى حديث</div>
                  <div className="text-sm font-bold text-on-surface ml-3">محدث لعام 2026</div>
                </div>
              </motion.div>
            </div>
          </motion.div>

        </div>
      </section>

      {/* 2. Features Section (توضيح الأيقونات كلياً) */}
      <section className="py-20 bg-surface relative" dir="rtl">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <h2 className="text-3xl font-extrabold text-on-background mb-4">منظومة تعليمية متكاملة</h2>
            <p className="text-on-surface-variant">
              وفرنا لك أحدث التقنيات وأفضل الأساليب التعليمية لضمان تفوقك وحصولك على أعلى الدرجات.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Play className="w-7 h-7 text-white" />,
                title: 'محاضرات تفاعلية',
                desc: 'شاهد محاضراتك بجودة عالية مع نظام تشغيل ذكي يضمن لك أفضل تجربة مشاهدة تعليمية وتفاعل مستمر.',
                iconBg: 'bg-primary shadow-primary/30'
              },
              {
                icon: <Brain className="w-7 h-7 text-white" />,
                title: 'بنك الأسئلة المتقدم',
                desc: 'آلاف الأسئلة لتقييم مستواك، مع شرح مفصل لكل إجابة لمساعدتك على فهم أعمق للمادة العلمية.',
                iconBg: 'bg-tertiary shadow-tertiary/30'
              },
              {
                icon: <BookOpen className="w-7 h-7 text-white" />,
                title: 'بطاقات المراجعة الذكية',
                desc: 'تذكر المعلومات الطبية المعقدة بسهولة باستخدام تقنيات التكرار المتباعد والبطاقات الذكية المتطورة.',
                iconBg: 'bg-secondary shadow-secondary/30'
              }
            ].map((feature, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                whileHover={{ y: -6 }}
                transition={{ duration: 0.3, delay: i * 0.1 }}
                className="bg-background p-8 rounded-3xl border border-outline-variant/80 hover:border-primary/30 hover:bg-surface hover:shadow-xl transition-all duration-300 group"
              >
                {/* الأيقونة داخل مربع بلون واضح ومظلل */}
                <div className={`w-14 h-14 ${feature.iconBg} rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-on-surface mb-3">{feature.title}</h3>
                <p className="text-on-surface-variant leading-relaxed text-sm">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Featured Courses */}
      <section className="py-20 bg-background border-y border-outline-variant" dir="rtl">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
            <div>
              <h2 className="text-3xl font-extrabold text-on-background mb-2">أحدث الدورات المميزة</h2>
              <p className="text-on-surface-variant">استكشف الكورسات المصممة خصيصاً لرفع كفاءتك الطبية</p>
            </div>
            <Link to="/courses" className="px-6 py-3 bg-surface hover:bg-primary hover:text-on-primary text-primary font-bold rounded-xl border border-outline-variant transition-all duration-200 shadow-sm">
              عرض جميع الدورات
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="w-10 h-10 border-4 border-primary-container border-t-primary rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {courses.slice(0, 3).map((course, i) => (
                <motion.div
                  key={course.id || i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                >
                  <CourseCard course={course} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
      {/* 4. Student Reviews Section */}
      <section className="py-20 bg-background relative overflow-hidden" dir="rtl">
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-secondary/5 rounded-full blur-3xl -z-10 -translate-x-1/2 translate-y-1/2"></div>
        
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <h2 className="text-3xl font-extrabold text-on-background mb-4">آراء طلابنا</h2>
            <p className="text-on-surface-variant">نفخر بقصص نجاح طلابنا وتجاربهم المتميزة في منصتنا التعليمية</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.length > 0 ? (
              testimonials.map((review, i) => (
                <motion.div
                  key={review.id || i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  className="bg-surface p-8 rounded-3xl border border-outline-variant/60 shadow-lg hover:shadow-xl hover:-translate-y-2 transition-all duration-300 relative group"
                >
                  <Quote className="absolute top-6 left-6 w-10 h-10 text-primary/10 rotate-180 group-hover:text-primary/20 transition-colors duration-300" />
                  
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, idx) => (
                      <Star key={idx} className={`w-4 h-4 ${idx < review.rating ? 'fill-amber-400 text-amber-400' : 'text-outline-variant'}`} />
                    ))}
                  </div>
                  
                  <p className="text-on-surface-variant text-sm leading-relaxed mb-8 relative z-10 font-medium">
                    "{review.content}"
                  </p>
                  
                  <div className="flex items-center gap-4 mt-auto">
                    {review.image ? (
                      <img src={review.image.startsWith('http') ? review.image : `http://localhost:5000/uploads/${review.image}`} alt={review.student_name} className="w-12 h-12 rounded-full border-2 border-primary/20 object-cover" />
                    ) : (
                      <div className="w-12 h-12 rounded-full border-2 border-primary/20 bg-primary/10 flex items-center justify-center text-primary font-bold">
                        {review.student_name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <h4 className="font-bold text-on-surface text-sm">{review.student_name}</h4>
                      <span className="text-xs text-primary font-medium">{review.student_role}</span>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full text-center text-on-surface-variant opacity-70">
                لا توجد تقييمات متاحة حالياً.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 5. Partnership Section */}
      <section className="py-20 bg-surface-variant/30 border-y border-outline-variant/50 relative" dir="rtl">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block py-1 px-3 rounded-full bg-primary/10 text-primary text-xs font-bold mb-4 tracking-wider">
              شركاء النجاح
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-on-background mb-4">
              نفتخر بشراكاتنا الأكاديمية والمهنية
            </h2>
            <p className="text-on-surface-variant text-sm md:text-base max-w-2xl mx-auto">
              نتعاون مع نخبة من الجامعات والمستشفيات والمراكز التعليمية لتقديم محتوى طبي موثوق ومعتمد يساهم في الارتقاء بمستوى التعليم الطبي.
            </p>
          </div>

          {/* Partners Marquee/Grid */}
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-70">
            {partners.length > 0 ? (
              partners.map((partner) => (
                <motion.div key={partner.id} whileHover={{ scale: 1.1, opacity: 1 }} className="flex flex-col items-center gap-2 cursor-pointer transition-opacity">
                  {partner.logo ? (
                    <img src={partner.logo.startsWith('http') ? partner.logo : `http://localhost:5000/uploads/${partner.logo}`} alt={partner.name} className="h-12 object-contain grayscale hover:grayscale-0 transition-all" />
                  ) : (
                    <Building className="w-12 h-12 text-on-surface-variant" />
                  )}
                  <span className="text-xs font-bold text-on-surface-variant">{partner.name}</span>
                </motion.div>
              ))
            ) : (
              <span className="text-sm text-on-surface-variant">شركاؤنا قريباً</span>
            )}
          </div>
        </div>
      </section>

      {/* 6. FAQ Section */}
      <section className="py-20 bg-surface" dir="rtl">
        <div className="max-w-3xl mx-auto px-4 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-on-background mb-3">الأسئلة الشائعة</h2>
            <p className="text-on-surface-variant">كل ما تود معرفته عن منصتنا وبرامجنا التعليمية</p>
          </div>
          <div className="flex flex-col gap-4">
            {faqs.length > 0 ? (
              faqs.map((faq, index) => (
                <div
                  key={faq.id}
                  className="border border-outline-variant rounded-2xl overflow-hidden cursor-pointer bg-surface hover:border-primary/50 transition-colors shadow-sm"
                  onClick={() => toggleFaq(index)}
                >
                  <div className="flex items-center justify-between p-5">
                    <h4 className={`font-bold text-base transition-colors duration-200 ${activeFaq === index ? 'text-primary' : 'text-on-surface'}`}>
                      {faq.question_ar || faq.question}
                    </h4>
                    <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${activeFaq === index ? 'rotate-180 text-primary' : 'text-outline'}`} />
                  </div>
                  
                  <AnimatePresence>
                    {activeFaq === index && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                      >
                        <div className="p-5 pt-0 text-on-surface-variant text-sm leading-relaxed border-t border-outline-variant/50 mt-2">
                          {faq.answer_ar || faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))
            ) : (
              <div className="text-center text-on-surface-variant opacity-70">
                لا توجد أسئلة شائعة متاحة حالياً.
              </div>
            )}
          </div>
        </div>
      </section>

    </div>
  );
}