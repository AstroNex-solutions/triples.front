import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import API from '../../../api/axios';
import { Loader2, Trash2 } from 'lucide-react';
import { SectionHeader, Card, Badge, statusBadge, Modal, Input, Textarea, SubmitBtn } from '../ui/SharedUI';

export default function BannersSection({ showMsg }) {
  const { t, i18n } = useTranslation();
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: '', title_ar: '', description: '', banner_type: 'main', url: '' });
  const [file, setFile] = useState(null);
  const [sub, setSub] = useState(false);

  const fetchBanners = () => { setLoading(true); API.get('/admin/banners').then(r => setBanners(r.data.banners || [])).catch(console.error).finally(() => setLoading(false)); };
  useEffect(() => { fetchBanners(); }, []);

  const create = async (e) => {
    e.preventDefault(); setSub(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (file) fd.append('image', file);
      await API.post('/admin/banners', fd);
      showMsg('success', t('admin.sections.banners.addBanner')); setShowAdd(false); fetchBanners();
    } catch { showMsg('error', 'Error'); } finally { setSub(false); }
  };

  const del = async (id) => { 
    if (!confirm('Delete? / هل أنت متأكد؟')) return; 
    try { await API.delete(`/admin/banners/${id}`); showMsg('success', t('admin.common.delete')); fetchBanners(); } 
    catch { showMsg('error', 'Error'); } 
  };

  return (
    <>
      <SectionHeader title={t('admin.sections.banners.title')} count={banners.length} onAdd={() => setShowAdd(true)} addLabel={t('admin.sections.banners.addBanner')} />
      {loading ? <div className="py-12 flex justify-center"><Loader2 size={24} className="animate-spin text-primary" /></div> : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-start text-xs sm:text-sm border-separate border-spacing-y-1">
              <thead>
                <tr className="text-on-surface-variant/70">
                  <th className="p-3 text-start">Title / العنوان</th>
                  <th className="p-3 text-start">{t('admin.sections.banners.type')}</th>
                  <th className="p-3 text-start">{t('admin.common.status')}</th>
                  <th className="p-3 text-center">{t('admin.common.actions')}</th>
                </tr>
              </thead>
              <tbody>{banners.map(b => {
                const bTitle = b[`title_${i18n.language}`] || b.title;
                return (
                  <tr key={b.id} className="bg-surface/50 hover:bg-surface/80 transition-all">
                    <td className="p-3 font-bold text-on-surface">{bTitle}</td>
                    <td className="p-3">{statusBadge(b.banner_type)}</td>
                    <td className="p-3">{b.is_active ? <Badge text="Active / نشط" variant="success" /> : <Badge text="Inactive / غير نشط" variant="default" />}</td>
                    <td className="p-3 text-center">
                      <button onClick={() => del(b.id)} className="p-1.5 rounded-lg bg-surface border border-outline-variant/40 text-on-surface-variant hover:text-rose-400 transition-all cursor-pointer">
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}</tbody>
            </table>
          </div>
        </Card>
      )}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title={t('admin.sections.banners.addBanner')}>
        <form onSubmit={create} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input label="Title (EN) *" required value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
            <Input label="Title (AR)" value={form.title_ar} onChange={e => setForm({...form, title_ar: e.target.value})} />
          </div>
          <Textarea label="Description / الوصف" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-on-surface-variant block">Banner Image / صورة البنر *</label>
            <input type="file" accept="image/*" onChange={e => setFile(e.target.files[0])} className="text-sm text-on-surface-variant cursor-pointer" />
          </div>
          <SubmitBtn loading={sub} label={t('admin.sections.banners.addBanner')} />
        </form>
      </Modal>
    </>
  );
}
