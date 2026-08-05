import React, { useState, useEffect } from 'react';
import { Lock, HelpCircle, Mail, Loader2 } from 'lucide-react';
import API from '../api/axios';

export default function PrivacyPage() {
  const [privacy, setPrivacy] = useState(null);
  const [contactEmail, setContactEmail] = useState('privacy@example.com');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resPrivacy, resContact] = await Promise.all([
          API.get('/extras/privacy'),
          API.get('/extras/contact-info')
        ]);
        if (resPrivacy.data.privacy) setPrivacy(resPrivacy.data.privacy);
        if (resContact.data.info?.email) setContactEmail(resContact.data.info.email);
      } catch (err) {
        console.error('Error fetching privacy:', err);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="w-10 h-10 animate-spin text-secondary" /></div>;
  }

  if (!privacy) {
    return <div className="min-h-screen flex items-center justify-center bg-background"><p className="text-on-surface">سياسة الخصوصية غير متوفرة حالياً.</p></div>;
  }

  return (
    <div className="min-h-screen bg-background text-on-background font-arabic py-xl px-sm sm:px-md dir-rtl">
      <div className="max-w-container-max mx-auto space-y-lg">
        {/* Hero Section */}
        <header className="bg-surface border border-outline-variant rounded-2xl p-lg sm:p-xl shadow-soft text-center space-y-xs relative overflow-hidden">
          <div className="absolute top-0 left-0 w-32 h-32 bg-secondary-container/50 rounded-full blur-3xl -z-10" />
          <div className="inline-flex items-center justify-center p-sm bg-secondary-container text-on-secondary-container rounded-xl mb-xs">
            <Lock className="w-8 h-8 text-secondary" />
          </div>
          <h1 className="text-headline-lg sm:text-display-lg text-on-surface">
            {privacy.title_ar || privacy.title || 'سياسة الخصوصية'}
          </h1>
          <div className="inline-block mt-xs px-sm py-xs bg-surface-container rounded-full text-label-md text-on-surface-variant border border-outline-variant">
            آخر تحديث: {new Date(privacy.updatedAt || Date.now()).toLocaleDateString('ar-EG')}
          </div>
        </header>

        {/* Content Section */}
        <main className="grid grid-cols-1 lg:grid-cols-3 gap-md items-start">
          {/* Main Privacy Content */}
          <div className="lg:col-span-2">
            <section className="bg-surface border border-outline-variant rounded-xl p-md sm:p-lg shadow-soft">
              <div 
                className="prose prose-sm sm:prose-base dark:prose-invert max-w-none prose-headings:text-on-surface prose-p:text-on-surface-variant leading-loose"
                dangerouslySetInnerHTML={{ __html: privacy.content_ar || privacy.content || '' }}
              />
            </section>
          </div>

          {/* Sidebar Info Card */}
          <aside className="lg:col-span-1 lg:sticky lg:top-8 space-y-md">
            <div className="bg-surface-container-low border border-outline-variant rounded-xl p-md shadow-soft space-y-sm">
              <div className="flex items-center gap-xs text-primary">
                <HelpCircle className="w-5 h-5" />
                <h3 className="text-headline-md text-on-surface">مسؤول الخصوصية</h3>
              </div>
              <p className="text-body-md text-on-surface-variant">
                إذا كان لديك أي سؤال بخصوص سياسة الخصوصية هذه أو طريقة تعاملنا مع بياناتك الشخصية، يسعدنا تواصلك معنا مباشرة.
              </p>
              <a
                href={`mailto:${contactEmail}`}
                className="inline-flex items-center justify-center gap-xs w-full py-xs px-sm bg-secondary hover:bg-secondary-fixed text-on-secondary hover:text-on-secondary-fixed rounded-lg font-semibold text-label-md transition-all shadow-glow-secondary hover:shadow-none"
              >
                <Mail className="w-4 h-4" />
                راسل مسؤول الخصوصية
              </a>
            </div>
          </aside>
        </main>
      </div>
    </div>
  );
}