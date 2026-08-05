import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import API from '../api/axios';
import {
  BookOpen, Clock, Award, Shield, FileText, Settings,
  LogOut, PlayCircle, Star, Calendar, CheckCircle2,
  AlertCircle, MessageSquare, Loader2, BookMarked, ShoppingBag,
  CreditCard, ExternalLink, ChevronRight, ChevronLeft, Lock, Globe, PauseCircle
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL;

// معالجة رابط الصورة بشكل آمن ونظيف
const getImageSrc = (imgSrc) => {
  if (!imgSrc) return '';
  if (imgSrc.startsWith('http://') || imgSrc.startsWith('https://')) {
    return imgSrc;
  }
  // ضمان عدم تكرار الـ Slash عند دمج المسار
  const cleanBase = API_URL.replace(/\/$/, '');
  const cleanPath = imgSrc.startsWith('/') ? imgSrc : `/${imgSrc}`;
  return `${cleanBase}${cleanPath}`;
};
// ═══════════════════════════════════════════
//  SIDEBAR MENU GROUPS
// ═══════════════════════════════════════════
const MENU_GROUPS = [
  {
    title: 'الرئيسية',
    items: [
      { key: 'overview', label: 'لوحة القيادة', icon: Award },
      { key: 'account', label: 'إعدادات الحساب', icon: Settings },
    ]
  },
  {
    title: 'التعليم والتقدم',
    items: [
      { key: 'courses', label: 'دوراتي', icon: BookOpen },
      { key: 'schedule', label: 'جدول المذاكرة', icon: Calendar },
      // { key: 'assessments', label: 'الاختبارات والنتائج', icon: CheckCircle2 }
    ]
  },
  {
    title: 'مشترياتي',
    items: [
      { key: 'orders', label: 'سجل المشتريات', icon: ShoppingBag },
    ]
  },
  {
    title: 'المجتمع والدعم',
    items: [
      { key: 'library', label: 'المقالات والمكتبة', icon: BookMarked },
      { key: 'support', label: 'الدعم الفني', icon: MessageSquare },
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

function SectionHeader({ title, count }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-extrabold text-on-surface">{title} {count !== undefined && <span className="text-xs text-on-surface-variant font-medium mr-2">({count})</span>}</h3>
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

function Avatar({ name = '', size = 'md', image = null }) {
  const initials = name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  const sizes = { sm: 'w-7 h-7 text-xs', md: 'w-9 h-9 text-xs', lg: 'w-11 h-11 text-sm' };
  


if (image) {
  return (
    <img
      src={getImageSrc(image)}
      alt={name || 'صورة'}
      className={`${sizes[size]} rounded-full object-cover border border-outline-variant/30 bg-surface-container`}
    />
  );
}
  
  return (
    <div className={`${sizes[size]} rounded-full bg-primary/10 text-primary font-black border border-primary/20 flex items-center justify-center shrink-0`}>
      {initials || 'S'}
    </div>
  );
}

// ═══════════════════════════════════════════
//  MAIN STUDENT DASHBOARD
// ═══════════════════════════════════════════
export default function StudentDashboard() {
  const { user } = useContext(AuthContext);
  const [activeSection, setActiveSection] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [globalMsg, setGlobalMsg] = useState({ type: '', text: '' });
  const navigate = useNavigate();

  const showMsg = (type, text) => {
    setGlobalMsg({ type, text });
    setTimeout(() => setGlobalMsg({ type: '', text: '' }), 4000);
  };

  return (
    <div className="flex bg-background font-sans pb-14" dir="rtl">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} shrink-0 bg-surface-container-low/60 border-l border-outline-variant/30 backdrop-blur-2xl transition-all duration-300 sticky top-0 flex flex-col z-30`}>
        <div className="h-16 px-4 flex items-center justify-between border-b border-outline-variant/20">
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center text-on-primary font-extrabold text-sm shadow-sm">
                <Shield size={16} />
              </div>
              <span className="text-sm font-black text-on-surface tracking-wide">لوحة الطالب</span>
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
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${isActive ? 'bg-primary text-on-primary shadow-sm font-bold' : 'text-on-surface-variant hover:bg-surface-variant/30 hover:text-on-surface'}`}>
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
            <span className="text-xs font-medium text-on-surface-variant">منصة الطالب</span>
            <span className="text-xs text-on-surface-variant/40">/</span>
            <span className="text-xs font-bold text-on-surface">
              {MENU_GROUPS.flatMap(g => g.items).find(i => i.key === activeSection)?.label}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-on-surface hidden sm:inline">{user?.name}</span>
            <Avatar name={user?.name || 'Student'} size="sm" image={user?.image_profile} />
          </div>
        </header>

        {/* Dynamic Body */}
        <div className="p-6 sm:p-8 space-y-6 max-w-6xl w-full mx-auto">
          {globalMsg.text && (
            <div className={`p-4 rounded-xl text-xs font-bold flex items-center gap-3 border ${globalMsg.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' : 'bg-rose-500/10 border-rose-500/30 text-rose-500'}`}>
              {globalMsg.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
              <span>{globalMsg.text}</span>
            </div>
          )}

          {activeSection === 'overview' && <OverviewSection />}
          {activeSection === 'account' && <AccountSection showMsg={showMsg} />}
          {activeSection === 'courses' && <CoursesSection />}
          {activeSection === 'schedule' && <ScheduleSection showMsg={showMsg} />}
          {/* {activeSection === 'assessments' && <AssessmentsSection />} */}
          {activeSection === 'orders' && <OrdersSection />}
          {activeSection === 'library' && <LibrarySection />}
          {activeSection === 'support' && <SupportSection showMsg={showMsg} />}
        </div>
      </main>
    </div>
  );
}

// ═══════════════════════════════════════════
//  1. OVERVIEW
// ═══════════════════════════════════════════
function OverviewSection() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    API.get('/student/stats').then(r => setStats(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="py-20 flex justify-center"><Loader2 size={32} className="animate-spin text-primary" /></div>;
  if (!stats) return null;

  return (
    <>
      <div className="mb-6">
        <h2 className="text-2xl font-extrabold text-on-surface">مرحباً بعودتك! 👋</h2>
        <p className="text-sm text-on-surface-variant mt-1">تابع تقدمك واستكمل رحلتك التعليمية نحو النجاح.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="كورساتي المسجلة" value={stats.enrollmentsCount} icon={BookOpen} color="primary" />
        <StatCard label="الكورسات المكتملة" value={stats.completedCoursesCount} icon={Award} color="emerald" />
        <StatCard label="اختبارات متاحة" value={stats.pendingAssessmentsCount} icon={CheckCircle2} color="amber" />
        <StatCard label="المشتريات" value={stats.ordersCount} icon={ShoppingBag} color="cyan" />
      </div>
    </>
  );
}

// ═══════════════════════════════════════════
//  2. ACCOUNT & PROFILE
// ═══════════════════════════════════════════
function AccountSection({ showMsg }) {
  const { user, setUser, logout } = useContext(AuthContext);
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '', interests: user?.interests || '' });
  const [password, setPassword] = useState('');
  const [file, setFile] = useState(null);
  const [sub, setSub] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [freezeReason, setFreezeReason] = useState('');

  const fetchSessions = () => API.get('/student/sessions').then(r => setSessions(r.data.sessions)).catch(console.error);
  useEffect(() => { fetchSessions(); }, []);

  const handleProfileSubmit = async (e) => {
    e.preventDefault(); setSub(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (password) fd.append('password', password);
      if (file) fd.append('image_profile', file);
      const res = await API.put('/student/profile', fd);
      setUser(res.data.user);
      showMsg('success', 'تم تحديث البيانات بنجاح');
      setPassword('');
    } catch { showMsg('error', 'حدث خطأ في التحديث'); }
    finally { setSub(false); }
  };

  const revokeSession = async (id) => {
    try { await API.post(`/student/sessions/${id}/revoke`); fetchSessions(); showMsg('success', 'تم إنهاء الجلسة'); } catch { showMsg('error', 'خطأ'); }
  };

  const handleFreeze = async () => {
    if(!confirm('تحذير: سيتم إيقاف حسابك مؤقتاً ولن تتمكن من تسجيل الدخول حتى تتواصل مع الإدارة لفك التجميد. هل أنت متأكد؟')) return;
    try {
      await API.post('/student/freeze', { reason: freezeReason });
      logout();
    } catch { showMsg('error', 'خطأ في تجميد الحساب'); }
  };

  return (
    <div className="space-y-6">
      <SectionHeader title="الملف الشخصي" />
      <Card>
        <form onSubmit={handleProfileSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="الاسم الكامل" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            <Input label="رقم الهاتف" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} dir="ltr" />
            <Input label="كلمة المرور الجديدة (اختياري)" type="password" value={password} onChange={e => setPassword(e.target.value)} dir="ltr" placeholder="اتركه فارغاً إذا لم ترد تغييره" />
            <Input label="الاهتمامات التعليمية" value={form.interests} onChange={e => setForm({ ...form, interests: e.target.value })} placeholder="مثال: الطب البشري، الصيدلة..." />
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-on-surface-variant block">الصورة الشخصية</label>
              <input type="file" accept="image/*" onChange={e => setFile(e.target.files[0])} className="text-sm text-on-surface-variant" />
            </div>
          </div>
          <SubmitBtn loading={sub} label="تحديث البيانات" />
        </form>
      </Card>

      {/* <SectionHeader title="الأجهزة المتصلة بحسابك" />
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs sm:text-sm border-separate border-spacing-y-1">
            <thead><tr className="text-on-surface-variant/70"><th className="p-3">المتصفح</th><th className="p-3">تاريخ الدخول</th><th className="p-3 text-center">إنهاء</th></tr></thead>
            <tbody>{sessions.map(s => (
              <tr key={s.id} className="bg-surface/50 hover:bg-surface/80 transition-all">
                <td className="p-3 text-on-surface-variant text-xs max-w-[200px] truncate">{s.user_agent || '—'}</td>
                <td className="p-3 text-xs text-on-surface-variant">{new Date(s.createdAt).toLocaleString('ar-EG')}</td>
                <td className="p-3 text-center">
                  {s.is_active && <button onClick={() => revokeSession(s.id)} className="px-3 py-1.5 rounded-lg bg-rose-500/10 text-rose-500 font-bold hover:bg-rose-500/20 transition-all cursor-pointer text-[11px]">تسجيل خروج من هنا</button>}
                  {!s.is_active && <span className="text-[10px] text-on-surface-variant/50">منتهية</span>}
                </td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </Card>

      <SectionHeader title="إدارة الحساب" />
      <Card className="border-rose-500/30">
        <h4 className="text-sm font-bold text-on-surface mb-2 flex items-center gap-2"><PauseCircle size={18} className="text-rose-500" /> إيقاف الحساب مؤقتاً (تجميد)</h4>
        <p className="text-xs text-on-surface-variant mb-4 max-w-3xl">إذا كنت ترغب في إيقاف اشتراكاتك مؤقتاً لظروف خاصة، يمكنك تجميد الحساب. لن تتمكن من الدخول للمنصة حتى تتواصل مع الإدارة لفك التجميد.</p>
        <div className="flex items-center gap-3 max-w-md">
          <input value={freezeReason} onChange={e => setFreezeReason(e.target.value)} placeholder="سبب التجميد (اختياري)" className="flex-1 px-4 py-2 bg-surface border border-outline-variant/50 rounded-xl text-sm text-on-surface" />
          <button onClick={handleFreeze} className="px-4 py-2 bg-rose-500 text-white font-bold text-xs rounded-xl hover:bg-rose-600 transition-all cursor-pointer">تأكيد التجميد</button>
        </div>
      </Card> */}
    </div>
  );
}

// ═══════════════════════════════════════════
//  3. COURSES & PROGRESS
// ═══════════════════════════════════════════
function CoursesSection() {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    API.get('/student/enrollments').then(r => setEnrollments(r.data.enrollments)).catch(console.error).finally(() => setLoading(false));
  }, []);

  return (
    <>
      <SectionHeader title="دوراتي المسجلة" count={enrollments.length} />
      {loading ? <div className="py-12 flex justify-center"><Loader2 size={24} className="animate-spin text-primary" /></div> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {enrollments.map(e => (
            <Card key={e.id} className="flex flex-col">
              <div className="h-32 rounded-xl bg-surface-variant/50 mb-4 overflow-hidden relative">
                {e.course?.image ? (
                  <img src={(e.course.image?.startsWith('http') ? e.course.image : getImageSrc(e.course.image))} alt={e.course.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-on-surface-variant opacity-50"><BookOpen size={40} /></div>
                )}
                {e.status === 'completed' && <div className="absolute top-2 right-2 bg-emerald-500 text-white text-[10px] font-bold px-2 py-1 rounded-lg">مكتمل 🎉</div>}
              </div>
              <h4 className="text-sm font-extrabold text-on-surface line-clamp-2 mb-2">{e.course?.title}</h4>
              
              <div className="mt-auto space-y-3">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px] font-bold text-on-surface-variant">
                    <span>التقدم</span>
                    <span>{Math.round(e.progress || 0)}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-outline-variant/20 overflow-hidden">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${e.progress || 0}%` }} />
                  </div>
                </div>
                
                <Link to={`/learn/${e.course_id}/lesson/first`} className="w-full py-2 bg-primary/10 text-primary hover:bg-primary/20 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer">
                  <PlayCircle size={16} /> متابعة التعلم
                </Link>
              </div>
            </Card>
          ))}
          {enrollments.length === 0 && (
            <div className="col-span-full py-12 text-center">
              <div className="w-16 h-16 bg-surface-variant/30 text-on-surface-variant/50 rounded-2xl flex items-center justify-center mx-auto mb-3"><BookOpen size={24} /></div>
              <p className="text-sm font-bold text-on-surface">لم تقم بالتسجيل في أي كورس بعد.</p>
              <Link to="/courses" className="text-xs text-primary font-bold hover:underline mt-2 inline-block">تصفح الكورسات المتاحة</Link>
            </div>
          )}
        </div>
      )}
    </>
  );
}

// ═══════════════════════════════════════════
//  4. SCHEDULE
// ═══════════════════════════════════════════
function ScheduleSection({ showMsg }) {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrollments, setEnrollments] = useState([]);
  const [form, setForm] = useState({ course_id: '', start_date: '', end_date: '', daily_hours: 4 });
  const [daysOff, setDaysOff] = useState([]);
  const [sub, setSub] = useState(false);

  const DAYS_OF_WEEK = [
    { id: 'Saturday', label: 'السبت' },
    { id: 'Sunday', label: 'الأحد' },
    { id: 'Monday', label: 'الإثنين' },
    { id: 'Tuesday', label: 'الثلاثاء' },
    { id: 'Wednesday', label: 'الأربعاء' },
    { id: 'Thursday', label: 'الخميس' },
    { id: 'Friday', label: 'الجمعة' }
  ];

  const handleDayToggle = (dayId) => {
    setDaysOff(prev => 
      prev.includes(dayId) ? prev.filter(d => d !== dayId) : [...prev, dayId]
    );
  };

  const fetchData = () => {
    setLoading(true);
    Promise.all([API.get('/student/schedules'), API.get('/student/enrollments')])
      .then(([s, e]) => { setSchedules(s.data.schedules); setEnrollments(e.data.enrollments); })
      .catch(console.error).finally(() => setLoading(false));
  };
  useEffect(() => { fetchData(); }, []);

  const createSchedule = async (e) => {
    e.preventDefault(); setSub(true);
    try {
      await API.post('/student/schedules', { ...form, days_off: daysOff });
      showMsg('success', 'تمت إضافة موعد المذاكرة بنجاح');
      setForm({ course_id: '', start_date: '', end_date: '', daily_hours: 4 });
      setDaysOff([]);
      fetchData();
    } catch { showMsg('error', 'خطأ في إضافة الموعد'); } finally { setSub(false); }
  };

  const delSchedule = async (id) => {
    try { await API.delete(`/student/schedules/${id}`); showMsg('success', 'تم الحذف'); fetchData(); } catch { showMsg('error', 'خطأ'); }
  };

  return (
    <>
      <SectionHeader title="جدول المذاكرة" count={schedules.length} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <h4 className="text-sm font-bold text-on-surface mb-4">إضافة موعد جديد</h4>
            <form onSubmit={createSchedule} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-on-surface-variant block">الكورس</label>
                <select required value={form.course_id} onChange={e => setForm({ ...form, course_id: e.target.value })} className="w-full px-4 py-2.5 bg-surface/80 border border-outline-variant/50 rounded-2xl text-sm text-on-surface">
                  <option value="">اختر الكورس</option>
                  {enrollments.map(e => <option key={e.course_id} value={e.course_id}>{e.course?.title}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input label="تاريخ البدء" type="date" required value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })} />
                <Input label="تاريخ الانتهاء" type="date" value={form.end_date} onChange={e => setForm({ ...form, end_date: e.target.value })} />
              </div>
              
              <Input label="ساعات المذاكرة اليومية" type="number" min="1" max="24" required value={form.daily_hours} onChange={e => setForm({ ...form, daily_hours: e.target.value })} />
              
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-on-surface-variant block">أيام الإجازة الأسبوعية</label>
                <div className="flex flex-wrap gap-2">
                  {DAYS_OF_WEEK.map(day => (
                    <button
                      key={day.id}
                      type="button"
                      onClick={() => handleDayToggle(day.id)}
                      className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all border ${daysOff.includes(day.id) ? 'bg-primary text-on-primary border-primary' : 'bg-surface border-outline-variant/50 text-on-surface-variant hover:border-primary/50'}`}
                    >
                      {day.label}
                    </button>
                  ))}
                </div>
              </div>

              <SubmitBtn loading={sub} label="حفظ الجدول" />
            </form>
          </Card>
        </div>
        <div className="lg:col-span-2 space-y-3">
          {loading ? <div className="py-12 flex justify-center"><Loader2 size={24} className="animate-spin text-primary" /></div> : (
            schedules.length === 0 ? (
              <Card className="text-center py-10 text-on-surface-variant">لا توجد مواعيد مذاكرة مسجلة.</Card>
            ) : (
              schedules.map(s => (
                <Card key={s.id} className="flex items-center justify-between border-l-4 border-l-primary">
                  <div>
                    <h4 className="text-sm font-bold text-on-surface mb-2">{s.course?.title || 'كورس غير معروف'}</h4>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                      <p className="text-xs text-on-surface-variant flex items-center gap-1.5"><Calendar size={14}/> يبدأ: {new Date(s.start_date).toLocaleDateString('ar-EG')}</p>
                      {s.end_date && <p className="text-xs text-on-surface-variant flex items-center gap-1.5"><CheckCircle2 size={14}/> ينتهي: {new Date(s.end_date).toLocaleDateString('ar-EG')}</p>}
                      <p className="text-xs text-on-surface-variant flex items-center gap-1.5"><Clock size={14}/> {s.daily_hours} ساعات يومياً</p>
                    </div>
                    {(() => {
                      let parsedDaysOff = [];
                      if (Array.isArray(s.days_off)) parsedDaysOff = s.days_off;
                      else if (typeof s.days_off === 'string') {
                        try { parsedDaysOff = JSON.parse(s.days_off); } catch (e) {}
                      }
                      
                      return parsedDaysOff.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          <span className="text-[10px] font-bold text-on-surface-variant/70">أيام الإجازة:</span>
                          {parsedDaysOff.map(d => (
                            <span key={d} className="px-2 py-0.5 rounded bg-surface border border-outline-variant/30 text-[10px] text-on-surface-variant">
                              {DAYS_OF_WEEK.find(dw => dw.id === d)?.label || d}
                            </span>
                          ))}
                        </div>
                      );
                    })()}
                  </div>
                  <button onClick={() => delSchedule(s.id)} className="p-2 text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors text-xs font-bold">حذف</button>
                </Card>
              ))
            )
          )}
        </div>
      </div>
    </>
  );
}

// ═══════════════════════════════════════════
//  5. ASSESSMENTS
// ═══════════════════════════════════════════
function AssessmentsSection() {
  const [assessments, setAssessments] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([API.get('/student/assessments'), API.get('/student/assessment-results')])
      .then(([a, r]) => { setAssessments(a.data.assessments); setResults(r.data.attempts); })
      .catch(console.error).finally(() => setLoading(false));
  }, []);

  return (
    <>
      <SectionHeader title="الاختبارات متاحة" count={assessments.length} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        {loading ? <Loader2 size={24} className="animate-spin text-primary m-4" /> : (
          assessments.length === 0 ? <p className="text-xs text-on-surface-variant">لا توجد اختبارات متاحة لكورساتك الحالية.</p> :
          assessments.map(a => (
            <Card key={a.id} className="border-l-4 border-l-amber-500">
              <h4 className="text-sm font-bold text-on-surface">{a.title}</h4>
              <p className="text-xs text-on-surface-variant mt-1">{a.Course?.title} • {a.type} • {a.duration_minutes} دقيقة</p>
              <Link to={`/assessment/${a.course_id}`} className="mt-3 inline-block px-4 py-1.5 bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 rounded-lg text-xs font-bold transition-all">بدء الاختبار</Link>
            </Card>
          ))
        )}
      </div>

      <SectionHeader title="نتائج اختباراتي السابقة" count={results.length} />
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs sm:text-sm border-separate border-spacing-y-1">
            <thead><tr className="text-on-surface-variant/70"><th className="p-3">تاريخ الاختبار</th><th className="p-3">النتيجة</th><th className="p-3">عدد الإجابات</th></tr></thead>
            <tbody>
              {results.map(r => (
                <tr key={r.id} className="bg-surface/50 hover:bg-surface/80 transition-all">
                  <td className="p-3 font-bold text-on-surface" dir="ltr">{new Date(r.createdAt).toLocaleString('ar-EG')}</td>
                  <td className="p-3">
                    <Badge text={r.total_score ? `${r.total_score} درجة` : 'بانتظار التقييم'} variant={r.total_score ? 'success' : 'warning'} />
                  </td>
                  <td className="p-3 text-on-surface-variant">{r.answers?.length || 0} أسئلة مجابة</td>
                </tr>
              ))}
              {results.length === 0 && <tr><td colSpan={3} className="p-4 text-center text-on-surface-variant text-xs">لا توجد نتائج سابقة</td></tr>}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}

// ═══════════════════════════════════════════
//  6. ORDERS
// ═══════════════════════════════════════════
function OrdersSection() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    API.get('/student/orders').then(r => setOrders(r.data.orders)).catch(console.error).finally(() => setLoading(false));
  }, []);

  return (
    <>
      <SectionHeader title="سجل المشتريات والفواتير" count={orders.length} />
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs sm:text-sm border-separate border-spacing-y-1">
            <thead><tr className="text-on-surface-variant/70"><th className="p-3">رقم الطلب</th><th className="p-3">المحتوى</th><th className="p-3">المبلغ الإجمالي</th><th className="p-3">الحالة</th><th className="p-3">التاريخ</th></tr></thead>
            <tbody>
              {loading ? <tr><td colSpan={5} className="p-4 text-center"><Loader2 size={16} className="animate-spin inline" /></td></tr> : (
                orders.map(o => (
                  <tr key={o.id} className="bg-surface/50 hover:bg-surface/80 transition-all">
                    <td className="p-3 font-bold text-primary" dir="ltr">{o.order_number}</td>
                    <td className="p-3 text-on-surface-variant text-xs max-w-[200px] truncate">{o.items?.map(i => i.course?.title).join(' + ')}</td>
                    <td className="p-3 font-bold text-on-surface" dir="ltr">${o.total_price}</td>
                    <td className="p-3"><Badge text={o.status === 'completed' ? 'مكتمل' : o.status} variant={o.status === 'completed' ? 'success' : 'warning'} /></td>
                    <td className="p-3 text-xs text-on-surface-variant">{new Date(o.createdAt).toLocaleDateString('ar-EG')}</td>
                  </tr>
                ))
              )}
              {!loading && orders.length === 0 && <tr><td colSpan={5} className="p-4 text-center text-xs text-on-surface-variant">لا توجد مشتريات سابقة</td></tr>}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}

// ═══════════════════════════════════════════
//  7. LIBRARY & ARTICLES (Links)
// ═══════════════════════════════════════════
function LibrarySection() {
  return (
    <>
      <SectionHeader title="المصادر الإضافية" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="flex items-center justify-between border-l-4 border-l-cyan-500">
          <div>
            <h4 className="text-sm font-bold text-on-surface">المدونة الطبية</h4>
            <p className="text-xs text-on-surface-variant mt-1 max-w-xs">اقرأ أحدث المقالات والنصائح التعليمية لزيادة معرفتك.</p>
          </div>
          <Link to="/articles" className="p-3 bg-surface rounded-xl hover:bg-cyan-500/10 text-cyan-500 transition-colors"><ExternalLink size={20} /></Link>
        </Card>
        
        <Card className="flex items-center justify-between border-l-4 border-l-emerald-500">
          <div>
            <h4 className="text-sm font-bold text-on-surface">المكتبة الرقمية (الكتب)</h4>
            <p className="text-xs text-on-surface-variant mt-1 max-w-xs">تصفح وحمل أهم المراجع والكتب الطبية المتوفرة مجاناً.</p>
          </div>
          <Link to="/library" className="p-3 bg-surface rounded-xl hover:bg-emerald-500/10 text-emerald-500 transition-colors"><ExternalLink size={20} /></Link>
        </Card>
      </div>
    </>
  );
}

// ═══════════════════════════════════════════
//  8. SUPPORT
// ═══════════════════════════════════════════
function SupportSection({ showMsg }) {
  const [form, setForm] = useState({ subject: '', message: '' });
  const [sub, setSub] = useState(false);

  const send = async (e) => {
    e.preventDefault(); setSub(true);
    try {
      await API.post('/student/support', form);
      showMsg('success', 'تم إرسال رسالتك بنجاح وسنتواصل معك قريباً');
      setForm({ subject: '', message: '' });
    } catch { showMsg('error', 'خطأ في الإرسال'); }
    finally { setSub(false); }
  };

  return (
    <>
      <SectionHeader title="الدعم الفني والشكاوى" />
      <Card>
        <p className="text-xs text-on-surface-variant mb-4">هل واجهت مشكلة في الدفع؟ أو لديك استفسار بخصوص المنهج؟ أرسل لنا رسالة وسنقوم بالرد في أسرع وقت.</p>
        <form onSubmit={send} className="space-y-4 max-w-lg">
          <Input label="الموضوع *" required value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} placeholder="مثال: مشكلة في فتح الدرس..." />
          <Textarea label="الرسالة بالتفصيل *" required value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} placeholder="اكتب استفسارك أو مشكلتك هنا..." />
          <SubmitBtn loading={sub} label="إرسال الطلب" />
        </form>
      </Card>
    </>
  );
}