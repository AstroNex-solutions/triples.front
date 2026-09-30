import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2, TrendingUp, CheckCircle2, Award, FileText, Target, Calendar } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import API from '../../api/axios';
import { toast } from 'react-hot-toast';

export default function PerformanceSection() {
  const { t } = useTranslation();
  const { stats } = useOutletContext();
  const [assessmentResults, setAssessmentResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        const res = await API.get('/student/assessment-results');
        setAssessmentResults(res.data.results || []);
      } catch (error) {
        toast.error(t('performanceSection.loadError', 'Failed to load performance data'));
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, []);

  const totalEnrollments = stats?.enrollmentsCount || 0;
  const completedCourses = stats?.completedCoursesCount || 0;
  const pendingAssessments = stats?.pendingAssessmentsCount || 0;
  const achievements = stats?.achievements || [];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto">
      {/* Banner */}
      <div className="bg-gradient-to-br from-indigo-600 to-violet-800 text-white rounded-3xl p-6 sm:p-8 shadow-lg shadow-indigo-600/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2">
              <TrendingUp size={28} />
              {t('performanceSection.title', 'My Performance')}
            </h2>
            <p className="text-xs sm:text-sm text-white/90 max-w-xl leading-relaxed">
              {t('performanceSection.description', 'Track your academic progress, assessment scores, and achievements.')}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-surface rounded-2xl p-5 border border-outline-variant/30 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <FileText size={24} />
          </div>
          <div>
            <p className="text-xs text-on-surface-variant font-bold uppercase tracking-wider">{t('performanceSection.totalEnrollments', 'Total Enrollments')}</p>
            <h3 className="text-2xl font-black text-on-surface">{totalEnrollments}</h3>
          </div>
        </div>
        <div className="bg-surface rounded-2xl p-5 border border-outline-variant/30 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-success/10 text-success flex items-center justify-center shrink-0">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <p className="text-xs text-on-surface-variant font-bold uppercase tracking-wider">{t('performanceSection.completedCourses', 'Completed Courses')}</p>
            <h3 className="text-2xl font-black text-on-surface">{completedCourses}</h3>
          </div>
        </div>
        <div className="bg-surface rounded-2xl p-5 border border-outline-variant/30 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
            <Target size={24} />
          </div>
          <div>
            <p className="text-xs text-on-surface-variant font-bold uppercase tracking-wider">{t('performanceSection.pendingAssessments', 'Pending Assessments')}</p>
            <h3 className="text-2xl font-black text-on-surface">{pendingAssessments}</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Assessment Results */}
        <div className="lg:col-span-2 bg-surface rounded-[2rem] border border-outline-variant/30 p-6 sm:p-8 shadow-sm">
          <h3 className="text-lg font-bold text-on-surface mb-6 flex items-center gap-2">
            <FileText size={20} className="text-primary" />
            {t('performanceSection.recentResults', 'Recent Assessment Results')}
          </h3>
          
          {loading ? (
            <div className="flex flex-col items-center justify-center py-10">
              <Loader2 size={30} className="animate-spin text-primary mb-2" />
              <p className="text-xs text-on-surface-variant">{t('performanceSection.loading', 'Loading results...')}</p>
            </div>
          ) : assessmentResults.length === 0 ? (
            <div className="text-center py-10 bg-surface-container-lowest rounded-2xl border border-dashed border-outline-variant/50">
              <FileText size={32} className="text-on-surface-variant/30 mx-auto mb-2" />
              <p className="text-sm text-on-surface-variant">{t('performanceSection.noResults', 'No assessments completed yet.')}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {assessmentResults.map((result) => (
                <div key={result.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border border-outline-variant/30 bg-surface-container-lowest hover:border-primary/30 transition-all gap-4">
                  <div>
                    <h4 className="font-bold text-sm text-on-surface">{result.title}</h4>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded uppercase">
                        {result.type === 'self_assessment' ? t('performanceSection.selfAssessment', 'Self Assessment') : result.type}
                      </span>
                      <span className="text-[10px] text-on-surface-variant flex items-center gap-1">
                        <Calendar size={12} />
                        {new Date(result.date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-[10px] text-on-surface-variant font-bold uppercase">{t('performanceSection.score', 'Score')}</p>
                      <p className="text-lg font-black text-on-surface">{result.score.toFixed(1)}%</p>
                    </div>
                    <div className={`w-2 h-10 rounded-full ${result.passed ? 'bg-success' : 'bg-error'}`} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Achievements */}
        <div className="bg-surface rounded-[2rem] border border-outline-variant/30 p-6 sm:p-8 shadow-sm">
          <h3 className="text-lg font-bold text-on-surface mb-6 flex items-center gap-2">
            <Award size={20} className="text-amber-500" />
            {t('performanceSection.achievements', 'Achievements')}
          </h3>

          {achievements.length === 0 ? (
            <div className="text-center py-10 bg-surface-container-lowest rounded-2xl border border-dashed border-outline-variant/50">
              <Award size={32} className="text-on-surface-variant/30 mx-auto mb-2" />
              <p className="text-sm text-on-surface-variant">{t('performanceSection.noAchievements', 'Complete courses and assessments to earn badges.')}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {achievements.map((badge, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-surface-container-lowest border border-outline-variant/30">
                  <div className="w-10 h-10 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                    <Award size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-on-surface">{badge.name}</h4>
                    <p className="text-[10px] text-on-surface-variant">{badge.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
