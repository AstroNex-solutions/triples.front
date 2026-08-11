import React, { useState, useEffect } from 'react';
import { Calendar, CheckCircle2, Clock, Loader2, ChevronDown, ChevronUp, BookOpen, PlayCircle, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import API from '../../api/axios';
import { SectionHeader, Card, Input, SubmitBtn } from './SharedUI';

export default function ScheduleSection({ showMsg }) {
  const { t, i18n } = useTranslation();
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrollments, setEnrollments] = useState([]);
  const [form, setForm] = useState({ course_id: '', start_date: '', end_date: '', daily_hours: 4 });
  const [daysOff, setDaysOff] = useState([]);
  const [sub, setSub] = useState(false);

  const DAYS_OF_WEEK = [
    { id: 'Saturday', label: t('student.schedule.days.Saturday') },
    { id: 'Sunday', label: t('student.schedule.days.Sunday') },
    { id: 'Monday', label: t('student.schedule.days.Monday') },
    { id: 'Tuesday', label: t('student.schedule.days.Tuesday') },
    { id: 'Wednesday', label: t('student.schedule.days.Wednesday') },
    { id: 'Thursday', label: t('student.schedule.days.Thursday') },
    { id: 'Friday', label: t('student.schedule.days.Friday') }
  ];

  const handleDayToggle = (dayId) => {
    setDaysOff(prev => 
      prev.includes(dayId) ? prev.filter(d => d !== dayId) : [...prev, dayId]
    );
  };

  const fetchData = () => {
    setLoading(true);
    Promise.all([API.get('/student/schedules'), API.get('/student/enrollments')])
      .then(([s, e]) => { setSchedules(s.data.schedules); setEnrollments(e.data.enrollments); })
      .catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const createSchedule = async (e) => {
    e.preventDefault(); setSub(true);
    try {
      await API.post('/student/schedules', { ...form, days_off: daysOff });
      showMsg('success', t('student.schedule.addSuccess'));
      setForm({ course_id: '', start_date: '', end_date: '', daily_hours: 4 });
      setDaysOff([]);
      fetchData();
    } catch { 
      showMsg('error', t('student.schedule.addError')); 
    } finally { 
      setSub(false); 
    }
  };

  const delSchedule = async (id) => {
    try { 
      await API.delete(`/student/schedules/${id}`); 
      showMsg('success', t('student.schedule.deleteSuccess')); 
      fetchData(); 
    } catch { 
      showMsg('error', 'Error'); 
    }
  };

  return (
    <>
      <SectionHeader title={t('student.schedule.title')} count={schedules.length} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <h4 className="text-sm font-bold text-on-surface mb-4">{t('student.schedule.addNew')}</h4>
            <form onSubmit={createSchedule} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-on-surface-variant block">{t('student.schedule.course')}</label>
                <select required value={form.course_id} onChange={e => setForm({ ...form, course_id: e.target.value })} className="w-full px-4 py-2.5 bg-surface/80 border border-outline-variant/50 rounded-2xl text-sm text-on-surface">
                  <option value="">{t('student.schedule.selectCourse')}</option>
                  {enrollments.map(e => (
                    <option key={e.course_id} value={e.course_id}>
                      {e.course?.[`title_${i18n.language}`] || e.course?.title}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input label={t('student.schedule.startDate')} type="date" required value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })} />
                <Input label={t('student.schedule.endDate')} type="date" value={form.end_date} onChange={e => setForm({ ...form, end_date: e.target.value })} />
              </div>
              
              <Input label={t('student.schedule.dailyHours')} type="number" min="1" max="24" required value={form.daily_hours} onChange={e => setForm({ ...form, daily_hours: e.target.value })} />
              
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-on-surface-variant block">{t('student.schedule.daysOff')}</label>
                <div className="flex flex-wrap gap-2">
                  {DAYS_OF_WEEK.map(day => (
                    <button
                      key={day.id}
                      type="button"
                      onClick={() => handleDayToggle(day.id)}
                      className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all border cursor-pointer ${daysOff.includes(day.id) ? 'bg-primary text-on-primary border-primary' : 'bg-surface border-outline-variant/50 text-on-surface-variant hover:border-primary/50'}`}
                    >
                      {day.label}
                    </button>
                  ))}
                </div>
              </div>

              <SubmitBtn loading={sub} label={t('student.schedule.saveSchedule')} />
            </form>
          </Card>
        </div>
        <div className="lg:col-span-2 space-y-3">
          {loading ? <div className="py-12 flex justify-center"><Loader2 size={24} className="animate-spin text-primary" /></div> : (
            schedules.length === 0 ? (
              <Card className="text-center py-10 text-on-surface-variant">{t('student.schedule.empty')}</Card>
            ) : (
              schedules.map(s => {
                const title = s.course?.[`title_${i18n.language}`] || s.course?.title;
                return (
                  <Card key={s.id} className="flex items-center justify-between p-4">
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-on-surface">{title}</h4>
                      <p className="text-xs text-on-surface-variant">
                        {s.daily_hours} hrs/day • {s.start_date} → {s.end_date || 'N/A'}
                      </p>
                    </div>
                    <button onClick={() => delSchedule(s.id)} className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all cursor-pointer">
                      <Trash2 size={18} />
                    </button>
                  </Card>
                );
              })
            )
          )}
        </div>
      </div>
    </>
  );
}
