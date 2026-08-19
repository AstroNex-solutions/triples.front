import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, PlayCircle, Loader2, Compass, Snowflake, Unlock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import API from '../../api/axios';
import { SectionHeader, Card, getImageSrc } from './SharedUI';
import Toast from '../../components/Toast';

export default function CoursesSection() {
  const { t, i18n } = useTranslation();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  
  const fetchEnrollments = () => {
    setLoading(true);
    API.get('/student/enrollments')
      .then(r => setEnrollments(r.data.enrollments))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchEnrollments();
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleFreeze = async (courseId) => {
    try {
      setLoading(true);
      await API.post(`/student/enrollments/${courseId}/freeze`);
      showToast('تم تجميد الكورس بنجاح');
      fetchEnrollments();
    } catch (err) {
      showToast(err.response?.data?.message || 'خطأ في التجميد', 'error');
      setLoading(false);
    }
  };

  const handleUnfreeze = async (courseId) => {
    try {
      setLoading(true);
      await API.post(`/student/enrollments/${courseId}/unfreeze`);
      showToast('تم إلغاء التجميد بنجاح');
      fetchEnrollments();
    } catch (err) {
      showToast(err.response?.data?.message || 'خطأ في إلغاء التجميد', 'error');
      setLoading(false);
    }
  };

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <SectionHeader title={t('student.courses.title')} count={enrollments.length}>
        <Link to="/courses" className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-xl text-xs font-bold hover:bg-primary-hover shadow-glow transition-all">
          <Compass size={16} />
          {t('student.courses.explore')}
        </Link>
      </SectionHeader>
      {loading ? <div className="py-12 flex justify-center"><Loader2 size={24} className="animate-spin text-primary" /></div> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {enrollments.map(e => {
            const courseTitle = e.course?.[`title_${i18n.language}`] || e.course?.title;
            return (
              <Card key={e.id} className="flex flex-col">
                <div className="h-32 rounded-xl bg-surface-variant/50 mb-4 overflow-hidden relative">
                  {e.course?.image ? (
                    <img src={(e.course.image?.startsWith('http') ? e.course.image : getImageSrc(e.course.image))} alt={courseTitle} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-on-surface-variant opacity-50"><BookOpen size={40} /></div>
                  )}
                  {e.status === 'completed' && <div className="absolute top-2 right-2 bg-emerald-500 text-white text-[10px] font-bold px-2 py-1 rounded-lg">{t('student.courses.completed')}</div>}
                </div>
                <h4 className="text-sm font-extrabold text-on-surface line-clamp-2 mb-2">{courseTitle}</h4>
                
                <div className="mt-auto space-y-3">
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[11px] font-bold text-on-surface-variant">
                      <span>{t('student.courses.progress')}</span>
                      <span>{Math.round(e.progress || 0)}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-outline-variant/20 overflow-hidden">
                      <div className="h-full rounded-full bg-primary" style={{ width: `${e.progress || 0}%` }} />
                    </div>
                  </div>
                  
                  {e.status === 'frozen' ? (
                    <div className="space-y-2">
                      <div className="w-full py-2 bg-surface-variant/50 text-on-surface-variant font-bold text-[10px] rounded-xl flex items-center justify-center gap-1.5 border border-outline-variant/30">
                        <Snowflake size={14} />
                        <span>الكورس مجمد حالياً</span>
                      </div>
                      <button onClick={() => handleUnfreeze(e.course_id)} className="w-full py-2 bg-primary text-on-primary hover:bg-primary-hover font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all">
                        <Unlock size={14} /> إلغاء التجميد
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <Link to={`/learn/${e.course_id}`} className="w-full py-2 bg-primary/10 text-primary hover:bg-primary/20 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer">
                        <PlayCircle size={16} /> {t('student.courses.continueLearning')}
                      </Link>
                      
                      {e.status === 'active' && e.freeze_count < 2 && (
                        <button onClick={() => handleFreeze(e.course_id)} className="w-full py-1.5 bg-surface text-primary border border-primary/20 hover:bg-primary/10 font-bold text-[10px] rounded-xl flex items-center justify-center gap-1.5 transition-all">
                          <Snowflake size={14} /> تجميد الكورس (متبقي {2 - e.freeze_count})
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
          {enrollments.length === 0 && (
            <div className="col-span-full py-12 text-center">
              <div className="w-16 h-16 bg-surface-variant/30 text-on-surface-variant/50 rounded-2xl flex items-center justify-center mx-auto mb-3"><BookOpen size={24} /></div>
              <p className="text-sm font-bold text-on-surface">{t('student.courses.emptyTitle')}</p>
              <Link to="/courses" className="text-xs text-primary font-bold hover:underline mt-2 inline-block">{t('student.courses.emptyLink')}</Link>
            </div>
          )}
        </div>
      )}
    </>
  );
}
