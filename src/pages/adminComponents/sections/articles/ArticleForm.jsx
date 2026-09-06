import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, ImageIcon } from 'lucide-react';
import { Card, Input, Textarea, Select } from '../../ui/SharedUI';
import RichTextEditor from '../../ui/RichTextEditor';
import { useTranslation } from 'react-i18next';

export default function ArticleForm({ initialData, onSubmit, onCancel, submitting }) {
  const { t, i18n } = useTranslation();
  const isEdit = !!initialData?.id;
  
  const [form, setForm] = useState({
    title: initialData?.title || '',
    title_ar: initialData?.title_ar || '',
    summary: initialData?.summary || '',
    summary_ar: initialData?.summary_ar || '',
    content: initialData?.content || '',
    content_ar: initialData?.content_ar || '',
    status: initialData?.status || 'published'
  });

  const getFullUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('blob:') || url.startsWith('http')) return url;
    return import.meta.env.VITE_API_URL + url;
  };

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(getFullUrl(initialData?.image));

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (f) {
      setFile(f);
      setPreview(URL.createObjectURL(f));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form, file);
  };

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={onCancel} className="p-2 bg-surface border border-outline-variant/30 rounded-xl hover:bg-surface-container-high transition-colors text-on-surface">
            <ArrowLeft size={18} className={i18n.language === 'ar' ? 'rotate-180' : ''} />
          </button>
          <h2 className="text-xl sm:text-2xl font-extrabold text-on-surface">
            {isEdit ? 'Edit Article / تعديل مقال' : t('admin.sections.articles.addArticle')}
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

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-6 items-start">
        {/* Left Column: Form */}
        <Card className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <Input label={`${t('admin.sections.articles.articleTitle')} (EN) *`} required value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
              <Textarea label="Summary (EN)" value={form.summary} onChange={e => setForm({...form, summary: e.target.value})} rows="3" />
            </div>
            <div className="space-y-4">
              <Input label="العنوان (AR) *" required value={form.title_ar} onChange={e => setForm({...form, title_ar: e.target.value})} />
              <Textarea label="الملخص (AR)" value={form.summary_ar} onChange={e => setForm({...form, summary_ar: e.target.value})} rows="3" />
            </div>
          </div>

          <div className="space-y-6 pt-4 border-t border-outline-variant/30">
            <RichTextEditor label="Content (EN) *" value={form.content} onChange={val => setForm({...form, content: val})} />
            <RichTextEditor label="المحتوى (AR) *" value={form.content_ar} onChange={val => setForm({...form, content_ar: val})} />
          </div>
        </Card>

        {/* Right Column: Sidebar settings */}
        <div className="space-y-4">
          <Card className="space-y-4">
            <h3 className="text-sm font-bold text-on-surface border-b border-outline-variant/30 pb-2">Publishing Settings</h3>
            <Select label={t('admin.common.status')} value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </Select>
          </Card>

          <Card className="space-y-4">
            <h3 className="text-sm font-bold text-on-surface border-b border-outline-variant/30 pb-2">Article Image</h3>
            <div className="space-y-4">
              {preview ? (
                <div className="w-full aspect-video rounded-xl overflow-hidden border border-outline-variant/30 relative group">
                  <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <label className="px-4 py-2 bg-surface text-on-surface rounded-lg text-sm font-bold cursor-pointer hover:bg-surface-variant transition-colors">
                      Change Image
                      <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                    </label>
                  </div>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center gap-3 p-8 border border-dashed border-outline-variant/50 rounded-xl bg-surface-container-low/50 hover:bg-surface-container-low transition-colors cursor-pointer text-on-surface-variant/70">
                  <ImageIcon size={32} />
                  <span className="text-xs font-bold text-center">Upload Cover Image</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                </label>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
