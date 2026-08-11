import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import API from '../../../api/axios';
import { 
  Loader2, BookOpen, Plus, CheckCircle2, Users, Play, Trash2, ChevronDown, 
  Video, FileText, ClipboardList, Lock, Edit3, FolderPlus, Upload, Search, X, Paperclip, FileIcon, Download, AlertTriangle
} from 'lucide-react';
import { SectionHeader, Card, Badge, statusBadge, Modal, Input, Select, Textarea, SubmitBtn } from '../ui/SharedUI';

const parseAttachments = (atts) => {
  if (!atts) return [];
  if (typeof atts === 'string') {
    try { return JSON.parse(atts); } catch(e) { return []; }
  }
  return Array.isArray(atts) ? atts : [];
};

const ModuleNode = ({ 
  module, allModules, mIdx, level = 0, 
  expandedModuleIds, toggleModule, 
  setShowAddLesson, setShowAddModule, setModuleForm, 
  setLessonForm, setLessonFile, setShowEditLesson,
  setShowEditModule, setItemToDelete, setLessonAttachmentFiles
}) => {
  const isModuleOpen = expandedModuleIds.includes(module.id);
  const subModules = allModules.filter(m => m.submodule_id === module.id);
  
  const levelStyles = [
    { border: 'border-primary/50', bg: 'bg-primary/5', badgeBg: 'bg-primary/10', badgeText: 'text-primary', badgeBorder: 'border-primary/20' },
    { border: 'border-indigo-500/50', bg: 'bg-indigo-500/5', badgeBg: 'bg-indigo-500/10', badgeText: 'text-indigo-500', badgeBorder: 'border-indigo-500/20' },
    { border: 'border-emerald-500/50', bg: 'bg-emerald-500/5', badgeBg: 'bg-emerald-500/10', badgeText: 'text-emerald-500', badgeBorder: 'border-emerald-500/20' },
    { border: 'border-amber-500/50', bg: 'bg-amber-500/5', badgeBg: 'bg-amber-500/10', badgeText: 'text-amber-500', badgeBorder: 'border-amber-500/20' }
  ];
  const style = levelStyles[Math.min(level, levelStyles.length - 1)];

  return (
    <div className={`border border-outline-variant/30 rounded-2xl bg-surface/60 overflow-hidden ${level > 0 ? `mt-3 border-r-4 ${style.border}` : 'border-r-4 border-r-primary'}`}>
      <div className={`p-3 sm:p-4 flex items-center justify-between gap-3 ${style.bg} transition-colors`}>
        <div className="flex items-center gap-2.5">
          <span className={`text-xs font-bold px-2 py-0.5 rounded-lg border ${style.badgeBg} ${style.badgeText} ${style.badgeBorder}`}>
            {level === 0 ? `موديول ${mIdx + 1}` : `قسم فرعي`}
          </span>
          <h5 className="text-xs sm:text-sm font-bold text-on-surface">{module.name}</h5>
          <span className="text-[11px] text-on-surface-variant">({module.lessons?.length || 0} دروس، {subModules.length} أقسام)</span>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-1.5 sm:gap-2">
          <button onClick={() => {
            setShowAddModule(module.course_id); 
            setModuleForm({ name: '', description: '', order: 1, submodule_id: module.id });
          }} className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-500 font-bold text-[11px] flex items-center gap-1 hover:bg-emerald-500/20 transition-all cursor-pointer">
            <Plus size={12} /><span className="hidden sm:inline">قسم فرعي</span>
          </button>
          <button onClick={() => setShowAddLesson(module.id)} className="px-2.5 py-1 rounded-lg bg-primary text-on-primary font-bold text-[11px] flex items-center gap-1 hover:bg-primary-hover transition-all cursor-pointer">
            <Plus size={12} /><span className="hidden sm:inline">درس</span>
          </button>
          <div className="w-[1px] h-4 bg-outline-variant/30 mx-1"></div>
          <button onClick={() => {
            setModuleForm({ name: module.name, description: module.description || '', order: module.order || 1, submodule_id: module.submodule_id });
            setShowEditModule(module);
          }} className="p-1.5 rounded-lg bg-surface border border-outline-variant/40 text-on-surface-variant hover:text-primary transition-all cursor-pointer" title="تعديل الوحدة">
            <Edit3 size={14} />
          </button>
          <button onClick={() => setItemToDelete({ type: 'module', id: module.id, name: module.name })} className="p-1.5 rounded-lg bg-surface border border-outline-variant/40 text-on-surface-variant hover:text-rose-400 transition-all cursor-pointer" title="حذف الوحدة">
            <Trash2 size={14} />
          </button>
          <button onClick={() => toggleModule(module.id)} className="p-1 text-on-surface-variant cursor-pointer">
            <ChevronDown size={16} className={`transition-transform ${isModuleOpen ? 'rotate-180 text-primary' : ''}`} />
          </button>
        </div>
      </div>
      
      {isModuleOpen && (
        <div className="p-3 border-t border-outline-variant/20 space-y-2 bg-surface">
          {/* Lessons */}
          {module.lessons && module.lessons.length > 0 && (
            <div className="space-y-2 mb-3">
              {module.lessons.map((l) => (
                <div key={l.id} className="flex items-center justify-between p-2.5 rounded-xl border border-outline-variant/20 text-xs bg-surface-container-low/50 hover:bg-surface-container-low transition-colors shadow-sm relative overflow-hidden group">
                  <div className="absolute top-0 right-0 bottom-0 w-1 bg-outline-variant/20 group-hover:bg-primary/40 transition-colors"></div>
                  <div className="flex items-center gap-2.5 pr-2">
                    {l.lesson_type === 'video' && <Video size={14} className="text-primary" />}
                    {l.lesson_type === 'article' && <FileText size={14} className="text-emerald-400" />}
                    {l.lesson_type === 'quiz' && <ClipboardList size={14} className="text-amber-400" />}
                    <span className="font-semibold text-on-surface">{l.title}</span>
                    {parseAttachments(l.attachments).length > 0 && (
                      <div className="flex items-center gap-1 text-[10px] text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded-md border border-amber-500/20" title={`يحتوي على ${parseAttachments(l.attachments).length} مرفقات`}>
                        <Paperclip size={10} />
                        <span>{parseAttachments(l.attachments).length}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      {l.is_free ? (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">معاينة مجانية</span>
                      ) : (
                        <span className="flex items-center gap-1 text-[10px] text-on-surface-variant/60"><Lock size={10} /><span>مغلق</span></span>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        setLessonForm({ title: l.title || '', content: l.content || '', video_url: l.video_url || '', lesson_type: l.lesson_type || 'video', is_free: !!l.is_free, order: l.order || 1 });
                        setLessonFile(null); setLessonAttachmentFiles([]); setShowEditLesson(l);
                      }}
                      className="p-1.5 rounded-lg bg-surface border border-outline-variant/40 text-on-surface-variant hover:text-primary transition-all cursor-pointer"
                      title="تعديل الدرس"
                    >
                      <Edit3 size={12} />
                    </button>
                    <button
                      onClick={() => setItemToDelete({ type: 'lesson', id: l.id, name: l.title })}
                      className="p-1.5 rounded-lg bg-surface border border-outline-variant/40 text-on-surface-variant hover:text-rose-400 transition-all cursor-pointer"
                      title="حذف الدرس"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Submodules */}
          {subModules.length > 0 && (
            <div className="pl-4 pr-1 space-y-3 border-r-2 border-outline-variant/20">
              {subModules.map((sm, smIdx) => (
                <ModuleNode 
                  key={sm.id} module={sm} allModules={allModules} mIdx={smIdx} level={level + 1}
                  expandedModuleIds={expandedModuleIds} toggleModule={toggleModule}
                  setShowAddLesson={setShowAddLesson} setShowAddModule={setShowAddModule}
                  setModuleForm={setModuleForm} setLessonForm={setLessonForm}
                  setLessonFile={setLessonFile} setShowEditLesson={setShowEditLesson}
                  setShowEditModule={setShowEditModule} setItemToDelete={setItemToDelete}
                  setLessonAttachmentFiles={setLessonAttachmentFiles}
                />
              ))}
            </div>
          )}
          
          {(!module.lessons || module.lessons.length === 0) && subModules.length === 0 && (
            <p className="text-[11px] text-on-surface-variant/60 text-center py-2">لا يوجد محتوى في هذا القسم بعد.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default function CoursesSection({ showMsg }) {
  const { t, i18n } = useTranslation();
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [expandedCourseId, setExpandedCourseId] = useState(null);
  const [expandedModuleIds, setExpandedModuleIds] = useState([]);

  const [showAdd, setShowAdd] = useState(false);
  const [showAddModule, setShowAddModule] = useState(null);
  const [showAddLesson, setShowAddLesson] = useState(null);
  const [showEditCourse, setShowEditCourse] = useState(null);
  const [showEditModule, setShowEditModule] = useState(null);
  const [showEditLesson, setShowEditLesson] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null); // { type, id, name }
  const [previewCourse, setPreviewCourse] = useState(null);
  const [previewActiveLesson, setPreviewActiveLesson] = useState(null);
 
  const [form, setForm] = useState({ title: '', subtitle: '', description: '', level: 'beginner', price: '0', category_id: '' });
  const [moduleForm, setModuleForm] = useState({ name: '', description: '', order: 1, submodule_id: null });
  const [lessonForm, setLessonForm] = useState({ title: '', content: '', video_url: '', lesson_type: 'video', is_free: false, order: 1 });
  const [file, setFile] = useState(null);
  const [lessonFile, setLessonFile] = useState(null);
  const [lessonAttachmentFiles, setLessonAttachmentFiles] = useState([]);

  // Instructor assignment
  const [showAssignInstructor, setShowAssignInstructor] = useState(null); // course object
  const [instructors, setInstructors] = useState([]);
  const [instrSearch, setInstrSearch] = useState('');

  // Bunny Videos
  const [showBunnyModal, setShowBunnyModal] = useState(false);
  const [bunnyVideos, setBunnyVideos] = useState([]);
  const [bunnyLoading, setBunnyLoading] = useState(false);
  const [bunnyLibraryId, setBunnyLibraryId] = useState('');
  const [bunnySearch, setBunnySearch] = useState('');

  const fetchBunnyVideos = async () => {
    setBunnyLoading(true);
    try {
      const res = await API.get('/admin/bunny-videos');
      setBunnyVideos(res.data.videos || []);
      setBunnyLibraryId(res.data.libraryId || '');
    } catch (err) {
      showMsg('error', 'خطأ في جلب الفيديوهات');
    } finally {
      setBunnyLoading(false);
    }
  };

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
      if (itemToDelete.type === 'course') await API.delete(`/admin/courses/${itemToDelete.id}`);
      else if (itemToDelete.type === 'module') await API.delete(`/admin/modules/${itemToDelete.id}`);
      else if (itemToDelete.type === 'lesson') await API.delete(`/admin/lessons/${itemToDelete.id}`);
      
      showMsg('success', 'تم الحذف بنجاح');
      setItemToDelete(null);
      fetchData();
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

  const createModule = async (e) => {
    e.preventDefault(); setSubmitting(true);
    try {
      await API.post('/admin/modules', { ...moduleForm, course_id: showAddModule });
      showMsg('success', 'تم إضافة الوحدة التعليمية');
      setShowAddModule(null); setModuleForm({ name: '', description: '', order: 1, submodule_id: null }); fetchData();
    } catch (err) { showMsg('error', err.response?.data?.message || 'خطأ في إضافة الوحدة'); }
    finally { setSubmitting(false); }
  };

  const updateModule = async (e) => {
    e.preventDefault(); setSubmitting(true);
    try {
      await API.put(`/admin/modules/${showEditModule.id}`, moduleForm);
      showMsg('success', 'تم تحديث الوحدة التعليمية');
      setShowEditModule(null); setModuleForm({ name: '', description: '', order: 1, submodule_id: null }); fetchData();
    } catch (err) { showMsg('error', err.response?.data?.message || 'خطأ في تحديث الوحدة'); }
    finally { setSubmitting(false); }
  };

  const createLesson = async (e) => {
    e.preventDefault(); setSubmitting(true);
    try {
      const fd = new FormData();
      Object.entries(lessonForm).forEach(([k, v]) => fd.append(k, v));
      fd.append('module_id', showAddLesson);
      if (lessonFile) fd.append('video', lessonFile);
      // Append each attachment file
      lessonAttachmentFiles.forEach(f => fd.append('attachments', f));
      await API.post('/admin/lessons', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      showMsg('success', 'تم إضافة الدرس بنجاح');
      setShowAddLesson(null);
      setLessonForm({ title: '', content: '', video_url: '', lesson_type: 'video', is_free: false, order: 1 });
      setLessonFile(null); setLessonAttachmentFiles([]); fetchData();
    } catch (err) { showMsg('error', err.response?.data?.message || 'خطأ في إضافة الدرس'); }
    finally { setSubmitting(false); }
  };

  const updateLesson = async (e) => {
    e.preventDefault(); setSubmitting(true);
    try {
      const fd = new FormData();
      Object.entries(lessonForm).forEach(([k, v]) => fd.append(k, v));
      if (lessonFile) fd.append('video', lessonFile);
      // Append each new attachment file
      lessonAttachmentFiles.forEach(f => fd.append('attachments', f));
      await API.put(`/admin/lessons/${showEditLesson.id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      showMsg('success', 'تم تحديث الدرس بنجاح');
      setShowEditLesson(null);
      setLessonForm({ title: '', content: '', video_url: '', lesson_type: 'video', is_free: false, order: 1 });
      setLessonFile(null); setLessonAttachmentFiles([]); fetchData();
    } catch (err) { showMsg('error', err.response?.data?.message || 'خطأ في تحديث الدرس'); }
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

  const toggleModule = (id) => {
    setExpandedModuleIds(prev => 
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    );
  };

  const handleRemoveInstructor = async (instructorId) => {
    if (!showAssignInstructor) return;
    try {
      await API.delete(`/admin/courses/${showAssignInstructor.id}/instructors/${instructorId}`);
      showMsg('success', 'تم إزالة المحاضر');
      await fetchData();
    } catch (err) { showMsg('error', err.response?.data?.message || 'خطأ في إزالة المحاضر'); }
  };

  return (
    <div className="space-y-6" dir={i18n.language === 'en' ? 'ltr' : 'rtl'}>
      <SectionHeader
        title={t('admin.sections.courses')}
        count={courses.length}
        onAdd={() => setShowAdd(true)}
        addLabel="New Course / كورس جديد"
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
        <div className="space-y-4">
          {courses.map((c) => {
            const isCourseOpen = expandedCourseId === c.id;
            const modulesCount = c.modules?.length || 0;
            const totalLessons = c.modules?.reduce((acc, m) => acc + (m.lessons?.length || 0), 0) || 0;
            return (
              <Card key={c.id} className={`p-0 overflow-hidden border shadow-sm transition-all ${isCourseOpen ? 'border-r-4 border-r-primary/70 border-outline-variant/60' : 'border-r-4 border-r-primary/20 border-outline-variant/40 hover:border-outline-variant/80'}`}>
                {/* Course Header */}
                <div className={`p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 transition-colors ${isCourseOpen ? 'bg-primary/5' : 'bg-surface-container-low/40'}`}>
                  <div className="flex items-center gap-3.5 flex-1 min-w-[240px]">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center shrink-0">
                      <BookOpen size={22} />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-base font-extrabold text-on-surface">{c.title}</h4>
                        {statusBadge(c.status)}
                        {c.status === 'pending_review' && (
                          <button onClick={() => approveCourse(c.id)} title="اعتماد الكورس" className="px-2 py-0.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer">
                            <CheckCircle2 size={12} /> اعتماد
                          </button>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-on-surface-variant">
                        <span className="font-semibold text-primary">{c.category?.name || 'بدون تصنيف'}</span>
                        <span>•</span>
                        <span>{c.instructors?.map(i => i.name).join('، ') || 'بدون محاضر'}</span>
                        <span>•</span>
                        <span>{modulesCount} موديول</span>
                        <span>•</span>
                        <span>{totalLessons} درس</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setShowAddModule(c.id)} className="px-3 py-1.5 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer" title="إضافة وحدة تعليمية">
                      <Plus size={14} /><span className="hidden sm:inline">وحدة جديدة</span>
                    </button>
                    <button
                      onClick={() => { setShowAssignInstructor(c); setInstrSearch(''); }}
                      title="إدارة المحاضرين"
                      className="px-3 py-1.5 rounded-xl bg-violet-500/10 hover:bg-violet-500/20 text-violet-400 border border-violet-500/20 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Users size={14} /><span className="hidden sm:inline">محاضرون</span>
                    </button>
                    <button onClick={() => {
                      setPreviewCourse(c);
                      if (c.modules?.[0]?.lessons?.[0]) setPreviewActiveLesson(c.modules[0].lessons[0]);
                      else setPreviewActiveLesson(null);
                    }} className="p-2 rounded-xl bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 transition-all cursor-pointer" title="مشاهدة محتوى الكورس">
                      <Play size={16} />
                    </button>
                    <button onClick={() => {
                      setForm({ title: c.title, subtitle: c.subtitle || '', description: c.description || '', level: c.level || 'beginner', price: c.price || '0', category_id: c.category_id || '' });
                      setFile(null); setShowEditCourse(c);
                    }} className="p-2 rounded-xl bg-surface border border-outline-variant/40 text-on-surface-variant hover:text-primary transition-all cursor-pointer" title="تعديل الكورس">
                      <Edit3 size={16} />
                    </button>
                    <button onClick={() => setItemToDelete({ type: 'course', id: c.id, name: c.title })} className="p-2 rounded-xl bg-surface border border-outline-variant/40 text-on-surface-variant hover:text-rose-400 transition-all cursor-pointer" title="حذف الكورس">
                      <Trash2 size={16} />
                    </button>
                    <button onClick={() => setExpandedCourseId(expandedCourseId === c.id ? null : c.id)} className="p-2 rounded-xl bg-surface border border-outline-variant/40 text-on-surface-variant hover:text-on-surface transition-all cursor-pointer">
                      <ChevronDown size={18} className={`transition-transform duration-300 ${isCourseOpen ? 'rotate-180 text-primary' : ''}`} />
                    </button>
                  </div>
                </div>

                {/* Expanded Modules & Lessons */}
                {isCourseOpen && (
                  <div className="border-t border-outline-variant/30 p-4 sm:p-5 space-y-3 bg-surface-container-low/10">
                    {c.modules && c.modules.length > 0 ? (
                      c.modules.filter(m => !m.submodule_id).map((m, mIdx) => (
                        <ModuleNode 
                          key={m.id} 
                          module={m} 
                          allModules={c.modules} 
                          mIdx={mIdx} 
                          level={0}
                          expandedModuleIds={expandedModuleIds} 
                          toggleModule={toggleModule}
                          setShowAddLesson={setShowAddLesson} 
                          setShowAddModule={setShowAddModule}
                          setModuleForm={setModuleForm} 
                          setLessonForm={setLessonForm}
                          setLessonFile={setLessonFile} 
                          setShowEditLesson={setShowEditLesson}
                          setShowEditModule={setShowEditModule}
                          setItemToDelete={setItemToDelete}
                          setLessonAttachmentFiles={setLessonAttachmentFiles}
                        />
                      ))
                    ) : (
                      <div className="text-center py-6 border border-dashed border-outline-variant/40 rounded-2xl space-y-2">
                        <FolderPlus size={24} className="mx-auto text-on-surface-variant/40" />
                        <p className="text-xs text-on-surface-variant font-medium">لم يتم إدراج وحدات تعليمية في هذا الكورس بعد.</p>
                        <button onClick={() => {
                          setShowAddModule(c.id);
                          setModuleForm({ name: '', description: '', order: 1, submodule_id: null });
                        }} className="px-3 py-1.5 rounded-xl bg-primary/10 text-primary font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer">
                          <Plus size={14} /><span>إضافة وحدة الآن</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* 1. Create Course Modal */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="إنشاء كورس جديد">
        <form onSubmit={createCourse} className="space-y-4">
          <Input label="عنوان الكورس *" required placeholder="مثال: الدبلومة الشاملة في الرعاية الفائقة" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
          <Input label="العنوان الفرعي" placeholder="نظرة مبسطة وتطبيقية للمفاهيم الأساسية" value={form.subtitle} onChange={e => setForm({ ...form, subtitle: e.target.value })} />
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
          <Textarea label="الوصف التفصيلي" placeholder="شرح كافة المحاور التي سيتعلمها الطالب..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
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

      {/* Edit Course Modal */}
      <Modal open={!!showEditCourse} onClose={() => { setShowEditCourse(null); setForm({ title: '', subtitle: '', description: '', level: 'beginner', price: '0', category_id: '' }); }} title="تعديل الكورس">
        <form onSubmit={updateCourse} className="space-y-4">
          <Input label="عنوان الكورس *" required placeholder="مثال: الدبلومة الشاملة في الرعاية الفائقة" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
          <Input label="العنوان الفرعي" placeholder="نظرة مبسطة وتطبيقية للمفاهيم الأساسية" value={form.subtitle} onChange={e => setForm({ ...form, subtitle: e.target.value })} />
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
          <Textarea label="الوصف التفصيلي" placeholder="شرح كافة المحاور التي سيتعلمها الطالب..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-on-surface-variant block">تغيير صورة الغلاف</label>
            <div className="border-2 border-dashed border-outline-variant/40 rounded-2xl p-4 text-center hover:border-primary/50 transition-colors bg-surface-container-low/30">
              <input type="file" id="adminCourseImgEdit" accept="image/*" onChange={e => setFile(e.target.files[0])} className="hidden" />
              <label htmlFor="adminCourseImgEdit" className="cursor-pointer space-y-1 block">
                <Upload size={24} className="mx-auto text-primary" />
                <span className="text-xs font-bold text-on-surface block">{file ? file.name : 'اضغط لاختيار صورة جديدة'}</span>
                <span className="text-[10px] text-on-surface-variant/70 block">PNG, JPG حتى 5MB</span>
              </label>
            </div>
          </div>
          <SubmitBtn loading={submitting} label="تحديث الكورس" />
        </form>
      </Modal>

      {/* 2. Add Module Modal */}
      <Modal open={!!showAddModule} onClose={() => setShowAddModule(null)} title="إضافة وحدة تعليمية جديدة">
        <form onSubmit={createModule} className="space-y-4">
          <Input label="اسم الوحدة *" required placeholder="مثال: الفصل الأول - المقدمة والأساسيات" value={moduleForm.name} onChange={e => setModuleForm({ ...moduleForm, name: e.target.value })} />
          <Textarea label="الوصف" placeholder="نبذة مختصرة عن مواضيع هذا الفصل..." value={moduleForm.description} onChange={e => setModuleForm({ ...moduleForm, description: e.target.value })} />
          <Input label="الترتيب في المنهاج" type="number" value={moduleForm.order} onChange={e => setModuleForm({ ...moduleForm, order: e.target.value })} />
          <SubmitBtn loading={submitting} label="إضافة الوحدة" />
        </form>
      </Modal>

      {/* Edit Module Modal */}
      <Modal open={!!showEditModule} onClose={() => setShowEditModule(null)} title="تعديل الوحدة التعليمية">
        <form onSubmit={updateModule} className="space-y-4">
          <Input label="اسم الوحدة *" required placeholder="مثال: الفصل الأول - المقدمة والأساسيات" value={moduleForm.name} onChange={e => setModuleForm({ ...moduleForm, name: e.target.value })} />
          <Textarea label="الوصف" placeholder="نبذة مختصرة عن مواضيع هذا الفصل..." value={moduleForm.description} onChange={e => setModuleForm({ ...moduleForm, description: e.target.value })} />
          <Input label="الترتيب في المنهاج" type="number" value={moduleForm.order} onChange={e => setModuleForm({ ...moduleForm, order: e.target.value })} />
          <SubmitBtn loading={submitting} label="تحديث الوحدة" />
        </form>
      </Modal>

      {/* 3. Add Lesson Modal */}
      <Modal open={!!showAddLesson} onClose={() => setShowAddLesson(null)} title="إضافة درس جديد">
        <form onSubmit={createLesson} className="space-y-4">
          <Input label="عنوان الدرس *" required placeholder="مثال: الشرح العملي للتطبيق الأولي" value={lessonForm.title} onChange={e => setLessonForm({ ...lessonForm, title: e.target.value })} />
          <div className="grid grid-cols-2 gap-3">
            <Select label="نوع الدرس" value={lessonForm.lesson_type} onChange={e => setLessonForm({ ...lessonForm, lesson_type: e.target.value })}>
              <option value="video">فيديو تفاعلي</option>
              <option value="article">مقال نصي</option>
            </Select>
            <Input label="الترتيب" type="number" value={lessonForm.order} onChange={e => setLessonForm({ ...lessonForm, order: e.target.value })} />
          </div>
          {lessonForm.lesson_type === 'video' && (
            <div className="space-y-4 border border-outline-variant/30 rounded-2xl p-4 bg-surface-container-low/20">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-on-surface-variant block">رفع فيديو من الجهاز</label>
                <input type="file" accept="video/*" onChange={e => setLessonFile(e.target.files[0])} className="text-xs text-on-surface-variant w-full file:ml-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer" />
              </div>
              <div className="flex items-center gap-2">
                <div className="h-[1px] flex-1 bg-outline-variant/30"></div>
                <span className="text-[10px] text-on-surface-variant font-bold">أو اختيار من</span>
                <button
                  type="button"
                  onClick={() => { setShowBunnyModal(true); fetchBunnyVideos(); }}
                  className="px-3 py-1 bg-violet-500/10 text-violet-500 rounded-lg text-[10px] font-bold hover:bg-violet-500/20 transition-all border border-violet-500/20"
                >
                  مدير ملفات Bunny
                </button>
                <div className="h-[1px] flex-1 bg-outline-variant/30"></div>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-[1px] flex-1 bg-outline-variant/30"></div>
                <span className="text-[10px] text-on-surface-variant font-bold">أو رابط فيديو</span>
                <div className="h-[1px] flex-1 bg-outline-variant/30"></div>
              </div>
              <Input label="رابط من YouTube / Vimeo / Cloud" value={lessonForm.video_url} onChange={e => setLessonForm({ ...lessonForm, video_url: e.target.value })} dir="ltr" placeholder="https://..." />
            </div>
          )}
          {(lessonForm.lesson_type === 'article' || lessonForm.lesson_type === 'quiz') && (
            <Textarea label={lessonForm.lesson_type === 'article' ? 'محتوى المقال النصي' : 'تعليمات وإرشادات الكويز'} value={lessonForm.content} onChange={e => setLessonForm({ ...lessonForm, content: e.target.value })} />
          )}
          <div className="flex items-center gap-2 pt-1">
            <input type="checkbox" id="adminLessonFree" checked={lessonForm.is_free} onChange={e => setLessonForm({ ...lessonForm, is_free: e.target.checked })} className="w-4 h-4 rounded text-primary focus:ring-primary cursor-pointer" />
            <label htmlFor="adminLessonFree" className="text-xs font-bold text-on-surface cursor-pointer select-none">تحديد كـ معاينة مجانية (متاح بدون اشتراك)</label>
          </div>

          {/* Attachments */}
          <div className="space-y-2 border border-outline-variant/30 rounded-2xl p-4 bg-surface-container-low/20">
            <div className="flex items-center gap-2 mb-2">
              <Paperclip size={14} className="text-amber-400" />
              <span className="text-xs font-bold text-on-surface-variant">مرفقات الدرس (PDF، ملفات، إلخ)</span>
            </div>
            <input
              id="addLessonAttachments"
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip,.txt"
              onChange={e => setLessonAttachmentFiles(Array.from(e.target.files))}
              className="text-xs text-on-surface-variant w-full file:ml-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-amber-500/10 file:text-amber-500 hover:file:bg-amber-500/20 cursor-pointer"
            />
            {lessonAttachmentFiles.length > 0 && (
              <div className="space-y-1.5 mt-2">
                {lessonAttachmentFiles.map((f, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-amber-500/5 border border-amber-500/20 text-xs">
                    <div className="flex items-center gap-2">
                      <FileIcon size={12} className="text-amber-400 shrink-0" />
                      <span className="text-on-surface font-medium truncate max-w-[200px]">{f.name}</span>
                      <span className="text-on-surface-variant/60">({(f.size / 1024).toFixed(1)} KB)</span>
                    </div>
                    <button type="button" onClick={() => setLessonAttachmentFiles(prev => prev.filter((_, i) => i !== idx))} className="p-1 rounded-lg hover:bg-rose-500/10 text-on-surface-variant hover:text-rose-400 transition-all cursor-pointer">
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <SubmitBtn loading={submitting} label="إضافة الدرس" />
        </form>
      </Modal>

      {/* 4. Edit Lesson Modal */}
      <Modal open={!!showEditLesson} onClose={() => { setShowEditLesson(null); setLessonForm({ title: '', content: '', video_url: '', lesson_type: 'video', is_free: false, order: 1 }); }} title="تعديل الدرس">
        <form onSubmit={updateLesson} className="space-y-4">
          <Input label="عنوان الدرس *" required placeholder="مثال: الشرح العملي للتطبيق الأولي" value={lessonForm.title} onChange={e => setLessonForm({ ...lessonForm, title: e.target.value })} />
          <div className="grid grid-cols-2 gap-3">
            <Select label="نوع الدرس" value={lessonForm.lesson_type} onChange={e => setLessonForm({ ...lessonForm, lesson_type: e.target.value })}>
              <option value="video">فيديو تفاعلي</option>
              <option value="article">مقال نصي</option>
            </Select>
            <Input label="الترتيب" type="number" value={lessonForm.order} onChange={e => setLessonForm({ ...lessonForm, order: e.target.value })} />
          </div>
          {lessonForm.lesson_type === 'video' && (
            <div className="space-y-4 border border-outline-variant/30 rounded-2xl p-4 bg-surface-container-low/20">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-on-surface-variant block">تغيير الفيديو من الجهاز</label>
                <input type="file" accept="video/*" onChange={e => setLessonFile(e.target.files[0])} className="text-xs text-on-surface-variant w-full file:ml-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer" />
              </div>
              <div className="flex items-center gap-2">
                <div className="h-[1px] flex-1 bg-outline-variant/30"></div>
                <span className="text-[10px] text-on-surface-variant font-bold">أو اختيار من</span>
                <button
                  type="button"
                  onClick={() => { setShowBunnyModal(true); fetchBunnyVideos(); }}
                  className="px-3 py-1 bg-violet-500/10 text-violet-500 rounded-lg text-[10px] font-bold hover:bg-violet-500/20 transition-all border border-violet-500/20"
                >
                  مدير ملفات Bunny
                </button>
                <div className="h-[1px] flex-1 bg-outline-variant/30"></div>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-[1px] flex-1 bg-outline-variant/30"></div>
                <span className="text-[10px] text-on-surface-variant font-bold">أو رابط فيديو</span>
                <div className="h-[1px] flex-1 bg-outline-variant/30"></div>
              </div>
              <Input label="رابط من YouTube / Vimeo / Cloud" value={lessonForm.video_url} onChange={e => setLessonForm({ ...lessonForm, video_url: e.target.value })} dir="ltr" placeholder="https://..." />
            </div>
          )}
          {(lessonForm.lesson_type === 'article' || lessonForm.lesson_type === 'quiz') && (
            <Textarea label={lessonForm.lesson_type === 'article' ? 'محتوى المقال النصي' : 'تعليمات وإرشادات الكويز'} value={lessonForm.content} onChange={e => setLessonForm({ ...lessonForm, content: e.target.value })} />
          )}
          <div className="flex items-center gap-2 pt-1">
            <input type="checkbox" id="adminEditLessonFree" checked={lessonForm.is_free} onChange={e => setLessonForm({ ...lessonForm, is_free: e.target.checked })} className="w-4 h-4 rounded text-primary focus:ring-primary cursor-pointer" />
            <label htmlFor="adminEditLessonFree" className="text-xs font-bold text-on-surface cursor-pointer select-none">تحديد كـ معاينة مجانية (متاح بدون اشتراك)</label>
          </div>

          {/* Existing Attachments */}
          {parseAttachments(showEditLesson?.attachments).length > 0 && (
            <div className="space-y-2 border border-outline-variant/30 rounded-2xl p-4 bg-surface-container-low/20">
              <div className="flex items-center gap-2 mb-2">
                <Paperclip size={14} className="text-amber-400" />
                <span className="text-xs font-bold text-on-surface-variant">المرفقات الحالية ({parseAttachments(showEditLesson.attachments).length})</span>
              </div>
              <div className="space-y-1.5">
                {parseAttachments(showEditLesson.attachments).map((att, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-amber-500/5 border border-amber-500/20 text-xs">
                    <div className="flex items-center gap-2">
                      <FileIcon size={12} className="text-amber-400 shrink-0" />
                      <span className="text-on-surface font-medium truncate max-w-[180px]">{att.name}</span>
                      {att.size > 0 && <span className="text-on-surface-variant/60">({(att.size / 1024).toFixed(1)} KB)</span>}
                    </div>
                    <div className="flex items-center gap-1.5">
                      {att.url && (
                        <a
                          href={att.url.startsWith('http') ? att.url : `http://localhost:4500${att.url}`}
                          target="_blank" rel="noreferrer"
                          className="p-1 rounded-lg hover:bg-primary/10 text-on-surface-variant hover:text-primary transition-all"
                          title="تحميل"
                        >
                          <Download size={12} />
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            const res = await API.delete(`/admin/lessons/${showEditLesson.id}/attachments/${idx}`);
                            setShowEditLesson(prev => ({ ...prev, attachments: res.data.attachments }));
                            showMsg('success', 'تم حذف المرفق');
                          } catch { showMsg('error', 'خطأ في حذف المرفق'); }
                        }}
                        className="p-1 rounded-lg hover:bg-rose-500/10 text-on-surface-variant hover:text-rose-400 transition-all cursor-pointer"
                        title="حذف المرفق"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add New Attachments */}
          <div className="space-y-2 border border-dashed border-outline-variant/30 rounded-2xl p-4 bg-surface-container-low/10">
            <div className="flex items-center gap-2 mb-2">
              <Paperclip size={14} className="text-amber-400" />
              <span className="text-xs font-bold text-on-surface-variant">إضافة مرفقات جديدة</span>
            </div>
            <input
              id="editLessonAttachments"
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip,.txt"
              onChange={e => setLessonAttachmentFiles(Array.from(e.target.files))}
              className="text-xs text-on-surface-variant w-full file:ml-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-amber-500/10 file:text-amber-500 hover:file:bg-amber-500/20 cursor-pointer"
            />
            {lessonAttachmentFiles.length > 0 && (
              <div className="space-y-1.5 mt-2">
                {lessonAttachmentFiles.map((f, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-amber-500/5 border border-amber-500/20 text-xs">
                    <div className="flex items-center gap-2">
                      <FileIcon size={12} className="text-amber-400 shrink-0" />
                      <span className="text-on-surface font-medium truncate max-w-[200px]">{f.name}</span>
                      <span className="text-on-surface-variant/60">({(f.size / 1024).toFixed(1)} KB)</span>
                    </div>
                    <button type="button" onClick={() => setLessonAttachmentFiles(prev => prev.filter((_, i) => i !== idx))} className="p-1 rounded-lg hover:bg-rose-500/10 text-on-surface-variant hover:text-rose-400 transition-all cursor-pointer">
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <SubmitBtn loading={submitting} label="تحديث الدرس" />
        </form>
      </Modal>

      {/* Bunny CDN Modal */}
      <Modal open={showBunnyModal} onClose={() => setShowBunnyModal(false)} title="مدير ملفات Bunny Stream">
        <div className="space-y-4">
          <div className="relative">
            <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50" />
            <input
              value={bunnySearch}
              onChange={e => setBunnySearch(e.target.value)}
              placeholder="بحث في الفيديوهات..."
              className="w-full pr-8 pl-4 py-2 bg-surface/80 border border-outline-variant/50 rounded-2xl text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary transition-all"
            />
          </div>
          {bunnyLoading ? (
            <div className="py-8 flex flex-col items-center justify-center gap-2 text-on-surface-variant">
              <Loader2 size={24} className="animate-spin text-primary" />
              <span className="text-xs font-bold">جاري تحميل الفيديوهات...</span>
            </div>
          ) : (
            <div className="max-h-80 overflow-y-auto space-y-2 custom-scrollbar">
              {bunnyVideos.filter(v => v.title?.toLowerCase().includes(bunnySearch.toLowerCase())).length === 0 ? (
                <p className="text-xs text-on-surface-variant text-center py-4">لا توجد فيديوهات</p>
              ) : (
                bunnyVideos
                  .filter(v => v.title?.toLowerCase().includes(bunnySearch.toLowerCase()))
                  .map(video => (
                    <div key={video.guid} className="flex items-center justify-between p-3 rounded-xl border border-outline-variant/30 bg-surface/60 hover:border-outline-variant/60 transition-all cursor-pointer" onClick={() => {
                      setLessonForm({ ...lessonForm, video_url: `https://iframe.mediadelivery.net/embed/${bunnyLibraryId}/${video.guid}` });
                      setShowBunnyModal(false);
                    }}>
                      <div className="flex items-center gap-3">
                        <div className="w-24 h-16 rounded-lg bg-surface-container-low overflow-hidden shrink-0 relative flex items-center justify-center text-primary/40 bg-surface-container-high border border-outline-variant/20">
                          <Video size={24} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-on-surface line-clamp-1">{video.title}</p>
                          <p className="text-[10px] text-on-surface-variant" dir="ltr">{video.guid}</p>
                        </div>
                      </div>
                      <button className="px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 text-[11px] font-bold transition-all">
                        اختيار
                      </button>
                    </div>
                  ))
              )}
            </div>
          )}
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal open={!!itemToDelete} onClose={() => !submitting && setItemToDelete(null)} title="تأكيد الحذف">
        <div className="space-y-5 text-center">
          <div className="w-16 h-16 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(244,63,94,0.1)]">
            <AlertTriangle size={32} />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-extrabold text-on-surface">هل أنت متأكد من الحذف؟</h3>
            <p className="text-sm text-on-surface-variant max-w-[280px] mx-auto leading-relaxed">
              سيتم حذف <strong className="text-rose-500 mx-1">{itemToDelete?.name}</strong> نهائياً. 
              {itemToDelete?.type === 'course' && ' هذا الإجراء سيؤدي إلى حذف الكورس وكل ما يحتويه من وحدات ودروس.'}
              {itemToDelete?.type === 'module' && ' هذا الإجراء سيؤدي إلى حذف الوحدة وكل محتوياتها من دروس وأقسام.'}
              {itemToDelete?.type === 'lesson' && ' هذا الإجراء لا يمكن التراجع عنه.'}
            </p>
          </div>
          <div className="flex items-center gap-3 pt-3">
            <button
              onClick={() => setItemToDelete(null)}
              disabled={submitting}
              className="flex-1 px-4 py-2.5 rounded-xl font-bold text-sm bg-surface border border-outline-variant/40 text-on-surface-variant hover:bg-surface-container transition-all"
            >
              إلغاء
            </button>
            <button
              onClick={handleConfirmDelete}
              disabled={submitting}
              className="flex-1 px-4 py-2.5 rounded-xl font-bold text-sm bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-500/20 transition-all flex items-center justify-center gap-2"
            >
              {submitting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
              <span>تأكيد الحذف</span>
            </button>
          </div>
        </div>
      </Modal>

      {/* Assign Instructor Modal */}
      <Modal
        open={!!showAssignInstructor}
        onClose={() => { setShowAssignInstructor(null); setInstrSearch(''); }}
        title={`إدارة محاضري: ${showAssignInstructor?.title || ''}`}
      >
        {showAssignInstructor && (() => {
          const assignedIds = new Set((showAssignInstructor.instructors || []).map(i => i.id));
          const filtered = instructors.filter(i =>
            i.name?.toLowerCase().includes(instrSearch.toLowerCase()) ||
            i.email?.toLowerCase().includes(instrSearch.toLowerCase())
          );
          return (
            <div className="space-y-4">
              {/* Currently assigned */}
              {showAssignInstructor.instructors?.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-bold text-on-surface-variant">المحاضرون الحاليون ({showAssignInstructor.instructors.length})</p>
                  <div className="space-y-1.5">
                    {showAssignInstructor.instructors.map(instr => (
                      <div key={instr.id} className="flex items-center justify-between p-2.5 rounded-xl bg-violet-500/10 border border-violet-500/20">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-violet-500/20 text-violet-400 flex items-center justify-center text-xs font-black">
                            {instr.name?.[0]?.toUpperCase() || 'M'}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-on-surface">{instr.name}</p>
                            <p className="text-[11px] text-on-surface-variant" dir="ltr">{instr.email}</p>
                          </div>
                        </div>
                        <button
                          onClick={async () => {
                            await handleRemoveInstructor(instr.id);
                            setShowAssignInstructor(prev => prev ? { ...prev, instructors: prev.instructors.filter(i => i.id !== instr.id) } : null);
                          }}
                          className="p-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 transition-all cursor-pointer"
                          title="إزالة"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Search + Add */}
              <div className="space-y-2">
                <p className="text-xs font-bold text-on-surface-variant">إضافة محاضر جديد</p>
                <div className="relative">
                  <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50" />
                  <input
                    value={instrSearch}
                    onChange={e => setInstrSearch(e.target.value)}
                    placeholder="بحث بالاسم أو الإيميل..."
                    className="w-full pr-8 pl-4 py-2 bg-surface/80 border border-outline-variant/50 rounded-2xl text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary transition-all"
                  />
                </div>
                <div className="max-h-52 overflow-y-auto space-y-1.5 custom-scrollbar">
                  {filtered.length === 0 ? (
                    <p className="text-xs text-on-surface-variant text-center py-4">لا يوجد محاضرون</p>
                  ) : (
                    filtered.map(instr => {
                      const isAssigned = assignedIds.has(instr.id);
                      return (
                        <div key={instr.id} className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${isAssigned ? 'bg-violet-500/5 border-violet-500/20 opacity-60' : 'bg-surface/60 border-outline-variant/30 hover:border-outline-variant/60'}`}>
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-black">
                              {instr.name?.[0]?.toUpperCase() || 'M'}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-on-surface">{instr.name}</p>
                              <p className="text-[11px] text-on-surface-variant" dir="ltr">{instr.email}</p>
                            </div>
                          </div>
                          {isAssigned ? (
                            <span className="text-[11px] text-violet-400 font-bold px-2 py-0.5 rounded-lg bg-violet-500/10 border border-violet-500/20">مضاف</span>
                          ) : (
                            <button
                              onClick={async () => {
                                await handleAddInstructor(instr.id);
                                setShowAssignInstructor(prev => prev ? { ...prev, instructors: [...(prev.instructors || []), instr] } : null);
                              }}
                              className="p-1.5 rounded-lg bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 transition-all cursor-pointer"
                              title="إضافة"
                            >
                              <Plus size={14} />
                            </button>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          );
        })()}
      </Modal>

      {/* Course Preview Modal */}
      {previewCourse && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 sm:p-6">
          <div className="bg-surface border border-outline-variant/30 rounded-3xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-outline-variant/20 bg-surface-container-low/50 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <Play size={20} className="ml-1" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-on-surface">معاينة الكورس: {previewCourse.title}</h3>
                  <p className="text-xs text-on-surface-variant line-clamp-1">{previewActiveLesson?.title || 'اختر درساً للمشاهدة'}</p>
                </div>
              </div>
              <button onClick={() => { setPreviewCourse(null); setPreviewActiveLesson(null); }} className="p-2 rounded-xl hover:bg-rose-500/10 text-on-surface-variant hover:text-rose-400 transition-all">
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="flex flex-col md:flex-row flex-1 overflow-hidden min-h-[500px]">
              {/* Sidebar: Modules & Lessons */}
              <div className="w-full md:w-80 shrink-0 border-l border-outline-variant/20 bg-surface-container-lowest overflow-y-auto custom-scrollbar p-3 space-y-2">
                {previewCourse.modules?.length === 0 ? (
                  <p className="text-xs text-center text-on-surface-variant py-8">لا يوجد محتوى في هذا الكورس بعد.</p>
                ) : (
                  previewCourse.modules?.map((m, mIdx) => (
                    <div key={m.id} className="space-y-1">
                      <div className="p-2.5 bg-surface-container-low rounded-xl border border-outline-variant/30 text-xs font-bold text-on-surface">
                        {mIdx + 1}. {m.name}
                      </div>
                      <div className="pr-2 space-y-1">
                        {m.lessons?.map((l, lIdx) => (
                          <button
                            key={l.id}
                            onClick={() => setPreviewActiveLesson(l)}
                            className={`w-full flex items-start gap-2.5 p-2.5 rounded-xl transition-all text-right ${previewActiveLesson?.id === l.id ? 'bg-primary/10 border-primary/30 text-primary border' : 'bg-transparent border border-transparent hover:bg-surface-container-low text-on-surface-variant hover:text-on-surface'}`}
                          >
                            <div className="mt-0.5 shrink-0">
                              {l.lesson_type === 'video' && <Play size={14} />}
                              {l.lesson_type === 'article' && <FileText size={14} />}
                              {l.lesson_type === 'quiz' && <ClipboardList size={14} />}
                            </div>
                            <div className="flex-1 space-y-1">
                              <p className="text-[11px] font-bold leading-tight">{l.title}</p>
                              <div className="flex items-center gap-2">
                                {l.is_free && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500">مجاني</span>}
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Main Player Area */}
              <div className="flex-1 bg-black/5 relative overflow-y-auto custom-scrollbar p-4 sm:p-6 flex flex-col">
                {previewActiveLesson ? (
                  <div className="max-w-4xl w-full mx-auto space-y-4">
                    {previewActiveLesson.lesson_type === 'video' ? (
                      <div className="rounded-2xl overflow-hidden bg-black aspect-video shadow-2xl relative border border-outline-variant/20">
                        {previewActiveLesson.video_url ? (
                          previewActiveLesson.video_url.includes('iframe.mediadelivery.net') || previewActiveLesson.video_url.includes('youtube.com') || previewActiveLesson.video_url.includes('vimeo.com') ? (
                            <iframe
                              src={previewActiveLesson.video_url}
                              className="w-full h-full absolute inset-0"
                              frameBorder="0"
                              allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
                              allowFullScreen
                            ></iframe>
                          ) : (
                            <video 
                              src={previewActiveLesson.video_url.startsWith('http') ? previewActiveLesson.video_url : `http://localhost:5000/uploads/${previewActiveLesson.video_url}`}
                              controls 
                              controlsList="nodownload" 
                              className="w-full h-full object-contain"
                            ></video>
                          )
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-white/50 bg-surface-container-highest">
                            <p>لا يوجد فيديو متاح</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="bg-surface rounded-2xl p-6 shadow-sm border border-outline-variant/30 min-h-[400px]">
                        <h2 className="text-xl font-bold text-primary mb-4">{previewActiveLesson.title}</h2>
                        <div className="prose prose-sm prose-invert max-w-none text-on-surface-variant leading-relaxed" dangerouslySetInnerHTML={{ __html: previewActiveLesson.content?.replace(/\n/g, '<br/>') || 'لا يوجد محتوى.' }} />
                      </div>
                    )}

                    {/* Lesson Attachments */}
                    {parseAttachments(previewActiveLesson.attachments).length > 0 && (
                      <div className="bg-surface-container-low rounded-2xl p-4 sm:p-6 shadow-sm border border-outline-variant/30">
                        <h3 className="text-sm font-bold text-on-surface mb-4 flex items-center gap-2">
                          <Paperclip size={18} className="text-amber-400" />
                          مرفقات الدرس ({parseAttachments(previewActiveLesson.attachments).length})
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {parseAttachments(previewActiveLesson.attachments).map((att, idx) => (
                            <a
                              key={idx}
                              href={att.url.startsWith('http') ? att.url : `http://localhost:4500${att.url}`}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center justify-between p-3 rounded-xl bg-surface border border-outline-variant/30 hover:border-amber-500/50 hover:bg-amber-500/5 transition-all group"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                                  <FileIcon size={16} />
                                </div>
                                <div>
                                  <p className="text-xs font-bold text-on-surface line-clamp-1 group-hover:text-amber-500 transition-colors">{att.name}</p>
                                  {att.size > 0 && <p className="text-[10px] text-on-surface-variant">{(att.size / 1024).toFixed(1)} KB</p>}
                                </div>
                              </div>
                              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant group-hover:bg-amber-500/20 group-hover:text-amber-500 transition-all">
                                <Download size={14} />
                              </div>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="m-auto text-center space-y-3 opacity-60">
                    <BookOpen size={48} className="mx-auto text-primary" />
                    <p className="text-sm font-bold text-on-surface">اختر درساً للمشاهدة من القائمة الجانبية</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}