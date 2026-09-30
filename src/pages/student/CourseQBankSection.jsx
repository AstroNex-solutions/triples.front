import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { HelpCircle, Loader2, Play, Search, BookOpen, CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card } from './SharedUI';
import API from '../../api/axios';

export default function CourseQBankSection() {
  const { courseId } = useParams();
  const { t } = useTranslation();
  const { stats } = useOutletContext();
  const navigate = useNavigate();

  const [modulesWithQBank, setModulesWithQBank] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const activeCourse = stats?.activeCourses?.find(c => String(c.id) === String(courseId));
  const modules = activeCourse?.modules || [];

  useEffect(() => {
    if (!modules.length) {
      setLoading(false);
      return;
    }

    setLoading(true);
    Promise.all(
      modules.map(m =>
        API.get(`/student/modules/${m.id}/questions?type=qbank`)
          .then(res => ({ module: m, questions: res.data.questions || [] }))
          .catch(() => ({ module: m, questions: [] }))
      )
    )
      .then(results => {
        const filtered = results.filter(r => r.questions.length > 0);
        setModulesWithQBank(filtered);
      })
      .finally(() => setLoading(false));
  }, [courseId, modules.length]);

  const filteredModules = useMemo(() => {
    if (!search) return modulesWithQBank;
    return modulesWithQBank.filter(mq =>
      (mq.module.name || '').toLowerCase().includes(search.toLowerCase())
    );
  }, [modulesWithQBank, search]);

  return (
    <div className="space-y-6">
      {/* Grid */}
      {loading ? (
        <div className="py-16 flex flex-col items-center justify-center bg-surface rounded-3xl border border-outline-variant/30 shadow-sm">
          <Loader2 size={36} className="animate-spin text-secondary mb-3" />
        </div>
      ) : modulesWithQBank.length === 0 ? (
        <Card className="text-center py-16 px-6">
          <div className="w-20 h-20 bg-secondary/10 border border-secondary/20 rounded-3xl flex items-center justify-center mx-auto mb-4 text-secondary">
            <HelpCircle size={36} />
          </div>
          <h3 className="text-xl font-black text-on-surface mb-2">{t('courseQBank.noQbankYet', 'لا توجد أسئلة متاحة بعد')}</h3>
          <p className="text-sm text-on-surface-variant max-w-md mx-auto leading-relaxed">
            {t('courseQBank.noQbankDesc', 'سيتم عرض بنك الأسئلة الخاص بهذه الدورة هنا بمجرد توفره.')}
          </p>
        </Card>
      ) : filteredModules.length === 0 ? (
        <div className="py-12 text-center bg-surface rounded-3xl border border-outline-variant/30 shadow-sm">
          <p className="text-xs font-bold text-on-surface-variant">{t('courseQBank.noMatch', 'لا توجد أقسام تطابق بحثك.')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredModules.map(mq => (
            <div
              key={mq.module.id}
              className="group bg-surface rounded-3xl border border-outline-variant/30 hover:border-secondary/40 p-6 flex flex-col justify-between transition-all duration-300 hover:shadow-lg relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-secondary to-secondary-hover" />

              <div>
                <div className="flex items-center justify-between gap-2 mb-4">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border truncate bg-secondary/10 text-secondary border-secondary/20">
                    {t('courseQBank.qbankModule', 'بنك الأسئلة')}
                  </span>
                  <span className="flex items-center gap-1 text-[10px] font-mono font-bold text-secondary bg-secondary/10 px-2 py-0.5 rounded border border-secondary/20">
                    <CheckCircle2 size={11} /> {mq.questions.length} {t('courseQBank.questions', 'أسئلة')}
                  </span>
                </div>

                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-2xl border flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform bg-secondary/10 text-secondary border-secondary/20">
                    <BookOpen size={22} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-black text-on-surface text-base leading-snug group-hover:text-secondary transition-colors line-clamp-2">
                      {mq.module.name}
                    </h3>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-outline-variant/20">
                <button
                  onClick={() => navigate(`/quiz-player/${mq.module.id}?type=qbank`)}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-secondary hover:bg-secondary-hover text-white rounded-xl font-black text-xs shadow-md transition-all cursor-pointer group-hover:scale-[1.01]"
                >
                  <Play size={15} className="fill-current" />
                  <span>{t('courseQBank.startTraining', 'بدء التدريب')}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
