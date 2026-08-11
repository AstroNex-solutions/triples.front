import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Routes, Route, Outlet } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import GuestRoute from './components/GuestRoute';
import SplashScreen from './components/SplashScreen';

// Pages
import HomePage from './pages/HomePage';
import CoursesPage from './pages/CoursesPage';
import CourseDetailPage from './pages/CourseDetailPage';
import CoursePlayerPage from './pages/CoursePlayerPage';
import AssessmentPage from './pages/AssessmentPage';
import SelfAssessmentPage from './pages/SelfAssessmentPage';
import QuestionBankPage from './pages/QuestionBankPage';
import ArticlesPage from './pages/ArticlesPage';
import LibraryPage from './pages/LibraryPage';
import CartPage from './pages/CartPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import StudentDashboard from './pages/StudentDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ContactPage from './pages/ContactPage';
import AboutPage from './pages/AboutPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import InstructorDashboard from './pages/InstructorDashboard';
import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';

import { useThemeStore } from './store/themeStore';

// Layout يحتوي على Navbar و Footer - يستخدم لكل الصفحات العادية
function MainLayout({ showSplash }) {
  return (
    <div className={`flex flex-col min-h-screen ${showSplash ? 'hidden' : ''} mt-24`}>
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const { i18n } = useTranslation();
  const initTheme = useThemeStore((state) => state.initTheme);

  useEffect(() => {
    initTheme();
  }, [initTheme]);

  useEffect(() => {
    document.documentElement.dir = i18n.language === 'en' ? 'ltr' : 'rtl';
    document.documentElement.lang = i18n.language || 'ar';
  }, [i18n.language]);

  return (
    <>
      {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}
      <Routes>

        {/* ===== Admin Dashboard - بدون Navbar ولا Footer ===== */}
        <Route element={<ProtectedRoute allowedRoles={['Admin']} />}>
          <Route path="/admin" element={<AdminDashboard />} />
        </Route>

        {/* ===== Student Dashboard - بدون Navbar ولا Footer ===== */}
        <Route element={<ProtectedRoute allowedRoles={['Student']} />}>
          <Route path="/dashboard" element={<StudentDashboard />} />
          <Route path="/assessment/:assessmentId" element={<AssessmentPage />} />
          <Route path="/self-assessment/:id" element={<SelfAssessmentPage />} />
          <Route path="/question-bank/:id" element={<QuestionBankPage />} />
          <Route path="/learn/:courseId" element={<CoursePlayerPage />} />
          <Route path="/learn/:courseId/lesson/:lessonId" element={<CoursePlayerPage />} />
        </Route>

        {/* ===== Instructor Dashboard - بدون Navbar ولا Footer ===== */}
        <Route element={<ProtectedRoute allowedRoles={['Instructor']} />}>
          <Route path="/instructor" element={<InstructorDashboard />} />
        </Route>

        {/* ===== باقي الصفحات مع Navbar و Footer ===== */}
        <Route element={<MainLayout showSplash={showSplash} />}>

          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/courses/:slug" element={<CourseDetailPage />} />
          <Route path="/articles" element={<ArticlesPage />} />
          <Route path="/library" element={<LibraryPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />

          {/* Guest Routes (لغير مسجلي الدخول فقط) */}
          <Route element={<GuestRoute />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
          </Route>

          {/* Protected Routes (Logged in users) */}
          <Route element={<ProtectedRoute />}>
            <Route path="/learn/:courseId" element={<CoursePlayerPage />} />
            <Route path="/learn/:courseId/lesson/:lessonId" element={<CoursePlayerPage />} />
          </Route>

        </Route>

      </Routes>
    </>
  );
}