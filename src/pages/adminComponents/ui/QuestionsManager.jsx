import React, { useState } from 'react';
import API from '../../../api/axios';
import { X, ClipboardList, Edit, Trash2 } from 'lucide-react';
import { Select, SubmitBtn } from './SharedUI';

export default function QuestionsManager({ target, onClose, showMsg, onUpdate }) {
  const [questions, setQuestions] = useState(target.questions || []);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  
  // Form state
  const [form, setForm] = useState({
    id: null,
    question_text: '',
    question_type: 'mcq',
    difficulty_level: 'medium',
    marks: 1,
    options: ['', '', '', ''],
    correct_answer: '',
    explanation: ''
  });

  const resetForm = () => {
    setForm({
      id: null,
      question_text: '',
      question_type: 'mcq',
      difficulty_level: 'medium',
      marks: 1,
      options: ['', '', '', ''],
      correct_answer: '',
      explanation: ''
    });
    setShowForm(false);
  };

  const handleOptionChange = (idx, val) => {
    const newOptions = [...form.options];
    newOptions[idx] = val;
    setForm({ ...form, options: newOptions });
  };

  const saveQuestion = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    let finalOptions = null;
    let finalCorrectAnswer = form.correct_answer;

    if (form.question_type === 'mcq') {
      finalOptions = form.options.filter(o => o.trim() !== '');
      if (finalOptions.length < 2) {
        showMsg('error', 'يجب توفير خيارين على الأقل للسؤال الاختياري');
        setSubmitting(false);
        return;
      }
    } else if (form.question_type === 'true_false') {
      finalOptions = ['True', 'False'];
      if (finalCorrectAnswer !== 'True' && finalCorrectAnswer !== 'False') {
        showMsg('error', 'يجب اختيار الإجابة الصحيحة');
        setSubmitting(false);
        return;
      }
    }

    const payload = {
      assessment_id: target.type === 'assessment' ? target.id : null,
      question_bank_product_id: target.type === 'question_bank_product' ? target.id : null,
      self_assessment_product_id: target.type === 'self_assessment_product' ? target.id : null,
      question_text: form.question_text,
      question_type: form.question_type,
      difficulty_level: form.difficulty_level,
      marks: form.marks,
      options: finalOptions,
      correct_answer: finalCorrectAnswer,
      explanation: form.explanation
    };

    try {
      if (form.id) {
        await API.put(`/admin/questions/${form.id}`, payload);
        showMsg('success', 'تم تحديث السؤال بنجاح');
      } else {
        await API.post(`/admin/questions`, payload);
        showMsg('success', 'تم إضافة السؤال بنجاح');
      }
      
      onUpdate();
      resetForm();
    } catch (err) {
      showMsg('error', err.response?.data?.message || 'خطأ في حفظ السؤال');
    } finally {
      setSubmitting(false);
    }
  };

  const editQuestion = (q) => {
    let parsedOptions = ['', '', '', ''];
    if (q.options) {
      if (typeof q.options === 'string') {
        try { parsedOptions = JSON.parse(q.options); } catch (e) { parsedOptions = ['', '', '', '']; }
      } else if (Array.isArray(q.options)) {
        parsedOptions = q.options;
      }
    }

    setForm({
      id: q.id,
      question_text: q.question_text || '',
      question_type: q.question_type || 'mcq',
      difficulty_level: q.difficulty_level || 'medium',
      marks: q.marks || 1,
      options: parsedOptions,
      correct_answer: q.correct_answer || '',
      explanation: q.explanation || ''
    });
    setShowForm(true);
  };

  const deleteQuestion = async (id) => {
    if (!confirm('تأكيد حذف السؤال؟')) return;
    try {
      await API.delete(`/admin/questions/${id}`);
      showMsg('success', 'تم حذف السؤال');
      setQuestions(questions.filter(q => q.id !== id));
      onUpdate();
    } catch (err) {
      showMsg('error', 'خطأ في حذف السؤال');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 sm:p-6">
      <div className="bg-surface border border-outline-variant/30 rounded-3xl shadow-2xl w-full max-w-6xl h-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-outline-variant/20 bg-surface-container-low/50 shrink-0">
          <div>
            <h3 className="text-sm font-black text-on-surface">إدارة الأسئلة: {target.title}</h3>
            <p className="text-xs text-on-surface-variant">العدد الإجمالي: {questions.length} أسئلة</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-rose-500/10 text-on-surface-variant hover:text-rose-400 transition-all">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-col-reverse md:flex-row flex-1 overflow-hidden">
          
          {/* Form Area */}
          <div className="w-full md:w-[450px] shrink-0 border-l border-outline-variant/20 bg-surface-container-lowest overflow-y-auto custom-scrollbar p-4 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-bold text-on-surface">{form.id ? 'تعديل السؤال' : 'سؤال جديد'}</h4>
              {form.id && (
                <button onClick={resetForm} className="text-xs bg-surface-variant text-on-surface-variant px-3 py-1.5 rounded-lg hover:bg-surface-variant/80 transition-all">إلغاء التعديل</button>
              )}
            </div>
            
            <form onSubmit={saveQuestion} className="space-y-4">
              <Select label="نوع السؤال *" value={form.question_type} onChange={e => setForm({ ...form, question_type: e.target.value })} required>
                <option value="mcq">اختيار من متعدد (MCQ)</option>
                <option value="true_false">صح وخطأ</option>
                <option value="short_answer">إجابة قصيرة</option>
                <option value="essay">مقال</option>
              </Select>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-on-surface-variant">نص السؤال *</label>
                <textarea 
                  value={form.question_text} 
                  onChange={e => setForm({ ...form, question_text: e.target.value })}
                  required
                  rows="3"
                  className="w-full px-4 py-3 bg-surface border border-outline-variant/50 rounded-2xl text-sm text-on-surface focus:border-primary transition-all custom-scrollbar"
                />
              </div>

              {form.question_type === 'mcq' && (
                <div className="space-y-2 p-3 bg-surface-container-low rounded-xl border border-outline-variant/20">
                  <label className="text-xs font-bold text-on-surface block">الخيارات (حدد الإجابة الصحيحة)</label>
                  {form.options?.map((opt, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input 
                        type="radio" 
                        name="correct_answer" 
                        checked={form.correct_answer === opt && opt !== ''} 
                        onChange={() => setForm({ ...form, correct_answer: opt })}
                        className="w-4 h-4 cursor-pointer"
                      />
                      <input 
                        type="text" 
                        placeholder={`خيار ${idx + 1}`}
                        value={opt}
                        onChange={e => handleOptionChange(idx, e.target.value)}
                        className="flex-1 px-3 py-1.5 bg-surface border border-outline-variant/50 rounded-lg text-xs"
                      />
                    </div>
                  ))}
                  <button type="button" onClick={() => setForm({ ...form, options: [...form.options, ''] })} className="text-xs text-primary hover:underline mt-2 inline-block">
                    + إضافة خيار آخر
                  </button>
                </div>
              )}

              {form.question_type === 'true_false' && (
                <div className="space-y-2 p-3 bg-surface-container-low rounded-xl border border-outline-variant/20">
                  <label className="text-xs font-bold text-on-surface block">الإجابة الصحيحة</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input type="radio" name="tf_answer" checked={form.correct_answer === 'True'} onChange={() => setForm({ ...form, correct_answer: 'True' })} /> صح
                    </label>
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input type="radio" name="tf_answer" checked={form.correct_answer === 'False'} onChange={() => setForm({ ...form, correct_answer: 'False' })} /> خطأ
                    </label>
                  </div>
                </div>
              )}

              {(form.question_type === 'short_answer' || form.question_type === 'essay') && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-on-surface-variant block">الإجابة الصحيحة / الكلمات المفتاحية</label>
                  <textarea 
                    value={form.correct_answer} 
                    onChange={e => setForm({ ...form, correct_answer: e.target.value })}
                    rows="2"
                    placeholder="اكتب الإجابة النموذجية أو الكلمات الدلالية للتقييم..."
                    className="w-full px-4 py-2 bg-surface border border-outline-variant/50 rounded-xl text-sm text-on-surface focus:border-primary transition-all"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <Select label="الصعوبة" value={form.difficulty_level} onChange={e => setForm({ ...form, difficulty_level: e.target.value })}>
                  <option value="easy">سهل</option>
                  <option value="medium">متوسط</option>
                  <option value="hard">صعب</option>
                </Select>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-on-surface-variant block">الدرجة</label>
                  <input 
                    type="number" step="0.5" min="0.5" 
                    value={form.marks} onChange={e => setForm({ ...form, marks: e.target.value })}
                    className="w-full px-3 py-2 bg-surface border border-outline-variant/50 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-on-surface-variant block">شرح الإجابة (اختياري يظهر للطالب)</label>
                <textarea 
                  value={form.explanation} 
                  onChange={e => setForm({ ...form, explanation: e.target.value })}
                  rows="2"
                  className="w-full px-4 py-2 bg-surface border border-outline-variant/50 rounded-xl text-xs text-on-surface focus:border-primary transition-all"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <SubmitBtn loading={submitting} label={form.id ? 'حفظ التعديلات' : 'إضافة السؤال'} className="flex-1" />
              </div>
            </form>
          </div>

          {/* List Area */}
          <div className="flex-1 bg-surface-container-highest/20 relative overflow-y-auto custom-scrollbar p-4 space-y-3">
            <h4 className="text-sm font-bold text-on-surface mb-4">الأسئلة الحالية</h4>

            {questions.length === 0 ? (
              <div className="text-center py-12 text-on-surface-variant opacity-60">
                <ClipboardList size={48} className="mx-auto mb-3 opacity-50" />
                <p>لا توجد أسئلة مضافة حتى الآن.</p>
              </div>
            ) : (
              questions.map((q, i) => (
                <div key={q.id} className="bg-surface border border-outline-variant/30 p-4 rounded-2xl space-y-3 shadow-sm hover:border-primary/30 transition-all">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-surface-container-high text-on-surface-variant">السؤال {i + 1}</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-primary/10 text-primary">{q.question_type}</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md border border-outline-variant/30 text-on-surface-variant">{q.marks} درجة</span>
                      </div>
                      <p className="text-sm font-bold text-on-surface leading-snug">{q.question_text}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => editQuestion(q)} className="p-1.5 rounded-lg text-primary hover:bg-primary/10"><Edit size={14} /></button>
                      <button onClick={() => deleteQuestion(q.id)} className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10"><Trash2 size={14} /></button>
                    </div>
                  </div>
                  
                  {/* Preview Answer */}
                  <div className="text-xs bg-emerald-500/5 border border-emerald-500/20 p-2 rounded-lg text-on-surface">
                    <span className="font-bold text-emerald-600 ml-1">الإجابة الصحيحة:</span> 
                    <span className="opacity-90">{q.correct_answer || '—'}</span>
                  </div>
                </div>
              ))
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
}
