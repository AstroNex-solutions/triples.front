import React, { useState, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../context/AuthContext';
import {
  BookOpen, Award, Shield, Settings,
  Calendar, CheckCircle2, AlertCircle, MessageSquare, BookMarked, ShoppingBag,
  ChevronRight, ChevronLeft, FileText, Globe, LogOut
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { Avatar } from './student/SharedUI';
import OverviewSection from './student/OverviewSection';
import AccountSection from './student/AccountSection';
import CoursesSection from './student/CoursesSection';
import ScheduleSection from './student/ScheduleSection';
import AssessmentsSection from './student/AssessmentsSection';
import SelfAssessmentsSection from './student/SelfAssessmentsSection';
import QuestionBanksSection from './student/QuestionBanksSection';
import OrdersSection from './student/OrdersSection';
import LibrarySection from './student/LibrarySection';
import SupportSection from './student/SupportSection';

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
    ]
  },
  {
    title: 'التقييمات والاختبارات',
    items: [
      { key: 'assessments', label: 'الاختبارات والنتائج', icon: CheckCircle2 },
      { key: 'self_assessments', label: 'التقييمات الذاتية', icon: Award },
      { key: 'question_banks', label: 'بنك الأسئلة', icon: FileText },
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
//  MAIN STUDENT DASHBOARD
// ═══════════════════════════════════════════
export default function StudentDashboard() {
  const { user, logout } = useContext(AuthContext);
  const { i18n } = useTranslation();
  const [activeSection, setActiveSection] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [globalMsg, setGlobalMsg] = useState({ type: '', text: '' });
  const navigate = useNavigate();

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

  return (
    <div className="flex min-h-screen bg-background font-sans" dir={i18n.language === 'en' ? 'ltr' : 'rtl'}>
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} shrink-0 bg-surface-container-low/60 border-l border-outline-variant/30 backdrop-blur-2xl transition-all duration-300 sticky top-0 h-screen flex flex-col z-30`}>
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
            <button onClick={toggleLanguage} className="p-2 rounded-xl bg-surface/50 border border-outline-variant/30 text-on-surface-variant hover:bg-surface hover:text-primary transition-all shadow-sm">
              <Globe size={18} />
            </button>
            <div className="h-6 w-px bg-outline-variant/30 mx-1"></div>
            <span className="text-xs font-bold text-on-surface hidden sm:inline">{user?.name}</span>
            <Avatar name={user?.name || 'Student'} size="sm" image={import.meta.env.VITE_API_URL+user?.image_profile} />
            <button onClick={handleLogout} className="p-2 rounded-xl text-rose-500 hover:bg-rose-500/10 transition-all ml-1">
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

          {activeSection === 'overview' && <OverviewSection />}
          {activeSection === 'account' && <AccountSection showMsg={showMsg} />}
          {activeSection === 'courses' && <CoursesSection />}
          {activeSection === 'schedule' && <ScheduleSection showMsg={showMsg} />}
          {activeSection === 'assessments' && <AssessmentsSection />}
          {activeSection === 'self_assessments' && <SelfAssessmentsSection />}
          {activeSection === 'question_banks' && <QuestionBanksSection />}
          {activeSection === 'orders' && <OrdersSection />}
          {activeSection === 'library' && <LibrarySection />}
          {activeSection === 'support' && <SupportSection showMsg={showMsg} />}
        </div>
      </main>
    </div>
  );
}