import React, { useState, useEffect } from 'react';
import API from '../../../api/axios';
import { Loader2, Trash2 } from 'lucide-react';
import { SectionHeader, Card, Badge, statusBadge, Modal, Input, Select, Textarea, SubmitBtn } from '../ui/SharedUI';

export default function BannersSection({ showMsg }) {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: '', title_ar: '', description: '', banner_type: 'main', url: '' });
  const [file, setFile] = useState(null);
  const [sub, setSub] = useState(false);

  const fetchBanners = () => { setLoading(true); API.get('/admin/banners').then(r => setBanners(r.data.banners)).catch(console.error).finally(() => setLoading(false)); };
  useEffect(() => { fetchBanners(); }, []);

  const create = async (e) => {
    e.preventDefault(); setSub(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (file) fd.append('image', file);
      await API.post('/admin/banners', fd);
      showMsg('success', 'تم إنشاء البنر'); setShowAdd(false); fetchBanners();
    } catch { showMsg('error', 'خطأ'); } finally { setSub(false); }
  };
  const del = async (id) => { if (!confirm('حذف؟')) return; try { await API.delete(`/admin/banners/${id}`); showMsg('success', 'تم الحذف'); fetchBanners(); } catch { showMsg('error', 'خطأ'); } };

  return (
    <>
      <SectionHeader title="البنرات الإعلانية" count={banners.length} onAdd={() => setShowAdd(true)} addLabel="بنر جديد" />
      {loading ? <div className="py-12 flex justify-center"><Loader2 size={24} className="animate-spin text-primary" /></div> : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs sm:text-sm border-separate border-spacing-y-1">
              <thead><tr className="text-on-surface-variant/70"><th className="p-3">العنوان</th><th className="p-3">النوع</th><th className="p-3">نشط</th><th className="p-3 text-center">حذف</th></tr></thead>
              <tbody>{banners.map(b => (
                <tr key={b.id} className="bg-surface/50 hover:bg-surface/80 transition-all">
                  <td className="p-3 font-bold text-on-surface">{b.title}</td>
                  <td className="p-3">{statusBadge(b.banner_type)}</td>
                  <td className="p-3">{b.is_active ? <Badge text="نشط" variant="success" /> : <Badge text="غير نشط" variant="default" />}</td>
                  <td className="p-3 text-center"><button onClick={() => del(b.id)} className="p-1.5 rounded-lg bg-surface border border-outline-variant/40 text-on-surface-variant hover:text-rose-400 transition-all cursor-pointer"><Trash2 size={14} /></button></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </Card>
      )}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="إضافة بنر جديد">
        <form onSubmit={create} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input label="العنوان (EN) *" required value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
            <Input label="العنوان (AR)" value={form.title_ar} onChange={e => setForm({...form, title_ar: e.target.value})} />
          </div>
          <Textarea label="الوصف" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
          <Select label="النوع" value={form.banner_type} onChange={e => setForm({...form, banner_type: e.target.value})}>
            <option value="main">رئيسي</option><option value="header">Header</option><option value="sidebar">Sidebar</option>
          </Select>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-on-surface-variant block">صورة البنر *</label>
            <input type="file" accept="image/*" onChange={e => setFile(e.target.files[0])} className="text-sm text-on-surface-variant" />
          </div>
          <SubmitBtn loading={sub} label="إنشاء البنر" />
        </form>
      </Modal>
    </>
  );
}
