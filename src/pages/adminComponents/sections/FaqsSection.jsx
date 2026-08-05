import React, { useState, useEffect } from 'react';
import API from '../../../api/axios';
import { Loader2, Trash2, Edit } from 'lucide-react';
import { SectionHeader, Card, statusBadge, Modal, Select, Input, Textarea, SubmitBtn, Badge } from '../ui/SharedUI';

export default function FaqsSection({ showMsg }) {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ id: null, question: '', question_ar: '', answer: '', answer_ar: '', display_order: 0, is_active: true });

  const fetchData = async () => {
    try {
      const res = await API.get('/admin/faqs');
      setFaqs(res.data.faqs);
    } catch (err) { showMsg('error', 'خطأ في جلب الأسئلة الشائعة'); }
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
        showMsg('success', 'تم التحديث بنجاح');
      } else {
        await API.post('/admin/faqs', form);
        showMsg('success', 'تم الإضافة بنجاح');
      }
      fetchData();
      resetForm();
    } catch (err) { showMsg('error', 'خطأ في الحفظ'); }
    setSubmitting(false);
  };

  const deleteFaq = async (id) => {
    if (!confirm('تأكيد الحذف؟')) return;
    try {
      await API.delete(`/admin/faqs/${id}`);
      showMsg('success', 'تم الحذف');
      setFaqs(faqs.filter(f => f.id !== id));
    } catch (err) { showMsg('error', 'خطأ في الحذف'); }
  };

  if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <>
      <SectionHeader title="الأسئلة الشائعة" description="إدارة الأسئلة والإجابات للمستخدمين" onAdd={() => setShowAdd(true)} />

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface-container-highest/20 text-on-surface-variant text-right">
              <tr>
                <th className="p-3 whitespace-nowrap">الترتيب</th>
                <th className="p-3 whitespace-nowrap">السؤال</th>
                <th className="p-3 whitespace-nowrap">الإجابة (مختصر)</th>
                <th className="p-3 whitespace-nowrap">الحالة</th>
                <th className="p-3 whitespace-nowrap text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {faqs.map(f => (
                <tr key={f.id} className="hover:bg-surface-container-highest/10 transition-colors">
                  <td className="p-3 text-on-surface-variant">{f.display_order}</td>
                  <td className="p-3 font-bold text-on-surface">{f.question_ar || f.question}</td>
                  <td className="p-3 text-on-surface-variant max-w-xs truncate">{f.answer_ar || f.answer}</td>
                  <td className="p-3">
                    <Badge variant={f.is_active ? 'success' : 'error'}>{f.is_active ? 'نشط' : 'غير نشط'}</Badge>
                  </td>
                  <td className="p-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => editFaq(f)} className="p-1.5 rounded-lg text-primary hover:bg-primary/10"><Edit size={14} /></button>
                      <button onClick={() => deleteFaq(f.id)} className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {faqs.length === 0 && <div className="p-8 text-center text-on-surface-variant">لا توجد أسئلة مضافة</div>}
        </div>
      </Card>

      <Modal open={showAdd} onClose={resetForm} title={form.id ? "تعديل السؤال" : "إضافة سؤال جديد"}>
        <form onSubmit={saveFaq} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input label="السؤال (EN) *" required value={form.question} onChange={e => setForm({...form, question: e.target.value})} />
            <Input label="السؤال (AR)" value={form.question_ar} onChange={e => setForm({...form, question_ar: e.target.value})} />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <Textarea label="الإجابة (EN) *" required value={form.answer} onChange={e => setForm({...form, answer: e.target.value})} rows="3" />
            <Textarea label="الإجابة (AR)" value={form.answer_ar} onChange={e => setForm({...form, answer_ar: e.target.value})} rows="3" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input label="الترتيب" type="number" min="0" value={form.display_order} onChange={e => setForm({...form, display_order: e.target.value})} />
            <Select label="الحالة" value={form.is_active} onChange={e => setForm({...form, is_active: e.target.value === 'true'})}>
              <option value="true">نشط</option>
              <option value="false">غير نشط</option>
            </Select>
          </div>
          
          <SubmitBtn loading={submitting} label={form.id ? "حفظ التعديلات" : "إضافة السؤال"} />
        </form>
      </Modal>
    </>
  );
}
