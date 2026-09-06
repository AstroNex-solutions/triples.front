import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import API from '../api/axios';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import Toast from '../components/Toast';
import { getFileUrl } from '../utils/fileHelper';
import {
  Play,
  Award,
  BookOpen,
  Star,
  ShoppingCart,
  Users,
  ChevronDown,
  Sparkles,
  ArrowRight,
  Loader2,
  Share2,
  Clock,
  CheckCircle2,
  Check,
  HelpCircle,
  Package,
  Stethoscope,
  Activity,
  GraduationCap,
  ShieldCheck,
  Zap,
  MessageCircleQuestion,
  Layers
} from 'lucide-react';

export default function CourseDetailPage() {
  const { t, i18n } = useTranslation();
  const { slug } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrollmentData, setEnrollmentData] = useState(null);
  const [previewVideo, setPreviewVideo] = useState(null); // { title: '', url: '' }

  // حالة التحكم بالتنبيه الاحترافي
  const [toast, setToast] = useState(null);

  const { addToCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        const res = await API.get(`/courses/${slug}`);
        const data = res.data.course;

        if (data && data.modules) {
          data.modules.sort((a, b) => (a.order || 0) - (b.order || 0));
          data.modules.forEach(m => {
            if (m.lessons) {
              m.lessons.sort((a, b) => (a.order || 0) - (b.order || 0));
            }
          });
        }

        setCourse(data);

        // Check enrollment if user is logged in
        if (user) {
          try {
            const enRes = await API.get('/student/enrollments');
            const enrollments = enRes.data.enrollments || [];
            const enrollment = enrollments.find(e => e.course_id === data.id);
            if (enrollment) {
              setEnrollmentData(enrollment);
              setIsEnrolled(enrollment.status === 'active' || enrollment.status === 'completed' || enrollment.status === 'frozen');
            }
          } catch (e) { }
        }
      } catch (err) {
        console.error('Error fetching course detail:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [slug, user]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleAddToCart = async (packageId = null) => {
    if (!course) return;
    setAddingToCart(true);
    try {
      await addToCart(course.id, 'course', packageId);
      showToast(t('courseDetails.addedToCart', 'تمت إضافة الدورة بنجاح إلى سلة الشراء!'), 'success');
    } catch (err) {
      showToast(err.response?.data?.message || err.message || t('courseDetails.addCartError', 'حدث خطأ أثناء الإضافة للسلة'), 'error');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: course?.title,
        url: window.location.href,
      }).catch(() => { });
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast(t('courseDetails.linkCopied', 'تم نسخ رابط الدورة إلى الحافظة!'), 'info');
    }
  };

  // شاشة التحميل الهيكلي (Skeleton Loader)
  if (loading) {
    return (
      <div className="min-h-screen pb-20 pt-8 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto space-y-8 mt-24" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
        <div className="h-96 rounded-3xl bg-surface-container-low/50 border border-outline-variant/30 animate-pulse p-8 relative overflow-hidden">
          <div className="w-1/3 h-8 bg-surface-container-high/60 rounded-xl mb-4" />
          <div className="w-2/3 h-12 bg-surface-container-high/60 rounded-xl mb-4" />
          <div className="w-1/2 h-6 bg-surface-container-high/60 rounded-xl" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-6">
            <div className="h-48 bg-surface-container-low/50 rounded-3xl animate-pulse" />
            <div className="h-96 bg-surface-container-low/50 rounded-3xl animate-pulse" />
          </div>
          <div className="lg:col-span-4 h-96 bg-surface-container-low/50 rounded-3xl animate-pulse" />
        </div>
      </div>
    );
  }

  // حالة عدم وجود الدورة
  if (!course) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
        <div className="max-w-md w-full rounded-3xl bg-surface-container-low/60 border border-outline-variant/40 p-8 text-center backdrop-blur-xl space-y-4 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-error/10 text-error mx-auto flex items-center justify-center border border-error/20">
            <BookOpen size={32} />
          </div>
          <h2 className="text-xl font-extrabold text-on-surface">{t('courseDetails.courseNotFound', 'عذراً، الدورة التدريبية غير موجودة')}</h2>
          <p className="text-xs text-on-surface-variant leading-relaxed">{t('courseDetails.courseNotFoundMsg', 'ربما تم تغيير الرابط أو حذف الدورة من النظام.')}</p>
          <Link to="/courses" className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-on-primary font-bold text-xs rounded-2xl shadow-lg hover:bg-primary-hover transition-all">
            <ArrowRight size={16} />
            <span>{t('courseDetails.backToCourses', 'العودة لجميع الدورات')}</span>
          </Link>
        </div>
      </div>
    );
  }

  // معالجة الأهداف والنقاط الرئيسية
  let parsedShortDesc = [];
  try {
    if (course.short_description) {
      const parsed = JSON.parse(course.short_description);
      if (Array.isArray(parsed)) {
        parsedShortDesc = parsed;
      }
    }
  } catch (e) {
    if (typeof course.short_description === 'string') {
      parsedShortDesc = [{ ar: course.short_description, en: course.short_description }];
    }
  }

  const demoVideoUrl = course.preview_video || course.modules?.[0]?.lessons?.[0]?.video_url;
  const demoVideoTitle = course.preview_video ? t('courseDetails.watchPreview', 'مشاهدة المعاينة المجانية (ديمو الدورة)') : course.modules?.[0]?.lessons?.[0]?.title;

  return (
    <div className="min-h-screen pb-24 pt-6 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto space-y-12 relative mt-24" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>

      {/* التنبيه العائم */}
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* ========================================================
          1. HERO SECTION (تصميم طبي موثوق ومستوحى من منصة UWorld الطبية)
          ======================================================== */}
      <div className="relative rounded-3xl bg-gradient-to-b from-surface via-surface-container-low/60 to-surface border border-outline-variant/40 p-6 sm:p-10 lg:p-12 backdrop-blur-xl shadow-xl overflow-hidden">
        {/* خلفيات إضاءة طبية ناعمة */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-secondary/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* الجانب الأيمن (النصوص، التقييم، النقاط السريرية، أزرار الإجراءات) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* الشارات العلوية */}
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
                <Stethoscope size={14} className="text-primary" />
                <span>{course.category?.name || t('courseDetails.medicalSpecialty', 'العلوم الطبية والسريرية')}</span>
              </span>

              <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <ShieldCheck size={14} />
                <span>{t('courseDetails.certifiedBadge', 'معتمد أكاديمياً وسريرياً')}</span>
              </span>

              <button
                onClick={handleShare}
                className="mr-auto p-2 rounded-xl bg-surface border border-outline-variant/40 text-on-surface-variant hover:text-primary hover:border-primary/40 transition-all shadow-sm"
                title={t('courseDetails.shareCourse', 'مشاركة الدورة')}
              >
                <Share2 size={16} />
              </button>
            </div>

            {/* العنوان الرئيسي للدورة الطبية */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-on-surface leading-tight tracking-tight">
              {course.title}
            </h1>

            {/* التقييم وعدد الطلاب المسجلين (مستوحى من UWorld) */}
            <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm">
              <div className="flex items-center gap-1 text-amber-500 font-bold bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      className={i < Math.round(course.average_rating || 5) ? 'fill-amber-400 text-amber-400' : 'text-outline-variant/40'}
                    />
                  ))}
                </div>
                <span className="ms-1 text-on-surface font-black">
                  {course.average_rating ? Number(course.average_rating).toFixed(1) : '5.0'}
                </span>
                <span className="text-on-surface-variant font-normal">
                  ({course.reviews?.length ? `${course.reviews.length} تقييم` : '15,300+ تقييم'})
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-on-surface-variant font-medium">
                <Users size={16} className="text-primary" />
                <span>{course.total_enrollments || '1,250'} {t('courseDetails.enrolledStudents', 'طالب وممارس صحي')}</span>
              </div>

              {course.total_duration ? (
                <div className="flex items-center gap-1.5 text-on-surface-variant font-medium">
                  <Clock size={16} className="text-secondary" />
                  <span>
                    {t('courseDetails.hoursAndMins', '{{hours}} ساعة و {{mins}} دقيقة', {
                      hours: Math.floor(course.total_duration / 60),
                      mins: course.total_duration % 60
                    })}
                  </span>
                </div>
              ) : null}
            </div>

            {/* الوصف التعريفي المقتضب */}
            {course.subtitle && (
              <p className="text-on-surface-variant text-sm sm:text-base leading-relaxed">
                {course.subtitle}
              </p>
            )}

            {/* قائمة النقاط والمميزات السريرية (High-Yield Medical Highlights) */}
            {parsedShortDesc.length > 0 && (
              <div className="space-y-2.5 pt-2">
                {parsedShortDesc.map((item, idx) => {
                  const point = i18n.language === 'en' ? (item.en || item.ar) : (item.ar || item.en);
                  if (!point || point.trim() === '') return null;
                  return (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5 border border-primary/20">
                        <Check size={12} strokeWidth={3} />
                      </div>
                      <span className="text-xs sm:text-sm font-medium text-on-surface leading-relaxed">
                        {point}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* بيانات المحاضر / الطبيب المشرف إن وجد */}
            {course.instructor && (
              <div className="flex items-center gap-3 pt-2 border-t border-outline-variant/30">
                <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-primary to-secondary text-white font-bold flex items-center justify-center text-sm shadow-md border-2 border-surface">
                  {course.instructor.name?.[0] || 'D'}
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-primary uppercase tracking-wider">
                    {t('courseDetails.instructorTitle', 'المحاضر والأخصائي الطبي')}
                  </p>
                  <p className="text-xs sm:text-sm font-bold text-on-surface">
                    {course.instructor.name}
                  </p>
                </div>
              </div>
            )}

            {/* أزرار الإجراءات (Call to Action - مطابق لنمط UWorld) */}
            <div className="flex flex-wrap items-center gap-4 pt-4">
              <a 
                href="#packages"
                className="px-8 py-3.5 rounded-full bg-primary text-white font-black text-sm shadow-lg shadow-primary/25 hover:bg-primary-hover hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
              >
                <span>{t('courseDetails.buyNow', 'شراء الآن')}</span>
                <ArrowRight size={16} className={i18n.language === 'ar' ? 'rotate-180' : ''} />
              </a>

              {demoVideoUrl && (
                <button
                  onClick={() => setPreviewVideo({
                    title: demoVideoTitle,
                    url: demoVideoUrl
                  })}
                  className="px-8 py-3.5 rounded-full bg-surface border-2 border-primary/40 text-primary font-black text-sm hover:border-primary hover:bg-primary/5 active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <Play size={16} className="fill-primary" />
                  <span>{t('courseDetails.viewDemo', 'عرض الديمو')}</span>
                </button>
              )}
            </div>

          </div>

          {/* الجانب الأيسر: شاشة الكمبيوتر الاحترافية (Computer Monitor Mockup) */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center">
            <div className="relative w-full max-w-md mx-auto">
              
              {/* إطار الشاشة العلوي مع الكاميرا والحواف المعدنية */}
              <div className="relative bg-slate-900 rounded-2xl border-[10px] sm:border-[12px] border-slate-800 shadow-2xl overflow-hidden aspect-video group">
                
                {/* عدسة الكاميرا أعلى الشاشة */}
                <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-slate-700/80 z-20" />
                
                {/* صورة أو غلاف المعاينة */}
                <img
                  src={getFileUrl(course.image) || 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800'}
                  alt={course.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                
                {/* تدرج داكن خفيف لإبراز زر التشغيل */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent" />

                {/* زر تشغيل الديمو التفاعلي في منتصف الشاشة */}
                {demoVideoUrl && (
                  <button
                    onClick={() => setPreviewVideo({
                      title: demoVideoTitle,
                      url: demoVideoUrl
                    })}
                    className="absolute inset-0 m-auto w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-primary text-white flex items-center justify-center shadow-[0_0_35px_rgba(109,2,165,0.7)] hover:scale-110 hover:bg-primary-hover transition-all border-2 border-white/40 cursor-pointer group-hover:shadow-[0_0_45px_rgba(109,2,165,0.9)]"
                    title={t('courseDetails.watchPreview', 'مشاهدة المعاينة المجانية')}
                  >
                    <Play size={28} className="mr-0.5 fill-white" />
                  </button>
                )}

                {/* بادج ديمو تجريبي متاح */}
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                  <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-black/60 backdrop-blur-md text-white border border-white/10 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span>{t('courseDetails.interactiveDemo', 'ديمو تفاعلي متاح')}</span>
                  </span>
                </div>
              </div>

              {/* حافة الشاشة السفلية (Monitor Chin) */}
              <div className="h-5 sm:h-6 bg-slate-800 border-t border-slate-700/60 w-full rounded-b-xl mx-auto flex items-center justify-center shadow-lg relative">
                <div className="w-12 h-1 bg-slate-600 rounded-full" />
              </div>

              {/* حامل الشاشة الأنيق (Monitor Stand Stem & Base) */}
              <div className="w-16 h-7 bg-gradient-to-b from-slate-700 to-slate-800 mx-auto shadow-inner" />
              <div className="w-36 sm:w-44 h-2.5 bg-slate-700 mx-auto rounded-t-lg shadow-md border-t border-slate-600" />
              <div className="w-48 sm:w-56 h-1.5 bg-black/20 mx-auto rounded-full blur-sm" />

            </div>
          </div>

        </div>
      </div>

      {/* ========================================================
          2. MEDICAL TRUST & FEATURES RIBBON (شريط المعايير الطبية)
          ======================================================== */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-surface-container-low/60 border border-outline-variant/30 flex items-center gap-3.5 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20">
            <Stethoscope size={20} />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-on-surface">{t('courseDetails.trust1Title', 'سيناريوهات سريرية')}</h4>
            <p className="text-[11px] text-on-surface-variant">{t('courseDetails.trust1Desc', 'حالات واقعية تحاكي الاختبارات')}</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-surface-container-low/60 border border-outline-variant/30 flex items-center gap-3.5 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center shrink-0 border border-secondary/20">
            <Activity size={20} />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-on-surface">{t('courseDetails.trust2Title', 'شروحات تشخيصية')}</h4>
            <p className="text-[11px] text-on-surface-variant">{t('courseDetails.trust2Desc', 'مدعومة بالرسوم التوضيحية')}</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-surface-container-low/60 border border-outline-variant/30 flex items-center gap-3.5 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
            <Zap size={20} />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-on-surface">{t('courseDetails.trust3Title', 'فلاش كاردز ذكية')}</h4>
            <p className="text-[11px] text-on-surface-variant">{t('courseDetails.trust3Desc', 'تكرار متباعد لتثبيت الحفظ')}</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-surface-container-low/60 border border-outline-variant/30 flex items-center gap-3.5 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0 border border-amber-500/20">
            <Award size={20} />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-on-surface">{t('courseDetails.trust4Title', 'شهادة معتمدة')}</h4>
            <p className="text-[11px] text-on-surface-variant">{t('courseDetails.trust4Desc', 'إثبات كفاءة رسمي معتمد')}</p>
          </div>
        </div>
      </div>

      {/* ========================================================
          3. COURSE SECTIONS (أقسام ومحتوى الكورس المحددة مسبقاً)
          ======================================================== */}
      {course.sections && course.sections.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center gap-3 border-b border-outline-variant/30 pb-4">
            <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Layers size={18} />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-on-surface">
                {t('courseDetails.sectionsTitle', 'أقسام ومحتوى المنهاج')}
              </h2>
              <p className="text-xs text-on-surface-variant">
                {t('courseDetails.sectionsSubtitle', 'تفاصيل ومحاور التدريب الطبي خطوة بخطوة')}
              </p>
            </div>
          </div>

          <div className="space-y-8">
            {course.sections.map((sec, idx) => {
              const title = i18n.language === 'en' ? (sec.title_en || sec.title_ar) : (sec.title_ar || sec.title_en);
              const desc = i18n.language === 'en' ? (sec.description_en || sec.description_ar) : (sec.description_ar || sec.description_en);
              
              let imgs = [];
              if (typeof sec.images === 'string') {
                try {
                  imgs = JSON.parse(sec.images);
                  if (!Array.isArray(imgs)) imgs = [sec.images];
                } catch (e) {
                  imgs = [sec.images];
                }
              } else if (Array.isArray(sec.images)) {
                imgs = sec.images;
              }

              return (
                <div 
                  key={idx} 
                  className="rounded-3xl bg-surface border border-outline-variant/40 p-6 sm:p-8 backdrop-blur-xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
                >
                  {/* شارة رقم القسم */}
                  <div className="flex items-center gap-2.5 mb-5">
                    <span className="w-7 h-7 rounded-lg bg-primary/10 text-primary font-black text-xs flex items-center justify-center border border-primary/20">
                      {idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                    </span>
                    <h3 className="text-lg sm:text-xl font-black text-on-surface">
                      {title}
                    </h3>
                  </div>

                  {/* تصميم القسم: صورة واحدة */}
                  {sec.layout_type === '1_image' && (
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                      {imgs[0] && (
                        <div className="md:col-span-5 rounded-2xl overflow-hidden border border-outline-variant/30 shadow-md">
                          <img 
                            src={getFileUrl(imgs[0])} 
                            className="w-full h-auto max-h-80 object-cover hover:scale-105 transition-transform duration-500" 
                            alt={title} 
                          />
                        </div>
                      )}
                      <div className={`${imgs[0] ? 'md:col-span-7' : 'md:col-span-12'} text-sm sm:text-base text-on-surface-variant leading-relaxed whitespace-pre-wrap`}>
                        {desc}
                      </div>
                    </div>
                  )}

                  {/* تصميم القسم: صورتين */}
                  {sec.layout_type === '2_images' && (
                    <div className="space-y-6">
                      <div className="text-sm sm:text-base text-on-surface-variant leading-relaxed whitespace-pre-wrap">
                        {desc}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {imgs.slice(0, 2).map((img, i) => (
                          <div key={i} className="rounded-2xl overflow-hidden border border-outline-variant/30 shadow-md aspect-video">
                            <img 
                              src={getFileUrl(img)} 
                              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" 
                              alt={title} 
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* تصميم القسم: 3 صور */}
                  {sec.layout_type === '3_images' && (
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                      <div className="md:col-span-6 grid grid-cols-2 gap-2.5">
                        {imgs[0] && (
                          <div className="col-span-1 row-span-2 rounded-2xl overflow-hidden border border-outline-variant/30 shadow-md">
                            <img 
                              src={getFileUrl(imgs[0])} 
                              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500 min-h-[220px]" 
                              alt={title} 
                            />
                          </div>
                        )}
                        <div className="col-span-1 flex flex-col gap-2.5">
                          {imgs[1] && (
                            <div className="rounded-xl overflow-hidden border border-outline-variant/30 shadow-sm aspect-video sm:aspect-square">
                              <img 
                                src={getFileUrl(imgs[1])} 
                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" 
                                alt={title} 
                              />
                            </div>
                          )}
                          {imgs[2] && (
                            <div className="rounded-xl overflow-hidden border border-outline-variant/30 shadow-sm aspect-video sm:aspect-square">
                              <img 
                                src={getFileUrl(imgs[2])} 
                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" 
                                alt={title} 
                              />
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="md:col-span-6 text-sm sm:text-base text-on-surface-variant leading-relaxed whitespace-pre-wrap">
                        {desc}
                      </div>
                    </div>
                  )}

                  {/* حالة عدم اختيار layout مخصص (عرض تلقائي) */}
                  {!['1_image', '2_images', '3_images'].includes(sec.layout_type) && (
                    <div className="space-y-4">
                      <div className="text-sm sm:text-base text-on-surface-variant leading-relaxed whitespace-pre-wrap">
                        {desc}
                      </div>
                      {imgs.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2">
                          {imgs.map((img, i) => (
                            <div key={i} className="rounded-2xl overflow-hidden border border-outline-variant/30 shadow-md aspect-video">
                              <img src={getFileUrl(img)} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" alt={title} />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================
          4. FAQS SECTION (الأسئلة الشائعة بنمط طبي منظم)
          ======================================================== */}
      {course.faqs && course.faqs.length > 0 && (
        <div className="rounded-3xl bg-surface border border-outline-variant/40 p-6 sm:p-10 backdrop-blur-xl space-y-6 shadow-sm">
          <div className="flex items-center gap-3 border-b border-outline-variant/30 pb-4">
            <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <HelpCircle size={18} />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-on-surface">
                {t('courseDetails.faqsTitle', 'الأسئلة الشائعة حول الدورة')}
              </h2>
              <p className="text-xs text-on-surface-variant">
                {t('courseDetails.faqsSubtitle', 'إجابات واضحة على أكثر التساؤلات شيوعاً بين الأطباء والطلبة')}
              </p>
            </div>
          </div>

          <div className="space-y-3.5">
            {course.faqs.map((faq, idx) => {
              const question = i18n.language === 'en' ? (faq.question_en || faq.question_ar) : (faq.question_ar || faq.question_en);
              const answer = i18n.language === 'en' ? (faq.answer_en || faq.answer_ar) : (faq.answer_ar || faq.answer_en);
              return (
                <details 
                  key={idx} 
                  className="group border border-outline-variant/40 rounded-2xl bg-surface-container-low/40 hover:bg-surface-container-low transition-colors overflow-hidden"
                >
                  <summary className="w-full p-4 sm:p-5 flex items-center justify-between text-right cursor-pointer font-bold text-sm sm:text-base text-on-surface list-none">
                    <span className="flex items-center gap-2.5">
                      <MessageCircleQuestion size={18} className="text-primary shrink-0 opacity-70" />
                      <span>{question}</span>
                    </span>
                    <ChevronDown size={18} className="text-on-surface-variant transition-transform duration-300 group-open:rotate-180 group-open:text-primary shrink-0" />
                  </summary>
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-on-surface-variant leading-relaxed border-t border-outline-variant/20 bg-surface/40 whitespace-pre-wrap">
                    {answer}
                  </div>
                </details>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================
          5. PACKAGES & PRICING SECTION (باقات الاشتراك والتسعيرة الطبية)
          ======================================================== */}
      {course.packages && course.packages.length > 0 && (
        <div id="packages" className="rounded-3xl bg-surface border border-outline-variant/40 p-6 sm:p-10 backdrop-blur-xl space-y-8 shadow-sm scroll-mt-24">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20 mb-1">
              <Package size={14} />
              <span>{t('courseDetails.pricingBadge', 'خيارات الاشتراك المرنة')}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-on-surface">
              {t('courseDetails.packagesTitle', 'باقات الاشتراك والتسعيرة')}
            </h2>
            <p className="text-xs sm:text-sm text-on-surface-variant">
              {t('courseDetails.packagesDesc', 'اختر الباقة الأنسب لأهدافك التعليمية وجدول مراجعتك الطبية')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
            {course.packages.map((pkg, idx) => {
              const name = i18n.language === 'en' ? (pkg.name_en || pkg.name_ar) : (pkg.name_ar || pkg.name_en);
              const note = i18n.language === 'en' ? (pkg.note_en || pkg.note_ar) : (pkg.note_ar || pkg.note_en);
              const isPopular = idx === 1 || course.packages.length === 1;

              return (
                <div 
                  key={idx} 
                  className={`relative rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 ${
                    isPopular 
                      ? 'bg-gradient-to-b from-primary/5 via-surface to-surface border-2 border-primary shadow-xl shadow-primary/10 -translate-y-1' 
                      : 'bg-surface-container-low/40 border border-outline-variant/40 hover:border-primary/40 hover:shadow-lg'
                  }`}
                >
                  {isPopular && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-primary text-white text-[11px] font-black tracking-wider uppercase shadow-md flex items-center gap-1">
                      <Sparkles size={12} />
                      <span>{t('courseDetails.mostPopular', 'الأكثر اختياراً')}</span>
                    </div>
                  )}

                  <div>
                    <h3 className="text-xl font-extrabold text-on-surface mb-2">{name}</h3>
                    {note && (
                      <p className="text-xs text-on-surface-variant mb-4 leading-relaxed min-h-[32px]">{note}</p>
                    )}

                    {/* السعر */}
                    <div className="py-4 border-y border-outline-variant/30 my-4 flex items-baseline gap-1" dir="ltr">
                      <span className="text-3xl sm:text-4xl font-black text-primary">${pkg.price}</span>
                      <span className="text-xs text-on-surface-variant font-medium">/ {t('courseDetails.access', 'اشتراك')}</span>
                    </div>

                    {/* قائمة المزايا السريرية المضمنة في الباقة */}
                    <div className="space-y-3 pt-2 mb-8">
                      <div className="flex items-center gap-2.5 text-xs sm:text-sm text-on-surface">
                        <CheckCircle2 size={16} className={pkg.includes_course_content ? 'text-emerald-500' : 'text-outline-variant/50'} />
                        <span className={pkg.includes_course_content ? 'font-medium' : 'text-on-surface-variant/50 line-through'}>
                          {t('courseDetails.includesCourseContent', 'محتوى الدورة والمحاضرات الكاملة')}
                        </span>
                      </div>

                      <div className="flex items-center gap-2.5 text-xs sm:text-sm text-on-surface">
                        <CheckCircle2 size={16} className={pkg.includes_flashcards ? 'text-emerald-500' : 'text-outline-variant/50'} />
                        <span className={pkg.includes_flashcards ? 'font-medium' : 'text-on-surface-variant/50 line-through'}>
                          {t('courseDetails.includesFlashcards', 'الفلاش كاردز الطبية الذكية')}
                        </span>
                      </div>

                      <div className="flex items-center gap-2.5 text-xs sm:text-sm text-on-surface">
                        <CheckCircle2 size={16} className={pkg.includes_question_banks ? 'text-emerald-500' : 'text-outline-variant/50'} />
                        <span className={pkg.includes_question_banks ? 'font-medium' : 'text-on-surface-variant/50 line-through'}>
                          {t('courseDetails.includesQuestionBanks', 'بنوك الأسئلة السريرية التفاعلية')}
                        </span>
                      </div>

                      <div className="flex items-center gap-2.5 text-xs sm:text-sm text-on-surface">
                        <CheckCircle2 size={16} className={pkg.includes_self_assessments ? 'text-emerald-500' : 'text-outline-variant/50'} />
                        <span className={pkg.includes_self_assessments ? 'font-medium' : 'text-on-surface-variant/50 line-through'}>
                          {t('courseDetails.includesSelfAssessments', 'التقييمات والاختبارات الذاتية')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* زر الاشتراك بالباقة */}
                  <button
                    onClick={() => handleAddToCart(pkg.id)}
                    disabled={addingToCart}
                    className={`w-full py-3.5 px-4 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-sm ${
                      isPopular 
                        ? 'bg-primary text-white hover:bg-primary-hover shadow-primary/20' 
                        : 'bg-surface-variant text-on-surface hover:bg-primary hover:text-white'
                    } disabled:opacity-50 cursor-pointer`}
                  >
                    {addingToCart ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <>
                        <ShoppingCart size={16} />
                        <span>{t('courseDetails.subscribeNow', 'اشترك في هذه الباقة')}</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================
          6. REVIEWS & TESTIMONIALS (تقييمات وآراء الأطباء والطلبة)
          ======================================================== */}
      {course.reviews && course.reviews.length > 0 && (
        <div className="rounded-3xl bg-surface border border-outline-variant/40 p-6 sm:p-10 backdrop-blur-xl space-y-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-outline-variant/30 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                <Star size={18} className="fill-amber-400" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-black text-on-surface">
                  {t('courseDetails.reviewsTitle', 'آراء وتقييمات الطلاب والأطباء')}
                </h2>
                <p className="text-xs text-on-surface-variant">
                  {t('courseDetails.reviewsSubtitle', 'تجارب حقيقية من ممارسين اجتازوا التقييم بنجاح')}
                </p>
              </div>
            </div>
            <span className="text-xs font-bold px-3 py-1 bg-surface-container-high rounded-full text-on-surface">
              {course.reviews.length} {t('courseDetails.rating', 'تقييم')}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {course.reviews.map((review, idx) => (
              <div key={idx} className="p-5 rounded-2xl bg-surface-container-low/40 border border-outline-variant/30 flex gap-4">
                <div className="w-10 h-10 shrink-0 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold overflow-hidden border border-primary/20">
                  {review.user?.image_profile && review.user.image_profile !== 'blank.png' ? (
                    <img src={review.user.image_profile} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span>{review.user?.name?.[0] || 'D'}</span>
                  )}
                </div>
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-on-surface">{review.user?.name || 'طالب متميز'}</h4>
                    <div className="flex text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={12} className={i < review.rating ? 'fill-amber-400' : 'text-outline-variant/40'} />
                      ))}
                    </div>
                  </div>
                  {review.review_text && (
                    <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">{review.review_text}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================
          7. VIDEO PREVIEW MODAL (نافذة عرض ديمو الفيديو المنبثقة)
          ======================================================== */}
      {previewVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
          <div className="bg-surface rounded-3xl overflow-hidden w-full max-w-4xl border border-outline-variant/30 shadow-2xl">
            <div className="flex items-center justify-between p-4 px-6 border-b border-outline-variant/30 bg-surface-container-low/60">
              <div className="flex items-center gap-2.5">
                <Play size={16} className="text-primary fill-primary" />
                <h3 className="text-sm font-bold text-on-surface truncate">{previewVideo.title}</h3>
              </div>
              <button
                onClick={() => setPreviewVideo(null)}
                className="w-8 h-8 rounded-full bg-surface border border-outline-variant/30 text-on-surface-variant hover:text-error hover:border-error/40 transition-all flex items-center justify-center cursor-pointer"
                title="إغلاق"
              >
                ✕
              </button>
            </div>
            <div className="relative w-full aspect-video bg-black flex items-center justify-center">
              {previewVideo.url ? (
                <iframe
                  src={previewVideo.url.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                  loading="lazy"
                  className="border-0 absolute top-0 h-full w-full"
                  allow="accelerometer;gyroscope;autoplay;encrypted-media;picture-in-picture;"
                  allowFullScreen
                ></iframe>
              ) : (
                <div className="text-center text-on-surface-variant space-y-2">
                  <Play size={32} className="mx-auto opacity-50" />
                  <p className="text-sm font-bold">لا يوجد فيديو متاح لهذه المعاينة</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}