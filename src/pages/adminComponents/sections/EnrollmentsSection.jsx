import { useOutletContext } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import API from '../../../api/axios';
import { Loader2, Search, Edit, ChevronLeft, ChevronRight } from 'lucide-react';
import { SectionHeader, Card, statusBadge, Modal, SubmitBtn } from '../ui/SharedUI';

export default function EnrollmentsSection() {
  const { showMsg } = useOutletContext();
  const { t, i18n } = useTranslation();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const today = new Date().toISOString().split('T')[0];
  const nextYear = new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0];
  const [form, setForm] = useState({ user_id: '', course_id: '', is_paid: false, start_date: today, end_date: nextYear });
  const [editForm, setEditForm] = useState({ id: null, start_date: '', end_date: '', status: '' });
  const [studentSearch, setStudentSearch] = useState('');
  const [courseSearch, setCourseSearch] = useState('');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchData = async () => {
    setLoading(true);
    try {
      const [eRes, sRes, cRes] = await Promise.all([
        API.get('/admin/enrollments'),
        API.get('/admin/users?status=Student&limit=1000'),
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
      setForm({ user_id: '', course_id: '', is_paid: false, start_date: today, end_date: nextYear });
      fetchData();
    } catch (err) {
      showMsg('error', err.response?.data?.message || 'Error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditClick = (enrollment) => {
    setEditForm({
      id: enrollment.id,
      start_date: enrollment.start_date ? new Date(enrollment.start_date).toISOString().split('T')[0] : (enrollment.enrollment_date ? new Date(enrollment.enrollment_date).toISOString().split('T')[0] : ''),
      end_date: enrollment.end_date ? new Date(enrollment.end_date).toISOString().split('T')[0] : '',
      status: enrollment.status
    });
    setShowEdit(true);
  };

  const submitEdit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await API.put(`/admin/enrollments/${editForm.id}`, editForm);
      showMsg('success', 'Enrollment updated / تم التحديث بنجاح');
      setShowEdit(false);
      fetchData();
    } catch (err) {
      showMsg('error', err.response?.data?.message || 'Error updating enrollment');
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
                  <th className="p-3 text-start">{t('admin.common.progress')}</th>
                  <th className="p-3 text-start">{t('admin.common.date')}</th>
                  <th className="p-3 text-center">{t('admin.common.actions')}</th>
                </tr>
              </thead>
              <tbody>{enrollments.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map(e => {
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
                    <td className="p-3 text-xs text-on-surface-variant" dir="ltr">
                      <div>{new Date(e.enrollment_date).toLocaleDateString(i18n.language === 'en' ? 'en-US' : 'ar-EG')}</div>
                      {e.end_date && (() => {
                        const remainingDays = Math.ceil((new Date(e.end_date) - new Date()) / (1000 * 60 * 60 * 24));
                        const isExpiringSoon = remainingDays < 30;
                        const isExpired = remainingDays <= 0;
                        return (
                          <div className={`text-[10px] mt-1 font-bold ${isExpiringSoon || isExpired ? 'text-error' : 'opacity-80'}`}>
                            Ends: {new Date(e.end_date).toLocaleDateString()}
                            <span className="ms-1">
                              ({isExpired ? 'منتهي' : `متبقي ${remainingDays} يوم`})
                            </span>
                          </div>
                        );
                      })()}
                    </td>
                    <td className="p-3 text-center">
                      <button onClick={() => handleEditClick(e)} className="p-1.5 text-primary bg-primary/10 rounded-lg hover:bg-primary hover:text-white transition-all">
                        <Edit size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}</tbody>
            </table>
          </div>
          
          {/* Pagination Controls */}
          {enrollments.length > itemsPerPage && (
            <div className="flex items-center justify-between border-t border-outline-variant/20 pt-4 mt-4">
              <span className="text-xs text-on-surface-variant">
                عرض {(currentPage - 1) * itemsPerPage + 1} إلى {Math.min(currentPage * itemsPerPage, enrollments.length)} من {enrollments.length}
              </span>
              <div className="flex items-center gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  className="p-1.5 rounded-lg border border-outline-variant/30 hover:bg-surface-container-high disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={16} /> {/* Note: ChevronRight goes back in RTL */}
                </button>
                <span className="text-xs font-bold text-on-surface">
                  {currentPage} / {Math.ceil(enrollments.length / itemsPerPage)}
                </span>
                <button
                  disabled={currentPage === Math.ceil(enrollments.length / itemsPerPage)}
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(enrollments.length / itemsPerPage)))}
                  className="p-1.5 rounded-lg border border-outline-variant/30 hover:bg-surface-container-high disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={16} /> {/* Note: ChevronLeft goes forward in RTL */}
                </button>
              </div>
            </div>
          )}
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-on-surface-variant block">Start Date / تاريخ البدء</label>
              <input 
                type="date" 
                value={form.start_date || ''} 
                onChange={e => setForm({ ...form, start_date: e.target.value })} 
                className="w-full py-2 px-4 bg-surface/80 border border-outline-variant/50 rounded-2xl text-sm text-on-surface focus:outline-none focus:border-primary transition-all" 
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-on-surface-variant block">End Date / تاريخ الانتهاء</label>
              <input 
                type="date" 
                value={form.end_date || ''} 
                onChange={e => setForm({ ...form, end_date: e.target.value })} 
                className="w-full py-2 px-4 bg-surface/80 border border-outline-variant/50 rounded-2xl text-sm text-on-surface focus:outline-none focus:border-primary transition-all" 
              />
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

      {/* Edit Enrollment Modal */}
      <Modal open={showEdit} onClose={() => setShowEdit(false)} title="Edit Enrollment / تعديل فترة الاشتراك">
        <form onSubmit={submitEdit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-on-surface-variant block">Start Date / تاريخ البدء</label>
              <input 
                type="date" 
                value={editForm.start_date || ''} 
                onChange={e => setEditForm({ ...editForm, start_date: e.target.value })} 
                className="w-full py-2 px-4 bg-surface/80 border border-outline-variant/50 rounded-2xl text-sm text-on-surface focus:outline-none focus:border-primary transition-all" 
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-on-surface-variant block">End Date / تاريخ الانتهاء</label>
              <input 
                type="date" 
                value={editForm.end_date || ''} 
                onChange={e => setEditForm({ ...editForm, end_date: e.target.value })} 
                className="w-full py-2 px-4 bg-surface/80 border border-outline-variant/50 rounded-2xl text-sm text-on-surface focus:outline-none focus:border-primary transition-all" 
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-on-surface-variant block">Status / حالة الاشتراك</label>
            <select 
              value={editForm.status} 
              onChange={e => setEditForm({ ...editForm, status: e.target.value })} 
              className="w-full py-2 px-4 bg-surface/80 border border-outline-variant/50 rounded-2xl text-sm text-on-surface focus:outline-none focus:border-primary transition-all"
            >
              <option value="active">Active / نشط</option>
              <option value="suspended">Suspended / معلق (أو منتهي)</option>
              <option value="completed">Completed / مكتمل</option>
              <option value="dropped">Dropped / منسحب</option>
              <option value="frozen">Frozen / مجمد</option>
            </select>
          </div>

          <SubmitBtn loading={submitting} label="Save Changes / حفظ التعديلات" />
        </form>
      </Modal>
    </>
  );
}
