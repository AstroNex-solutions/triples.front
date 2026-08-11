import React, { useState, useEffect } from 'react';
import { BookOpen, Award, CheckCircle2, ShoppingBag, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import API from '../../api/axios';
import { StatCard } from './SharedUI';

export default function OverviewSection() {
  const { t } = useTranslation();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    API.get('/student/stats').then(r => setStats(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="py-20 flex justify-center"><Loader2 size={32} className="animate-spin text-primary" /></div>;
  if (!stats) return null;

  return (
    <>
      <div className="mb-6">
        <h2 className="text-2xl font-extrabold text-on-surface">{t('student.overview.welcome')}</h2>
        <p className="text-sm text-on-surface-variant mt-1">{t('student.overview.subtitle')}</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label={t('student.overview.enrolledCourses')} value={stats.enrollmentsCount} icon={BookOpen} color="primary" />
        <StatCard label={t('student.overview.completedCourses')} value={stats.completedCoursesCount} icon={Award} color="emerald" />
        <StatCard label={t('student.overview.pendingAssessments')} value={stats.pendingAssessmentsCount} icon={CheckCircle2} color="amber" />
        <StatCard label={t('student.overview.ordersCount')} value={stats.ordersCount} icon={ShoppingBag} color="cyan" />
      </div>
    </>
  );
}
