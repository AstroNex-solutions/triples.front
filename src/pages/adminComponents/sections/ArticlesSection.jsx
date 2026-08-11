import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import API from '../../../api/axios';
import { Loader2, Trash2 } from 'lucide-react';
import { SectionHeader, Card, statusBadge, Modal, Input, Select, Textarea, SubmitBtn } from '../ui/SharedUI';

export default function ArticlesSection({ showMsg }) {
  const { t, i18n } = useTranslation();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', summary: '', status: 'published' });
  const [file, setFile] = useState(null);
  const [sub, setSub] = useState(false);

  const fetchArticles = () => { setLoading(true); API.get('/admin/articles').then(r => setArticles(r.data.articles || [])).catch(console.error).finally(() => setLoading(false)); };
  useEffect(() => { fetchArticles(); }, []);

  const create = async (e) => {
    e.preventDefault(); setSub(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (file) fd.append('image', file);
      await API.post('/admin/articles', fd);
      showMsg('success', t('admin.sections.articles.addArticle')); setShowAdd(false); fetchArticles();
    } catch { showMsg('error', 'Error'); } finally { setSub(false); }
  };

  const del = async (id) => { 
    if (!confirm('Are you sure? / هل أنت تأكد؟')) return; 
    try { 
      await API.delete(`/admin/articles/${id}`); 
      showMsg('success', t('admin.common.delete')); 
      fetchArticles(); 
    } catch { showMsg('error', 'Error'); } 
  };

  return (
    <>
      <SectionHeader title={t('admin.sections.articles.title')} count={articles.length} onAdd={() => setShowAdd(true)} addLabel={t('admin.sections.articles.addArticle')} />
      {loading ? <div className="py-12 flex justify-center"><Loader2 size={24} className="animate-spin text-primary" /></div> : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-start text-xs sm:text-sm border-separate border-spacing-y-1">
              <thead>
                <tr className="text-on-surface-variant/70">
                  <th className="p-3 text-start">{t('admin.sections.articles.articleTitle')}</th>
                  <th className="p-3 text-start">{t('admin.sections.articles.author')}</th>
                  <th className="p-3 text-start">{t('admin.common.status')}</th>
                  <th className="p-3 text-start">{t('admin.sections.articles.views')}</th>
                  <th className="p-3 text-center">{t('admin.common.actions')}</th>
                </tr>
              </thead>
              <tbody>{articles.map(a => {
                const aTitle = a[`title_${i18n.language}`] || a.title;
                return (
                  <tr key={a.id} className="bg-surface/50 hover:bg-surface/80 transition-all">
                    <td className="p-3 font-bold text-on-surface max-w-[200px] truncate">{aTitle}</td>
                    <td className="p-3 text-on-surface-variant">{a.author?.name || '—'}</td>
                    <td className="p-3">{statusBadge(a.status)}</td>
                    <td className="p-3 text-on-surface-variant">{a.views_count || 0}</td>
                    <td className="p-3 text-center">
                      <button onClick={() => del(a.id)} className="p-1.5 rounded-lg bg-surface border border-outline-variant/40 text-on-surface-variant hover:text-rose-400 transition-all cursor-pointer">
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
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title={t('admin.sections.articles.addArticle')}>
        <form onSubmit={create} className="space-y-4">
          <Input label={`${t('admin.sections.articles.articleTitle')} *`} required value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
          <Textarea label="Summary / الملخص" value={form.summary} onChange={e => setForm({...form, summary: e.target.value})} />
          <Textarea label="Content / المحتوى *" required value={form.content} onChange={e => setForm({...form, content: e.target.value})} />
          <Select label={t('admin.common.status')} value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </Select>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-on-surface-variant block">Article Image / صورة المقال</label>
            <input type="file" accept="image/*" onChange={e => setFile(e.target.files[0])} className="text-sm text-on-surface-variant cursor-pointer" />
          </div>
          <SubmitBtn loading={sub} label={t('admin.sections.articles.addArticle')} />
        </form>
      </Modal>
    </>
  );
}
