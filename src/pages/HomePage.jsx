import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import API from '../api/axios';
import CourseCard from '../components/CourseCard';
import { 
  PlayCircle, ShieldCheck, Star, Play, BookOpen, 
  Brain, Sparkles, ChevronDown, Activity, Dna,
  Quote, Database, Layers, Calendar, ClipboardCheck
} from 'lucide-react';

export default function HomePage() {
  const { t, i18n } = useTranslation();
  const [courses, setCourses] = useState([]);
  const [banners, setBanners] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [partners, setPartners] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFaq, setActiveFaq] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);

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

  const mainBanners = banners.filter(b => b.banner_type === 'main');

  useEffect(() => {
    if (mainBanners.length > 1) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % mainBanners.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [mainBanners.length]);

  return (
    <div className="flex flex-col w-full bg-background text-on-background font-sans overflow-hidden transition-colors duration-300">
      
      {/* 1. Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        
        <AnimatePresence mode="wait">
          {mainBanners.length > 0 ? (
            mainBanners.map((banner, index) => {
              if (index !== currentSlide) return null;

              const bTitle = i18n.language === 'ar' ? (banner.title_ar || banner.title) : banner.title;
              const bDesc = i18n.language === 'ar' ? (banner.description_ar || banner.description) : banner.description;
              const bImage = i18n.language === 'ar' && banner.image_ar ? banner.image_ar : banner.image;
              const bBtnText = i18n.language === 'ar' ? (banner.button_text_ar || banner.button_text || 'ابدأ رحلتك') : (banner.button_text || "Start your journey");
              const bUrl = banner.url || banner.button_url || '/register';
              const imagePath = bImage.startsWith('/uploads/') ? bImage.replace('/uploads/', '') : (bImage.startsWith('uploads/') ? bImage.replace('uploads/', '') : bImage);
              const imageUrl = bImage ? (bImage.startsWith('http') ? bImage : `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}/uploads/${imagePath}`) : null;

              return (
                <motion.div 
                  key={banner.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8 }}
                  className="absolute inset-0 w-full h-full flex items-center"
                >
                  {/* Background Image */}
                  {imageUrl && (
                    <div 
                      className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                      style={{ backgroundImage: `url(${imageUrl})` }}
                    />
                  )}
                  {/* Overlay for text readability */}
                  <div className="absolute inset-0 bg-background/20 dark:bg-background/40"></div>
                  <div className={`absolute inset-0 bg-gradient-to-r ${i18n.language === 'ar' ? 'from-transparent via-background/60 to-background/95' : 'from-background/95 via-background/60 to-transparent'}`}></div>
                  
                  {/* Decorative Elements */}
                  <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(#6D02A5_1.2px,transparent_1.2px)] [background-size:20px_20px] opacity-[0.05] dark:opacity-[0.1]"></div>
                    <div className="absolute -top-20 -right-20 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px]"></div>
                    <div className="absolute bottom-0 -left-20 w-[400px] h-[400px] bg-secondary/15 rounded-full blur-[100px]"></div>
                  </div>

                  {/* Content Container */}
                  <div className={`relative z-10 w-full max-w-7xl mx-auto px-4 lg:px-8 pt-20 pb-16 flex flex-col ${i18n.language === 'ar' ? 'items-start text-right' : 'items-start text-left'}`}>
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-container border border-primary/20 mb-6 shadow-sm"
                    >
                      <Sparkles className="w-4 h-4 text-primary" />
                      <span className="text-on-primary-container font-bold text-sm">
                        {i18n.language === 'ar' ? 'رحلتك نحو التميز تبدأ هنا' : 'Your journey to excellence starts here'}
                      </span>
                    </motion.div>

                    <motion.h1 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-extrabold text-on-background mb-6 leading-tight whitespace-pre-line max-w-3xl"
                    >
                      {bTitle}
                    </motion.h1>
                    
                    <motion.p 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="text-lg lg:text-xl text-on-surface-variant mb-10 max-w-2xl leading-relaxed whitespace-pre-line"
                    >
                      {bDesc}
                    </motion.p>
                    
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="flex flex-wrap gap-4 justify-start w-full"
                    >
                      <Link 
                        to={bUrl} 
                        className="px-10 py-4 bg-primary hover:bg-primary-hover text-on-primary font-bold rounded-2xl shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2 text-lg"
                      >
                        {bBtnText}
                      </Link>
                    </motion.div>
                  </div>
                </motion.div>
              );
            })
          ) : (
            // Fallback static Hero
            <motion.div 
              key="fallback"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 w-full h-full flex items-center bg-gradient-to-b from-primary-container/20 via-surface to-background"
            >
              <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(#6D02A5_1.2px,transparent_1.2px)] [background-size:20px_20px] opacity-[0.08] dark:opacity-[0.15]"></div>
                <div className="absolute -top-20 -right-20 w-[500px] h-[500px] bg-primary/15 rounded-full blur-[100px]"></div>
                <div className="absolute bottom-0 -left-20 w-[400px] h-[400px] bg-secondary/15 rounded-full blur-[100px]"></div>
              </div>

              <div className={`relative z-10 max-w-7xl mx-auto px-4 lg:px-8 flex flex-col w-full ${i18n.language === 'ar' ? 'items-start text-right' : 'items-start text-left'}`}>
                <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-container border border-primary/20 mb-6 shadow-sm">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span className="text-on-primary-container font-bold text-sm">{t('home.banner.badge')}</span>
                </motion.div>
                
                <motion.h1 variants={fadeUp} className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-extrabold text-on-background mb-6 leading-tight max-w-3xl">
                  {t('home.banner.title')}
                </motion.h1>
                
                <motion.p variants={fadeUp} className="text-lg lg:text-xl text-on-surface-variant mb-10 max-w-2xl leading-relaxed">
                  {t('home.banner.description')}
                </motion.p>
                
                <motion.div variants={fadeUp} className="flex flex-wrap gap-4 justify-start w-full">
                  <Link 
                    to="/register" 
                    className="px-10 py-4 bg-primary hover:bg-primary-hover text-on-primary font-bold rounded-2xl shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2 text-lg"
                  >
                    {t('home.buttons.startFree')}
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* مؤشرات السلايدر */}
        {mainBanners.length > 1 && (
          <div className="absolute bottom-10 left-0 right-0 z-20 flex justify-center gap-2">
            {mainBanners.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`h-2.5 rounded-full transition-all duration-300 ${currentSlide === idx ? 'bg-primary w-10' : 'bg-on-background/30 w-3 hover:bg-on-background/50'}`}
              />
            ))}
          </div>
        )}
      </section>


      {/* 3. Platform Features (Replaced Featured Courses) */}
      <section className="py-24 bg-surface-container-low/30 border-y border-outline-variant">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-on-background mb-16">
            {i18n.language === 'ar' ? 'كل ما تحتاجه في منصة واحدة' : 'All you need in one platform'}
          </h2>
          
          <div className="flex flex-wrap justify-center items-center gap-10 md:gap-16 lg:gap-24">
            {[
              { icon: <PlayCircle size={40} strokeWidth={1.5} />, labelAr: "المحاضرات", labelEn: "Lectures" },
              { icon: <Database size={40} strokeWidth={1.5} />, labelAr: "بنك الأسئلة", labelEn: "Question Bank" },
              { icon: <Layers size={40} strokeWidth={1.5} />, labelAr: "البطاقات التعليمية", labelEn: "Flashcards" },
              { icon: <Calendar size={40} strokeWidth={1.5} />, labelAr: "خطة المذاكرة", labelEn: "Study plan" },
              { icon: <ClipboardCheck size={40} strokeWidth={1.5} />, labelAr: "التقييم الذاتي", labelEn: "Self assessment" },
            ].map((feature, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="flex flex-col items-center gap-5 group"
              >
                <div className="w-28 h-28 rounded-full border-2 border-primary/30 flex items-center justify-center text-primary bg-primary/5 group-hover:bg-primary group-hover:text-on-primary group-hover:border-primary transition-all duration-300 shadow-sm cursor-pointer">
                  {feature.icon}
                </div>
                <h3 className="font-bold text-on-background text-lg group-hover:text-primary transition-colors">
                  {i18n.language === 'ar' ? feature.labelAr : feature.labelEn}
                </h3>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Medical Student Message Section */}
      {(() => {
        const medBanner = banners.find(b => b.banner_type === 'med_message');
        if (!medBanner) return null;
        
        const bTitle = i18n.language === 'ar' ? (medBanner.title_ar || medBanner.title) : medBanner.title;
        const bDesc = i18n.language === 'ar' ? (medBanner.description_ar || medBanner.description) : medBanner.description;
        const bImage = i18n.language === 'ar' && medBanner.image_ar ? medBanner.image_ar : medBanner.image;
        const bBtnText = i18n.language === 'ar' ? (medBanner.button_text_ar || medBanner.button_text || 'ابدأ الآن') : (medBanner.button_text || "Let's start");
        const bUrl = medBanner.url || medBanner.button_url || '/courses?category=Medicine';
        
        const imagePath = bImage.startsWith('/uploads/') ? bImage.replace('/uploads/', '') : (bImage.startsWith('uploads/') ? bImage.replace('uploads/', '') : bImage);
        const imageUrl = bImage ? (bImage.startsWith('http') ? bImage : `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}/uploads/${imagePath}`) : null;

        return (
          <section className="py-24 bg-background border-b border-outline-variant relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 lg:px-8">
              
              <div className="mb-12 text-center md:text-start">
                <h2 className="text-3xl sm:text-4xl font-extrabold text-on-background relative inline-block">
                  {bTitle}
                  <div className="absolute -bottom-3 left-0 w-1/2 h-1.5 bg-primary rounded-full"></div>
                </h2>
              </div>

              <div className="flex flex-col md:flex-row gap-8 lg:gap-16 items-stretch">
                
                {/* Image & Button Side */}
                <motion.div 
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                  className="w-full md:w-5/12 flex flex-col"
                >
                  <div className="w-full aspect-[4/5] sm:aspect-square md:aspect-[4/5] rounded-3xl bg-surface-container border border-outline-variant/50 overflow-hidden relative shadow-sm flex flex-col items-center justify-center">
                     {imageUrl ? (
                       <img src={imageUrl} alt={bTitle} className="w-full h-full object-cover" />
                     ) : (
                       <span className="text-on-surface-variant/40 text-2xl font-bold mb-8">صورة (Pic)</span>
                     )}
                     
                     {/* Button overlapping the image at the bottom */}
                     <div className="absolute bottom-6 left-0 right-0 flex justify-center px-6">
                       <Link 
                         to={bUrl}
                         className="w-full sm:w-auto px-10 py-4 bg-primary text-on-primary font-bold text-lg rounded-2xl shadow-glow hover:bg-primary-hover hover:scale-105 transition-all duration-300 text-center whitespace-pre-wrap"
                       >
                         {bBtnText}
                       </Link>
                     </div>
                  </div>
                </motion.div>

                {/* Text Side (Script) */}
                <motion.div 
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="w-full md:w-7/12 flex"
                >
                  <div className="w-full p-8 md:p-12 rounded-3xl bg-surface-container-low border border-outline-variant/40 shadow-sm flex items-center text-center md:text-start whitespace-pre-line">
                    <p className="text-xl md:text-2xl leading-relaxed text-on-surface-variant font-medium">
                      {bDesc}
                    </p>
                  </div>
                </motion.div>

              </div>
            </div>
          </section>
        );
      })()}



      {/* 4. Student Reviews Section */}
      <section className="py-20 bg-background relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-secondary/5 rounded-full blur-3xl -z-10 -translate-x-1/2 translate-y-1/2"></div>
        
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <h2 className="text-3xl font-extrabold text-on-background mb-4">{t('home.reviews.title')}</h2>
            <p className="text-on-surface-variant">{t('home.reviews.subtitle')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.length > 0 ? (
              testimonials.map((review, i) => {
                const cTitle = review.Course?.[`title_${i18n.language}`] || review.Course?.title || 'Unknown Course';
                return (
                  <motion.div
                    key={review.id || i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.1 }}
                    className="bg-surface p-8 rounded-3xl border border-outline-variant/60 shadow-lg hover:shadow-xl hover:-translate-y-2 transition-all duration-300 relative group flex flex-col h-full"
                  >
                    <Quote className="absolute top-6 left-6 w-10 h-10 text-primary/10 rotate-180 group-hover:text-primary/20 transition-colors duration-300" />
                    
                    <div className="flex gap-1 mb-4">
                      {[...Array(5)].map((_, idx) => (
                        <Star key={idx} className={`w-4 h-4 ${idx < (review.rating || 5) ? 'fill-amber-400 text-amber-400' : 'text-outline-variant'}`} />
                      ))}
                    </div>
                    
                    <p className="text-on-surface-variant text-sm leading-relaxed mb-8 relative z-10 font-medium flex-1">
                      "{review.review_text}"
                    </p>
                    
                    <div className="flex items-center gap-4 mt-auto">
                      {review.user?.image_profile ? (
                        <img src={import.meta.env.VITE_API_URL +"/uploads/" + review.user.image_profile} alt={review.user?.name} className="w-12 h-12 rounded-full border-2 border-primary/20 object-cover" />
                      ) : (
                        <div className="w-12 h-12 rounded-full border-2 border-primary/20 bg-primary/10 flex items-center justify-center text-primary font-bold">
                          {review.user?.name?.charAt(0) || 'S'}
                        </div>
                      )}
                      <div>
                        <h4 className="font-bold text-on-surface text-sm">{review.user?.name || 'Unknown Student'}</h4>
                        <span className="text-xs text-primary font-medium">{cTitle}</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <div className="col-span-full text-center text-on-surface-variant opacity-70">
                {t('home.reviews.empty')}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 5. Partnership Section */}
      <section className="py-20 bg-surface-variant/30 border-y border-outline-variant/50 relative">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block py-1 px-3 rounded-full bg-primary/10 text-primary text-xs font-bold mb-4 tracking-wider">
              {t('home.partners.badge')}
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-on-background mb-4">
              {t('home.partners.title')}
            </h2>
            <p className="text-on-surface-variant text-sm md:text-base max-w-2xl mx-auto">
              {t('home.partners.subtitle')}
            </p>
          </div>

          {/* Partners Grid */}
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-80">
            {partners.length > 0 ? (
              partners.map((partner) => (
                <motion.div key={partner.id} whileHover={{ scale: 1.1, opacity: 1 }} className="flex flex-col items-center gap-2 cursor-pointer transition-opacity">
                  <img 
                    src={partner.logo?.startsWith('http') ? partner.logo : (import.meta.env.VITE_API_URL || '') + partner.logo} 
                    alt={partner.name} 
                    className="h-12 object-contain grayscale hover:grayscale-0 dark:brightness-200 dark:contrast-125 dark:hover:brightness-100 transition-all" 
                  />
                  <span className="text-xs font-bold text-on-surface-variant">{partner[`name_${i18n.language}`] || partner.name}</span>
                </motion.div>
              ))
            ) : (
              <span className="text-sm text-on-surface-variant">{t('home.partners.empty')}</span>
            )}
          </div>
        </div>
      </section>

      {/* 6. FAQ Section */}
      <section className="py-20 bg-surface">
        <div className="max-w-3xl mx-auto px-4 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-on-background mb-3">{t('home.faq.title')}</h2>
            <p className="text-on-surface-variant">{t('home.faq.subtitle')}</p>
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
                      {faq[`question_${i18n.language}`] || faq.question_ar || faq.question}
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
                          {faq[`answer_${i18n.language}`] || faq.answer_ar || faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))
            ) : (
              <div className="text-center text-on-surface-variant opacity-70">
                {t('home.faq.empty')}
              </div>
            )}
          </div>
        </div>
      </section>

    </div>
  );
}