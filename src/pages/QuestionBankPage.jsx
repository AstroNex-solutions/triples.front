import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import API from '../api/axios';
import { CheckCircle2, AlertCircle, ArrowRight, BookOpen, Eye } from 'lucide-react';

export default function QuestionBankPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [revealedAnswers, setRevealedAnswers] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await API.get(`/student/question-banks/${id}`);
        setProduct(res.data.product);
        setQuestions(res.data.questions || []);
      } catch (err) {
        console.error('Error fetching question bank:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const toggleReveal = (qId) => {
    setRevealedAnswers(prev => ({ ...prev, [qId]: !prev[qId] }));
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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-primary space-y-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="font-bold text-on-surface-variant">جاري تحميل بنك الأسئلة...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-2xl mx-auto mt-20 text-center space-y-6 ">
        <div className="w-24 h-24 bg-surface-container-low rounded-full mx-auto flex items-center justify-center border border-outline-variant/30 text-on-surface-variant/50">
          <AlertCircle size={48} />
        </div>
        <h2 className="text-2xl font-black text-on-surface">بنك الأسئلة غير موجود</h2>
        <p className="text-on-surface-variant">عفواً، لم يتم العثور على بنك الأسئلة المطلوب.</p>
        <Link to={`/dashboard`} className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-on-primary rounded-2xl font-bold shadow-glow hover:bg-primary-hover transition-all">
          <ArrowRight size={20} /> العودة للوحة التحكم
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-['Tajawal']" dir="rtl">
      {/* 👑 Header with Back Button */}
      <header className="bg-white/95 backdrop-blur-sm border-b border-slate-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link to="/dashboard" className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white shadow-sm hover:scale-105 transition-transform">
              <BookOpen size={16} />
            </Link>
            <span className="text-base font-bold text-slate-800 hidden sm:block">بنك الأسئلة</span>
          </div>
          
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 py-1.5 px-3 rounded-lg text-xs font-bold transition-colors">
            <ArrowRight size={14} /> رجوع للخلف
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 space-y-4">
        {/* Title Section */}
        <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-100 p-6 text-center shadow-sm">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>
          
          <div className="relative z-10">
            <span className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full font-bold text-xs mb-2">مراجعة الأسئلة</span>
            <h1 className="text-2xl font-black text-slate-800 mb-2">{product.title}</h1>
            <p className="text-slate-500 text-sm max-w-xl mx-auto leading-relaxed">{product.description}</p>
            
            <div className="flex justify-center mt-4">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-100 shadow-sm">
                <BookOpen className="text-primary" size={16} />
                <span className="font-bold text-xs text-slate-600">العدد الكلي: {questions.length} سؤال</span>
              </div>
            </div>
          </div>
        </div>

      {/* Questions List */}
      {questions.length > 0 && (
        <div className="space-y-4 pb-10">
          {questions.map((q, idx) => {
            const options = parseOptions(q.options);
            const isRevealed = revealedAnswers[q.id];
            return (
              <div key={q.id} className="rounded-xl bg-white border border-slate-100 p-4 shadow-sm transition-all hover:shadow-md">
                <div className="flex items-start gap-3 mb-3 border-b border-slate-50 pb-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20 text-primary font-black text-lg">
                    {idx + 1}
                  </div>
                  <h3 className="text-base font-bold text-slate-800 pt-1.5 leading-snug">
                    {q.question_text}
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-14 mb-3">
                  {options.map((opt, oIdx) => {
                    const isCorrect = isRevealed && q.correct_answer === opt;
                    return (
                      <div 
                        key={oIdx} 
                        className={`flex items-center gap-2 p-3 rounded-xl border transition-all ${
                          isCorrect 
                            ? 'bg-green-50 border-green-200 text-green-700 shadow-sm' 
                            : 'bg-slate-50 border-slate-200 text-slate-600'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                          isCorrect ? 'border-green-500' : 'border-slate-300'
                        }`}>
                          {isCorrect && <CheckCircle2 size={10} className="text-green-500" />}
                        </div>
                        <span className={`font-semibold text-sm ${isCorrect ? 'text-green-800' : ''}`}>{opt}</span>
                      </div>
                    );
                  })}
                </div>

                <div className="pl-14">
                  <button 
                    onClick={() => toggleReveal(q.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-lg text-xs font-bold text-primary transition-colors cursor-pointer"
                  >
                    <Eye size={14} /> {isRevealed ? 'إخفاء الإجابة' : 'إظهار الإجابة الصحيحة'}
                  </button>

                  {isRevealed && q.explanation && (
                    <div className="mt-3 p-3 bg-primary/5 border border-primary/10 rounded-xl">
                      <p className="text-xs font-bold text-primary mb-1">شرح الإجابة:</p>
                      <p className="text-xs text-slate-600 leading-relaxed">{q.explanation}</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {questions.length === 0 && (
         <div className="text-center py-10 bg-white rounded-xl border border-slate-100">
           <p className="text-slate-500 text-sm">لا توجد أسئلة حالياً في هذا البنك.</p>
         </div>
      )}
      </div>
    </div>
  );
}
