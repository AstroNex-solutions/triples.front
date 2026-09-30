import React, { useState, useEffect } from 'react';
import { Modal, Input, Textarea, SubmitBtn } from '../../ui/SharedUI';
import { Database, Plus, Trash2, Edit3, Image as ImageIcon } from 'lucide-react';
import API from '../../../../api/axios';

export default function ModuleQBankModal({ show, onClose, module, course, showMsg }) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    question_text: '',
    options: ['', '', '', ''],
    correct_answer: '',
    explanation: '',
    image: null
  });

  useEffect(() => {
    if (show && module) {
      fetchQuestions();
    }
  }, [show, module]);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const res = await API.get(`/admin/modules/${module.id}/questions`);
      setQuestions(res.data.questions || []);
    } catch (err) {
      showMsg('error', 'فشل في جلب الأسئلة');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      question_text: '',
      options: ['', '', '', ''],
      correct_answer: '',
      explanation: '',
      image: null
    });
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...form.options];
    newOptions[index] = value;
    setForm({ ...form, options: newOptions });
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!form.correct_answer) {
      return showMsg('error', 'يجب تحديد الإجابة الصحيحة');
    }
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('question_text', form.question_text);
      formData.append('question_type', 'mcq');
      formData.append('options', JSON.stringify(form.options.filter(o => o.trim() !== '')));
      formData.append('correct_answer', form.correct_answer);
      formData.append('explanation', form.explanation);
      if (form.image) formData.append('image', form.image);

      await API.post(`/admin/modules/${module.id}/questions`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      showMsg('success', 'تمت إضافة السؤال بنجاح');
      setShowAdd(false);
      resetForm();
      fetchQuestions();
    } catch (err) {
      showMsg('error', err.response?.data?.message || 'خطأ في إضافة السؤال');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!form.correct_answer) {
      return showMsg('error', 'يجب تحديد الإجابة الصحيحة');
    }
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('question_text', form.question_text);
      formData.append('options', JSON.stringify(form.options.filter(o => o.trim() !== '')));
      formData.append('correct_answer', form.correct_answer);
      formData.append('explanation', form.explanation);
      if (form.image instanceof File) formData.append('image', form.image);

      await API.put(`/admin/modules/${module.id}/questions/${showEdit.id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      showMsg('success', 'تم تحديث السؤال بنجاح');
      setShowEdit(null);
      resetForm();
      fetchQuestions();
    } catch (err) {
      showMsg('error', err.response?.data?.message || 'خطأ في تحديث السؤال');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setSubmitting(true);
    try {
      await API.delete(`/admin/modules/${module.id}/questions/${itemToDelete.id}`);
      showMsg('success', 'تم حذف السؤال بنجاح');
      setItemToDelete(null);
      fetchQuestions();
    } catch (err) {
      showMsg('error', 'خطأ في الحذف');
    } finally {
      setSubmitting(false);
    }
  };

  if (!show) return null;

  return (
    <Modal open={show} onClose={onClose} title={`بنك أسئلة الموديول: ${module?.name}`} size="4xl">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-on-surface">قائمة الأسئلة (MCQ)</h3>
        <button
          onClick={() => { resetForm(); setShowAdd(true); }}
          className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-2 cursor-pointer"
        >
          <Plus size={16} /> إضافة سؤال
        </button>
      </div>

      {loading ? (
        <div className="py-10 text-center"><span className="animate-pulse">جاري التحميل...</span></div>
      ) : questions.length === 0 ? (
        <div className="py-12 text-center bg-surface-container-low rounded-2xl border border-outline-variant/30">
          <Database className="mx-auto text-indigo-400 mb-3" size={40} />
          <p className="text-sm font-bold text-on-surface-variant">لا توجد أسئلة مضافة لهذا الموديول حتى الآن.</p>
        </div>
      ) : (
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
          {questions.map((q, idx) => (
            <div key={q.id} className="p-5 bg-surface rounded-3xl border border-outline-variant/30 flex flex-col gap-4 shadow-sm hover:shadow-md transition-shadow">

              {/* Header: Number, Text, Actions */}
              <div className="flex justify-between items-start gap-4">
                <div className="flex gap-4 items-start flex-1">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center font-black shrink-0 text-lg mt-1 border border-indigo-500/20">
                    {idx + 1}
                  </div>
                  <div className="flex-1" dir="auto">
                    <h4 className="font-extrabold text-on-surface text-lg leading-relaxed" title={q.question_text}>
                      {q.question_text?.length > 30 ? q.question_text.substring(0, 30) + '...' : q.question_text}
                    </h4>
                  </div>
                </div>

                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => {
                      let parsedOptions = q.options;
                      if (parsedOptions && !Array.isArray(parsedOptions)) {
                        let attempts = 0;
                        while (typeof parsedOptions === 'string' && attempts < 3) {
                          try { parsedOptions = JSON.parse(parsedOptions); } catch (e) { break; }
                          attempts++;
                        }
                      }
                      if (!Array.isArray(parsedOptions)) parsedOptions = [];
                      while (parsedOptions.length < 4) parsedOptions.push('');
                      setForm({
                        question_text: q.question_text,
                        options: parsedOptions.slice(0, 4),
                        correct_answer: q.correct_answer,
                        explanation: q.explanation || '',
                        image: q.image
                      });
                      setShowEdit(q);
                    }}
                    className="p-2.5 rounded-xl bg-surface-container hover:bg-indigo-50 hover:text-indigo-600 text-on-surface-variant transition-colors cursor-pointer border border-transparent hover:border-indigo-100" title="تعديل"
                  >
                    <Edit3 size={18} />
                  </button>
                  <button
                    onClick={() => setItemToDelete(q)}
                    className="p-2.5 rounded-xl bg-surface-container hover:bg-rose-50 hover:text-rose-600 text-on-surface-variant transition-colors cursor-pointer border border-transparent hover:border-rose-100" title="حذف"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Form Modal */}
      {(showAdd || showEdit) && (
        <Modal open={true} onClose={() => { setShowAdd(false); setShowEdit(null); resetForm(); }} title={showAdd ? "إضافة سؤال جديد" : "تعديل السؤال"} size="4xl">
          <form onSubmit={showAdd ? handleAddSubmit : handleEditSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
            <Textarea
              label="نص السؤال *"
              required
              rows={3}
              value={form.question_text}
              onChange={e => setForm({ ...form, question_text: e.target.value })}
            />

            <div>
              <label className="block text-xs font-bold text-on-surface mb-2">إرفاق صورة (اختياري)</label>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 px-4 py-2 bg-surface-container-high hover:bg-surface-variant cursor-pointer rounded-xl text-xs font-bold transition-colors">
                  <ImageIcon size={16} /> اختيار صورة
                  <input type="file" className="hidden" accept="image/*" onChange={e => {
                    if (e.target.files[0]) {
                      setForm({ ...form, image: e.target.files[0] });
                    }
                  }} />
                </label>
                {form.image && (
                  <span className="text-xs text-primary truncate max-w-[200px]">
                    {form.image instanceof File ? form.image.name : 'صورة مرفقة مسبقاً'}
                  </span>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-outline-variant/20">
              <label className="block text-sm font-bold text-on-surface mb-3">الخيارات والإجابة الصحيحة *</label>
              <div className="space-y-3">
                {form.options.map((opt, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="correct_answer"
                      checked={form.correct_answer !== '' && form.correct_answer === opt && opt !== ''}
                      onChange={() => {
                        if (opt.trim()) setForm({ ...form, correct_answer: opt });
                      }}
                      className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                    />
                    <div className="flex-1">
                      <Input
                        placeholder={`الخيار ${i + 1}`}
                        value={opt}
                        onChange={e => {
                          handleOptionChange(i, e.target.value);
                          // Update correct answer if the option changes
                          if (form.correct_answer === opt) {
                            setForm(prev => ({ ...prev, correct_answer: e.target.value }));
                          }
                        }}
                        required={i < 2} // At least 2 options required
                      />
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-on-surface-variant mt-2">قم باختيار الدائرة بجوار الإجابة الصحيحة. يجب توفير خيارين على الأقل.</p>
            </div>

            <div className="pt-4 border-t border-outline-variant/20">
              <Textarea
                label="ملاحظات أو شرح (اختياري)"
                rows={2}
                value={form.explanation}
                onChange={e => setForm({ ...form, explanation: e.target.value })}
                placeholder="شرح توضيحي يظهر للطالب عند مراجعة الإجابة..."
              />
            </div>

            <SubmitBtn loading={submitting} label={showAdd ? "إضافة السؤال" : "حفظ التعديلات"} />
          </form>
        </Modal>
      )}

      {/* Delete Confirmation */}
      {itemToDelete && (
        <Modal open={true} onClose={() => setItemToDelete(null)} title="تأكيد الحذف">
          <div className="space-y-4">
            <p className="text-sm font-semibold text-on-surface">هل أنت متأكد من حذف هذا السؤال نهائياً؟</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setItemToDelete(null)} className="px-4 py-2 rounded-xl text-xs font-bold hover:bg-surface-variant/50 cursor-pointer">إلغاء</button>
              <button onClick={handleDelete} disabled={submitting} className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-500 text-white hover:bg-rose-600 cursor-pointer disabled:opacity-50">
                {submitting ? 'جاري الحذف...' : 'نعم، احذف'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </Modal>
  );
}
