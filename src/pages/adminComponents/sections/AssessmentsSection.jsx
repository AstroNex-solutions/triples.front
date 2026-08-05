import React, { useState, useEffect } from 'react';
import API from '../../../api/axios';
import { X, Plus, ClipboardList, Edit, Trash2, Loader2 } from 'lucide-react';
import { SectionHeader, Card, statusBadge, Modal, Select, Input, Textarea, SubmitBtn, Badge } from '../ui/SharedUI';

import QuestionsManager from '../ui/QuestionsManager';

export default function AssessmentsSection({ showMsg }) {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [manageQuestions, setManageQuestions] = useState(null);
  const [courses, setCourses] = useState([]);
  const [form, setForm] = useState({ course_id: '', title: '', description: '', type: 'quiz', duration_minutes: 60, total_marks: 100, passing_marks: 50 });
  const [sub, setSub] = useState(false);
  console.log(assessments);
  
  const fetchData = () => { setLoading(true); Promise.all([API.get('/admin/assessments'), API.get('/admin/courses')]).then(([a, c]) => { setAssessments(a.data.assessments); setCourses(c.data.courses); }).catch(console.error).finally(() => setLoading(false)); };
  useEffect(() => { fetchData(); }, []);

  const create = async (e) => {
    e.preventDefault(); setSub(true);
    try { await API.post('/admin/assessments', form); showMsg('success', 'تم إنشاء الاختبار'); setShowAdd(false); fetchData(); }
    catch { showMsg('error', 'خطأ'); } finally { setSub(false); }
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
      <SectionHeader title="الاختبارات وبنك الأسئلة" count={assessments.length} onAdd={() => setShowAdd(true)} addLabel="اختبار جديد" />
      {loading ? <div className="py-12 flex justify-center"><Loader2 size={24} className="animate-spin text-primary" /></div> : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs sm:text-sm border-separate border-spacing-y-1">
              <thead><tr className="text-on-surface-variant/70">
                <th className="p-3">العنوان</th><th className="p-3">الكورس</th><th className="p-3">النوع</th><th className="p-3">الأسئلة</th><th className="p-3">الدرجة</th><th className="p-3 text-center">إجراءات</th>
              </tr></thead>
              <tbody>{assessments.map(a => (
                <tr key={a.id} className="bg-surface/50 hover:bg-surface/80 transition-all">
                  <td className="p-3 font-bold text-on-surface">{a.title}</td>
                  <td className="p-3 text-on-surface-variant">{a.Course?.title || '—'}</td>
                  <td className="p-3">{statusBadge(a.type)}</td>
                  <td className="p-3 font-bold text-on-surface">{a.questions?.length || 0}</td>
                  <td className="p-3 text-on-surface-variant">{a.total_marks}</td>
                  <td className="p-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => setManageQuestions(a)} className="p-1.5 rounded-lg bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 transition-all cursor-pointer" title="إدارة الأسئلة">
                        <ClipboardList size={14} />
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
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="إنشاء اختبار جديد">
        <form onSubmit={create} className="space-y-4">
          <Select label="الكورس *" required value={form.course_id} onChange={e => setForm({...form, course_id: e.target.value})}>
            <option value="">اختر الكورس</option>
            {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
          </Select>
          <Input label="عنوان الاختبار *" required value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
          <div className="grid grid-cols-2 gap-3">
            <Select label="النوع" value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
              <option value="quiz">كويز</option><option value="exam">امتحان</option><option value="assignment">واجب</option>
            </Select>
            <Input label="المدة (دقيقة)" type="number" value={form.duration_minutes} onChange={e => setForm({...form, duration_minutes: e.target.value})} />
            <Input label="الدرجة الكلية" type="number" value={form.total_marks} onChange={e => setForm({...form, total_marks: e.target.value})} />
            <Input label="درجة النجاح" type="number" value={form.passing_marks} onChange={e => setForm({...form, passing_marks: e.target.value})} />
          </div>
          <Textarea label="الوصف" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
          <SubmitBtn loading={sub} label="إنشاء الاختبار" />
        </form>
      </Modal>
    </>
  );
}
