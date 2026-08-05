import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import API from '../api/axios';
import { CheckCircle, Clock, Award, AlertCircle, ArrowRight, Play, CheckCircle2 } from 'lucide-react';

export default function AssessmentPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [assessments, setAssessments] = useState([]);
  const [activeAssessment, setActiveAssessment] = useState(null);
  const [userAnswers, setUserAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAssessments = async () => {
      try {
        const res = await API.get(`/assessments/course/${courseId}`);
        setAssessments(res.data.assessments || []);
        if (res.data.assessments && res.data.assessments.length > 0) {
          setActiveAssessment(res.data.assessments[0]);
        }
      } catch (err) {
        console.error('Error fetching assessments:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAssessments();
  }, [courseId]);

  const handleSelectOption = (qId, option) => {
    setUserAnswers(prev => ({ ...prev, [qId]: option }));
  };

  const handleSubmitQuiz = async () => {
    if (!activeAssessment) return;

    const formattedAnswers = Object.entries(userAnswers).map(([qId, opt]) => ({
      question_id: parseInt(qId),
      selected_option: opt
    }));

    try {
      const res = await API.post('/assessments/submit', {
        assessment_id: activeAssessment.id,
        answers: formattedAnswers
      });
      setResult(res.data);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'حدث خطأ في تقديم الاختبار');
    }
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
        <p className="font-bold text-on-surface-variant">جاري تحميل الاختبارات...</p>
      </div>
    );
  }

  if (!activeAssessment) {
    return (
      <div className="max-w-2xl mx-auto mt-20 text-center space-y-6 ">
        <div className="w-24 h-24 bg-surface-container-low rounded-full mx-auto flex items-center justify-center border border-outline-variant/30 text-on-surface-variant/50">
          <AlertCircle size={48} />
        </div>
        <h2 className="text-2xl font-black text-on-surface">لا يوجد اختبارات مفعّلة</h2>
        <p className="text-on-surface-variant">لم يتم العثور على أي اختبار متاح لهذه الدورة في الوقت الحالي.</p>
        <Link to={`/dashboard`} className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-on-primary rounded-2xl font-bold shadow-glow hover:bg-primary-hover transition-all">
          <ArrowRight size={20} /> العودة للوحة التحكم
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 space-y-8 " dir="rtl">
      
      {/* Assessment Header */}
      <div className="relative overflow-hidden rounded-3xl bg-surface-container-low/80 border border-outline-variant/50 backdrop-blur-xl p-8 text-center shadow-lg">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
        
        <div className="relative z-10">
          <h1 className="text-3xl md:text-4xl font-black text-on-surface mb-3">{activeAssessment.title}</h1>
          <p className="text-on-surface-variant text-base max-w-2xl mx-auto">{activeAssessment.description}</p>
          
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8 mt-6">
            <div className="flex items-center gap-2 px-4 py-2 bg-surface rounded-2xl border border-outline-variant/30 shadow-sm">
              <Clock className="text-secondary" size={20} />
              <span className="font-bold text-sm text-on-surface">المدة: {activeAssessment.duration_minutes || 20} دقيقة</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-surface rounded-2xl border border-outline-variant/30 shadow-sm">
              <Award className="text-primary" size={20} />
              <span className="font-bold text-sm text-on-surface">درجة النجاح: %{activeAssessment.passing_marks || 50}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Result Card */}
      {result && (
        <div className={`rounded-3xl border-2 p-8 text-center shadow-2xl relative overflow-hidden backdrop-blur-xl ${
          result.passed 
            ? 'bg-emerald-500/10 border-emerald-500/30' 
            : 'bg-rose-500/10 border-rose-500/30'
        }`}>
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-current opacity-5 rounded-full blur-3xl"></div>
          
          <div className="relative z-10 space-y-4">
            <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center border-4 ${
              result.passed ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
            }`}>
              {result.passed ? <Award size={40} /> : <AlertCircle size={40} />}
            </div>
            
            <h2 className={`text-2xl md:text-3xl font-black ${result.passed ? 'text-emerald-400' : 'text-rose-400'}`}>
              {result.passed ? '🎉 تهانينا! لقد اجتزت الاختبار بنجاح' : '❌ للأسف لم تتجاوز درجة النجاح المطلوب'}
            </h2>
            
            <div className="inline-block px-6 py-3 rounded-2xl bg-surface/50 border border-outline-variant/20 mt-2">
              <p className="text-lg font-bold text-on-surface">
                الدرجة المستحقة: <span className={result.passed ? 'text-emerald-400 text-xl font-black' : 'text-rose-400 text-xl font-black'}>{result.score}</span> من {result.totalMarks} 
                <span className="mx-2 opacity-50">|</span> 
                النسبة المئوية: <span dir="ltr">{result.percentage}%</span>
              </p>
            </div>

            <div className="pt-6">
              <Link to="/dashboard" className={`inline-flex items-center gap-2 px-6 py-3 text-white rounded-2xl font-bold transition-all shadow-lg ${
                result.passed ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-rose-500 hover:bg-rose-600'
              }`}>
                <ArrowRight size={20} /> العودة إلى لوحة التحكم
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Questions List */}
      {!result && activeAssessment.questions && (
        <div className="space-y-6">
          {activeAssessment.questions.map((q, idx) => {
            const options = parseOptions(q.options);
            return (
              <div key={q.id} className="rounded-3xl bg-surface-container-low/60 border border-outline-variant/40 p-6 sm:p-8 backdrop-blur-xl shadow-md transition-all hover:border-outline-variant">
                <div className="flex items-start gap-4 mb-6">
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 text-primary font-black text-lg">
                    {idx + 1}
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-on-surface pt-1 leading-relaxed">
                    {q.question_text}
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-14">
                  {options.map((opt, oIdx) => {
                    const isSelected = userAnswers[q.id] === opt;
                    return (
                      <label 
                        key={oIdx} 
                        className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                          isSelected 
                            ? 'bg-primary/10 border-primary text-primary shadow-glow' 
                            : 'bg-surface/50 border-outline-variant/30 text-on-surface-variant hover:border-primary/50 hover:bg-surface'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                          isSelected ? 'border-primary' : 'border-on-surface-variant/40'
                        }`}>
                          {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                        </div>
                        <input 
                          type="radio" 
                          name={`question-${q.id}`} 
                          value={opt} 
                          checked={isSelected} 
                          onChange={() => handleSelectOption(q.id, opt)}
                          className="hidden"
                        />
                        <span className={`font-semibold text-sm ${isSelected ? 'text-on-surface' : ''}`}>{opt}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Submit Button */}
      {!result && activeAssessment.questions && activeAssessment.questions.length > 0 && (
        <div className="sticky bottom-6 z-20 flex justify-center mt-10">
          <button 
            onClick={handleSubmitQuiz} 
            className="flex items-center gap-2 px-10 py-4 bg-primary text-on-primary rounded-2xl font-black text-lg shadow-glow hover:shadow-primary/40 hover:-translate-y-1 transition-all group"
          >
            <CheckCircle2 size={24} className="group-hover:scale-110 transition-transform" />
            إرسال إجابات الاختبار وحساب النتيجة
          </button>
        </div>
      )}

    </div>
  );
}
