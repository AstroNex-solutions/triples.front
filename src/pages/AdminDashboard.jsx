import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
import ThemeToggle from '../components/ThemeToggle';
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
import FlashcardsAdminSection from './adminComponents/sections/FlashcardsAdminSection';
import QuestionBankProductsSection from './adminComponents/sections/QuestionBankProductsSection';
import SelfAssessmentProductsSection from './adminComponents/sections/SelfAssessmentProductsSection';
import PartnersSection from './adminComponents/sections/PartnersSection';
import FaqsSection from './adminComponents/sections/FaqsSection';
import PagesSection from './adminComponents/sections/PagesSection';
import BrokenVideosList from './adminComponents/BrokenVideosList';

export default function AdminDashboard() {
  const { t, i18n } = useTranslation();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [globalMsg, setGlobalMsg] = useState({ type: '', text: '' });
  
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const menuGroups = [
    {
      title: t('admin.dashboard.groups.home'),
      items: [
        { key: 'dashboard', label: t('admin.dashboard.items.dashboard'), icon: LayoutDashboard },
        { key: 'sessions', label: t('admin.dashboard.items.sessions'), icon: Globe },
      ]
    },
    {
      title: t('admin.dashboard.groups.usersAndLearning'),
      items: [
        { key: 'users', label: t('admin.dashboard.items.users'), icon: Users },
        { key: 'courses', label: t('admin.dashboard.items.courses'), icon: BookOpen },
        { key: 'enrollments', label: t('admin.dashboard.items.enrollments'), icon: GraduationCap },
        { key: 'assessments', label: t('admin.dashboard.items.assessments'), icon: ClipboardList },
      ]
    },
    {
      title: t('admin.dashboard.groups.storeAndCommerce'),
      items: [
        { key: 'categories', label: t('admin.dashboard.items.categories'), icon: Tag },
        { key: 'coupons', label: t('admin.dashboard.items.coupons'), icon: Ticket },
        { key: 'orders', label: t('admin.dashboard.items.orders'), icon: Package },
        { key: 'flashcard-products', label: t('admin.dashboard.items.flashcards'), icon: BookMarked },
        { key: 'question-bank-products', label: t('admin.dashboard.items.questionBankProducts'), icon: Database },
        { key: 'self-assessment-products', label: t('admin.dashboard.items.selfAssessmentProducts'), icon: Target },
        { key: 'reviews', label: t('admin.dashboard.items.reviews'), icon: Star },
      ]
    },
    {
      title: t('admin.dashboard.groups.contentAndCommunication'),
      items: [
        { key: 'banners', label: t('admin.dashboard.items.banners'), icon: Image },
        { key: 'articles', label: t('admin.dashboard.items.articles'), icon: FileText },
        { key: 'partners', label: t('admin.dashboard.items.partners'), icon: Handshake },
        { key: 'faqs', label: t('admin.dashboard.items.faqs'), icon: HelpCircle },
        { key: 'pages', label: t('admin.dashboard.items.pages'), icon: FileText },
        { key: 'books', label: t('admin.dashboard.items.books'), icon: BookMarked },
        { key: 'messages', label: t('admin.dashboard.items.messages'), icon: Mail },
        // { key: 'broken-videos', label: 'فحص الفيديوهات', icon: AlertCircle },
      ]
    }
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const showMsg = (type, text) => {
    setGlobalMsg({ type, text });
    setTimeout(() => setGlobalMsg({ type: '', text: '' }), 4000);
  };

  const activeItemLabel = menuGroups.flatMap(g => g.items).find(i => i.key === activeSection)?.label;

  return (
    <div className="flex bg-background text-on-background font-sans min-h-screen transition-colors duration-300" dir={i18n.language === 'en' ? 'ltr' : 'rtl'}>
      {/* Sidebar Navigation */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} shrink-0 bg-surface-container-low/80 border-r border-outline-variant/30 backdrop-blur-2xl transition-all duration-300 sticky top-0 h-screen flex flex-col z-30`}>
        {/* Sidebar Header */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-outline-variant/20">
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center text-on-primary font-extrabold text-sm shadow-sm">
                A
              </div>
              <span className="text-sm font-black text-on-surface tracking-wide">{t('admin.dashboard.title')}</span>
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

        {/* Sidebar Links */}
        <div className="flex-1 overflow-y-auto px-2 py-2 space-y-2.5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {menuGroups.map((group, idx) => (
            <div key={idx} className="space-y-0.5">
              {sidebarOpen && (
                <p className="px-2 text-[9px] font-black uppercase tracking-wider text-on-surface-variant/50 mb-1">
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
                    className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-primary text-on-primary shadow-sm font-bold'
                        : 'text-on-surface-variant hover:bg-surface-variant/30 hover:text-on-surface'
                    }`}
                  >
                    <Icon size={16} className="shrink-0" />
                    {sidebarOpen && <span className="truncate">{item.label}</span>}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
        
        {/* Logout Button */}
        <div className="p-2 border-t border-outline-variant/20">
          <button
            onClick={handleLogout}
            title={!sidebarOpen ? t('admin.dashboard.logout') : undefined}
            className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-rose-500 hover:bg-rose-500/10 transition-all cursor-pointer"
          >
            <LogOut size={16} className="shrink-0" />
            {sidebarOpen && <span>{t('admin.dashboard.logout')}</span>}
          </button>
        </div>
      </aside>

      {/* Main Layout Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        {/* Top Navbar */}
        <header className="h-16 border-b border-outline-variant/20 bg-surface/40 backdrop-blur-xl px-6 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-on-surface-variant">{t('admin.dashboard.home')}</span>
            <span className="text-xs text-on-surface-variant/40">/</span>
            <span className="text-xs font-bold text-on-surface">
              {activeItemLabel}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <LanguageSwitcher />
            <Avatar name="Admin User" size="sm" />
          </div>
        </header>

        {/* Dynamic Body */}
        <div className="p-6 sm:p-8 space-y-6 max-w-7xl w-full mx-auto">
          {/* Notification Alert */}
          {globalMsg.text && (
            <div className={`p-4 rounded-xl text-xs font-bold flex items-center gap-3 border ${
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
          {activeSection === 'flashcard-products' && <FlashcardsAdminSection showMsg={showMsg} />}
          {activeSection === 'question-bank-products' && <QuestionBankProductsSection showMsg={showMsg} />}
          {activeSection === 'self-assessment-products' && <SelfAssessmentProductsSection showMsg={showMsg} />}
          {activeSection === 'partners' && <PartnersSection showMsg={showMsg} />}
          {activeSection === 'faqs' && <FaqsSection showMsg={showMsg} />}
          {activeSection === 'pages' && <PagesSection showMsg={showMsg} />}
          {/* {activeSection === 'broken-videos' && <BrokenVideosList />} */}
        </div>
      </main>
    </div>
  );
}