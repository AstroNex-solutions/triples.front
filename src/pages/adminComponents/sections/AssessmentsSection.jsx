import React, { useState, useEffect } from 'react';
import API from '../../../api/axios';
import { X, Plus, ClipboardList, Edit, Trash2, Loader2 } from 'lucide-react';
import { SectionHeader, Card, statusBadge, Modal, Select, Input, Textarea, SubmitBtn, Badge } from '../ui/SharedUI';

import QuestionsManager from '../ui/QuestionsManager';

export default function AssessmentsSection({ showMsg }) {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFormModal, setShowFormModal] = useState(false);
  const [manageQuestions, setManageQuestions] = useState(null);
  const [courses, setCourses] = useState([]);
  
  const initialForm = { 
    id: null, course_id: '', title: '', description: '', type: 'quiz', status: 'draft',
    start_date: new Date().toISOString().slice(0, 16), end_date: '',
    duration_minutes: 60, total_marks: 100, passing_marks: 50,
    allow_multiple_attempts: false, max_attempts: 1 
  };
  const [form, setForm] = useState(initialForm);
  const [sub, setSub] = useState(false);
  console.log(assessments);
  
  const fetchData = () => { setLoading(true); Promise.all([API.get('/admin/assessments'), API.get('/admin/courses')]).then(([a, c]) => { setAssessments(a.data.assessments); setCourses(c.data.courses); }).catch(console.error).finally(() => setLoading(false)); };
  useEffect(() => { fetchData(); }, []);

  const save = async (e) => {
    e.preventDefault(); setSub(true);
    try { 
      if (form.id) {
        await API.put(`/admin/assessments/${form.id}`, form);
        showMsg('success', 'تم التحديث بنجاح'); 
      } else {
        await API.post('/admin/assessments', form);
        showMsg('success', 'تم إنشاء الاختبار'); 
      }
      setShowFormModal(false); 
      fetchData(); 
    }
    catch { showMsg('error', 'خطأ في الحفظ'); } finally { setSub(false); }
  };

  const openAdd = () => { setForm(initialForm); setShowFormModal(true); };
  const openEdit = (a) => {
    setForm({
      id: a.id, course_id: a.course_id || '', title: a.title || '', description: a.description || '',
      type: a.type || 'quiz', status: a.status || 'draft',
      start_date: a.start_date ? new Date(a.start_date).toISOString().slice(0, 16) : '',
      end_date: a.end_date ? new Date(a.end_date).toISOString().slice(0, 16) : '',
      duration_minutes: a.duration_minutes || '', total_marks: a.total_marks || 100, passing_marks: a.passing_marks || 50,
      allow_multiple_attempts: a.allow_multiple_attempts || false, max_attempts: a.max_attempts || 1
    });
    setShowFormModal(true);
  };
  const del = async (id) => { if (!confirm('حذف؟')) return; try { await API.delete(`/admin/assessments/${id}`); showMsg('success', 'تم الحذف'); fetchData(); } catch { showMsg('error', 'خطأ'); } };

  return (
    <>
      {manageQuestions && (
        <QuestionsManager 
          target={{...manageQuestions, type: 'assessment'}} 
          onClose={() => setManageQuestions(null)} 
          showMsg={showMsg} 
          onUpdate={fetchData} 
        />
      )}
      <SectionHeader title="الاختبارات وبنك الأسئلة" count={assessments.length} onAdd={openAdd} addLabel="اختبار جديد" />
      {loading ? <div className="py-12 flex justify-center"><Loader2 size={24} className="animate-spin text-primary" /></div> : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs sm:text-sm border-separate border-spacing-y-1">
              <thead><tr className="text-on-surface-variant/70">
                <th className="p-3">العنوان</th><th className="p-3">الكورس</th><th className="p-3">النوع</th><th className="p-3">الحالة</th><th className="p-3">الأسئلة</th><th className="p-3">الدرجة</th><th className="p-3 text-center">إجراءات</th>
              </tr></thead>
              <tbody>{assessments.map(a => (
                <tr key={a.id} className="bg-surface/50 hover:bg-surface/80 transition-all">
                  <td className="p-3 font-bold text-on-surface">{a.title}</td>
                  <td className="p-3 text-on-surface-variant">{a.Course?.title || '—'}</td>
                  <td className="p-3 font-semibold text-primary">{a.type === 'assignment' ? 'واجب' : a.type === 'quiz' ? 'كويز' : a.type === 'exam' ? 'امتحان' : 'بطاقات'}</td>
                  <td className="p-3">{statusBadge(a.status)}</td>
                  <td className="p-3 font-bold text-on-surface">{a.questions?.length || 0}</td>
                  <td className="p-3 text-on-surface-variant">{a.total_marks}</td>
                  <td className="p-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => setManageQuestions(a)} className="p-1.5 rounded-lg bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 transition-all cursor-pointer" title="إدارة الأسئلة">
                        <ClipboardList size={14} />
                      </button>
                      <button onClick={() => openEdit(a)} className="p-1.5 rounded-lg bg-surface border border-outline-variant/40 text-on-surface-variant hover:text-primary transition-all cursor-pointer" title="تعديل الاختبار">
                        <Edit size={14} />
                      </button>
                      <button onClick={() => del(a.id)} className="p-1.5 rounded-lg bg-surface border border-outline-variant/40 text-on-surface-variant hover:text-rose-400 transition-all cursor-pointer" title="حذف">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </Card>
      )}
      <Modal open={showFormModal} onClose={() => setShowFormModal(false)} title={form.id ? "تعديل الاختبار" : "إنشاء اختبار جديد"}>
        <form onSubmit={save} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Select label="الكورس *" required value={form.course_id} onChange={e => setForm({...form, course_id: e.target.value})}>
              <option value="">اختر الكورس</option>
              {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
            </Select>
            <Input label="عنوان الاختبار *" required value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Select label="النوع" value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
              <option value="quiz">كويز</option>
              <option value="exam">امتحان</option>
              <option value="assignment">واجب</option>
              <option value="flashcard">بطاقات تعليمية</option>
            </Select>
            <Select label="الحالة" value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
              <option value="draft">مسودة</option><option value="published">منشور</option><option value="archived">مؤرشف</option>
            </Select>
            <Input label="تاريخ البدء *" type="datetime-local" required value={form.start_date} onChange={e => setForm({...form, start_date: e.target.value})} />
            <Input label="تاريخ الانتهاء" type="datetime-local" value={form.end_date} onChange={e => setForm({...form, end_date: e.target.value})} />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Input label="المدة (دقيقة)" type="number" value={form.duration_minutes} onChange={e => setForm({...form, duration_minutes: e.target.value})} />
            <Input label="الدرجة الكلية" type="number" value={form.total_marks} onChange={e => setForm({...form, total_marks: e.target.value})} />
            <Input label="درجة النجاح" type="number" value={form.passing_marks} onChange={e => setForm({...form, passing_marks: e.target.value})} />
          </div>

          <div className="flex items-center gap-6 p-3 bg-surface-container-low rounded-xl border border-outline-variant/30">
            <label className="flex items-center gap-2 text-xs font-bold text-on-surface cursor-pointer">
              <input type="checkbox" checked={form.allow_multiple_attempts} onChange={e => setForm({...form, allow_multiple_attempts: e.target.checked})} className="w-4 h-4 cursor-pointer" />
              السماح بتعدد المحاولات
            </label>
            {form.allow_multiple_attempts && (
              <div className="flex items-center gap-2 text-xs">
                <span className="font-bold text-on-surface-variant">أقصى محاولات:</span>
                <input type="number" min="1" value={form.max_attempts} onChange={e => setForm({...form, max_attempts: e.target.value})} className="w-16 px-2 py-1 rounded bg-surface border border-outline-variant text-center" />
              </div>
            )}
          </div>

          <Textarea label="الوصف" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
          <SubmitBtn loading={sub} label={form.id ? "حفظ التعديلات" : "إنشاء الاختبار"} />
        </form>
      </Modal>
    </>
  );
}
