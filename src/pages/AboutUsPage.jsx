import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function AboutUsPage() {
  const { t, i18n } = useTranslation();
  const [aboutUs, setAboutUs] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/extras/about-us')
      .then(res => setAboutUs(res.data.aboutUs))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 pb-20 pt-12 px-4 sm:px-6 max-w-5xl mx-auto w-full">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
          </div>
        ) : aboutUs ? (
          <div className="space-y-12">
            <div className="text-center space-y-4">
              <h1 className="text-4xl md:text-5xl font-extrabold text-on-surface bg-clip-text text-transparent bg-gradient-to-r from-primary to-violet-500">
                {aboutUs[`title_${i18n.language}`] || aboutUs.title || 'About Us'}
              </h1>
              <div className="w-24 h-1.5 bg-primary mx-auto rounded-full"></div>
            </div>

            <div className="bg-surface rounded-3xl p-6 sm:p-10 shadow-sm border border-outline-variant/30">
              <div 
                className="prose prose-lg dark:prose-invert prose-p:text-on-surface prose-headings:text-on-surface max-w-none prose-a:text-primary prose-img:rounded-2xl"
                dangerouslySetInnerHTML={{ __html: aboutUs[`content_${i18n.language}`] || aboutUs.content || '' }}
              />
            </div>
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-xl text-on-surface-variant font-bold">Content coming soon.</p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
