import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
  const { t, i18n } = useTranslation();
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

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all'); // all, video, quiz
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  const queryParams = new URLSearchParams(useLocation().search);
  const targetModuleId = queryParams.get('module');
  const parentModuleId = queryParams.get('parentModule'); // parent module for back navigation


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

          // لو مفيش lessonId، جرب تجيب آخر درس من localStorage
          if (!found) {
            const savedKey = `lastLesson_${courseId}_${queryParams.get('module') || ''}}`;
            const savedId = localStorage.getItem(savedKey);
            if (savedId) {
              for (const m of cData.modules) {
                found = m.lessons?.find(l => l.id === parseInt(savedId));
                if (found) { openMod = m.id; break; }
              }
            }
          }

          // آخر fallback: أول درس في أول موديول
          if (!found) {
            const firstMod = cData.modules[0];
            if (firstMod?.lessons?.length > 0) {
              found = firstMod.lessons[0];
              openMod = firstMod.id;
            }
          }

          if (found) {
            setCurrentLesson(found);
            setOpenModuleIds(prev => prev.includes(openMod) ? prev : [...prev, openMod]);
          } else {
            setCurrentLesson(null);
            if (cData.modules[0]) setOpenModuleIds([cData.modules[0].id]);
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
    // حفظ آخر درس في localStorage
    const savedKey = `lastLesson_${courseId}_${targetModuleId || ''}`;
    localStorage.setItem(savedKey, lesson.id);
    navigate(`/learn/${courseId}/lesson/${lesson.id}?module=${modId}${parentModuleId ? '&parentModule=' + parentModuleId : ''}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [courseId, navigate, targetModuleId, parentModuleId]);

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
      
      // الانتقال التلقائي للدرس التالي
      if (nextLesson) {
        setTimeout(() => handleSelectLesson(nextLesson, nextLesson.module_id), 1000);
      } else {
        showToast('مبروك! لقد أكملت جميع دروس الكورس! 🎉', 'success');
      }
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

  
  // Find current submodule and its lessons
  const currentSubmodule = course?.modules?.find(m => m.id === parseInt(targetModuleId)) || course?.modules?.[0];
  const submoduleLessons = currentSubmodule?.lessons || [];
  
  const filteredLessons = submoduleLessons.filter(lesson => {
    if (searchQuery && !lesson.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (filterType === 'video' && lesson.lesson_type !== 'video') return false;
    if (filterType === 'quiz' && lesson.lesson_type !== 'quiz' && lesson.lesson_type !== 'assessment') return false;
    return true;
  });

  const completedSubmoduleLessonsCount = submoduleLessons.filter(l => completedLessons.includes(l.id)).length;


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F8F9FA]">
        <Loader2 size={48} className="animate-spin text-[#5c4be4]" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F8F9FA]">
        <p className="text-xl font-bold">عذراً، تعذر تحميل المحتوى</p>
      </div>
    );
  }

  const isCompleted = completedLessons.includes(currentLesson?.id);

  return (
    <div className="flex h-screen bg-surface-container-lowest overflow-hidden font-sans" dir="ltr">
      
      {/* SIDEBAR (Purple) */}
      <div className={`${sidebarOpen ? 'w-80' : 'w-20'} transition-all duration-300 flex flex-col bg-[#5c4be4] text-white shrink-0 overflow-hidden relative shadow-2xl z-20`}>
        
        {/* Sidebar Header */}
        <div className="p-4 sm:p-6 pb-4 flex flex-col items-center sm:items-stretch">
          <div className={`flex items-center ${sidebarOpen ? 'justify-between' : 'justify-center'} mb-6 w-full`}>
            {sidebarOpen && (
              <button
                onClick={() => {
                  const backModuleId = parentModuleId;
                  if (backModuleId && courseId) {
                    navigate(`/dashboard/course/${courseId}/module/${backModuleId}`);
                  } else {
                    navigate('/dashboard/overview');
                  }
                }}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                title="Back to module"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            )}
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors">
              {sidebarOpen ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="11 17 6 12 11 7"></polyline><polyline points="18 17 13 12 18 7"></polyline></svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="13 17 18 12 13 7"></polyline><polyline points="6 17 11 12 6 7"></polyline></svg>
              )}
            </button>
          </div>
          
          {sidebarOpen && (
            <>
              <h2 className="text-xs text-white/70 font-semibold uppercase tracking-wider mb-1">{course.title}</h2>
              <h1 className="text-xl font-bold mb-4">{currentSubmodule?.name || t('submodule', 'قسم فرعي')}</h1>
              
              <div className="mb-4">
                <div className="text-sm font-semibold mb-2">
                  {completedSubmoduleLessonsCount}/{submoduleLessons.length} {t('completed_count', 'مكتمل')}
                </div>
                <div className="w-full bg-white/20 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-white h-full rounded-full transition-all" style={{ width: `${(completedSubmoduleLessonsCount / Math.max(1, submoduleLessons.length)) * 100}%` }} />
                </div>
              </div>
            
          </>)}
        </div>
        
        {/* Lesson List */}
        <div className="flex-1 overflow-y-auto px-4 pb-6 space-y-2 custom-scrollbar">
          {filteredLessons.map((lesson, idx) => {
            const isActive = currentLesson?.id === lesson.id;
            const isCompleted = completedLessons.includes(lesson.id);
            
            return (
              <button
                key={lesson.id}
                onClick={() => handleSelectLesson(lesson, currentSubmodule.id)}
                className={`w-full flex items-start gap-3 p-3 rounded-xl transition-all text-left ${isActive ? 'bg-white text-[#5c4be4] shadow-md' : 'bg-white/5 text-white hover:bg-white/10'} ${!sidebarOpen ? 'justify-center' : ''}`}
              >
                <div className="shrink-0 flex items-center justify-center w-5 h-5 mt-0.5">
                  {isCompleted ? (
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center ${isActive ? 'bg-[#5c4be4]' : 'bg-white'}`}>
                       <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={isActive ? 'white' : '#5c4be4'} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </div>
                  ) : (
                    <div className={`w-3 h-3 rounded-full border-2 ${isActive ? 'border-[#5c4be4]' : 'border-white/50'}`} />
                  )}
                </div>
                
                {sidebarOpen && <div className="flex-1 overflow-hidden">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-sm font-bold truncate ${isActive ? 'text-[#5c4be4]' : 'text-white'}`}>
                      {idx + 1} &nbsp; {lesson.title}
                    </span>
                  </div>
                  {lesson.duration_seconds > 0 && (
                    <div className={`text-[10px] flex items-center gap-1.5 ${isActive ? 'text-[#5c4be4]/70' : 'text-white/50'}`}>
                      {lesson.lesson_type === 'video' ? <Play size={10} /> : <FileText size={10} />}
                      {formatDuration(lesson.duration_seconds)}
                    </div>
                  )}
                </div>}
              </button>
            );
          })}
          {filteredLessons.length === 0 && (
            <div className="text-center text-white/50 text-sm mt-4">
              {t('no_lessons_found', 'لا توجد دروس.')}
            </div>
          )}
        </div>
      </div>
      
      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col min-h-0 relative z-10 w-full overflow-hidden bg-[#F8F9FA]">
        
        {/* Main Content Header (Breadcrumb / Show Sidebar) */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-outline-variant/20 bg-white shrink-0">
          <div className="flex items-center">
            {!sidebarOpen && (
              <button onClick={() => setSidebarOpen(true)} className="p-2 mr-4 rounded-xl hover:bg-surface-container-low transition-colors text-on-surface-variant">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
              </button>
            )}
            <span className="text-sm font-bold text-on-surface-variant">
              {currentLesson?.title || t('lesson_content', 'محتوى الدرس')}
            </span>
          </div>
        </div>
        
        {/* Video / Content Area */}
        <div className="flex-1 min-h-0 overflow-y-auto p-6 lg:p-10 pb-32 flex flex-col items-center custom-scrollbar">
          <div className="w-full max-w-[95%] xl:max-w-[85%] mx-auto space-y-8">
            
            <div className="w-full bg-white border border-outline-variant/30 overflow-hidden shadow-sm h-[600px] flex items-center justify-center relative">
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
                <div className="text-center p-12 w-full h-full flex flex-col items-center justify-center">
                   <div className="w-20 h-20 rounded-full bg-primary/10 text-primary mx-auto flex items-center justify-center mb-6">
                     <FileText size={40} />
                   </div>
                   <h3 className="text-2xl font-extrabold text-on-surface mb-3">{currentLesson?.title}</h3>
                   <p className="text-sm text-on-surface-variant max-w-md">
                     {t('review_content_desc', 'قم بمراجعة المحتوى أدناه. عند الانتهاء، انقر فوق إكمال ومتابعة للانتقال إلى الدرس التالي.')}
                   </p>
                </div>
              )}
            </div>

            {currentLesson?.content && (
              <div className="bg-white rounded-2xl p-6 sm:p-8 border border-outline-variant/30 shadow-sm">
                <div className="prose prose-sm max-w-none prose-headings:text-[#5c4be4]" dangerouslySetInnerHTML={{ __html: currentLesson.content }} />
              </div>
            )}
            
            {/* Attachments Section */}
            {(() => {
              let atts = currentLesson?.attachments;
              if (!atts) return null;
              if (typeof atts === 'string') {
                try { atts = JSON.parse(atts); } catch (e) { atts = []; }
              }
              if (!Array.isArray(atts) || atts.length === 0) return null;

              return (
                <div className="w-full bg-[#3d3393] text-white rounded-2xl p-4 sm:p-6 shadow-lg flex flex-col sm:flex-row items-center justify-between" style={{ marginBottom: '3rem' }}>
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/10 rounded-xl">
                      <FileText size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold">{currentLesson.title} {t('materials', 'المرفقات')}</h3>
                      <p className="text-sm text-white/70">{t('click_to_download', 'انقر لتنزيل المواد المرفقة')}</p>
                    </div>
                  </div>
                  <div className="mt-4 sm:mt-0 flex flex-wrap gap-3">
                    {atts.map((file, idx) => {
                      const fileUrl = typeof file === 'string' ? file : file.url;
                      const fileName = typeof file === 'string' ? 'Attachment' : (file.name || 'Attachment');
                      const fullUrl = getFileUrl(fileUrl);
                      return (
                        <a
                          key={idx}
                          href={fullUrl}
                          download
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full transition-all text-sm font-semibold text-white cursor-pointer"
                        >
                          <Download size={16} />
                          <span>{fileName}</span>
                        </a>
                      );
                    })}
                  </div>
                </div>
              );
            })()}
            
          </div>
        </div>
        
        {/* Sticky Footer */}
        <div className="absolute bottom-0 left-0 w-full bg-white border-t border-outline-variant/20 p-4 px-6 flex items-center justify-between shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-10">
           {/* Prev / Next Lesson */}
           <div className="flex items-center gap-3">
             <button 
               onClick={() => prevLesson && handleSelectLesson(prevLesson, prevLesson.module_id)}
               disabled={!prevLesson}
               className="flex items-center gap-2 px-4 h-11 rounded-xl border border-outline-variant/40 hover:bg-surface-container-low transition-colors disabled:opacity-30 text-on-surface-variant font-bold text-xs"
               title="Previous lesson"
             >
               <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="rtl:rotate-180"><polyline points="15 18 9 12 15 6"></polyline></svg>
               <span>{t('prev', 'السابق')}</span>
             </button>
             
             <button 
               onClick={() => nextLesson && handleSelectLesson(nextLesson, nextLesson.module_id)}
               disabled={!nextLesson}
               className="flex items-center gap-2 px-4 h-11 rounded-xl border border-outline-variant/40 hover:bg-surface-container-low transition-colors disabled:opacity-30 text-on-surface-variant font-bold text-xs"
               title="Next lesson"
             >
               <span>{t('next', 'التالي')}</span>
               <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="rtl:rotate-180"><polyline points="9 18 15 12 9 6"></polyline></svg>
             </button>
           </div>

           {/* Video Controls: -10 / Play-Pause / +10 */}
           {currentLesson?.video_url && (
             <div className="flex items-center gap-2">
               {/* -10s */}
               <div className="flex flex-col items-center gap-1">
                 <button
                   onClick={() => handleSeek(-10)}
                   className="w-10 h-10 flex items-center justify-center rounded-xl border border-outline-variant/40 hover:bg-surface-container-low transition-colors text-on-surface-variant"
                   title="Rewind 10 seconds (←)"
                 >
                   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                     <path d="M11 17l-5-5 5-5"/>
                     <path d="M18 17l-5-5 5-5"/>
                   </svg>
                 </button>
                 <span className="text-[9px] text-on-surface-variant/50 font-semibold">-10s  ←</span>
               </div>

               {/* Play / Pause */}
               <div className="flex flex-col items-center gap-1">
                 <button
                   onClick={() => {
                     if (videoRef.current) {
                       if (videoRef.current.paused) videoRef.current.play();
                       else videoRef.current.pause();
                     } else if (iframeRef.current?.contentWindow) {
                       const cmd = isPlayingRef.current ? 'pause' : 'play';
                       iframeRef.current.contentWindow.postMessage(
                         JSON.stringify({ context: 'player.js', version: '0.1.0', method: cmd }), '*'
                       );
                       isPlayingRef.current = !isPlayingRef.current;
                     }
                   }}
                   className="w-12 h-12 flex items-center justify-center rounded-xl bg-[#5c4be4] hover:bg-[#4a3bc6] text-white shadow-md shadow-[#5c4be4]/20 transition-all active:scale-95"
                   title="Play / Pause (Space)"
                 >
                   <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                     <path d="M8 5v14l11-7z"/>
                   </svg>
                 </button>
                 <span className="text-[9px] text-on-surface-variant/50 font-semibold">Space</span>
               </div>

               {/* +10s */}
               <div className="flex flex-col items-center gap-1">
                 <button
                   onClick={() => handleSeek(10)}
                   className="w-10 h-10 flex items-center justify-center rounded-xl border border-outline-variant/40 hover:bg-surface-container-low transition-colors text-on-surface-variant"
                   title="Forward 10 seconds (→)"
                 >
                   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                     <path d="M13 17l5-5-5-5"/>
                     <path d="M6 17l5-5-5-5"/>
                   </svg>
                 </button>
                 <span className="text-[9px] text-on-surface-variant/50 font-semibold">+10s  →</span>
               </div>
             </div>
           )}
           
           <button 
              onClick={handleMarkComplete}
              disabled={completing || isCompleted}
              className={`px-8 py-3 rounded-xl text-sm font-bold shadow-md transition-all ${isCompleted ? 'bg-emerald-500 text-white cursor-default' : 'bg-[#5c4be4] hover:bg-[#4a3bc6] text-white'}`}
           >
              {completing ? <Loader2 size={16} className="animate-spin mx-auto" /> : (isCompleted ? t('completed_check', 'مكتمل ✓') : t('complete_and_continue', 'إكمال ومتابعة'))}
           </button>
        </div>
      </div>
    </div>
  );
}
