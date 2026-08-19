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
  FileText,
  ShoppingCart,
  Users,
  ChevronDown,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Loader2,
  Lock,
  Globe2,
  Share2,
  Clock,
  CheckCircle2,
  Layers,
  Snowflake,
  Unlock
} from 'lucide-react';

const PublicModuleNode = ({ module, allModules, idx, level = 0, openModuleIds, toggleModule, setPreviewVideo }) => {
  const { t } = useTranslation();
  const isOpen = openModuleIds.includes(module.id);
  const subModules = allModules.filter(m => m.submodule_id === module.id);

  return (
    <div
      className={`border border-outline-variant/40 rounded-2xl overflow-hidden transition-all bg-surface/50 hover:bg-surface/80 ${level > 0 ? 'mt-3 border-r-2 border-r-primary/50' : ''}`}
    >
      <button
        onClick={() => toggleModule(module.id)}
        className={`w-full p-4 flex items-center justify-between text-right cursor-pointer ${level > 0 ? 'bg-surface-container-low/30' : ''}`}
      >
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-primary">{level === 0 ? `\${t('courseDetails.module', 'موديول')} \${idx + 1}` : t('courseDetails.subModule', 'قسم فرعي')}</span>
            <span className="text-xs text-on-surface-variant">• ({module.lessons?.length || 0}  ${t('courseDetails.lessons', 'دروس')})</span>
          </div>
          <h3 className="text-sm sm:text-base font-bold text-on-surface">{module.name}</h3>
        </div>
        <ChevronDown size={18} className={`text-on-surface-variant transition-transform duration-300 ${isOpen ? 'rotate-180 text-primary' : ''}`} />
      </button>

      {isOpen && (
        <div className="px-4 pb-4 pt-1 border-t border-outline-variant/30 space-y-2 bg-surface-container-low/30">
          {module.description && (
            <p className="text-xs text-on-surface-variant/80 mb-3">{module.description}</p>
          )}

          {module.lessons && module.lessons.map((lesson) => (
            <div
              key={lesson.id}
              className="flex items-center justify-between p-3 rounded-xl bg-surface border border-outline-variant/30 hover:border-primary/40 transition-all text-xs sm:text-sm"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <Play size={14} />
                </div>
                <span className="font-semibold text-on-surface">{lesson.title}</span>
                {lesson.is_free && (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {t('courseDetails.freePreview', 'معاينة مجانية')}
                  </span>
                )}
              </div>

              {lesson.is_free ? (
                <button
                  onClick={() => setPreviewVideo({ title: lesson.title, url: lesson.video_url })}
                  className="text-xs font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>{t('courseDetails.watch', 'مشاهدة')}</span>
                  <ArrowRight size={14} className="rotate-180" />
                </button>
              ) : (
                <div className="flex items-center gap-1 text-on-surface-variant/60 text-xs">
                  <Lock size={12} />
                  <span>{t('courseDetails.locked', 'مغلق')}</span>
                </div>
              )}
            </div>
          ))}

          {subModules.length > 0 && (
            <div className="pl-4 pr-1 mt-3 space-y-3 border-r border-outline-variant/20">
              {subModules.map((sm, smIdx) => (
                <PublicModuleNode
                  key={sm.id}
                  module={sm}
                  allModules={allModules}
                  idx={smIdx}
                  level={level + 1}
                  openModuleIds={openModuleIds}
                  toggleModule={toggleModule}
                  setPreviewVideo={setPreviewVideo}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default function CourseDetailPage() {
  const { t, i18n } = useTranslation();
  const { slug } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const [openModuleIds, setOpenModuleIds] = useState([]);
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
        console.log(res.data.course);

        const data = res.data.course;
        setCourse(data);
        if (data?.modules && data.modules.length > 0) {
          // فتح الموديول الأول بشكل افتراضي
          setOpenModuleIds([data.modules[0].id]);
        }

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

  const handleAddToCart = async () => {
    if (!course) return;
    setAddingToCart(true);
    try {
      await addToCart(course.id);
      showToast(t('courseDetails.addedToCart', 'تمت إضافة الدورة بنجاح إلى سلة الشراء!'), 'success');
    } catch (err) {
      showToast(err.response?.data?.message || err.message || t('courseDetails.addCartError', 'حدث خطأ أثناء الإضافة للسلة'), 'error');
    } finally {
      setAddingToCart(false);
    }
  };

  const toggleModule = (modId) => {
    setOpenModuleIds((prev) =>
      prev.includes(modId) ? prev.filter(id => id !== modId) : [...prev, modId]
    );
  };

  const toggleAllModules = () => {
    if (!course?.modules) return;
    if (openModuleIds.length === course.modules.length) {
      setOpenModuleIds([]);
    } else {
      setOpenModuleIds(course.modules.map(m => m.id));
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

  // 1. شاشة التحميل الهيكلي (Skeleton Loader)
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

  // 2. حالة عدم وجود الدورة
  if (!course) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
        <div className="max-w-md w-full rounded-3xl bg-surface-container-low/60 border border-outline-variant/40 p-8 text-center backdrop-blur-xl space-y-4 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-error/10 text-error mx-auto flex items-center justify-center border border-error/20">
            <BookOpen size={32} />
          </div>
          <h2 className="text-xl font-extrabold text-on-surface">{t('courseDetails.courseNotFound', 'عذراً، الدورة التدريبية غير موجودة')}</h2>
          <p className="text-xs text-on-surface-variant leading-relaxed">{t('courseDetails.courseNotFoundMsg', 'ربما تم تغيير الرابط أو حذف الدورة من النظام.')}</p>
          <Link to="/courses" className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-on-primary font-bold text-xs rounded-2xl shadow-glow hover:bg-primary-hover transition-all">
            <ArrowRight size={16} />
            <span>{t('courseDetails.backToCourses', 'العودة لجميع الدورات')}</span>
          </Link>
        </div>
      </div>
    );
  }

  const price = course.discount_price || course.price;
  const originalPrice = course.discount_price ? course.price : null;
  const totalLessons = course.modules?.reduce((acc, m) => acc + (m.lessons?.length || 0), 0) || 0;

  return (
    <div className="min-h-screen pb-20 pt-6 px-4 sm:px-6 lg:px-12 max-w-container-max mx-auto space-y-10 relative mt-24" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>

      {/* التنبيه العائم */}
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* 1. Hero Banner */}
      <div className="relative rounded-3xl bg-surface-container-low/70 border border-outline-variant/40 p-6 sm:p-10 backdrop-blur-xl overflow-hidden shadow-2xl">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-accent/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-3.5 py-1 rounded-full text-xs font-extrabold bg-primary/15 text-primary border border-primary/30">
                {course.category?.name || t('courseDetails.devCategory', 'برمجة وتطوير')}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
                <Sparkles size={13} />
                <span>{t('courseDetails.certifiedCourse', 'دورة معتمدة')}</span>
              </span>
              <button
                onClick={handleShare}
                className="mr-auto p-2 rounded-xl bg-surface/50 border border-outline-variant/30 text-on-surface-variant hover:text-primary transition-colors"
                title={t('courseDetails.shareCourse', 'مشاركة الدورة')}
              >
                <Share2 size={16} />
              </button>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-on-surface leading-tight tracking-tight">
              {course.title}
            </h1>

            <p className="text-on-surface-variant text-xs sm:text-sm leading-relaxed">
              {course.subtitle || course.short_description || course.description?.substring(0, 180)}
            </p>

            <div className="flex flex-wrap items-center gap-6 text-xs sm:text-sm text-on-surface-variant/90 pt-4 border-t border-outline-variant/30">
              <div className="flex items-center gap-1.5 text-amber-400 font-extrabold">
                <Star size={18} className="fill-amber-400" />
                <span>{course.average_rating || 5.0}</span>
                <span className="text-on-surface-variant font-medium text-xs">({course.reviews?.length || 0}  ${t('courseDetails.rating', 'تقييم')})</span>
              </div>

              <div className="flex items-center gap-1.5">
                <Users size={16} className="text-primary" />
                <span>{course.total_enrollments || 0}  ${t('courseDetails.enrolledStudents', 'طالب مسجل')}</span>
              </div>

              <div className="flex items-center gap-1.5">
                <Clock size={16} className="text-secondary" />
                <span>
                  {course.total_duration
                    ? t('courseDetails.hoursAndMins', '{{hours}} ساعة و {{mins}} دقيقة', { hours: Math.floor(course.total_duration / 60), mins: course.total_duration % 60 })
                    : t('courseDetails.durationNotSet', 'مدة غير محددة')}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <Award size={16} className="text-emerald-400" />
                <span>{t('courseDetails.certifiedInstructor', 'شهادة معتمدة')}</span>
              </div>
            </div>

            {course.instructor && (
              <div className="flex items-center gap-3 pt-2">
                <div className="w-10 h-10 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center border border-primary/30 text-sm shadow-sm">
                  {course.instructor.name?.[0] || 'D'}
                </div>
                <div>
                  <p className="text-[11px] text-on-surface-variant/70">{t('courseDetails.instructorTitle', 'المحاضر والمعد')}</p>
                  <p className="text-xs sm:text-sm font-bold text-on-surface">{course.instructor.name}</p>
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl overflow-hidden border border-outline-variant/50 shadow-2xl group">
              <img
                src={getFileUrl(course.image) || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800'}
                alt={course.title}
                className="w-full h-64 sm:h-72 object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

              {course.modules?.[0]?.lessons?.[0] && (
                <button
                  onClick={() => setPreviewVideo({ title: course.modules[0].lessons[0].title, url: course.modules[0].lessons[0].video_url })}
                  className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-primary/90 text-on-primary flex items-center justify-center shadow-glow hover:scale-110 transition-all border border-white/20 cursor-pointer"
                  title={t('courseDetails.watchPreview', 'مشاهدة المعاينة المجانية')}
                >
                  <Play size={26} className="mr-1 fill-on-primary" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Layout Details & Sticky Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8 space-y-8">

          {/* Overview Section */}
          <div className="rounded-3xl bg-surface-container-low/60 border border-outline-variant/40 p-6 sm:p-8 backdrop-blur-xl space-y-4">
            <h2 className="text-lg sm:text-xl font-extrabold text-on-surface flex items-center gap-2">
              <FileText size={20} className="text-primary" />
              <span>{t('courseDetails.overviewTitle', 'نظرة عامة عن الدورة')}</span>
            </h2>
            <div className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
              <p>{course.description || t('courseDetails.defaultDesc', 'تمنحك هذه الدورة معرفة شاملة وتطبيقات عملية ومبسطة للوصول للإتقان والأداء الأكاديمي والمهني المتميز.')}</p>
            </div>
          </div>

          {/* Curriculum Accordions */}
          <div className="rounded-3xl bg-surface-container-low/60 border border-outline-variant/40 p-6 sm:p-8 backdrop-blur-xl space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-outline-variant/30 pb-4">
              <div>
                <h2 className="text-lg sm:text-xl font-extrabold text-on-surface flex items-center gap-2">
                  <BookOpen size={20} className="text-primary" />
                  <span>{t('courseDetails.curriculumTitle', 'منهاج وموديولات الدورة')}</span>
                </h2>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  {t('courseDetails.curriculumStats', 'يتضمن {{modulesCount}} موديولات • {{lessonsCount}} درس فيديو', { modulesCount: course.modules?.length || 0, lessonsCount: totalLessons })}
                </p>
              </div>

              {course.modules && course.modules.length > 0 && (
                <button
                  onClick={toggleAllModules}
                  className="text-xs font-bold text-primary hover:underline flex items-center gap-1 bg-primary/10 px-3 py-1.5 rounded-xl border border-primary/20"
                >
                  <Layers size={14} />
                  <span>{openModuleIds.length === course.modules.length ? t('courseDetails.collapseAll', 'طي الكل') : t('courseDetails.expandAll', 'توسيع الكل')}</span>
                </button>
              )}
            </div>

            <div className="space-y-3">
              {course.modules && course.modules.filter(m => !m.submodule_id).map((mod, idx) => (
                <PublicModuleNode
                  key={mod.id || idx}
                  module={mod}
                  allModules={course.modules}
                  idx={idx}
                  level={0}
                  openModuleIds={openModuleIds}
                  toggleModule={toggleModule}
                  setPreviewVideo={setPreviewVideo}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Sticky Pricing Sidebar */}
        <div className="lg:col-span-4 sticky top-24 space-y-6">
          <div className="rounded-3xl bg-surface-container-low/80 border border-outline-variant/50 p-6 backdrop-blur-xl shadow-2xl space-y-6">
            <div className="space-y-1">
              <span className="text-xs text-on-surface-variant/80 font-bold block">{t('courseDetails.subscriptionPrice', 'سعر الاشتراك بالدورة:')}</span>
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-black text-on-surface" dir="ltr">JOD {price}</span>
                {originalPrice && (
                  <span className="text-sm font-bold text-on-surface-variant/60 line-through" dir="ltr">
                    ${originalPrice}
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-3">
              {isEnrolled ? (
                <Link
                  to={`/learn/${course.id}`}
                  className="w-full py-4 bg-primary text-on-primary font-bold text-sm rounded-2xl hover:bg-primary-hover transition-all flex items-center justify-center gap-2 shadow-glow cursor-pointer"
                >
                  <Play size={18} className="fill-current" />
                  <span>{t('courseDetails.resumeLearning', 'متابعة التعلم')}</span>
                </Link>
              ) : (
                <button
                  onClick={handleAddToCart}
                  disabled={addingToCart}
                  className="w-full py-4 bg-primary text-on-primary font-bold text-sm rounded-2xl hover:bg-primary-hover transition-all flex items-center justify-center gap-2 shadow-glow cursor-pointer disabled:opacity-60"
                >
                  {addingToCart ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <>
                      <ShoppingCart size={18} />
                      <span>{t('courseDetails.addToCartNow', 'إضافة الدورة للسلة الآن')}</span>
                    </>
                  )}
                </button>
              )}

              {course.modules?.[0]?.lessons?.[0] && (
                <button
                  onClick={() => setPreviewVideo({ title: course.modules[0].lessons[0].title, url: course.modules[0].lessons[0].video_url })}
                  className="w-full py-3.5 bg-surface border border-outline-variant/60 text-on-surface font-bold text-xs rounded-2xl hover:bg-surface-container transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Play size={16} className="text-primary" />
                  <span>{t('courseDetails.watchPreview', 'مشاهدة المعاينة المجانية')}</span>
                </button>
              )}
            </div>

            <div className="space-y-3 pt-4 border-t border-outline-variant/30 text-xs text-on-surface-variant">
              <p className="font-bold text-on-surface text-xs">{t('courseDetails.includesTitle', 'تشتمل هذه الدورة على:')}</p>

              <div className="flex items-center gap-2.5">
                <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                <span>{t('courseDetails.includeLifeTime', 'وصول كامل ومستمر مدى الحياة')}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                <span>{t('courseDetails.includeInteractive', 'شرح تفاعلي وبنك أسئلة متكامل')}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                <span>{t('courseDetails.includeCert', 'شهادة إتمام معتمدة فور الانتهاء')}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Globe2 size={16} className="text-primary shrink-0" />
                <span>{t('courseDetails.includeDevices', 'مشاهدة من الهاتف أو الحاسوب')}</span>
              </div>
            </div>

            <div className="pt-2 text-center text-[11px] text-on-surface-variant/70 flex items-center justify-center gap-1 border-t border-outline-variant/20">
              <ShieldCheck size={14} className="text-emerald-400" />
              <span>{t('courseDetails.moneyBack', 'ضمان استعادة الأموال وسداد آمن 100%')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. تقييمات الطلاب (Reviews Section) */}
      {course.reviews && course.reviews.length > 0 && (
        <div className="rounded-3xl bg-surface-container-low/60 border border-outline-variant/40 p-6 sm:p-8 backdrop-blur-xl mt-8 space-y-6">
          <h2 className="text-lg sm:text-xl font-extrabold text-on-surface flex items-center gap-2 border-b border-outline-variant/30 pb-4">
            <Star size={20} className="text-amber-400 fill-amber-400" />
            <span>{t('courseDetails.reviewsTitle', 'آراء وتقييمات الطلاب')}</span>
            <span className="text-sm text-on-surface-variant mr-auto font-normal">({course.reviews.length}  ${t('courseDetails.rating', 'تقييم')})</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {course.reviews.map((review, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-surface/50 border border-outline-variant/30 flex gap-4">
                <div className="w-10 h-10 shrink-0 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold overflow-hidden border border-primary/20">
                  {review.user?.image_profile && review.user.image_profile !== 'blank.png' ? (
                    <img src={review.user.image_profile} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span>{review.user?.name?.[0] || 'S'}</span>
                  )}
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-on-surface">{review.user?.name || 'طالب'}</h4>
                  <div className="flex text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={12} className={i < review.rating ? 'fill-amber-400' : 'text-outline-variant'} />
                    ))}
                  </div>
                  {review.review_text && (
                    <p className="text-xs text-on-surface-variant pt-1 leading-relaxed">{review.review_text}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Video Preview Modal */}
      {previewVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
          <div className="bg-surface rounded-3xl overflow-hidden w-full max-w-4xl border border-outline-variant/20 shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-outline-variant/20 bg-surface-container-low/50">
              <h3 className="text-sm font-bold text-on-surface truncate">{previewVideo.title}</h3>
              <button
                onClick={() => setPreviewVideo(null)}
                className="p-1.5 rounded-xl bg-surface border border-outline-variant/30 text-on-surface-variant hover:text-error hover:bg-error/10 transition-all cursor-pointer"
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