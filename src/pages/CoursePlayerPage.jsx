import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
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
  Check,
  Star
} from 'lucide-react';
import { getFileUrl } from '../utils/fileHelper';

// ─── Sidebar Module/Lesson Tree ──────────────────────────────────────────────
const PlayerModuleNode = ({ 
  module, allModules, idx, level = 0, 
  openModuleIds, toggleModule, 
  currentLesson, completedLessons, 
  courseId, onSelectLesson
}) => {
  const isOpen = openModuleIds.includes(module.id);
  const subModules = allModules.filter(m => m.submodule_id === module.id);

  return (
    <div className={`border border-outline-variant/30 rounded-2xl overflow-hidden bg-surface/40 transition-all ${level > 0 ? 'mt-2 border-r-2 border-r-primary/50' : ''}`}>
      <button 
        onClick={() => toggleModule(module.id)}
        className={`w-full p-3 flex items-center justify-between text-right cursor-pointer hover:bg-surface/80 transition-colors ${level > 0 ? 'bg-surface-container-low/30' : ''}`}
      >
        <div className="space-y-0.5">
          <span className="text-[10px] font-bold text-primary block">
            {level === 0 ? `موديول ${idx + 1}` : 'قسم فرعي'}
          </span>
          <h4 className="text-xs font-bold text-on-surface line-clamp-1">{module.name}</h4>
        </div>
        <ChevronDown 
          size={16} 
          className={`text-on-surface-variant transition-transform duration-300 shrink-0 ${isOpen ? 'rotate-180 text-primary' : ''}`} 
        />
      </button>

      {isOpen && (
        <div className="p-2 border-t border-outline-variant/30 space-y-1 bg-surface-container-low/20">
          {module.lessons && module.lessons.map((lesson) => {
            const isActive = currentLesson && lesson.id === currentLesson.id;
            const lessonCompleted = completedLessons.includes(lesson.id);

            return (
              <div
                key={lesson.id}
                className={`flex items-center gap-2 p-2.5 rounded-xl text-xs transition-all ${
                  isActive 
                    ? 'bg-primary/15 text-primary font-bold border border-primary/30 shadow-sm' 
                    : 'text-on-surface-variant hover:bg-surface hover:text-on-surface border border-transparent'
                }`}
              >
                {/* ✅ مؤشر الإكمال — يُحدَّث تلقائياً من النظام */}
                <div
                  className="shrink-0"
                  title={lessonCompleted ? 'تم الإكمال تلقائياً' : 'لم تتم المشاهدة بعد'}
                >
                  <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${
                    lessonCompleted 
                      ? 'bg-emerald-500 border-emerald-500' 
                      : 'border-outline-variant/40 bg-transparent'
                  }`}>
                    {lessonCompleted && <Check size={10} className="text-white" strokeWidth={3} />}
                  </div>
                </div>

                {/* زر الدرس (SPA — بدون Link) */}
                <button
                  className="flex items-center gap-2 overflow-hidden flex-1 text-right"
                  onClick={() => onSelectLesson(lesson, module.id)}
                >
                  <Play 
                    size={13} 
                    className={`shrink-0 ${isActive ? 'text-primary' : 'text-on-surface-variant/60'}`} 
                  />
                  <span className="truncate">{lesson.title}</span>
                </button>

                {lesson.is_free && !isActive && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                    مجاني
                  </span>
                )}
              </div>
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
                  onSelectLesson={onSelectLesson}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function CoursePlayerPage() {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [completedLessons, setCompletedLessons] = useState([]);
  const [openModuleIds, setOpenModuleIds] = useState([]);
  const [toast, setToast] = useState(null);
  const [lessonProgresses, setLessonProgresses] = useState({});

  const currentPlaybackTimeRef = useRef(0);
  const isPlayingRef = useRef(false);
  const iframeRef = useRef(null);
  const videoRef = useRef(null);
  const handleVideoEndedRef = useRef(null);

  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewData, setReviewData] = useState({ rating: 5, review_text: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  // جلب البيانات — يعتمد على courseId فقط
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const cRes = await API.get(`/student/courses/${courseId}/play`);
        const cData = cRes.data.course;
        setCourse(cData);

        if (cRes.data.moduleProgress) {
          let completed = [];
          cRes.data.moduleProgress.forEach(mp => {
            if (mp.completed_lessons) completed = [...completed, ...mp.completed_lessons];
          });
          setCompletedLessons(completed);
        }

        const lpMap = {};
        if (cRes.data.lessonProgress) {
          cRes.data.lessonProgress.forEach(lp => { lpMap[lp.lesson_id] = lp; });
          setLessonProgresses(lpMap);
        }

        if (cData?.modules?.length > 0) {
          let found = null;
          let openMod = null;

          // أولاً: الدرس المحدد في الـ URL
          if (lessonId) {
            for (const m of cData.modules) {
              found = m.lessons?.find(l => l.id === parseInt(lessonId));
              if (found) { openMod = m.id; break; }
            }
          }

          // ثانياً: آخر فيديو تمت مشاهدته
          if (!found) {
            let maxProgress = 0;
            for (const m of cData.modules) {
              for (const l of (m.lessons || [])) {
                const lp = lpMap[l.id];
                if (lp && lp.progress_seconds > maxProgress) {
                  maxProgress = lp.progress_seconds;
                  found = l;
                  openMod = m.id;
                }
              }
            }
          }

          // ثالثاً: أول درس احتياطياً
          if (!found) {
            found = cData.modules[0]?.lessons?.[0];
            openMod = cData.modules[0]?.id;
          }

          if (found) {
            setCurrentLesson(found);
            setOpenModuleIds([openMod]);
            navigate(`/learn/${courseId}/lesson/${found.id}`, { replace: true });
          }
        }
      } catch (err) {
        console.error('Error fetching player data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [courseId]); // courseId فقط — لا reload عند تغيير الدرس

  // الانتقال بين الدروس بدون reload
  const handleSelectLesson = useCallback((lesson, modId) => {
    currentPlaybackTimeRef.current = 0;
    isPlayingRef.current = false;
    setCurrentLesson(lesson);
    if (modId) {
      setOpenModuleIds(prev => prev.includes(modId) ? prev : [...prev, modId]);
    }
    navigate(`/learn/${courseId}/lesson/${lesson.id}`, { replace: true });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [courseId, navigate]);


  // Spacebar — إيقاف/تشغيل الفيديو
  useEffect(() => {
    const handleKeyDown = (e) => {
      const tag = document.activeElement?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();

        if (videoRef.current) {
          if (videoRef.current.paused) videoRef.current.play();
          else videoRef.current.pause();
          return;
        }

        if (iframeRef.current?.contentWindow) {
          const command = isPlayingRef.current ? 'pause' : 'play';
          iframeRef.current.contentWindow.postMessage(
            JSON.stringify({ call: command }),
            'https://iframe.mediadelivery.net'
          );
          isPlayingRef.current = !isPlayingRef.current;
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Video Ended — إكمال تلقائي والانتقال للتالي
  const handleVideoEnded = useCallback(async () => {
    if (!currentLesson) return;

    if (!completedLessons.includes(currentLesson.id)) {
      try {
        await API.post('/content/complete-lesson', {
          lesson_id: currentLesson.id,
          course_id: courseId,
          module_id: currentLesson.module_id
        });
        setCompletedLessons(prev => [...prev, currentLesson.id]);
      } catch (err) {
        console.error('auto-complete error:', err);
      }
    }

    if (!course?.modules) return;
    const flatLessons = [];
    const processModule = (mod) => {
      if (mod.lessons) flatLessons.push(...mod.lessons);
      course.modules.filter(m => m.submodule_id === mod.id).forEach(processModule);
    };
    course.modules.filter(m => !m.submodule_id).forEach(processModule);

    const currentIndex = flatLessons.findIndex(l => l.id === currentLesson.id);
    if (currentIndex !== -1 && currentIndex < flatLessons.length - 1) {
      const nextLesson = flatLessons[currentIndex + 1];
      setToast({ message: 'جاري الانتقال للدرس التالي... ⏩', type: 'success' });
      setTimeout(() => handleSelectLesson(nextLesson, null), 1500);
    } else if (currentIndex === flatLessons.length - 1) {
      setToast({ message: 'مبروك! لقد أكملت جميع دروس الكورس! 🎉', type: 'success' });
    }
  }, [currentLesson, completedLessons, course, courseId, handleSelectLesson]);

  useEffect(() => { handleVideoEndedRef.current = handleVideoEnded; }, [handleVideoEnded]);

  // Bunny postMessage listener
  useEffect(() => {
    const handleMessage = (e) => {
      if (e.origin !== 'https://iframe.mediadelivery.net') return;
      try {
        const data = JSON.parse(e.data);
        const { event, value } = data;
        if (event === 'timeupdate') {
          currentPlaybackTimeRef.current = typeof value === 'number' ? value : 0;
        } else if (event === 'play') {
          isPlayingRef.current = true;
        } else if (event === 'pause') {
          isPlayingRef.current = false;
        } else if (event === 'ended') {
          isPlayingRef.current = false;
          handleVideoEndedRef.current?.();
        }
      } catch { /* ignore */ }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // حفظ التقدم كل 5 ثوانٍ
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

  // الإكمال التلقائي للدروس النصية
  useEffect(() => {
    if (currentLesson && !currentLesson.video_url && !completedLessons.includes(currentLesson.id)) {
      const timer = setTimeout(() => handleVideoEndedRef.current?.(), 5000);
      return () => clearTimeout(timer);
    }
  }, [currentLesson, completedLessons]);

  const showToast = (message, type = 'success') => setToast({ message, type });

  const handleMarkComplete = async () => {
    if (!currentLesson) return;
    setCompleting(true);
    try {
      await API.post('/content/complete-lesson', {
        lesson_id: currentLesson.id,
        course_id: courseId,
        module_id: currentLesson.module_id
      });
      setCompletedLessons(prev => [...prev, currentLesson.id]);
      showToast('تم إكمال الدرس وزيادة نسبة تقدمك بنجاح! 🎉', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'حدث خطأ في التسجيل', 'error');
    } finally {
      setCompleting(false);
    }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!reviewData.rating || !reviewData.review_text.trim()) return showToast('الرجاء إدخال التقييم والتعليق', 'error');
    setSubmittingReview(true);
    try {
      await API.post('/student/reviews', { course_id: courseId, rating: reviewData.rating, review_text: reviewData.review_text });
      showToast('تم إرسال تقييمك بنجاح، شكراً لك! 🌟', 'success');
      setIsReviewModalOpen(false);
    } catch (err) {
      showToast(err.response?.data?.message || 'خطأ في إرسال التقييم', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  const toggleModule = (modId) => {
    setOpenModuleIds(prev => prev.includes(modId) ? prev.filter(id => id !== modId) : [...prev, modId]);
  };

  const getIframeSrc = () => {
    if (!currentLesson?.video_url) return '';
    let src = currentLesson.video_url
      .replace('watch?v=', 'embed/')
      .replace('youtu.be/', 'youtube.com/embed/');
    const sep = src.includes('?') ? '&' : '?';
    src += `${sep}autoplay=true`;
    if (src.includes('iframe.mediadelivery.net')) {
      const lp = lessonProgresses[currentLesson.id];
      if (lp && lp.progress_seconds > 10) {
        src += `&t=${Math.floor(lp.progress_seconds)}`;
      }
    }
    return src;
  };

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
            <ArrowRight size={16} /><span>العودة للدورات</span>
          </Link>
        </div>
      </div>
    );
  }

  const isCompleted = completedLessons.includes(currentLesson?.id);

  return (
    <div className="min-h-screen pb-20 pt-6 px-4 sm:px-6 lg:px-12 max-w-container-max mx-auto space-y-8 relative" dir="rtl">
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* الشريط العلوي */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-surface-container-low/60 border border-outline-variant/40 rounded-2xl p-4 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <Link to="/dashboard" className="p-2 rounded-xl bg-surface border border-outline-variant/40 text-on-surface-variant hover:text-primary transition-colors" title="العودة">
            <ArrowRight size={18} />
          </Link>
          <div>
            <span className="text-[11px] font-bold text-primary block">{course.title}</span>
            <h1 className="text-sm sm:text-base font-extrabold text-on-surface">
              {currentLesson ? currentLesson.title : 'معاينة الدرس'}
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {isCompleted && (
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
              <Check size={14} /><span>تم الإكمال</span>
            </span>
          )}
          <span className="text-[10px] text-on-surface-variant/50 bg-surface/60 px-2.5 py-1 rounded-xl border border-outline-variant/20 hidden sm:block">
            ⌨️ Space = إيقاف/تشغيل
          </span>
        </div>
      </div>

      {/* الشبكة الرئيسية */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* عمود الفيديو */}
        <div className="lg:col-span-8 space-y-6">

          {/* مشغل الفيديو */}
          <div className="relative rounded-3xl bg-black border border-outline-variant/50 overflow-hidden shadow-2xl aspect-video flex items-center justify-center">
            {currentLesson?.video_url ? (
              currentLesson.video_url.includes('iframe.mediadelivery.net') || 
              currentLesson.video_url.includes('youtube.com') || 
              currentLesson.video_url.includes('youtu.be') ? (
                <iframe
                  key={currentLesson.id}
                  ref={iframeRef}
                  src={getIframeSrc()}
                  loading="lazy"
                  className="border-0 absolute top-0 h-full w-full"
                  allow="accelerometer;gyroscope;autoplay;encrypted-media;picture-in-picture;"
                  allowFullScreen
                />
              ) : (
                <video 
                  key={currentLesson.id}
                  ref={videoRef}
                  src={getFileUrl(currentLesson.video_url)}
                  controls 
                  controlsList="nodownload"
                  className="w-full h-full object-contain"
                  autoPlay
                  onLoadedMetadata={() => {
                    const lp = lessonProgresses[currentLesson.id];
                    if (lp && lp.progress_seconds > 10 && videoRef.current) {
                      videoRef.current.currentTime = lp.progress_seconds;
                    }
                  }}
                  onPlay={() => { isPlayingRef.current = true; }}
                  onPause={() => { isPlayingRef.current = false; }}
                  onEnded={() => handleVideoEndedRef.current?.()}
                />
              )
            ) : (
              <div className="text-center p-8 space-y-3">
                <div className="w-16 h-16 rounded-full bg-primary/20 text-primary mx-auto flex items-center justify-center border border-primary/30">
                  <Play size={32} className="mr-0.5" />
                </div>
                <h3 className="text-base font-bold text-on-surface">عرض الدرس والتطبيقات النصية</h3>
                <p className="text-xs text-on-surface-variant max-w-sm">هذا الدرس يعتمد على الشرح النصي والتمارين البرمجية المدرجة أدناه.</p>
              </div>
            )}
          </div>

          {/* تفاصيل الدرس */}
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
              <div className={`px-5 py-2.5 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-default ${
                isCompleted 
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-surface border border-outline-variant/30 text-on-surface-variant'
              }`}>
                {completing ? <Loader2 size={16} className="animate-spin" /> : (
                  <><CheckCircle size={16} /><span>{isCompleted ? 'مكتمل' : 'قيد المشاهدة...'}</span></>
                )}
              </div>
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
              {currentLesson?.content ? (
                <div className="prose prose-invert max-w-none">{currentLesson.content}</div>
              ) : (
                <p className="text-on-surface-variant/70 italic">لا يوجد محتوى نصي إضافي مرفق مع هذا الدرس.</p>
              )}

              {currentLesson?.attachments && (() => {
                let atts = currentLesson.attachments;
                if (typeof atts === 'string') {
                  try { atts = JSON.parse(atts); } catch (e) { atts = []; }
                }
                if (!Array.isArray(atts)) atts = [];
                
                if (atts.length === 0) return null;

                return (
                  <div className="pt-6 border-t border-outline-variant/30 mt-6 space-y-4">
                    <h3 className="text-sm font-bold text-on-surface flex items-center gap-2">
                      <FileText size={16} className="text-primary" />
                      <span>ملفات ومرفقات الدرس</span>
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {atts.map((file, idx) => {
                        const fileUrl = typeof file === 'string' ? file : file.url;
                        const fileName = typeof file === 'string' ? 'ملف مرفق' : (file.name || 'ملف مرفق');
                        const fileSize = typeof file === 'object' && file.size ? file.size : null;
                        const fullUrl = getFileUrl(fileUrl);
                        
                        return (
                          <button
                            key={idx}
                            onClick={() => navigate('/secure-viewer', { state: { fileUrl: fullUrl, fileName: fileName } })}
                            className="flex items-center gap-3 p-3 rounded-xl bg-surface border border-outline-variant/40 hover:bg-surface-container-low transition-colors group w-full text-right"
                          >
                            <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                              <FileText size={18} />
                            </div>
                            <div className="flex-1 overflow-hidden">
                              <p className="text-xs font-bold text-on-surface truncate">{fileName}</p>
                              {fileSize && <p className="text-[10px] text-on-surface-variant mt-0.5">{fileSize}</p>}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>

        {/* الشريط الجانبي */}
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
              {course.modules?.filter(m => !m.submodule_id).map((mod, idx) => (
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
                  onSelectLesson={handleSelectLesson}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* نافذة التقييم */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-surface border border-outline-variant/30 rounded-3xl p-6 w-full max-w-md shadow-2xl relative">
            <h3 className="text-xl font-extrabold text-on-surface mb-4">تقييم الكورس</h3>
            <p className="text-xs text-on-surface-variant mb-6">رأيك يهمنا ويساعد الآخرين على اتخاذ القرار الصحيح.</p>
            <form onSubmit={submitReview} className="space-y-4">
              <div className="flex items-center justify-center gap-2 mb-6">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button type="button" key={star} onClick={() => setReviewData(prev => ({ ...prev, rating: star }))} className="focus:outline-none transition-transform hover:scale-110">
                    <Star size={32} className={star <= reviewData.rating ? 'fill-yellow-400 text-yellow-400' : 'text-outline-variant'} />
                  </button>
                ))}
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface mb-2">تعليقك (اختياري)</label>
                <textarea 
                  value={reviewData.review_text}
                  onChange={e => setReviewData(prev => ({ ...prev, review_text: e.target.value }))}
                  rows={4}
                  className="w-full bg-surface-container-low border border-outline-variant/50 rounded-2xl p-3 text-sm text-on-surface focus:outline-none focus:border-primary resize-none"
                  placeholder="اكتب تعليقك هنا..."
                />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant/30">
                <button type="button" onClick={() => setIsReviewModalOpen(false)} className="px-4 py-2 rounded-xl text-xs font-bold text-on-surface hover:bg-surface-container-low transition-colors">
                  إلغاء
                </button>
                <button type="submit" disabled={submittingReview} className="px-6 py-2 rounded-xl text-xs font-bold bg-primary text-on-primary hover:bg-primary-hover shadow-glow flex items-center gap-2 disabled:opacity-50">
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
