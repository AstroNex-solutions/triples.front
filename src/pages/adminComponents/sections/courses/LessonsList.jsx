import React, { useState, useEffect } from 'react';
import API from '../../../../api/axios';
import { 
  Loader2, Plus, Edit3, Trash2, Video, FileText, 
  ClipboardList, Lock, Paperclip, PlayCircle, GripVertical
} from 'lucide-react';
import { Modal } from '../../ui/SharedUI';
import { Reorder } from 'framer-motion';

const parseAttachments = (atts) => {
  if (!atts) return [];
  if (typeof atts === 'string') {
    try { return JSON.parse(atts); } catch(e) { return []; }
  }
  return Array.isArray(atts) ? atts : [];
};

export default function LessonsList({ showMsg, course, module, isSubModule, onManageLesson }) {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [itemToDelete, setItemToDelete] = useState(null);
  const [videoToPlay, setVideoToPlay] = useState(null);

  const fetchLessons = async () => {
    setLoading(true);
    try {
      // Re-fetching the module details to get updated lessons
      const res = await API.get(`/admin/courses/${course.id}/modules`);
      const allModules = res.data.modules || [];
      const currentModule = allModules.find(m => m.id === module.id);
      
      const moduleLessons = currentModule?.lessons || [];
      // Sort by order
      moduleLessons.sort((a, b) => (a.order || 0) - (b.order || 0));
      
      setLessons(moduleLessons);
    } catch (err) {
      showMsg('error', 'خطأ في جلب الدروس');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLessons();
  }, [module.id]);

  const handleReorder = async (newOrder) => {
    // Optimistic UI update
    setLessons(newOrder);

    // Prepare payload
    const payload = newOrder.map((item, index) => ({
      id: item.id,
      order: index + 1
    }));

    try {
      await API.put('/admin/lessons/reorder', { items: payload });
    } catch (err) {
      showMsg('error', 'حدث خطأ أثناء حفظ ترتيب الدروس');
      fetchLessons(); // revert on failure
    }
  };

  const deleteLesson = async () => {
    if (!itemToDelete) return;
    setSubmitting(true);
    try {
      await API.delete(`/admin/lessons/${itemToDelete.id}`);
      showMsg('success', 'تم الحذف بنجاح');
      setItemToDelete(null);
      fetchLessons();
    } catch (err) { showMsg('error', err.response?.data?.message || 'خطأ في الحذف'); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-on-surface">دروس {isSubModule ? 'الموديول الفرعي' : 'الموديول'}: {module.name}</h3>
        <button onClick={() => onManageLesson(null)} className="px-4 py-2 bg-primary text-on-primary font-bold text-xs rounded-xl shadow-sm hover:bg-primary-hover transition-all flex items-center gap-2 cursor-pointer">
          <Plus size={16} /><span>إضافة درس جديد</span>
        </button>
      </div>

      {loading ? (
        <div className="py-12 flex justify-center"><Loader2 size={24} className="animate-spin text-primary" /></div>
      ) : lessons.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-outline-variant/40 rounded-2xl bg-surface-container-low/30">
          <Video size={32} className="mx-auto text-on-surface-variant/40 mb-3" />
          <p className="text-sm font-bold text-on-surface">لا توجد دروس بعد</p>
          <p className="text-xs text-on-surface-variant mt-1">ابدأ بإضافة أول درس لهذا القسم</p>
        </div>
      ) : (
        <Reorder.Group axis="y" values={lessons} onReorder={handleReorder} className="space-y-3">
          {lessons.map((l) => (
            <Reorder.Item key={l.id} value={l} className="p-4 bg-surface rounded-2xl border border-outline-variant/30 hover:border-primary/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 group cursor-grab active:cursor-grabbing">
              <div className="flex items-center gap-3">
                <div className="text-on-surface-variant/50 hover:text-primary transition-colors cursor-grab">
                  <GripVertical size={20} />
                </div>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border font-bold text-sm ${
                  l.lesson_type === 'video' ? 'bg-primary/10 text-primary border-primary/20' :
                  l.lesson_type === 'article' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                  'bg-amber-500/10 text-amber-500 border-amber-500/20'
                }`}>
                  {l.lesson_type === 'video' && <Video size={18} />}
                  {l.lesson_type === 'article' && <FileText size={18} />}
                  {l.lesson_type === 'quiz' && <ClipboardList size={18} />}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-on-surface">{l.title}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    {l.is_free ? (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">معاينة مجانية</span>
                    ) : (
                      <span className="flex items-center gap-1 text-[10px] text-on-surface-variant/60"><Lock size={10} /><span>مغلق</span></span>
                    )}
                    {parseAttachments(l.attachments).length > 0 && (
                      <div className="flex items-center gap-1 text-[10px] text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded-md border border-amber-500/20">
                        <Paperclip size={10} />
                        <span>{parseAttachments(l.attachments).length} مرفقات</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                {l.lesson_type === 'video' && l.video_url && (
                  <>
                    <button 
                      onClick={() => setVideoToPlay(l)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 transition-colors cursor-pointer text-xs font-bold flex items-center gap-1.5" title="تشغيل الفيديو"
                    >
                      <PlayCircle size={14} /> تشغيل
                    </button>
                    <div className="w-[1px] h-6 bg-outline-variant/30 mx-1"></div>
                  </>
                )}
                <button 
                  onClick={() => onManageLesson(l)}
                  className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors cursor-pointer text-xs font-bold flex items-center gap-1.5" title="تعديل الدرس"
                >
                  <Edit3 size={14} /> تعديل
                </button>
                <div className="w-[1px] h-6 bg-outline-variant/30 mx-1"></div>
                <button 
                  onClick={() => setItemToDelete(l)}
                  className="p-1.5 rounded-lg bg-surface-container-low hover:text-rose-500 transition-colors cursor-pointer" title="حذف الدرس"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </Reorder.Item>
          ))}
        </Reorder.Group>
      )}

      {/* Video Player Modal */}
      <Modal open={!!videoToPlay} onClose={() => setVideoToPlay(null)} title={`عرض الفيديو: ${videoToPlay?.title || ''}`}>
        <div className="aspect-video w-full relative bg-surface-container-low rounded-xl overflow-hidden border border-outline-variant/30 flex items-center justify-center">
          {videoToPlay?.video_url ? (
            <iframe 
              src={
                videoToPlay.video_url.includes('http') 
                  ? videoToPlay.video_url.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')
                  : `https://iframe.mediadelivery.net/embed/${videoToPlay.bunny_library_id || '245464'}/${videoToPlay.video_url}`
              }
              className="w-full h-full"
              allowFullScreen
              allow="autoplay; fullscreen"
            />
          ) : (
            <div className="text-on-surface-variant font-bold text-sm">لا يوجد رابط فيديو متاح</div>
          )}
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
          {videoToPlay?.video_url && (
            <a href={videoToPlay.video_url.includes('http') ? videoToPlay.video_url : `https://iframe.mediadelivery.net/embed/${videoToPlay.bunny_library_id || '245464'}/${videoToPlay.video_url}`} target="_blank" rel="noreferrer" className="text-xs font-bold text-primary hover:underline">
              فتح في نافذة جديدة
            </a>
          )}
          <button onClick={() => setVideoToPlay(null)} className="px-5 py-2 rounded-xl text-xs font-bold bg-surface-container-low hover:bg-surface-variant text-on-surface transition-colors cursor-pointer">
            إغلاق
          </button>
        </div>
      </Modal>

      {/* Delete Item Confirmation Modal */}
      <Modal open={!!itemToDelete} onClose={() => setItemToDelete(null)} title="تأكيد الحذف">
        <div className="space-y-4">
          <p className="text-sm font-semibold text-on-surface">
            هل أنت متأكد من الحذف؟ لا يمكن التراجع عن هذا الإجراء.
          </p>
          <div className="flex justify-end gap-2">
            <button onClick={() => setItemToDelete(null)} className="px-4 py-2 rounded-xl text-xs font-bold text-on-surface-variant hover:bg-surface-variant/50 transition-colors cursor-pointer">إلغاء</button>
            <button onClick={deleteLesson} disabled={submitting} className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-500 text-white hover:bg-rose-600 transition-colors cursor-pointer disabled:opacity-50">
              {submitting ? 'جاري الحذف...' : 'نعم، احذف'}
            </button>
          </div>
        </div>
      </Modal>

    </div>
  );
}
