import React, { useState, useEffect } from 'react';
import API from '../../../api/axios';
import { Loader2, Trash2 } from 'lucide-react';
import { SectionHeader, Card, Modal, Input, Textarea, SubmitBtn } from '../ui/SharedUI';

export default function BooksSection({ showMsg }) {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: '', author_name: '', description: '', language: 'العربية', pages_count: '' });
  const [files, setFiles] = useState({ book_file: null, cover_image: null });
  const [sub, setSub] = useState(false);

  const fetchBooks = () => { setLoading(true); API.get('/admin/books').then(r => setBooks(r.data.books)).catch(console.error).finally(() => setLoading(false)); };
  useEffect(() => { fetchBooks(); }, []);

  const create = async (e) => {
    e.preventDefault(); setSub(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (files.book_file) fd.append('book_file', files.book_file);
      if (files.cover_image) fd.append('cover_image', files.cover_image);
      await API.post('/admin/books', fd);
      showMsg('success', 'تم رفع الكتاب'); setShowAdd(false); fetchBooks();
    } catch { showMsg('error', 'خطأ'); } finally { setSub(false); }
  };
  const del = async (id) => { if (!confirm('حذف؟')) return; try { await API.delete(`/admin/books/${id}`); showMsg('success', 'تم الحذف'); fetchBooks(); } catch { showMsg('error', 'خطأ'); } };

  return (
    <>
      <SectionHeader title="المكتبة الإلكترونية" count={books.length} onAdd={() => setShowAdd(true)} addLabel="رفع كتاب" />
      {loading ? <div className="py-12 flex justify-center"><Loader2 size={24} className="animate-spin text-primary" /></div> : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs sm:text-sm border-separate border-spacing-y-1">
              <thead><tr className="text-on-surface-variant/70"><th className="p-3">العنوان</th><th className="p-3">المؤلف</th><th className="p-3">اللغة</th><th className="p-3">التحميلات</th><th className="p-3 text-center">حذف</th></tr></thead>
              <tbody>{books.map(b => (
                <tr key={b.id} className="bg-surface/50 hover:bg-surface/80 transition-all">
                  <td className="p-3 font-bold text-on-surface">{b.title}</td>
                  <td className="p-3 text-on-surface-variant">{b.author_name}</td>
                  <td className="p-3 text-on-surface-variant">{b.language}</td>
                  <td className="p-3 font-bold text-on-surface">{b.download_count || 0}</td>
                  <td className="p-3 text-center"><button onClick={() => del(b.id)} className="p-1.5 rounded-lg bg-surface border border-outline-variant/40 text-on-surface-variant hover:text-rose-400 transition-all cursor-pointer"><Trash2 size={14} /></button></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </Card>
      )}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="رفع كتاب جديد">
        <form onSubmit={create} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input label="عنوان الكتاب *" required value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
            <Input label="اسم المؤلف *" required value={form.author_name} onChange={e => setForm({...form, author_name: e.target.value})} />
            <Input label="اللغة" value={form.language} onChange={e => setForm({...form, language: e.target.value})} />
            <Input label="عدد الصفحات" type="number" value={form.pages_count} onChange={e => setForm({...form, pages_count: e.target.value})} />
          </div>
          <Textarea label="الوصف" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5"><label className="text-xs font-bold text-on-surface-variant block">ملف الكتاب (PDF) *</label><input type="file" accept=".pdf" onChange={e => setFiles({...files, book_file: e.target.files[0]})} className="text-sm text-on-surface-variant" /></div>
            <div className="space-y-1.5"><label className="text-xs font-bold text-on-surface-variant block">صورة الغلاف</label><input type="file" accept="image/*" onChange={e => setFiles({...files, cover_image: e.target.files[0]})} className="text-sm text-on-surface-variant" /></div>
          </div>
          <SubmitBtn loading={sub} label="رفع الكتاب" />
        </form>
      </Modal>
    </>
  );
}
