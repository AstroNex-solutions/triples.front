import React, { useState, useEffect } from 'react';
import API from '../../../../api/axios';
import { Loader2, Plus, Edit3, Trash2, FolderOpen, Play, FolderPlus } from 'lucide-react';
import { Modal, Input, Textarea, SubmitBtn } from '../../ui/SharedUI';

export default function ModulesList({ showMsg, course, onManageSubModules, onManageLessons }) {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);

  const [form, setForm] = useState({ name: '', description: '', order: 1 });

  const fetchModules = async () => {
    setLoading(true);
    try {
      const res = await API.get(`/admin/courses/${course.id}/modules`);
      // Filter out sub-modules (only top-level modules)
      const allModules = res.data.modules || [];
      const topLevel = allModules.filter(m => !m.submodule_id);
      
      // We can also attach sub-modules count and lessons count for UI
      const enrichedModules = topLevel.map(m => {
        const subs = allModules.filter(sub => sub.submodule_id === m.id);
        return {
          ...m,
          subModulesCount: subs.length,
          lessonsCount: m.lessons?.length || 0
        };
      });

      setModules(enrichedModules);
    } catch (err) {
      showMsg('error', 'خطأ في جلب الموديولات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModules();
  }, [course.id]);

  const createModule = async (e) => {
    e.preventDefault(); setSubmitting(true);
    try {
      await API.post('/admin/modules', { ...form, course_id: course.id, submodule_id: null });
      showMsg('success', 'تم إضافة الموديول بنجاح');
      setShowAdd(false); setForm({ name: '', description: '', order: 1 });
      fetchModules();
    } catch (err) { showMsg('error', err.response?.data?.message || 'خطأ في الإضافة'); }
    finally { setSubmitting(false); }
  };

  const updateModule = async (e) => {
    e.preventDefault(); setSubmitting(true);
    try {
      await API.put(`/admin/modules/${showEdit.id}`, form);
      showMsg('success', 'تم التحديث بنجاح');
      setShowEdit(null); setForm({ name: '', description: '', order: 1 });
      fetchModules();
    } catch (err) { showMsg('error', err.response?.data?.message || 'خطأ في التحديث'); }
    finally { setSubmitting(false); }
  };

  const deleteModule = async () => {
    if (!itemToDelete) return;
    setSubmitting(true);
    try {
      await API.delete(`/admin/modules/${itemToDelete.id}`);
      showMsg('success', 'تم الحذف بنجاح');
      setItemToDelete(null);
      fetchModules();
    } catch (err) { showMsg('error', err.response?.data?.message || 'خطأ في الحذف'); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-on-surface">موديولات الكورس: {course.title}</h3>
        <button onClick={() => setShowAdd(true)} className="px-4 py-2 bg-primary text-on-primary font-bold text-xs rounded-xl shadow-sm hover:bg-primary-hover transition-all flex items-center gap-2 cursor-pointer">
          <Plus size={16} /><span>إضافة موديول جديد</span>
        </button>
      </div>

      {loading ? (
        <div className="py-12 flex justify-center"><Loader2 size={24} className="animate-spin text-primary" /></div>
      ) : modules.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-outline-variant/40 rounded-2xl bg-surface-container-low/30">
          <FolderPlus size={32} className="mx-auto text-on-surface-variant/40 mb-3" />
          <p className="text-sm font-bold text-on-surface">لا توجد موديولات بعد</p>
          <p className="text-xs text-on-surface-variant mt-1">ابدأ بإضافة أول موديول لهذا الكورس</p>
        </div>
      ) : (
        <div className="space-y-3">
          {modules.map((m, idx) => (
            <div key={m.id} className="p-4 bg-surface rounded-2xl border border-outline-variant/30 hover:border-primary/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20 font-bold text-sm">
                  {idx + 1}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-on-surface">{m.name}</h4>
                  <div className="flex items-center gap-3 mt-1 text-[11px] text-on-surface-variant">
                    <span className="flex items-center gap-1"><FolderOpen size={12}/> {m.subModulesCount} موديولات فرعية</span>
                    <span className="flex items-center gap-1"><Play size={12}/> {m.lessonsCount} دروس</span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                <button 
                  onClick={() => onManageSubModules(m)}
                  className="px-3 py-1.5 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <FolderOpen size={14} /> موديولات فرعية
                </button>
                <button 
                  onClick={() => onManageLessons(m)}
                  className="px-3 py-1.5 bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/20 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Play size={14} /> الدروس
                </button>
                <div className="w-[1px] h-6 bg-outline-variant/30 mx-1"></div>
                <button 
                  onClick={() => {
                    setForm({ name: m.name, description: m.description || '', order: m.order || 1 });
                    setShowEdit(m);
                  }}
                  className="p-1.5 rounded-lg bg-surface-container-low hover:text-primary transition-colors cursor-pointer" title="تعديل الموديول"
                >
                  <Edit3 size={16} />
                </button>
                <button 
                  onClick={() => setItemToDelete(m)}
                  className="p-1.5 rounded-lg bg-surface-container-low hover:text-rose-500 transition-colors cursor-pointer" title="حذف الموديول"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="إضافة موديول جديد">
        <form onSubmit={createModule} className="space-y-4">
          <Input label="اسم الموديول *" required placeholder="مثال: الفصل الأول" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          <Textarea label="الوصف" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          <Input label="الترتيب" type="number" value={form.order} onChange={e => setForm({ ...form, order: e.target.value })} />
          <SubmitBtn loading={submitting} label="إضافة" />
        </form>
      </Modal>

      <Modal open={!!showEdit} onClose={() => setShowEdit(null)} title="تعديل الموديول">
        <form onSubmit={updateModule} className="space-y-4">
          <Input label="اسم الموديول *" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          <Textarea label="الوصف" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          <Input label="الترتيب" type="number" value={form.order} onChange={e => setForm({ ...form, order: e.target.value })} />
          <SubmitBtn loading={submitting} label="تحديث" />
        </form>
      </Modal>

      <Modal open={!!itemToDelete} onClose={() => setItemToDelete(null)} title="تأكيد الحذف">
        <div className="space-y-4">
          <p className="text-sm font-semibold text-on-surface">هل أنت متأكد من حذف الموديول ({itemToDelete?.name})؟ سيتم حذف جميع المحتويات بداخله.</p>
          <div className="flex justify-end gap-2">
            <button onClick={() => setItemToDelete(null)} className="px-4 py-2 rounded-xl text-xs font-bold hover:bg-surface-variant/50 cursor-pointer">إلغاء</button>
            <button onClick={deleteModule} disabled={submitting} className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-500 text-white hover:bg-rose-600 cursor-pointer disabled:opacity-50">
              {submitting ? 'جاري الحذف...' : 'نعم، احذف'}
            </button>
          </div>
        </div>
      </Modal>

    </div>
  );
}
