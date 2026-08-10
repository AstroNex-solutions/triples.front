import React, { useState, useEffect } from 'react';
import { BookOpen, Award, CheckCircle2, ShoppingBag, Loader2 } from 'lucide-react';
import API from '../../api/axios';
import { StatCard } from './SharedUI';

export default function OverviewSection() {
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
        <h2 className="text-2xl font-extrabold text-on-surface">مرحباً بعودتك! 👋</h2>
        <p className="text-sm text-on-surface-variant mt-1">تابع تقدمك واستكمل رحلتك التعليمية نحو النجاح.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="كورساتي المسجلة" value={stats.enrollmentsCount} icon={BookOpen} color="primary" />
        <StatCard label="الكورسات المكتملة" value={stats.completedCoursesCount} icon={Award} color="emerald" />
        <StatCard label="اختبارات متاحة" value={stats.pendingAssessmentsCount} icon={CheckCircle2} color="amber" />
        <StatCard label="المشتريات" value={stats.ordersCount} icon={ShoppingBag} color="cyan" />
      </div>
    </>
  );
}
