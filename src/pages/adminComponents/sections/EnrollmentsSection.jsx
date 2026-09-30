import { useOutletContext } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import API from '../../../api/axios';
import { Loader2, Search, Edit, ChevronLeft, ChevronRight, BookMarked, HelpCircle, CheckCircle2 } from 'lucide-react';
import { SectionHeader, Card, statusBadge, Modal, SubmitBtn, Select } from '../ui/SharedUI';

export default function EnrollmentsSection() {
  const { showMsg } = useOutletContext();
  const { t, i18n } = useTranslation();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewState, setViewState] = useState('list'); // 'list', 'add', 'edit'
  const [submitting, setSubmitting] = useState(false);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const today = new Date().toISOString().split('T')[0];
  const nextYear = new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0];
  const [form, setForm] = useState({ user_id: '', course_id: '', is_paid: false, start_date: today, end_date: nextYear, has_flashcards: false, has_qbank: false, has_self_assessment: false });
  const [editForm, setEditForm] = useState({ id: null, start_date: '', end_date: '', status: '', has_flashcards: false, has_qbank: false, has_self_assessment: false });
  const [studentSearch, setStudentSearch] = useState('');
  const [courseSearch, setCourseSearch] = useState('');
  const [enrollmentSearch, setEnrollmentSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCourse, setFilterCourse] = useState('all');
  const [filterProgress, setFilterProgress] = useState('all');
  const [filterDate, setFilterDate] = useState('all');
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
      showMsg('success', 'Enrollment added / تم إضافة الاشتراك');
      setViewState('list');
      setForm({ user_id: '', course_id: '', is_paid: false, start_date: today, end_date: nextYear, has_flashcards: false, has_qbank: false, has_self_assessment: false });
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
      status: enrollment.status,
      has_flashcards: !!enrollment.has_flashcards,
      has_qbank: !!enrollment.has_qbank,
      has_self_assessment: !!enrollment.has_self_assessment,
    });
    setViewState('edit');
  };

  const submitEdit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await API.put(`/admin/enrollments/${editForm.id}`, editForm);
      showMsg('success', 'Enrollment updated / تم التحديث بنجاح');
      setViewState('list');
      fetchData();
    } catch (err) {
      showMsg('error', err.response?.data?.message || 'Error updating enrollment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this enrollment? / هل أنت متأكد من الحذف؟')) return;
    try {
      await API.delete(`/admin/enrollments/${id}`);
      showMsg('success', 'Enrollment deleted / تم الحذف بنجاح');
      fetchData();
    } catch (err) {
      showMsg('error', 'Error deleting enrollment');
    }
  };

  // Feature items config — single source of truth
  const featureItems = [
    { key: 'has_flashcards', label: 'Flashcards', labelAr: 'بطاقات تعليمية', icon: BookMarked, activeColor: 'bg-primary/10 border-primary/40 text-primary' },
    { key: 'has_qbank', label: 'Q-Bank', labelAr: 'بنك الأسئلة', icon: HelpCircle, activeColor: 'bg-secondary/10 border-secondary/40 text-secondary' },
    { key: 'has_self_assessment', label: 'Assessment', labelAr: 'تقييم ذاتي', icon: CheckCircle2, activeColor: 'bg-error/10 border-error/40 text-error' },
  ];

  // Reusable feature toggle block
  const FeatureToggles = ({ values, onChange }) => (
    <div className="rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-4 space-y-3">
      <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">
        Feature Access / صلاحيات الميزات
      </p>
      <div className="grid grid-cols-3 gap-2.5">
        {featureItems.map(({ key, label, labelAr, icon: Icon, activeColor }) => (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key, !values[key])}
            className={`flex flex-col items-center justify-center gap-2 py-3 px-2 rounded-2xl border text-[11px] font-bold transition-all cursor-pointer ${values[key]
                ? activeColor
                : 'bg-surface border-outline-variant/30 text-on-surface-variant hover:border-outline-variant/60 hover:bg-surface-container-lowest'
              }`}
          >
            <Icon size={18} />
            <span className="text-center leading-tight">{i18n.language === 'en' ? label : labelAr}</span>
            <span className={`w-8 h-4 rounded-full flex items-center px-0.5 transition-all ${values[key] ? 'bg-current justify-end' : 'bg-outline-variant/40 justify-start'
              }`}>
              <span className="w-3 h-3 rounded-full bg-white shadow block" />
            </span>
          </button>
        ))}
      </div>
    </div>
  );

  // Consistent input class matching SharedUI.Input
  const inputCls = `w-full px-4 py-2.5 bg-surface/80 border border-outline-variant/50 rounded-2xl text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all`;
  const searchInputCls = (lang) => `${inputCls} ${lang === 'en' ? 'pl-9' : 'pr-9'}`;

  return (
    <>
      {viewState === 'list' && (
        <SectionHeader
          title={t('admin.sections.enrollments')}
          count={enrollments.length}
          onAdd={() => setViewState('add')}
          addLabel="New Enrollment / اشتراك جديد"
        />
      )}

      {viewState === 'add' && (
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => setViewState('list')} className="p-2 bg-surface border border-outline-variant/30 rounded-xl hover:bg-surface-variant transition-colors">
            <ChevronLeft size={20} />
          </button>
          <div>
            <h2 className="text-xl font-bold text-on-surface">إضافة اشتراك جديد</h2>
            <p className="text-sm text-on-surface-variant">New Enrollment</p>
          </div>
        </div>
      )}

      {viewState === 'edit' && (
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => setViewState('list')} className="p-2 bg-surface border border-outline-variant/30 rounded-xl hover:bg-surface-variant transition-colors">
            <ChevronLeft size={20} />
          </button>
          <div>
            <h2 className="text-xl font-bold text-on-surface">تعديل الاشتراك</h2>
            <p className="text-sm text-on-surface-variant">Edit Enrollment</p>
          </div>
        </div>
      )}

      {viewState === 'list' && (
        <>
          {loading ? (
        <div className="py-16 flex justify-center">
          <Loader2 size={28} className="animate-spin text-primary" />
        </div>
      ) : (
        <Card>
          {/* Search Bar & Filters for Enrollments */}
          <div className="mb-6 flex flex-col md:flex-row flex-wrap gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search size={16} className={`absolute top-1/2 -translate-y-1/2 text-on-surface-variant/50 pointer-events-none ${i18n.language === 'en' ? 'left-4' : 'right-4'}`} />
              <input
                value={enrollmentSearch}
                onChange={e => { setEnrollmentSearch(e.target.value); setCurrentPage(1); }}
                placeholder={t('admin.common.search') + '...'}
                className={searchInputCls(i18n.language)}
              />
            </div>
            
            <div className="flex flex-wrap gap-3">
              <select
                value={filterStatus}
                onChange={e => { setFilterStatus(e.target.value); setCurrentPage(1); }}
                className="px-4 py-2 bg-surface/80 border border-outline-variant/50 rounded-xl text-xs text-on-surface focus:outline-none focus:border-primary transition-all w-32"
              >
                <option value="all">كل الحالات (Status)</option>
                <option value="active">نشط (Active)</option>
                <option value="suspended">معلق (Suspended)</option>
                <option value="completed">مكتمل (Completed)</option>
                <option value="dropped">منسحب (Dropped)</option>
                <option value="frozen">مجمد (Frozen)</option>
              </select>

              <select
                value={filterCourse}
                onChange={e => { setFilterCourse(e.target.value); setCurrentPage(1); }}
                className="px-4 py-2 bg-surface/80 border border-outline-variant/50 rounded-xl text-xs text-on-surface focus:outline-none focus:border-primary transition-all w-40"
              >
                <option value="all">كل الكورسات (Courses)</option>
                {courses.map(c => (
                  <option key={c.id} value={c.id}>{c[`title_${i18n.language}`] || c.title}</option>
                ))}
              </select>

              <select
                value={filterProgress}
                onChange={e => { setFilterProgress(e.target.value); setCurrentPage(1); }}
                className="px-4 py-2 bg-surface/80 border border-outline-variant/50 rounded-xl text-xs text-on-surface focus:outline-none focus:border-primary transition-all w-36"
              >
                <option value="all">كل التقدم (Progress)</option>
                <option value="not_started">لم يبدأ (0%)</option>
                <option value="in_progress">قيد التقدم (1-99%)</option>
                <option value="completed">مكتمل (100%)</option>
              </select>

              <select
                value={filterDate}
                onChange={e => { setFilterDate(e.target.value); setCurrentPage(1); }}
                className="px-4 py-2 bg-surface/80 border border-outline-variant/50 rounded-xl text-xs text-on-surface focus:outline-none focus:border-primary transition-all w-44"
              >
                <option value="all">كل التواريخ (Dates)</option>
                <option value="last_30_days">آخر 30 يوم (استراك حديث)</option>
                <option value="expiring_soon">يقترب من الانتهاء (اقل من 30 يوم)</option>
                <option value="expired">منتهي (Expired)</option>
              </select>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-start border-separate border-spacing-y-1">
              <thead>
                <tr className="text-[11px] font-black uppercase tracking-wider text-on-surface-variant/60">
                  <th className="px-3 py-2 text-start">{t('admin.sections.users.username')}</th>
                  <th className="px-3 py-2 text-start">{t('admin.sections.courses')}</th>
                  <th className="px-3 py-2 text-start">{t('admin.common.status')}</th>
                  <th className="px-3 py-2 text-start">{t('admin.common.progress')}</th>
                  <th className="px-3 py-2 text-start">الميزات</th>
                  <th className="px-3 py-2 text-start">{t('admin.common.date')}</th>
                  <th className="px-3 py-2 text-center">{t('admin.common.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {enrollments
                  .filter(e => {
                    if (filterStatus !== 'all' && e.status !== filterStatus) return false;
                    if (filterCourse !== 'all' && e.course_id !== parseInt(filterCourse)) return false;

                    const progress = e.progress || 0;
                    if (filterProgress === 'not_started' && progress > 0) return false;
                    if (filterProgress === 'in_progress' && (progress === 0 || progress === 100)) return false;
                    if (filterProgress === 'completed' && progress < 100) return false;

                    if (filterDate !== 'all') {
                      const enrollDate = new Date(e.enrollment_date);
                      const endDate = e.end_date ? new Date(e.end_date) : null;
                      const now = new Date();
                      
                      if (filterDate === 'last_30_days') {
                        const diff = (now - enrollDate) / (1000 * 60 * 60 * 24);
                        if (diff > 30) return false;
                      } else if (filterDate === 'expired') {
                        if (!endDate || endDate >= now) return false;
                      } else if (filterDate === 'expiring_soon') {
                        if (!endDate || endDate < now) return false;
                        const remaining = (endDate - now) / (1000 * 60 * 60 * 24);
                        if (remaining > 30) return false;
                      }
                    }
                    
                    if (!enrollmentSearch) return true;
                    const query = enrollmentSearch.toLowerCase();
                    return e.student?.name?.toLowerCase().includes(query) || e.student?.email?.toLowerCase().includes(query) || e.course?.title?.toLowerCase().includes(query) || e.course?.title_ar?.toLowerCase().includes(query);
                  })
                  .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                  .map(e => {
                  const cTitle = e.course?.[`title_${i18n.language}`] || e.course?.title;
                  return (
                    <tr key={e.id} className="bg-surface/40 hover:bg-surface/70 transition-all">
                      <td className="px-3 py-3">
                        <div className="font-bold text-sm text-on-surface">{e.student?.name || '—'}</div>
                        {e.student?.email && <div className="text-[11px] text-on-surface-variant/70 font-mono" dir="ltr">{e.student.email}</div>}
                      </td>
                      <td className="px-3 py-3 text-xs text-on-surface-variant max-w-[160px] truncate">{cTitle || '—'}</td>
                      <td className="px-3 py-3">{statusBadge(e.status)}</td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-1.5 rounded-full bg-outline-variant/20 overflow-hidden">
                            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${e.progress || 0}%` }} />
                          </div>
                          <span className="text-[11px] font-bold text-on-surface-variant">{Math.round(e.progress || 0)}%</span>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-1.5">
                          {featureItems.map(({ key, icon: Icon, label, activeColor }) => (
                            <span
                              key={key}
                              title={label}
                              className={`flex items-center justify-center w-6 h-6 rounded-full transition-all ${e[key]
                                  ? activeColor
                                  : 'bg-outline-variant/10 text-on-surface-variant/25'
                                }`}
                            >
                              <Icon size={12} />
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-3 py-3 text-xs text-on-surface-variant" dir="ltr">
                        <div className="font-medium">{new Date(e.enrollment_date).toLocaleDateString(i18n.language === 'en' ? 'en-US' : 'ar-EG')}</div>
                        {e.end_date && (() => {
                          const remainingDays = Math.ceil((new Date(e.end_date) - new Date()) / (1000 * 60 * 60 * 24));
                          const isExpired = remainingDays <= 0;
                          const isExpiringSoon = remainingDays < 30 && !isExpired;
                          return (
                            <div className={`text-[10px] mt-0.5 font-bold ${isExpired ? 'text-error' : isExpiringSoon ? 'text-amber-500' : 'text-on-surface-variant/60'}`}>
                              {isExpired ? 'منتهي' : `متبقي ${remainingDays}د`}
                            </div>
                          );
                        })()}
                      </td>
                      <td className="px-3 py-3 text-center">
                        <button
                          onClick={() => handleEditClick(e)}
                          className="p-1.5 text-primary bg-primary/10 rounded-xl hover:bg-primary hover:text-white transition-all cursor-pointer"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(e.id)}
                          className="p-1.5 text-error bg-error/10 rounded-xl hover:bg-error hover:text-white transition-all cursor-pointer"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {enrollments.length > itemsPerPage && (
            <div className="flex items-center justify-between border-t border-outline-variant/20 pt-4 mt-4">
              <span className="text-xs text-on-surface-variant">
                {(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, enrollments.length)} من {enrollments.length}
              </span>
              <div className="flex items-center gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                  className="p-1.5 rounded-xl border border-outline-variant/30 hover:bg-surface-container-high disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight size={16} />
                </button>
                <span className="text-xs font-bold text-on-surface min-w-[40px] text-center">
                  {currentPage} / {Math.ceil(enrollments.length / itemsPerPage)}
                </span>
                <button
                  disabled={currentPage === Math.ceil(enrollments.length / itemsPerPage)}
                  onClick={() => setCurrentPage(p => Math.min(p + 1, Math.ceil(enrollments.length / itemsPerPage)))}
                  className="p-1.5 rounded-xl border border-outline-variant/30 hover:bg-surface-container-high disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft size={16} />
                </button>
              </div>
            </div>
          )}
        </Card>
        )}
        </>
      )}

      {/* ── Add Form ── */}
      {viewState === 'add' && (
        <Card>
          <form onSubmit={createEnrollment} className="space-y-6">

          {/* Student */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-on-surface-variant block">{t('admin.sections.users.students')} *</label>
            <div className="relative">
              <Search size={14} className={`absolute top-1/2 -translate-y-1/2 text-on-surface-variant/50 pointer-events-none ${i18n.language === 'en' ? 'left-3' : 'right-3'}`} />
              <input value={studentSearch} onChange={e => setStudentSearch(e.target.value)} placeholder={t('admin.common.search')} className={searchInputCls(i18n.language)} />
            </div>
            {form.user_id && (
              <p className="text-[11px] text-primary font-bold ps-1">✓ {students.find(s => s.id === form.user_id)?.name}</p>
            )}
            <div className="max-h-28 overflow-y-auto bg-surface-container-lowest border border-outline-variant/30 rounded-2xl custom-scrollbar">
              {students.filter(s => s.name?.toLowerCase().includes(studentSearch.toLowerCase()) || s.email?.toLowerCase().includes(studentSearch.toLowerCase())).map(s => (
                <div key={s.id} onClick={() => setForm({ ...form, user_id: s.id })}
                  className={`px-4 py-2 text-xs cursor-pointer transition-all ${form.user_id === s.id ? 'bg-primary/10 text-primary font-bold' : 'text-on-surface hover:bg-surface-container-low'}`}>
                  {s.name} <span className="text-on-surface-variant font-normal opacity-70">({s.email})</span>
                </div>
              ))}
              {students.filter(s => s.name?.toLowerCase().includes(studentSearch.toLowerCase()) || s.email?.toLowerCase().includes(studentSearch.toLowerCase())).length === 0 && (
                <div className="px-4 py-3 text-xs text-on-surface-variant text-center">لا توجد نتائج</div>
              )}
            </div>
          </div>

          {/* Course */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-on-surface-variant block">{t('admin.sections.courses')} *</label>
            <div className="relative">
              <Search size={14} className={`absolute top-1/2 -translate-y-1/2 text-on-surface-variant/50 pointer-events-none ${i18n.language === 'en' ? 'left-3' : 'right-3'}`} />
              <input value={courseSearch} onChange={e => setCourseSearch(e.target.value)} placeholder={t('admin.common.search')} className={searchInputCls(i18n.language)} />
            </div>
            {form.course_id && (
              <p className="text-[11px] text-primary font-bold ps-1">✓ {courses.find(c => c.id === form.course_id)?.[`title_${i18n.language}`] || courses.find(c => c.id === form.course_id)?.title}</p>
            )}
            <div className="max-h-28 overflow-y-auto bg-surface-container-lowest border border-outline-variant/30 rounded-2xl custom-scrollbar">
              {courses.filter(c => (c[`title_${i18n.language}`] || c.title)?.toLowerCase().includes(courseSearch.toLowerCase())).map(c => {
                const cTitle = c[`title_${i18n.language}`] || c.title;
                return (
                  <div key={c.id} onClick={() => setForm({ ...form, course_id: c.id })}
                    className={`px-4 py-2 text-xs cursor-pointer transition-all ${form.course_id === c.id ? 'bg-primary/10 text-primary font-bold' : 'text-on-surface hover:bg-surface-container-low'}`}>
                    {cTitle}
                  </div>
                );
              })}
              {courses.filter(c => (c[`title_${i18n.language}`] || c.title)?.toLowerCase().includes(courseSearch.toLowerCase())).length === 0 && (
                <div className="px-4 py-3 text-xs text-on-surface-variant text-center">لا توجد نتائج</div>
              )}
            </div>
          </div>

          {/* Features - Only show if course is selected */}
          {form.course_id && (
            <FeatureToggles values={form} onChange={(key, val) => setForm(prev => ({ ...prev, [key]: val }))} />
          )}

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-on-surface-variant block">Start Date / تاريخ البدء</label>
              <input type="date" value={form.start_date || ''} onChange={e => setForm({ ...form, start_date: e.target.value })} className={inputCls} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-on-surface-variant block">End Date / تاريخ الانتهاء</label>
              <input type="date" value={form.end_date || ''} onChange={e => setForm({ ...form, end_date: e.target.value })} className={inputCls} />
            </div>
          </div>

          {/* Paid */}
          <label className="flex items-center gap-2.5 cursor-pointer select-none group">
            <input type="checkbox" checked={form.is_paid} onChange={e => setForm({ ...form, is_paid: e.target.checked })} className="w-4 h-4 rounded accent-primary cursor-pointer" />
            <span className="text-xs font-bold text-on-surface group-hover:text-primary transition-colors">Paid Enrollment / اشتراك مدفوع</span>
          </label>

            <SubmitBtn loading={submitting} label="Add Enrollment / إضافة الاشتراك" disabled={!form.user_id || !form.course_id} />
          </form>
        </Card>
      )}

      {/* ── Edit Enrollment Form ── */}
      {viewState === 'edit' && (
        <Card>
          <form onSubmit={submitEdit} className="space-y-6">

          {/* Feature Toggles — at top for visibility */}
          <FeatureToggles
            values={editForm}
            onChange={(key, val) => setEditForm(prev => ({ ...prev, [key]: val }))}
          />

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-on-surface-variant block">Start Date / تاريخ البدء</label>
              <input
                type="date"
                value={editForm.start_date || ''}
                onChange={e => setEditForm({ ...editForm, start_date: e.target.value })}
                className="w-full px-4 py-2.5 bg-surface/80 border border-outline-variant/50 rounded-2xl text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-on-surface-variant block">End Date / تاريخ الانتهاء</label>
              <input
                type="date"
                value={editForm.end_date || ''}
                onChange={e => setEditForm({ ...editForm, end_date: e.target.value })}
                className="w-full px-4 py-2.5 bg-surface/80 border border-outline-variant/50 rounded-2xl text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
          </div>

          {/* Status */}
          <Select
            label="Status / حالة الاشتراك"
            value={editForm.status}
            onChange={e => setEditForm({ ...editForm, status: e.target.value })}
          >
            <option value="active">Active / نشط</option>
            <option value="suspended">Suspended / معلق</option>
            <option value="completed">Completed / مكتمل</option>
            <option value="dropped">Dropped / منسحب</option>
            <option value="frozen">Frozen / مجمد</option>
          </Select>

            <SubmitBtn loading={submitting} label="Save Changes / حفظ التعديلات" />
          </form>
        </Card>
      )}
    </>
  );
}
