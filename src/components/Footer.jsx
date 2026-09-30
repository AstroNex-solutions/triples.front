import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axios';
import { 
  Mail, 
  MapPin,
  ChevronLeft,
  ChevronRight,
  Youtube,
  Facebook,
  Instagram,
  Twitter,
  BookOpen
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function Footer() {
  const { t, i18n } = useTranslation();
  const [logoError, setLogoError] = useState(false);
  const [contactInfo, setContactInfo] = useState(null);
  const isAr = i18n.language === 'ar';
  const ChevronIcon = isAr ? ChevronLeft : ChevronRight;

  useEffect(() => {
    API.get('/extras/contact-info')
      .then(res => setContactInfo(res.data.contactInfo || null))
      .catch(console.error);
  }, []);

  const desc = isAr ? contactInfo?.description_ar : contactInfo?.description;
  const address = isAr ? contactInfo?.address_ar : contactInfo?.address;

  return (
    <footer className="w-full bg-surface-container-lowest border-t border-outline-variant/30 text-on-surface pt-16 pb-8 relative overflow-hidden">
      
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(#6D02A5_1px,transparent_1px)] [background-size:20px_20px] opacity-[0.03] pointer-events-none dark:opacity-[0.05]"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-12">
          
          {/* 1. Brand */}
          <div className="space-y-6">
            {!logoError ? (
              <img 
                src="/logo.png" 
                alt="Logo" 
                className="h-20 object-contain"
                onError={() => setLogoError(true)}
              />
            ) : (
              <h3 className="text-2xl font-black text-primary">Triple S</h3>
            )}
            <p className="text-sm text-on-surface-variant leading-relaxed">
              {desc || t('footer.description') || 'منصة تعليمية رائدة تهدف لتقديم أفضل محتوى لطلاب الكليات الطبية بأحدث التقنيات وأفضل الخبراء.'}
            </p>
            <div className="flex items-center gap-3">
              {contactInfo?.facebook && (
                <a href={contactInfo.facebook} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-xl bg-surface border border-outline-variant/40 flex items-center justify-center text-on-surface-variant hover:text-primary hover:border-primary/50 transition-all shadow-sm">
                  <Facebook size={18} />
                </a>
              )}
              {contactInfo?.instagram && (
                <a href={contactInfo.instagram} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-xl bg-surface border border-outline-variant/40 flex items-center justify-center text-on-surface-variant hover:text-rose-500 hover:border-rose-500/50 transition-all shadow-sm">
                  <Instagram size={18} />
                </a>
              )}
              {contactInfo?.twitter && (
                <a href={contactInfo.twitter} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-xl bg-surface border border-outline-variant/40 flex items-center justify-center text-on-surface-variant hover:text-sky-500 hover:border-sky-500/50 transition-all shadow-sm">
                  <Twitter size={18} />
                </a>
              )}
              {contactInfo?.youtube && (
                <a href={contactInfo.youtube} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-xl bg-surface border border-outline-variant/40 flex items-center justify-center text-on-surface-variant hover:text-red-500 hover:border-red-500/50 transition-all shadow-sm">
                  <Youtube size={18} />
                </a>
              )}
            </div>
          </div>

          {/* 2. Quick Links */}
          <div className="space-y-6">
            <h4 className="text-lg font-bold text-on-surface relative inline-block">
              {t('footer.quickLinks') || 'روابط سريعة'}
              <div className="absolute -bottom-2 left-0 w-1/2 h-1 bg-primary rounded-full"></div>
            </h4>
            <ul className="space-y-3">
              {[
                { name: t('navbar.home') || 'الرئيسية', path: '/' },
                { name: t('footer.allCourses') || 'جميع الكورسات', path: '/courses' },
                { name: t('footer.blogAndNews') || 'المدونة', path: '/articles' },
                { name: t('navbar.about') || 'من نحن', path: '/about' },
                { name: t('navbar.contact') || 'تواصل معنا', path: '/contact' }
              ].map((link, idx) => (
                <li key={idx}>
                  <Link to={link.path} className="flex items-center gap-2 text-sm text-on-surface-variant hover:text-primary transition-colors group">
                    <ChevronIcon size={14} className="text-primary/50 group-hover:text-primary transition-colors" />
                    <span>{link.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 3. Specialities */}
          <div className="space-y-6">
            <h4 className="text-lg font-bold text-on-surface relative inline-block">
              {isAr ? 'أقسامنا' : 'Departments'}
              <div className="absolute -bottom-2 left-0 w-1/2 h-1 bg-secondary rounded-full"></div>
            </h4>
            <ul className="space-y-3">
              {[
                { name: isAr ? 'الطب البشري' : 'Medicine', path: '/courses?category=الطب البشري' },
                { name: isAr ? 'طب الأسنان' : 'Dentistry', path: '/courses?category=طب الأسنان' }
              ].map((link, idx) => (
                <li key={idx}>
                  <Link to={link.path} className="flex items-center gap-2 text-sm text-on-surface-variant hover:text-secondary transition-colors group">
                    <BookOpen size={14} className="text-secondary/50 group-hover:text-secondary transition-colors" />
                    <span>{link.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 4. Contact Info */}
          <div className="space-y-6">
            <h4 className="text-lg font-bold text-on-surface relative inline-block">
              {t('footer.contactAndSupport') || 'تواصل معنا'}
              <div className="absolute -bottom-2 left-0 w-1/2 h-1 bg-tertiary rounded-full"></div>
            </h4>
            <ul className="space-y-4">
              <li>
                <a href={`mailto:${contactInfo?.email || 'info@triplesacademy.com'}`} className="flex items-start gap-3 group">
                  <div className="w-8 h-8 rounded-lg bg-surface border border-outline-variant/30 flex items-center justify-center text-on-surface-variant group-hover:text-primary group-hover:border-primary/50 transition-all shrink-0">
                    <Mail size={14} />
                  </div>
                  <div className="flex flex-col pt-1 text-sm text-on-surface-variant group-hover:text-primary transition-colors">
                    <span className="font-bold text-xs opacity-70 mb-0.5">{isAr ? 'البريد الإلكتروني' : 'Email'}</span>
                    <span dir="ltr">{contactInfo?.email || 'info@triplesacademy.com'}</span>
                  </div>
                </a>
              </li>
              <li>
                <div className="flex items-start gap-3 group cursor-default">
                  <div className="w-8 h-8 rounded-lg bg-surface border border-outline-variant/30 flex items-center justify-center text-on-surface-variant group-hover:text-primary group-hover:border-primary/50 transition-all shrink-0">
                    <MapPin size={14} />
                  </div>
                  <div className="flex flex-col pt-1 text-sm text-on-surface-variant group-hover:text-primary transition-colors">
                    <span className="font-bold text-xs opacity-70 mb-0.5">{isAr ? 'العنوان' : 'Location'}</span>
                    <span>{address || (isAr ? 'القاهرة، جمهورية مصر العربية' : 'Cairo, Egypt')}</span>
                  </div>
                </div>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-outline-variant/30 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-xs text-on-surface-variant font-medium flex flex-wrap justify-center gap-1.5 items-center">
            <span>© {new Date().getFullYear()} Triple S Academy.</span>
            <span>{t('footer.poweredBy') || 'Powered by'}</span>
            <a 
              href="https://astronexsolutions.com/en/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="font-bold text-primary hover:underline hover:text-primary-hover transition-colors"
            >
              AstroNex Solutions
            </a>
          </div>
          
          <div className="flex items-center gap-6 text-xs font-bold text-on-surface-variant">
            <Link to="/privacy" className="hover:text-primary transition-colors">{t('footer.privacy') || 'سياسة الخصوصية'}</Link>
            <Link to="/terms" className="hover:text-primary transition-colors">{t('footer.terms') || 'الشروط والأحكام'}</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}