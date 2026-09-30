import { useOutletContext } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import API from '../../../api/axios';
import { Loader2, Trash2, Edit } from 'lucide-react';
import { SectionHeader, Card, Modal, Input, Textarea, SubmitBtn, Badge, Select } from '../ui/SharedUI';
import FlashcardsManager from '../ui/FlashcardsManager';

export default function FlashcardsAdminSection() {
  const { showMsg } = useOutletContext();
  const { t, i18n } = useTranslation();
  const [products, setProducts] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ id: null, title: '', description: '', price: 0, is_active: true, course_id: '' });
  const [submitting, setSubmitting] = useState(false);
  const [manageCardsFor, setManageCardsFor] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [p, c] = await Promise.all([
        API.get('/admin/flashcard-products'),
        API.get('/admin/courses')
      ]);
      setProducts(p.data.products || []);
      setCourses(c.data.courses || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { fetchData(); }, []);

  const resetForm = () => {
    setForm({ id: null, title: '', description: '', price: 0, is_active: true, course_id: '' });
    setShowAdd(false);
  };

  const saveProduct = async (e) => {
    e.preventDefault(); setSubmitting(true);
    try {
      const payload = { ...form };
      if (!payload.course_id) payload.course_id = null; // Send null if empty
      
      if (form.id) {
        await API.put(`/admin/flashcard-products/${form.id}`, payload);
        showMsg('success', 'تم التحديث بنجاح');
      } else {
        await API.post('/admin/flashcard-products', payload);
        showMsg('success', 'تم الإضافة بنجاح');
      }
      resetForm(); fetchData();
    } catch { showMsg('error', 'Error'); }
    finally { setSubmitting(false); }
  };

  const deleteProduct = async (id) => {
    if (!confirm('Delete? / هل أنت متأكد؟')) return;
    try { await API.delete(`/admin/flashcard-products/${id}`); showMsg('success', 'تم الحذف'); fetchData(); }
    catch { showMsg('error', 'Error'); }
  };

  const editProduct = (p) => {
    setForm({ id: p.id, title: p.title, description: p.description || '', price: p.price, is_active: p.is_active, course_id: p.course_id || '' });
    setShowAdd(true);
  };

  return (
    <>
      <SectionHeader title="منتجات الفلاش كارد" count={products.length} onAdd={() => { resetForm(); setShowAdd(true); }} addLabel="إضافة منتج جديد" />
      {loading ? <div className="py-12 flex justify-center"><Loader2 size={24} className="animate-spin text-primary" /></div> : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-start text-xs sm:text-sm border-separate border-spacing-y-1">
              <thead>
                <tr className="text-on-surface-variant/70">
                  <th className="p-3 text-start">المنتج</th>
                  <th className="p-3 text-start">الكورس التابع</th>
                  <th className="p-3 text-start">السعر</th>
                  <th className="p-3 text-start">الحالة</th>
                  <th className="p-3 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody>{products.map(p => (
                <tr key={p.id} className="bg-surface/50 hover:bg-surface/80 transition-all">
                  <td className="p-3 font-bold text-on-surface">{p.title}</td>
                  <td className="p-3 text-on-surface-variant">{p.course ? p.course.title : 'عام (بدون كورس)'}</td>
                  <td className="p-3 font-bold text-on-surface">{p.price} د.أ</td>
                  <td className="p-3">{p.is_active ? <Badge text="نشط" variant="success" /> : <Badge text="غير نشط" variant="danger" />}</td>
                  <td className="p-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => setManageCardsFor(p)} title="إدارة الكروت" className="px-3 py-1.5 rounded-lg text-primary bg-primary/10 hover:bg-primary hover:text-on-primary font-bold transition-colors cursor-pointer text-xs">إدارة الكروت</button>
                      <button onClick={() => editProduct(p)} title="Edit" className="p-1.5 rounded-lg text-primary hover:bg-primary/10 cursor-pointer"><Edit size={14} /></button>
                      <button onClick={() => deleteProduct(p.id)} title="Delete" className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 cursor-pointer"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </Card>
      )}
      <Modal open={showAdd} onClose={resetForm} title={form.id ? 'تعديل المنتج' : 'إضافة منتج'}>
        <form onSubmit={saveProduct} className="space-y-4">
          <Input label="العنوان *" required value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
          
          <Select label="الكورس التابع" value={form.course_id} onChange={e => setForm({...form, course_id: e.target.value})}>
            <option value="">عام (بدون كورس محدد)</option>
            {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
          </Select>
          
          <Textarea label="الوصف" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
          <Input label="السعر (د.أ)" type="number" step="0.01" min="0" required value={form.price} onChange={e => setForm({...form, price: e.target.value})} />
          <div className="flex items-center gap-2 text-sm font-bold text-on-surface mt-2">
            <input type="checkbox" checked={form.is_active} onChange={e => setForm({...form, is_active: e.target.checked})} className="w-4 h-4 rounded border-outline-variant/30 text-primary bg-surface focus:ring-primary focus:ring-offset-surface" />
            <label>منتج نشط ومتاح للبيع</label>
          </div>
          <div className="pt-4 border-t border-outline-variant/30 flex justify-end gap-3">
            <button type="button" onClick={resetForm} className="px-4 py-2 text-sm font-bold text-on-surface-variant hover:text-on-surface">إلغاء</button>
            <SubmitBtn loading={submitting} label="حفظ" />
          </div>
        </form>
      </Modal>

      {manageCardsFor && (
        <FlashcardsManager 
          product={manageCardsFor} 
          onClose={() => setManageCardsFor(null)} 
          showMsg={showMsg} 
        />
      )}
    </>
  );
}
