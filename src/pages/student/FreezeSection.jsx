import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2, Lock, Unlock, AlertCircle, Info, CalendarClock, ShieldAlert } from 'lucide-react';
import API from '../../api/axios';
import { toast } from 'react-hot-toast';

export default function FreezeSection() {
  const { t } = useTranslation();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  const fetchEnrollments = async () => {
    try {
      setLoading(true);
      const res = await API.get('/student/enrollments');
      setEnrollments(res.data.enrollments || []);
    } catch (error) {
      toast.error(error.response?.data?.message || t('freezeSection.errorFetchingEnrollments', 'خطأ في جلب الاشتراكات'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnrollments();
  }, []);

  const handleFreeze = async (courseId) => {
    try {
      setProcessingId(courseId);
      const res = await API.post(`/student/enrollments/${courseId}/freeze`);
      toast.success(res.data.message || t('freezeSection.freezeSuccess', 'تم تجميد الدورة بنجاح'));
      fetchEnrollments();
    } catch (error) {
      toast.error(error.response?.data?.message || t('freezeSection.freezeError', 'خطأ في تجميد الدورة'));
    } finally {
      setProcessingId(null);
    }
  };

  const handleUnfreeze = async (courseId) => {
    try {
      setProcessingId(courseId);
      const res = await API.post(`/student/enrollments/${courseId}/unfreeze`);
      toast.success(res.data.message || t('freezeSection.unfreezeSuccess', 'تم إلغاء تجميد الدورة بنجاح'));
      fetchEnrollments();
    } catch (error) {
      toast.error(error.response?.data?.message || t('freezeSection.unfreezeError', 'خطأ في إلغاء تجميد الدورة'));
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 size={40} className="animate-spin text-primary mb-4" />
        <p className="text-on-surface-variant">{t('freezeSection.loadingEnrollments', 'جاري تحميل الاشتراكات...')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto">
      {/* Banner */}
      <div className="bg-gradient-to-br from-error to-rose-600 text-white rounded-3xl p-6 sm:p-8 shadow-lg shadow-error/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2" dir="auto">
              <Lock size={28} />
              {t('freezeSection.title', 'تجميد الحساب')}
            </h2>
            <p className="text-xs sm:text-sm text-white/90 max-w-xl leading-relaxed" dir="auto">
              {t('freezeSection.description', 'قم بإيقاف دوراتك النشطة مؤقتاً إذا احتجت لفترة راحة. يمكنك التجميد حتى مرتين لكل دورة (بحد أقصى 6 أشهر في كل مرة).')}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-surface rounded-[2rem] border border-outline-variant/30 p-6 sm:p-8 shadow-sm">
        {enrollments.length === 0 ? (
          <div className="text-center py-10">
            <ShieldAlert size={48} className="text-on-surface-variant/30 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-on-surface mb-2">{t('freezeSection.noActiveEnrollments', 'لا توجد اشتراكات نشطة')}</h3>
            <p className="text-sm text-on-surface-variant">{t('freezeSection.noCoursesToFreeze', 'ليس لديك أي دورات لتجميدها.')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {enrollments.map((enrollment) => {
              const isFrozen = enrollment.status === 'frozen';
              const canFreeze = enrollment.status === 'active' && enrollment.freeze_count < 2;
              const maxReached = enrollment.status === 'active' && enrollment.freeze_count >= 2;
              
              return (
                <div key={enrollment.id} className={`rounded-2xl border p-5 transition-all ${isFrozen ? 'border-error/50 bg-error/5' : 'border-outline-variant/30 bg-surface-container-lowest'}`}>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-bold text-base text-on-surface line-clamp-1" dir="auto">{enrollment.course?.title || t('freezeSection.unknownCourse', 'دورة غير معروفة')}</h4>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${isFrozen ? 'bg-error text-white' : 'bg-primary/10 text-primary'}`}>
                          {isFrozen ? t('freezeSection.frozen', 'مجمد') : (enrollment.status === 'active' ? t('freezeSection.active', 'نشط') : enrollment.status.toUpperCase())}
                        </span>
                        <span className="text-[10px] text-on-surface-variant bg-surface-container-highest px-2 py-0.5 rounded">
                          {t('freezeSection.freezesUsed', 'مرات التجميد المستخدمة:')} {enrollment.freeze_count} / 2
                        </span>
                      </div>
                    </div>
                  </div>

                  {isFrozen && enrollment.freeze_end_date && (
                    <div className="flex items-center gap-2 text-xs text-error mb-4 bg-error/10 p-2 rounded-lg" dir="auto">
                      <CalendarClock size={16} />
                      <span>
                        {t('freezeSection.autoUnfreezeOn', 'تفعيل تلقائي في:')} {new Date(enrollment.freeze_end_date).toLocaleDateString()}
                      </span>
                    </div>
                  )}

                  {maxReached && !isFrozen && (
                    <div className="flex items-center gap-2 text-[11px] text-on-surface-variant/70 mb-4 bg-surface-container-low p-2 rounded-lg" dir="auto">
                      <Info size={14} />
                      <span>{t('freezeSection.maxFreezeReached', 'لقد وصلت للحد الأقصى لمرات التجميد لهذه الدورة.')}</span>
                    </div>
                  )}

                  <div className="pt-4 border-t border-outline-variant/20 flex justify-end">
                    {isFrozen ? (
                      <button
                        onClick={() => handleUnfreeze(enrollment.course_id)}
                        disabled={processingId === enrollment.course_id}
                        className="flex items-center gap-2 px-4 py-2 bg-success text-white rounded-xl text-xs font-bold hover:bg-success/90 disabled:opacity-50 transition-all"
                      >
                        {processingId === enrollment.course_id ? <Loader2 size={16} className="animate-spin" /> : <Unlock size={16} />}
                        {t('freezeSection.unfreezeNow', 'إلغاء التجميد الآن')}
                      </button>
                    ) : (
                      <button
                        onClick={() => handleFreeze(enrollment.course_id)}
                        disabled={processingId === enrollment.course_id || !canFreeze}
                        className="flex items-center gap-2 px-4 py-2 bg-error text-white rounded-xl text-xs font-bold hover:bg-error/90 disabled:opacity-50 transition-all"
                      >
                        {processingId === enrollment.course_id ? <Loader2 size={16} className="animate-spin" /> : <Lock size={16} />}
                        {t('freezeSection.freezeCourse', 'تجميد الدورة')}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
