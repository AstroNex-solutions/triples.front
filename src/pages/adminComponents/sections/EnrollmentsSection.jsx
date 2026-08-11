import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import API from '../../../api/axios';
import { Loader2, Search } from 'lucide-react';
import { SectionHeader, Card, statusBadge, Modal, SubmitBtn } from '../ui/SharedUI';

export default function EnrollmentsSection({ showMsg }) {
  const { t, i18n } = useTranslation();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [form, setForm] = useState({ user_id: '', course_id: '', is_paid: false });
  const [studentSearch, setStudentSearch] = useState('');
  const [courseSearch, setCourseSearch] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [eRes, sRes, cRes] = await Promise.all([
        API.get('/admin/enrollments'),
        API.get('/admin/users?status=Student'),
        API.get('/admin/courses')
      ]);
      setEnrollments(eRes.data.enrollments || []);
      setStudents(sRes.data.users || []);
      setCourses(cRes.data.courses || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const createEnrollment = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await API.post('/admin/enrollments', form);
      showMsg('success', 'Enrollment added');
      setShowAdd(false);
      setForm({ user_id: '', course_id: '', is_paid: false });
      fetchData();
    } catch (err) {
      showMsg('error', err.response?.data?.message || 'Error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <SectionHeader 
        title={t('admin.sections.enrollments')} 
        count={enrollments.length} 
        onAdd={() => setShowAdd(true)} 
        addLabel="New Enrollment / اشتراك جديد" 
      />
      {loading ? <div className="py-12 flex justify-center"><Loader2 size={24} className="animate-spin text-primary" /></div> : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-start text-xs sm:text-sm border-separate border-spacing-y-1">
              <thead>
                <tr className="text-on-surface-variant/70">
                  <th className="p-3 text-start">{t('admin.sections.users.students')}</th>
                  <th className="p-3 text-start">{t('admin.sections.courses')}</th>
                  <th className="p-3 text-start">{t('admin.common.status')}</th>
                  <th className="p-3 text-start">Progress / التقدم</th>
                  <th className="p-3 text-start">{t('admin.common.date')}</th>
                </tr>
              </thead>
              <tbody>{enrollments.map(e => {
                const cTitle = e.course?.[`title_${i18n.language}`] || e.course?.title;
                return (
                  <tr key={e.id} className="bg-surface/50 hover:bg-surface/80 transition-all">
                    <td className="p-3 font-bold text-on-surface">{e.student?.name || '—'}</td>
                    <td className="p-3 text-on-surface-variant">{cTitle || '—'}</td>
                    <td className="p-3">{statusBadge(e.status)}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 rounded-full bg-outline-variant/20 overflow-hidden"><div className="h-full rounded-full bg-primary" style={{ width: `${e.progress || 0}%` }} /></div>
                        <span className="text-xs font-bold text-on-surface-variant">{Math.round(e.progress || 0)}%</span>
                      </div>
                    </td>
                    <td className="p-3 text-xs text-on-surface-variant" dir="ltr">{new Date(e.enrollment_date).toLocaleDateString(i18n.language === 'en' ? 'en-US' : 'ar-EG')}</td>
                  </tr>
                );
              })}</tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Add Enrollment Modal */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="New Enrollment / إضافة اشتراك جديد">
        <form onSubmit={createEnrollment} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-on-surface-variant block">Select Student / اختر الطالب *</label>
            <div className="relative">
              <Search size={14} className={`absolute top-1/2 -translate-y-1/2 text-on-surface-variant/50 ${i18n.language === 'en' ? 'left-3' : 'right-3'}`} />
              <input 
                value={studentSearch} 
                onChange={e => setStudentSearch(e.target.value)} 
                placeholder={t('admin.common.search')} 
                className={`w-full py-2 bg-surface/80 border border-outline-variant/50 rounded-2xl text-sm text-on-surface focus:outline-none focus:border-primary transition-all ${i18n.language === 'en' ? 'pl-8 pr-4' : 'pr-8 pl-4'}`} 
              />
            </div>
            <div className="max-h-40 overflow-y-auto bg-surface-container-lowest border border-outline-variant/30 rounded-xl custom-scrollbar mt-1">
              {students
                .filter(s => s.name?.toLowerCase().includes(studentSearch.toLowerCase()) || s.email?.toLowerCase().includes(studentSearch.toLowerCase()))
                .map(s => (
                <div 
                  key={s.id} 
                  onClick={() => setForm({ ...form, user_id: s.id })} 
                  className={`p-2 text-xs cursor-pointer hover:bg-surface-container-low transition-all ${form.user_id === s.id ? 'bg-primary/10 text-primary font-bold' : 'text-on-surface'}`}
                >
                  {s.name} ({s.email})
                </div>
              ))}
              {students.filter(s => s.name?.toLowerCase().includes(studentSearch.toLowerCase()) || s.email?.toLowerCase().includes(studentSearch.toLowerCase())).length === 0 && (
                <div className="p-2 text-xs text-on-surface-variant text-center">No results</div>
              )}
            </div>
          </div>
          
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-on-surface-variant block">Select Course / اختر الكورس *</label>
            <div className="relative">
              <Search size={14} className={`absolute top-1/2 -translate-y-1/2 text-on-surface-variant/50 ${i18n.language === 'en' ? 'left-3' : 'right-3'}`} />
              <input 
                value={courseSearch} 
                onChange={e => setCourseSearch(e.target.value)} 
                placeholder={t('admin.common.search')} 
                className={`w-full py-2 bg-surface/80 border border-outline-variant/50 rounded-2xl text-sm text-on-surface focus:outline-none focus:border-primary transition-all ${i18n.language === 'en' ? 'pl-8 pr-4' : 'pr-8 pl-4'}`} 
              />
            </div>
            <div className="max-h-40 overflow-y-auto bg-surface-container-lowest border border-outline-variant/30 rounded-xl custom-scrollbar mt-1">
              {courses
                .filter(c => (c[`title_${i18n.language}`] || c.title)?.toLowerCase().includes(courseSearch.toLowerCase()))
                .map(c => {
                  const cTitle = c[`title_${i18n.language}`] || c.title;
                  return (
                    <div 
                      key={c.id} 
                      onClick={() => setForm({ ...form, course_id: c.id })} 
                      className={`p-2 text-xs cursor-pointer hover:bg-surface-container-low transition-all ${form.course_id === c.id ? 'bg-primary/10 text-primary font-bold' : 'text-on-surface'}`}
                    >
                      {cTitle}
                    </div>
                  );
                })}
              {courses.filter(c => (c[`title_${i18n.language}`] || c.title)?.toLowerCase().includes(courseSearch.toLowerCase())).length === 0 && (
                <div className="p-2 text-xs text-on-surface-variant text-center">No results</div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input 
              type="checkbox" 
              id="is_paid" 
              checked={form.is_paid} 
              onChange={e => setForm({ ...form, is_paid: e.target.checked })} 
              className="w-4 h-4 rounded text-primary focus:ring-primary cursor-pointer" 
            />
            <label htmlFor="is_paid" className="text-xs font-bold text-on-surface cursor-pointer select-none">Paid Enrollment / اشتراك مدفوع</label>
          </div>

          <SubmitBtn loading={submitting} label="Add Enrollment / إضافة الاشتراك" disabled={!form.user_id || !form.course_id} />
        </form>
      </Modal>
    </>
  );
}
