import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, FileText, Image as ImageIcon } from 'lucide-react';
import { Card, Input, Textarea } from '../../ui/SharedUI';
import { useTranslation } from 'react-i18next';

export default function BookForm({ initialData, onSubmit, onCancel, submitting }) {
  const { t, i18n } = useTranslation();
  const isEdit = !!initialData?.id;
  
  const [form, setForm] = useState({
    title: initialData?.title || '',
    author_name: initialData?.author_name || '',
    description: initialData?.description || '',
    language: initialData?.language || 'العربية',
    pages_count: initialData?.pages_count || ''
  });

  const getFullUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('blob:') || url.startsWith('http')) return url;
    return import.meta.env.VITE_API_URL + url;
  };

  const [files, setFiles] = useState({ book_file: null, cover_image: null });
  const [preview, setPreview] = useState({ 
    cover: getFullUrl(initialData?.cover_image), 
    pdf: getFullUrl(initialData?.book_file) 
  });

  // Handle file changes and create object URLs for instant preview
  const handleFileChange = (e, field) => {
    const file = e.target.files[0];
    if (file) {
      setFiles({ ...files, [field]: file });
      const objectUrl = URL.createObjectURL(file);
      setPreview({ ...preview, [field === 'cover_image' ? 'cover' : 'pdf']: objectUrl });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form, files);
  };

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={onCancel} className="p-2 bg-surface border border-outline-variant/30 rounded-xl hover:bg-surface-container-high transition-colors text-on-surface">
            <ArrowLeft size={18} className={i18n.language === 'ar' ? 'rotate-180' : ''} />
          </button>
          <h2 className="text-xl sm:text-2xl font-extrabold text-on-surface">
            {isEdit ? 'Edit Book / تعديل كتاب' : t('admin.sections.books.addBook')}
          </h2>
        </div>
        <button 
          onClick={handleSubmit} 
          disabled={submitting}
          className="flex items-center gap-2 px-5 py-2 bg-primary text-on-primary rounded-xl font-bold hover:bg-primary-hover transition-colors disabled:opacity-50"
        >
          <Save size={18} />
          {t('admin.common.save')}
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
        {/* Left Column: Form */}
        <Card className="space-y-4">
          <h3 className="text-lg font-bold text-on-surface mb-2 border-b border-outline-variant/30 pb-2">Book Information</h3>
          
          <Input label={`${t('admin.sections.books.bookTitle')} *`} required value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
          <Input label={`${t('admin.sections.articles.author')} *`} required value={form.author_name} onChange={e => setForm({...form, author_name: e.target.value})} />
          
          <div className="grid grid-cols-2 gap-4">
            <Input label="Language / اللغة" value={form.language} onChange={e => setForm({...form, language: e.target.value})} />
            <Input label="Pages Count / عدد الصفحات" type="number" value={form.pages_count} onChange={e => setForm({...form, pages_count: e.target.value})} />
          </div>

          <Textarea label="Description / الوصف" value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows="4" />

          <div className="pt-2 space-y-4">
            <h3 className="text-sm font-bold text-on-surface border-b border-outline-variant/30 pb-2">Files</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5 p-4 border border-dashed border-outline-variant/50 rounded-xl bg-surface-container-low/50 hover:bg-surface-container-low transition-colors">
                <label className="flex flex-col items-center justify-center gap-2 cursor-pointer">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <FileText size={20} />
                  </div>
                  <span className="text-xs font-bold text-on-surface text-center">Book PDF *</span>
                  <input type="file" accept=".pdf" className="hidden" onChange={e => handleFileChange(e, 'book_file')} />
                  {files.book_file && <span className="text-[10px] text-primary truncate max-w-full">{files.book_file.name}</span>}
                </label>
              </div>

              <div className="space-y-1.5 p-4 border border-dashed border-outline-variant/50 rounded-xl bg-surface-container-low/50 hover:bg-surface-container-low transition-colors">
                <label className="flex flex-col items-center justify-center gap-2 cursor-pointer">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                    <ImageIcon size={20} />
                  </div>
                  <span className="text-xs font-bold text-on-surface text-center">Cover Image</span>
                  <input type="file" accept="image/*" className="hidden" onChange={e => handleFileChange(e, 'cover_image')} />
                  {files.cover_image && <span className="text-[10px] text-emerald-500 truncate max-w-full">{files.cover_image.name}</span>}
                </label>
              </div>
            </div>
          </div>
        </Card>

        {/* Right Column: Live Preview */}
        <div className="space-y-4">
          {preview.cover && (
            <Card className="p-4 border-emerald-500/20 bg-emerald-500/5">
              <h3 className="text-xs font-bold text-emerald-500 mb-2 uppercase tracking-wider flex items-center gap-2">
                <ImageIcon size={14} /> Cover Preview
              </h3>
              <div className="w-32 h-48 mx-auto rounded-xl overflow-hidden shadow-lg border border-outline-variant/20">
                <img src={preview.cover} alt="Cover Preview" className="w-full h-full object-cover" />
              </div>
            </Card>
          )}

          {preview.pdf && (
            <Card className="p-0 overflow-hidden border-primary/20 bg-primary/5 flex flex-col h-[500px]">
              <div className="p-3 bg-surface border-b border-outline-variant/30 flex items-center gap-2">
                <FileText size={16} className="text-primary" />
                <h3 className="text-sm font-bold text-on-surface">Book Preview</h3>
              </div>
              <div className="flex-1 w-full relative bg-surface-container-low">
                <iframe 
                  src={`${preview.pdf}#toolbar=0&navpanes=0&scrollbar=1`} 
                  className="absolute inset-0 w-full h-full border-0"
                  title="PDF Preview"
                ></iframe>
              </div>
            </Card>
          )}

          {!preview.cover && !preview.pdf && (
            <div className="h-full min-h-[400px] border border-dashed border-outline-variant/40 rounded-3xl flex flex-col items-center justify-center text-on-surface-variant/50 gap-4 p-8 text-center">
              <div className="flex gap-2">
                <FileText size={32} />
                <ImageIcon size={32} />
              </div>
              <p className="text-sm">Upload a Cover Image and a PDF file to see a live preview here before publishing.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
