import React from 'react';
import { 
  GraduationCap, 
  Target, 
  Eye, 
  Award, 
  Users, 
  BookOpen, 
  ShieldCheck, 
  HeartPulse,
  Sparkles 
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function AboutPage() {
  const { t } = useTranslation();
  const stats = [
    { id: 1, label: t('staticPages.about.statStudents'), value: '+10,000', icon: Users },
    { id: 2, label: t('staticPages.about.statCourses'), value: '+150', icon: BookOpen },
    { id: 3, label: t('staticPages.about.statInstructors'), value: '+45', icon: GraduationCap },
    { id: 4, label: t('staticPages.about.statSatisfaction'), value: '98%', icon: Award },
  ];

  const values = [
    {
      icon: ShieldCheck,
      title: t('staticPages.about.valQualityTitle'),
      description: t('staticPages.about.valQualityDesc')
    },
    {
      icon: HeartPulse,
      title: t('staticPages.about.valDevTitle'),
      description: t('staticPages.about.valDevDesc')
    },
    {
      icon: Users,
      title: t('staticPages.about.valCommunityTitle'),
      description: t('staticPages.about.valCommunityDesc')
    }
  ];

  return (
    <div className="min-h-screen pb-20 pt-6 px-4 sm:px-6 lg:px-12 max-w-container-max mx-auto space-y-12">
      
      {/* 1. Hero Header */}
      <div className="relative rounded-3xl bg-surface-container-low/70 border border-outline-variant/40 p-8 sm:p-14 backdrop-blur-xl overflow-hidden shadow-sm text-center sm:text-right">
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold border border-primary/20">
            <Sparkles size={15} />
            <span>{t('staticPages.about.badge')}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-on-surface tracking-tight leading-tight">
            {t('staticPages.about.title')}
          </h1>
          <p className="text-on-surface-variant text-base sm:text-lg leading-relaxed">
            {t('staticPages.about.subtitle')}
          </p>
        </div>
      </div>

      {/* 2. Stats Section */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((item) => {
          const Icon = item.icon;
          return (
            <div 
              key={item.id} 
              className="rounded-3xl bg-surface-container-low/50 border border-outline-variant/30 p-6 text-center backdrop-blur-md hover:bg-surface-container-low transition-all"
            >
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary mx-auto flex items-center justify-center mb-3">
                <Icon size={24} />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-on-surface tracking-tight mb-1">
                {item.value}
              </div>
              <div className="text-xs sm:text-sm text-on-surface-variant/80 font-medium">
                {item.label}
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Vision & Mission Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Vision */}
        <div className="rounded-3xl bg-surface-container-low/60 border border-outline-variant/40 p-8 backdrop-blur-md space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-secondary-container/80 text-on-secondary-container flex items-center justify-center">
            <Eye size={24} />
          </div>
          <h2 className="text-xl font-extrabold text-on-surface">{t('staticPages.about.visionTitle')}</h2>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            {t('staticPages.about.visionDesc')}
          </p>
        </div>

        {/* Mission */}
        <div className="rounded-3xl bg-surface-container-low/60 border border-outline-variant/40 p-8 backdrop-blur-md space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
            <Target size={24} />
          </div>
          <h2 className="text-xl font-extrabold text-on-surface">{t('staticPages.about.missionTitle')}</h2>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            {t('staticPages.about.missionDesc')}
          </p>
        </div>
      </div>

      {/* 4. Core Values */}
      <div className="space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-2xl font-extrabold text-on-surface">{t('staticPages.about.valuesTitle')}</h2>
          <p className="text-sm text-on-surface-variant">{t('staticPages.about.valuesDesc')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {values.map((val, idx) => {
            const Icon = val.icon;
            return (
              <div 
                key={idx} 
                className="rounded-3xl bg-surface-container-low/40 border border-outline-variant/30 p-6 backdrop-blur-sm space-y-3"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <Icon size={20} />
                </div>
                <h3 className="text-base font-bold text-on-surface">{val.title}</h3>
                <p className="text-xs sm:text-sm text-on-surface-variant/80 leading-relaxed">
                  {val.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}