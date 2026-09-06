import React, { useState, useEffect } from 'react';
import API from '../../../../api/axios';
import { Loader2, ArrowRight, Video, FileText, ClipboardList, Paperclip, FileIcon, X, Search, Play, Download, AlertTriangle } from 'lucide-react';
import { Input, Select, Textarea, SubmitBtn, Modal } from '../../ui/SharedUI';

const parseAttachments = (atts) => {
  if (!atts) return [];
  if (typeof atts === 'string') {
    try { return JSON.parse(atts); } catch(e) { return []; }
  }
  return Array.isArray(atts) ? atts : [];
};

export default function LessonForm({ showMsg, module, lesson, onBack }) {
  const [submitting, setSubmitting] = useState(false);
  const isEditing = !!lesson;

  const [form, setForm] = useState({ 
    title: lesson?.title || '', 
    content: lesson?.content || '', 
    video_url: lesson?.video_url || '', 
    lesson_type: lesson?.lesson_type || 'video', 
    is_free: !!lesson?.is_free, 
    order: lesson?.order || 1 
  });
  
  const [lessonFile, setLessonFile] = useState(null);
  const [lessonAttachmentFiles, setLessonAttachmentFiles] = useState([]);

  // Bunny Videos
  const [showBunnyModal, setShowBunnyModal] = useState(false);
  const [bunnyVideos, setBunnyVideos] = useState([]);
  const [bunnyLoading, setBunnyLoading] = useState(false);
  const [bunnySearch, setBunnySearch] = useState('');
  const [bunnyLibraryId, setBunnyLibraryId] = useState('');

  const fetchBunnyVideos = async (search = '') => {
    setBunnyLoading(true);
    try {
      const res = await API.get(`/admin/bunny-videos?search=${encodeURIComponent(search)}&limit=50`);
      setBunnyVideos(res.data.videos || []);
      setBunnyLibraryId(res.data.libraryId || '');
    } catch (err) {
      showMsg('error', 'خطأ في جلب الفيديوهات');
    } finally {
      setBunnyLoading(false);
    }
  };

  useEffect(() => {
    if (showBunnyModal) {
      const timer = setTimeout(() => { fetchBunnyVideos(bunnySearch); }, 500);
      return () => clearTimeout(timer);
    }
  }, [bunnySearch, showBunnyModal]);

  const handleSubmit = async (e) => {
    e.preventDefault(); 
    setSubmitting(true);
    
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (!isEditing) {
        fd.append('module_id', module.id);
      }
      if (lessonFile) fd.append('video', lessonFile);
      lessonAttachmentFiles.forEach(f => fd.append('attachments', f));
      
      if (isEditing) {
        await API.put(`/admin/lessons/${lesson.id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        showMsg('success', 'تم تحديث الدرس بنجاح');
      } else {
        await API.post('/admin/lessons', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        showMsg('success', 'تم إضافة الدرس بنجاح');
      }
      
      onBack();
    } catch (err) { 
      showMsg('error', err.response?.data?.message || (isEditing ? 'خطأ في التحديث' : 'خطأ في الإضافة')); 
    } finally { 
      setSubmitting(false); 
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-4 border-b border-outline-variant/20 pb-4">
        <button onClick={onBack} className="p-2 rounded-xl bg-surface-variant/30 text-on-surface-variant hover:text-primary transition-colors cursor-pointer">
          <ArrowRight size={20} />
        </button>
        <div>
          <h3 className="text-lg font-bold text-on-surface">{isEditing ? 'تعديل الدرس' : 'إضافة درس جديد'}</h3>
          <p className="text-xs text-on-surface-variant mt-1">
            للقسم: <span className="font-semibold">{module.name}</span>
          </p>
        </div>
      </div>

      <div className="bg-surface rounded-2xl border border-outline-variant/30 p-5 sm:p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input label="عنوان الدرس *" required placeholder="مثال: الشرح العملي" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select label="نوع الدرس" value={form.lesson_type} onChange={e => setForm({ ...form, lesson_type: e.target.value })}>
              <option value="video">فيديو تفاعلي</option>
              <option value="article">مقال نصي</option>
              <option value="quiz">اختبار</option>
            </Select>
            <Input label="الترتيب" type="number" value={form.order} onChange={e => setForm({ ...form, order: e.target.value })} />
          </div>
          
          {form.lesson_type === 'video' && (
            <div className="space-y-4 border border-outline-variant/30 rounded-2xl p-5 bg-surface-container-low/20">
              <div className="flex items-center gap-2 text-primary font-bold text-sm mb-2">
                <Video size={18} />
                <span>مصدر الفيديو</span>
              </div>
              
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-on-surface-variant block">{isEditing ? 'تغيير الفيديو من الجهاز' : 'رفع فيديو من الجهاز'}</label>
                <input type="file" accept="video/*" onChange={e => setLessonFile(e.target.files[0])} className="text-xs text-on-surface-variant w-full file:ml-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer" />
              </div>
              
              <div className="flex items-center gap-2">
                <div className="h-[1px] flex-1 bg-outline-variant/30"></div>
                <span className="text-[10px] text-on-surface-variant font-bold">أو اختيار من</span>
                <button
                  type="button"
                  onClick={() => { setShowBunnyModal(true); fetchBunnyVideos(); }}
                  className="px-3 py-1.5 bg-violet-500/10 text-violet-500 rounded-lg text-xs font-bold hover:bg-violet-500/20 transition-all border border-violet-500/20 cursor-pointer flex items-center gap-1.5"
                >
                  <Video size={14} /> مدير ملفات Bunny
                </button>
                <div className="h-[1px] flex-1 bg-outline-variant/30"></div>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="h-[1px] flex-1 bg-outline-variant/30"></div>
                <span className="text-[10px] text-on-surface-variant font-bold">أو رابط خارجي</span>
                <div className="h-[1px] flex-1 bg-outline-variant/30"></div>
              </div>
              
              <Input label="رابط من YouTube / Vimeo / Cloud" value={form.video_url} onChange={e => setForm({ ...form, video_url: e.target.value })} dir="ltr" placeholder="https://..." />
            </div>
          )}
          
          {(form.lesson_type === 'article' || form.lesson_type === 'quiz') && (
            <Textarea label={form.lesson_type === 'article' ? 'محتوى المقال النصي' : 'تعليمات وإرشادات الاختبار'} value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} rows={6} />
          )}
          
          <div className="flex items-center gap-2 pt-2 pb-2 bg-emerald-500/5 p-3 rounded-xl border border-emerald-500/10">
            <input type="checkbox" id="adminLessonFree" checked={form.is_free} onChange={e => setForm({ ...form, is_free: e.target.checked })} className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500 cursor-pointer" />
            <label htmlFor="adminLessonFree" className="text-xs font-bold text-on-surface cursor-pointer select-none">جعل هذا الدرس (معاينة مجانية) - متاح للجميع بدون اشتراك</label>
          </div>

          <div className="space-y-4 border border-outline-variant/30 rounded-2xl p-5 bg-surface-container-low/20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <Paperclip size={18} className="text-amber-500" />
                <span className="text-sm font-bold text-on-surface">مرفقات الدرس</span>
              </div>
              {isEditing && parseAttachments(lesson?.attachments).length > 0 && (
                <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2 py-1 rounded-lg border border-amber-500/20">
                  {parseAttachments(lesson.attachments).length} مرفقات سابقة
                </span>
              )}
            </div>
            
            {isEditing && parseAttachments(lesson?.attachments).length > 0 && (
              <div className="mb-4 space-y-2">
                <p className="text-xs text-on-surface-variant font-medium">المرفقات الحالية:</p>
                {parseAttachments(lesson.attachments).map((att, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-surface border border-outline-variant/30 text-xs">
                    <div className="flex items-center gap-2">
                      <FileIcon size={14} className="text-on-surface-variant shrink-0" />
                      <span className="text-on-surface-variant font-medium truncate max-w-[200px] sm:max-w-md" dir="ltr">
                        {typeof att === 'string' ? att.split('/').pop() : 'Attachment'}
                      </span>
                    </div>
                    <a href={typeof att === 'string' ? att : '#'} target="_blank" rel="noreferrer" className="p-1.5 rounded-lg text-primary hover:bg-primary/10 transition-colors" title="تحميل">
                      <Download size={14} />
                    </a>
                  </div>
                ))}
                <div className="flex items-start gap-1.5 mt-2 bg-amber-500/10 p-2 rounded-lg text-amber-500/90 text-[10px] font-bold">
                  <AlertTriangle size={14} className="shrink-0" />
                  <span>تنبيه: رفع مرفقات جديدة سيؤدي إلى استبدال المرفقات القديمة بالكامل.</span>
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-on-surface-variant block">رفع ملفات إضافية (PDF, Word, Excel, ZIP)</label>
              <input
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip,.txt"
                onChange={e => setLessonAttachmentFiles(Array.from(e.target.files))}
                className="text-xs text-on-surface-variant w-full file:ml-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-amber-500/10 file:text-amber-500 hover:file:bg-amber-500/20 cursor-pointer"
              />
            </div>
            
            {lessonAttachmentFiles.length > 0 && (
              <div className="space-y-1.5 mt-3 pt-3 border-t border-outline-variant/20">
                <p className="text-xs font-bold text-on-surface-variant mb-2">الملفات الجديدة المحددة:</p>
                {lessonAttachmentFiles.map((f, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-amber-500/5 border border-amber-500/20 text-xs">
                    <div className="flex items-center gap-2">
                      <FileIcon size={14} className="text-amber-500 shrink-0" />
                      <span className="text-on-surface font-medium truncate max-w-[200px] sm:max-w-md">{f.name}</span>
                      <span className="text-on-surface-variant/60">({(f.size / 1024).toFixed(1)} KB)</span>
                    </div>
                    <button type="button" onClick={() => setLessonAttachmentFiles(prev => prev.filter((_, i) => i !== idx))} className="p-1.5 rounded-lg hover:bg-rose-500/10 text-on-surface-variant hover:text-rose-500 transition-all cursor-pointer">
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-outline-variant/20 flex gap-3">
            <button type="button" onClick={onBack} disabled={submitting} className="px-5 py-2.5 rounded-xl text-sm font-bold border border-outline-variant/30 text-on-surface-variant hover:bg-surface-variant/30 transition-colors cursor-pointer disabled:opacity-50">
              إلغاء
            </button>
            <div className="flex-1">
              <SubmitBtn loading={submitting} label={isEditing ? "حفظ التعديلات" : "إضافة الدرس"} />
            </div>
          </div>
        </form>
      </div>

      {/* Bunny Videos Modal */}
      <Modal open={showBunnyModal} onClose={() => setShowBunnyModal(false)} title="إدارة ملفات Bunny">
        <div className="space-y-4">
          <div className="flex items-center gap-2 border border-outline-variant/30 bg-surface rounded-xl px-3 py-2">
            <Search size={16} className="text-on-surface-variant" />
            <input 
              type="text" 
              placeholder="ابحث عن فيديو في مساحة التخزين..." 
              value={bunnySearch} 
              onChange={e => setBunnySearch(e.target.value)} 
              className="bg-transparent border-none outline-none text-xs text-on-surface flex-1 min-w-0"
            />
          </div>
          
          <div className="max-h-[300px] overflow-y-auto pr-1 space-y-2">
            {bunnyLoading ? (
              <div className="py-8 flex flex-col justify-center items-center gap-2">
                <Loader2 size={24} className="animate-spin text-violet-500" />
                <span className="text-[10px] text-on-surface-variant font-bold">جاري جلب الفيديوهات...</span>
              </div>
            ) : bunnyVideos.length === 0 ? (
              <div className="py-8 text-center border border-dashed border-outline-variant/30 rounded-xl bg-surface-container-low/20">
                <Video size={24} className="mx-auto text-on-surface-variant/30 mb-2" />
                <p className="text-xs text-on-surface-variant">لا توجد فيديوهات مطابقة للبحث</p>
              </div>
            ) : (
              bunnyVideos.map(v => (
                <div key={v.guid} className="p-3 rounded-xl border border-outline-variant/30 bg-surface flex flex-col gap-2 hover:border-violet-500/40 transition-colors group cursor-pointer" onClick={() => {
                  setForm({ ...form, video_url: v.guid });
                  setShowBunnyModal(false);
                }}>
                  <div className="flex gap-3">
                    <div className="w-20 h-14 bg-surface-variant/30 rounded-lg shrink-0 flex items-center justify-center relative overflow-hidden group-hover:shadow-glow transition-all">
                      <Play size={16} className="text-white drop-shadow-md z-10" />
                      <div className="absolute inset-0 bg-black/10"></div>
                      <Video size={24} className="text-on-surface-variant/20 absolute" />
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <h5 className="text-xs font-bold text-on-surface truncate group-hover:text-violet-500 transition-colors" dir="ltr">{v.title}</h5>
                      <div className="flex items-center gap-3 text-[10px] text-on-surface-variant/70">
                        <span>GUID: <span className="font-mono bg-surface-variant/30 px-1 py-0.5 rounded">{v.guid.substring(0,8)}...</span></span>
                        <span>Views: {v.views || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          
          <div className="pt-2 border-t border-outline-variant/20 flex justify-between items-center">
            <span className="text-[10px] text-on-surface-variant/60 font-mono">Library ID: {bunnyLibraryId || 'N/A'}</span>
            <button onClick={() => setShowBunnyModal(false)} className="px-4 py-2 rounded-xl text-xs font-bold text-on-surface-variant hover:bg-surface-variant/50 transition-colors cursor-pointer">إغلاق</button>
          </div>
        </div>
      </Modal>

    </div>
  );
}
