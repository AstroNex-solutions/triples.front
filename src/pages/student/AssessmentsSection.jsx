import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import API from '../../api/axios';
import { SectionHeader, Card, Badge } from './SharedUI';

export default function AssessmentsSection() {
  const { t, i18n } = useTranslation();
  const [assessments, setAssessments] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([API.get('/student/assessments'), API.get('/student/assessment-results')])
      .then(([a, r]) => { setAssessments(a.data.assessments || []); setResults(r.data.attempts || []); })
      .catch(console.error).finally(() => setLoading(false));
  }, []);

  return (
    <>
      <SectionHeader title={t('student.assessments.availableTitle')} count={assessments.length} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        {loading ? <Loader2 size={24} className="animate-spin text-primary m-4" /> : (
          assessments.length === 0 ? <p className="text-xs text-on-surface-variant">{t('student.assessments.emptyAvailable')}</p> :
          assessments.map(a => {
            const isExam = a.type === 'exam';
            const isAssignment = a.type === 'assignment';
            const isFlashcard = a.type === 'flashcard';
            
            let colorTheme = 'amber-500';
            let bgTheme = 'bg-amber-500/10 text-amber-600 hover:bg-amber-500/20';
            let typeLabel = t('student.assessments.quiz');
            if (isExam) { colorTheme = 'rose-500'; bgTheme = 'bg-rose-500/10 text-rose-600 hover:bg-rose-500/20'; typeLabel = t('student.assessments.exam'); }
            if (isAssignment) { colorTheme = 'blue-500'; bgTheme = 'bg-blue-500/10 text-blue-600 hover:bg-blue-500/20'; typeLabel = t('student.assessments.assignment'); }
            if (isFlashcard) { colorTheme = 'emerald-500'; bgTheme = 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20'; typeLabel = t('student.assessments.flashcard'); }

            const aTitle = a[`title_${i18n.language}`] || a.title;
            const courseTitle = a.Course?.[`title_${i18n.language}`] || a.Course?.title;

            return (
              <Card key={a.id} className="border-r-4" style={{ borderRightColor: `var(--${colorTheme}, ${colorTheme})`, borderRightWidth: '4px' }}>
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-sm font-bold text-on-surface">{aTitle}</h4>
                  <Badge text={typeLabel} variant="outline" />
                </div>
                <p className="text-xs text-on-surface-variant mb-4">{courseTitle} • {a.duration_minutes ? `${a.duration_minutes} ${t('student.assessments.minutes')}` : t('student.assessments.noTime')}</p>
                <Link to={`/assessment/${a.id}`} className={`inline-block px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${bgTheme}`}>
                  {isFlashcard ? t('student.assessments.browseFlashcards') : isAssignment ? t('student.assessments.startAssignment') : t('student.assessments.startQuiz')}
                </Link>
              </Card>
            );
          })
        )}
      </div>

      <SectionHeader title={t('student.assessments.previousResults')} count={results.length} />
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs sm:text-sm border-separate border-spacing-y-1">
            <thead>
              <tr className="text-on-surface-variant/70">
                <th className="p-3 text-start">{t('student.assessments.table.assessment')}</th>
                <th className="p-3 text-start">{t('student.assessments.table.date')}</th>
                <th className="p-3 text-start">{t('student.assessments.table.score')}</th>
                <th className="p-3 text-start">{t('student.assessments.table.status')}</th>
              </tr>
            </thead>
            <tbody>
              {results.map(r => {
                const rTitle = r[`title_${i18n.language}`] || r.title;
                return (
                  <tr key={r.id} className="bg-surface/50 hover:bg-surface/80 transition-all border-b border-outline-variant/30">
                    <td className="p-3">
                      <span className="font-bold text-on-surface block mb-1">{rTitle}</span>
                      <span className="text-xs text-on-surface-variant bg-surface-variant/40 px-2 py-0.5 rounded-full inline-block">
                        {r.type === 'self_assessment' ? t('student.dashboard.items.self_assessments') : r.type === 'exam' ? t('student.assessments.exam') : r.type === 'assignment' ? t('student.assessments.assignment') : r.type === 'flashcard' ? t('student.assessments.flashcard') : t('student.assessments.quiz')}
                      </span>
                    </td>
                    <td className="p-3 text-on-surface-variant" dir="ltr">{new Date(r.createdAt).toLocaleString(i18n.language === 'en' ? 'en-US' : 'ar-EG', { dateStyle: 'short', timeStyle: 'short' })}</td>
                    <td className="p-3 font-bold text-on-surface" dir="ltr">
                      {r.type === 'assignment' ? (
                        <span className="text-amber-500 text-xs">{t('student.assessments.table.underReview')}</span>
                      ) : r.type === 'flashcard' ? (
                        <span className="text-on-surface-variant text-xs">{t('student.assessments.table.reviewOnly')}</span>
                      ) : (
                        `${r.score} / ${r.totalMarks}`
                      )}
                    </td>
                    <td className="p-3">
                      {r.type === 'assignment' || r.type === 'flashcard' ? (
                        <span className="text-on-surface-variant text-xs">-</span>
                      ) : (
                        <Badge text={`${r.percentage}% ${r.passed ? t('student.assessments.table.passed') : t('student.assessments.table.failed')}`} variant={r.passed ? 'success' : 'danger'} />
                      )}
                    </td>
                  </tr>
                );
              })}
              {results.length === 0 && <tr><td colSpan={4} className="p-6 text-center text-on-surface-variant text-sm font-semibold">{t('student.assessments.table.empty')}</td></tr>}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
