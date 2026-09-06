import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, PlayCircle, Loader2, Compass, Snowflake, Unlock, Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import API from '../../api/axios';
import { SectionHeader, Card, getImageSrc } from './SharedUI';
import Toast from '../../components/Toast';

export default function CoursesSection() {
  const { t, i18n } = useTranslation();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [reviewData, setReviewData] = useState({ rating: 5, review_text: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

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
      showToast(t('studentDashboard.courses.freezeSuccess', 'Course frozen successfully'));
      fetchEnrollments();
    } catch (err) {
      showToast(err.response?.data?.message || t('studentDashboard.courses.freezeError', 'Error freezing course'), 'error');
      setLoading(false);
    }
  };

  const handleUnfreeze = async (courseId) => {
    try {
      setLoading(true);
      await API.post(`/student/enrollments/${courseId}/unfreeze`);
      showToast(t('studentDashboard.courses.unfreezeSuccess', 'Course unfrozen successfully'));
      fetchEnrollments();
    } catch (err) {
      showToast(err.response?.data?.message || t('studentDashboard.courses.unfreezeError', 'Error unfreezing course'), 'error');
      setLoading(false);
    }
  };

  const submitReview = async () => {
    if (!selectedCourse) return;
    setSubmittingReview(true);
    try {
      await API.post('/student/reviews', { course_id: selectedCourse.course_id, rating: reviewData.rating, review_text: reviewData.review_text });
      showToast(t('studentDashboard.courses.reviewSuccess', 'Review submitted successfully! 🌟'));
      setReviewModalOpen(false);
    } catch (err) {
      showToast(err.response?.data?.message || t('studentDashboard.courses.reviewError', 'Error submitting review'), 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <SectionHeader title={t('studentDashboard.courses.title')} count={enrollments.length}>
        <Link to="/courses" className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-xl text-xs font-bold hover:bg-primary-hover shadow-glow transition-all">
          <Compass size={16} />
          {t('studentDashboard.courses.explore', 'Explore Courses')}
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
                  {e.status === 'completed' && <div className="absolute top-2 right-2 bg-emerald-500 text-white text-[10px] font-bold px-2 py-1 rounded-lg">{t('studentDashboard.courses.completed')}</div>}
                </div>
                <h4 className="text-sm font-extrabold text-on-surface line-clamp-2 mb-2">{courseTitle}</h4>
                
                <div className="mt-auto space-y-3">
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[11px] font-bold text-on-surface-variant">
                      <span>{t('studentDashboard.courses.progress')}</span>
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
                        <span>{t('studentDashboard.courses.frozen', 'Course is currently frozen')}</span>
                      </div>
                      <button onClick={() => handleUnfreeze(e.course_id)} className="w-full py-2 bg-primary text-on-primary hover:bg-primary-hover font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all">
                        <Unlock size={14} /> {t('studentDashboard.courses.unfreeze', 'Unfreeze')}
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <div className="flex gap-2">
                        <Link to={`/learn/${e.course_id}`} className="flex-1 py-2 bg-primary/10 text-primary hover:bg-primary/20 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer">
                          <PlayCircle size={16} /> {t('studentDashboard.courses.continue')}
                        </Link>
                        <button onClick={() => { setSelectedCourse(e); setReviewData({rating: 5, review_text: ''}); setReviewModalOpen(true); }} className="px-3 py-2 bg-surface border border-outline-variant/40 text-on-surface hover:text-yellow-500 font-bold text-xs rounded-xl flex items-center justify-center transition-all cursor-pointer" title={t('studentDashboard.courses.rateCourse', 'Rate Course')}>
                          <Star size={16} />
                        </button>
                      </div>
                      
                      {e.status === 'active' && e.freeze_count < 2 && (
                        <button onClick={() => handleFreeze(e.course_id)} className="w-full py-1.5 bg-surface text-primary border border-primary/20 hover:bg-primary/10 font-bold text-[10px] rounded-xl flex items-center justify-center gap-1.5 transition-all">
                          <Snowflake size={14} /> {t('studentDashboard.courses.freeze', 'Freeze Course')} ({t('studentDashboard.courses.remaining', 'Remaining')} {2 - e.freeze_count})
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
              <p className="text-sm font-bold text-on-surface">{t('studentDashboard.courses.noCourses')}</p>
              <Link to="/courses" className="text-xs text-primary font-bold hover:underline mt-2 inline-block">{t('studentDashboard.courses.explore', 'Explore Courses')}</Link>
            </div>
          )}
        </div>
      )}

      {/* نافذة تقييم الكورس */}
      {reviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-surface border border-outline-variant/30 rounded-3xl p-6 w-full max-w-md shadow-2xl relative" dir="rtl">
            <h3 className="text-xl font-extrabold text-on-surface mb-4">{t('studentDashboard.courses.rateCourse', 'Rate Course')}</h3>
            <p className="text-xs text-on-surface-variant mb-6">رأيك يهمنا ويساعد الآخرين على اتخاذ القرار الصحيح.</p>
            <div className="flex items-center justify-center gap-2 mb-6">
              {[1, 2, 3, 4, 5].map((star) => (
                <button type="button" key={star} onClick={() => setReviewData(prev => ({ ...prev, rating: star }))} className="focus:outline-none transition-transform hover:scale-110">
                  <Star size={32} className={star <= reviewData.rating ? 'fill-yellow-400 text-yellow-400' : 'text-outline-variant'} />
                </button>
              ))}
            </div>
            <div>
              <label className="block text-xs font-bold text-on-surface mb-2">تعليقك (اختياري)</label>
              <textarea 
                value={reviewData.review_text} 
                onChange={(e) => setReviewData(prev => ({ ...prev, review_text: e.target.value }))}
                className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl p-3 text-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none min-h-[100px]" 
                placeholder="أخبرنا عن تجربتك..."
              />
            </div>
            <div className="flex gap-3 mt-6">
              <button type="button" onClick={() => setReviewModalOpen(false)} className="flex-1 py-2.5 rounded-xl font-bold text-xs bg-surface-container-low text-on-surface-variant hover:bg-surface-container transition-colors">{t('studentDashboard.shared.cancel')}</button>
              <button onClick={submitReview} disabled={submittingReview} className="flex-1 py-2.5 rounded-xl font-bold text-xs bg-primary text-on-primary hover:bg-primary-hover transition-colors flex items-center justify-center gap-2">
                {submittingReview ? <Loader2 size={16} className="animate-spin" /> : 'حفظ التقييم'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
