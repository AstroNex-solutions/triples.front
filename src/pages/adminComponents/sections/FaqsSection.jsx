import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import API from '../../../api/axios';
import { Loader2, Trash2, Edit } from 'lucide-react';
import { SectionHeader, Card, Modal, Select, Input, Textarea, SubmitBtn, Badge } from '../ui/SharedUI';

export default function FaqsSection({ showMsg }) {
  const { t, i18n } = useTranslation();
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ id: null, question: '', question_ar: '', answer: '', answer_ar: '', display_order: 0, is_active: true });

  const fetchData = async () => {
    try {
      const res = await API.get('/admin/faqs');
      setFaqs(res.data.faqs || []);
    } catch { showMsg('error', 'Error fetching FAQs'); }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const resetForm = () => {
    setForm({ id: null, question: '', question_ar: '', answer: '', answer_ar: '', display_order: 0, is_active: true });
    setShowAdd(false);
  };

  const editFaq = (f) => {
    setForm({ id: f.id, question: f.question, question_ar: f.question_ar || '', answer: f.answer, answer_ar: f.answer_ar || '', display_order: f.display_order, is_active: f.is_active });
    setShowAdd(true);
  };

  const saveFaq = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (form.id) {
        await API.put(`/admin/faqs/${form.id}`, form);
        showMsg('success', t('admin.common.save'));
      } else {
        await API.post('/admin/faqs', form);
        showMsg('success', t('admin.sections.faqs.addFaq'));
      }
      fetchData();
      resetForm();
    } catch { showMsg('error', 'Error'); }
    setSubmitting(false);
  };

  const deleteFaq = async (id) => {
    if (!confirm('Delete? / هل أنت متأكد؟')) return;
    try {
      await API.delete(`/admin/faqs/${id}`);
      showMsg('success', t('admin.common.delete'));
      setFaqs(faqs.filter(f => f.id !== id));
    } catch { showMsg('error', 'Error'); }
  };

  if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <>
      <SectionHeader title={t('admin.sections.faqs.title')} count={faqs.length} onAdd={() => setShowAdd(true)} addLabel={t('admin.sections.faqs.addFaq')} />

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-start">
            <thead className="bg-surface-container-highest/20 text-on-surface-variant text-start">
              <tr>
                <th className="p-3 whitespace-nowrap text-start">Order / الترتيب</th>
                <th className="p-3 whitespace-nowrap text-start">{t('admin.sections.faqs.question')}</th>
                <th className="p-3 whitespace-nowrap text-start">{t('admin.sections.faqs.answer')}</th>
                <th className="p-3 whitespace-nowrap text-start">{t('admin.common.status')}</th>
                <th className="p-3 whitespace-nowrap text-center">{t('admin.common.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {faqs.map(f => {
                const qText = f[`question_${i18n.language}`] || f.question_ar || f.question;
                const aText = f[`answer_${i18n.language}`] || f.answer_ar || f.answer;
                return (
                  <tr key={f.id} className="hover:bg-surface-container-highest/10 transition-colors">
                    <td className="p-3 text-on-surface-variant">{f.display_order}</td>
                    <td className="p-3 font-bold text-on-surface">{qText}</td>
                    <td className="p-3 text-on-surface-variant max-w-xs truncate">{aText}</td>
                    <td className="p-3">
                      <Badge variant={f.is_active ? 'success' : 'danger'}>{f.is_active ? 'Active / نشط' : 'Inactive / غير نشط'}</Badge>
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => editFaq(f)} title="Edit" className="p-1.5 rounded-lg text-primary hover:bg-primary/10 cursor-pointer"><Edit size={14} /></button>
                        <button onClick={() => deleteFaq(f.id)} title="Delete" className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 cursor-pointer"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {faqs.length === 0 && <div className="p-8 text-center text-on-surface-variant">No FAQs / لا توجد أسئلة مضافة</div>}
        </div>
      </Card>

      <Modal open={showAdd} onClose={resetForm} title={form.id ? t('admin.common.edit') : t('admin.sections.faqs.addFaq')}>
        <form onSubmit={saveFaq} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input label="Question (EN) *" required value={form.question} onChange={e => setForm({...form, question: e.target.value})} />
            <Input label="Question (AR)" value={form.question_ar} onChange={e => setForm({...form, question_ar: e.target.value})} />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <Textarea label="Answer (EN) *" required value={form.answer} onChange={e => setForm({...form, answer: e.target.value})} rows="3" />
            <Textarea label="Answer (AR)" value={form.answer_ar} onChange={e => setForm({...form, answer_ar: e.target.value})} rows="3" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input label="Display Order / الترتيب" type="number" min="0" value={form.display_order} onChange={e => setForm({...form, display_order: e.target.value})} />
            <Select label={t('admin.common.status')} value={form.is_active} onChange={e => setForm({...form, is_active: e.target.value === 'true'})}>
              <option value="true">Active / نشط</option>
              <option value="false">Inactive / غير نشط</option>
            </Select>
          </div>
          
          <SubmitBtn loading={submitting} label={form.id ? t('admin.common.save') : t('admin.sections.faqs.addFaq')} />
        </form>
      </Modal>
    </>
  );
}
