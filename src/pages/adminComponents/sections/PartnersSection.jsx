import React, { useState, useEffect } from 'react';
import API from '../../../api/axios';
import { Loader2, Trash2, Edit, Plus, ImageIcon } from 'lucide-react';
import { SectionHeader, Card, statusBadge, Modal, Select, Input, SubmitBtn, Badge } from '../ui/SharedUI';

export default function PartnersSection({ showMsg }) {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ id: null, name: '', name_ar: '', website: '', display_order: 0, is_active: true });
  const [logoFile, setLogoFile] = useState(null);

  const fetchData = async () => {
    try {
      const res = await API.get('/admin/partnerships');
      setPartners(res.data.partnerships);
    } catch (err) { showMsg('error', 'خطأ في جلب الشركاء'); }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const resetForm = () => {
    setForm({ id: null, name: '', name_ar: '', website: '', display_order: 0, is_active: true });
    setLogoFile(null);
    setShowAdd(false);
  };

  const editPartner = (p) => {
    setForm({ id: p.id, name: p.name, name_ar: p.name_ar || '', website: p.website || '', display_order: p.display_order, is_active: p.is_active });
    setLogoFile(null);
    setShowAdd(true);
  };

  const savePartner = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('name_ar', form.name_ar);
      formData.append('website', form.website);
      formData.append('display_order', form.display_order);
      formData.append('is_active', form.is_active);
      if (logoFile) formData.append('logo', logoFile);

      if (form.id) {
        await API.put(`/admin/partnerships/${form.id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' }});
        showMsg('success', 'تم التحديث بنجاح');
      } else {
        await API.post('/admin/partnerships', formData, { headers: { 'Content-Type': 'multipart/form-data' }});
        showMsg('success', 'تم الإضافة بنجاح');
      }
      fetchData();
      resetForm();
    } catch (err) {
      showMsg('error', 'خطأ في الحفظ (تأكد من اختيار اللوجو عند الإضافة)');
    }
    setSubmitting(false);
  };

  const deletePartner = async (id) => {
    if (!confirm('تأكيد الحذف؟')) return;
    try {
      await API.delete(`/admin/partnerships/${id}`);
      showMsg('success', 'تم الحذف');
      setPartners(partners.filter(p => p.id !== id));
    } catch (err) { showMsg('error', 'خطأ في الحذف'); }
  };

  if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <>
      <SectionHeader title="الشركاء" description="إدارة شركاء النجاح في المنصة" onAdd={() => setShowAdd(true)} />

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface-container-highest/20 text-on-surface-variant text-right">
              <tr>
                <th className="p-3 whitespace-nowrap">الترتيب</th>
                <th className="p-3 whitespace-nowrap">اللوجو</th>
                <th className="p-3 whitespace-nowrap">الاسم</th>
                <th className="p-3 whitespace-nowrap">الرابط</th>
                <th className="p-3 whitespace-nowrap">الحالة</th>
                <th className="p-3 whitespace-nowrap text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {partners.map(p => (
                <tr key={p.id} className="hover:bg-surface-container-highest/10 transition-colors">
                  <td className="p-3 text-on-surface-variant">{p.display_order}</td>
                  <td className="p-3">
                    {p.logo ? (
                      <img src={`http://localhost:5000${p.logo}`} alt={p.name} className="h-10 object-contain rounded-md bg-white p-1" />
                    ) : (
                      <div className="h-10 w-10 bg-surface-container flex items-center justify-center rounded-md"><ImageIcon size={16} /></div>
                    )}
                  </td>
                  <td className="p-3 font-bold text-on-surface">{p.name_ar || p.name}</td>
                  <td className="p-3">
                    {p.website ? <a href={p.website} target="_blank" rel="noreferrer" className="text-primary hover:underline text-xs" dir="ltr">{p.website}</a> : '-'}
                  </td>
                  <td className="p-3">
                    <Badge variant={p.is_active ? 'success' : 'error'}>{p.is_active ? 'نشط' : 'غير نشط'}</Badge>
                  </td>
                  <td className="p-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => editPartner(p)} className="p-1.5 rounded-lg text-primary hover:bg-primary/10"><Edit size={14} /></button>
                      <button onClick={() => deletePartner(p.id)} className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {partners.length === 0 && <div className="p-8 text-center text-on-surface-variant">لا يوجد شركاء مضافين</div>}
        </div>
      </Card>

      <Modal open={showAdd} onClose={resetForm} title={form.id ? "تعديل الشريك" : "إضافة شريك جديد"}>
        <form onSubmit={savePartner} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input label="الاسم (EN) *" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
            <Input label="الاسم (AR)" value={form.name_ar} onChange={e => setForm({...form, name_ar: e.target.value})} />
          </div>
          <Input label="رابط الموقع (اختياري)" type="url" value={form.website} onChange={e => setForm({...form, website: e.target.value})} dir="ltr" />
          
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-on-surface-variant">لوجو الشريك {form.id ? '(اتركه فارغاً لعدم التغيير)' : '*'}</label>
            <input type="file" accept="image/*" onChange={e => setLogoFile(e.target.files[0])} required={!form.id} className="w-full text-sm text-on-surface file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-primary/10 file:text-primary hover:file:bg-primary/20" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input label="الترتيب" type="number" min="0" value={form.display_order} onChange={e => setForm({...form, display_order: e.target.value})} />
            <Select label="الحالة" value={form.is_active} onChange={e => setForm({...form, is_active: e.target.value === 'true'})}>
              <option value="true">نشط</option>
              <option value="false">غير نشط</option>
            </Select>
          </div>
          
          <SubmitBtn loading={submitting} label={form.id ? "حفظ التعديلات" : "إضافة الشريك"} />
        </form>
      </Modal>
    </>
  );
}
