import React, { useState, useEffect } from 'react';
import API from '../../../api/axios';
import { Loader2, Trash2 } from 'lucide-react';
import { SectionHeader, Card, Badge, Modal, Input, Select, Textarea, SubmitBtn } from '../ui/SharedUI';

export default function CouponsSection({ showMsg }) {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ code: '', description: '', discount_type: 'percentage', discount_value: 10, max_uses: 100, valid_from: '', valid_to: '' });
  const [sub, setSub] = useState(false);

  const fetchCoupons = () => { setLoading(true); API.get('/admin/coupons').then(r => setCoupons(r.data.coupons)).catch(console.error).finally(() => setLoading(false)); };
  useEffect(() => { fetchCoupons(); }, []);

  const create = async (e) => { e.preventDefault(); setSub(true); try { await API.post('/admin/coupons', form); showMsg('success', 'تم إنشاء الكوبون'); setShowAdd(false); fetchCoupons(); } catch (err) { showMsg('error', err.response?.data?.message || 'خطأ'); } finally { setSub(false); } };
  const del = async (id) => { if (!confirm('حذف؟')) return; try { await API.delete(`/admin/coupons/${id}`); showMsg('success', 'تم الحذف'); fetchCoupons(); } catch { showMsg('error', 'خطأ'); } };

  return (
    <>
      <SectionHeader title="كوبونات الخصم" count={coupons.length} onAdd={() => setShowAdd(true)} addLabel="كوبون جديد" />
      {loading ? <div className="py-12 flex justify-center"><Loader2 size={24} className="animate-spin text-primary" /></div> : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs sm:text-sm border-separate border-spacing-y-1">
              <thead><tr className="text-on-surface-variant/70"><th className="p-3">الكود</th><th className="p-3">النوع</th><th className="p-3">القيمة</th><th className="p-3">الاستخدام</th><th className="p-3">نشط</th><th className="p-3 text-center">حذف</th></tr></thead>
              <tbody>{coupons.map(c => (
                <tr key={c.id} className="bg-surface/50 hover:bg-surface/80 transition-all">
                  <td className="p-3 font-extrabold text-primary" dir="ltr">{c.code}</td>
                  <td className="p-3">{c.discount_type === 'percentage' ? 'نسبة مئوية' : 'مبلغ ثابت'}</td>
                  <td className="p-3 font-bold text-on-surface">{c.discount_value}{c.discount_type === 'percentage' ? '%' : '$'}</td>
                  <td className="p-3">{c.used_count} / {c.max_uses}</td>
                  <td className="p-3">{c.is_active ? <Badge text="نشط" variant="success" /> : <Badge text="غير نشط" variant="default" />}</td>
                  <td className="p-3 text-center"><button onClick={() => del(c.id)} className="p-1.5 rounded-lg bg-surface border border-outline-variant/40 text-on-surface-variant hover:text-rose-400 transition-all cursor-pointer"><Trash2 size={14} /></button></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </Card>
      )}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="إنشاء كوبون جديد">
        <form onSubmit={create} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input label="كود الكوبون *" required value={form.code} onChange={e => setForm({...form, code: e.target.value.toUpperCase()})} dir="ltr" placeholder="SAVE20" />
            <Select label="نوع الخصم" value={form.discount_type} onChange={e => setForm({...form, discount_type: e.target.value})}>
              <option value="percentage">نسبة مئوية %</option><option value="fixed">مبلغ ثابت $</option>
            </Select>
            <Input label="القيمة *" required type="number" value={form.discount_value} onChange={e => setForm({...form, discount_value: e.target.value})} />
            <Input label="الحد الأقصى للاستخدام" type="number" value={form.max_uses} onChange={e => setForm({...form, max_uses: e.target.value})} />
            <Input label="صالح من" type="date" value={form.valid_from} onChange={e => setForm({...form, valid_from: e.target.value})} />
            <Input label="صالح حتى" type="date" value={form.valid_to} onChange={e => setForm({...form, valid_to: e.target.value})} />
          </div>
          <Textarea label="الوصف" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
          <SubmitBtn loading={sub} label="إنشاء الكوبون" />
        </form>
      </Modal>
    </>
  );
}
