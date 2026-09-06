import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import API from '../../api/axios';
import { SectionHeader, Card } from './SharedUI';

export default function SelfAssessmentsSection() {
  const { t, i18n } = useTranslation();
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/student/self-assessments')
      .then((res) => {
        setAssessments(res.data.selfAssessments || []);
      })
      .catch((err) => {
        console.error(err);
        setAssessments([]);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <SectionHeader title={t('studentDashboard.selfAssessments.title')} count={assessments.length} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        {loading ? <Loader2 size={24} className="animate-spin text-primary m-4" /> : (
          assessments.length === 0 ? <p className="text-xs text-on-surface-variant">{t('studentDashboard.selfAssessments.noAssessments')}</p> :
          assessments.map(a => {
            const title = a[`title_${i18n.language}`] || a.title;
            return (
              <Card key={a.id} className="border-l-4 border-l-emerald-500">
                <h4 className="text-sm font-bold text-on-surface">{title}</h4>
                <p className="text-xs text-on-surface-variant mt-1">{a.duration_minutes} {t('studentDashboard.shared.minutes', 'minutes')} • {a.price == 0 ? t('courseCard.free', 'Free') : `$${a.price}`}</p>
                <Link to={`/self-assessment/${a.id}`} className="mt-3 inline-block px-4 py-1.5 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 rounded-lg text-xs font-bold transition-all">
                  {t('studentDashboard.assessments.start')}
                </Link>
              </Card>
            );
          })
        )}
      </div>
    </>
  );
}
