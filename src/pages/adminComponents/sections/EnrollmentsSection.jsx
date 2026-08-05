import React, { useState, useEffect } from 'react';
import API from '../../../api/axios';
import { Loader2, Search } from 'lucide-react';
import { SectionHeader, Card, statusBadge, Modal, SubmitBtn } from '../ui/SharedUI';

export default function EnrollmentsSection({ showMsg }) {
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
      showMsg('success', 'تم إضافة الاشتراك بنجاح');
      setShowAdd(false);
      setForm({ user_id: '', course_id: '', is_paid: false });
      fetchData();
    } catch (err) {
      showMsg('error', err.response?.data?.message || 'خطأ في إضافة الاشتراك');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <SectionHeader 
        title="اشتراكات الطلاب" 
        count={enrollments.length} 
        onAdd={() => setShowAdd(true)} 
        addLabel="اشتراك جديد" 
      />
      {loading ? <div className="py-12 flex justify-center"><Loader2 size={24} className="animate-spin text-primary" /></div> : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs sm:text-sm border-separate border-spacing-y-1">
              <thead><tr className="text-on-surface-variant/70">
                <th className="p-3">الطالب</th><th className="p-3">الكورس</th><th className="p-3">الحالة</th><th className="p-3">التقدم</th><th className="p-3">تاريخ الاشتراك</th>
              </tr></thead>
              <tbody>{enrollments.map(e => (
                <tr key={e.id} className="bg-surface/50 hover:bg-surface/80 transition-all">
                  <td className="p-3 font-bold text-on-surface">{e.student?.name || '—'}</td>
                  <td className="p-3 text-on-surface-variant">{e.course?.title || '—'}</td>
                  <td className="p-3">{statusBadge(e.status)}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 rounded-full bg-outline-variant/20 overflow-hidden"><div className="h-full rounded-full bg-primary" style={{ width: `${e.progress || 0}%` }} /></div>
                      <span className="text-xs font-bold text-on-surface-variant">{Math.round(e.progress || 0)}%</span>
                    </div>
                  </td>
                  <td className="p-3 text-xs text-on-surface-variant">{new Date(e.enrollment_date).toLocaleDateString('ar-EG')}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Add Enrollment Modal */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="إضافة اشتراك جديد">
        <form onSubmit={createEnrollment} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-on-surface-variant block">اختر الطالب *</label>
            <div className="relative">
              <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50" />
              <input 
                value={studentSearch} 
                onChange={e => setStudentSearch(e.target.value)} 
                placeholder="ابحث عن اسم الطالب أو الإيميل..." 
                className="w-full pr-8 pl-4 py-2 bg-surface/80 border border-outline-variant/50 rounded-2xl text-sm text-on-surface focus:outline-none focus:border-primary transition-all" 
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
                <div className="p-2 text-xs text-on-surface-variant text-center">لا توجد نتائج</div>
              )}
            </div>
          </div>
          
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-on-surface-variant block">اختر الكورس *</label>
            <div className="relative">
              <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50" />
              <input 
                value={courseSearch} 
                onChange={e => setCourseSearch(e.target.value)} 
                placeholder="ابحث عن عنوان الكورس..." 
                className="w-full pr-8 pl-4 py-2 bg-surface/80 border border-outline-variant/50 rounded-2xl text-sm text-on-surface focus:outline-none focus:border-primary transition-all" 
              />
            </div>
            <div className="max-h-40 overflow-y-auto bg-surface-container-lowest border border-outline-variant/30 rounded-xl custom-scrollbar mt-1">
              {courses
                .filter(c => c.title?.toLowerCase().includes(courseSearch.toLowerCase()))
                .map(c => (
                <div 
                  key={c.id} 
                  onClick={() => setForm({ ...form, course_id: c.id })} 
                  className={`p-2 text-xs cursor-pointer hover:bg-surface-container-low transition-all ${form.course_id === c.id ? 'bg-primary/10 text-primary font-bold' : 'text-on-surface'}`}
                >
                  {c.title}
                </div>
              ))}
              {courses.filter(c => c.title?.toLowerCase().includes(courseSearch.toLowerCase())).length === 0 && (
                <div className="p-2 text-xs text-on-surface-variant text-center">لا توجد نتائج</div>
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
            <label htmlFor="is_paid" className="text-xs font-bold text-on-surface cursor-pointer select-none">اشتراك مدفوع (تجاوز الدفع)</label>
          </div>

          <SubmitBtn loading={submitting} label="إضافة الاشتراك" disabled={!form.user_id || !form.course_id} />
        </form>
      </Modal>
    </>
  );
}
