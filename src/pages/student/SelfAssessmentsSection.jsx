import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  CheckCircle2, BookmarkPlus, Sparkles, HelpCircle, Play
} from 'lucide-react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { Card } from './SharedUI';

export default function SelfAssessmentsSection() {
  const { t } = useTranslation();
  const { stats } = useOutletContext();
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const unpurchasedSelfAssessmentCourses = useMemo(() => {
    if (!stats || !stats.activeCourses) return [];
    // Only show courses that DO NOT have selfAssessment active yet
    return stats.activeCourses.filter(c => !c.features || c.features.selfAssessment !== true);
  }, [stats]);

  const filteredCourses = useMemo(() => {
    return unpurchasedSelfAssessmentCourses.filter(c => {
      const match = (c.title || '').toLowerCase().includes(search.toLowerCase());
      return match;
    });
  }, [unpurchasedSelfAssessmentCourses, search]);

  const handleBuyFeature = async (courseId) => {
    navigate(`/checkout/feature/${courseId}/selfAssessment`);
  };

  return (
    <div className="space-y-6">
      
      {/* Courses Grid */}
      {!stats ? (
        <div className="py-16 flex flex-col items-center justify-center bg-surface rounded-3xl border border-outline-variant/30 shadow-sm">
          <span className="text-xs font-bold text-on-surface-variant">{t('selfAssessmentsStudentSection.loading', 'جاري التحميل...')}</span>
        </div>
      ) : unpurchasedSelfAssessmentCourses.length === 0 ? (
        <Card className="text-center py-16 px-6">
          <div className="w-20 h-20 bg-error/10 border border-error/20 rounded-3xl flex items-center justify-center mx-auto mb-4 text-error">
            <CheckCircle2 size={36} />
          </div>
          <h3 className="text-xl font-black text-on-surface mb-2" dir="auto">{t('selfAssessmentsStudentSection.emptyTitle', 'لا توجد دورات تحتوي على تقييم ذاتي')}</h3>
          <p className="text-xs sm:text-sm text-on-surface-variant max-w-md mx-auto mb-6 leading-relaxed" dir="auto">
            {t('selfAssessmentsStudentSection.emptyDesc', 'أنت غير مسجل في أي دورات توفر التقييم الذاتي حالياً.')}
          </p>
          <button 
            onClick={() => navigate('/courses')}
            className="px-6 py-3 bg-error hover:bg-error-hover text-white font-black text-xs rounded-xl shadow-md transition-all cursor-pointer inline-flex items-center gap-2 hover:-translate-y-1"
          >
            <Sparkles size={16} />
            <span>{t('selfAssessmentsStudentSection.browseCourses', 'تصفح الدورات')}</span>
          </button>
        </Card>
      ) : filteredCourses.length === 0 ? (
        <div className="py-12 text-center bg-surface rounded-3xl border border-outline-variant/30 shadow-sm">
          <p className="text-xs font-bold text-on-surface-variant" dir="auto">{t('selfAssessmentsStudentSection.noCoursesMatch', 'لا توجد دورات تطابق بحثك.')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map(c => {
            const hasSelfAssessment = c.features && c.features.selfAssessment === true;

            return (
              <div 
                key={c.id} 
                className="group bg-surface rounded-3xl border border-outline-variant/30 hover:border-error/40 p-6 flex flex-col justify-between transition-all duration-300 hover:shadow-lg relative overflow-hidden hover:shadow-error/10"
              >
                {/* Top Colored Border */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-error to-error-hover" />

                <div>
                  {/* Category Pill */}
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border truncate bg-error/10 text-error border-error/20">
                      {t('selfAssessmentsStudentSection.coursePack', 'حزمة الدورة')}
                    </span>
                    <span className={`flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${hasSelfAssessment ? 'text-error bg-error/10 border-error/20' : 'text-amber-600 bg-amber-500/10 border-amber-500/20'}`}>
                      <CheckCircle2 size={11} /> {hasSelfAssessment ? t('selfAssessmentsStudentSection.active', 'نشط') : t('selfAssessmentsStudentSection.locked', 'مغلق')}
                    </span>
                  </div>

                  {/* Icon & Title */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 rounded-2xl border flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform bg-error/10 text-error border-error/20">
                      <CheckCircle2 size={22} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-black text-on-surface text-base leading-snug group-hover:text-error transition-colors line-clamp-2">
                        {c.title}
                      </h3>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-on-surface-variant line-clamp-3 mb-6 leading-relaxed" dir="auto">
                    {hasSelfAssessment 
                      ? t('selfAssessmentsStudentSection.accessDesc', "قيم فهمك من خلال نماذج التقييم الذاتي الشاملة.")
                      : t('selfAssessmentsStudentSection.purchaseDesc', "قم بشراء التقييم الذاتي لهذه الدورة لتقييم تقدمك.")
                    }
                  </p>
                </div>

                {/* Launch Button */}
                <div className="pt-4 border-t border-outline-variant/20">
                  {hasSelfAssessment ? (
                    <button 
                      onClick={() => navigate(`/dashboard/course/${c.id}/selfAssessment`)}
                      className="w-full flex items-center justify-center gap-2 py-3 bg-error hover:bg-error-hover text-white rounded-xl font-black text-xs shadow-md transition-all cursor-pointer group-hover:scale-[1.01]"
                    >
                      <Play size={15} className="fill-current" />
                      <span>{t('selfAssessmentsStudentSection.startAssessment', 'ابدأ التقييم')}</span>
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleBuyFeature(c.id)}
                      className="w-full flex items-center justify-center gap-2 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-black text-xs shadow-md transition-all cursor-pointer group-hover:scale-[1.01]"
                      dir="auto"
                    >
                      <BookmarkPlus size={15} className="fill-current" />
                      <span>
                        {t('selfAssessmentsStudentSection.buyAssessment', 'شراء التقييم الذاتي')} - ${c.self_assessment_price || 0}
                      </span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
