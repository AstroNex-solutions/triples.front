import React, { useState, useContext, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../context/AuthContext';
import {
  BookOpen, Award, Shield, Settings,
  Calendar, CheckCircle2, AlertCircle, MessageSquare, BookMarked, ShoppingBag,
  ChevronRight, ChevronLeft, FileText, Globe, LogOut, Home, Menu, X,
  Lock, TrendingUp, BarChart2, HelpCircle, ChevronDown, ChevronUp
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
        { key: 'overview', label: t('student.dashboard.overview'), icon: Award },
        ...(hasCourses ? activeCourses.map(course => {
          const courseFeatures = course.features || {};
          return {
            key: `course-${course.id}`,
            label: course.title,
            icon: BookOpen,
            isCourse: true,
            courseId: course.id,
            subItems: [
              { key: `course/${course.id}/flashcards`, label: t('student.dashboard.flashcards'), icon: BookMarked, locked: courseFeatures.flashcards === false },
              { key: `course/${course.id}/qbank`, label: t('student.dashboard.questionsBank'), icon: HelpCircle, locked: courseFeatures.qbank === false },
              { key: `course/${course.id}/selfAssessment`, label: t('student.dashboard.selfAssessment'), icon: CheckCircle2, locked: courseFeatures.selfAssessment === false },
            ]
          };
        }) : []),
        { key: 'performance', label: t('student.dashboard.performance'), icon: TrendingUp, locked: !hasCourses || features.performance === false },
        { key: 'freeze', label: t('student.dashboard.freeze'), icon: Lock, locked: !hasCourses || features.freeze === false },
        { key: 'orders', label: t('student.dashboard.purchaseHistory'), icon: ShoppingBag },
        { key: 'library', label: t('student.dashboard.myLibrary'), icon: BookMarked },
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
                              onClick={() => !sub.locked && navigate(`/dashboard/${sub.key}`)}
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
              <span className="hidden sm:inline text-xs font-bold">Visit Site</span>
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
    </div>
  );
}