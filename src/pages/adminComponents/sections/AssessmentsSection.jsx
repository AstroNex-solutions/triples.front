import { useOutletContext } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import API from '../../../api/axios';
import { ClipboardList, Edit, Trash2, Loader2 } from 'lucide-react';
import { SectionHeader, Card, statusBadge, Modal, Select, Input, Textarea, SubmitBtn } from '../ui/SharedUI';

import QuestionsManager from '../ui/QuestionsManager';

export default function AssessmentsSection() {
  const { showMsg } = useOutletContext();
  const { t, i18n } = useTranslation();
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
  
  const fetchData = () => { setLoading(true); Promise.all([API.get('/admin/assessments'), API.get('/admin/courses')]).then(([a, c]) => { setAssessments(a.data.assessments || []); setCourses(c.data.courses || []); }).catch(console.error).finally(() => setLoading(false)); };
  useEffect(() => { fetchData(); }, []);

  const save = async (e) => {
    e.preventDefault(); setSub(true);
    try { 
      if (form.id) {
        await API.put(`/admin/assessments/${form.id}`, form);
        showMsg('success', t('admin.common.save')); 
      } else {
        await API.post('/admin/assessments', form);
        showMsg('success', 'Assessment created'); 
      }
      setShowFormModal(false); 
      fetchData(); 
    }
    catch { showMsg('error', 'Error'); } finally { setSub(false); }
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
  const del = async (id) => { if (!confirm('Delete? / هل أنت متأكد؟')) return; try { await API.delete(`/admin/assessments/${id}`); showMsg('success', t('admin.common.delete')); fetchData(); } catch { showMsg('error', 'Error'); } };

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
      <SectionHeader title={t('admin.sections.assessments')} count={assessments.length} onAdd={openAdd} addLabel="New Assessment / اختبار جديد" />
      {loading ? <div className="py-12 flex justify-center"><Loader2 size={24} className="animate-spin text-primary" /></div> : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-start text-xs sm:text-sm border-separate border-spacing-y-1">
              <thead>
                <tr className="text-on-surface-variant/70">
                  <th className="p-3 text-start">Title / العنوان</th>
                  <th className="p-3 text-start">{t('admin.sections.courses')}</th>
                  <th className="p-3 text-start">Type / النوع</th>
                  <th className="p-3 text-start">{t('admin.common.status')}</th>
                  <th className="p-3 text-start">Questions / الأسئلة</th>
                  <th className="p-3 text-start">Marks / الدرجة</th>
                  <th className="p-3 text-center">{t('admin.common.actions')}</th>
                </tr>
              </thead>
              <tbody>{assessments.map(a => {
                const cTitle = a.Course?.[`title_${i18n.language}`] || a.Course?.title;
                const aTitle = a[`title_${i18n.language}`] || a.title;
                return (
                  <tr key={a.id} className="bg-surface/50 hover:bg-surface/80 transition-all">
                    <td className="p-3 font-bold text-on-surface">{aTitle}</td>
                    <td className="p-3 text-on-surface-variant">{cTitle || '—'}</td>
                    <td className="p-3 font-semibold text-primary">{a.type === 'assignment' ? 'Assignment / واجب' : a.type === 'quiz' ? 'Quiz / كويز' : a.type === 'exam' ? 'Exam / امتحان' : 'Flashcards'}</td>
                    <td className="p-3">{statusBadge(a.status)}</td>
                    <td className="p-3 font-bold text-on-surface">{a.questions?.length || 0}</td>
                    <td className="p-3 text-on-surface-variant">{a.total_marks}</td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => setManageQuestions(a)} className="p-1.5 rounded-lg bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 transition-all cursor-pointer" title="Questions">
                          <ClipboardList size={14} />
                        </button>
                        <button onClick={() => openEdit(a)} className="p-1.5 rounded-lg bg-surface border border-outline-variant/40 text-on-surface-variant hover:text-primary transition-all cursor-pointer" title="Edit">
                          <Edit size={14} />
                        </button>
                        <button onClick={() => del(a.id)} className="p-1.5 rounded-lg bg-surface border border-outline-variant/40 text-on-surface-variant hover:text-rose-400 transition-all cursor-pointer" title="Delete">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}</tbody>
            </table>
          </div>
        </Card>
      )}
      <Modal open={showFormModal} onClose={() => setShowFormModal(false)} title={form.id ? t('admin.common.edit') : "New Assessment / اختبار جديد"}>
        <form onSubmit={save} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Select label="Course / الكورس *" required value={form.course_id} onChange={e => setForm({...form, course_id: e.target.value})}>
              <option value="">Select Course / اختر الكورس</option>
              {courses.map(c => (
                <option key={c.id} value={c.id}>
                  {c[`title_${i18n.language}`] || c.title}
                </option>
              ))}
            </Select>
            <Input label="Title / عنوان الاختبار *" required value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Select label="Type / النوع" value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
              <option value="quiz">Quiz / كويز</option>
              <option value="exam">Exam / امتحان</option>
              <option value="assignment">Assignment / واجب</option>
              <option value="flashcard">Flashcard / بطاقات</option>
            </Select>
            <Select label={t('admin.common.status')} value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </Select>
            <Input label="Start Date / تاريخ البدء *" type="datetime-local" required value={form.start_date} onChange={e => setForm({...form, start_date: e.target.value})} />
            <Input label="End Date / تاريخ الانتهاء" type="datetime-local" value={form.end_date} onChange={e => setForm({...form, end_date: e.target.value})} />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Input label="Duration (min) / المدة" type="number" value={form.duration_minutes} onChange={e => setForm({...form, duration_minutes: e.target.value})} />
            <Input label="Total Marks / الدرجة الكلية" type="number" value={form.total_marks} onChange={e => setForm({...form, total_marks: e.target.value})} />
            <Input label="Passing Marks / درجة النجاح" type="number" value={form.passing_marks} onChange={e => setForm({...form, passing_marks: e.target.value})} />
          </div>

          <div className="flex items-center gap-6 p-3 bg-surface-container-low rounded-xl border border-outline-variant/30">
            <label className="flex items-center gap-2 text-xs font-bold text-on-surface cursor-pointer">
              <input type="checkbox" checked={form.allow_multiple_attempts} onChange={e => setForm({...form, allow_multiple_attempts: e.target.checked})} className="w-4 h-4 cursor-pointer" />
              Allow Multiple Attempts / السماح بتعدد المحاولات
            </label>
            {form.allow_multiple_attempts && (
              <div className="flex items-center gap-2 text-xs">
                <span className="font-bold text-on-surface-variant">Max Attempts:</span>
                <input type="number" min="1" value={form.max_attempts} onChange={e => setForm({...form, max_attempts: e.target.value})} className="w-16 px-2 py-1 rounded bg-surface border border-outline-variant text-center" />
              </div>
            )}
          </div>

          <Textarea label="Description / الوصف" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
          <SubmitBtn loading={sub} label={form.id ? t('admin.common.save') : "Create Assessment"} />
        </form>
      </Modal>
    </>
  );
}
