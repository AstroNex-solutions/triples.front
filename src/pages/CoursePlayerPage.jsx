import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../api/axios';
import Toast from '../components/Toast';
import { 
  Play, 
  CheckCircle, 
  FileText, 
  ArrowRight, 
  ChevronDown, 
  Loader2, 
  BookOpen, 
  Sparkles,
  Lock,
  Check,
  Star,
  MessageSquare
} from 'lucide-react';

const PlayerModuleNode = ({ module, allModules, idx, level = 0, openModuleIds, toggleModule, currentLesson, completedLessons, courseId }) => {
  const isOpen = openModuleIds.includes(module.id);
  const subModules = allModules.filter(m => m.submodule_id === module.id);
  
  return (
    <div className={`border border-outline-variant/30 rounded-2xl overflow-hidden bg-surface/40 transition-all ${level > 0 ? 'mt-2 border-r-2 border-r-primary/50' : ''}`}>
      <button 
        onClick={() => toggleModule(module.id)}
        className={`w-full p-3 flex items-center justify-between text-right cursor-pointer hover:bg-surface/80 transition-colors ${level > 0 ? 'bg-surface-container-low/30' : ''}`}
      >
        <div className="space-y-0.5">
          <span className="text-[10px] font-bold text-primary block">{level === 0 ? `موديول ${idx + 1}` : 'قسم فرعي'}</span>
          <h4 className="text-xs font-bold text-on-surface line-clamp-1">{module.name}</h4>
        </div>
        <ChevronDown size={16} className={`text-on-surface-variant transition-transform duration-300 shrink-0 ${isOpen ? 'rotate-180 text-primary' : ''}`} />
      </button>

      {isOpen && (
        <div className="p-2 border-t border-outline-variant/30 space-y-1 bg-surface-container-low/20">
          {module.lessons && module.lessons.map((lesson) => {
            const isActive = currentLesson && lesson.id === currentLesson.id;
            const lessonCompleted = completedLessons.includes(lesson.id);

            return (
              <Link 
                key={lesson.id} 
                to={`/learn/${courseId}/lesson/${lesson.id}`}
                className={`flex items-center justify-between p-2.5 rounded-xl text-xs transition-all ${
                  isActive 
                    ? 'bg-primary/15 text-primary font-bold border border-primary/30 shadow-sm' 
                    : 'text-on-surface-variant hover:bg-surface hover:text-on-surface border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  {lessonCompleted ? (
                    <Check size={14} className="text-emerald-400 shrink-0" />
                  ) : (
                    <Play size={13} className={`shrink-0 ${isActive ? 'text-primary' : 'text-on-surface-variant/60'}`} />
                  )}
                  <span className="truncate">{lesson.title}</span>
                </div>

                {lesson.is_free && !isActive && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                    مجاني
                  </span>
                )}
              </Link>
            );
          })}
          
          {subModules.length > 0 && (
            <div className="pl-3 pr-1 mt-2 space-y-2 border-r border-outline-variant/20">
              {subModules.map((sm, smIdx) => (
                <PlayerModuleNode 
                  key={sm.id} 
                  module={sm} 
                  allModules={allModules} 
                  idx={smIdx} 
                  level={level + 1}
                  openModuleIds={openModuleIds} 
                  toggleModule={toggleModule} 
                  currentLesson={currentLesson} 
                  completedLessons={completedLessons} 
                  courseId={courseId}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default function CoursePlayerPage() {
  const { courseId, lessonId } = useParams();
  const [course, setCourse] = useState(null);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [completedLessons, setCompletedLessons] = useState([]);
  const [openModuleIds, setOpenModuleIds] = useState([]);
  const [toast, setToast] = useState(null);
  const [lessonProgresses, setLessonProgresses] = useState({});
  const currentPlaybackTimeRef = React.useRef(0);

  // Review Modal State
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewData, setReviewData] = useState({ rating: 5, review_text: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const cRes = await API.get(`/student/courses/${courseId}/play`);
        const cData = cRes.data.course;
        setCourse(cData);

        // Get completed lessons
        if (cRes.data.moduleProgress) {
          let completed = [];
          cRes.data.moduleProgress.forEach(mp => {
            if (mp.completed_lessons) {
              completed = [...completed, ...mp.completed_lessons];
            }
          });
          setCompletedLessons(completed);
        }

        if (cRes.data.lessonProgress) {
          const lpMap = {};
          cRes.data.lessonProgress.forEach(lp => {
            lpMap[lp.lesson_id] = lp;
          });
          setLessonProgresses(lpMap);
        }

        // العثور على الدرس النشط وتحديد الموديول المفتوح
        if (cData && cData.modules && cData.modules.length > 0) {
          let found = null;
          let openMod = null;
          
          if (lessonId) {
            for (const m of cData.modules) {
              found = m.lessons?.find(l => l.id === parseInt(lessonId));
              if (found) {
                openMod = m.id;
                break;
              }
            }
          }
          
          // إذا لم يتم تحديد درس معين، افتح أول درس في أول موديول
          if (!found) {
            found = cData.modules[0].lessons?.[0];
            openMod = cData.modules[0].id;
          }
          
          if (found) {
            setCurrentLesson(found);
            setOpenModuleIds([openMod]);
          }
        }
      } catch (err) {
        console.error('Error fetching player data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [courseId, lessonId]);

  useEffect(() => {
    const handleMessage = (e) => {
      if (e.origin !== "https://iframe.mediadelivery.net") return;
      try {
        const data = JSON.parse(e.data);
        if (data.event === 'timeupdate') {
           currentPlaybackTimeRef.current = data.time;
        } else if (data.event === 'ended') {
           if (currentLesson && !completedLessons.includes(currentLesson.id)) {
             handleMarkComplete();
           }
        }
      } catch (err) {}
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [currentLesson, completedLessons]);

  useEffect(() => {
    if (!currentLesson) return;
    const interval = setInterval(() => {
      const t = currentPlaybackTimeRef.current;
      if (t > 0) {
        API.post(`/student/progress/${currentLesson.id}`, {
          progress_seconds: Math.floor(t)
        }).catch(() => {});
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [currentLesson]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const handleMarkComplete = async () => {
    if (!currentLesson) return;
    setCompleting(true);
    try {
      await API.post('/content/complete-lesson', {
        lesson_id: currentLesson.id,
        course_id: courseId,
        module_id: currentLesson.module_id
      });
      setCompletedLessons((prev) => [...prev, currentLesson.id]);
      showToast('تم إكمال الدرس وزيادة نسبة تقدمك بنجاح! 🎉', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || err.message || 'حدث خطأ في التسجيل', 'error');
    } finally {
      setCompleting(false);
    }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!reviewData.rating || !reviewData.review_text.trim()) {
      return showToast('الرجاء إدخال التقييم والتعليق', 'error');
    }
    setSubmittingReview(true);
    try {
      await API.post('/student/reviews', {
        course_id: courseId,
        rating: reviewData.rating,
        review_text: reviewData.review_text
      });
      showToast('تم إرسال تقييمك بنجاح، شكراً لك! 🌟', 'success');
      setIsReviewModalOpen(false);
    } catch (err) {
      showToast(err.response?.data?.message || err.message || 'خطأ في إرسال التقييم', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  const toggleModule = (modId) => {
    setOpenModuleIds(prev => prev.includes(modId) ? prev.filter(id => id !== modId) : [...prev, modId]);
  };

  // شاشة التحميل الهيكلي (Skeleton Loading)
  if (loading) {
    return (
      <div className="min-h-screen pb-20 pt-6 px-4 sm:px-6 lg:px-12 max-w-container-max mx-auto space-y-8 mt-24" dir="rtl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-6">
            <div className="h-[420px] rounded-3xl bg-surface-container-low/50 border border-outline-variant/30 animate-pulse" />
            <div className="h-32 rounded-3xl bg-surface-container-low/50 border border-outline-variant/30 animate-pulse" />
          </div>
          <div className="lg:col-span-4 h-[550px] rounded-3xl bg-surface-container-low/50 border border-outline-variant/30 animate-pulse" />
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4" dir="rtl">
        <div className="max-w-md w-full rounded-3xl bg-surface-container-low/60 border border-outline-variant/40 p-8 text-center backdrop-blur-xl space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-error/10 text-error mx-auto flex items-center justify-center">
            <BookOpen size={32} />
          </div>
          <h2 className="text-xl font-extrabold text-on-surface">عذراً، تعذر تحميل المحتوى</h2>
          <p className="text-xs text-on-surface-variant">قد تكون الدورة غير متاحة أو تم تغيير الرابط.</p>
          <Link to="/courses" className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary font-bold text-xs rounded-2xl shadow-glow">
            <ArrowRight size={16} />
            <span>العودة للدورات</span>
          </Link>
        </div>
      </div>
    );
  }

  const isCompleted = completedLessons.includes(currentLesson?.id);

  const getIframeSrc = () => {
    if (!currentLesson || !currentLesson.video_url) return '';
    let src = currentLesson.video_url.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/');
    if (src.includes('iframe.mediadelivery.net')) {
       const lp = lessonProgresses[currentLesson.id];
       if (lp && lp.progress_seconds > 0) {
         const sep = src.includes('?') ? '&' : '?';
         src += `${sep}t=${lp.progress_seconds}`;
       }
    }
    return src;
  };

  return (
    <div className="min-h-screen pb-20 pt-6 px-4 sm:px-6 lg:px-12 max-w-container-max mx-auto space-y-8 relative" dir="rtl">
      {/* التنبيه العائم */}
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* الشريط العلوي للملاحة والتصفح */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-surface-container-low/60 border border-outline-variant/40 rounded-2xl p-4 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <Link 
            to={`/dashboard`} 
            className="p-2 rounded-xl bg-surface border border-outline-variant/40 text-on-surface-variant hover:text-primary transition-colors"
            title="العودة لصفحة الدورة"
          >
            <ArrowRight size={18} />
          </Link>
          <div>
            <span className="text-[11px] font-bold text-primary block">{course.title}</span>
            <h1 className="text-sm sm:text-base font-extrabold text-on-surface">
              {currentLesson ? currentLesson.title : 'معاينة الدرس'}
            </h1>
          </div>
        </div>

        {isCompleted && (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
            <Check size={14} />
            <span>تم الإكمال</span>
          </span>
        )}
      </div>

      {/* المحتوى الرئيسي والفهرس */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* منطقة الفيديو والمحتوى النصي (Left/Main Column) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* مشغل الفيديو (Video Player Container) */}
          <div className="relative rounded-3xl bg-black border border-outline-variant/50 overflow-hidden shadow-2xl aspect-video flex items-center justify-center group">
            {currentLesson && currentLesson.video_url ? (
              currentLesson.video_url.includes('iframe.mediadelivery.net') || currentLesson.video_url.includes('youtube.com') || currentLesson.video_url.includes('youtu.be') ? (
                <iframe
                  src={getIframeSrc()}
                  loading="lazy"
                  className="border-0 absolute top-0 h-full w-full"
                  allow="accelerometer;gyroscope;autoplay;encrypted-media;picture-in-picture;"
                  allowFullScreen
                ></iframe>
              ) : (
                <video 
                  src={currentLesson.video_url.startsWith('http') ? currentLesson.video_url : `http://localhost:5000/uploads/${currentLesson.video_url}`} 
                  controls 
                  controlsList="nodownload"
                  className="w-full h-full object-contain"
                />
              )
            ) : (
              <div className="text-center p-8 space-y-3">
                <div className="w-16 h-16 rounded-full bg-primary/20 text-primary mx-auto flex items-center justify-center border border-primary/30">
                  <Play size={32} className="mr-0.5" />
                </div>
                <h3 className="text-base font-bold text-on-surface">عرض الدرس والتطبيقات النصية</h3>
                <p className="text-xs text-on-surface-variant max-w-sm">
                  هذا الدرس يعتمد على الشرح النصي والتمارين البرمجية المدرجة أدناه.
                </p>
              </div>
            )}
          </div>

          {/* تفاصيل الدرس والشرح النصي */}
          <div className="rounded-3xl bg-surface-container-low/60 border border-outline-variant/40 p-6 sm:p-8 backdrop-blur-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant/30 pb-5">
              <div className="space-y-1">
                <h2 className="text-lg sm:text-xl font-extrabold text-on-surface">
                  {currentLesson ? currentLesson.title : 'عنوان الدرس'}
                </h2>
                <p className="text-xs text-on-surface-variant flex items-center gap-1.5">
                  <FileText size={14} className="text-primary" />
                  <span>تفاصيل وملاحظات الدرس</span>
                </p>
              </div>

              <button 
                onClick={handleMarkComplete}
                disabled={completing || isCompleted}
                className={`px-5 py-2.5 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  isCompleted 
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 cursor-default'
                    : 'bg-primary text-on-primary hover:bg-primary-hover shadow-glow disabled:opacity-60'
                }`}
              >
                {completing ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <>
                    <CheckCircle size={16} />
                    <span>{isCompleted ? 'تم الإكمال بنجاح' : 'تعليم كـ مكتمل'}</span>
                  </>
                )}
              </button>
            </div>

            <div className="flex gap-4">
               <button 
                  onClick={() => setIsReviewModalOpen(true)}
                  className="px-5 py-2 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer bg-surface border border-outline-variant/60 text-on-surface hover:bg-surface-container"
               >
                 <Star size={16} className="text-yellow-400" />
                 <span>تقييم الكورس</span>
               </button>
            </div>

            <div className="text-xs sm:text-sm text-on-surface-variant leading-relaxed space-y-4">
              {currentLesson && currentLesson.content ? (
                <div className="prose prose-invert max-w-none">
                  {currentLesson.content}
                </div>
              ) : (
                <p className="text-on-surface-variant/70 italic">لا يوجد محتوى نصي إضافي مرفق مع هذا الدرس.</p>
              )}
            </div>
          </div>
        </div>

        {/* القائمة الجانبية: فهرس دروس الدورة (Sidebar Accordion) */}
        <div className="lg:col-span-4 sticky top-24 space-y-4">
          <div className="rounded-3xl bg-surface-container-low/70 border border-outline-variant/40 p-5 backdrop-blur-xl space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-outline-variant/30 pb-3">
              <h3 className="text-sm font-extrabold text-on-surface flex items-center gap-2">
                <BookOpen size={18} className="text-primary" />
                <span>فهرس دروس الكورس</span>
              </h3>
              <span className="text-[11px] font-bold text-on-surface-variant bg-surface px-2.5 py-1 rounded-lg border border-outline-variant/30">
                {course.modules?.length || 0} موديولات
              </span>
            </div>

            <div className="space-y-3 max-h-[calc(100vh-220px)] overflow-y-auto pr-1">
              {course.modules && course.modules.filter(m => !m.submodule_id).map((mod, idx) => (
                <PlayerModuleNode 
                  key={mod.id}
                  module={mod}
                  allModules={course.modules}
                  idx={idx}
                  level={0}
                  openModuleIds={openModuleIds}
                  toggleModule={toggleModule}
                  currentLesson={currentLesson}
                  completedLessons={completedLessons}
                  courseId={course.id}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* نافذة التقييم (Review Modal) */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-surface border border-outline-variant/30 rounded-3xl p-6 w-full max-w-md shadow-2xl relative">
            <h3 className="text-xl font-extrabold text-on-surface mb-4">تقييم الكورس</h3>
            <p className="text-xs text-on-surface-variant mb-6">رأيك يهمنا ويساعد الآخرين على اتخاذ القرار الصحيح.</p>
            
            <form onSubmit={submitReview} className="space-y-4">
              <div className="flex items-center justify-center gap-2 mb-6">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setReviewData(prev => ({ ...prev, rating: star }))}
                    className="focus:outline-none transition-transform hover:scale-110"
                  >
                    <Star
                      size={32}
                      className={star <= reviewData.rating ? 'fill-yellow-400 text-yellow-400' : 'text-outline-variant'}
                    />
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface mb-2">تعليقك (اختياري)</label>
                <textarea 
                  value={reviewData.review_text}
                  onChange={(e) => setReviewData(prev => ({ ...prev, review_text: e.target.value }))}
                  rows={4}
                  className="w-full bg-surface-container-low border border-outline-variant/50 rounded-2xl p-3 text-sm text-on-surface focus:outline-none focus:border-primary resize-none"
                  placeholder="اكتب تعليقك هنا..."
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant/30">
                <button
                  type="button"
                  onClick={() => setIsReviewModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-on-surface hover:bg-surface-container-low transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="px-6 py-2 rounded-xl text-xs font-bold bg-primary text-on-primary hover:bg-primary-hover shadow-glow flex items-center gap-2 disabled:opacity-50"
                >
                  {submittingReview ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                  <span>إرسال التقييم</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}