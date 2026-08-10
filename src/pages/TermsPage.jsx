import React, { useState, useEffect } from 'react';
import { ShieldCheck, Mail, Loader2 } from 'lucide-react';
import API from '../api/axios';
import { useTranslation } from 'react-i18next';

export default function TermsPage() {
  const { t, i18n } = useTranslation();
  const [terms, setTerms] = useState(null);
  const [contactEmail, setContactEmail] = useState('legal@example.com');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resTerms, resContact] = await Promise.all([
          API.get('/extras/terms'),
          API.get('/extras/contact-info')
        ]);
        if (resTerms.data.terms) setTerms(resTerms.data.terms);
        if (resContact.data.info?.email) setContactEmail(resContact.data.info.email);
      } catch (err) {
        console.error('Error fetching terms:', err);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>;
  }

  if (!terms) {
    return <div className="min-h-screen flex items-center justify-center bg-background"><p className="text-on-surface">{t('staticPages.terms.unavailable')}</p></div>;
  }

  return (
    <div className="min-h-screen bg-background text-on-background font-arabic py-xl px-sm sm:px-md">
      <div className="max-w-container-max mx-auto space-y-lg">
        {/* Hero Section */}
        <header className="bg-surface border border-outline-variant rounded-2xl p-lg sm:p-xl shadow-soft text-center space-y-xs relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary-container/40 rounded-full blur-3xl -z-10" />
          <div className="inline-flex items-center justify-center p-sm bg-primary-container text-on-primary-container rounded-xl mb-xs">
            <ShieldCheck className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-headline-lg sm:text-display-lg text-on-surface">
            {terms[`title_${i18n.language}`] || terms.title_ar || terms.title || t('staticPages.terms.title')}
          </h1>
          <div className="inline-block mt-xs px-sm py-xs bg-surface-container rounded-full text-label-md text-on-surface-variant border border-outline-variant">
            {t('staticPages.terms.lastUpdated')} {new Date(terms.updatedAt || Date.now()).toLocaleDateString(i18n.language === 'en' ? 'en-US' : 'ar-EG')}
          </div>
        </header>

        {/* Content Section */}
        <main className="grid grid-cols-1 lg:grid-cols-3 gap-md items-start">
          {/* Main Terms Content */}
          <div className="lg:col-span-2">
            <section className="bg-surface border border-outline-variant rounded-xl p-md sm:p-lg shadow-soft">
              <div 
                className="prose prose-sm sm:prose-base dark:prose-invert max-w-none prose-headings:text-on-surface prose-p:text-on-surface-variant leading-loose"
                dangerouslySetInnerHTML={{ __html: terms[`content_${i18n.language}`] || terms.content_ar || terms.content || '' }}
              />
            </section>
          </div>

          {/* Sticky Sidebar Notice */}
          <aside className="lg:col-span-1 lg:sticky lg:top-8 space-y-md">
            <div className="bg-surface-container-low border border-outline-variant rounded-xl p-md shadow-soft space-y-sm">
              <h3 className="text-headline-md text-on-surface">{t('staticPages.terms.supportTitle')}</h3>
              <p className="text-body-md text-on-surface-variant">
                {t('staticPages.terms.supportDesc')}
              </p>
              <a
                href={`mailto:${contactEmail}`}
                className="inline-flex items-center justify-center gap-xs w-full py-xs px-sm bg-primary hover:bg-primary-hover text-on-primary rounded-lg font-semibold text-label-md transition-all shadow-glow hover:shadow-none"
              >
                <Mail className="w-4 h-4" />
                {t('staticPages.terms.contactSupport')}
              </a>
            </div>
          </aside>
        </main>
      </div>
    </div>
  );
}