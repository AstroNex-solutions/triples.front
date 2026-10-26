import React, { useState, useEffect, useCallback, useContext } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import API from '../../api/axios';
import { 
  Play, 
  CheckCircle, 
  ArrowRight,
  ChevronDown,
  Loader2, 
  BookOpen, 
  ChevronRight,
  ChevronLeft,
  HelpCircle
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getFileUrl } from '../../utils/fileHelper';

export default function ModuleQuizPlayerPage() {
  const { moduleId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { user } = useContext(AuthContext);
  
  const queryParams = new URLSearchParams(location.search);
  const type = queryParams.get('type') || 'qbank'; // 'qbank' or 'sa'
  const chapterId = queryParams.get('chapterId');
  
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for Quiz Player
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState({}); // { qId: 'selected option' }
  const [showExplanation, setShowExplanation] = useState({}); // { qId: true/false }
  const [isFinished, setIsFinished] = useState(false);
  const [showReport, setShowReport] = useState(false);

  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true);
      try {
        let url = `/student/modules/${moduleId}/questions?type=${type}`;
        if (chapterId) url += `&chapterId=${chapterId}`;
        const res = await API.get(url);
        setQuestions(res.data.questions || []);
      } catch (err) {
        console.error(err);
        setError('Error fetching questions');
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [moduleId, type, chapterId]);

  const handleOptionSelect = (qId, option) => {
    setAnswers(prev => ({ ...prev, [qId]: option }));
  };

  const handleReveal = (qId) => {
    setShowExplanation(prev => ({ ...prev, [qId]: true }));
  };

  if (loading) {
    return (
      <div className="flex-1 min-h-screen bg-background flex justify-center items-center">
        <Loader2 size={40} className="animate-spin text-primary" />
      </div>
    );
  }

  if (error || questions.length === 0) {
    return (
      <div className="flex-1 min-h-screen bg-background flex flex-col justify-center items-center">
        <div className="w-20 h-20 bg-surface-container rounded-full flex items-center justify-center text-on-surface-variant/50 mb-4">
          <HelpCircle size={40} />
        </div>
        <p className="text-on-surface font-bold text-lg mb-4">{error || t('moduleQuiz.noQuestions', 'لا توجد أسئلة حالياً.')}</p>
        <button onClick={() => navigate(-1)} className="px-6 py-2 bg-primary text-white rounded-xl shadow-sm hover:opacity-90 font-bold transition-all">
          {t('moduleQuiz.backToModuleBtn', 'الرجوع للموديول')}
        </button>
      </div>
    );
  }

  const currentQ = questions[currentQuestionIdx];
  const isRTL = i18n.language !== 'en';

  let parsedOptions = currentQ?.options;
  if (parsedOptions && !Array.isArray(parsedOptions)) {
    let attempts = 0;
    while (typeof parsedOptions === 'string' && attempts < 3) {
      try { parsedOptions = JSON.parse(parsedOptions); } catch (e) { break; }
      attempts++;
    }
  }
  if (!Array.isArray(parsedOptions)) parsedOptions = [];
  
  const hasAnswered = answers[currentQ?.id] !== undefined;
  const isCorrect = answers[currentQ?.id] === currentQ?.correct_answer;
  const revealed = type === 'sa' 
    ? isFinished 
    : (showExplanation[currentQ?.id] || hasAnswered);

  const handleFinishSA = () => {
    setIsFinished(true);
    setShowReport(true);
  };

  const correctCount = questions.filter(q => answers[q.id] === q.correct_answer).length;
  const totalCount = questions.length;
  const scorePercentage = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;

  let evalComment = "";
  let evalBullets = [];

  if (scorePercentage >= 90) {
    evalComment = isRTL
      ? "ممتاز! أداء استثنائي يوضح استيعاباً قوياً وشاملاً للمادة العلمية. أنت مؤهل وجاهز تماماً للانتقال للمستوى التالي."
      : "Excellent! Outstanding performance indicating a strong grasp of the material. You are well-prepared to move forward.";
    evalBullets = isRTL ? [
      "انتقل إلى الموديول التالي بثقة كاملة.",
      "استكشف الموضوعات المتقدمة والمراجع الإضافية لتعميق فهمك.",
      "ساعد زملاءك الذين قد يواجهون صعوبة في هذه المفاهيم."
    ] : [
      "Proceed to the next module with confidence.",
      "Consider exploring advanced topics or supplementary materials for deeper understanding.",
      "Help peers who might be struggling with these concepts."
    ];
  } else if (scorePercentage >= 75) {
    evalComment = isRTL
      ? "أحسنت! لديك فهم جيد جداً لمعظم المفاهيم، مع وجود بعض النقاط البسيطة التي تتطلب المراجعة."
      : "Good job! You have a solid understanding of most concepts, but there is some room for improvement.";
    evalBullets = isRTL ? [
      "راجع الموضوعات المحددة للأسئلة التي أجبت عليها بشكل خاطئ.",
      "ألقِ نظرة سريعة على المواد الأساسية لترسيخ معلوماتك.",
      "أجرِ مزيداً من الأسئلة التدريبية للتأكد من إتقانك الكامل."
    ] : [
      "Review the specific topics corresponding to the questions you answered incorrectly.",
      "Take a quick look at the core study materials to solidify your knowledge.",
      "Try a few more practice quizzes to ensure complete mastery."
    ];
  } else if (scorePercentage >= 50) {
    evalComment = isRTL
      ? "أداء متوسط. لقد استوعبت بعض المفاهيم الأساسية، ولكن لا تزال هناك فجوات معرفية تحتاج إلى معالجة."
      : "Fair performance. You have grasped some concepts, but foundational gaps remain that need to be addressed.";
    evalBullets = isRTL ? [
      "أعد مراجعة المحاضرات ومقاطع الفيديو الأساسية لهذا الموديول.",
      "استفد من الموارد الإضافية وبنك الأسئلة في الأكاديمية للتدرب.",
      "أعد إجراء هذا التقييم بعد المراجعة لضمان تحسن مستواك."
    ] : [
      "Revisit the primary lecture notes and videos for this module.",
      "Utilize the Triple S Academy supplementary resources and practice quizzes.",
      "Re-take this assessment after reviewing to ensure improvement."
    ];
  } else {
    evalComment = isRTL
      ? "بناءً على هذا التقييم الذاتي، تحتاج المفاهيم الأساسية إلى مراجعة شاملة. نوصي بشدة بالعودة لدراسة المواد الأساسية في موديولات الأكاديمية قبل المحاولة مرة أخرى."
      : "Based on this self-assessment, the foundational concepts evaluated require further review. It is highly recommended to revisit the core study materials provided in the Triple S Academy modules before attempting the assessment again.";
    evalBullets = isRTL ? [
      "راجع ملاحظات المحاضرات الأساسية الخاصة بالموضوعات التي أخطأت فيها.",
      "استفد من شروحات الإجابات ومصادر الأكاديمية الإضافية.",
      "تواصل مع المشرف الأكاديمي إذا كانت بعض المفاهيم غير واضحة."
    ] : [
      "Review the primary lecture notes corresponding to the incorrectly answered topics.",
      "Utilize the Triple S Academy supplementary resources and practice quizzes.",
      "Schedule a brief consultation with your academic advisor if concepts remain unclear."
    ];
  }

  return (
    <div className="flex flex-col h-screen bg-background font-sans overflow-hidden print:overflow-visible print:bg-white" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* 👑 Global Header */}
      <header className="h-16 flex-shrink-0 bg-surface border-b border-outline-variant/30 flex items-center justify-between px-4 sm:px-6 relative z-30 shadow-sm print:hidden">
        <div className="flex items-center gap-4">
          <div className="h-6 w-px bg-outline-variant/30 hidden sm:block"></div>
          <h1 className="text-sm font-bold text-on-surface-variant line-clamp-1">
            {type === 'qbank' ? t('student.dashboard.questionsBank', 'بنك الأسئلة (Q-Bank)') : t('student.dashboard.selfAssessment', 'التقييم الذاتي (Self Assessment)')}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center gap-2 bg-surface-container hover:bg-surface-container-high text-on-surface py-2 px-4 rounded-xl text-xs font-bold transition-colors shadow-sm"
          >
            <ArrowRight size={16} className={!isRTL ? 'rotate-180' : ''} />
            {t('moduleQuiz.backToModule', 'العودة للموديول')}
          </button>
        </div>
      </header>

      {/* 🚀 Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative print:overflow-visible">
        
        {/* 📚 Sidebar (Lesson List) - Hidden on mobile, toggleable */}
        <aside className="w-full lg:w-80 h-full bg-surface border-l border-outline-variant/30 flex flex-col hidden lg:flex flex-shrink-0 shadow-lg relative z-20 print:hidden">
          <div className="p-5 border-b border-outline-variant/20 bg-surface/50 sticky top-0 z-10 backdrop-blur-md">
            <h2 className="font-extrabold text-lg text-on-surface flex items-center gap-2">
              <HelpCircle size={20} className="text-primary" /> {t('moduleQuiz.questionsList', 'قائمة الأسئلة')}
            </h2>
            <div className="mt-4 bg-surface-container-low rounded-full h-2 overflow-hidden shadow-inner flex">
              {(type === 'sa' && !isFinished) ? (
                <div 
                  className="h-full bg-primary transition-all duration-500 ease-out" 
                  style={{ width: `${(Object.keys(answers).length / questions.length) * 100}%` }}
                ></div>
              ) : (
                <>
                  <div 
                    className="h-full bg-emerald-500 transition-all duration-500 ease-out" 
                    style={{ width: `${(questions.filter(q => answers[q.id] === q.correct_answer).length / questions.length) * 100}%` }}
                  ></div>
                  <div 
                    className="h-full bg-rose-500 transition-all duration-500 ease-out" 
                    style={{ width: `${(questions.filter(q => answers[q.id] && answers[q.id] !== q.correct_answer).length / questions.length) * 100}%` }}
                  ></div>
                </>
              )}
            </div>
            <p className="text-xs font-bold text-on-surface-variant mt-3 flex justify-between">
              <span>{t('moduleQuiz.totalAnswers', 'إجمالي الإجابات:')} {Object.keys(answers).length} / {questions.length}</span>
              {(!type || type === 'qbank' || isFinished) && (
                <span className="text-emerald-500">{t('moduleQuiz.correctAnswers', 'صحيحة:')} {questions.filter(q => answers[q.id] === q.correct_answer).length}</span>
              )}
            </p>
          </div>

          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-surface/30">
            <div className="grid grid-cols-5 gap-3" dir="ltr">
              {questions.map((q, idx) => {
                const isActive = idx === currentQuestionIdx;
                const isAns = answers[q.id] !== undefined;
                const isCorr = answers[q.id] === q.correct_answer;
                
                let btnClass = "bg-surface-container-low text-on-surface hover:bg-surface-container-highest border border-outline-variant/30";
                if (isActive && !showReport) {
                  btnClass = "bg-primary text-white font-black shadow-md scale-110 border-primary ring-2 ring-primary/30 z-10";
                } else if (isAns) {
                  if (type === 'sa' && !isFinished) {
                    btnClass = "bg-primary/20 text-primary border-primary/40 font-bold hover:bg-primary/30";
                  } else if (isCorr) {
                    btnClass = "bg-emerald-100 text-emerald-800 border-emerald-300 font-bold hover:bg-emerald-200";
                  } else {
                    btnClass = "bg-rose-100 text-rose-800 border-rose-300 font-bold hover:bg-rose-200";
                  }
                }
                
                return (
                  <button
                    key={q.id}
                    onClick={() => {
                      setCurrentQuestionIdx(idx);
                      setShowReport(false);
                    }}
                    className={`h-12 w-full rounded-xl flex flex-col items-center justify-center text-sm transition-all cursor-pointer relative ${btnClass}`}
                    title={q.question_text}
                  >
                    <span>{idx + 1}</span>
                    {isAns && (!isActive || showReport) && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-surface shadow-sm flex items-center justify-center">
                         {(type === 'sa' && !isFinished) 
                           ? <span className="w-2 h-2 rounded-full bg-primary" /> 
                           : (isCorr ? <CheckCircle size={10} className="text-emerald-500" /> : <span className="text-[10px] text-rose-500 font-black leading-none">×</span>)
                         }
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        {/* 🎬 Main Area (Question Display or Report) */}
        <div className="flex-1 h-full overflow-y-auto custom-scrollbar flex flex-col relative z-10 print:overflow-visible">
          
          {showReport ? (
            <div className="w-full max-w-4xl mx-auto bg-white p-6 sm:p-10 print:p-0 min-h-screen print:min-h-0 text-slate-900 flex flex-col animate-in fade-in slide-in-from-bottom-4 ">
              <style type="text/css" media="print">
                {`
                  @page { size: auto; margin: 0mm; }
                  body { margin-top: 10mm; margin-bottom: 10mm; margin-left: 10mm; margin-right: 10mm; }
                `}
              </style>
              
              {/* Top Header */}
              <div className="flex justify-between items-end mb-8 print:mb-4 border-b-4 border-primary pb-4 mt-8 print:mt-0">
                <div className="flex items-center gap-3">
                   <div className="w-12 h-12 print:w-8 print:h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold text-2xl print:text-lg shrink-0">
                     <img src="/logo.png" alt="" />
                   </div>
                   <div className="flex flex-col">
                     <span className="text-2xl print:text-lg font-black text-primary leading-none tracking-tight">Triple S</span>
                     <span className="text-2xl print:text-lg font-black text-primary leading-none tracking-tight">Academy</span>
                   </div>
                </div>
              </div>

              {/* Main Titles */}
              <div className="text-center mb-10 print:mb-4">
                <h1 className="text-3xl sm:text-5xl print:text-3xl font-black text-slate-900 mb-2 print:mb-1 tracking-tight">
                  {t('moduleQuiz.reportTitle', 'نتيجة التقييم الذاتي')}
                </h1>
                <p className="text-slate-500 font-medium text-base sm:text-lg print:text-sm">
                  {t('moduleQuiz.reportSubtitle', 'التقييم الرسمي لأداء الطالب')}
                </p>
              </div>

              {/* Student Info */}
              <div className="flex bg-[#f8f5ff] rounded-xl mb-10 print:mb-6 relative overflow-hidden" dir={isRTL ? 'rtl' : 'ltr'}>
                <div className="absolute left-0 rtl:left-auto rtl:right-0 top-0 bottom-0 w-2 bg-primary"></div>
                <div className="grid grid-cols-1 sm:grid-cols-3 w-full p-6 print:p-4 pl-8 rtl:pl-4 rtl:pr-8 print:pl-6 gap-6 sm:gap-4 print:gap-2">
                   <div>
                     <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest mb-1 print:mb-0.5">{t('moduleQuiz.studentName', 'اسم الطالب')}</p>
                     <p className="text-lg print:text-sm font-black text-slate-800 leading-none">{user?.name}</p>
                   </div>
                   <div>
                     <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest mb-1 print:mb-0.5">{t('moduleQuiz.email', 'البريد الإلكتروني')}</p>
                     <p className="text-lg print:text-sm font-black text-slate-800 leading-none">{user?.email}</p>
                   </div>
                   <div>
                     <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest mb-1 print:mb-0.5">{t('moduleQuiz.date', 'تاريخ الاختبار')}</p>
                     <p className="text-lg print:text-sm font-black text-slate-800 leading-none">{new Date().toLocaleDateString(isRTL ? 'ar-EG' : 'en-US')}</p>
                   </div>
                </div>
              </div>

              {/* Score & Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-10 print:gap-4 mb-12 print:mb-6 p-8 print:p-4 border border-slate-100 rounded-[2rem] shadow-sm" dir="ltr">
                 
                 {/* Circle */}
                 <div className="md:col-span-5 flex justify-center items-center">
                    <div className="w-56 h-56 print:w-36 print:h-36 rounded-full border-[16px] print:border-[10px] border-slate-50 flex items-center justify-center relative">
                       <svg viewBox="0 0 224 224" className="absolute inset-0 w-full h-full transform -rotate-90">
                          <circle cx="112" cy="112" r="96" stroke="currentColor" strokeWidth="16" fill="transparent" className="text-primary" strokeDasharray="603" strokeDashoffset={603 - (603 * scorePercentage) / 100} strokeLinecap="round" />
                       </svg>
                       <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-2 print:-mt-1 w-4 h-4 print:w-3 print:h-3 bg-primary rounded-full"></div>
                       <span className="text-5xl print:text-3xl font-black text-primary">{scorePercentage}%</span>
                    </div>
                 </div>

                 {/* Cards */}
                 <div className="md:col-span-7 flex flex-col justify-center gap-5 print:gap-3" dir={isRTL ? 'rtl' : 'ltr'}>
                    <div className="flex items-center justify-between bg-[#f0fdf4] border-2 border-[#bbf7d0] rounded-2xl p-6 print:p-4">
                       <span className="text-sm print:text-xs font-extrabold text-[#16a34a] uppercase tracking-widest">{t('moduleQuiz.correctAnswersCount', 'الإجابات الصحيحة')}</span>
                       <span className="text-5xl print:text-3xl font-black text-[#14532d] leading-none font-mono">{correctCount}</span>
                    </div>
                    <div className="flex items-center justify-between bg-[#fff1f2] border-2 border-[#fecdd3] rounded-2xl p-6 print:p-4">
                       <span className="text-sm print:text-xs font-extrabold text-[#e11d48] uppercase tracking-widest">{t('moduleQuiz.incorrectAnswersCount', 'الإجابات الخاطئة')}</span>
                       <span className="text-5xl print:text-3xl font-black text-[#be123c] leading-none font-mono">{Object.keys(answers).length - correctCount}</span>
                    </div>
                 </div>
              </div>

              {/* Comments section */}
              <div className="mb-12 print:mb-4" dir={isRTL ? 'rtl' : 'ltr'}>
                <h3 className="text-xl print:text-lg font-black text-slate-800 flex items-center gap-3 print:gap-2 mb-4 print:mb-2">
                  <span className="flex items-center justify-center w-6 h-6 print:w-5 print:h-5 rounded-full border-2 border-primary text-primary font-bold text-sm print:text-xs">i</span> 
                  {t('moduleQuiz.evaluatorComments', 'ملاحظات وتوصيات التقييم')}
                </h3>
                <p className="text-slate-600 print:text-xs leading-relaxed mb-4 print:mb-2 font-medium">
                  {evalComment}
                </p>
                <ul className="list-disc list-outside text-slate-600 print:text-xs space-y-3 print:space-y-1 mx-5 font-medium marker:text-primary">
                  {evalBullets.map((bullet, idx) => (
                    <li key={idx}>{bullet}</li>
                  ))}
                </ul>
              </div>


              {/* Print Buttons (Hidden on Print) */}
              <div className="flex gap-4 print:hidden justify-center mt-10 mb-9" dir="auto">
                <button 
                  onClick={() => setShowReport(false)}
                  className="px-8 py-3 bg-white border-2 border-primary text-primary hover:bg-primary/5 rounded-xl font-bold transition-all shadow-sm"
                >
                  {t('moduleQuiz.reviewAnswers', 'مراجعة الإجابات')}
                </button>
                <button 
                  onClick={() => window.print()}
                  className="px-8 flex items-center justify-center gap-2 py-3 bg-primary text-white rounded-xl font-bold shadow-md hover:bg-primary-hover transition-all"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9V2h12v7"></path><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
                  {t('moduleQuiz.print', 'طباعة التقرير')}
                </button>
              </div>

            </div>
          ) : (
          <div >
            
            <div className="p-6 sm:p-10  flex-1">
              
              {/* Question Header */}
              <div className="mb-8 border-b border-outline-variant/20 pb-6">
                <div className="flex items-center justify-between mb-5">
                  <span className="px-3 py-1.5 bg-surface-container-lowest text-on-surface-variant rounded-md text-xs font-bold border border-outline-variant/30 tracking-wider">
                    {t('moduleQuiz.question', 'السؤال')} {currentQuestionIdx + 1} {t('moduleQuiz.of', 'من')} {questions.length}
                  </span>
                </div>
                <h2 className="text-xl  font-bold text-on-surface leading-relaxed tracking-tight" dir="auto">
                  {currentQ.question_text}
                </h2>
              </div>

              {/* Options */}
              <div className="space-y-4" dir="auto">
                {parsedOptions.map((opt, i) => {
                  const optText = typeof opt === 'object' && opt !== null ? opt.text : opt;
                  const optionLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
                  const letter = (typeof opt === 'object' && opt !== null && opt.id) ? opt.id : (optionLetters[i] || (i + 1));
                  const isSelected = answers[currentQ.id] === optText;
                  const isCorrectOpt = (typeof opt === 'object' && opt !== null && opt.isCorrect) || currentQ.correct_answer === optText;
                  
                  let optClass = "bg-surface-container-lowest border-outline-variant/30 hover:border-outline-variant hover:bg-surface-container-low text-on-surface";
                  
                  if (revealed) {
                    if (isCorrectOpt) {
                      optClass = "bg-emerald-50/50 border-emerald-400 text-emerald-900 shadow-sm ring-1 ring-emerald-400/20";
                    } else if (isSelected && !isCorrectOpt) {
                      optClass = "bg-rose-50/50 border-rose-300 text-rose-900 shadow-sm";
                    } else {
                      optClass = "bg-transparent border-outline-variant/20 text-on-surface-variant opacity-60";
                    }
                  } else if (isSelected) {
                    optClass = "bg-primary/5 border-primary/50 text-primary shadow-sm";
                  }

                  return (
                    <button
                      key={i}
                      disabled={revealed}
                      onClick={() => handleOptionSelect(currentQ.id, optText)}
                      className={`w-full text-start p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-4 group ${optClass}`}
                    >
                      <div className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center shrink-0 font-bold text-sm transition-colors ${
                        revealed && isCorrectOpt ? 'border-emerald-500 bg-emerald-500 text-white' :
                        revealed && isSelected && !isCorrectOpt ? 'border-rose-500 bg-rose-500 text-white' :
                        isSelected ? 'border-primary bg-primary text-white' : 'border-outline-variant/30 bg-surface text-on-surface-variant group-hover:border-outline-variant group-hover:text-on-surface'
                      }`}>
                        {revealed && isCorrectOpt ? <CheckCircle size={16} /> : 
                         revealed && isSelected && !isCorrectOpt ? 'X' : 
                         letter}
                      </div>
                      
                      <div className="flex-1 pt-1">
                        <span className={`text-base font-medium leading-relaxed block ${revealed && isSelected && !isCorrectOpt ? 'line-through text-rose-700/70' : ''}`}>
                          {optText}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
              {/* Explanation Box */}
              {revealed && currentQ.explanation && (
                <div className="mt-10 p-6 bg-surface-container-low rounded-2xl border border-outline-variant/30 shadow-sm animate-in fade-in slide-in-from-top-4 flex gap-5 items-start relative overflow-hidden" dir="auto">
                  <div className="absolute top-0 right-0 w-1.5 h-full bg-secondary"></div>
                  <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center shrink-0">
                    <BookOpen size={20} className="text-secondary" />
                  </div>
                  <div className="flex-1">
                    <strong className="block mb-2 text-on-surface font-extrabold text-sm uppercase tracking-wide">
                      {t('moduleQuiz.explanationTitle', 'شرح الإجابة (Explanation)')}
                    </strong>
                    <p className="text-on-surface-variant text-base leading-loose">
                      {currentQ.explanation}
                    </p>
                  </div>
                </div>
              )}
              {/* Image (Moved below explanation) */}
              {currentQ.image && (
                <div className="mt-10 rounded-2xl overflow-hidden border border-outline-variant/20 shadow-sm max-w-2xl mx-auto">
                  <img 
                    src={currentQ.image.startsWith('http') ? getFileUrl(currentQ.image)  : getFileUrl(currentQ.image)} 
                    alt="Question" 
                    className="w-full h-auto object-cover"
                  />
                </div>
              )}
            </div>
            
            {/* Bottom Nav */}
            <div className="flex justify-between items-center mb-8 px-2 mt-2">
              <button
                disabled={currentQuestionIdx === 0}
                onClick={() => setCurrentQuestionIdx(prev => Math.max(0, prev - 1))}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-surface border border-outline-variant/40 text-on-surface font-bold hover:bg-surface-container disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                <ChevronRight size={18} className={!isRTL ? 'rotate-180' : ''} />
                {t('moduleQuiz.previous', 'السابق')}
              </button>
              
              {type === 'sa' && !isFinished && currentQuestionIdx === questions.length - 1 ? (
                <button
                  onClick={handleFinishSA}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-error text-white font-bold hover:bg-error-hover transition-all shadow-md animate-pulse"
                >
                  <CheckCircle size={18} />
                  {t('moduleQuiz.finishAssessment', 'إنهاء التقييم')}
                </button>
              ) : (
                <button
                  disabled={currentQuestionIdx === questions.length - 1}
                  onClick={() => setCurrentQuestionIdx(prev => Math.min(questions.length - 1, prev + 1))}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white font-bold hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
                >
                  {t('moduleQuiz.next', 'التالي')}
                  <ChevronLeft size={18} className={!isRTL ? 'rotate-180' : ''} />
                </button>
              )}
            </div>

          </div>
          )}
        </div>
      </div>
    </div>
  );
}
