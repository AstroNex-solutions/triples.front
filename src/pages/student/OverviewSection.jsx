import React, { useState, useEffect } from 'react';
import { BookOpen, Award, CheckCircle2, ShoppingBag, Loader2, Play, Calendar as CalendarIcon, Clock, TrendingUp, Sparkles, BrainCircuit } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import API from '../../api/axios';
import { StatCard } from './SharedUI';
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip
} from 'recharts';

export default function OverviewSection() {
  const { t } = useTranslation();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    API.get('/student/stats').then(r => setStats(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="py-20 flex justify-center"><Loader2 size={32} className="animate-spin text-primary" /></div>;
  if (!stats) return null;

  const {  upcomingSchedule = [], achievements = [] } = stats;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-violet-600 p-8 shadow-lg shadow-primary/20">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-2xl translate-y-1/3 -translate-x-1/3"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-white text-center md:text-start">
            <h2 className="text-3xl font-extrabold mb-2 flex items-center justify-center md:justify-start gap-3">
              {t('studentDashboard.overview.greeting')} <Sparkles className="text-amber-300" size={28} />
            </h2>
            <p className="text-white/80 max-w-lg">{t('studentDashboard.overview.subtitle', 'Here is what is happening with your learning progress today.')}</p>
          </div>
          <button className="shrink-0 flex items-center gap-2 bg-white text-primary px-6 py-3 rounded-xl font-bold hover:bg-white/90 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1">
            <Play size={18} className="fill-primary" />
            Resume Learning
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label={t('studentDashboard.overview.enrolledCourses')} value={stats.enrollmentsCount} icon={BookOpen} color="primary" />
        <StatCard label={t('studentDashboard.courses.completed')} value={stats.completedCoursesCount} icon={Award} color="emerald" />
        <StatCard label={t('studentDashboard.assessments.pending')} value={stats.pendingAssessmentsCount} icon={CheckCircle2} color="amber" />
        <StatCard label={t('studentDashboard.orders.title')} value={stats.ordersCount} icon={ShoppingBag} color="violet" />
      </div>

      {/* Useful Widgets Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-surface border border-outline-variant/30 rounded-3xl p-6 shadow-sm">
          <h3 className="font-bold text-on-surface mb-4 flex items-center gap-2">
            <CalendarIcon size={18} className="text-primary" /> {t('studentDashboard.overview.studySchedule')}
          </h3>
          <div className="space-y-4">
            {upcomingSchedule.length > 0 ? (
              upcomingSchedule.map((schedule) => (
                <div key={schedule.id} className="flex gap-4 p-4 rounded-2xl bg-surface-container-low border border-outline-variant/20 hover:border-primary/30 transition-colors">
                  <div className="flex flex-col items-center justify-center bg-primary/10 text-primary w-14 h-14 rounded-xl font-bold shrink-0">
                    <span className="text-xs opacity-80 uppercase">{new Date(schedule.date).toLocaleString('default', { month: 'short' })}</span>
                    <span className="text-lg leading-none">{new Date(schedule.date).getDate()}</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-on-surface">{schedule.title}</h4>
                    <p className="text-xs text-on-surface-variant mt-1 flex items-center gap-1"><Clock size={12}/> {schedule.hours} {t('studentDashboard.overview.hours')} planned</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-sm text-on-surface-variant italic border border-dashed border-outline-variant/40 rounded-2xl">
                {t('studentDashboard.overview.noSchedules')}
              </div>
            )}
          </div>
        </div>

        <div className="bg-surface border border-outline-variant/30 rounded-3xl p-6 shadow-sm">
          <h3 className="font-bold text-on-surface mb-4 flex items-center gap-2">
            <Award size={18} className="text-amber-500" /> {t('studentDashboard.overview.earnedBadges')}
          </h3>
          <div className="space-y-4">
            {achievements.length > 0 ? (
              achievements.map((ach) => (
                <div key={ach.id} className={`flex items-center gap-4 p-4 rounded-2xl bg-${ach.color}-500/5 border border-${ach.color}-500/10`}>
                  <div className={`w-12 h-12 rounded-full bg-${ach.color}-500/10 text-${ach.color}-500 flex items-center justify-center shrink-0`}>
                    {ach.type === 'course' ? <CheckCircle2 size={24} /> : <TrendingUp size={24} />}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-on-surface">{ach.title}</h4>
                    <p className="text-xs text-on-surface-variant mt-0.5">{ach.subtitle}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-sm text-on-surface-variant italic border border-dashed border-outline-variant/40 rounded-2xl">
                {t('studentDashboard.overview.noActivity')}
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
