import { useOutletContext } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import API from '../../../api/axios';
import { Loader2, Trash2, Edit, ClipboardList } from 'lucide-react';
import { SectionHeader, Card, statusBadge, Modal, Select, Input, Textarea, SubmitBtn, Badge } from '../ui/SharedUI';
import QuestionsManager from '../ui/QuestionsManager';

export default function SelfAssessmentProductsSection() {
  const { showMsg } = useOutletContext();
  const { t, i18n } = useTranslation();
  const [products, setProducts] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [manageQuestions, setManageQuestions] = useState(null);
  const [form, setForm] = useState({ id: null, course_id: '', title: '', description: '', price: 0, is_free: false, duration_minutes: 120, status: 'published' });
  const [submitting, setSubmitting] = useState(false);

  const fetchData = () => {
    setLoading(true);
    Promise.all([API.get('/admin/self-assessment-products'), API.get('/admin/courses')])
      .then(([p, c]) => { setProducts(p.data.products || []); setCourses(c.data.courses || []); })
      .catch(console.error).finally(() => setLoading(false));
  };
  useEffect(() => { fetchData(); }, []);

  const resetForm = () => {
    setForm({ id: null, course_id: '', title: '', description: '', price: 0, is_free: false, duration_minutes: 120, status: 'published' });
    setShowAdd(false);
  };

  const saveProduct = async (e) => {
    e.preventDefault(); setSubmitting(true);
    try {
      if (form.id) {
        await API.put(`/admin/self-assessment-products/${form.id}`, form);
        showMsg('success', t('admin.common.save'));
      } else {
        await API.post('/admin/self-assessment-products', form);
        showMsg('success', t('admin.sections.selfAssessments.addAssessment'));
      }
      resetForm(); fetchData();
    } catch { showMsg('error', 'Error'); }
    finally { setSubmitting(false); }
  };

  const deleteProduct = async (id) => {
    if (!confirm('Delete? / هل أنت متأكد؟')) return;
    try { await API.delete(`/admin/self-assessment-products/${id}`); showMsg('success', t('admin.common.delete')); fetchData(); }
    catch { showMsg('error', 'Error'); }
  };

  const editProduct = (p) => {
    setForm({ id: p.id, course_id: p.course_id, title: p.title, description: p.description || '', price: p.price, is_free: p.is_free, duration_minutes: p.duration_minutes, status: p.status });
    setShowAdd(true);
  };

  return (
    <>
      <SectionHeader title={t('admin.sections.selfAssessments.title')} count={products.length} onAdd={() => { resetForm(); setShowAdd(true); }} addLabel={t('admin.sections.selfAssessments.addAssessment')} />
      {loading ? <div className="py-12 flex justify-center"><Loader2 size={24} className="animate-spin text-primary" /></div> : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-start text-xs sm:text-sm border-separate border-spacing-y-1">
              <thead>
                <tr className="text-on-surface-variant/70">
                  <th className="p-3 text-start">{t('admin.sections.selfAssessments.assessmentTitle')}</th>
                  <th className="p-3 text-start">{t('admin.sections.reviews.course')}</th>
                  <th className="p-3 text-start">{t('admin.sections.selfAssessments.duration')}</th>
                  <th className="p-3 text-start">{t('admin.sections.questionBanks.price')}</th>
                  <th className="p-3 text-start">{t('admin.common.status')}</th>
                  <th className="p-3 text-center">{t('admin.common.actions')}</th>
                </tr>
              </thead>
              <tbody>{products.map(p => {
                const pTitle = p[`title_${i18n.language}`] || p.title;
                const cTitle = p.Course?.[`title_${i18n.language}`] || p.Course?.title;
                return (
                  <tr key={p.id} className="bg-surface/50 hover:bg-surface/80 transition-all">
                    <td className="p-3 font-bold text-on-surface">{pTitle}</td>
                    <td className="p-3 text-on-surface-variant">{cTitle || '—'}</td>
                    <td className="p-3 text-on-surface-variant">{p.duration_minutes} min / دقيقة</td>
                    <td className="p-3 font-bold text-on-surface">{p.is_free ? <Badge text="Free / مجاني" variant="success" /> : `$${p.price}`}</td>
                    <td className="p-3">{statusBadge(p.status)}</td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => setManageQuestions(p)} title="Manage Questions" className="p-1.5 rounded-lg text-emerald-500 hover:bg-emerald-500/10 cursor-pointer"><ClipboardList size={14} /></button>
                        <button onClick={() => editProduct(p)} title="Edit" className="p-1.5 rounded-lg text-primary hover:bg-primary/10 cursor-pointer"><Edit size={14} /></button>
                        <button onClick={() => deleteProduct(p.id)} title="Delete" className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 cursor-pointer"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}</tbody>
            </table>
          </div>
        </Card>
      )}
      <Modal open={showAdd} onClose={resetForm} title={form.id ? t('admin.common.edit') : t('admin.sections.selfAssessments.addAssessment')}>
        <form onSubmit={saveProduct} className="space-y-4">
          <Select label="Course / الكورس المرتبط *" required value={form.course_id} onChange={e => setForm({...form, course_id: e.target.value})}>
            <option value="">Select Course / اختر الكورس</option>
            {courses.map(c => (
              <option key={c.id} value={c.id}>
                {c[`title_${i18n.language}`] || c.title}
              </option>
            ))}
          </Select>
          <Input label={`${t('admin.sections.selfAssessments.assessmentTitle')} *`} required value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
          <Textarea label="Description / الوصف" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Duration (min) / المدة بالدقائق" type="number" min="1" value={form.duration_minutes} onChange={e => setForm({...form, duration_minutes: e.target.value})} />
            <Input label="Price ($) / السعر" type="number" step="0.01" min="0" value={form.price} onChange={e => setForm({...form, price: e.target.value})} disabled={form.is_free} />
            <div className="flex items-center gap-2 mt-6">
              <input type="checkbox" id="sa_free" checked={form.is_free} onChange={e => setForm({...form, is_free: e.target.checked, price: e.target.checked ? 0 : form.price})} className="w-4 h-4 cursor-pointer" />
              <label htmlFor="sa_free" className="text-sm font-bold text-on-surface cursor-pointer">Free / مجاني</label>
            </div>
            <Select label={t('admin.common.status')} value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </Select>
          </div>
          <SubmitBtn loading={submitting} label={form.id ? t('admin.common.save') : t('admin.sections.selfAssessments.addAssessment')} />
        </form>
      </Modal>
      {manageQuestions && (
        <QuestionsManager 
          target={{...manageQuestions, type: 'self_assessment_product'}} 
          onClose={() => setManageQuestions(null)} 
          showMsg={showMsg} 
          onUpdate={fetchData} 
        />
      )}
    </>
  );
}
