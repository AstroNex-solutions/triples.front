import React, { useState, useContext, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../context/AuthContext';
import {
  BookOpen, Award, Shield, Settings,
  Calendar, CheckCircle2, AlertCircle, MessageSquare, BookMarked, ShoppingBag,
  ChevronRight, ChevronLeft, FileText, Globe, LogOut, Home, Menu, X,
  Lock, TrendingUp, BarChart2, HelpCircle, ChevronDown, ChevronUp,
  AlertTriangle, Play
} from 'lucide-react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';
import API from '../api/axios';

import { Avatar } from './student/SharedUI';

export default function StudentDashboard() {
  const { user, logout } = useContext(AuthContext);
  const { t, i18n } = useTranslation();
  const [sidebarOpen, setSidebarOpen] = useState(true); // Default to false on mobile, we'll handle desktop via CSS
  const [globalMsg, setGlobalMsg] = useState({ type: '', text: '' });
  const navigate = useNavigate();
  const location = useLocation();
  const activeSection = location.pathname.split('/').pop() === 'dashboard' ? 'overview' : location.pathname.split('/').pop();

  // Close sidebar on mobile when navigating
  useEffect(() => {
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  }, [location]);

  const [stats, setStats] = useState(null);
  const [expandedCourses, setExpandedCourses] = useState({});
  const [saConfirmModal, setSaConfirmModal] = useState({ show: false, courseId: null, courseTitle: '' });

  const handleConfirmStartSA = () => {
    if (saConfirmModal.courseId) {
      navigate(`/course-quiz-player/${saConfirmModal.courseId}`);
      setSaConfirmModal({ show: false, courseId: null, courseTitle: '' });
    }
  };

  useEffect(() => {
    API.get('/student/stats').then(r => setStats(r.data)).catch(console.error);
  }, []);

  const activeCourses = stats?.activeCourses || [];
  const features = stats?.features || {};
  const hasCourses = activeCourses.length > 0;

  const toggleCourse = (courseId) => {
    setExpandedCourses(prev => ({ ...prev, [courseId]: !prev[courseId] }));
  };

  const menuGroups = [
    {
      title: '', // Single main group based on request
      items: [
        { key: 'overview', label: t('student.overview.myCourses'), icon: Award },
        ...(hasCourses ? activeCourses.map(course => {
          const courseFeatures = course.features || {};
          return {
            key: `course-${course.id}`,
            label: course.title,
            icon: BookOpen,
            isCourse: true,
            courseId: course.id,
            subItems: [
              { key: `dashboard/course/${course.id}/flashcards`, label: t('student.dashboard.flashcards'), icon: BookMarked, locked: courseFeatures.flashcards === false, name: "flashcards" },
              { key: `dashboard/course/${course.id}/qbank`, label: t('student.dashboard.questionsBank'), icon: HelpCircle, locked: courseFeatures.qbank === false, name: "qbank" },
              { key: `/course-quiz-player/${course.id}`, label: t('student.dashboard.selfAssessment'), icon: CheckCircle2, locked: courseFeatures.selfAssessment === false, name: "selfAssessment" },
            ]
          };
        }) : []),
        { key: 'performance', label: t('student.dashboard.performance'), icon: TrendingUp, locked: !hasCourses || features.performance === false },
        { key: 'freeze', label: t('student.dashboard.freeze'), icon: Lock, locked: !hasCourses || features.freeze === false },
        { key: 'orders', label: t('student.dashboard.purchaseHistory'), icon: ShoppingBag },
        ...(features.library !== false ? [{ key: 'library', label: t('student.dashboard.myLibrary'), icon: BookMarked }] : []),
        { key: 'support', label: t('student.dashboard.supportTickets'), icon: MessageSquare },
      ]
    }
  ];

  const showMsg = (type, text) => {
    setGlobalMsg({ type, text });
    setTimeout(() => setGlobalMsg({ type: '', text: '' }), 4000);
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'ar' : 'en';
    i18n.changeLanguage(newLang);
    document.documentElement.dir = newLang === 'en' ? 'ltr' : 'rtl';
    document.documentElement.lang = newLang;
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const activeItemLabel = menuGroups.flatMap(g => g.items).find(i => i.key === activeSection)?.label;

  return (
    <div className="flex min-h-screen bg-background text-on-background font-sans transition-colors duration-300" dir={i18n.language === 'en' ? 'ltr' : 'rtl'}>
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:sticky top-0 h-screen z-40 flex flex-col shrink-0
        bg-surface-container-low/95 md:bg-surface-container-low/80 
        border-r border-outline-variant/30 backdrop-blur-2xl 
        transition-all duration-300 
        ${sidebarOpen ? 'translate-x-0 w-64' : 'w-64 -translate-x-full md:translate-x-0 md:w-20 rtl:translate-x-full rtl:md:translate-x-0'}
      `}>
        <div className="h-16 px-4 flex items-center justify-between border-b border-outline-variant/20">
          <div className={`flex items-center gap-2 ${!sidebarOpen ? 'md:hidden' : ''}`}>
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center text-on-primary font-extrabold text-sm shadow-sm">
              <Shield size={16} />
            </div>
            <span className="text-sm font-black text-on-surface tracking-wide">{t('student.dashboard.title')}</span>
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-xl hover:bg-surface-variant/40 text-on-surface-variant transition-colors cursor-pointer hidden md:block"
          >
            {sidebarOpen ? (
              i18n.language === 'en' ? <ChevronLeft size={18} /> : <ChevronRight size={18} />
            ) : (
              i18n.language === 'en' ? <ChevronRight size={18} /> : <ChevronLeft size={18} />
            )}
          </button>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-2 rounded-xl hover:bg-surface-variant/40 text-on-surface-variant transition-colors cursor-pointer md:hidden"
          >
            <X size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-4 custom-scrollbar">

          {/* Profile Section (Desktop Expanded & Mobile) */}
          <div
            onClick={() => navigate('/dashboard/account')}
            className={`flex flex-col items-center p-4 rounded-3xl bg-surface-container-low border border-outline-variant/30 shadow-sm mb-6 cursor-pointer hover:border-primary/40 hover:bg-surface-variant/20 transition-all ${!sidebarOpen ? 'md:hidden' : ''}`}
          >
            <div className="w-16 h-16 rounded-full bg-primary/10 mb-3 flex items-center justify-center p-0.5 shadow-sm">
              <Avatar name={user?.name || t('student.overview.student')} size="lg" image={user?.image_profile} />
            </div>
            <h3 className="font-extrabold text-sm text-on-surface truncate w-full text-center">{user?.name || t('student.overview.student')}</h3>
            <p className="text-[11px] text-on-surface-variant mt-1">{t('student.dashboard.studentRole')}</p>
          </div>

          {/* Profile Section (Desktop Collapsed) */}
          <div
            onClick={() => navigate('/dashboard/account')}
            className={`hidden ${!sidebarOpen ? 'md:flex' : ''} flex-col items-center p-2 rounded-2xl bg-surface-container-low border border-outline-variant/30 shadow-sm mb-6 cursor-pointer hover:border-primary/40 transition-all`}
            title={t('student.dashboard.studentRole')}
          >
            <Avatar name={user?.name || t('student.overview.student')} size="sm" image={user?.image_profile} />
          </div>

          {menuGroups.map((group, idx) => (
            <div key={idx} className="space-y-1">
              {group.title && (
                <p className={`px-3 text-[10px] font-black uppercase tracking-wider text-on-surface-variant/50 mb-2 ${!sidebarOpen ? 'md:hidden' : ''}`}>
                  {group.title}
                </p>
              )}
              {group.items.map(item => {
                const Icon = item.icon;
                const isActive = activeSection === item.key;

                if (item.isCourse) {
                  const isExpanded = expandedCourses[item.courseId];
                  return (
                    <div key={item.key} className="space-y-1 mt-2 mb-2">
                      <button
                        onClick={() => toggleCourse(item.courseId)}
                        title={!sidebarOpen ? item.label : undefined}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer bg-primary/5 text-primary hover:bg-primary/10 ${!sidebarOpen ? 'md:justify-center' : ''}`}
                      >
                        <Icon size={18} className="shrink-0" />
                        <span className={`truncate flex-1 text-left rtl:text-right ${!sidebarOpen ? 'md:hidden' : ''}`}>{item.label}</span>
                        {sidebarOpen && (isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />)}
                      </button>

                      {isExpanded && sidebarOpen && (
                        <div className="pl-9 rtl:pl-0 rtl:pr-9 space-y-1 mt-1">
                          {item.subItems.map(sub => (
                            <button
                              key={sub.key}
                              onClick={() => {
                                if (sub.locked) return;
                                if (sub.name === 'selfAssessment') {
                                  setSaConfirmModal({
                                    show: true,
                                    courseId: item.courseId,
                                    courseTitle: item.label
                                  });
                                } else {
                                  navigate(`/${sub.key.replace(/^\//, '')}`);
                                }
                              }}
                              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[11px] font-medium transition-all ${sub.locked ? 'opacity-50 cursor-not-allowed text-on-surface-variant' : 'cursor-pointer hover:bg-surface-variant/30 text-on-surface'}`}
                            >
                              <sub.icon size={14} className="shrink-0" />
                              <span className="truncate flex-1 text-left rtl:text-right">{sub.label}</span>
                              {sub.locked && <Lock size={12} className="shrink-0 text-error" />}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                }

                let itemClasses = 'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ';
                if (!sidebarOpen) itemClasses += 'md:justify-center ';

                if (item.locked) {
                  itemClasses += 'opacity-60 cursor-not-allowed text-on-surface-variant';
                } else if (isActive) {
                  itemClasses += 'bg-primary text-white shadow-sm font-bold';
                } else {
                  itemClasses += 'cursor-pointer hover:bg-surface-variant/30 text-on-surface-variant hover:text-on-surface';
                }

                return (
                  <button
                    key={item.key}
                    onClick={() => !item.locked && navigate(`/dashboard/${item.key}`)}
                    title={!sidebarOpen ? item.label : undefined}
                    className={itemClasses}
                  >
                    <Icon size={18} className="shrink-0" />
                    <span className={`truncate flex-1 text-left rtl:text-right ${!sidebarOpen ? 'md:hidden' : ''}`}>{item.label}</span>
                    {item.locked && sidebarOpen && <Lock size={14} className="shrink-0 text-error" />}
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
        <header className="h-16 border-b border-outline-variant/20 bg-surface/40 backdrop-blur-xl px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 -ml-2 rounded-xl text-on-surface-variant hover:bg-surface-variant/40 transition-colors md:hidden"
            >
              <Menu size={20} />
            </button>
            <div className="flex items-center gap-1 sm:gap-2">
              <span className="text-[10px] sm:text-xs font-medium text-on-surface-variant hidden sm:inline">{t('student.dashboard.platform')}</span>
              <span className="text-[10px] sm:text-xs text-on-surface-variant/40 hidden sm:inline">/</span>
              <span className="text-xs sm:text-sm font-bold text-on-surface truncate max-w-[120px] sm:max-w-none">
                {activeItemLabel}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/')} className="px-3 py-2 rounded-xl bg-surface/50 border border-outline-variant/30 text-on-surface-variant hover:bg-primary hover:border-primary hover:text-on-primary transition-all shadow-sm cursor-pointer flex items-center gap-2" title="زيارة الموقع / Visit Site">
              <Home size={16} />
              <span className="hidden sm:inline text-xs font-bold">{t('student.dashboard.visitSite', 'زيارة الموقع')}</span>
            </button>
            <ThemeToggle />
            <button onClick={toggleLanguage} className="p-2 rounded-xl bg-surface/50 border border-outline-variant/30 text-on-surface-variant hover:bg-surface hover:text-primary transition-all shadow-sm cursor-pointer" title="تغيير اللغة / Change Language">
              <Globe size={18} />
            </button>
            <button onClick={handleLogout} className="p-2 rounded-xl text-rose-500 hover:bg-rose-500/10 transition-all cursor-pointer" title={t('student.dashboard.logout')}>
              <LogOut size={18} />
            </button>
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

          <Outlet context={{ showMsg, stats }} />
        </div>
      </main>

      {/* ⚠️ Self Assessment Start Confirmation Modal */}
      {saConfirmModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-surface border border-outline-variant/30 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200 text-on-surface">
            {/* Top red/amber warning accent */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-rose-500 to-red-600" />

            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 flex items-center justify-center mb-4 shadow-inner">
                <AlertTriangle size={36} />
              </div>

              <span className="text-[11px] font-black uppercase tracking-wider text-rose-600 mb-1">
                {t('courseSA.warningTitle', 'تنبيه هام ومشدد قبل بدء الامتحان')}
              </span>
              <h3 className="text-xl font-black text-on-surface mb-2">
                {t('courseSA.warningSubtitle', 'التقييم الذاتي الشامل (Self Assessment)')}
              </h3>
              {saConfirmModal.courseTitle && (
                <p className="text-xs font-bold text-primary mb-3 px-3 py-1 bg-primary/10 rounded-lg inline-block">
                  {saConfirmModal.courseTitle}
                </p>
              )}
              
              <div className="bg-surface-container-low rounded-2xl p-4 border border-outline-variant/30 text-start space-y-3 w-full text-xs">
                <div className="flex items-start gap-2.5">
                  <span className="text-rose-500 font-black text-base shrink-0 leading-none mt-0.5">•</span>
                  <p className="text-on-surface leading-relaxed">
                    <strong className="text-rose-600 font-extrabold">{t('courseQuizPlayer.cancelExamBtn', 'إلغاء الامتحان')}: </strong>
                    {t('courseSA.cancelRule', 'عند الرغبة في الخروج وإلغاء الامتحان، لن يتم احتساب أي نتيجة أو حفظ إجاباتك، وستتم إعادتك مباشرة إلى الصفحة الرئيسية.')}
                  </p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="text-indigo-500 font-black text-base shrink-0 leading-none mt-0.5">•</span>
                  <p className="text-on-surface leading-relaxed">
                    <strong className="text-indigo-600 font-extrabold">{t('courseQuizPlayer.timeUsed', 'مؤقت زمني')}: </strong>
                    {t('courseSA.timerRule', 'الاختبار محدد بوقت دقيقة واحدة لكل سؤال، ويبدأ العد التنازلي فور بدء التقييم.')}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <button
                type="button"
                onClick={() => setSaConfirmModal({ show: false, courseId: null, courseTitle: '' })}
                className="flex-1 py-3 px-4 rounded-xl bg-surface-container border border-outline-variant/30 text-on-surface font-bold text-xs hover:bg-surface-container-high transition-all cursor-pointer"
              >
                {t('courseSA.cancelReturnBtn', 'إلغاء والعودة')}
              </button>
              
              <button
                type="button"
                onClick={handleConfirmStartSA}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white font-black text-xs shadow-md shadow-rose-500/20 hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Play size={16} className="fill-current" />
                <span>{t('courseSA.readyStartBtn', 'أنا جاهز، ابدأ الامتحان الآن')}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}