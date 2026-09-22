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
  Star,
  ChevronRight,
  ChevronLeft,
  Download
} from 'lucide-react';
import { getFileUrl } from '../utils/fileHelper';

// --- Helper Functions ---
const formatDuration = (seconds) => {
  if (!seconds) return '00:00';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

// ─── Sidebar Module/Lesson Tree ──────────────────────────────────────────────
const PlayerModuleNode = ({ 
  module, allModules, idx, level = 0, 
  openModuleIds, toggleModule, 
  currentLesson, completedLessons, 
  courseId, onSelectLesson, onToggleComplete
}) => {
  const isOpen = openModuleIds.includes(module.id);
  const subModules = allModules.filter(m => m.submodule_id === module.id);

  const calculateDuration = (mod) => {
    let dur = 0;
    if (mod.lessons) dur += mod.lessons.reduce((acc, l) => acc + (l.duration_seconds || 0), 0);
    const subs = allModules.filter(m => m.submodule_id === mod.id);
    dur += subs.reduce((acc, s) => acc + calculateDuration(s), 0);
    return dur;
  };

  const duration = calculateDuration(module);

  return (
    <div className={`transition-all duration-300 ${
      level === 0 
        ? 'border border-outline-variant/40 rounded-3xl bg-surface hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5' 
        : 'mt-3 border-r-4 border-primary/30 bg-surface-container-low/50 rounded-2xl overflow-hidden'
    }`}>
      <button 
        onClick={() => toggleModule(module.id)}
        className={`w-full flex items-center justify-between text-right cursor-pointer transition-colors ${
          level === 0 ? 'p-5 sm:p-6 hover:bg-surface-container/30' : 'p-4 hover:bg-surface/80'
        }`}
      >
        <div className="flex-1 ml-4">
          <div className="flex items-center gap-3 mb-1.5">
            <span className={`font-bold ${level === 0 ? 'text-xs text-primary bg-primary/10 px-3 py-1 rounded-xl' : 'text-[10px] text-primary bg-primary/5 px-2 py-0.5 rounded-lg'}`}>
              {level === 0 ? `موديول ${idx + 1}` : 'قسم فرعي'}
            </span>
            {duration > 0 && (
              <span className="text-[10px] text-on-surface-variant font-bold bg-surface-container px-2.5 py-1 rounded-xl flex items-center gap-1">
                ⏱ {formatDuration(duration)}
              </span>
            )}
          </div>
          <h4 className={`${level === 0 ? 'text-base sm:text-lg' : 'text-sm'} font-extrabold text-on-surface`}>{module.name}</h4>
        </div>
        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 shrink-0 ${isOpen ? 'bg-primary text-white shadow-lg shadow-primary/20 rotate-180' : 'bg-surface-container text-on-surface-variant'}`}>
          <ChevronDown size={20} className="transition-transform duration-300" />
        </div>
      </button>

      {isOpen && (
        <div className={`border-t border-outline-variant/20 ${level === 0 ? 'p-5 bg-surface-container-low/30' : 'p-3'}`}>
          {module.lessons && module.lessons.map((lesson) => {
            const isActive = currentLesson && lesson.id === currentLesson.id;
            const lessonCompleted = completedLessons.includes(lesson.id);

            return (
              <div
                key={lesson.id}
                className={`group flex items-center gap-3 p-3 mb-2 last:mb-0 rounded-2xl text-sm transition-all ${
                  isActive 
                    ? 'bg-primary/10 border border-primary/30 shadow-sm relative overflow-hidden' 
                    : 'bg-surface border border-outline-variant/30 hover:border-primary/40 hover:shadow-md cursor-pointer'
                }`}
              >
                {isActive && <div className="absolute top-0 right-0 w-1.5 h-full bg-primary rounded-r-full" />}
                
                {/* Manual Completion Checkbox */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if(onToggleComplete) onToggleComplete(lesson);
                  }}
                  className={`shrink-0 cursor-pointer p-1 z-10 mr-1 ${isActive ? 'mr-3' : ''}`}
                  title={lessonCompleted ? 'تم الإكمال' : 'تحديد كمكتمل'}
                >
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                    lessonCompleted 
                      ? 'bg-emerald-500 border-emerald-500' 
                      : 'border-outline-variant/40 bg-transparent group-hover:border-primary/50 hover:bg-primary/5'
                  }`}>
                    {lessonCompleted && <Check size={14} className="text-white" strokeWidth={3} />}
                  </div>
                </button>

                {/* زر الدرس */}
                <button
                  className="flex items-center gap-3 overflow-hidden flex-1 text-right z-10"
                  onClick={() => onSelectLesson(lesson, module.id)}
                >
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-colors ${isActive ? 'bg-primary text-white shadow-md shadow-primary/20' : 'bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white'}`}>
                     <Play size={16} className="ml-0.5" />
                  </div>
                  <div className="flex flex-col flex-1 truncate">
                    <span className={`truncate font-bold ${isActive ? 'text-primary' : 'text-on-surface group-hover:text-primary transition-colors'}`}>{lesson.title}</span>
                    {lesson.duration_seconds > 0 && (
                      <span className="text-[11px] text-on-surface-variant font-medium mt-0.5">
                          {formatDuration(lesson.duration_seconds)}
                      </span>
                    )}
                  </div>
                </button>

                {lesson.is_free && !isActive && (
                  <span className="text-[10px] px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-500 font-bold border border-emerald-500/20 shrink-0 z-10">
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
                  onToggleComplete={onToggleComplete}
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

  const [myCourseReview, setMyCourseReview] = useState(null);
  const [myLessonReviews, setMyLessonReviews] = useState([]);
  const [lessonReviewData, setLessonReviewData] = useState({ rating: 0, review_text: '' });
  const [submittingLessonReview, setSubmittingLessonReview] = useState(false);

  // تحديث تقييم الدرس عند تغيير الدرس الحالي
  useEffect(() => {
    if (currentLesson) {
      const existing = myLessonReviews.find(r => r.lesson_id === currentLesson.id);
      if (existing) {
        setLessonReviewData({ rating: existing.rating, review_text: existing.review_text || '' });
      } else {
        setLessonReviewData({ rating: 0, review_text: '' });
      }
    }
  }, [currentLesson, myLessonReviews]);

  // جلب البيانات — يعتمد على courseId فقط
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const cRes = await API.get(`/student/courses/${courseId}/play`);
        const cData = cRes.data.course;

        // Sort modules and lessons by order
        if (cData && cData.modules) {
          cData.modules.sort((a, b) => (a.order || 0) - (b.order || 0));
          cData.modules.forEach(m => {
             if (m.lessons) {
                m.lessons.sort((a, b) => (a.order || 0) - (b.order || 0));
             }
          });
        }

        setCourse(cData);

        let completed = [];
        if (cRes.data.moduleProgress) {
          cRes.data.moduleProgress.forEach(mp => {
            if (mp.completed_lessons) {
              let parsed = mp.completed_lessons;
              if (typeof parsed === 'string') {
                try { parsed = JSON.parse(parsed); } catch (e) { parsed = []; }
              }
              if (Array.isArray(parsed)) {
                completed = [...completed, ...parsed.map(Number)];
              }
            }
          });
        }

        const lpMap = {};
        if (cRes.data.lessonProgress) {
          cRes.data.lessonProgress.forEach(lp => { 
            lpMap[lp.lesson_id] = lp; 
            if (lp.is_completed && !completed.includes(lp.lesson_id)) {
              completed.push(lp.lesson_id);
            }
          });
          setLessonProgresses(lpMap);
        }
        setCompletedLessons(completed);

        if (cRes.data.myCourseReview) {
          setMyCourseReview(cRes.data.myCourseReview);
          setReviewData({ rating: cRes.data.myCourseReview.rating, review_text: cRes.data.myCourseReview.review_text || '' });
        }
        if (cRes.data.myLessonReviews) {
          setMyLessonReviews(cRes.data.myLessonReviews);
        }

        if (cData?.modules?.length > 0) {
          let found = null;
          let openMod = null;

          // إذا كان في رابط محدد بدرس، نبحث عنه
          if (lessonId) {
            for (const m of cData.modules) {
              found = m.lessons?.find(l => l.id === parseInt(lessonId));
              if (found) { openMod = m.id; break; }
            }
          }

          if (found) {
            setCurrentLesson(found);
            setOpenModuleIds(prev => prev.includes(openMod) ? prev : [...prev, openMod]);
          } else {
            // لا يوجد lessonId، أو درس غير موجود، نعرض صفحة الكورس (Course Content View)
            setCurrentLesson(null);
            // فتح أول موديول كإعداد افتراضي
            if (cData.modules[0]) {
               setOpenModuleIds([cData.modules[0].id]);
            }
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

  // الانتقال بين الدروس
  const handleSelectLesson = useCallback((lesson, modId) => {
    currentPlaybackTimeRef.current = 0;
    isPlayingRef.current = false;
    setCurrentLesson(lesson);
    if (modId) {
      setOpenModuleIds(prev => prev.includes(modId) ? prev : [...prev, modId]);
    }
    navigate(`/learn/${courseId}/lesson/${lesson.id}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [courseId, navigate]);

  const showToast = (message, type = 'success') => setToast({ message, type });

  const handleToggleComplete = async (lesson) => {
    const isCompleted = completedLessons.includes(lesson.id);
    if (!isCompleted) {
      setCompleting(true);
      try {
        await API.post('/content/complete-lesson', {
          lesson_id: lesson.id,
          course_id: courseId,
          module_id: lesson.module_id
        });
        setCompletedLessons(prev => [...prev, lesson.id]);
        showToast('تم تحديد الدرس كمكتمل', 'success');
      } catch (err) {
        showToast(err.response?.data?.message || 'حدث خطأ في التسجيل', 'error');
      } finally {
        setCompleting(false);
      }
    }
  };

  const getNextPrevLesson = () => {
    if (!course?.modules || !currentLesson) return { next: null, prev: null };
    const flatLessons = [];
    const processModule = (mod) => {
      if (mod.lessons) flatLessons.push(...mod.lessons);
      course.modules.filter(m => m.submodule_id === mod.id).forEach(processModule);
    };
    course.modules.filter(m => !m.submodule_id).forEach(processModule);

    const currentIndex = flatLessons.findIndex(l => l.id === currentLesson.id);
    let next = null;
    let prev = null;
    if (currentIndex > 0) prev = flatLessons[currentIndex - 1];
    if (currentIndex !== -1 && currentIndex < flatLessons.length - 1) next = flatLessons[currentIndex + 1];
    
    return { next, prev };
  };

  const { next: nextLesson, prev: prevLesson } = getNextPrevLesson();

  const handleSeek = useCallback((seconds) => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime + seconds);
    } else if (iframeRef.current?.contentWindow) {
      const newTime = Math.max(0, currentPlaybackTimeRef.current + seconds);
      // رسالة التقديم والتأخير لiframe باني بمواصفات player.js
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({ context: 'player.js', version: '0.1.0', method: 'setCurrentTime', value: newTime }),
        '*'
      );
      // محاولة أخرى بالصيغة المباشرة تحسباً
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({ method: 'setCurrentTime', value: newTime }),
        '*'
      );
      currentPlaybackTimeRef.current = newTime;
    }
  }, []);

  // استماع لرسائل المشغل
  useEffect(() => {
    const handleMessage = (e) => {
      try {
        const data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
        if (data.context === 'player.js') {
          if (data.event === 'timeupdate' && data.value) {
            currentPlaybackTimeRef.current = data.value.seconds !== undefined ? data.value.seconds : data.value;
          }
          if (data.event === 'play') isPlayingRef.current = true;
          if (data.event === 'pause') isPlayingRef.current = false;
        }
      } catch (err) {
        // Not JSON
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // لوحة المفاتيح
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
            JSON.stringify({ context: 'player.js', version: '0.1.0', method: command }),
            '*'
          );
          isPlayingRef.current = !isPlayingRef.current;
        }
      } else if (e.key === 'ArrowRight') {
         e.preventDefault();
         handleSeek(10);
      } else if (e.key === 'ArrowLeft') {
         e.preventDefault();
         handleSeek(-10);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSeek]);

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

    if (nextLesson) {
      setToast({ message: 'جاري الانتقال للدرس التالي... ⏩', type: 'success' });
      setTimeout(() => handleSelectLesson(nextLesson, nextLesson.module_id), 1500);
    } else {
      setToast({ message: 'مبروك! لقد أكملت جميع دروس الكورس! 🎉', type: 'success' });
    }
  }, [currentLesson, completedLessons, course, courseId, handleSelectLesson, nextLesson]);

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

  const submitLessonReview = async (e) => {
    if (e) e.preventDefault();
    if (!lessonReviewData.rating) return showToast('الرجاء إدخال التقييم', 'error');
    setSubmittingLessonReview(true);
    try {
      const res = await API.post('/student/lesson-reviews', { 
         course_id: courseId, 
         lesson_id: currentLesson.id, 
         rating: lessonReviewData.rating, 
         review_text: lessonReviewData.review_text 
      });
      showToast('تم إرسال تقييمك للدرس بنجاح! 🌟', 'success');
      setMyLessonReviews(prev => {
        const existing = prev.find(r => r.lesson_id === currentLesson.id);
        if (existing) return prev.map(r => r.lesson_id === currentLesson.id ? res.data.review : r);
        return [...prev, res.data.review];
      });
    } catch (err) {
      showToast(err.response?.data?.message || 'خطأ في إرسال التقييم', 'error');
    } finally {
      setSubmittingLessonReview(false);
    }
  };

  const handleDownloadFile = async (e, fileUrl, fileName) => {
    e.preventDefault();
    try {
      showToast('جاري تجهيز الملف للتنزيل...', 'success');
      const response = await fetch(fileUrl);
      if (!response.ok) throw new Error('Network response was not ok');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
      showToast('حدث خطأ أثناء تنزيل الملف، سيتم فتحه في نافذة جديدة', 'error');
      window.open(fileUrl, '_blank');
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

  // --- Course Content View (Modules Page) ---
  if (!lessonId) {
    return (
      <div className="min-h-screen pb-24 pt-28 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-10 relative" dir="rtl">
        <Toast toast={toast} onClose={() => setToast(null)} />
        
        {/* Header */}
        <div className="relative overflow-hidden bg-gradient-to-l from-primary/10 via-surface to-surface border border-outline-variant/40 rounded-[2rem] p-8 sm:p-10 shadow-2xl">
          {/* Decorative background elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <Link to={`/dashboard`} className="p-3.5 rounded-2xl bg-surface border border-outline-variant/50 text-on-surface-variant hover:text-primary hover:border-primary/50 hover:shadow-lg transition-all" title="العودة">
                <ArrowRight size={24} />
              </Link>
              <div>
                <span className="text-sm font-bold text-primary flex items-center gap-2 mb-2">
                  <BookOpen size={18} /> مسار التعلم
                </span>
                <h1 className="text-2xl sm:text-3xl font-black text-on-surface leading-tight">
                  {course.title}
                </h1>
              </div>
            </div>
          </div>
        </div>

        {/* Modules Tree */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
             <h3 className="text-xl sm:text-2xl font-extrabold text-on-surface flex items-center gap-3">
                <CheckCircle className="text-primary" size={28} /> محتوى الكورس
             </h3>
             <span className="text-sm font-bold text-on-surface-variant bg-surface-container-low px-4 py-1.5 rounded-xl border border-outline-variant/30 shadow-sm">
                {course.modules?.length || 0} موديولات
             </span>
          </div>
          
          <div className="space-y-5">
             {course.modules?.filter(m => !m.submodule_id).map((mod, idx) => (
                <PlayerModuleNode 
                  key={mod.id}
                  module={mod}
                  allModules={course.modules}
                  idx={idx}
                  level={0}
                  openModuleIds={openModuleIds}
                  toggleModule={toggleModule}
                  currentLesson={null}
                  completedLessons={completedLessons}
                  courseId={course.id}
                  onSelectLesson={handleSelectLesson}
                  onToggleComplete={handleToggleComplete}
                />
              ))}
          </div>
        </div>
      </div>
    );
  }

  // --- Lesson Player View ---
  const isCompleted = completedLessons.includes(currentLesson?.id);

  return (
    <div className="min-h-screen pb-20 pt-6 px-4 sm:px-6 lg:px-12 max-w-5xl mx-auto space-y-8 relative" dir="rtl">
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* الشريط العلوي */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-surface-container-low/60 border border-outline-variant/40 rounded-2xl p-4 backdrop-blur-xl mt-20 lg:mt-0">
        <div className="flex items-center gap-3">
          <Link to={`/learn/${courseId}`} className="p-2 rounded-xl bg-surface border border-outline-variant/40 text-on-surface-variant hover:text-primary transition-colors" title="العودة لفهرس الكورس">
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
            ⌨️ Space: تشغيل / أسهم يمين-يسار: تقديم وتأخير
          </span>
        </div>
      </div>

      {/* المحتوى الرئيسي للدرس */}
      <div className="space-y-6 w-full">

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

          {/* أزرار التحكم بالتقديم والتأخير */}
          {currentLesson?.video_url && (
            <div className="flex items-center justify-center gap-4 mt-4">
              <button
                  onClick={() => handleSeek(10)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-surface border border-outline-variant/40 text-on-surface hover:text-primary hover:border-primary/40 hover:bg-primary/5 transition-all font-bold text-xs sm:text-sm shadow-sm"
              >
                  <span>تقديم 10 ثواني</span>
                  <ChevronLeft size={18} />
              </button>
              <button
                  onClick={() => handleSeek(-10)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-surface border border-outline-variant/40 text-on-surface hover:text-primary hover:border-primary/40 hover:bg-primary/5 transition-all font-bold text-xs sm:text-sm shadow-sm"
              >
                  <ChevronRight size={18} />
                  <span>تأخير 10 ثواني</span>
              </button>
            </div>
          )}

          {/* أزرار التنقل */}
          <div className="flex items-center justify-between gap-4 mt-6">
             <button
                disabled={!nextLesson}
                onClick={() => handleSelectLesson(nextLesson, nextLesson.module_id)}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-primary text-on-primary font-bold text-sm shadow-glow disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-hover transition-colors"
             >
                <span>الدرس التالي</span>
                <ChevronLeft size={18} />
             </button>

             <button
                disabled={!prevLesson}
                onClick={() => handleSelectLesson(prevLesson, prevLesson.module_id)}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-surface border border-outline-variant/40 text-on-surface font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-surface-container transition-colors"
             >
                <ChevronRight size={18} />
                <span>الدرس السابق</span>
             </button>
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
              <button 
                  onClick={handleMarkComplete}
                  disabled={completing || isCompleted}
                  className={`px-5 py-2.5 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                isCompleted 
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 cursor-default'
                  : 'bg-surface border border-outline-variant/30 text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
              }`}>
                {completing ? <Loader2 size={16} className="animate-spin" /> : (
                  <><CheckCircle size={16} /><span>{isCompleted ? 'مكتمل' : 'تحديد كمكتمل'}</span></>
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
                          <a
                            key={idx}
                            href={fullUrl}
                            onClick={(e) => handleDownloadFile(e, fullUrl, fileName)}
                            className="flex items-center gap-3 p-3 rounded-xl bg-surface border border-outline-variant/40 hover:bg-surface-container-low hover:border-primary/40 transition-colors group w-full text-right cursor-pointer"
                            title="تنزيل الملف مباشرة"
                          >
                            <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors shrink-0">
                              <FileText size={18} />
                            </div>
                            <div className="flex-1 overflow-hidden">
                              <p className="text-xs font-bold text-on-surface truncate">{fileName}</p>
                              {fileSize && <p className="text-[10px] text-on-surface-variant mt-0.5">{fileSize}</p>}
                            </div>
                            <div className="p-2 text-on-surface-variant group-hover:text-primary transition-colors shrink-0">
                              <Download size={18} />
                            </div>
                          </a>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* تقييم الدرس */}
            <div className="pt-6 border-t border-outline-variant/30 mt-6 space-y-4">
              <h3 className="text-sm font-bold text-on-surface flex items-center gap-2">
                <Star size={16} className="text-primary" />
                <span>قيّم هذا الدرس</span>
              </h3>
              <div className="bg-surface border border-outline-variant/40 rounded-2xl p-4 space-y-4">
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button type="button" key={star} onClick={() => setLessonReviewData(prev => ({ ...prev, rating: star }))} className="focus:outline-none transition-transform hover:scale-110">
                      <Star size={24} className={star <= lessonReviewData.rating ? 'fill-yellow-400 text-yellow-400' : 'text-outline-variant'} />
                    </button>
                  ))}
                  <span className="text-xs text-on-surface-variant font-bold mr-3">{lessonReviewData.rating > 0 ? 'شكراً لتقييمك!' : 'ما رأيك في هذا الدرس؟'}</span>
                </div>
                
                {lessonReviewData.rating > 0 && (
                  <div className="space-y-3">
                    <textarea 
                      value={lessonReviewData.review_text} 
                      onChange={e => setLessonReviewData({...lessonReviewData, review_text: e.target.value})}
                      placeholder="هل لديك أي ملاحظات إضافية على هذا الدرس؟ (اختياري)"
                      className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl p-3 text-xs text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none min-h-[80px]"
                    />
                    <div className="flex justify-end">
                      <button 
                        onClick={submitLessonReview}
                        disabled={submittingLessonReview}
                        className="px-6 py-2 bg-primary text-on-primary rounded-xl text-xs font-bold hover:bg-primary-hover transition-colors disabled:opacity-50 flex items-center gap-2"
                      >
                        {submittingLessonReview ? <Loader2 size={16} className="animate-spin mx-auto" /> : 'حفظ تقييم الدرس'}
                      </button>
                    </div>
                  </div>
                )}
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
