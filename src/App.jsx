import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Routes, Route, Outlet, Navigate } from 'react-router-dom';
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
import FlashcardsStorePage from './pages/FlashcardsStorePage';
import FlashcardStudyPage from './pages/FlashcardStudyPage';
import ArticlesPage from './pages/ArticlesPage';
import ArticleDetailPage from './pages/ArticleDetailPage';
import LibraryPage from './pages/LibraryPage';
import CartPage from './pages/CartPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import StudentDashboard from './pages/StudentDashboard';
import SecureViewer from './pages/student/SecureViewer';
import OverviewSection from './pages/student/OverviewSection';
import AccountSection from './pages/student/AccountSection';
import CoursesSection from './pages/student/CoursesSection';
import ScheduleSection from './pages/student/ScheduleSection';
import AssessmentsSection from './pages/student/AssessmentsSection';
import SelfAssessmentsSection from './pages/student/SelfAssessmentsSection';
import QuestionBanksSection from './pages/student/QuestionBanksSection';
import OrdersSection from './pages/student/OrdersSection';
import LibrarySection from './pages/student/LibrarySection';
import SupportSection from './pages/student/SupportSection';
import ModuleSection from './pages/student/ModuleSection';
import FlashcardsStudentSection from './pages/student/FlashcardsStudentSection';
import CourseFlashcardsSection from './pages/student/CourseFlashcardsSection';
import CourseQBankSection from './pages/student/CourseQBankSection';
import CourseSelfAssessmentSection from './pages/student/CourseSelfAssessmentSection';
import ModuleQuizPlayerPage from './pages/student/ModuleQuizPlayerPage';
import CourseQuizPlayerPage from './pages/student/CourseQuizPlayerPage';
import FreezeSection from './pages/student/FreezeSection';
import PerformanceSection from './pages/student/PerformanceSection';
import PaymentResultPage from './pages/PaymentResultPage';
import FeatureCheckoutPage from './pages/FeatureCheckoutPage';
import AdminDashboard from './pages/AdminDashboard';
import ContactPage from './pages/ContactPage';
import AboutUsPage from './pages/AboutUsPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import InstructorDashboard from './pages/InstructorDashboard';
import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';

// Admin Sections
import DashboardSection from './pages/adminComponents/sections/DashboardSection';
import AdminUsersSection from './pages/adminComponents/sections/UsersSection';
import AdminSessionsSection from './pages/adminComponents/sections/SessionsSection';
import AdminCategoriesSection from './pages/adminComponents/sections/CategoriesSection';
import AdminCoursesSection from './pages/adminComponents/sections/CoursesSection';
import AdminEnrollmentsSection from './pages/adminComponents/sections/EnrollmentsSection';
import AdminAssessmentsSection from './pages/adminComponents/sections/AssessmentsSection';
import AdminCouponsSection from './pages/adminComponents/sections/CouponsSection';
import AdminOrdersSection from './pages/adminComponents/sections/OrdersSection';
import AdminReviewsSection from './pages/adminComponents/sections/ReviewsSection';
import AdminBannersSection from './pages/adminComponents/sections/BannersSection';
import AdminMessagesSection from './pages/adminComponents/sections/MessagesSection';
import AdminArticlesSection from './pages/adminComponents/sections/ArticlesSection';
import AdminBooksSection from './pages/adminComponents/sections/BooksSection';
import AdminFlashcardsSection from './pages/adminComponents/sections/FlashcardsAdminSection';
import AdminQuestionBankProductsSection from './pages/adminComponents/sections/QuestionBankProductsSection';
import AdminSelfAssessmentProductsSection from './pages/adminComponents/sections/SelfAssessmentProductsSection';
import AdminPartnersSection from './pages/adminComponents/sections/PartnersSection';
import AdminFaqsSection from './pages/adminComponents/sections/FaqsSection';
import AdminPagesSection from './pages/adminComponents/sections/PagesSection';
import AdminFooterSection from './pages/adminComponents/sections/FooterSection';
import AdminProfileSection from './pages/adminComponents/sections/ProfileSection';

import { useThemeStore } from './store/themeStore';
import AboutPage from './pages/AboutPage';

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
          <Route path="/admin" element={<AdminDashboard />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<DashboardSection />} />
            <Route path="users" element={<AdminUsersSection />} />
            <Route path="sessions" element={<AdminSessionsSection />} />
            <Route path="categories" element={<AdminCategoriesSection />} />
            <Route path="courses" element={<AdminCoursesSection />} />
            <Route path="enrollments" element={<AdminEnrollmentsSection />} />
            <Route path="assessments" element={<AdminAssessmentsSection />} />
            <Route path="coupons" element={<AdminCouponsSection />} />
            <Route path="orders" element={<AdminOrdersSection />} />
            <Route path="reviews" element={<AdminReviewsSection />} />
            <Route path="banners" element={<AdminBannersSection />} />
            <Route path="messages" element={<AdminMessagesSection />} />
            <Route path="articles" element={<AdminArticlesSection />} />
            <Route path="books" element={<AdminBooksSection />} />
            <Route path="flashcard-products" element={<AdminFlashcardsSection />} />
            <Route path="question-bank-products" element={<AdminQuestionBankProductsSection />} />
            <Route path="self-assessment-products" element={<AdminSelfAssessmentProductsSection />} />
            <Route path="partners" element={<AdminPartnersSection />} />
            <Route path="faqs" element={<AdminFaqsSection />} />
            <Route path="pages" element={<AdminPagesSection />} />
            <Route path="footer" element={<AdminFooterSection />} />
            <Route path="profile" element={<AdminProfileSection />} />
          </Route>
        </Route>

        {/* ===== Student Dashboard - بدون Navbar ولا Footer ===== */}
        <Route element={<ProtectedRoute allowedRoles={['Student']} />}>
          <Route path="/dashboard" element={<StudentDashboard />}>
            <Route index element={<Navigate to="overview" replace />} />
            <Route path="overview" element={<OverviewSection />} />
            <Route path="account" element={<AccountSection />} />
            <Route path="courses" element={<CoursesSection />} />
            <Route path="flashcards" element={<FlashcardsStudentSection />} />
            <Route path="schedule" element={<ScheduleSection />} />
            <Route path="assessments" element={<AssessmentsSection />} />
            <Route path="self_assessments" element={<SelfAssessmentsSection />} />
            <Route path="question_banks" element={<QuestionBanksSection />} />
            <Route path="orders" element={<OrdersSection />} />
            <Route path="library" element={<LibrarySection />} />
            <Route path="support" element={<SupportSection />} />
            <Route path="course/:courseId/module/:moduleId" element={<ModuleSection />} />
            <Route path="course/:courseId/flashcards" element={<CourseFlashcardsSection />} />
            <Route path="course/:courseId/qbank" element={<CourseQBankSection />} />
            <Route path="course/:courseId/selfAssessment" element={<CourseSelfAssessmentSection />} />
            <Route path="freeze" element={<FreezeSection />} />
            <Route path="performance" element={<PerformanceSection />} />
          </Route>
          <Route path="learn/:courseId" element={<CoursePlayerPage />} />
          <Route path="learn/:courseId/lesson/:lessonId" element={<CoursePlayerPage />} />
          <Route path="/assessment/:assessmentId" element={<AssessmentPage />} />
          <Route path="/self-assessment/:id" element={<SelfAssessmentPage />} />
          <Route path="/question-bank/:id" element={<QuestionBankPage />} />
          <Route path="/question-bank" element={<QuestionBankPage />} />
          <Route path="/self-assessment" element={<SelfAssessmentPage />} />
          <Route path="/study-flashcards/:deckId" element={<FlashcardStudyPage />} />
          <Route path="/quiz-player/:moduleId" element={<ModuleQuizPlayerPage />} />
          <Route path="/course-quiz-player/:courseId" element={<CourseQuizPlayerPage />} />
          <Route path="/secure-viewer" element={<SecureViewer />} />
          <Route path="/payment-result" element={<PaymentResultPage />} />
          <Route path="/checkout/feature/:courseId/:featureType" element={<FeatureCheckoutPage />} />
        </Route>

        {/* ===== Instructor Dashboard - بدون Navbar ولا Footer ===== */}
        <Route element={<ProtectedRoute allowedRoles={['Instructor']} />}>
          <Route path="/instructor" element={<InstructorDashboard />} />
        </Route>

        {/* ===== باقي الصفحات مع Navbar و Footer ===== */}
        <Route element={<MainLayout showSplash={showSplash} />}>

          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          {/* Extras / Features */}
          <Route path="/about" element={<AboutUsPage />} />
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/courses/:slug" element={<CourseDetailPage />} />
          <Route path="/flashcards-store" element={<FlashcardsStorePage />} />
          <Route path="/articles" element={<ArticlesPage />} />
          <Route path="/articles/:id" element={<ArticleDetailPage />} />
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

        </Route>

      </Routes>
    </>
  );
}
