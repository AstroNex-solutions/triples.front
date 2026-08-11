import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import API from '../api/axios';
import { CheckCircle2, AlertCircle, ArrowRight, BookOpen, Eye } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';

export default function QuestionBankPage() {
  const { t, i18n } = useTranslation();
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
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-primary space-y-4 bg-background">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="font-bold text-on-surface-variant">{t('student.questionBankPage.loading')}</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-2xl mx-auto mt-20 text-center space-y-6 bg-background p-6 rounded-3xl">
        <div className="w-24 h-24 bg-surface-container-low rounded-full mx-auto flex items-center justify-center border border-outline-variant/30 text-on-surface-variant/50">
          <AlertCircle size={48} />
        </div>
        <h2 className="text-2xl font-black text-on-surface">{t('student.questionBankPage.notFoundTitle')}</h2>
        <p className="text-on-surface-variant">{t('student.questionBankPage.notFoundDesc')}</p>
        <Link to={`/dashboard`} className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-on-primary rounded-2xl font-bold shadow-glow hover:bg-primary-hover transition-all">
          <ArrowRight size={20} /> {t('student.questionBankPage.backToDashboard')}
        </Link>
      </div>
    );
  }

  const pTitle = product[`title_${i18n.language}`] || product.title;
  const pDesc = product[`description_${i18n.language}`] || product.description;

  return (
    <div className="min-h-screen bg-background text-on-background font-sans transition-colors duration-300" dir={i18n.language === 'en' ? 'ltr' : 'rtl'}>
      {/* 👑 Header with Back Button & Controls */}
      <header className="bg-surface/90 backdrop-blur-md border-b border-outline-variant shadow-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link to="/dashboard" className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary shadow-sm hover:scale-105 transition-transform">
              <BookOpen size={16} />
            </Link>
            <span className="text-base font-bold text-on-surface hidden sm:block">{t('student.questionBanks.title')}</span>
          </div>
          
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 bg-surface-container-high hover:bg-surface-container-highest text-on-surface py-2 px-3.5 rounded-xl text-xs font-bold transition-colors cursor-pointer">
              <ArrowRight size={14} className={i18n.language === 'en' ? 'rotate-180' : ''} /> {t('student.questionBankPage.backToDashboard')}
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 space-y-6">
        {/* Title Section */}
        <div className="relative overflow-hidden rounded-3xl bg-surface border border-outline-variant/60 p-6 sm:p-8 text-center shadow-lg">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>
          
          <div className="relative z-10">
            <span className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full font-bold text-xs mb-3 border border-primary/20">{t('student.questionBanks.title')}</span>
            <h1 className="text-2xl sm:text-3xl font-black text-on-surface mb-3">{pTitle}</h1>
            <p className="text-on-surface-variant text-sm max-w-xl mx-auto leading-relaxed">{pDesc}</p>
            
            <div className="flex justify-center mt-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-surface-container rounded-2xl border border-outline-variant/50 shadow-sm">
                <BookOpen className="text-primary" size={16} />
                <span className="font-bold text-xs text-on-surface-variant">{questions.length} {t('student.questionBankPage.questionsCount')}</span>
              </div>
            </div>
          </div>
        </div>

      {/* Questions List */}
      {questions.length > 0 && (
        <div className="space-y-4 pb-12">
          {questions.map((q, idx) => {
            const options = parseOptions(q.options);
            const isRevealed = revealedAnswers[q.id];
            const qText = q[`question_text_${i18n.language}`] || q.question_text;
            const qExpl = q[`explanation_${i18n.language}`] || q.explanation;
            return (
              <div key={q.id} className="rounded-3xl bg-surface border border-outline-variant/50 p-5 shadow-sm transition-all hover:shadow-md">
                <div className="flex items-start gap-3 mb-4 border-b border-outline-variant/30 pb-3">
                  <div className="flex-shrink-0 w-9 h-9 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 text-primary font-black text-base">
                    {idx + 1}
                  </div>
                  <h3 className="text-base font-bold text-on-surface pt-1 leading-snug">
                    {qText}
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                  {options.map((opt, oIdx) => {
                    const isCorrect = isRevealed && q.correct_answer === opt;
                    return (
                      <div 
                        key={oIdx} 
                        className={`flex items-center gap-2 p-3 rounded-2xl border transition-all ${
                          isCorrect 
                            ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400 font-bold shadow-sm' 
                            : 'bg-surface-container-low border-outline-variant/40 text-on-surface-variant'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                          isCorrect ? 'border-emerald-500' : 'border-outline-variant'
                        }`}>
                          {isCorrect && <CheckCircle2 size={12} className="text-emerald-500" />}
                        </div>
                        <span className="text-xs font-semibold">{opt}</span>
                      </div>
                    );
                  })}
                </div>

                <div>
                  <button 
                    onClick={() => toggleReveal(q.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-surface-container hover:bg-surface-container-high border border-outline-variant/50 rounded-xl text-xs font-bold text-primary transition-colors cursor-pointer"
                  >
                    <Eye size={14} /> {isRevealed ? t('student.questionBankPage.hideAnswer') : t('student.questionBankPage.showAnswer')}
                  </button>

                  {isRevealed && qExpl && (
                    <div className="mt-3 p-4 bg-primary/5 border border-primary/15 rounded-2xl">
                      <p className="text-xs font-bold text-primary mb-1">{t('student.questionBankPage.explanation')}</p>
                      <p className="text-xs text-on-surface-variant leading-relaxed">{qExpl}</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {questions.length === 0 && (
         <div className="text-center py-12 bg-surface rounded-3xl border border-outline-variant">
           <p className="text-on-surface-variant text-sm font-semibold">{t('student.questionBanks.empty')}</p>
         </div>
      )}
      </div>
    </div>
  );
}
