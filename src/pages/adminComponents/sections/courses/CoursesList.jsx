import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import API from '../../../../api/axios';
import { 
  Loader2, BookOpen, Plus, CheckCircle2, Users, Play, Trash2, 
  Upload, Settings
} from 'lucide-react';
import { SectionHeader, Card, Badge, statusBadge, Modal, Input, Select, Textarea, SubmitBtn } from '../../ui/SharedUI';
import { getFileUrl } from '../../../../utils/fileHelper';

export default function CoursesList({ showMsg, onManageModules }) {
  const { t, i18n } = useTranslation();
  
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [showAdd, setShowAdd] = useState(false);
  const [showEditCourse, setShowEditCourse] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);
  
  const [form, setForm] = useState({ title: '', subtitle: '', description: '', level: 'beginner', price: '0', category_id: '' });
  const [file, setFile] = useState(null);

  // Instructor assignment
  const [showAssignInstructor, setShowAssignInstructor] = useState(null); // course object
  const [instructors, setInstructors] = useState([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [cRes, catsRes, instrRes] = await Promise.all([
        API.get('/admin/courses'),
        API.get('/instructor/categories'),
        API.get('/admin/users?status=Instructor')
      ]);
      setCourses(cRes.data.courses || []);
      setCategories(catsRes.data.categories || []);
      setInstructors(instrRes.data.users || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const approveCourse = async (id) => {
    try { await API.post(`/admin/courses/${id}/approve`); showMsg('success', 'تم اعتماد الكورس'); fetchData(); }
    catch { showMsg('error', 'خطأ في الاعتماد'); }
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    setSubmitting(true);
    try {
      await API.delete(`/admin/courses/${itemToDelete.id}`);
      showMsg('success', 'تم الحذف بنجاح');
      setItemToDelete(null);
      await fetchData();
    } catch (err) {
      showMsg('error', err.response?.data?.message || 'خطأ في الحذف');
    } finally {
      setSubmitting(false);
    }
  };

  const createCourse = async (e) => {
    e.preventDefault(); setSubmitting(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (file) fd.append('image', file);
      await API.post('/admin/courses', fd);
      showMsg('success', 'تم إنشاء الكورس بنجاح');
      setShowAdd(false);
      setForm({ title: '', subtitle: '', description: '', level: 'beginner', price: '0', category_id: '' });
      setFile(null); fetchData();
    } catch (err) { showMsg('error', err.response?.data?.message || 'خطأ في إنشاء الكورس'); }
    finally { setSubmitting(false); }
  };

  const updateCourse = async (e) => {
    e.preventDefault(); setSubmitting(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (file) fd.append('image', file);
      await API.put(`/admin/courses/${showEditCourse.id}`, fd);
      showMsg('success', 'تم تحديث الكورس بنجاح');
      setShowEditCourse(null);
      setForm({ title: '', subtitle: '', description: '', level: 'beginner', price: '0', category_id: '' });
      setFile(null); fetchData();
    } catch (err) { showMsg('error', err.response?.data?.message || 'خطأ في تحديث الكورس'); }
    finally { setSubmitting(false); }
  };

  const handleAddInstructor = async (instructorId) => {
    if (!showAssignInstructor) return;
    try {
      await API.post(`/admin/courses/${showAssignInstructor.id}/instructors`, { instructor_id: instructorId });
      showMsg('success', 'تم إضافة المحاضر بنجاح');
      await fetchData();
      setCourses(prev => {
        const updated = prev.find(c => c.id === showAssignInstructor.id);
        if (updated) setShowAssignInstructor({ ...updated });
        return prev;
      });
    } catch (err) { showMsg('error', err.response?.data?.message || 'خطأ في إضافة المحاضر'); }
  };

  const handleRemoveInstructor = async (instructorId) => {
    if (!showAssignInstructor) return;
    try {
      await API.delete(`/admin/courses/${showAssignInstructor.id}/instructors/${instructorId}`);
      showMsg('success', 'تم إزالة المحاضر');
      await fetchData();
      setCourses(prev => {
        const updated = prev.find(c => c.id === showAssignInstructor.id);
        if (updated) setShowAssignInstructor({ ...updated });
        return prev;
      });
    } catch (err) { showMsg('error', err.response?.data?.message || 'خطأ في إزالة المحاضر'); }
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title={t('admin.sections.courses') || 'الكورسات'}
        count={courses.length}
        onAdd={() => setShowAdd(true)}
        addLabel="كورس جديد"
      />

      {loading ? (
        <div className="py-16 flex flex-col items-center justify-center gap-3 text-on-surface-variant">
          <Loader2 size={32} className="animate-spin text-primary" />
          <span className="text-xs font-bold">جاري تحميل الكورسات...</span>
        </div>
      ) : courses.length === 0 ? (
        <Card>
          <div className="py-16 text-center space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary mx-auto flex items-center justify-center border border-primary/20">
              <BookOpen size={32} />
            </div>
            <h3 className="text-base font-extrabold text-on-surface">لا توجد كورسات حالياً</h3>
            <p className="text-xs text-on-surface-variant max-w-sm mx-auto leading-relaxed">
              ابدأ بإنشاء أول كورس، ثم أضف الموديولات والدروس التفاعلية.
            </p>
            <button onClick={() => setShowAdd(true)} className="px-5 py-2.5 bg-primary text-on-primary font-bold text-xs rounded-2xl shadow-glow hover:bg-primary-hover transition-all inline-flex items-center gap-2 cursor-pointer">
              <Plus size={16} /><span>إنشاء كورس جديد</span>
            </button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((c) => {
            const modulesCount = c.modulesCount || c.modules?.length || 0;
            const totalLessons = c.lessonsCount || (c.modules?.reduce((acc, m) => acc + (m.lessons?.length || 0), 0)) || 0;
            
            return (
              <Card key={c.id} className="p-0 overflow-hidden flex flex-col h-full hover:border-primary/50 transition-colors">
                {/* Course Image */}
                <div className="h-32 bg-surface-variant/30 relative">
                  {c.image ? (
                    <img src={getFileUrl(c.image)} alt={c.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-on-surface-variant/40">
                      <BookOpen size={32} />
                    </div>
                  )}
                  <div className="absolute top-2 right-2 flex gap-1">
                    {statusBadge(c.status)}
                  </div>
                </div>
                
                {/* Course Body */}
                <div className="p-4 flex flex-col flex-1">
                  <h4 className="text-sm font-extrabold text-on-surface mb-1 line-clamp-2" title={c.title}>{c.title}</h4>
                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-on-surface-variant mb-4">
                    <span className="font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-md">{c.category?.name || 'بدون تصنيف'}</span>
                    <span>{c.instructors?.map(i => i.name).join('، ') || 'بدون محاضر'}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-[11px] font-bold text-on-surface-variant bg-surface-container-low/50 p-2 rounded-xl mb-4">
                    <div className="text-center flex-1">
                      <span className="block text-lg text-on-surface">{modulesCount}</span>
                      <span>موديولات</span>
                    </div>
                    <div className="w-[1px] h-6 bg-outline-variant/30"></div>
                    <div className="text-center flex-1">
                      <span className="block text-lg text-on-surface">{totalLessons}</span>
                      <span>دروس</span>
                    </div>
                  </div>

                  <div className="mt-auto space-y-2">
                    <button 
                      onClick={() => onManageModules(c)}
                      className="w-full py-2 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 rounded-xl font-bold text-xs flex justify-center items-center gap-2 transition-all cursor-pointer"
                    >
                      <Settings size={14} /> <span>إدارة الموديولات والمحتوى</span>
                    </button>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => { setShowAssignInstructor(c); }}
                        title="إدارة المحاضرين"
                        className="flex-1 py-1.5 rounded-xl bg-violet-500/10 hover:bg-violet-500/20 text-violet-400 border border-violet-500/20 font-bold text-[11px] flex justify-center items-center gap-1 transition-all cursor-pointer"
                      >
                        <Users size={12} /><span>محاضرون</span>
                      </button>
                      <button 
                        onClick={() => {
                          setForm({ title: c.title, subtitle: c.subtitle || '', description: c.description || '', level: c.level || 'beginner', price: c.price || '0', category_id: c.category_id || '' });
                          setFile(null); setShowEditCourse(c);
                        }} 
                        className="p-1.5 rounded-xl bg-surface border border-outline-variant/40 text-on-surface-variant hover:text-primary transition-all cursor-pointer" title="تعديل الكورس"
                      >
                        <Settings size={14} /> {/* Used Settings icon here for Edit as Edit3 was not imported, but wait I can just use BookOpen or import Edit3 */}
                      </button>
                      <button 
                        onClick={() => setItemToDelete({ type: 'course', id: c.id, name: c.title })} 
                        className="p-1.5 rounded-xl bg-surface border border-outline-variant/40 text-on-surface-variant hover:text-rose-400 transition-all cursor-pointer" title="حذف الكورس"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    {c.status === 'pending_review' && (
                      <button onClick={() => approveCourse(c.id)} className="w-full py-1.5 mt-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 text-[11px] font-bold flex justify-center items-center gap-1 transition-all cursor-pointer">
                        <CheckCircle2 size={12} /> اعتماد الكورس
                      </button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modals for Create, Edit, Assign Instructor, Delete */}

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="إنشاء كورس جديد">
        <form onSubmit={createCourse} className="space-y-4">
          <Input label="عنوان الكورس *" required placeholder="مثال: الدبلومة الشاملة" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
          <Input label="العنوان الفرعي" placeholder="نظرة مبسطة وتطبيقية..." value={form.subtitle} onChange={e => setForm({ ...form, subtitle: e.target.value })} />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Select label="المستوى" value={form.level} onChange={e => setForm({ ...form, level: e.target.value })}>
              <option value="beginner">مبتدئ</option>
              <option value="intermediate">متوسط</option>
              <option value="advanced">متقدم</option>
            </Select>
            <Input label="السعر ($)" type="number" step="0.01" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} dir="ltr" />
            <Select label="التصنيف" value={form.category_id} onChange={e => setForm({ ...form, category_id: e.target.value })}>
              <option value="">اختر التصنيف</option>
              {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
            </Select>
          </div>
          <Textarea label="الوصف التفصيلي" placeholder="شرح كافة المحاور..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-on-surface-variant block">صورة غلاف الكورس</label>
            <div className="border-2 border-dashed border-outline-variant/40 rounded-2xl p-4 text-center hover:border-primary/50 transition-colors bg-surface-container-low/30">
              <input type="file" id="adminCourseImg" accept="image/*" onChange={e => setFile(e.target.files[0])} className="hidden" />
              <label htmlFor="adminCourseImg" className="cursor-pointer space-y-1 block">
                <Upload size={24} className="mx-auto text-primary" />
                <span className="text-xs font-bold text-on-surface block">{file ? file.name : 'اضغط لاختيار صورة الغلاف'}</span>
                <span className="text-[10px] text-on-surface-variant/70 block">PNG, JPG حتى 5MB</span>
              </label>
            </div>
          </div>
          <SubmitBtn loading={submitting} label="إنشاء الكورس الآن" />
        </form>
      </Modal>

      <Modal open={!!showEditCourse} onClose={() => { setShowEditCourse(null); setForm({ title: '', subtitle: '', description: '', level: 'beginner', price: '0', category_id: '' }); }} title="تعديل الكورس">
        <form onSubmit={updateCourse} className="space-y-4">
          <Input label="عنوان الكورس *" required placeholder="مثال: الدبلومة الشاملة" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
          <Input label="العنوان الفرعي" value={form.subtitle} onChange={e => setForm({ ...form, subtitle: e.target.value })} />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Select label="المستوى" value={form.level} onChange={e => setForm({ ...form, level: e.target.value })}>
              <option value="beginner">مبتدئ</option>
              <option value="intermediate">متوسط</option>
              <option value="advanced">متقدم</option>
            </Select>
            <Input label="السعر ($)" type="number" step="0.01" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} dir="ltr" />
            <Select label="التصنيف" value={form.category_id} onChange={e => setForm({ ...form, category_id: e.target.value })}>
              <option value="">اختر التصنيف</option>
              {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
            </Select>
          </div>
          <Textarea label="الوصف التفصيلي" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-on-surface-variant block">تغيير صورة الغلاف</label>
            <div className="border-2 border-dashed border-outline-variant/40 rounded-2xl p-4 text-center hover:border-primary/50 transition-colors bg-surface-container-low/30">
              <input type="file" id="adminCourseImgEdit" accept="image/*" onChange={e => setFile(e.target.files[0])} className="hidden" />
              <label htmlFor="adminCourseImgEdit" className="cursor-pointer space-y-1 block">
                <Upload size={24} className="mx-auto text-primary" />
                <span className="text-xs font-bold text-on-surface block">{file ? file.name : 'اضغط لاختيار صورة جديدة'}</span>
              </label>
            </div>
          </div>
          <SubmitBtn loading={submitting} label="تحديث الكورس" />
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <Modal open={!!itemToDelete} onClose={() => setItemToDelete(null)} title="تأكيد الحذف">
        <div className="space-y-4">
          <p className="text-sm font-semibold text-on-surface">هل أنت متأكد من حذف الكورس ({itemToDelete?.name})؟ سيتم حذف جميع الموديولات والدروس التابعة له ولا يمكن التراجع عن هذا الإجراء.</p>
          <div className="flex justify-end gap-2">
            <button onClick={() => setItemToDelete(null)} className="px-4 py-2 rounded-xl text-xs font-bold text-on-surface-variant hover:bg-surface-variant/50 transition-colors cursor-pointer">إلغاء</button>
            <button onClick={handleConfirmDelete} disabled={submitting} className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-500 text-white hover:bg-rose-600 transition-colors cursor-pointer disabled:opacity-50">
              {submitting ? 'جاري الحذف...' : 'نعم، احذف'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Assign Instructor Modal */}
      <Modal open={!!showAssignInstructor} onClose={() => setShowAssignInstructor(null)} title={`إدارة محاضري: ${showAssignInstructor?.title}`}>
        <div className="space-y-4">
          <div className="space-y-2">
            <h5 className="text-xs font-bold text-on-surface-variant">المحاضرون المعينون حالياً:</h5>
            {showAssignInstructor?.instructors?.length > 0 ? (
              <div className="space-y-2">
                {showAssignInstructor.instructors.map(inst => (
                  <div key={inst.id} className="flex items-center justify-between p-2 rounded-xl border border-outline-variant/30 bg-surface">
                    <span className="text-xs font-bold text-on-surface">{inst.name}</span>
                    <button onClick={() => handleRemoveInstructor(inst.id)} className="p-1 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-all cursor-pointer">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-on-surface-variant/60">لا يوجد محاضرين معينين</p>
            )}
          </div>
          
          <div className="space-y-2 pt-4 border-t border-outline-variant/20">
            <h5 className="text-xs font-bold text-on-surface-variant">إضافة محاضر:</h5>
            <div className="grid grid-cols-1 gap-2 max-h-[200px] overflow-y-auto pr-1">
              {instructors.filter(i => !showAssignInstructor?.instructors?.find(si => si.id === i.id)).map(inst => (
                <div key={inst.id} className="flex items-center justify-between p-2 rounded-xl border border-outline-variant/30 hover:border-primary/30 transition-all cursor-pointer" onClick={() => handleAddInstructor(inst.id)}>
                  <span className="text-xs font-bold text-on-surface">{inst.name}</span>
                  <Plus size={14} className="text-primary" />
                </div>
              ))}
              {instructors.filter(i => !showAssignInstructor?.instructors?.find(si => si.id === i.id)).length === 0 && (
                <p className="text-[11px] text-on-surface-variant/60 text-center py-2">لا يوجد محاضرين متاحين للإضافة</p>
              )}
            </div>
          </div>
        </div>
      </Modal>

    </div>
  );
}
