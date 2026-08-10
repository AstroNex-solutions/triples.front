import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import {
  Users, BookOpen, Tag, GraduationCap, FileText, ClipboardList, Ticket, Package,
  Star, Image, Mail, BookMarked, LayoutDashboard, ChevronLeft,
  ChevronRight, Globe, Handshake, HelpCircle, CheckCircle2, AlertCircle, Database, Target, LogOut
} from 'lucide-react';

import { Avatar } from './adminComponents/ui/SharedUI';
import DashboardSection from './adminComponents/sections/DashboardSection';
import UsersSection from './adminComponents/sections/UsersSection';
import LanguageSwitcher from '../components/LanguageSwitcher';
import SessionsSection from './adminComponents/sections/SessionsSection';
import CategoriesSection from './adminComponents/sections/CategoriesSection';
import CoursesSection from './adminComponents/sections/CoursesSection';
import EnrollmentsSection from './adminComponents/sections/EnrollmentsSection';
import AssessmentsSection from './adminComponents/sections/AssessmentsSection';
import CouponsSection from './adminComponents/sections/CouponsSection';
import OrdersSection from './adminComponents/sections/OrdersSection';
import ReviewsSection from './adminComponents/sections/ReviewsSection';
import BannersSection from './adminComponents/sections/BannersSection';
import MessagesSection from './adminComponents/sections/MessagesSection';
import ArticlesSection from './adminComponents/sections/ArticlesSection';
import BooksSection from './adminComponents/sections/BooksSection';
import QuestionBankProductsSection from './adminComponents/sections/QuestionBankProductsSection';
import SelfAssessmentProductsSection from './adminComponents/sections/SelfAssessmentProductsSection';
import PartnersSection from './adminComponents/sections/PartnersSection';
import FaqsSection from './adminComponents/sections/FaqsSection';
import PagesSection from './adminComponents/sections/PagesSection';

const MENU_GROUPS = [
  {
    title: 'الرئيسية',
    items: [
      { key: 'dashboard', label: 'الإحصائيات', icon: LayoutDashboard },
      { key: 'sessions', label: 'الجلسات النشطة', icon: Globe },
    ]
  },
  {
    title: 'المستخدمون والتعلم',
    items: [
      { key: 'users', label: 'المستخدمين', icon: Users },
      { key: 'courses', label: 'الكورسات', icon: BookOpen },
      { key: 'enrollments', label: 'الاشتراكات', icon: GraduationCap },
      { key: 'assessments', label: 'الاختبارات', icon: ClipboardList },
    ]
  },
  {
    title: 'المتجر والتجارة',
    items: [
      { key: 'categories', label: 'الأقسام والوسوم', icon: Tag },
      { key: 'coupons', label: 'الكوبونات', icon: Ticket },
      { key: 'orders', label: 'الطلبات', icon: Package },
      { key: 'question-bank-products', label: 'بنوك الأسئلة', icon: Database },
      { key: 'self-assessment-products', label: 'التقييمات الذاتية', icon: Target },
      { key: 'reviews', label: 'التقييمات', icon: Star },
    ]
  },
  {
    title: 'المحتوى والتواصل',
    items: [
      { key: 'banners', label: 'البنرات الإعلانية', icon: Image },
      { key: 'articles', label: 'المقالات', icon: FileText },
      { key: 'partners', label: 'الشركاء', icon: Handshake },
      { key: 'faqs', label: 'الأسئلة الشائعة', icon: HelpCircle },
      { key: 'pages', label: 'الصفحات الثابتة', icon: FileText },
      { key: 'books', label: 'المكتبة', icon: BookMarked },
      { key: 'messages', label: 'رسائل التواصل', icon: Mail },
    ]
  }
];

export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [globalMsg, setGlobalMsg] = useState({ type: '', text: '' });
  
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const showMsg = (type, text) => {
    setGlobalMsg({ type, text });
    setTimeout(() => setGlobalMsg({ type: '', text: '' }), 4000);
  };

  return (
    <div className="flex bg-background font-sans ">
      {/* Sidebar Navigation */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} shrink-0 bg-surface-container-low/60 border-l border-outline-variant/30 backdrop-blur-2xl transition-all duration-300 sticky top-0 h-screen flex flex-col z-30`}>
        {/* Sidebar Header */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-outline-variant/20">
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center text-on-primary font-extrabold text-sm shadow-sm">
                A
              </div>
              <span className="text-sm font-black text-on-surface tracking-wide">لوحة التحكم</span>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-xl hover:bg-surface-variant/40 text-on-surface-variant transition-colors cursor-pointer mr-auto"
          >
            {sidebarOpen ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        {/* Sidebar Links */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {MENU_GROUPS.map((group, idx) => (
            <div key={idx} className="space-y-1">
              {sidebarOpen && (
                <p className="px-3 text-[10px] font-black uppercase tracking-wider text-on-surface-variant/50 mb-2">
                  {group.title}
                </p>
              )}
              {group.items.map(item => {
                const Icon = item.icon;
                const isActive = activeSection === item.key;
                return (
                  <button
                    key={item.key}
                    onClick={() => setActiveSection(item.key)}
                    title={!sidebarOpen ? item.label : undefined}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-primary text-on-primary shadow-sm font-bold'
                        : 'text-on-surface-variant hover:bg-surface-variant/30 hover:text-on-surface'
                    }`}
                  >
                    <Icon size={18} className="shrink-0" />
                    {sidebarOpen && <span className="truncate">{item.label}</span>}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
        
        {/* Logout Button */}
        <div className="p-4 border-t border-outline-variant/20">
          <button
            onClick={handleLogout}
            title={!sidebarOpen ? 'تسجيل الخروج' : undefined}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-rose-500 hover:bg-rose-500/10 transition-all cursor-pointer"
          >
            <LogOut size={18} className="shrink-0" />
            {sidebarOpen && <span>تسجيل الخروج</span>}
          </button>
        </div>
      </aside>

      {/* Main Layout Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        {/* Top Navbar */}
        <header className="h-16 border-b border-outline-variant/20 bg-surface/30 backdrop-blur-xl px-6 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-on-surface-variant">الرئيسية</span>
            <span className="text-xs text-on-surface-variant/40">/</span>
            <span className="text-xs font-bold text-on-surface">
              {MENU_GROUPS.flatMap(g => g.items).find(i => i.key === activeSection)?.label}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <Avatar name="Admin User" size="sm" />
          </div>
        </header>

        {/* Dynamic Body */}
        <div className="p-6 sm:p-8 space-y-6 max-w-7xl w-full mx-auto">
          {/* Notification Alert */}
          {globalMsg.text && (
            <div className={`p-4 rounded-xl text-xs font-bold flex items-center gap-3 border animate-slide-down ${
              globalMsg.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-500'
            }`}>
              {globalMsg.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
              <span>{globalMsg.text}</span>
            </div>
          )}

          {/* Active Section Rendering */}
          {activeSection === 'dashboard' && <DashboardSection />}
          {activeSection === 'users' && <UsersSection showMsg={showMsg} />}
          {activeSection === 'sessions' && <SessionsSection showMsg={showMsg} />}
          {activeSection === 'categories' && <CategoriesSection showMsg={showMsg} />}
          {activeSection === 'courses' && <CoursesSection showMsg={showMsg} />}
          {activeSection === 'enrollments' && <EnrollmentsSection showMsg={showMsg} />}
          {activeSection === 'assessments' && <AssessmentsSection showMsg={showMsg} />}
          {activeSection === 'coupons' && <CouponsSection showMsg={showMsg} />}
          {activeSection === 'orders' && <OrdersSection showMsg={showMsg} />}
          {activeSection === 'reviews' && <ReviewsSection showMsg={showMsg} />}
          {activeSection === 'banners' && <BannersSection showMsg={showMsg} />}
          {activeSection === 'messages' && <MessagesSection showMsg={showMsg} />}
          {activeSection === 'articles' && <ArticlesSection showMsg={showMsg} />}
          {activeSection === 'books' && <BooksSection showMsg={showMsg} />}
          {activeSection === 'question-bank-products' && <QuestionBankProductsSection showMsg={showMsg} />}
          {activeSection === 'self-assessment-products' && <SelfAssessmentProductsSection showMsg={showMsg} />}
          {activeSection === 'partners' && <PartnersSection showMsg={showMsg} />}
          {activeSection === 'faqs' && <FaqsSection showMsg={showMsg} />}
          {activeSection === 'pages' && <PagesSection showMsg={showMsg} />}
        </div>
      </main>
    </div>
  );
}