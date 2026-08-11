import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import API from '../api/axios';
import { 
  CheckCircle2, Clock, Award, AlertCircle, ArrowRight, 
  FileText, BookOpen, ChevronRight, ChevronLeft, RotateCcw,
  Check, LayoutList, HelpCircle, Target , X
} from 'lucide-react';

// ملاحظة: لضمان عمل الخط بشكل مثالي، يرجى إضافة الرابط التالي في ملف index.html أو استيراده في App.css:
// @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800;900&display=swap');

export default function AssessmentPage() {
  const { assessmentId } = useParams();
  const navigate = useNavigate();
  const [assessment, setAssessment] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasStarted, setHasStarted] = useState(false);
  
  // Timer state
  const [timeLeft, setTimeLeft] = useState(null);
  const [userAnswers, setUserAnswers] = useState({});
  const [currentCardIdx, setCurrentCardIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const timerRef = useRef(null);

  // Custom Modal State
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info', // 'confirm', 'error', 'success'
    onConfirm: null,
    onCancel: null,
    confirmText: 'تأكيد',
    cancelText: 'إلغاء'
  });

  // 🎨 لوحة ألوان Triple S Academy المحدثة
  const brand = {
    // البنفسجي (الهوية الأساسية)
    primary: '#4A0072',
    primaryHover: '#2D0054',
    primaryLight: '#EDE0F5', // خلفيات فاتحة جداً
    primaryBorder: '#C9A8D8',

    // ألوان تفاعلية
    selection: '#5E35B1', // للخيارات المختارة

    // ألوان العلم الأردني (للحالات)
    jordanRed: '#CE1126',
    jordanGreen: '#007A3D',
    jordanBlack: '#000000',
    
    // خلفيات وحيادية
    bodyBg: 'bg-[#F8FAFC]', // رمادي مائل للأزرق باهت جداً مريح للعين
    cardBg: 'bg-surface',
    textDark: 'text-on-surface',
    textMain: 'text-on-surface-variant',
    textLight: 'text-on-surface-variant',
    border: 'border-outline-variant',
  };

  // كلاسات جاهزة للاستخدام بناءً على الهوية
  const classes = {
    btnPrimary: `inline-flex items-center justify-center gap-2.5 px-8 py-3.5 bg-[#111827] text-white rounded-xl font-bold hover:bg-[#000000] transition-all duration-200 shadow-sm hover:shadow-gray-300 active:scale-[0.98]`,
    btnSecondary: `inline-flex items-center gap-2 px-5 py-2.5 bg-surface-variant text-on-surface hover:bg-surface-variant rounded-xl font-semibold transition-all border border-outline-variant`,
    card: `${brand.cardBg} rounded-3xl border ${brand.border} shadow-sm p-6 sm:p-8`,
    iconBox: `w-14 h-14 rounded-2xl flex items-center justify-center border`,
  };

  useEffect(() => {
    const fetchAssessment = async () => {
      try {
        const res = await API.get(`/student/assessments/${assessmentId}`);
        setAssessment(res.data.assessment);
        setQuestions(res.data.questions || []);
        
        if (res.data.assessment?.duration_minutes) {
          setTimeLeft(res.data.assessment.duration_minutes * 60);
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching assessment:', err);
        setLoading(false);
      }
    };
    fetchAssessment();
  }, [assessmentId]);

  // Timer logic
  useEffect(() => {
    if (!hasStarted || timeLeft === null || result || !assessment || assessment.type === 'flashcard') return;
    
    if (timeLeft <= 0) {
      if(timerRef.current) clearInterval(timerRef.current);
      handleSubmitQuiz(true); // Auto-submit when time is up
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => {
        if(timerRef.current) clearInterval(timerRef.current);
    };
  }, [timeLeft, result, assessment, hasStarted]);

  const handleSelectOption = (qId, option) => {
    setUserAnswers(prev => ({ ...prev, [qId]: option }));
  };

  const handleTextAnswer = (qId, text) => {
    setUserAnswers(prev => ({ ...prev, [qId]: text }));
  };

  const handleSubmitQuiz = async (isAutoSubmit = false) => {
    if (!assessment) return;
    if(timerRef.current) clearInterval(timerRef.current);

    const executeSubmit = async () => {
        const formattedAnswers = Object.entries(userAnswers).map(([qId, opt]) => ({
          question_id: parseInt(qId),
          selected_option: opt
        }));

        try {
          const res = await API.post('/student/assessments/submit', {
            assessment_id: assessment.id,
            answers: formattedAnswers
          });
          setResult(res.data);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (err) {
          setModalConfig({
              isOpen: true,
              title: 'خطأ',
              message: err.response?.data?.message || err.message || 'حدث خطأ في تقديم الاختبار',
              type: 'error',
              confirmText: 'حسناً',
              onConfirm: () => setModalConfig({ isOpen: false })
          });
        }
    };

    if(!isAutoSubmit) {
        setModalConfig({
            isOpen: true,
            title: 'تأكيد التسليم',
            message: 'هل أنت متأكد من رغبتك في تسليم الإجابات وإنهاء الاختبار؟',
            type: 'confirm',
            confirmText: 'نعم، قم بالتسليم',
            cancelText: 'تراجع',
            onConfirm: () => {
                setModalConfig({ isOpen: false });
                executeSubmit();
            },
            onCancel: () => {
                setModalConfig({ isOpen: false });
                // Re-start timer if user cancels
                if (timeLeft > 0) {
                    timerRef.current = setInterval(() => {
                        setTimeLeft(prev => prev - 1);
                    }, 1000);
                }
            }
        });
        return;
    }

    // Auto submit without confirmation
    executeSubmit();
  };

  const parseOptions = (opts) => {
    if (!opts) return [];
    if (Array.isArray(opts)) return opts;
    try {
      return JSON.parse(opts);
    } catch {
      return typeof opts === 'string' ? opts.split(',').map(o => o.trim()) : [];
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const isAssignment = assessment?.type === 'assignment';
  const isFlashcard = assessment?.type === 'flashcard';
  const answeredCount = Object.keys(userAnswers).length;
  const progressPercentage = questions.length > 0 ? (answeredCount / questions.length) * 100 : 0;

  // --- شاشة التحميل الحديثة ---
  if (loading) {
    return (
      <div className={`flex flex-col items-center justify-center min-h-screen ${brand.bodyBg} font-['Tajawal']`} dir="rtl">
        <div className="relative flex items-center justify-center">
            <div className={`w-20 h-20 border-4 border-[${brand.primaryLight}] rounded-full`}></div>
            <div className={`absolute w-20 h-20 border-4 border-t-[${brand.primary}] rounded-full animate-spin`}></div>
            <img src="/logo.png" alt="SSS" className='absolute w-10 h-10 opacity-80'/>
        </div>
        <p className={`mt-6 text-xl font-bold text-[${brand.primary}] animate-pulse`}>جاري تحضير الاختبار...</p>
        <p className="text-on-surface-variant mt-2">Triple S Academy</p>
      </div>
    );
  }

  // --- شاشة عدم العثور على الاختبار ---
  if (!assessment) {
    return (
      <div className={`flex items-center justify-center min-h-screen ${brand.bodyBg} px-4 font-['Tajawal']`} dir="rtl">
        <div className="max-w-md w-full bg-surface rounded-3xl shadow-xl p-10 text-center space-y-6 border border-outline-variant">
          <div className="w-24 h-24 bg-red-50 rounded-full mx-auto flex items-center justify-center text-[${brand.jordanRed}] border-4 border-red-100 shadow-inner">
            <AlertCircle size={56} strokeWidth={1.5} />
          </div>
          <h2 className={`text-3xl font-extrabold ${brand.textDark}`}>الاختبار غير موجود</h2>
          <p className={`${brand.textMain} text-lg leading-relaxed`}>عفواً، لم يتم العثور على الاختبار المطلوب. ربما تم نقله، حذفه، أو انتهت صلاحية الرابط.</p>
          <div className="pt-4">
            <Link to={`/dashboard`} className={`${classes.btnPrimary} w-full`}>
              <ArrowRight size={20} /> العودة للوحة التحكم
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // --- واجهة البطاقات التعليمية (Flashcards) ---
  const renderFlashcardMode = () => {
    if (questions.length === 0) return (
        <div className={`${classes.card} text-center py-16 mt-10`}>
            <HelpCircle size={48} className="mx-auto text-on-surface-variant mb-4"/>
            <p className="text-on-surface-variant text-lg">لا توجد بطاقات متاحة في هذا القسم حالياً.</p>
        </div>
    );
    const currentQ = questions[currentCardIdx];
    const isMCQ = currentQ.question_type === 'mcq' || currentQ.question_type === 'true_false';
    const options = isMCQ ? parseOptions(currentQ.options) : [];

    const handleFlashcardAnswer = (q, knewIt) => {
        setUserAnswers(prev => ({ ...prev, [q.id]: knewIt ? q.correct_answer : 'لم أعرفها' }));
        if (currentCardIdx < questions.length - 1) {
            setCurrentCardIdx(currentCardIdx + 1);
            setIsFlipped(false);
        } else {
            handleSubmitQuiz(false);
        }
    };
    
    return (
      <div className="max-w-4xl mx-auto space-y-4 mt-4 pb-6 font-['Tajawal']">
        <div className="flex justify-between items-center bg-surface p-3 rounded-xl border border-outline-variant shadow-sm">
          <div className="flex items-center gap-2">
             <div className={`p-2 rounded-lg bg-[${brand.primaryLight}] text-[${brand.primary}]`}>
                <BookOpen size={18}/>
             </div>
             <span className={`${brand.textDark} font-bold text-base`}>مراجعة البطاقات ذهنياً</span>
          </div>
          <span className="text-[${brand.primary}] font-bold text-sm bg-[${brand.primaryLight}] px-3 py-1 rounded-full">
            البطاقة {currentCardIdx + 1} / {questions.length}
          </span>
        </div>
        
        {/* المنظور والحاوية للقلب */}
        <div className="relative w-full h-[280px] [perspective:1500px] group" onClick={() => !isFlipped && !isMCQ && setIsFlipped(true)}>
          <div className={`w-full h-full transition-transform duration-700 [transform-style:preserve-3d] shadow-lg rounded-2xl cursor-pointer ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`}>
            
            {/* وجه البطاقة (السؤال) */}
            <div 
              className={`absolute inset-0 w-full h-full bg-surface border-2 ${brand.border} rounded-2xl p-6 flex flex-col items-center justify-center text-center [backface-visibility:hidden] group-hover:border-[${brand.primaryBorder}] transition-colors`}
              onClick={(e) => isMCQ && e.stopPropagation()} // منع القلب التلقائي في حالة الخيارات
            >
              <HelpCircle size={40} className={`text-[${brand.primary}] mb-3 opacity-20`} />
              <h3 className={`text-xl font-bold ${brand.textDark} leading-tight ${isMCQ ? 'mb-4' : ''}`}>{currentQ.question_text}</h3>
              
              {isMCQ ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full mt-2">
                  {options.map((opt, i) => (
                    <button 
                       key={i} 
                       onClick={(e) => {
                          e.stopPropagation();
                          setUserAnswers(prev => ({ ...prev, [currentQ.id]: opt }));
                          setIsFlipped(true); // اقلب البطاقة لإظهار النتيجة
                       }}
                       className={`p-3 bg-surface-variant hover:bg-[${brand.primaryLight}] text-sm font-bold text-[${brand.textDark}] rounded-xl border border-outline-variant hover:border-[${brand.primary}] transition-all text-center flex items-center justify-center`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              ) : (
                <div className={`absolute bottom-4 flex items-center gap-1.5 text-xs font-medium text-[${brand.primary}] opacity-70`}>
                  <RotateCcw size={14} /> انقر لإظهار الإجابة
                </div>
              )}
            </div>
            
            {/* ظهر البطاقة (الإجابة والنتيجة) */}
            <div 
              className={`absolute inset-0 w-full h-full bg-[${brand.primaryLight}] border-2 border-[${brand.primaryBorder}] rounded-2xl p-6 flex flex-col items-center justify-center text-center [backface-visibility:hidden] [transform:rotateY(180deg)] shadow-inner`}
              onClick={(e) => e.stopPropagation()} 
            >
              {isMCQ ? (
                 <div className="w-full h-full flex flex-col items-center justify-center pb-8">
                    {userAnswers[currentQ.id] === currentQ.correct_answer ? (
                        <>
                           <CheckCircle2 size={48} className="text-green-500 mb-2" />
                           <h4 className="text-xl font-bold text-green-700 mb-3">إجابة صحيحة!</h4>
                           <div className="p-3 bg-surface rounded-xl border border-green-200 text-green-700 font-black shadow-sm text-sm w-full max-w-sm">
                             {currentQ.correct_answer}
                           </div>
                        </>
                    ) : (
                        <>
                           <AlertCircle size={48} className="text-red-500 mb-2" />
                           <h4 className="text-xl font-bold text-red-700 mb-2">إجابة خاطئة!</h4>
                           <p className="text-on-surface-variant text-xs mb-2">الإجابة الصحيحة هي:</p>
                           <div className="p-3 bg-surface rounded-xl border border-green-200 text-green-700 font-black shadow-sm text-sm w-full max-w-sm">
                             {currentQ.correct_answer}
                           </div>
                        </>
                    )}
                    <div className="absolute bottom-4 left-0 right-0 px-6 flex justify-center w-full">
                       <button 
                          onClick={() => {
                              if (currentCardIdx < questions.length - 1) {
                                  setCurrentCardIdx(currentCardIdx + 1);
                                  setIsFlipped(false);
                              } else {
                                  handleSubmitQuiz(false);
                              }
                          }}
                          className={`w-full max-w-xs ${classes.btnPrimary} py-2 text-sm shadow-md`}
                       >
                           {currentCardIdx < questions.length - 1 ? 'البطاقة التالية' : 'إنهاء وعرض النتيجة'} <ChevronLeft size={16} />
                       </button>
                    </div>
                 </div>
              ) : (
                <>
                  <CheckCircle2 size={40} className={`text-[${brand.primary}] mb-2 opacity-30 hidden sm:block`} />
                  <div className="space-y-3 w-full max-w-xl overflow-y-auto max-h-[120px] pr-2 custom-scrollbar mb-8">
                      <div className="bg-surface p-4 rounded-xl border border-purple-100 shadow-sm">
                            <p className={`text-base font-bold text-[${brand.textDark}] leading-relaxed`}>الإجابة الصحيحة غير متوفرة لهذا النوع، هل كنت تعرفها؟</p>
                      </div>
                  </div>
                  
                  <div className="absolute bottom-4 left-0 right-0 px-6 flex justify-center gap-3 w-full">
                      <button 
                        onClick={() => handleFlashcardAnswer(currentQ, true)} 
                        className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-2.5 rounded-xl text-sm flex items-center justify-center gap-1.5 transition-colors shadow-md"
                      >
                         <Check size={18} /> عرفت الإجابة
                      </button>
                      <button 
                        onClick={() => handleFlashcardAnswer(currentQ, false)} 
                        className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-2.5 rounded-xl text-sm flex items-center justify-center gap-1.5 transition-colors shadow-md"
                      >
                         <X size={18} /> لم أعرفها
                      </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* أزرار التنقل السريع */}
        <div className="flex items-center justify-between mt-4 bg-surface p-3 rounded-xl border border-outline-variant shadow-sm">
          <button 
            onClick={(e) => { e.stopPropagation(); setCurrentCardIdx(Math.max(0, currentCardIdx - 1)); setIsFlipped(false); }}
            disabled={currentCardIdx === 0}
            className={`${classes.btnSecondary} py-2 px-4 disabled:opacity-40 disabled:cursor-not-allowed text-sm`}
          >
            <ChevronRight size={18} /> السابقة
          </button>
          
          <div className="flex gap-2">
            {currentCardIdx === questions.length - 1 ? (
                 <button onClick={() => handleSubmitQuiz(false)} className={`${classes.btnPrimary} py-2 px-4 text-sm`}>
                    إنهاء وعرض النتيجة <Check size={18}/>
                 </button>
            ) : (
                <button 
                    onClick={(e) => { e.stopPropagation(); setCurrentCardIdx(Math.min(questions.length - 1, currentCardIdx + 1)); setIsFlipped(false); }}
                    className={`${classes.btnPrimary} py-2 px-4 text-sm`}
                >
                    تخطي <ChevronLeft size={18} />
                </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  // --- واجهة الأسئلة والاختبارات (Exam/Assignment) ---
  const renderQuestions = () => (
    <div className="space-y-4 max-w-5xl mx-auto mt-4 pb-20 font-['Tajawal']">
      {questions.map((q, idx) => {
        const options = parseOptions(q.options);
        const isEssay = q.question_type === 'essay' || q.question_type === 'short_answer';
        const isAnswered = userAnswers[q.id] !== undefined && userAnswers[q.id] !== '';

        return (
          <div key={q.id} id={`question-${q.id}`} className={`bg-surface rounded-xl border transition-all duration-300 p-4 shadow-sm hover:shadow-md ${isAnswered ? `border-[${brand.primaryBorder}] shadow-purple-50` : 'border-outline-variant'}`}>
            <div className="flex items-start gap-3 mb-3 border-b border-outline-variant pb-3">
              <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center font-black ${isAnswered ? `bg-[${brand.primary}] text-white` : 'bg-surface-variant text-on-surface-variant'} border ${isAnswered ? `border-[${brand.primaryHover}]`: 'border-outline-variant'}`}>
                <span className='text-lg'>{idx + 1}</span>
              </div>
              <h3 className={`text-lg font-bold ${brand.textDark} pt-1.5 leading-snug`}>
                {q.question_text}
              </h3>
            </div>
            
            {isEssay ? (
              <div className="sm:pr-14 mt-2">
                <textarea 
                  rows={q.question_type === 'essay' ? 4 : 2}
                  className={`w-full bg-surface-variant border ${brand.border} rounded-xl p-3 text-[${brand.textDark}] focus:border-[${brand.primary}] focus:ring-2 focus:ring-[${brand.primaryLight}] outline-none transition-all resize-none text-sm leading-relaxed placeholder:text-on-surface-variant`}
                  placeholder="اكتب إجابتك هنا..."
                  value={userAnswers[q.id] || ''}
                  onChange={(e) => handleTextAnswer(q.id, e.target.value)}
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:pr-14 mt-2">
                {options.map((opt, oIdx) => {
                  const isSelected = userAnswers[q.id] === opt;
                  return (
                    <label 
                      key={oIdx} 
                      className={`relative flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer overflow-hidden group ${
                        isSelected 
                          ? `border-[${brand.selection}] bg-purple-50 shadow-inner` 
                          : `border-outline-variant bg-surface hover:border-[${brand.primaryBorder}] hover:bg-[${brand.primaryLight}]/50`
                      }`}
                    >
                      <input 
                        type="radio" 
                        name={`question-${q.id}`} 
                        value={opt} 
                        checked={isSelected} 
                        onChange={() => handleSelectOption(q.id, opt)}
                        className="hidden"
                      />
                      
                      {/* مظهر خيار الراديو المخصص */}
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors bg-surface ${
                        isSelected ? `border-[${brand.selection}]` : 'border-outline-variant0 group-hover:border-purple-300'
                      }`}>
                        {isSelected && <div className={`w-2.5 h-2.5 rounded-full bg-[${brand.selection}]`} />}
                      </div>
                      
                      <span className={`font-semibold text-sm leading-snug ${isSelected ? `text-[${brand.selection}]` : brand.textMain}`}>
                        {opt}
                      </span>
                      
                      {/* أيقونة صح خلفية خفيفة عند الاختيار */}
                      {isSelected && (
                        <div className={`absolute left-5 top-1/2 -translate-y-1/2 text-[${brand.selection}] opacity-10`}>
                          <Check size={50} strokeWidth={3} />
                        </div>
                      )}
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <div className={`min-h-screen ${brand.bodyBg} font-['Tajawal']`} dir="rtl">
      
      {/* 👑 ترويسة الهوية الاحترافية (Header) */}
      <header className={`bg-surface/95 backdrop-blur-sm border-b ${brand.border} shadow-sm sticky top-0 z-50`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          {/* الشعار والاسم */}
          <div className="flex items-center gap-2">
            <Link to="/dashboard" className={`w-8 h-8 rounded-full bg-[${brand.primary}] flex items-center justify-center text-white shadow-sm hover:scale-105 transition-transform`}>
              <img src="/logo.png" alt="logo" className='w-6 h-6'/>
            </Link>
          </div>
          
          {/* عنوان الاختبار وزر الخروج */}
          <div className="flex items-center gap-3">
             {hasStarted && !result && (
                <div className={`text-sm font-semibold ${brand.textMain} hidden md:block max-w-sm truncate`}>
                    {assessment.title}
                </div>
             )}
            <button 
              onClick={() => {
                if (hasStarted && !result) {
                   setModalConfig({
                    isOpen: true,
                    title: 'تأكيد المغادرة',
                    message: 'هل أنت متأكد من مغادرة الاختبار؟ سيتم تسليم ما قمت بإجابته حتى الآن.',
                    type: 'confirm',
                    confirmText: 'نعم، غادر',
                    cancelText: 'إلغاء',
                    onConfirm: () => {
                      handleSubmitQuiz(true);
                      navigate('/dashboard');
                    },
                    onCancel: () => setModalConfig({ isOpen: false })
                   });
                } else {
                  navigate(-1);
                }
              }}
              className={`${classes.btnSecondary} py-1.5 px-3 text-xs`}
            >
              <ArrowRight size={14} />
              <span className="inline">انسحاب</span>
            </button>
          </div>
        </div>
      </header>
      
      {/* --- شاشة البداية والتعليمات (Start Screen) --- */}
      {!hasStarted && !result && (
        <div className="flex items-center justify-center p-4 mt-6 font-['Tajawal'] overflow-hidden">
          <div className="w-full max-w-3xl bg-surface rounded-3xl shadow-xl shadow-purple-100/30 relative border border-outline-variant">
            
            <div className={`absolute top-0 left-0 right-0 h-2 bg-[${brand.primary}] rounded-t-full`}></div>

            <div className="px-6 sm:px-10 py-10 text-center relative z-10">
              <div className={`w-20 h-20 mx-auto rounded-2xl bg-[${brand.primaryLight}] flex items-center justify-center text-[${brand.primary}] mb-6 border-2 border-white shadow-md ring-1 ring-purple-50`}>
                {isAssignment ? <FileText size={40} strokeWidth={1.5} /> : isFlashcard ? <BookOpen size={40} strokeWidth={1.5} /> : <Target size={40} strokeWidth={1.5} />}
              </div>
              
              <span className={`inline-block bg-[${brand.primaryLight}] text-[${brand.primary}] px-3 py-1 rounded-full font-bold text-xs mb-2`}>
                {isAssignment ? 'تكليف دراسي' : isFlashcard ? 'بطاقات مراجعة' : 'اختبار تقييمي'}
              </span>
              <h2 className={`text-2xl sm:text-3xl font-black ${brand.textDark} mb-3 leading-tight`}>{assessment.title}</h2>
              {assessment.description && <p className={`${brand.textMain} text-sm mb-6 max-w-xl mx-auto leading-relaxed`}>{assessment.description}</p>}
              
              {/* شبكة المعلومات */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-6 border-y border-outline-variant mb-8 bg-surface-variant/50 rounded-2xl px-4">
                {!isFlashcard && (
                  <>
                    <div className="flex flex-col items-center gap-1 p-3 rounded-xl bg-surface border border-outline-variant shadow-sm">
                      <div className={`p-2 rounded-lg bg-blue-50 text-blue-600`}><Clock size={20} /></div>
                      <span className="text-xs font-semibold text-on-surface-variant">المدة</span>
                      <span className={`text-base font-extrabold ${brand.textDark}`}>{assessment.duration_minutes ? `${assessment.duration_minutes} دقيقة` : 'مفتوح'}</span>
                    </div>
                    
                    <div className="flex flex-col items-center gap-1 p-3 rounded-xl bg-surface border border-outline-variant shadow-sm">
                      <div className={`p-2 rounded-lg bg-amber-50 text-amber-600`}><LayoutList size={20} /></div>
                      <span className="text-xs font-semibold text-on-surface-variant">الأسئلة</span>
                      <span className={`text-base font-extrabold ${brand.textDark}`}>{questions.length} سؤال</span>
                    </div>
                    
                    <div className="flex flex-col items-center gap-1 p-3 rounded-xl bg-surface border border-outline-variant shadow-sm">
                      <div className={`p-2 rounded-lg bg-green-50 text-[${brand.jordanGreen}]`}><Award size={20} /></div>
                      <span className="text-xs font-semibold text-on-surface-variant">الدرجة</span>
                      <span className={`text-base font-extrabold ${brand.textDark}`}>{assessment.total_marks || 100}</span>
                    </div>
                  </>
                )}
                {isFlashcard && (
                  <div className="flex flex-col items-center gap-1 p-3 rounded-xl bg-surface border border-outline-variant shadow-sm sm:col-span-3">
                    <div className={`p-2 rounded-lg bg-[${brand.primaryLight}] text-[${brand.primary}]`}><BookOpen size={24} /></div>
                    <span className="text-xs font-semibold text-on-surface-variant">عدد البطاقات</span>
                    <span className={`text-xl font-extrabold ${brand.textDark}`}>{questions.length}</span>
                  </div>
                )}
              </div>
              
              <button 
                onClick={() => setHasStarted(true)} 
                className={`${classes.btnPrimary} text-base px-10 py-3 rounded-xl w-full sm:w-auto shadow-sm`}
              >
                {isAssignment ? 'بدء التسليم' : isFlashcard ? 'بدء التصفح' : 'بدء الاختبار'} <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- منطقة الاختبار الفعالة (بدأ الاختبار) --- */}
      {hasStarted && !result && (
        <>
          {/* شريط التقدم والوقت المثبت العلوي (تحت الـ Header مباشرة) */}
          <div className="sticky top-14 z-40 bg-surface/95 backdrop-blur-sm border-b ${brand.border} shadow-sm font-['Tajawal']">
              {/* شريط التقدم اللطيف */}
              <div className="h-2 w-full bg-surface-variant overflow-hidden">
                <div className={`h-full bg-[${brand.primary}] transition-all duration-500 ease-out rounded-l-full relative`} style={{ width: `${progressPercentage}%` }}>
                    <div className='absolute inset-0 bg-surface/30 animate-pulse'></div>
                </div>
              </div>
              
              <div className="max-w-7xl mx-auto px-4 sm:px-6 h-12 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`bg-surface-variant text-on-surface-variant px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 border border-outline-variant`}>
                    <Target size={14} className='text-[${brand.primary}]' />
                    <span>
                        {isFlashcard 
                            ? `تم العرض: ${currentCardIdx + 1} / ${questions.length}` 
                            : `الأسئلة المجابة: ${answeredCount} / ${questions.length}`
                        }
                    </span>
                  </div>
                </div>

                {timeLeft !== null && assessment.type !== 'flashcard' && (
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border-2 font-bold transition-all duration-300 ${
                    timeLeft < 120
                      ? `bg-red-50 border-[${brand.jordanRed}] text-[${brand.jordanRed}] animate-pulse` 
                      : `bg-surface ${brand.border} ${brand.textDark}`
                  }`}>
                    <Clock size={16} className={timeLeft < 120 ? `text-[${brand.jordanRed}]` : 'text-on-surface-variant'} />
                    <span dir="ltr" className="text-sm mt-0.5 tabular-nums">{formatTime(timeLeft)}</span>
                  </div>
                )}
              </div>
            </div>

          {/* منطقة المحتوى (الأسئلة أو البطاقات) */}
          <div className="px-3 sm:px-6">
            {isFlashcard ? renderFlashcardMode() : renderQuestions()}
          </div>

          {/* شريط الإنهاء السفلي المثبت (فقط للاختبارات والتكليفات) */}
          {hasStarted && !result && questions.length > 0 && !isFlashcard && (
            <div className="fixed bottom-0 left-0 right-0 p-3 bg-surface/95 backdrop-blur-sm border-t ${brand.border} shadow-[0_-5px_20px_-10px_rgba(0,0,0,0.1)] z-40 flex justify-center font-['Tajawal']">
              <button 
                onClick={() => handleSubmitQuiz(false)} 
                className={`${classes.btnPrimary} w-full max-w-sm text-sm py-2.5 rounded-xl group shadow-sm`}
              >
                <CheckCircle2 size={18} className="group-hover:scale-110 transition-transform" />
                {isAssignment ? 'تسليم التكليف' : 'إنهاء الاختبار وتسليم'}
              </button>
            </div>
          )}
        </>
      )}

      {/* --- شاشة النتيجة الاحترافية --- */}
      {result && (
        <div className="flex items-center justify-center p-4 mt-6 md:mt-10 font-['Tajawal'] pb-10 overflow-hidden">
          <div className={`w-full max-w-2xl bg-surface rounded-[2rem] shadow-xl p-8 sm:p-10 text-center relative border ${brand.border}`}>
            
            {/* خط هوية علوي بلون الحالة */}
            <div className={`absolute top-0 left-0 right-0 h-2 rounded-t-[2rem] ${
                isAssignment ? 'bg-blue-500' : result.passed ? 'bg-green-500' : 'bg-red-500'
            }`}></div>

            <div className="relative z-10 space-y-6">
              <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center border-4 shadow-lg transition-transform duration-500 scale-105 ${
                isAssignment 
                  ? 'bg-blue-50 text-blue-600 border-blue-100'
                  : result.passed 
                    ? 'bg-green-50 text-green-500 border-green-100' 
                    : 'bg-red-50 text-red-500 border-red-100'
              }`}>
                {isAssignment ? <FileText size={40} strokeWidth={1.5} /> : result.passed ? <Award size={40} strokeWidth={1.5} /> : <AlertCircle size={40} strokeWidth={1.5} />}
              </div>
              
              <h2 className={`text-2xl md:text-3xl font-black leading-tight ${
                isAssignment ? 'text-blue-700' : result.passed ? 'text-green-600' : 'text-red-600'
              }`}>
                {isAssignment 
                  ? 'تم استلام تكليفك بنجاح!' 
                  : result.passed 
                    ? 'تهانينا! لقد اجتزت التقييم بنجاح 🎉' 
                    : 'للاسف، لم تتجاوز درجة النجاح 😔'
                }
              </h2>

              <p className={`${brand.textMain} text-sm sm:text-base max-w-lg mx-auto leading-relaxed`}>
                {isAssignment 
                    ? 'شكراً لجهودك. سيقوم القسم الأكاديمي بمراجعة ما قدمته ورصد الدرجة في أقرب وقت ممكن.'
                    : result.passed
                    ? 'أداء رائع ومتميز! استمر في هذا العطاء والتقدم في مسيرتك التعليمية مع Triple S Academy.'
                    : 'لا تقلق، الفشل هو أول خطوة في طريق النجاح. راجع المواد الدراسية وحاول مرة أخرى.'
                }
              </p>
              
              {/* كرت الدرجة (فقط للاختبارات) */}
              {!isAssignment && (
                <div className="bg-surface-variant border border-outline-variant rounded-2xl p-6 mt-6 inline-block w-full max-w-md mx-auto shadow-sm relative">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 relative z-10">
                    <div className="text-center sm:text-right sm:border-l border-outline-variant sm:pl-6">
                      <p className="text-on-surface-variant font-bold mb-1 text-xs">الدرجة المستحقة</p>
                      <p className={`text-4xl font-black ${brand.textDark}`}>{result.score}<span className="text-xl text-on-surface-variant font-bold"> / {result.totalMarks}</span></p>
                    </div>
                    <div className="text-center sm:text-right">
                      <p className="text-on-surface-variant font-bold mb-1 text-xs">النسبة المئوية</p>
                      <p className={`text-4xl font-black ${result.passed ? 'text-green-600' : 'text-red-600'}`} dir="ltr">{result.percentage}%</p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="pt-8 border-t border-outline-variant mt-8">
                <Link to="/dashboard" className={`${classes.btnPrimary} text-sm px-8 py-3 rounded-xl shadow-md inline-flex justify-center w-full sm:w-auto`}>
                  <ArrowRight size={18} /> العودة إلى لوحة التحكم
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- Custom Modal --- */}
      {modalConfig.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 font-['Tajawal']">
          {/* Overlay */}
          <div 
             className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" 
             onClick={modalConfig.onCancel || modalConfig.onConfirm}
          ></div>
          
          {/* Modal Content */}
          <div className="relative bg-surface rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl animate-fade-in-up border border-outline-variant">
            <div className="flex flex-col items-center text-center">
               <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
                  modalConfig.type === 'error' ? 'bg-red-50 text-red-500' :
                  modalConfig.type === 'confirm' ? 'bg-amber-50 text-amber-500' :
                  'bg-blue-50 text-blue-500'
               }`}>
                  {modalConfig.type === 'error' ? <AlertCircle size={32} /> :
                   modalConfig.type === 'confirm' ? <HelpCircle size={32} /> :
                   <CheckCircle2 size={32} />}
               </div>
               
               <h3 className="text-xl font-bold text-on-surface mb-2">{modalConfig.title}</h3>
               <p className="text-on-surface-variant text-sm leading-relaxed mb-8">{modalConfig.message}</p>
               
               <div className="flex gap-3 w-full">
                  {modalConfig.type === 'confirm' && modalConfig.onCancel && (
                     <button 
                        onClick={modalConfig.onCancel}
                        className="flex-1 py-3 px-4 rounded-xl font-bold text-sm bg-surface-variant hover:bg-surface-variant text-on-surface-variant transition-colors"
                     >
                        {modalConfig.cancelText}
                     </button>
                  )}
                  <button 
                     onClick={modalConfig.onConfirm}
                     className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm text-white transition-colors shadow-md ${
                        modalConfig.type === 'error' ? 'bg-red-500 hover:bg-red-600 shadow-red-500/20' :
                        modalConfig.type === 'confirm' ? 'bg-[#111827] hover:bg-[#000000] shadow-gray-800/20' :
                        'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20'
                     }`}
                  >
                     {modalConfig.confirmText}
                  </button>
               </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}