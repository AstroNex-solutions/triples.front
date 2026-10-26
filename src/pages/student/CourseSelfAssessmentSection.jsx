import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { CheckCircle2, Loader2, Play, BookOpen, AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card } from './SharedUI';
import API from '../../api/axios';

export default function CourseSelfAssessmentSection() {
  const { courseId } = useParams();
  const { t } = useTranslation();
  const { stats } = useOutletContext();
  const navigate = useNavigate();

  const [modulesWithSA, setModulesWithSA] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

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
        API.get(`/student/modules/${m.id}/questions?type=sa`)
          .then(res => ({ module: m, questions: res.data.questions || [] }))
          .catch(() => ({ module: m, questions: [] }))
      )
    )
      .then(results => {
        const filtered = results.filter(r => r.questions.length > 0);
        setModulesWithSA(filtered);
      })
      .finally(() => setLoading(false));
  }, [courseId, modules.length]);

  const totalQuestions = modulesWithSA.reduce((acc, curr) => acc + curr.questions.length, 0);

  return (
    <div className="space-y-6">
      {/* Container */}
      {loading ? (
        <div className="py-16 flex flex-col items-center justify-center bg-surface rounded-3xl border border-outline-variant/30 shadow-sm">
          <Loader2 size={36} className="animate-spin text-error mb-3" />
        </div>
      ) : modulesWithSA.length === 0 ? (
        <Card className="text-center py-16 px-6">
          <div className="w-20 h-20 bg-error/10 border border-error/20 rounded-3xl flex items-center justify-center mx-auto mb-4 text-error">
            <CheckCircle2 size={36} />
          </div>
          <h3 className="text-xl font-black text-on-surface mb-2">{t('courseSA.noSaYet', 'لا توجد تقييمات متاحة بعد')}</h3>
          <p className="text-sm text-on-surface-variant max-w-md mx-auto leading-relaxed">
            {t('courseSA.noSaDesc', 'ستظهر التقييمات الذاتية الخاصة بهذه الدورة هنا بمجرد توفرها.')}
          </p>
        </Card>
      ) : (
        <div className="max-w-2xl mx-auto">
          <div
            className="group bg-surface rounded-3xl border border-outline-variant/30 hover:border-error/40 p-8 flex flex-col justify-between transition-all duration-300 hover:shadow-xl relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-error to-error-hover" />

            <div>
              <div className="flex items-center justify-between gap-2 mb-6">
                <span className="text-xs font-black uppercase tracking-wider px-3 py-1.5 rounded-lg border bg-error/10 text-error border-error/20">
                  {t('courseSA.saCourse', 'التقييم الذاتي الشامل')}
                </span>
                <span className="flex items-center gap-1.5 text-xs font-mono font-bold text-error bg-error/10 px-3 py-1 rounded border border-error/20">
                  <CheckCircle2 size={14} /> {totalQuestions} {t('courseSA.questions', 'أسئلة')}
                </span>
              </div>

              <div className="flex flex-col items-center text-center gap-4 mb-8">
                <div className="w-20 h-20 rounded-3xl border flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition-transform bg-error/10 text-error border-error/20">
                  <CheckCircle2 size={40} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-black text-on-surface text-2xl leading-snug group-hover:text-error transition-colors mb-2">
                    {activeCourse?.course?.title || t('courseSA.courseExam', 'امتحان الدورة الشامل')}
                  </h3>
                  <p className="text-sm text-on-surface-variant max-w-md mx-auto">
                    {t('courseSA.courseExamDesc', 'امتحان شامل يضم جميع أسئلة التقييم الذاتي من كافة وحدات هذه الدورة. اختبر مستواك الآن!')}
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-outline-variant/20">
              <button
                onClick={() => setShowConfirmModal(true)}
                className="w-full flex items-center justify-center gap-2 py-4 bg-error hover:bg-error-hover text-white rounded-2xl font-black text-sm shadow-lg shadow-error/20 transition-all cursor-pointer group-hover:scale-[1.02]"
              >
                <Play size={18} className="fill-current" />
                <span>{t('courseSA.startAssessment', 'إجراء التقييم')}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ⚠️ Start Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-surface border border-outline-variant/30 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200 text-on-surface">
            {/* Top red/amber warning accent */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-rose-500 to-red-600" />

            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 flex items-center justify-center mb-4 shadow-inner">
                <AlertTriangle size={36} />
              </div>

              <span className="text-[11px] font-black uppercase tracking-wider text-rose-600 mb-1">
                {t('courseSA.warningTitle', 'تنبيه هام ومشدد قبل بدء الامتحان')}
              </span>
              <h3 className="text-xl font-black text-on-surface mb-2">
                {t('courseSA.warningSubtitle', 'التقييم الذاتي الشامل (Self Assessment)')}
              </h3>
              {activeCourse?.course?.title && (
                <p className="text-xs font-bold text-primary mb-3 px-3 py-1 bg-primary/10 rounded-lg inline-block">
                  {activeCourse.course.title}
                </p>
              )}
              
              <div className="bg-surface-container-low rounded-2xl p-4 border border-outline-variant/30 text-start space-y-3 w-full text-xs">
                <div className="flex items-start gap-2.5">
                  <span className="text-rose-500 font-black text-base shrink-0 leading-none mt-0.5">•</span>
                  <p className="text-on-surface leading-relaxed">
                    <strong className="text-rose-600 font-extrabold">{t('courseQuizPlayer.cancelExamBtn', 'إلغاء الامتحان')}: </strong>
                    {t('courseSA.cancelRule', 'عند الرغبة في الخروج وإلغاء الامتحان، لن يتم احتساب أي نتيجة أو حفظ إجاباتك، وستتم إعادتك مباشرة إلى الصفحة الرئيسية.')}
                  </p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="text-indigo-500 font-black text-base shrink-0 leading-none mt-0.5">•</span>
                  <p className="text-on-surface leading-relaxed">
                    <strong className="text-indigo-600 font-extrabold">{t('courseQuizPlayer.timeUsed', 'مؤقت زمني')}: </strong>
                    {t('courseSA.timerRule', 'الاختبار محدد بوقت دقيقة واحدة لكل سؤال، ويبدأ العد التنازلي فور بدء التقييم.')}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-3 px-4 rounded-xl bg-surface-container border border-outline-variant/30 text-on-surface font-bold text-xs hover:bg-surface-container-high transition-all cursor-pointer"
              >
                {t('courseSA.cancelReturnBtn', 'إلغاء والعودة')}
              </button>
              
              <button
                type="button"
                onClick={() => {
                  setShowConfirmModal(false);
                  navigate(`/course-quiz-player/${courseId}`);
                }}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white font-black text-xs shadow-md shadow-rose-500/20 hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Play size={16} className="fill-current" />
                <span>{t('courseSA.readyStartBtn', 'أنا جاهز، ابدأ الامتحان الآن')}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
