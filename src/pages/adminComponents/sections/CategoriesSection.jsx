import React, { useState, useEffect } from 'react';
import API from '../../../api/axios';
import { Loader2, Trash2, X } from 'lucide-react';
import { SectionHeader, Card, Badge, Modal, Input, Textarea, SubmitBtn } from '../ui/SharedUI';

export default function CategoriesSection({ showMsg }) {
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddCat, setShowAddCat] = useState(false);
  const [showAddTag, setShowAddTag] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });
  const [sub, setSub] = useState(false);

  const fetchData = () => {
    setLoading(true);
    Promise.all([API.get('/admin/categories'), API.get('/admin/tags')])
      .then(([c, t]) => { setCategories(c.data.categories); setTags(t.data.tags); })
      .catch(console.error).finally(() => setLoading(false));
  };
  useEffect(() => { fetchData(); }, []);

  const createCat = async (e) => { e.preventDefault(); setSub(true); try { await API.post('/admin/categories', form); showMsg('success', 'تم إنشاء التصنيف'); setShowAddCat(false); setForm({ name: '', description: '' }); fetchData(); } catch { showMsg('error', 'خطأ'); } finally { setSub(false); } };
  const deleteCat = async (id) => { if (!confirm('حذف؟')) return; try { await API.delete(`/admin/categories/${id}`); showMsg('success', 'تم الحذف'); fetchData(); } catch { showMsg('error', 'خطأ'); } };
  const createTag = async (e) => { e.preventDefault(); setSub(true); try { await API.post('/admin/tags', form); showMsg('success', 'تم إنشاء الوسم'); setShowAddTag(false); setForm({ name: '', description: '' }); fetchData(); } catch { showMsg('error', 'خطأ'); } finally { setSub(false); } };
  const deleteTag = async (id) => { if (!confirm('حذف؟')) return; try { await API.delete(`/admin/tags/${id}`); showMsg('success', 'تم الحذف'); fetchData(); } catch { showMsg('error', 'خطأ'); } };

  if (loading) return <div className="py-12 flex justify-center"><Loader2 size={24} className="animate-spin text-primary" /></div>;

  return (
    <>
      <SectionHeader title="الأقسام (التصنيفات)" count={categories.length} onAdd={() => { setForm({ name: '', description: '' }); setShowAddCat(true); }} addLabel="إضافة تصنيف" />
      <Card className="mb-6">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs sm:text-sm border-separate border-spacing-y-1">
            <thead><tr className="text-on-surface-variant/70"><th className="p-3">الاسم</th><th className="p-3">الوصف</th><th className="p-3">نشط</th><th className="p-3 text-center">حذف</th></tr></thead>
            <tbody>{categories.map(c => (
              <tr key={c.id} className="bg-surface/50 hover:bg-surface/80 transition-all">
                <td className="p-3 font-bold text-on-surface">{c.name}</td>
                <td className="p-3 text-on-surface-variant text-xs truncate max-w-[200px]">{c.description || '—'}</td>
                <td className="p-3">{c.is_active ? <Badge text="نشط" variant="success" /> : <Badge text="غير نشط" variant="default" />}</td>
                <td className="p-3 text-center"><button onClick={() => deleteCat(c.id)} className="p-1.5 rounded-lg bg-surface border border-outline-variant/40 text-on-surface-variant hover:text-rose-400 transition-all cursor-pointer"><Trash2 size={14} /></button></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </Card>

      <SectionHeader title="الوسوم (Tags)" count={tags.length} onAdd={() => { setForm({ name: '', description: '' }); setShowAddTag(true); }} addLabel="إضافة وسم" />
      <Card>
        <div className="flex flex-wrap gap-2">
          {tags.map(t => (
            <div key={t.id} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold">
              <span>{t.name}</span>
              <button onClick={() => deleteTag(t.id)} className="hover:text-rose-400 transition-all cursor-pointer"><X size={12} /></button>
            </div>
          ))}
        </div>
      </Card>

      <Modal open={showAddCat} onClose={() => setShowAddCat(false)} title="إضافة تصنيف جديد">
        <form onSubmit={createCat} className="space-y-4">
          <Input label="اسم التصنيف *" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
          <Textarea label="الوصف" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
          <SubmitBtn loading={sub} label="إنشاء التصنيف" />
        </form>
      </Modal>
      <Modal open={showAddTag} onClose={() => setShowAddTag(false)} title="إضافة وسم جديد">
        <form onSubmit={createTag} className="space-y-4">
          <Input label="اسم الوسم *" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
          <SubmitBtn loading={sub} label="إنشاء الوسم" />
        </form>
      </Modal>
    </>
  );
}
