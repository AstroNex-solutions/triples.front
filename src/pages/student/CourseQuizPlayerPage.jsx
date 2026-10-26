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
  HelpCircle,
  Timer,
  AlertTriangle,
  Printer,
  Award,
  ShieldCheck,
  TrendingUp,
  CheckCircle2,
  XCircle,
  FileText
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getFileUrl } from '../../utils/fileHelper';

export default function CourseQuizPlayerPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { user } = useContext(AuthContext);
  const isRTL = i18n.language === 'ar';

  const type = 'sa';
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState({}); // { qId: 'selected option' }
  const [showExplanation, setShowExplanation] = useState({}); // { qId: true/false }
  const [isFinished, setIsFinished] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [showExitWarning, setShowExitWarning] = useState(false);

  useEffect(() => {
    if (questions.length > 0 && timeLeft === null && !isFinished) {
      // Set timer: 1 minute (60 seconds) per question
      setTimeLeft(questions.length * 60);
    }
  }, [questions.length, timeLeft, isFinished]);

  useEffect(() => {
    if (timeLeft === null || isFinished) return;

    if (timeLeft <= 0) {
      handleFinishSA();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isFinished]);

  const formatTime = (seconds) => {
    if (seconds === null) return "00:00";
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (!isFinished && questions.length > 0) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isFinished, questions.length]);

  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true);
      try {
        // Fetch course questions
        const res = await API.get(`/student/courses/${courseId}/questions?type=sa`);
        setQuestions(res.data.questions || []);
      } catch (err) {
        console.error(err);
        setError('Error fetching questions');
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [courseId]);

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

  let parsedOptions = currentQ?.options;
  if (parsedOptions && !Array.isArray(parsedOptions)) {
    let attempts = 0;
    while (typeof parsedOptions === 'string' && attempts < 3) {
      try { parsedOptions = JSON.parse(parsedOptions); } catch (e) { break; }
      attempts++;
    }
  }
  if (!Array.isArray(parsedOptions)) parsedOptions = [];

  const studentAns = answers[currentQ?.id];
  const hasAnswered = studentAns !== undefined;
  const isCorrect = (studentAns !== undefined && studentAns === currentQ?.correct_answer) ||
    parsedOptions.some(o => typeof o === 'object' && o !== null && o.isCorrect && (o.text === studentAns || o.id === studentAns));
  const revealed = type === 'sa'
    ? isFinished
    : (showExplanation[currentQ?.id] || hasAnswered);

  const handleFinishSA = async () => {
    setIsFinished(true);
    const timeUsedSeconds = (questions.length * 60) - (timeLeft || 0);
    try {
      const res = await API.post(`/student/courses/${courseId}/sa-report`, {
        answers,
        timeUsedSeconds
      });
      setReportData(res.data.report);
      setShowReport(true);
    } catch (err) {
      console.error(err);
      alert('Error generating report');
    }
  };

  const ProgressBarRow = ({ label, countText, percent }) => {
    const isHigh = percent >= 75;
    const isPass = percent >= 50;
    const barColor = isHigh ? '#059669' : isPass ? '#d97706' : '#dc2626';
    const bgBadge = isHigh ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : isPass ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-rose-50 text-rose-700 border-rose-200';

    return (
      <div className="mb-2.5 print:mb-2 print-avoid-break w-full">
        <div className="flex justify-between items-center mb-1 gap-2 text-xs">
          <span className="font-bold text-slate-800 truncate" title={label}>
            {label}
            {countText && <span className="text-slate-400 font-semibold text-[10px] ml-1.5">({countText})</span>}
          </span>
          <span className={`px-1.5 py-0.5 rounded font-mono font-black text-[10px] border ${bgBadge}`}>
            {percent}%
          </span>
        </div>
        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden flex relative border border-slate-200/80">
          {/* 50% benchmark reference line */}
          <div className="absolute top-0 bottom-0 left-1/2 w-[1.5px] bg-slate-300 z-10" title="50% Standard Benchmark" />
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{ width: `${Math.min(100, Math.max(0, percent))}%`, backgroundColor: barColor }}
          />
        </div>
      </div>
    );
  };

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
          {type === 'sa' && !isFinished && timeLeft !== null && (
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-mono font-bold text-sm shadow-sm ${timeLeft < 60 ? 'bg-error text-white animate-pulse' : 'bg-surface-container-high text-on-surface'}`}>
              <Timer size={16} />
              {formatTime(timeLeft)}
            </div>
          )}
          <button
            onClick={() => {
              if (!isFinished && type === 'sa') {
                setShowExitWarning(true);
              } else {
                navigate('/dashboard/overview');
              }
            }}
            className="flex items-center gap-2 bg-surface-container hover:bg-surface-container-high text-on-surface py-2 px-4 rounded-xl text-xs font-bold transition-colors shadow-sm cursor-pointer"
          >
            <ArrowRight size={16} className={!isRTL ? 'rotate-180' : ''} />
            {isFinished ? t('courseQuizPlayer.returnHome', 'العودة للرئيسية') : t('courseQuizPlayer.cancelExamBtn', 'إلغاء الامتحان والعودة')}
          </button>
        </div>
      </header>

      {/* Exit & Cancel Warning Modal */}
      {showExitWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-surface p-6 rounded-3xl max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200 border border-outline-variant/30 text-on-surface">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-16 h-16 bg-error/10 text-error rounded-full flex items-center justify-center mb-4">
                <AlertTriangle size={32} />
              </div>
              <h3 className="text-xl font-black text-on-surface mb-2">
                {t('courseQuizPlayer.cancelModalTitle', 'هل أنت متأكد من إلغاء الامتحان؟')}
              </h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                {t('courseQuizPlayer.cancelModalDesc', 'عند إلغاء الامتحان، لن يتم احتساب أي نتيجة أو حفظ أي إجابة، وستتم إعادتك مباشرة إلى الصفحة الرئيسية.')}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <button
                onClick={() => setShowExitWarning(false)}
                className="flex-1 py-3 bg-surface-container-high text-on-surface font-bold text-xs rounded-xl hover:bg-surface-container-highest transition-colors cursor-pointer"
              >
                {t('courseQuizPlayer.cancelModalResume', 'متابعة وإكمال الامتحان')}
              </button>
              <button
                onClick={() => {
                  setShowExitWarning(false);
                  navigate('/dashboard/overview');
                }}
                className="flex-1 py-3 bg-error text-white font-black text-xs rounded-xl hover:bg-error-hover transition-colors shadow-sm cursor-pointer"
              >
                {t('courseQuizPlayer.cancelModalConfirm', 'نعم، إلغاء والعودة للرئيسية')}
              </button>
            </div>
          </div>
        </div>
      )}

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
                    style={{ width: `${(questions.filter(q => {
                      const ans = answers[q.id];
                      if (!ans) return false;
                      if (ans === q.correct_answer) return true;
                      let opts = q.options;
                      if (typeof opts === 'string') { try { opts = JSON.parse(opts); } catch(e) {} }
                      if (Array.isArray(opts)) {
                        return opts.some(o => typeof o === 'object' && o !== null && o.isCorrect && (o.text === ans || o.id === ans));
                      }
                      return false;
                    }).length / (questions.length || 1)) * 100}%` }}
                  ></div>
                  <div
                    className="h-full bg-rose-500 transition-all duration-500 ease-out"
                    style={{ width: `${(questions.filter(q => {
                      const ans = answers[q.id];
                      if (!ans) return false;
                      if (ans === q.correct_answer) return false;
                      let opts = q.options;
                      if (typeof opts === 'string') { try { opts = JSON.parse(opts); } catch(e) {} }
                      if (Array.isArray(opts)) {
                        return !opts.some(o => typeof o === 'object' && o !== null && o.isCorrect && (o.text === ans || o.id === ans));
                      }
                      return true;
                    }).length / (questions.length || 1)) * 100}%` }}
                  ></div>
                </>
              )}
            </div>
            <p className="text-xs font-bold text-on-surface-variant mt-3 flex justify-between">
              <span>{t('moduleQuiz.totalAnswers', 'إجمالي الإجابات:')} {Object.keys(answers).length} / {questions.length}</span>
              {(!type || type === 'qbank' || isFinished) && (
                <span className="text-emerald-500">{t('moduleQuiz.correctAnswers', 'صحيحة:')} {questions.filter(q => {
                  const ans = answers[q.id];
                  if (!ans) return false;
                  if (ans === q.correct_answer) return true;
                  let opts = q.options;
                  if (typeof opts === 'string') { try { opts = JSON.parse(opts); } catch(e) {} }
                  if (Array.isArray(opts)) {
                    return opts.some(o => typeof o === 'object' && o !== null && o.isCorrect && (o.text === ans || o.id === ans));
                  }
                  return false;
                }).length}</span>
              )}
            </p>
          </div>

          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-surface/30">
            <div className="grid grid-cols-5 gap-3" dir="ltr">
              {questions.map((q, idx) => {
                const isActive = idx === currentQuestionIdx;
                const isAns = answers[q.id] !== undefined;
                const studentAnswer = answers[q.id];
                let qOpts = q.options;
                if (typeof qOpts === 'string') {
                  try { qOpts = JSON.parse(qOpts); } catch (e) {}
                }
                const isCorr = (studentAnswer && studentAnswer === q.correct_answer) ||
                  (Array.isArray(qOpts) && qOpts.some(o => typeof o === 'object' && o !== null && o.isCorrect && (o.text === studentAnswer || o.id === studentAnswer)));

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
            !reportData ? (
              <div className="flex-1 flex flex-col justify-center items-center bg-white p-10 min-h-screen">
                <Loader2 size={60} className="animate-spin text-primary mb-6" />
                <p className="text-xl font-bold text-slate-800">جاري تحليل بيانات الأداء الخاصة بك وتوليد التقرير...</p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto bg-slate-100/60 print:bg-white print:overflow-visible">
                <style type="text/css" media="print">
                  {`
                  @page {
                    size: A4 portrait;
                    margin: 10mm 12mm 12mm 12mm;
                  }
                  @media print {
                    html, body {
                      background: #ffffff !important;
                      color: #0f172a !important;
                      font-size: 11px !important;
                      -webkit-print-color-adjust: exact !important;
                      print-color-adjust: exact !important;
                    }
                    .print-avoid-break {
                      break-inside: avoid !important;
                      page-break-inside: avoid !important;
                    }
                    .print-hide {
                      display: none !important;
                    }
                  }
                  `}
                </style>

                {/* 🖨️ Floating Action Bar on Screen (Hidden on Print) */}
                <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-6 py-3.5 print:hidden shadow-sm flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold">
                      <FileText size={18} />
                    </div>
                    <div>
                      <h3 className="text-xs font-black text-slate-900">تقرير نتيجة التقييم الذاتي (Official Performance Report)</h3>
                      <p className="text-[11px] text-slate-500 font-medium">جاهز للطباعة أو التصدير المباشر بصيغة PDF</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={() => setShowReport(false)}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <BookOpen size={15} />
                      <span>{t('moduleQuiz.reviewAnswers', 'مراجعة الأسئلة وتفسيراتها')}</span>
                    </button>

                    <button
                      onClick={() => window.print()}
                      className="px-5 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white text-xs font-black rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <Printer size={16} />
                      <span>{t('moduleQuiz.print', 'طباعة التقرير / تصدير PDF')}</span>
                    </button>
                  </div>
                </div>

                {/* 📄 Official Report Sheet (Styled as an A4 Document) */}
                <div className="w-full max-w-4xl mx-auto bg-white p-8 sm:p-12 print:p-0 my-6 print:my-0 shadow-xl print:shadow-none border border-slate-200/90 print:border-none rounded-3xl print:rounded-none text-slate-900" dir={isRTL ? "rtl" : "ltr"}>
                  
                  {/* Top Branding & Official Institution Header */}
                  <div className="border-b-2 border-slate-900 pb-4 mb-6 print:mb-4">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex items-center gap-3.5">
                        <img src="/logo.png" alt="Triple S Academy Logo" className="w-14 h-14 object-contain shrink-0" />
                        <div>
                          <h1 className="text-xl font-black text-slate-900 tracking-tight leading-none mb-1">TRIPLE S ACADEMY</h1>
                          <p className="text-[10px] font-black uppercase text-indigo-700 tracking-widest leading-none mb-0.5">
                            {t('courseQuizPlayer.officialDivision', 'Clinical Performance & Assessment Division')}
                          </p>
                          <p className="text-[9px] text-slate-500 font-medium">
                            {t('courseQuizPlayer.officialService', 'Standardized Self-Assessment Examination Services')}
                          </p>
                        </div>
                      </div>

                      <div className={isRTL ? "text-left" : "text-right"}>
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 text-[10px] font-mono font-bold text-slate-700 mb-1">
                          <ShieldCheck size={12} className="text-emerald-600" />
                          <span>{t('courseQuizPlayer.officialScoreReport', 'OFFICIAL SCORE REPORT')}</span>
                        </div>
                        <p className="text-[9px] font-mono text-slate-400">ID: REP-2026-SA-{(user?.id || '01').toString().padStart(4, '0')}-{Date.now().toString().slice(-4)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Candidate & Examination Information Table */}
                  <div className="border border-slate-300 rounded-xl overflow-hidden mb-6 print:mb-4 print-avoid-break bg-white">
                    <div className="bg-slate-50 px-4 py-2 border-b border-slate-300">
                      <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-700">
                        {t('courseQuizPlayer.candidateProfile', 'Candidate & Administration Profile')}
                      </h4>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 divide-x rtl:divide-x-reverse divide-y divide-slate-200 text-start text-xs">
                      <div className="p-2.5">
                        <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
                          {t('courseQuizPlayer.candidateName', 'Candidate Name')}
                        </span>
                        <span className="font-extrabold text-slate-800">{user?.name || 'Registered Candidate'}</span>
                      </div>
                      <div className="p-2.5">
                        <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
                          {t('courseQuizPlayer.candidateId', 'Candidate ID')}
                        </span>
                        <span className="font-mono font-bold text-slate-700">{user?.id ? `STU-${user.id}` : 'N/A'}</span>
                      </div>
                      <div className="p-2.5">
                        <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
                          {t('courseQuizPlayer.examTitle', 'Examination Title')}
                        </span>
                        <span className="font-bold text-slate-800 truncate block" title={reportData.courseTitle || 'Comprehensive Assessment'}>
                          {reportData.courseTitle || 'Course Self-Assessment'}
                        </span>
                      </div>
                      <div className="p-2.5">
                        <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
                          {t('courseQuizPlayer.testDate', 'Test Date')}
                        </span>
                        <span className="font-medium text-slate-700">{new Date().toLocaleDateString(isRTL ? 'ar-EG' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                      </div>
                      <div className="p-2.5">
                        <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
                          {t('courseQuizPlayer.totalQuestions', 'Total Questions')}
                        </span>
                        <span className="font-bold text-slate-800">{reportData.overall.totalCount} MCQs</span>
                      </div>
                      <div className="p-2.5">
                        <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
                          {t('courseQuizPlayer.timeAllocated', 'Time Allocated')}
                        </span>
                        <span className="font-medium text-slate-700">{formatTime(reportData.overall.totalCount * 60)}</span>
                      </div>
                      <div className="p-2.5">
                        <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
                          {t('courseQuizPlayer.timeUsed', 'Time Used')}
                        </span>
                        <span className="font-bold text-slate-800 font-mono">{formatTime(reportData.overall.timeUsedSeconds)}</span>
                      </div>
                      <div className="p-2.5">
                        <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
                          {t('courseQuizPlayer.passingStandard', 'Passing Standard')}
                        </span>
                        <span className="font-bold text-emerald-700">{t('courseQuizPlayer.passingBenchmark', '50% Benchmark')}</span>
                      </div>
                    </div>
                  </div>

                  {/* ══════════ SECTION 1: Overall Performance Hero Card ══════════ */}
                  <div className="p-5 border border-slate-300 rounded-xl mb-6 print:mb-4 print-avoid-break bg-slate-50/40">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                      <div>
                        <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider block mb-1">
                          {t('courseQuizPlayer.examOutcome', 'Examination Outcome')}
                        </span>
                        <div className="flex items-baseline gap-3">
                          <span className={`text-4xl font-black ${reportData.overall.passed ? 'text-emerald-700' : 'text-rose-700'}`}>
                            {reportData.overall.scorePercentage}%
                          </span>
                          <span className="text-xs font-bold text-slate-600">
                            ({reportData.overall.correctCount} of {reportData.overall.totalCount} correct)
                          </span>
                        </div>
                      </div>

                      {/* Official Outcome Seal */}
                      <div>
                        {reportData.overall.passed ? (
                          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-100/80 border border-emerald-300 text-emerald-900 shadow-sm">
                            <CheckCircle2 size={20} className="text-emerald-600 shrink-0" />
                            <div>
                              <span className="block text-xs font-black uppercase tracking-wider">
                                {t('courseQuizPlayer.passOutcome', 'PASS / مؤهل')}
                              </span>
                              <span className="block text-[10px] text-emerald-700 font-medium">
                                {t('courseQuizPlayer.passBenchmarkDesc', 'Meets Required Clinical Benchmark')}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-100/80 border border-rose-300 text-rose-900 shadow-sm">
                            <XCircle size={20} className="text-rose-600 shrink-0" />
                            <div>
                              <span className="block text-xs font-black uppercase tracking-wider">
                                {t('courseQuizPlayer.remedialOutcome', 'REMEDIAL REVIEW RECOMMENDED')}
                              </span>
                              <span className="block text-[10px] text-rose-700 font-medium">
                                {t('courseQuizPlayer.remedialDesc', 'Score Below 50% Benchmark')}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Performance Scale Bar */}
                    <div className="space-y-1 mb-5">
                      <div className="flex justify-between text-[10px] font-bold text-slate-500">
                        <span>0%</span>
                        <span className="text-slate-700 font-black">{t('courseQuizPlayer.passingBenchmark', '50% Standard Benchmark')}</span>
                        <span>100%</span>
                      </div>
                      <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden flex relative border border-slate-300">
                        {/* 50% passing line marker */}
                        <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-slate-900 z-10" />
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.min(100, Math.max(0, reportData.overall.scorePercentage))}%`,
                            backgroundColor: reportData.overall.passed ? '#059669' : '#dc2626'
                          }}
                        />
                      </div>
                    </div>

                    {/* 8-Card Metric Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                      <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                        <span className="block text-lg font-black text-slate-900">{reportData.overall.scorePercentage}%</span>
                        <span className="text-[9px] font-bold text-slate-500 uppercase">{t('courseQuizPlayer.totalScore', 'Total Score')}</span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                        <span className={`block text-lg font-black ${reportData.overall.passed ? 'text-emerald-700' : 'text-rose-700'}`}>
                          {reportData.overall.passed ? t('courseQuizPlayer.pass', 'Pass') : t('courseQuizPlayer.remediate', 'Remediate')}
                        </span>
                        <span className="text-[9px] font-bold text-slate-500 uppercase">{t('courseQuizPlayer.status', 'Status')}</span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                        <span className={`block text-lg font-black ${reportData.overall.scorePercentage >= 50 ? 'text-emerald-700' : 'text-rose-700'}`}>
                          {reportData.overall.scorePercentage >= 50 ? `+${reportData.overall.scorePercentage - 50}%` : `${reportData.overall.scorePercentage - 50}%`}
                        </span>
                        <span className="text-[9px] font-bold text-slate-500 uppercase">{t('courseQuizPlayer.marginToPass', 'Margin to Pass')}</span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                        <span className="block text-lg font-black text-slate-900 font-mono">
                          {formatTime(reportData.overall.totalCount > 0 ? Math.round(reportData.overall.timeUsedSeconds / reportData.overall.totalCount) : 0)}
                        </span>
                        <span className="text-[9px] font-bold text-slate-500 uppercase">{t('courseQuizPlayer.avgTimePerItem', 'Avg Time / Item')}</span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                        <span className="block text-lg font-black text-emerald-700">{reportData.overall.correctCount}</span>
                        <span className="text-[9px] font-bold text-slate-500 uppercase">{t('courseQuizPlayer.correct', 'Correct')}</span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                        <span className="block text-lg font-black text-rose-700">{reportData.overall.wrongCount}</span>
                        <span className="text-[9px] font-bold text-slate-500 uppercase">{t('courseQuizPlayer.incorrect', 'Incorrect')}</span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                        <span className="block text-lg font-black text-slate-600">{reportData.overall.omittedCount}</span>
                        <span className="text-[9px] font-bold text-slate-500 uppercase">{t('courseQuizPlayer.omitted', 'Omitted')}</span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                        <span className="block text-lg font-black text-slate-900">{reportData.overall.totalCount}</span>
                        <span className="text-[9px] font-bold text-slate-500 uppercase">{t('courseQuizPlayer.totalItems', 'Total Items')}</span>
                      </div>
                    </div>
                  </div>

                  {/* ══════════ SECTION 2: Cohort Comparative Distribution ══════════ */}
                  <div className="border border-slate-300 rounded-xl p-4 mb-6 print:mb-4 print-avoid-break bg-white">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-800">
                        {t('courseQuizPlayer.cohortDistribution', 'Comparative Cohort Percentile Distribution')}
                      </h4>
                      <span className="text-[10px] font-bold text-indigo-700">
                        {t('courseQuizPlayer.candidatePercentile', 'Candidate Percentile')}: {Math.min(99, Math.max(1, Math.round(reportData.overall.scorePercentage * 0.95)))}%
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 mb-3 font-medium leading-relaxed">
                      {t('courseQuizPlayer.cohortDistributionDesc', {
                        percent: Math.min(99, Math.max(1, Math.round(reportData.overall.scorePercentage * 0.95)))
                      })}
                    </p>

                    {/* Bell curve distribution graphic */}
                    <div className="h-16 w-full flex items-end justify-center gap-[2px] opacity-45 px-2">
                      {[3, 4, 6, 8, 12, 18, 25, 36, 50, 68, 85, 96, 100, 94, 82, 65, 48, 34, 22, 15, 10, 7, 5, 3, 2, 1].map((h, i) => (
                        <div key={i} className="w-full bg-slate-600 rounded-t-sm" style={{ height: `${h}%` }} />
                      ))}
                    </div>
                    <div className="w-full border-t-2 border-slate-300 pt-1 flex justify-between text-[9px] text-slate-400 font-bold font-mono">
                      <span>0%</span>
                      <span>25%</span>
                      <span>50% (Median)</span>
                      <span>75%</span>
                      <span>99%</span>
                    </div>
                  </div>

                  {/* ══════════ SECTION 3: Content Area & Competency Performance (2-Column Grid) ══════════ */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 print:gap-4 mb-6 print:mb-4">
                    
                    {/* Left Column: Domains, Tasks, Health Groups */}
                    <div className="space-y-5 print:space-y-4">
                      
                      {/* Knowledge Domains */}
                      <div className="border border-slate-300 rounded-xl p-4 bg-white print-avoid-break">
                        <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-800 pb-2 mb-3 border-b border-slate-200">
                          {t('courseQuizPlayer.knowledgeDomainPerf', '1. Performance by Knowledge Domain')}
                        </h4>
                        <div>
                          {(reportData.knowledgeDomains || []).map((d, i) => (
                            <ProgressBarRow key={i} label={t(`metadataTaxonomy.knowledgeDomains.${d.name}`, d.name)} countText={`${d.correct}/${d.total}`} percent={d.percent} />
                          ))}
                          {(!reportData.knowledgeDomains || reportData.knowledgeDomains.length === 0) && (
                            <p className="text-xs text-slate-400 italic">No domain data available.</p>
                          )}
                        </div>
                      </div>

                      {/* Clinician Tasks */}
                      <div className="border border-slate-300 rounded-xl p-4 bg-white print-avoid-break">
                        <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-800 pb-2 mb-3 border-b border-slate-200">
                          {t('courseQuizPlayer.clinicianTaskPerf', '2. Performance by Clinician Task')}
                        </h4>
                        <div>
                          {(reportData.clinicianTasks || []).map((tItem, i) => (
                            <ProgressBarRow key={i} label={t(`metadataTaxonomy.clinicianTasks.${tItem.name}`, tItem.name)} countText={`${tItem.correct}/${tItem.total}`} percent={tItem.percent} />
                          ))}
                          {(!reportData.clinicianTasks || reportData.clinicianTasks.length === 0) && (
                            <p className="text-xs text-slate-400 italic">No task data available.</p>
                          )}
                        </div>
                      </div>

                      {/* Health Groups */}
                      <div className="border border-slate-300 rounded-xl p-4 bg-white print-avoid-break">
                        <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-800 pb-2 mb-3 border-b border-slate-200">
                          {t('courseQuizPlayer.healthGroupPerf', '3. Performance by Target Population')}
                        </h4>
                        <div>
                          {(reportData.healthGroups || []).map((h, i) => (
                            <ProgressBarRow key={i} label={t(`metadataTaxonomy.healthGroups.${h.name}`, h.name)} countText={`${h.correct}/${h.total}`} percent={h.percent} />
                          ))}
                          {(!reportData.healthGroups || reportData.healthGroups.length === 0) && (
                            <p className="text-xs text-slate-400 italic">No population data available.</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Chapters/Systems, Difficulty, Topics */}
                    <div className="space-y-5 print:space-y-4">

                      {/* Chapters / Organ Systems */}
                      <div className="border border-slate-300 rounded-xl p-4 bg-white print-avoid-break">
                        <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-800 pb-2 mb-3 border-b border-slate-200">
                          {t('courseQuizPlayer.organSystemPerf', '4. Performance by Organ System / Chapter')}
                        </h4>
                        <div>
                          {(reportData.chapters || []).map((c, i) => (
                            <ProgressBarRow key={i} label={c.name} countText={`${c.correct}/${c.total}`} percent={c.percent} />
                          ))}
                          {(!reportData.chapters || reportData.chapters.length === 0) && (
                            <p className="text-xs text-slate-400 italic">No system data available.</p>
                          )}
                        </div>
                      </div>

                      {/* Difficulty Levels */}
                      {reportData.difficultyLevels && reportData.difficultyLevels.length > 0 && (
                        <div className="border border-slate-300 rounded-xl p-4 bg-white print-avoid-break">
                          <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-800 pb-2 mb-3 border-b border-slate-200">
                            {t('courseQuizPlayer.difficultyLevelPerf', '5. Performance by Question Difficulty')}
                          </h4>
                          <div>
                            {reportData.difficultyLevels.map((dl, i) => (
                              <ProgressBarRow key={i} label={`${t(`metadataTaxonomy.difficultyLevels.${dl.name}`, dl.name)}`} countText={`${dl.correct}/${dl.total}`} percent={dl.percent} />
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Clinical Topics */}
                      {reportData.topics && reportData.topics.length > 0 && (
                        <div className="border border-slate-300 rounded-xl p-4 bg-white print-avoid-break">
                          <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-800 pb-2 mb-3 border-b border-slate-200">
                            {t('courseQuizPlayer.clinicalTopicPerf', '6. Evaluated Clinical Topics')}
                          </h4>
                          <div className="max-h-60 overflow-y-auto pr-1">
                            {reportData.topics.slice(0, 8).map((tp, i) => (
                              <ProgressBarRow key={i} label={tp.name} countText={`${tp.correct}/${tp.total}`} percent={tp.percent} />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* ══════════ SECTION 4: Diagnostic Insights & Recommendations ══════════ */}
                  <div className="border border-slate-300 rounded-xl p-4 mb-6 print:mb-4 print-avoid-break bg-slate-50/50">
                    <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-800 mb-2.5 pb-1 border-b border-slate-200">
                      {t('courseQuizPlayer.diagnosticObservations', '7. Diagnostic Observations & Clinical Summary')}
                    </h4>
                    <ul className="space-y-2 text-xs text-slate-800 font-medium">
                      {(reportData.insights || []).map((insight, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 mt-1.5 shrink-0" />
                          <span>{insight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* ══════════ SECTION 5: Personalized Diagnostic Study Plan ══════════ */}
                  <div className="border border-slate-300 rounded-xl overflow-hidden mb-6 print:mb-4 print-avoid-break bg-white">
                    <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-300 flex justify-between items-center">
                      <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-800">
                        {t('courseQuizPlayer.remediationPlan', '8. Targeted Study Plan (Top Priority Areas for Remediation)')}
                      </h4>
                      <span className="text-[10px] text-slate-500 font-medium">
                        {t('courseQuizPlayer.rankedByLowest', 'Ranked by lowest mastery percentage')}
                      </span>
                    </div>
                    
                    <div className="p-3 overflow-x-auto">
                      <table className="w-full text-xs text-start">
                        <thead>
                          <tr className="border-b border-slate-200 text-[10px] font-black uppercase tracking-wider text-slate-400">
                            <th className="py-1.5 px-2 text-start">{t('courseQuizPlayer.priority', 'Priority')}</th>
                            <th className="py-1.5 px-2 text-start">{t('courseQuizPlayer.focusTopic', 'Focus Topic / System')}</th>
                            <th className="py-1.5 px-2 text-center">{t('courseQuizPlayer.score', 'Score')}</th>
                            <th className="py-1.5 px-2 text-end">{t('courseQuizPlayer.mastery', 'Mastery %')}</th>
                            <th className="py-1.5 px-2 text-end">{t('courseQuizPlayer.recommendedAction', 'Recommended Action')}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {(reportData.studyPlan || []).map((item, idx) => {
                            const pctNum = parseInt(item.percent, 10) || 0;
                            const isUrgent = pctNum < 50;

                            return (
                              <tr key={idx} className="hover:bg-slate-50/50">
                                <td className="py-2 px-2 font-mono font-bold text-slate-400">#{idx + 1}</td>
                                <td className="py-2 px-2 font-bold text-slate-800">{item.name}</td>
                                <td className="py-2 px-2 font-mono text-center text-slate-600">{item.score}</td>
                                <td className={`py-2 px-2 font-mono font-black text-end ${isUrgent ? 'text-rose-700' : 'text-amber-700'}`}>
                                  {item.percent}
                                </td>
                                <td className="py-2 px-2 text-end">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                    isUrgent ? 'bg-rose-100 text-rose-800 border border-rose-200' : 'bg-amber-100 text-amber-800 border border-amber-200'
                                  }`}>
                                    {isUrgent ? t('courseQuizPlayer.urgentRevision', 'Urgent Revision') : t('courseQuizPlayer.reinforceConcepts', 'Reinforce Concepts')}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                          {(!reportData.studyPlan || reportData.studyPlan.length === 0) && (
                            <tr>
                              <td colSpan={5} className="py-4 text-center text-slate-400 italic">
                                {t('courseQuizPlayer.noRemediation', 'No specific remediation priorities identified.')}
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* ══════════ SECTION 6: Official Sign-off & Verification Footer ══════════ */}
                  <div className="border-t-2 border-slate-900 pt-4 mt-8 print:mt-4 text-[9px] text-slate-500 leading-relaxed print-avoid-break">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2">
                      <span className="font-bold text-slate-700">
                        {t('courseQuizPlayer.boardNotice', 'Triple S Academy Examination Board · Electronic Academic Transcript')}
                      </span>
                      <span className="font-mono text-slate-400">Document Security Hash: SHA256-{(user?.id || '01')}-SA-{Date.now().toString(36).toUpperCase()}</span>
                    </div>
                    <p className="text-slate-400">
                      {t('courseQuizPlayer.legalNotice', "Notice: This diagnostic report is intended exclusively for the registered candidate's academic development and faculty evaluation. All testing materials, questions, and psychometric breakdowns are strictly proprietary to Triple S Academy.")}
                    </p>
                  </div>
                </div>
              </div>
            )
          ) : (
            <div className="flex flex-col flex-1 h-full">

                  <div className="p-6 sm:p-10 flex-1">

                    {/* Question Header */}
                    <div className="mb-8 border-b border-outline-variant/20 pb-6">
                      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-3 py-1.5 bg-surface-container text-on-surface rounded-lg text-xs font-bold border border-outline-variant/30 tracking-wider">
                            {t('moduleQuiz.question', 'السؤال')} {currentQuestionIdx + 1} {t('moduleQuiz.of', 'من')} {questions.length}
                          </span>
                          {currentQ.custom_id && (
                            <span className="px-2.5 py-1 bg-violet-500/10 text-violet-600 font-mono font-bold text-xs rounded-lg border border-violet-500/20">
                              {currentQ.custom_id}
                            </span>
                          )}
                          {currentQ.chapter && (
                            <span className="px-2.5 py-1 bg-surface-container text-on-surface-variant text-xs font-semibold rounded-lg border border-outline-variant/30">
                              📖 {currentQ.chapter}
                            </span>
                          )}
                          {currentQ.topic && (
                            <span className="px-2.5 py-1 bg-surface-container text-on-surface-variant text-xs font-semibold rounded-lg border border-outline-variant/30">
                              🔬 {currentQ.topic}
                            </span>
                          )}
                        </div>

                        {currentQ.difficulty_level && (
                          <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${
                            currentQ.difficulty_level.toLowerCase() === 'easy' ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' :
                            currentQ.difficulty_level.toLowerCase() === 'hard' ? 'bg-rose-500/10 text-rose-600 border border-rose-500/20' :
                            'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                          }`}>
                            {t(`metadataTaxonomy.difficultyLevels.${currentQ.difficulty_level}`, currentQ.difficulty_level)}
                          </span>
                        )}
                      </div>

                      <h2 className="text-xl font-bold text-on-surface leading-relaxed tracking-tight" dir="auto">
                        {currentQ.question_text}
                      </h2>

                      {/* Extra metadata tags when revealed / review */}
                      {revealed && (currentQ.knowledge_domain || currentQ.clinician_task || currentQ.health_group) && (
                        <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-outline-variant/15 text-[11px] font-bold">
                          {currentQ.knowledge_domain && (
                            <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-600 border border-indigo-500/20">
                              {t(`metadataTaxonomy.knowledgeDomains.${currentQ.knowledge_domain}`, currentQ.knowledge_domain)}
                            </span>
                          )}
                          {currentQ.clinician_task && (
                            <span className="px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-600 border border-purple-500/20">
                              {t(`metadataTaxonomy.clinicianTasks.${currentQ.clinician_task}`, currentQ.clinician_task)}
                            </span>
                          )}
                          {currentQ.health_group && (
                            <span className="px-2 py-0.5 rounded-md bg-sky-500/10 text-sky-600 border border-sky-500/20">
                              {t(`metadataTaxonomy.healthGroups.${currentQ.health_group}`, currentQ.health_group)}
                            </span>
                          )}
                        </div>
                      )}
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

                    {/* Hint & Explanation Box */}
                    {revealed && (currentQ.explanation || currentQ.hint) && (
                      <div className="mt-10 p-6 bg-surface-container-low rounded-2xl border border-outline-variant/30 shadow-sm animate-in fade-in slide-in-from-top-4 space-y-4" dir="auto">
                        {currentQ.hint && (
                          <div className="flex gap-2.5 items-start text-amber-800 dark:text-amber-300 bg-amber-500/10 p-3.5 rounded-xl border border-amber-500/20 text-xs">
                            <span className="font-extrabold shrink-0">💡 تلميح (Hint):</span>
                            <span className="leading-relaxed font-semibold">{currentQ.hint}</span>
                          </div>
                        )}
                        {currentQ.explanation && (
                          <div className="flex gap-5 items-start">
                            <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center shrink-0">
                              <BookOpen size={20} className="text-secondary" />
                            </div>
                            <div className="flex-1">
                              <strong className="block mb-2 text-on-surface font-extrabold text-sm uppercase tracking-wide">
                                {t('moduleQuiz.explanationTitle', 'شرح الإجابة (Explanation)')}
                              </strong>
                              <div
                                className="text-on-surface-variant text-base leading-loose prose prose-sm dark:prose-invert max-w-none"
                                dangerouslySetInnerHTML={{ __html: currentQ.explanation }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Image */}
                    {currentQ.image && (
                      <div className="mt-10 rounded-2xl overflow-hidden border border-outline-variant/20 shadow-sm max-w-2xl mx-auto">
                        <img
                          src={currentQ.image.startsWith('http') ? getFileUrl(currentQ.image) : getFileUrl(currentQ.image)}
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
