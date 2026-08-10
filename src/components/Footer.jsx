import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Mail, 
  Headphones, 
  BookOpen, 
  GraduationCap, 
  Layers, 
  Globe2,
  Share2,
  Youtube,
  QrCode
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function Footer() {
  const { t } = useTranslation();
  const [logoError, setLogoError] = useState(false);

  return (
    <footer className="w-full bg-primary text-on-primary py-12 relative overflow-hidden">
      
      {/* Visual Ambient Glow Background */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-80 h-80 bg-secondary-container/10 rounded-full blur-2xl pointer-events-none" />

      <div className="max-w-container-max mx-auto px-4 sm:px-6 lg:px-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
        
        {/* 1. Brand & Description Section */}
        <div className="flex flex-col justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-4">
                <img 
                  alt="Triple S Academy Logo" 
                  className="h-24 object-contain text-center" 
                  src="/logo.png"
                  onError={() => setLogoError(true)}
                />
            </div>
            <p className="text-sm font-label-md leading-relaxed text-on-primary/90">
              {t('footer.description')}
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs opacity-75">
            <Globe2 size={16} />
            <span>{t('footer.certified')}</span>
          </div>
        </div>

        {/* 2. Quick Links */}
        <div className="flex flex-col gap-3">
          <h4 className="text-base font-bold text-on-primary border-b border-on-primary/15 pb-2">
            {t('footer.quickLinks')}
          </h4>
          <nav className="flex flex-col gap-2.5 text-sm">
            <Link to="/" className="opacity-80 hover:opacity-100 hover:text-secondary-fixed transition-all duration-200 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary-fixed/60" />
              {t('navbar.home')}
            </Link>
            <Link to="/courses" className="opacity-80 hover:opacity-100 hover:text-secondary-fixed transition-all duration-200 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary-fixed/60" />
              {t('footer.allCourses')}
            </Link>
            <Link to="/articles" className="opacity-80 hover:opacity-100 hover:text-secondary-fixed transition-all duration-200 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary-fixed/60" />
              {t('footer.blogAndNews')}
            </Link>
          </nav>
        </div>

        {/* 4. Contact & Social Channels */}
        <div className="flex flex-col gap-3">
          <h4 className="text-base font-bold text-on-primary border-b border-on-primary/15 pb-2">
            {t('footer.contactAndSupport')}
          </h4>
          <div className="flex flex-col gap-3 text-sm">
            <a 
              href="mailto:info@triplesacademy.com" 
              className="flex items-center gap-2.5 opacity-85 hover:opacity-100 hover:text-secondary-fixed transition-colors"
            >
              <Mail size={18} />
              <span className="dir-ltr text-right">info@triplesacademy.com</span>
            </a>
            <div className="flex items-center gap-2.5 opacity-85">
              <Headphones size={18} />
              <span>{t('footer.helpCenter')}</span>
            </div>
          </div>

          <div className="pt-2">
            <span className="text-xs opacity-70 block mb-2">{t('footer.quickChannels')}</span>
            <div className="flex gap-2">
              <button 
                type="button"
                title={t('footer.scanQr')}
                aria-label={t('footer.scanQr')}
                className="p-2 bg-white/10 hover:bg-white/20 hover:text-secondary-fixed rounded-xl transition-all duration-200"
              >
                <QrCode size={18} />
              </button>
              <a 
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                title={t('footer.youtubeChannel')}
                aria-label={t('footer.youtubeChannel')}
                className="p-2 bg-white/10 hover:bg-white/20 hover:text-secondary-fixed rounded-xl transition-all duration-200 flex items-center justify-center"
              >
                <Youtube size={18} />
              </a>
              <button 
                type="button"
                title={t('footer.sharePlatform')}
                aria-label={t('footer.sharePlatform')}
                className="p-2 bg-white/10 hover:bg-white/20 hover:text-secondary-fixed rounded-xl transition-all duration-200"
              >
                <Share2 size={18} />
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Footer Bottom Bar */}
    <div className="max-w-container-max mx-auto px-4 sm:px-6 lg:px-12 mt-10 pt-6 border-t border-on-primary/15 flex flex-col sm:flex-row items-center justify-between text-xs opacity-75 gap-3">
  <p className="flex items-center gap-1 flex-wrap">
    <a 
      href="https://astronexsolutions.com/en/" 
      target="_blank" 
      rel="noopener noreferrer" 
      className="font-bold hover:underline hover:opacity-100 transition-opacity"
    >
      AstroNex Solutions
    </a>
    <span>© {new Date().getFullYear()} {t('footer.poweredBy')}</span>
  </p>
  <div className="font-bold flex items-center gap-4">
    <Link to="/privacy" className="hover:underline hover:opacity-100">{t('footer.privacy')}</Link>
    <span>•</span>
    <Link to="/terms" className="hover:underline hover:opacity-100">{t('footer.terms')}</Link>
  </div>
</div>
    </footer>
  );
}