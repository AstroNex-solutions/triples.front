import React, { useState, useEffect } from 'react';
import API from '../../../api/axios';
import { Loader2, Trash2 } from 'lucide-react';
import { SectionHeader, Card, statusBadge, Modal, Input, Select, Textarea, SubmitBtn } from '../ui/SharedUI';

export default function ArticlesSection({ showMsg }) {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', summary: '', status: 'published' });
  const [file, setFile] = useState(null);
  const [sub, setSub] = useState(false);

  const fetchArticles = () => { setLoading(true); API.get('/admin/articles').then(r => setArticles(r.data.articles)).catch(console.error).finally(() => setLoading(false)); };
  useEffect(() => { fetchArticles(); }, []);

  const create = async (e) => {
    e.preventDefault(); setSub(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (file) fd.append('image', file);
      await API.post('/admin/articles', fd);
      showMsg('success', 'تم إنشاء المقال'); setShowAdd(false); fetchArticles();
    } catch { showMsg('error', 'خطأ'); } finally { setSub(false); }
  };
  const del = async (id) => { if (!confirm('حذف؟')) return; try { await API.delete(`/admin/articles/${id}`); showMsg('success', 'تم الحذف'); fetchArticles(); } catch { showMsg('error', 'خطأ'); } };

  return (
    <>
      <SectionHeader title="المقالات" count={articles.length} onAdd={() => setShowAdd(true)} addLabel="مقال جديد" />
      {loading ? <div className="py-12 flex justify-center"><Loader2 size={24} className="animate-spin text-primary" /></div> : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs sm:text-sm border-separate border-spacing-y-1">
              <thead><tr className="text-on-surface-variant/70"><th className="p-3">العنوان</th><th className="p-3">الكاتب</th><th className="p-3">الحالة</th><th className="p-3">المشاهدات</th><th className="p-3 text-center">حذف</th></tr></thead>
              <tbody>{articles.map(a => (
                <tr key={a.id} className="bg-surface/50 hover:bg-surface/80 transition-all">
                  <td className="p-3 font-bold text-on-surface max-w-[200px] truncate">{a.title}</td>
                  <td className="p-3 text-on-surface-variant">{a.author?.name || '—'}</td>
                  <td className="p-3">{statusBadge(a.status)}</td>
                  <td className="p-3 text-on-surface-variant">{a.views_count || 0}</td>
                  <td className="p-3 text-center"><button onClick={() => del(a.id)} className="p-1.5 rounded-lg bg-surface border border-outline-variant/40 text-on-surface-variant hover:text-rose-400 transition-all cursor-pointer"><Trash2 size={14} /></button></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </Card>
      )}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="إنشاء مقال جديد">
        <form onSubmit={create} className="space-y-4">
          <Input label="عنوان المقال *" required value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
          <Textarea label="الملخص" value={form.summary} onChange={e => setForm({...form, summary: e.target.value})} />
          <Textarea label="المحتوى *" required value={form.content} onChange={e => setForm({...form, content: e.target.value})} />
          <Select label="الحالة" value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
            <option value="published">منشور</option><option value="draft">مسودة</option>
          </Select>
          <div className="space-y-1.5"><label className="text-xs font-bold text-on-surface-variant block">صورة المقال</label><input type="file" accept="image/*" onChange={e => setFile(e.target.files[0])} className="text-sm text-on-surface-variant" /></div>
          <SubmitBtn loading={sub} label="نشر المقال" />
        </form>
      </Modal>
    </>
  );
}
