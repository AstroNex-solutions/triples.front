import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
  const [selectedModules, setSelectedModules] = useState([]);
  const [sub, setSub] = useState(false);
  const [expandedScheduleId, setExpandedScheduleId] = useState(null);

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
      await API.post('/student/schedules', { ...form, days_off: daysOff, module_ids: selectedModules });
      showMsg('success', t('student.schedule.addSuccess'));
      setForm({ course_id: '', start_date: '', end_date: '', daily_hours: 4 });
      setDaysOff([]);
      setSelectedModules([]);
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
                <select 
                  required 
                  value={form.course_id} 
                  onChange={e => {
                    setForm({ ...form, course_id: e.target.value });
                    setSelectedModules([]);
                  }} 
                  className="w-full px-4 py-2.5 bg-surface/80 border border-outline-variant/50 rounded-2xl text-sm text-on-surface"
                >
                  <option value="">{t('student.schedule.selectCourse')}</option>
                  {enrollments.map(e => (
                    <option key={e.course_id} value={e.course_id}>
                      {e.course?.[`title_${i18n.language}`] || e.course?.title}
                    </option>
                  ))}
                </select>
              </div>

              {form.course_id && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-on-surface-variant block">اختر الموديولات (اختياري)</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 border border-outline-variant/30 rounded-xl bg-surface/50">
                    {enrollments.find(e => e.course_id == form.course_id)?.course?.modules?.map(mod => (
                      <label key={mod.id} className="flex items-center gap-2 text-xs text-on-surface cursor-pointer p-1.5 hover:bg-surface rounded-lg transition-colors">
                        <input 
                          type="checkbox" 
                          checked={selectedModules.includes(mod.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedModules([...selectedModules, mod.id]);
                            } else {
                              setSelectedModules(selectedModules.filter(id => id !== mod.id));
                            }
                          }}
                          className="rounded text-primary focus:ring-primary/20"
                        />
                        <span className="line-clamp-1" title={ mod.name}>{mod.name}</span>
                      </label>
                    ))}
                    {(!enrollments.find(e => e.course_id == form.course_id)?.course?.modules || enrollments.find(e => e.course_id == form.course_id)?.course?.modules.length === 0) && (
                      <span className="text-xs text-on-surface-variant col-span-2 text-center py-2">لا توجد موديولات متاحة</span>
                    )}
                  </div>
                  <p className="text-[10px] text-on-surface-variant">إذا لم تختر أي موديول، سيتم جدولة جميع موديولات الكورس.</p>
                </div>
              )}
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
                const isExpanded = expandedScheduleId === s.id;
                let parsedPlan = [];
                try {
                  if (s.plan) parsedPlan = JSON.parse(s.plan);
                } catch (e) {}

                return (
                  <Card key={s.id} className="p-4 flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold text-on-surface">{title}</h4>
                        <p className="text-xs text-on-surface-variant">
                          {s.daily_hours} hrs/day • {s.start_date} → {s.end_date || 'N/A'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {parsedPlan.length > 0 && (
                          <button 
                            onClick={() => setExpandedScheduleId(isExpanded ? null : s.id)}
                            className="text-xs text-primary bg-primary/10 hover:bg-primary/20 px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1"
                          >
                            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            {isExpanded ? 'إخفاء الخطة' : 'عرض الخطة'}
                          </button>
                        )}
                        <button onClick={() => delSchedule(s.id)} className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all cursor-pointer" title="حذف الجدول">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>

                    {isExpanded && parsedPlan.length > 0 && (
                      <div className="mt-2 pt-4 border-t border-outline-variant/30 space-y-3">
                        {parsedPlan.map((day, idx) => (
                          <div key={idx} className="bg-surface rounded-xl border border-outline-variant/40 overflow-hidden">
                            <div className="bg-surface-container px-3 py-2 border-b border-outline-variant/40 flex items-center justify-between">
                              <span className="text-xs font-bold text-on-surface flex items-center gap-1.5">
                                <Calendar size={14} className="text-primary" />
                                {day.date} ({day.dayName})
                              </span>
                              <span className="text-[10px] text-on-surface-variant font-bold">
                                {day.lessons?.length || 0} درس
                              </span>
                            </div>
                            <div className="p-2 space-y-1">
                              {day.lessons && day.lessons.length > 0 ? day.lessons.map((lesson, lIdx) => (
                                <Link 
                                  to={`/learn/${s.course_id}/lesson/${lesson.lessonId}`} 
                                  key={lIdx} 
                                  className="flex items-center justify-between text-xs py-1.5 px-2 hover:bg-surface-container-low rounded-lg transition-colors group cursor-pointer block"
                                >
                                  <div className="flex items-center gap-2">
                                    <PlayCircle size={14} className="text-primary/70 shrink-0 group-hover:text-primary transition-colors" />
                                    <span className="text-on-surface font-medium truncate max-w-[200px] group-hover:text-primary transition-colors" title={lesson.lessonTitle}>
                                      {lesson.lessonTitle}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-3 text-[10px] text-on-surface-variant shrink-0">
                                    <span className="bg-surface-container px-1.5 py-0.5 rounded-md truncate max-w-[100px]" title={lesson.moduleName}>
                                      {lesson.moduleName}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <Clock size={12} />
                                      {Math.round(lesson.duration / 60)} د
                                    </span>
                                  </div>
                                </Link>
                              )) : (
                                <p className="text-xs text-on-surface-variant text-center py-2">لا توجد دروس في هذا اليوم</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
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
