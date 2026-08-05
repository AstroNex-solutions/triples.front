import React, { useState, useEffect, useContext, useMemo } from 'react';
import { AuthContext } from '../context/AuthContext';
import API from '../api/axios';
import {
  BookOpen, Users, DollarSign, Star, PlusCircle, Video, TrendingUp,
  Award, Eye, Edit3, Trash2, Upload, CheckCircle2, AlertCircle, Loader2,
  Clock, BarChart3, X, ChevronRight, ChevronLeft, LayoutDashboard,
  Globe, GraduationCap, ClipboardList, MessageSquare, FileText,
  BookMarked, Mail, Layers, Package, Settings, Lock, Search, Send,
  ShoppingBag,
  Plus,
  ChevronDown,
  Calendar,
  ChevronUp
} from 'lucide-react';
import { Link } from 'react-router-dom';

// ═══════════════════════════════════════════
//  SIDEBAR MENU GROUPS
// ═══════════════════════════════════════════
const MENU_GROUPS = [
  {
    title: 'الرئيسية',
    items: [
      { key: 'dashboard', label: 'الإحصائيات', icon: LayoutDashboard },
      { key: 'profile', label: 'الملف الشخصي', icon: Settings },
      { key: 'sessions', label: 'الجلسات', icon: Globe },
    ]
  },
  {
    title: 'المحتوى التعليمي',
    items: [
      { key: 'courses', label: 'كورساتي', icon: BookOpen },
      { key: 'enrollments', label: 'طلابي', icon: GraduationCap },
      { key: 'assessments', label: 'الاختبارات', icon: ClipboardList },
    ]
  },
  {
    title: 'التفاعل والأرباح',
    items: [
      { key: 'reviews', label: 'التقييمات', icon: Star },
      { key: 'sales', label: 'المبيعات', icon: Package },
    ]
  },
  {
    title: 'المحتوى الإضافي',
    items: [
      { key: 'articles', label: 'المقالات', icon: FileText },
      { key: 'books', label: 'المكتبة', icon: BookMarked },
      { key: 'support', label: 'الدعم الفني', icon: Mail },
    ]
  }
];

// ═══════════════════════════════════════════
//  REUSABLE SUB-COMPONENTS
// ═══════════════════════════════════════════
function Card({ children, className = '' }) {
  return <div className={`relative rounded-3xl bg-surface-container-low/70 border border-outline-variant/40 p-5 backdrop-blur-xl shadow-lg ${className}`}>{children}</div>;
}

function StatCard({ label, value, icon: Icon, color = 'primary' }) {
  const colors = {
    primary: 'bg-primary/15 border-primary/20 text-primary',
    emerald: 'bg-emerald-500/15 border-emerald-500/20 text-emerald-400',
    cyan: 'bg-cyan-500/15 border-cyan-500/20 text-cyan-400',
    amber: 'bg-amber-500/15 border-amber-500/20 text-amber-400',
    rose: 'bg-rose-500/15 border-rose-500/20 text-rose-400',
    violet: 'bg-violet-500/15 border-violet-500/20 text-violet-400',
  };
  return (
    <Card className="flex items-center justify-between">
      <div className="space-y-1">
        <p className="text-xs font-bold text-on-surface-variant">{label}</p>
        <h3 className="text-2xl font-black text-on-surface">{value}</h3>
      </div>
      <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center ${colors[color]}`}><Icon size={24} /></div>
    </Card>
  );
}

function SectionHeader({ title, count, onAdd, addLabel = 'إضافة' }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-extrabold text-on-surface">{title} {count !== undefined && <span className="text-xs text-on-surface-variant font-medium mr-2">({count})</span>}</h3>
      {onAdd && (
        <button onClick={onAdd} className="py-2 px-4 bg-primary text-on-primary font-bold text-xs rounded-2xl hover:bg-primary-hover transition-all flex items-center gap-1.5 shadow-glow cursor-pointer">
          <PlusCircle size={16} /> {addLabel}
        </button>
      )}
    </div>
  );
}

function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-3xl bg-surface-container-low border border-outline-variant/50 p-6 sm:p-8 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-outline-variant/30 pb-3">
          <h3 className="text-lg font-extrabold text-on-surface">{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-surface/50 text-on-surface-variant hover:text-on-surface transition-all cursor-pointer"><X size={20} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Input({ label, ...props }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-bold text-on-surface-variant block">{label}</label>
      <input {...props} className="w-full px-4 py-2.5 bg-surface/80 border border-outline-variant/50 rounded-2xl text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" />
    </div>
  );
}

function Select({ label, children, ...props }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-bold text-on-surface-variant block">{label}</label>
      <select {...props} className="w-full px-4 py-2.5 bg-surface/80 border border-outline-variant/50 rounded-2xl text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all">{children}</select>
    </div>
  );
}

function Textarea({ label, ...props }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-bold text-on-surface-variant block">{label}</label>
      <textarea {...props} className="w-full px-4 py-2.5 bg-surface/80 border border-outline-variant/50 rounded-2xl text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" rows={3} />
    </div>
  );
}

function SubmitBtn({ loading, label = 'حفظ' }) {
  return (
    <button type="submit" disabled={loading} className="py-2.5 px-6 bg-primary text-on-primary font-bold text-sm rounded-2xl hover:bg-primary-hover disabled:opacity-60 transition-all flex items-center gap-2 shadow-glow cursor-pointer">
      {loading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />} {label}
    </button>
  );
}

function Badge({ text, variant = 'default' }) {
  const styles = {
    default: 'bg-primary/10 text-primary border-primary/20',
    success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    danger: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    info: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  };
  return <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${styles[variant]}`}>{text}</span>;
}

const statusBadge = (status) => {
  const map = {
    published: 'success', draft: 'warning', pending_review: 'info', archived: 'default',
    completed: 'success', active: 'success', pending: 'warning', cancelled: 'danger',
    in_progress: 'info', not_started: 'default', submitted: 'success', expired: 'danger',
  };
  return <Badge text={status} variant={map[status] || 'default'} />;
};

function Avatar({ name = '', size = 'md' }) {
  const initials = name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  const sizes = { sm: 'w-7 h-7 text-xs', md: 'w-9 h-9 text-xs', lg: 'w-11 h-11 text-sm' };
  return (
    <div className={`${sizes[size]} rounded-full bg-secondary/10 text-secondary font-black border border-secondary/20 flex items-center justify-center shrink-0`}>
      {initials || 'I'}
    </div>
  );
}

// ═══════════════════════════════════════════
//  MAIN INSTRUCTOR DASHBOARD
// ═══════════════════════════════════════════
export default function InstructorDashboard() {
  const { user } = useContext(AuthContext);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [globalMsg, setGlobalMsg] = useState({ type: '', text: '' });

  const showMsg = (type, text) => {
    setGlobalMsg({ type, text });
    setTimeout(() => setGlobalMsg({ type: '', text: '' }), 4000);
  };

  return (
    <div className="flex bg-background font-sans mt-24 pb-14" dir="rtl">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} shrink-0 bg-surface-container-low/60 border-l border-outline-variant/30 backdrop-blur-2xl transition-all duration-300 sticky top-0 flex flex-col z-30`}>
        <div className="h-16 px-4 flex items-center justify-between border-b border-outline-variant/20">
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center text-on-secondary font-extrabold text-sm shadow-sm">
                <Award size={16} />
              </div>
              <span className="text-sm font-black text-on-surface tracking-wide">لوحة المحاضر</span>
            </div>
          )}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-xl hover:bg-surface-variant/40 text-on-surface-variant transition-colors cursor-pointer mr-auto">
            {sidebarOpen ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 custom-scrollbar">
          {MENU_GROUPS.map((group, idx) => (
            <div key={idx} className="space-y-1">
              {sidebarOpen && <p className="px-3 text-[10px] font-black uppercase tracking-wider text-on-surface-variant/50 mb-2">{group.title}</p>}
              {group.items.map(item => {
                const Icon = item.icon;
                const isActive = activeSection === item.key;
                return (
                  <button key={item.key} onClick={() => setActiveSection(item.key)} title={!sidebarOpen ? item.label : undefined}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${isActive ? 'bg-secondary text-on-secondary shadow-sm font-bold' : 'text-on-surface-variant hover:bg-surface-variant/30 hover:text-on-surface'}`}>
                    <Icon size={18} className="shrink-0" />
                    {sidebarOpen && <span className="truncate">{item.label}</span>}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        {/* Top Nav */}
        <header className="h-16 border-b border-outline-variant/20 bg-surface/30 backdrop-blur-xl px-6 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-on-surface-variant">المحاضر</span>
            <span className="text-xs text-on-surface-variant/40">/</span>
            <span className="text-xs font-bold text-on-surface">
              {MENU_GROUPS.flatMap(g => g.items).find(i => i.key === activeSection)?.label}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-on-surface hidden sm:inline">د. {user?.name}</span>
            <img src={import.meta.env.VITE_API_URL + user?.image_profile} className='w-12 h-12 rounded-full' alt={user?.name} />
          </div>
        </header>

        {/* Dynamic Body */}
        <div className="p-6 sm:p-8 space-y-6 max-w-7xl w-full mx-auto">
          {globalMsg.text && (
            <div className={`p-4 rounded-xl text-xs font-bold flex items-center gap-3 border ${globalMsg.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' : 'bg-rose-500/10 border-rose-500/30 text-rose-500'}`}>
              {globalMsg.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
              <span>{globalMsg.text}</span>
            </div>
          )}

          {activeSection === 'dashboard' && <DashboardSection />}
          {activeSection === 'profile' && <ProfileSection showMsg={showMsg} />}
          {activeSection === 'sessions' && <SessionsSection showMsg={showMsg} />}
          {activeSection === 'courses' && <CoursesSection showMsg={showMsg} />}
          {activeSection === 'enrollments' && <EnrollmentsSection />}
          {activeSection === 'assessments' && <AssessmentsSection showMsg={showMsg} />}
          {activeSection === 'reviews' && <ReviewsSection showMsg={showMsg} />}
          {activeSection === 'sales' && <SalesSection />}
          {activeSection === 'articles' && <ArticlesSection showMsg={showMsg} />}
          {activeSection === 'books' && <BooksSection showMsg={showMsg} />}
          {activeSection === 'support' && <SupportSection showMsg={showMsg} />}
        </div>
      </main>
    </div>
  );
}

// ═══════════════════════════════════════════
//  1. DASHBOARD STATS
// ═══════════════════════════════════════════
function DashboardSection() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { API.get('/instructor/stats').then(r => setStats(r.data)).catch(console.error).finally(() => setLoading(false)); }, []);
  if (loading) return <div className="py-20 flex justify-center"><Loader2 size={32} className="animate-spin text-secondary" /></div>;
  if (!stats) return null;
  return (
    <>
      <h2 className="text-2xl font-extrabold text-on-surface">إحصائيات كورساتي</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="كورساتي" value={stats.totalCourses} icon={BookOpen} color="primary" />
        <StatCard label="الطلاب المسجلون" value={stats.totalEnrollments} icon={GraduationCap} color="emerald" />
        <StatCard label="إجمالي الأرباح" value={` JD ${stats.totalRevenue?.toFixed(2)}`} icon={DollarSign} color="cyan" />
        <StatCard label="متوسط التقييم" value={`${stats.avgRating} / 5`} icon={Star} color="amber" />
        <StatCard label="الاختبارات" value={stats.totalAssessments} icon={ClipboardList} color="violet" />
        <StatCard label="التقييمات" value={stats.totalReviews} icon={MessageSquare} color="rose" />
        <StatCard label="المقالات" value={stats.totalArticles} icon={FileText} color="primary" />
        <StatCard label="الكتب" value={stats.totalBooks} icon={BookMarked} color="emerald" />
      </div>
    </>
  );
}

// ═══════════════════════════════════════════
//  2. PROFILE
// ═══════════════════════════════════════════
function ProfileSection({ showMsg }) {
  const { user, setUser } = useContext(AuthContext);
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '', shortBio: user?.shortBio || '', department: user?.department || '', qualification: user?.qualification || '', specialization: user?.specialization || '' });
  const [file, setFile] = useState(null);
  const [sub, setSub] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault(); setSub(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (file) fd.append('image_profile', file);
      const res = await API.put('/instructor/profile', fd);
      setUser(res.data.user);
      showMsg('success', 'تم تحديث الملف الشخصي بنجاح');
    } catch { showMsg('error', 'خطأ في التحديث'); }
    finally { setSub(false); }
  };

  return (
    <>
      <SectionHeader title="الملف الشخصي" />
      <Card>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="الاسم الكامل" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            <Input label="رقم الهاتف" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} dir="ltr" />
            <Input label="القسم / التخصص" value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} />
            <Input label="المؤهل" value={form.qualification} onChange={e => setForm({ ...form, qualification: e.target.value })} />
            <div className="md:col-span-2"><Textarea label="السيرة الذاتية المختصرة" value={form.shortBio} onChange={e => setForm({ ...form, shortBio: e.target.value })} /></div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-on-surface-variant block">صورة الملف الشخصي</label>
              <input type="file" accept="image/*" onChange={e => setFile(e.target.files[0])} className="text-sm text-on-surface-variant" />
            </div>
          </div>
          <SubmitBtn loading={sub} label="حفظ التعديلات" />
        </form>
      </Card>
    </>
  );
}

// ═══════════════════════════════════════════
//  3. SESSIONS
// ═══════════════════════════════════════════
function SessionsSection({ showMsg }) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const fetch = () => { setLoading(true); API.get('/instructor/sessions').then(r => setSessions(r.data.sessions)).catch(console.error).finally(() => setLoading(false)); };
  useEffect(() => { fetch(); }, []);

  const revoke = async (id) => {
    try { await API.post(`/instructor/sessions/${id}/revoke`); showMsg('success', 'تم إنهاء الجلسة'); fetch(); }
    catch { showMsg('error', 'خطأ'); }
  };

  return (
    <>
      <SectionHeader title="جلسات تسجيل الدخول" count={sessions.filter(s => s.is_active).length} />
      {loading ? <div className="py-12 flex justify-center"><Loader2 size={24} className="animate-spin text-secondary" /></div> : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs sm:text-sm border-separate border-spacing-y-1">
              <thead><tr className="text-on-surface-variant/70"><th className="p-3">IP</th><th className="p-3">المتصفح</th><th className="p-3">الحالة</th><th className="p-3">التاريخ</th><th className="p-3 text-center">إنهاء</th></tr></thead>
              <tbody>{sessions.map(s => (
                <tr key={s.id} className="bg-surface/50 hover:bg-surface/80 transition-all">
                  <td className="p-3 text-on-surface-variant" dir="ltr">{s.ip_address || '—'}</td>
                  <td className="p-3 text-on-surface-variant text-xs max-w-[200px] truncate">{s.user_agent || '—'}</td>
                  <td className="p-3">{s.is_active ? <Badge text="نشطة" variant="success" /> : <Badge text="منتهية" variant="default" />}</td>
                  <td className="p-3 text-xs text-on-surface-variant">{new Date(s.createdAt).toLocaleString('ar-EG')}</td>
                  <td className="p-3 text-center">
                    {s.is_active && <button onClick={() => revoke(s.id)} className="p-1.5 rounded-lg bg-surface border border-outline-variant/40 text-on-surface-variant hover:text-rose-400 transition-all cursor-pointer"><X size={14} /></button>}
                  </td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </Card>
      )}
    </>
  );
}

// ═══════════════════════════════════════════
//  4. COURSES
// ═══════════════════════════════════════════
function CoursesSection({ showMsg }) {
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // التحكم بالترتيب المفتوح (Accordion States)
  const [expandedCourseId, setExpandedCourseId] = useState(null);
  const [expandedModuleId, setExpandedModuleId] = useState(null);

  // Modals visibility
  const [showAdd, setShowAdd] = useState(false);
  const [showAddModule, setShowAddModule] = useState(null); // course id
  const [showAddLesson, setShowAddLesson] = useState(null); // module id

  // Form states
  const [form, setForm] = useState({ title: '', subtitle: '', description: '', level: 'beginner', price: '0', category_id: '' });
  const [moduleForm, setModuleForm] = useState({ name: '', description: '', order: 1 });
  const [lessonForm, setLessonForm] = useState({ title: '', content: '', video_url: '', lesson_type: 'video', is_free: false, order: 1 });
  
  const [file, setFile] = useState(null);
  const [lessonFile, setLessonFile] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [cRes, catsRes] = await Promise.all([
        API.get('/instructor/courses'),
        API.get('/instructor/categories')
      ]);
      setCourses(cRes.data.courses || []);
      setCategories(catsRes.data.categories || []);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const createCourse = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (file) fd.append('image', file);
      
      await API.post('/instructor/courses', fd);
      showMsg('success', 'تم إنشاء الكورس بنجاح (بانتظار الموافقة)');
      setShowAdd(false);
      setForm({ title: '', subtitle: '', description: '', level: 'beginner', price: '0', category_id: '' });
      setFile(null);
      fetchData();
    } catch (err) {
      showMsg('error', err.response?.data?.message || 'حدث خطأ أثناء إنشاء الكورس');
    } finally {
      setSubmitting(false);
    }
  };

  const createModule = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await API.post('/instructor/modules', { ...moduleForm, course_id: showAddModule });
      showMsg('success', 'تم إضافة الوحدة التعليمية بنجاح');
      setShowAddModule(null);
      setModuleForm({ name: '', description: '', order: 1 });
      fetchData();
    } catch (err) {
      showMsg('error', err.response?.data?.message || 'حدث خطأ أثناء إضافة الوحدة');
    } finally {
      setSubmitting(false);
    }
  };

  const createLesson = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (lessonFile || lessonForm.lesson_type === 'video') {
        const fd = new FormData();
        Object.entries(lessonForm).forEach(([k, v]) => fd.append(k, v));
        fd.append('module_id', showAddLesson);
        if (lessonFile) fd.append('video', lessonFile);
        
        await API.post('/instructor/lessons', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      } else {
        await API.post('/instructor/lessons', { ...lessonForm, module_id: showAddLesson });
      }
      
      showMsg('success', 'تم إضافة الدرس بنجاح');
      setShowAddLesson(null);
      setLessonForm({ title: '', content: '', video_url: '', lesson_type: 'video', is_free: false, order: 1 });
      setLessonFile(null);
      fetchData();
    } catch (err) {
      showMsg('error', err.response?.data?.message || 'حدث خطأ أثناء إضافة الدرس');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleCourseAccordion = (id) => {
    setExpandedCourseId(expandedCourseId === id ? null : id);
  };

  const toggleModuleAccordion = (id) => {
    setExpandedModuleId(expandedModuleId === id ? null : id);
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Head section */}
      <SectionHeader 
        title="إدارة كورساتي" 
        count={courses.length} 
        onAdd={() => setShowAdd(true)} 
        addLabel="كورس جديد" 
      />

      {loading ? (
        <div className="py-16 flex flex-col items-center justify-center gap-3 text-on-surface-variant">
          <Loader2 size={32} className="animate-spin text-primary" />
          <span className="text-xs font-bold">جاري تحميل الدورات والمناهج...</span>
        </div>
      ) : courses.length === 0 ? (
        <Card>
          <div className="py-16 text-center space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary mx-auto flex items-center justify-center border border-primary/20">
              <BookOpen size={32} />
            </div>
            <h3 className="text-base font-extrabold text-on-surface">لا يوجد لديك كورسات حالياً</h3>
            <p className="text-xs text-on-surface-variant max-w-sm mx-auto leading-relaxed">
              ابدأ بإنشاء أول كورس لك الآن، وأضف الموديولات والدروس التفاعلية للطلاب.
            </p>
            <button 
              onClick={() => setShowAdd(true)}
              className="px-5 py-2.5 bg-primary text-on-primary font-bold text-xs rounded-2xl shadow-glow hover:bg-primary-hover transition-all inline-flex items-center gap-2"
            >
              <Plus size={16} />
              <span>إنشاء كورس جديد</span>
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
              <Card key={c.id} className="p-0 overflow-hidden border border-outline-variant/40 shadow-sm hover:border-outline-variant/80 transition-all">
                {/* Course Header Bar */}
                <div className="p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 bg-surface-container-low/40">
                  <div className="flex items-center gap-3.5 flex-1 min-w-[240px]">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center shrink-0">
                      <BookOpen size={22} />
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-base font-extrabold text-on-surface">{c.title}</h4>
                        {statusBadge(c.status)}
                      </div>
                      
                      <div className="flex items-center gap-3 text-xs text-on-surface-variant">
                        <span className="font-semibold text-primary">{c.category?.name || 'بدون تصنيف'}</span>
                        <span>•</span>
                        <span>{modulesCount} موديول</span>
                        <span>•</span>
                        <span>{totalLessons} درس</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setShowAddModule(c.id)} 
                      className="px-3 py-1.5 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                      title="إضافة وحدة تعليمية"
                    >
                      <Plus size={14} />
                      <span className="hidden sm:inline">وحدة جديدة</span>
                    </button>

                    <Link 
                      to={`/courses/${c.slug || c.id}`} 
                      className="p-2 rounded-xl bg-surface border border-outline-variant/40 text-on-surface-variant hover:text-primary transition-all"
                      title="معاينة الدورة"
                    >
                      <Eye size={16} />
                    </Link>

                    <button
                      onClick={() => toggleCourseAccordion(c.id)}
                      className="p-2 rounded-xl bg-surface border border-outline-variant/40 text-on-surface-variant hover:text-on-surface transition-all"
                    >
                      <ChevronDown size={18} className={`transition-transform duration-300 ${isCourseOpen ? 'rotate-180 text-primary' : ''}`} />
                    </button>
                  </div>
                </div>

                {/* Course Tree Modules & Lessons View */}
                {isCourseOpen && (
                  <div className="border-t border-outline-variant/30 p-4 sm:p-5 space-y-3 bg-surface-container-low/10">
                    {c.modules && c.modules.length > 0 ? (
                      c.modules.map((m, mIdx) => {
                        const isModuleOpen = expandedModuleId === m.id;

                        return (
                          <div key={m.id} className="border border-outline-variant/30 rounded-2xl bg-surface/60 overflow-hidden">
                            <div className="p-3 sm:p-4 flex items-center justify-between gap-3 bg-surface-container-low/30">
                              <div className="flex items-center gap-2.5">
                                <span className="text-xs font-bold text-primary px-2 py-0.5 rounded-lg bg-primary/10 border border-primary/20">
                                  موديول {mIdx + 1}
                                </span>
                                <h5 className="text-xs sm:text-sm font-bold text-on-surface">{m.name}</h5>
                                <span className="text-[11px] text-on-surface-variant">({m.lessons?.length || 0} دروس)</span>
                              </div>

                              <div className="flex items-center gap-2">
                                <button 
                                  onClick={() => setShowAddLesson(m.id)} 
                                  className="px-2.5 py-1 rounded-lg bg-primary text-on-primary font-bold text-[11px] flex items-center gap-1 hover:bg-primary-hover transition-all cursor-pointer"
                                >
                                  <Plus size={12} />
                                  <span>درس جديد</span>
                                </button>
                                
                                <button
                                  onClick={() => toggleModuleAccordion(m.id)}
                                  className="p-1 text-on-surface-variant"
                                >
                                  <ChevronDown size={16} className={`transition-transform ${isModuleOpen ? 'rotate-180 text-primary' : ''}`} />
                                </button>
                              </div>
                            </div>

                            {/* Lessons List */}
                            {isModuleOpen && (
                              <div className="p-3 border-t border-outline-variant/20 space-y-2 bg-surface">
                                {m.lessons && m.lessons.length > 0 ? (
                                  m.lessons.map((l) => (
                                    <div key={l.id} className="flex items-center justify-between p-2.5 rounded-xl bg-surface-container-low/40 border border-outline-variant/20 text-xs">
                                      <div className="flex items-center gap-2.5">
                                        {l.lesson_type === 'video' && <Video size={14} className="text-primary" />}
                                        {l.lesson_type === 'article' && <FileText size={14} className="text-emerald-400" />}
                                        {l.lesson_type === 'quiz' && <HelpCircle size={14} className="text-amber-400" />}
                                        
                                        <span className="font-semibold text-on-surface">{l.title}</span>
                                      </div>

                                      <div className="flex items-center gap-2">
                                        {l.is_free ? (
                                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                            معاينة مجانية
                                          </span>
                                        ) : (
                                          <span className="flex items-center gap-1 text-[10px] text-on-surface-variant/60">
                                            <Lock size={10} />
                                            <span>مغلق</span>
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  ))
                                ) : (
                                  <p className="text-[11px] text-on-surface-variant/60 text-center py-2">لا يوجد دروس لهذا الموديول بعد.</p>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center py-6 border border-dashed border-outline-variant/40 rounded-2xl space-y-2">
                        <FolderPlus size={24} className="mx-auto text-on-surface-variant/40" />
                        <p className="text-xs text-on-surface-variant font-medium">لم يتم إدراج وحدات تعليمية بعد في هذا الكورس.</p>
                        <button 
                          onClick={() => setShowAddModule(c.id)} 
                          className="px-3 py-1.5 rounded-xl bg-primary/10 text-primary font-bold text-xs inline-flex items-center gap-1.5"
                        >
                          <Plus size={14} />
                          <span>إضافة وحدة الآن</span>
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
          <Input 
            label="عنوان الكورس *" 
            required 
            placeholder="مثال: الدبلومة الشاملة في الرعاية الفائقة"
            value={form.title} 
            onChange={e => setForm({ ...form, title: e.target.value })} 
          />
          
          <Input 
            label="العنوان الفرعي" 
            placeholder="نظرة مبسطة وتطبيقية للمفاهيم الطبية الأساسية"
            value={form.subtitle} 
            onChange={e => setForm({ ...form, subtitle: e.target.value })} 
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Select label="المستوى" value={form.level} onChange={e => setForm({ ...form, level: e.target.value })}>
              <option value="beginner">مبتدئ</option>
              <option value="intermediate">متوسط</option>
              <option value="advanced">متقدم</option>
            </Select>

            <Input 
              label="السعر ($)" 
              type="number" 
              step="0.01" 
              value={form.price} 
              onChange={e => setForm({ ...form, price: e.target.value })} 
              dir="ltr" 
            />

            <Select label="التصنيف" value={form.category_id} onChange={e => setForm({ ...form, category_id: e.target.value })}>
              <option value="">اختر التصنيف</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </Select>
          </div>

          <Textarea 
            label="الوصف التفصيلي" 
            placeholder="شرح كافة المحاور والنقاط التي سيتعلمها الطالب في هذه الدورة..."
            value={form.description} 
            onChange={e => setForm({ ...form, description: e.target.value })} 
          />

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-on-surface-variant block">صورة غلاف الكورس</label>
            <div className="border-2 border-dashed border-outline-variant/40 rounded-2xl p-4 text-center hover:border-primary/50 transition-colors bg-surface-container-low/30">
              <input 
                type="file" 
                id="courseImageInput"
                accept="image/*" 
                onChange={e => setFile(e.target.files[0])} 
                className="hidden" 
              />
              <label htmlFor="courseImageInput" className="cursor-pointer space-y-1 block">
                <Upload size={24} className="mx-auto text-primary" />
                <span className="text-xs font-bold text-on-surface block">
                  {file ? file.name : 'اضغط لاختيار صورة الغلاف من جهازك'}
                </span>
                <span className="text-[10px] text-on-surface-variant/70 block">PNG, JPG up to 5MB</span>
              </label>
            </div>
          </div>

          <SubmitBtn loading={submitting} label="إنشاء الكورس الآن" />
        </form>
      </Modal>

      {/* 2. Add Module Modal */}
      <Modal open={!!showAddModule} onClose={() => setShowAddModule(null)} title="إضافة وحدة تعليمية جديدة">
        <form onSubmit={createModule} className="space-y-4">
          <Input 
            label="اسم الوحدة *" 
            required 
            placeholder="مثال: الفصل الأول - المقدمة والأساسيات"
            value={moduleForm.name} 
            onChange={e => setModuleForm({ ...moduleForm, name: e.target.value })} 
          />
          <Textarea 
            label="الوصف" 
            placeholder="نبذة مختصرة عن مواضيع هذا الفصل..."
            value={moduleForm.description} 
            onChange={e => setModuleForm({ ...moduleForm, description: e.target.value })} 
          />
          <Input 
            label="الترتيب في المنهاج" 
            type="number" 
            value={moduleForm.order} 
            onChange={e => setModuleForm({ ...moduleForm, order: e.target.value })} 
          />
          <SubmitBtn loading={submitting} label="إضافة الوحدة" />
        </form>
      </Modal>

      {/* 3. Add Lesson Modal */}
      <Modal open={!!showAddLesson} onClose={() => setShowAddLesson(null)} title="إضافة درس جديد">
        <form onSubmit={createLesson} className="space-y-4">
          <Input 
            label="عنوان الدرس *" 
            required 
            placeholder="مثال: الشرح العملي للتطبيق الأولي"
            value={lessonForm.title} 
            onChange={e => setLessonForm({ ...lessonForm, title: e.target.value })} 
          />

          <div className="grid grid-cols-2 gap-3">
            <Select label="نوع الدرس" value={lessonForm.lesson_type} onChange={e => setLessonForm({ ...lessonForm, lesson_type: e.target.value })}>
              <option value="video">فيديو تفاعلي</option>
              <option value="article">مقال نصي</option>
              <option value="quiz">اختبار (كويز)</option>
            </Select>

            <Input 
              label="الترتيب" 
              type="number" 
              value={lessonForm.order} 
              onChange={e => setLessonForm({ ...lessonForm, order: e.target.value })} 
            />
          </div>

          {/* Video Lesson Type Inputs */}
          {lessonForm.lesson_type === 'video' && (
            <div className="space-y-4 border border-outline-variant/30 rounded-2xl p-4 bg-surface-container-low/20">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-on-surface-variant block">رفع فيديو من الجهاز</label>
                <input 
                  type="file" 
                  accept="video/*" 
                  onChange={e => setLessonFile(e.target.files[0])} 
                  className="text-xs text-on-surface-variant w-full file:ml-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer" 
                />
              </div>

              <div className="flex items-center gap-2">
                <div className="h-[1px] flex-1 bg-outline-variant/30"></div>
                <span className="text-[10px] text-on-surface-variant font-bold">أو رابط فيديو</span>
                <div className="h-[1px] flex-1 bg-outline-variant/30"></div>
              </div>

              <Input 
                label="رابط من منصة خارجية (YouTube / Vimeo / Cloud)" 
                value={lessonForm.video_url} 
                onChange={e => setLessonForm({ ...lessonForm, video_url: e.target.value })} 
                dir="ltr" 
                placeholder="https://..." 
              />
            </div>
          )}

          {/* Article & Quiz Textarea */}
          {(lessonForm.lesson_type === 'article' || lessonForm.lesson_type === 'quiz') && (
            <Textarea 
              label={lessonForm.lesson_type === 'article' ? 'محتوى المقال النصي' : 'تعليمات وإرشادات الكويز'} 
              value={lessonForm.content} 
              onChange={e => setLessonForm({ ...lessonForm, content: e.target.value })} 
            />
          )}

          <div className="flex items-center gap-2 pt-1">
            <input 
              type="checkbox" 
              id="lessonFreeCheck" 
              checked={lessonForm.is_free} 
              onChange={e => setLessonForm({ ...lessonForm, is_free: e.target.checked })} 
              className="w-4 h-4 rounded text-primary focus:ring-primary cursor-pointer" 
            />
            <label htmlFor="lessonFreeCheck" className="text-xs font-bold text-on-surface cursor-pointer select-none">
              تحديد كـ معاينة مجانية (متاح للجميع بدون اشتراك)
            </label>
          </div>

          <SubmitBtn loading={submitting} label="إضافة الدرس" />
        </form>
      </Modal>
    </div>
  );
}

// ═══════════════════════════════════════════
//  5. ENROLLMENTS
// ═══════════════════════════════════════════
function EnrollmentsSection() {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    API.get('/instructor/enrollments')
      .then(r => setEnrollments(r.data.enrollments || []))
      .catch(err => {
        console.error(err);
        setError('حدث خطأ أثناء تحميل البيانات');
      })
      .finally(() => setLoading(false));
  }, []);

  // تصفية القائمة بالبحث
  const filteredEnrollments = useMemo(() => {
    return enrollments.filter(e => {
      const studentName = e.student?.name?.toLowerCase() || '';
      const courseTitle = e.course?.title?.toLowerCase() || '';
      const query = searchTerm.toLowerCase();
      return studentName.includes(query) || courseTitle.includes(query);
    });
  }, [enrollments, searchTerm]);

  return (
    <div className="space-y-4 dir-rtl">
      {/* الهيدر مع البحث */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <SectionHeader title="طلابي المسجلون" count={filteredEnrollments.length} />
        
        {/* شريط البحث */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50" size={16} />
          <input
            type="text"
            placeholder="بحث عن طالب أو كورس..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-3 pr-9 py-2 text-xs sm:text-sm rounded-xl bg-surface/80 border border-outline-variant/30 text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-secondary/50 transition-all"
          />
        </div>
      </div>

      {/* حالة التحميل */}
      {loading ? (
        <Card className="p-12 flex justify-center items-center">
          <Loader2 size={28} className="animate-spin text-secondary" />
        </Card>
      ) : error ? (
        /* حالة الخطأ */
        <Card className="p-8 text-center text-error space-y-2">
          <AlertCircle className="mx-auto" size={32} />
          <p className="font-medium">{error}</p>
        </Card>
      ) : filteredEnrollments.length === 0 ? (
        /* حالة عدم وجود بيانات */
        <Card className="p-12 text-center text-on-surface-variant/70 space-y-3">
          <User className="mx-auto opacity-40" size={40} />
          <p className="text-sm font-medium">
            {searchTerm ? 'لا توجد نتائج تطابق بحثك' : 'لا يوجد طلاب مسجلون حالياً'}
          </p>
        </Card>
      ) : (
        /* جدول البيانات */
        <Card className="overflow-hidden border border-outline-variant/20 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs sm:text-sm border-collapse">
              <thead>
                <tr className="bg-surface-variant/30 text-on-surface-variant text-xs font-semibold border-b border-outline-variant/20">
                  <th className="py-3.5 px-4">الطالب</th>
                  <th className="py-3.5 px-4">الكورس</th>
                  <th className="py-3.5 px-4">الحالة</th>
                  <th className="py-3.5 px-4">التقدم</th>
                  <th className="py-3.5 px-4">تاريخ الاشتراك</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {filteredEnrollments.map(e => {
                  const progress = Math.min(100, Math.max(0, Math.round(e.progress || 0)));
                  return (
                    <tr key={e.id} className="hover:bg-surface-variant/20 transition-colors">
                      {/* اسم الطالب والصورة */}
                      <td className="py-3.5 px-4 font-medium text-on-surface">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-secondary/10 text-secondary flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden">
                            {e.student?.avatar ? (
                              <img src={e.student.avatar} alt={e.student.name} className="w-full h-full object-cover" />
                            ) : (
                              (e.student?.name?.[0] || 'U').toUpperCase()
                            )}
                          </div>
                          <span className="truncate max-w-[150px] sm:max-w-xs">{e.student?.name || '—'}</span>
                        </div>
                      </td>

                      {/* عنوان الكورس */}
                      <td className="py-3.5 px-4 text-on-surface-variant">
                        <div className="flex items-center gap-2">
                          <BookOpen size={14} className="text-on-surface-variant/50 shrink-0" />
                          <span className="truncate max-w-[180px] sm:max-w-xs">{e.course?.title || '—'}</span>
                        </div>
                      </td>

                      {/* شارة الحالة */}
                      <td className="py-3.5 px-4">
                        {statusBadge(e.status)}
                      </td>

                      {/* شريط التقدم */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3 min-w-[120px]">
                          <div className="flex-1 h-1.5 rounded-full bg-outline-variant/20 overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-500 ${
                                progress === 100 ? 'bg-emerald-500' : 'bg-secondary'
                              }`} 
                              style={{ width: `${progress}%` }} 
                            />
                          </div>
                          <span className="text-xs font-semibold text-on-surface-variant w-8 text-left">{progress}%</span>
                        </div>
                      </td>

                      {/* تاريخ التسجيل */}
                      <td className="py-3.5 px-4 text-xs text-on-surface-variant/80">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={13} className="text-on-surface-variant/50" />
                          <span>{new Date(e.enrollment_date || e.createdAt).toLocaleDateString('ar-EG')}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════
//  6. ASSESSMENTS
// ═══════════════════════════════════════════
function AssessmentsSection({ showMsg }) {
  const [assessments, setAssessments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [showAddQ, setShowAddQ] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [sub, setSub] = useState(false);

  // Initial Form States
  const initialAssessmentForm = {
    course_id: '',
    title: '',
    type: 'quiz',
    duration_minutes: 60,
    total_marks: 100,
    passing_marks: 50
  };

  const initialQuestionForm = {
    question_text: '',
    question_type: 'mcq',
    difficulty_level: 'medium',
    correct_answer: '',
    marks: 1,
    options: ''
  };

  const [form, setForm] = useState(initialAssessmentForm);
  const [qForm, setQForm] = useState(initialQuestionForm);

  const fetchData = () => {
    setLoading(true);
    Promise.all([API.get('/instructor/assessments'), API.get('/instructor/courses')])
      .then(([a, c]) => {
        setAssessments(a.data.assessments || []);
        setCourses(c.data.courses || []);
      })
      .catch((err) => {
        console.error(err);
        showMsg('error', 'حدث خطأ أثناء تحميل البيانات');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const createAssessment = async (e) => {
    e.preventDefault();
    setSub(true);
    try {
      await API.post('/instructor/assessments', form);
      showMsg('success', 'تم إنشاء الاختبار بنجاح');
      setShowAdd(false);
      setForm(initialAssessmentForm);
      fetchData();
    } catch (err) {
      showMsg('error', 'فشل في إنشاء الاختبار');
    } finally {
      setSub(false);
    }
  };

  const addQuestion = async (e) => {
    e.preventDefault();
    setSub(true);
    try {
      let opts = null;
      if (qForm.options && (qForm.question_type === 'mcq' || qForm.question_type === 'true_false')) {
        try {
          opts = JSON.parse(qForm.options);
        } catch {
          opts = qForm.options.split(',').map((o) => o.trim()).filter(Boolean);
        }
      }

      await API.post('/instructor/questions', {
        ...qForm,
        assessment_id: showAddQ,
        options: opts
      });

      showMsg('success', 'تمت إضافة السؤال بنجاح');
      setShowAddQ(null);
      setQForm(initialQuestionForm);
      fetchData();
    } catch (err) {
      showMsg('error', 'فشل في إضافة السؤال');
    } finally {
      setSub(false);
    }
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const getTypeBadgeVariant = (type) => {
    switch (type) {
      case 'exam': return 'error';
      case 'assignment': return 'warning';
      default: return 'info';
    }
  };

  const getDifficultyColor = (level) => {
    switch (level) {
      case 'easy': return 'text-emerald-500 bg-emerald-500/10';
      case 'hard': return 'text-rose-500 bg-rose-500/10';
      default: return 'text-amber-500 bg-amber-500/10';
    }
  };

  return (
    <div className="space-y-4 dir-rtl">
      {/* Header */}
      <SectionHeader
        title="الاختبارات وبنك الأسئلة"
        count={assessments.length}
        onAdd={() => setShowAdd(true)}
        addLabel="اختبار جديد"
      />

      {/* Loading State */}
      {loading ? (
        <Card className="p-12 flex justify-center items-center">
          <Loader2 size={28} className="animate-spin text-secondary" />
        </Card>
      ) : assessments.length === 0 ? (
        /* Empty State */
        <Card className="p-12 text-center text-on-surface-variant/70 space-y-4 border border-dashed border-outline-variant/40">
          <HelpCircle className="mx-auto opacity-40 text-secondary" size={48} />
          <div className="space-y-1">
            <h3 className="font-bold text-on-surface text-base">لا توجد اختبارات حتى الآن</h3>
            <p className="text-xs">قم بإنشاء اختبارك الأول لإضافة الأسئلة وتقييم الطلاب.</p>
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="inline-flex items-center gap-2 py-2 px-4 bg-primary text-on-primary text-xs font-bold rounded-xl hover:bg-primary/90 transition-all cursor-pointer"
          >
            <Plus size={16} />
            إضافة اختبار جديد
          </button>
        </Card>
      ) : (
        /* Assessments List */
        <div className="space-y-3">
          {assessments.map((a) => {
            const isExpanded = expandedId === a.id;
            const qCount = a.questions?.length || 0;

            return (
              <Card
                key={a.id}
                className="overflow-hidden border border-outline-variant/20 shadow-sm transition-all hover:border-outline-variant/40"
              >
                {/* Main Card Content */}
                <div className="p-4 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    {/* Title & Course Info */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-base font-bold text-on-surface">{a.title}</h4>
                        <Badge
                          text={a.type === 'quiz' ? 'كويز' : a.type === 'exam' ? 'امتحان' : 'واجب'}
                          variant={getTypeBadgeVariant(a.type)}
                        />
                      </div>
                      <div className="flex items-center gap-4 text-xs text-on-surface-variant flex-wrap">
                        <span className="flex items-center gap-1">
                          <BookOpen size={13} className="text-on-surface-variant/60" />
                          {a.Course?.title || '—'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={13} className="text-on-surface-variant/60" />
                          {a.duration_minutes} دقيقة
                        </span>
                        <span className="flex items-center gap-1">
                          <Award size={13} className="text-on-surface-variant/60" />
                          الدرجة: {a.total_marks} (النجاح: {a.passing_marks})
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button
                        onClick={() => setShowAddQ(a.id)}
                        className="flex items-center gap-1 py-1.5 px-3 bg-secondary/10 text-secondary font-bold text-xs rounded-xl hover:bg-secondary/20 transition-all cursor-pointer"
                      >
                        <Plus size={14} />
                        إضافة سؤال
                      </button>

                      {qCount > 0 && (
                        <button
                          onClick={() => toggleExpand(a.id)}
                          className="flex items-center gap-1 py-1.5 px-2.5 bg-surface-variant/40 text-on-surface-variant font-medium text-xs rounded-xl hover:bg-surface-variant/70 transition-all cursor-pointer"
                        >
                          <Layers size={14} />
                          <span>{qCount} أسئلة</span>
                          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Questions List (Collapsible) */}
                  {isExpanded && a.questions && a.questions.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-outline-variant/15 space-y-2.5">
                      <h5 className="text-xs font-bold text-on-surface-variant">الأسئلة المضافة:</h5>
                      <div className="space-y-2 pr-2">
                        {a.questions.map((q, i) => (
                          <div
                            key={q.id || i}
                            className="p-3 rounded-xl bg-surface-variant/20 border border-outline-variant/10 text-xs space-y-1.5"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <p className="font-semibold text-on-surface leading-relaxed">
                                <span className="text-secondary font-bold ml-1">{i + 1}.</span>
                                {q.question_text}
                              </p>
                              <span className="font-bold text-on-surface bg-surface px-2 py-0.5 rounded-lg border border-outline-variant/20 shrink-0">
                                {q.marks} {q.marks > 10 ? 'درجة' : 'درجات'}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 text-[11px] text-on-surface-variant/80">
                              <span className="bg-surface px-2 py-0.5 rounded border border-outline-variant/10">
                                {q.question_type === 'mcq'
                                  ? 'اختيار من متعدد'
                                  : q.question_type === 'true_false'
                                  ? 'صح / خطأ'
                                  : q.question_type === 'short_answer'
                                  ? 'إجابة قصيرة'
                                  : 'مقالي'}
                              </span>
                              {q.difficulty_level && (
                                <span className={`px-2 py-0.5 rounded font-medium ${getDifficultyColor(q.difficulty_level)}`}>
                                  {q.difficulty_level === 'easy' ? 'سهل' : q.difficulty_level === 'hard' ? 'صعب' : 'متوسط'}
                                </span>
                              )}
                              {q.correct_answer && (
                                <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5 mr-auto font-medium">
                                  <CheckCircle2 size={12} />
                                  الإجابة: {q.correct_answer}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal: Create Assessment */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="إنشاء اختبار جديد">
        <form onSubmit={createAssessment} className="space-y-4 dir-rtl">
          <Select
            label="الكورس *"
            required
            value={form.course_id}
            onChange={(e) => setForm({ ...form, course_id: e.target.value })}
          >
            <option value="">اختر الكورس...</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </Select>

          <Input
            label="عنوان الاختبار *"
            required
            placeholder="مثال: اختبار منتصف الفصل - أساسيات البرمجة"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="النوع"
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
            >
              <option value="quiz">كويز (Quiz)</option>
              <option value="exam">امتحان (Exam)</option>
              <option value="assignment">واجب (Assignment)</option>
            </Select>

            <Input
              label="المدة (بالدقائق)"
              type="number"
              min="1"
              value={form.duration_minutes}
              onChange={(e) => setForm({ ...form, duration_minutes: Number(e.target.value) })}
            />

            <Input
              label="الدرجة الكلية"
              type="number"
              min="1"
              value={form.total_marks}
              onChange={(e) => setForm({ ...form, total_marks: Number(e.target.value) })}
            />

            <Input
              label="درجة النجاح"
              type="number"
              min="1"
              value={form.passing_marks}
              onChange={(e) => setForm({ ...form, passing_marks: Number(e.target.value) })}
            />
          </div>

          <div className="pt-2">
            <SubmitBtn loading={sub} label="إنشاء الاختبار" />
          </div>
        </form>
      </Modal>

      {/* Modal: Add Question */}
      <Modal open={!!showAddQ} onClose={() => setShowAddQ(null)} title="إضافة سؤال جديد">
        <form onSubmit={addQuestion} className="space-y-4 dir-rtl">
          <Textarea
            label="نص السؤال *"
            required
            rows={3}
            placeholder="اكتب نص السؤال هنا..."
            value={qForm.question_text}
            onChange={(e) => setQForm({ ...qForm, question_text: e.target.value })}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="نوع السؤال"
              value={qForm.question_type}
              onChange={(e) => setQForm({ ...qForm, question_type: e.target.value })}
            >
              <option value="mcq">اختيار من متعدد</option>
              <option value="true_false">صح / خطأ</option>
              <option value="short_answer">إجابة قصيرة</option>
              <option value="essay">مقالي</option>
            </Select>

            <Select
              label="مستوى الصعوبة"
              value={qForm.difficulty_level}
              onChange={(e) => setQForm({ ...qForm, difficulty_level: e.target.value })}
            >
              <option value="easy">سهل</option>
              <option value="medium">متوسط</option>
              <option value="hard">صعب</option>
            </Select>
          </div>

          {(qForm.question_type === 'mcq' || qForm.question_type === 'true_false') && (
            <Input
              label="الخيارات المتاحة"
              placeholder={
                qForm.question_type === 'true_false'
                  ? 'صح, خطأ'
                  : 'الخيار الأول, الخيار الثاني, الخيار الثالث'
              }
              value={qForm.options}
              onChange={(e) => setQForm({ ...qForm, options: e.target.value })}
              hint="افصل بين الخيارات بفاصلة (,)"
            />
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <Input
                label="الإجابة الصحيحة *"
                required
                placeholder="اكتب الإجابة النموذجية"
                value={qForm.correct_answer}
                onChange={(e) => setQForm({ ...qForm, correct_answer: e.target.value })}
              />
            </div>
            <div>
              <Input
                label="الدرجة"
                type="number"
                min="0.5"
                step="0.5"
                value={qForm.marks}
                onChange={(e) => setQForm({ ...qForm, marks: Number(e.target.value) })}
              />
            </div>
          </div>

          <div className="pt-2">
            <SubmitBtn loading={sub} label="إضافة السؤال" />
          </div>
        </form>
      </Modal>
    </div>
  );
}

// ═══════════════════════════════════════════
//  7. REVIEWS
// ═══════════════════════════════════════════
function ReviewsSection({ showMsg }) {
  const [reviews, setReviews] = useState([]);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyTarget, setReplyTarget] = useState(null);
  const [replyText, setReplyText] = useState('');

  const fetchData = () => {
    setLoading(true);
    Promise.all([API.get('/instructor/reviews'), API.get('/instructor/comments')])
      .then(([r, c]) => { setReviews(r.data.reviews); setComments(c.data.comments); })
      .catch(console.error).finally(() => setLoading(false));
  };
  useEffect(() => { fetchData(); }, []);

  const reply = async () => {
    try {
      await API.post(`/instructor/reviews/${replyTarget.id}/reply`, { reply_text: replyText });
      showMsg('success', 'تم الرد بنجاح');
      setReplyTarget(null); setReplyText(''); fetchData();
    } catch { showMsg('error', 'خطأ'); }
  };

  if (loading) return <div className="py-12 flex justify-center"><Loader2 size={24} className="animate-spin text-secondary" /></div>;

  return (
    <>
      <SectionHeader title="تقييمات طلابي" count={reviews.length} />
      <div className="space-y-3 mb-6">
        {reviews.map(r => (
          <Card key={r.id} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Avatar name={r.user?.name || ''} size="sm" />
                <div>
                  <p className="text-xs font-bold text-on-surface">{r.user?.name}</p>
                  <p className="text-[11px] text-on-surface-variant">{r.Course?.title}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-amber-400">{'⭐'.repeat(r.rating)}</span>
                <button onClick={() => { setReplyTarget(r); setReplyText(''); }} className="p-1.5 rounded-lg bg-surface border border-outline-variant/40 text-on-surface-variant hover:text-primary transition-all cursor-pointer"><MessageSquare size={14} /></button>
              </div>
            </div>
            {r.review_text && <p className="text-xs text-on-surface-variant pr-4">{r.review_text}</p>}
            {r.replies && r.replies.length > 0 && (
              <div className="pr-6 space-y-1">
                {r.replies.map(rp => (
                  <div key={rp.id} className="text-xs p-2 rounded-xl bg-primary/5 border border-primary/10">
                    <span className="font-bold text-primary">{rp.user?.name || 'أنت'}:</span> {rp.reply_text}
                  </div>
                ))}
              </div>
            )}
          </Card>
        ))}
      </div>

      <SectionHeader title="تعليقات الدروس" count={comments.length} />
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs sm:text-sm border-separate border-spacing-y-1">
            <thead><tr className="text-on-surface-variant/70"><th className="p-3">الطالب</th><th className="p-3">الكورس</th><th className="p-3">التعليق</th><th className="p-3">التاريخ</th></tr></thead>
            <tbody>{comments.map(c => (
              <tr key={c.id} className="bg-surface/50 hover:bg-surface/80 transition-all">
                <td className="p-3 font-bold text-on-surface">{c.user?.name || '—'}</td>
                <td className="p-3 text-on-surface-variant">{c.Course?.title || '—'}</td>
                <td className="p-3 text-xs text-on-surface-variant max-w-[250px] truncate">{c.content}</td>
                <td className="p-3 text-xs text-on-surface-variant">{new Date(c.createdAt).toLocaleDateString('ar-EG')}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </Card>

      <Modal open={!!replyTarget} onClose={() => setReplyTarget(null)} title="الرد على التقييم">
        {replyTarget && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-surface/60 border border-outline-variant/30">
              <p className="text-xs text-on-surface-variant"><strong>{replyTarget.user?.name}:</strong> {'⭐'.repeat(replyTarget.rating)}</p>
              <p className="text-sm text-on-surface mt-1">{replyTarget.review_text}</p>
            </div>
            <Textarea label="ردك" value={replyText} onChange={e => setReplyText(e.target.value)} placeholder="اكتب ردك هنا..." />
            <button onClick={reply} className="py-2.5 px-6 bg-primary text-on-primary font-bold text-sm rounded-2xl hover:bg-primary-hover transition-all flex items-center gap-2 shadow-glow cursor-pointer"><Send size={16} /> إرسال الرد</button>
          </div>
        )}
      </Modal>
    </>
  );
}

// ═══════════════════════════════════════════
//  8. SALES
// ═══════════════════════════════════════════
function SalesSection() {
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    
    const fetchSales = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await API.get('/instructor/sales');
        if (isMounted) {
          console.log(response.data);
          
          setSalesData(response.data?.sales);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Error fetching sales:', err);
          setError('تعذر تحميل بيانات المبيعات، يرجى المحاولة لاحقاً.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchSales();

    return () => {
      isMounted = false;
    };
  }, []);

  // استخراج قائمة الطلبات بأمان
  const orders = useMemo(() => salesData );

  // حساب إجمالي الإيرادات
  const totalRevenue = useMemo(() => {
    return orders.reduce((sum, item) => sum + (parseFloat(item?.price) || 0), 0);
  }, [orders]);

  // إجمالي عدد المبيعات
  const totalSalesCount = orders.length;

  return (
    <div className="space-y-4" dir="rtl">
      <SectionHeader title="مبيعات كورساتي" count={totalSalesCount} />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCard 
          label="إجمالي المبيعات" 
          value={totalSalesCount} 
          icon={Package} 
          color="primary" 
        />
        <StatCard 
          label="إجمالي الإيرادات" 
          value={`$${totalRevenue.toFixed(2)}`} 
          icon={DollarSign} 
          color="cyan" 
        />
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="py-16 flex flex-col items-center justify-center gap-2 text-on-surface-variant">
          <Loader2 size={28} className="animate-spin text-primary" />
          <span className="text-xs font-bold">جاري تحميل بيانات المبيعات...</span>
        </div>
      ) : error ? (
        <Card>
          <div className="p-6 text-center text-error space-y-2">
            <p className="text-sm font-bold">{error}</p>
          </div>
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs sm:text-sm border-separate border-spacing-y-1">
              <thead>
                <tr className="text-on-surface-variant/70 border-b border-outline-variant/30">
                  <th className="p-3">الكورس</th>
                  <th className="p-3">العميل</th>
                  <th className="p-3">المبلغ</th>
                  <th className="p-3">رقم الطلب</th>
                  <th className="p-3">التاريخ</th>
                </tr>
              </thead>
              <tbody>
                {orders.length > 0 ? (
                  orders.map((item, index) => {
                    const courseTitle = item.course?.title || '—';
                    const customerName = item.Order?.User?.name || '—';
                    const orderNumber = item.Order?.order_number || '—';
                    const price = parseFloat(item.price || 0).toFixed(2);
                    const formattedDate = item.Order?.createdAt 
                      ? new Date(item.Order.createdAt).toLocaleDateString('ar-EG', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })
                      : '—';

                    return (
                      <tr 
                        key={item.id || index} 
                        className="bg-surface/50 hover:bg-surface/80 transition-all rounded-xl"
                      >
                        <td className="p-3 font-bold text-on-surface">{courseTitle}</td>
                        <td className="p-3 text-on-surface-variant">{customerName}</td>
                        <td className="p-3 font-bold text-emerald-400" dir="ltr">${price}</td>
                        <td className="p-3 text-primary font-bold" dir="ltr">{orderNumber}</td>
                        <td className="p-3 text-xs text-on-surface-variant">{formattedDate}</td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-on-surface-variant">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <ShoppingBag size={32} className="text-on-surface-variant/40" />
                        <p className="text-sm font-bold">لا توجد مبيعات مسجلة حتى الآن</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════
//  9. ARTICLES
// ═══════════════════════════════════════════
function ArticlesSection({ showMsg }) {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', summary: '', status: 'draft' });
  const [file, setFile] = useState(null);
  const [sub, setSub] = useState(false);

  const fetchArticles = () => { setLoading(true); API.get('/instructor/articles').then(r => setArticles(r.data.articles)).catch(console.error).finally(() => setLoading(false)); };
  useEffect(() => { fetchArticles(); }, []);

  const create = async (e) => {
    e.preventDefault(); setSub(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (file) fd.append('image', file);
      await API.post('/instructor/articles', fd);
      showMsg('success', 'تم إنشاء المقال'); setShowAdd(false); fetchArticles();
    } catch { showMsg('error', 'خطأ'); } finally { setSub(false); }
  };
  const del = async (id) => { if (!confirm('حذف؟')) return; try { await API.delete(`/instructor/articles/${id}`); showMsg('success', 'تم الحذف'); fetchArticles(); } catch { showMsg('error', 'خطأ'); } };

  return (
    <>
      <SectionHeader title="مقالاتي" count={articles.length} onAdd={() => setShowAdd(true)} addLabel="مقال جديد" />
      {loading ? <div className="py-12 flex justify-center"><Loader2 size={24} className="animate-spin text-secondary" /></div> : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs sm:text-sm border-separate border-spacing-y-1">
              <thead><tr className="text-on-surface-variant/70"><th className="p-3">العنوان</th><th className="p-3">الحالة</th><th className="p-3">المشاهدات</th><th className="p-3 text-center">حذف</th></tr></thead>
              <tbody>{articles.map(a => (
                <tr key={a.id} className="bg-surface/50 hover:bg-surface/80 transition-all">
                  <td className="p-3 font-bold text-on-surface max-w-[200px] truncate">{a.title}</td>
                  <td className="p-3">{statusBadge(a.status)}</td>
                  <td className="p-3 text-on-surface-variant">{a.views_count || 0}</td>
                  <td className="p-3 text-center"><button onClick={() => del(a.id)} className="p-1.5 rounded-lg bg-surface border border-outline-variant/40 text-on-surface-variant hover:text-rose-400 transition-all cursor-pointer"><Trash2 size={14} /></button></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </Card>
      )}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="كتابة مقال جديد">
        <form onSubmit={create} className="space-y-4">
          <Input label="عنوان المقال *" required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
          <Textarea label="الملخص" value={form.summary} onChange={e => setForm({ ...form, summary: e.target.value })} />
          <Textarea label="المحتوى *" required value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} />
          <Select label="الحالة" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
            <option value="draft">مسودة (بانتظار الإدارة)</option><option value="published">منشور</option>
          </Select>
          <div className="space-y-1.5"><label className="text-xs font-bold text-on-surface-variant block">صورة المقال</label><input type="file" accept="image/*" onChange={e => setFile(e.target.files[0])} className="text-sm text-on-surface-variant" /></div>
          <SubmitBtn loading={sub} label="نشر المقال" />
        </form>
      </Modal>
    </>
  );
}

// ═══════════════════════════════════════════
//  10. BOOKS
// ═══════════════════════════════════════════
function BooksSection({ showMsg }) {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: '', author_name: '', description: '', language: 'العربية', pages_count: '' });
  const [files, setFiles] = useState({ book_file: null, cover_image: null });
  const [sub, setSub] = useState(false);

  const fetchBooks = () => { setLoading(true); API.get('/instructor/books').then(r => setBooks(r.data.books)).catch(console.error).finally(() => setLoading(false)); };
  useEffect(() => { fetchBooks(); }, []);

  const create = async (e) => {
    e.preventDefault(); setSub(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (files.book_file) fd.append('book_file', files.book_file);
      if (files.cover_image) fd.append('cover_image', files.cover_image);
      await API.post('/instructor/books', fd);
      showMsg('success', 'تم رفع الكتاب'); setShowAdd(false); fetchBooks();
    } catch { showMsg('error', 'خطأ'); } finally { setSub(false); }
  };
  const del = async (id) => { if (!confirm('حذف؟')) return; try { await API.delete(`/instructor/books/${id}`); showMsg('success', 'تم الحذف'); fetchBooks(); } catch { showMsg('error', 'خطأ'); } };

  return (
    <>
      <SectionHeader title="كتبي الإلكترونية" count={books.length} onAdd={() => setShowAdd(true)} addLabel="رفع كتاب" />
      {loading ? <div className="py-12 flex justify-center"><Loader2 size={24} className="animate-spin text-secondary" /></div> : (
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
            <Input label="عنوان الكتاب *" required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
            <Input label="اسم المؤلف *" required value={form.author_name} onChange={e => setForm({ ...form, author_name: e.target.value })} />
            <Input label="اللغة" value={form.language} onChange={e => setForm({ ...form, language: e.target.value })} />
            <Input label="عدد الصفحات" type="number" value={form.pages_count} onChange={e => setForm({ ...form, pages_count: e.target.value })} />
          </div>
          <Textarea label="الوصف" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5"><label className="text-xs font-bold text-on-surface-variant block">ملف PDF *</label><input type="file" accept=".pdf" onChange={e => setFiles({ ...files, book_file: e.target.files[0] })} className="text-sm text-on-surface-variant" /></div>
            <div className="space-y-1.5"><label className="text-xs font-bold text-on-surface-variant block">صورة الغلاف</label><input type="file" accept="image/*" onChange={e => setFiles({ ...files, cover_image: e.target.files[0] })} className="text-sm text-on-surface-variant" /></div>
          </div>
          <SubmitBtn loading={sub} label="رفع الكتاب" />
        </form>
      </Modal>
    </>
  );
}

// ═══════════════════════════════════════════
//  11. SUPPORT
// ═══════════════════════════════════════════
function SupportSection({ showMsg }) {
  const [form, setForm] = useState({ subject: '', message: '' });
  const [sub, setSub] = useState(false);

  const send = async (e) => {
    e.preventDefault(); setSub(true);
    try {
      await API.post('/instructor/support', form);
      showMsg('success', 'تم إرسال رسالتك للإدارة بنجاح');
      setForm({ subject: '', message: '' });
    } catch { showMsg('error', 'خطأ في الإرسال'); }
    finally { setSub(false); }
  };

  return (
    <>
      <SectionHeader title="الدعم الفني - تواصل مع الإدارة" />
      <Card>
        <form onSubmit={send} className="space-y-4 max-w-lg">
          <Input label="الموضوع *" required value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} placeholder="مثال: مشكلة في رفع فيديو الدرس..." />
          <Textarea label="الرسالة *" required value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} placeholder="صف المشكلة أو الاستفسار بالتفصيل..." />
          <SubmitBtn loading={sub} label="إرسال الرسالة" />
        </form>
      </Card>
    </>
  );
}