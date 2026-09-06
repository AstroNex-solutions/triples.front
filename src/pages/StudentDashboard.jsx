import React, { useState, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../context/AuthContext';
import {
  BookOpen, Award, Shield, Settings,
  Calendar, CheckCircle2, AlertCircle, MessageSquare, BookMarked, ShoppingBag,
  ChevronRight, ChevronLeft, FileText, Globe, LogOut, Home
} from 'lucide-react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';

import { Avatar } from './student/SharedUI';

export default function StudentDashboard() {
  const { user, logout } = useContext(AuthContext);
  const { t, i18n } = useTranslation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [globalMsg, setGlobalMsg] = useState({ type: '', text: '' });
  const navigate = useNavigate();
  const location = useLocation();
  const activeSection = location.pathname.split('/').pop() === 'dashboard' ? 'overview' : location.pathname.split('/').pop();

  const menuGroups = [
    {
      title: t('student.dashboard.groups.home'),
      items: [
        { key: 'overview', label: t('student.dashboard.items.overview'), icon: Award },
        { key: 'account', label: t('student.dashboard.items.account'), icon: Settings },
      ]
    },
    {
      title: t('student.dashboard.groups.learning'),
      items: [
        { key: 'courses', label: t('student.dashboard.items.courses'), icon: BookOpen },
        { key: 'flashcards', label: t('student.dashboard.items.flashcards'), icon: BookMarked },
        { key: 'schedule', label: t('student.dashboard.items.schedule'), icon: Calendar },
      ]
    },
    // {
    //   title: t('student.dashboard.groups.assessments'),
    //   items: [
    //     { key: 'assessments', label: t('student.dashboard.items.assessments'), icon: CheckCircle2 },
    //     { key: 'self_assessments', label: t('student.dashboard.items.self_assessments'), icon: Award },
    //     { key: 'question_banks', label: t('student.dashboard.items.question_banks'), icon: FileText },
    //   ]
    // },
    {
      title: t('student.dashboard.groups.purchases'),
      items: [
        { key: 'orders', label: t('student.dashboard.items.orders'), icon: ShoppingBag },
      ]
    },
    {
      title: t('student.dashboard.groups.community'),
      items: [
        { key: 'library', label: t('student.dashboard.items.library'), icon: BookMarked },
        { key: 'support', label: t('student.dashboard.items.support'), icon: MessageSquare },
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
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} shrink-0 bg-surface-container-low/80 border-r border-outline-variant/30 backdrop-blur-2xl transition-all duration-300 sticky top-0 h-screen flex flex-col z-30`}>
        <div className="h-16 px-4 flex items-center justify-between border-b border-outline-variant/20">
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center text-on-primary font-extrabold text-sm shadow-sm">
                <Shield size={16} />
              </div>
              <span className="text-sm font-black text-on-surface tracking-wide">{t('student.dashboard.title')}</span>
            </div>
          )}
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)} 
            className="p-2 rounded-xl hover:bg-surface-variant/40 text-on-surface-variant transition-colors cursor-pointer"
          >
            {sidebarOpen ? (
              i18n.language === 'en' ? <ChevronLeft size={18} /> : <ChevronRight size={18} />
            ) : (
              i18n.language === 'en' ? <ChevronRight size={18} /> : <ChevronLeft size={18} />
            )}
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 custom-scrollbar">
          {menuGroups.map((group, idx) => (
            <div key={idx} className="space-y-1">
              {sidebarOpen && <p className="px-3 text-[10px] font-black uppercase tracking-wider text-on-surface-variant/50 mb-2">{group.title}</p>}
              {group.items.map(item => {
                const Icon = item.icon;
                const isActive = activeSection === item.key;
                return (
                  <button 
                    key={item.key} 
                    onClick={() => navigate(`/dashboard/${item.key}`)} 
                    title={!sidebarOpen ? item.label : undefined}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${isActive ? 'bg-primary text-on-primary shadow-sm font-bold' : 'text-on-surface-variant hover:bg-surface-variant/30 hover:text-on-surface'}`}
                  >
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
        <header className="h-16 border-b border-outline-variant/20 bg-surface/40 backdrop-blur-xl px-6 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-on-surface-variant">{t('student.dashboard.platform')}</span>
            <span className="text-xs text-on-surface-variant/40">/</span>
            <span className="text-xs font-bold text-on-surface">
              {activeItemLabel}
            </span>
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
            <div className="h-6 w-px bg-outline-variant/30 mx-1"></div>
            <span className="text-xs font-bold text-on-surface hidden sm:inline">{user?.name}</span>
            <Avatar name={user?.name || 'Student'} size="sm" image={user?.image_profile} />
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

          <Outlet context={{ showMsg }} />
        </div>
      </main>
    </div>
  );
}