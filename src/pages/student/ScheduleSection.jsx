import React, { useState, useEffect } from 'react';
import { Calendar, CheckCircle2, Clock, Loader2, ChevronDown, ChevronUp, BookOpen, PlayCircle } from 'lucide-react';
import API from '../../api/axios';
import { SectionHeader, Card, Input, SubmitBtn } from './SharedUI';

export default function ScheduleSection({ showMsg }) {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrollments, setEnrollments] = useState([]);
  const [form, setForm] = useState({ course_id: '', start_date: '', end_date: '', daily_hours: 4 });
  const [daysOff, setDaysOff] = useState([]);
  const [sub, setSub] = useState(false);
  const [expandedSchedule, setExpandedSchedule] = useState(null);

  const DAYS_OF_WEEK = [
    { id: 'Saturday', label: 'السبت' },
    { id: 'Sunday', label: 'الأحد' },
    { id: 'Monday', label: 'الإثنين' },
    { id: 'Tuesday', label: 'الثلاثاء' },
    { id: 'Wednesday', label: 'الأربعاء' },
    { id: 'Thursday', label: 'الخميس' },
    { id: 'Friday', label: 'الجمعة' }
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
      showMsg('success', 'تمت إضافة موعد المذاكرة بنجاح');
      setForm({ course_id: '', start_date: '', end_date: '', daily_hours: 4 });
      setDaysOff([]);
      fetchData();
    } catch { showMsg('error', 'خطأ في إضافة الموعد'); } finally { setSub(false); }
  };

  const delSchedule = async (id) => {
    try { await API.delete(`/student/schedules/${id}`); showMsg('success', 'تم الحذف'); fetchData(); } catch { showMsg('error', 'خطأ'); }
  };

  return (
    <>
      <SectionHeader title="جدول المذاكرة" count={schedules.length} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <h4 className="text-sm font-bold text-on-surface mb-4">إضافة موعد جديد</h4>
            <form onSubmit={createSchedule} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-on-surface-variant block">الكورس</label>
                <select required value={form.course_id} onChange={e => setForm({ ...form, course_id: e.target.value })} className="w-full px-4 py-2.5 bg-surface/80 border border-outline-variant/50 rounded-2xl text-sm text-on-surface">
                  <option value="">اختر الكورس</option>
                  {enrollments.map(e => <option key={e.course_id} value={e.course_id}>{e.course?.title}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input label="تاريخ البدء" type="date" required value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })} />
                <Input label="تاريخ الانتهاء" type="date" value={form.end_date} onChange={e => setForm({ ...form, end_date: e.target.value })} />
              </div>
              
              <Input label="ساعات المذاكرة اليومية" type="number" min="1" max="24" required value={form.daily_hours} onChange={e => setForm({ ...form, daily_hours: e.target.value })} />
              
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-on-surface-variant block">أيام الإجازة الأسبوعية</label>
                <div className="flex flex-wrap gap-2">
                  {DAYS_OF_WEEK.map(day => (
                    <button
                      key={day.id}
                      type="button"
                      onClick={() => handleDayToggle(day.id)}
                      className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all border ${daysOff.includes(day.id) ? 'bg-primary text-on-primary border-primary' : 'bg-surface border-outline-variant/50 text-on-surface-variant hover:border-primary/50'}`}
                    >
                      {day.label}
                    </button>
                  ))}
                </div>
              </div>

              <SubmitBtn loading={sub} label="حفظ الجدول" />
            </form>
          </Card>
        </div>
        <div className="lg:col-span-2 space-y-3">
          {loading ? <div className="py-12 flex justify-center"><Loader2 size={24} className="animate-spin text-primary" /></div> : (
            schedules.length === 0 ? (
              <Card className="text-center py-10 text-on-surface-variant">لا توجد مواعيد مذاكرة مسجلة.</Card>
            ) : (
              schedules.map(s => (
                <Card key={s.id} className="border-l-4 border-l-primary p-0 overflow-hidden">
                  <div className="p-5 flex items-center justify-between">
                    <div>
                      <h4 className="text-base font-bold text-on-surface mb-2">{s.course?.title || 'كورس غير معروف'}</h4>
                      <div className="flex flex-wrap gap-x-4 gap-y-2 mt-1">
                        <p className="text-xs text-on-surface-variant flex items-center gap-1.5"><Calendar size={14}/> يبدأ: {new Date(s.start_date).toLocaleDateString('ar-EG')}</p>
                        {s.end_date && <p className="text-xs text-on-surface-variant flex items-center gap-1.5"><CheckCircle2 size={14}/> ينتهي: {new Date(s.end_date).toLocaleDateString('ar-EG')}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => setExpandedSchedule(expandedSchedule === s.id ? null : s.id)}
                        className="px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary/20 rounded-xl transition-colors text-xs font-bold flex items-center gap-1"
                      >
                        الخطة الدراسية {expandedSchedule === s.id ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
                      </button>
                      <button onClick={() => delSchedule(s.id)} className="p-1.5 text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors text-xs font-bold" title="حذف الجدول">
                         <Clock size={18} className="hidden" /> {/* just for padding spacing */}
                         حذف
                      </button>
                    </div>
                  </div>

                  {/* Plan Details / Timeline */}
                  {expandedSchedule === s.id && (
                    <div className="border-t border-outline-variant/20 bg-surface/50 p-5 font-['Tajawal']">
                      <h5 className="text-sm font-bold text-primary mb-4 flex items-center gap-2">
                        <Calendar size={16} /> توزيع الخطة الدراسية
                      </h5>
                      {(() => {
                        let plan = [];
                        if (Array.isArray(s.plan)) plan = s.plan;
                        else if (typeof s.plan === 'string') {
                          try { plan = JSON.parse(s.plan); } catch (e) {}
                        }
                        
                        if (!plan || plan.length === 0) {
                          return <div className="text-xs text-on-surface-variant text-center py-4 bg-surface rounded-xl">لا توجد تفاصيل خطة لهذا الموعد. الرجاء إنشاء خطة جديدة لتطبيق النظام المتقدم.</div>;
                        }

                        const daysMapAr = {
                          'Sunday': 'الأحد', 'Monday': 'الإثنين', 'Tuesday': 'الثلاثاء',
                          'Wednesday': 'الأربعاء', 'Thursday': 'الخميس', 'Friday': 'الجمعة', 'Saturday': 'السبت'
                        };

                        return (
                          <div className="space-y-4">
                            {plan.map((dayPlan, idx) => (
                              <div key={idx} className="relative pl-6 sm:pl-0 sm:pr-8">
                                {/* Timeline Line */}
                                <div className="absolute right-[11px] sm:right-3 top-2 bottom-[-16px] w-px bg-outline-variant/40 hidden sm:block"></div>
                                <div className="absolute right-[11px] sm:right-3 top-2 bottom-[-16px] w-px bg-outline-variant/40 block sm:hidden left-[11px]"></div>
                                
                                {/* Timeline Dot */}
                                <div className="absolute right-0 sm:right-[5px] top-2 w-3 h-3 rounded-full bg-primary ring-4 ring-surface hidden sm:block"></div>
                                <div className="absolute left-0 sm:left-auto top-2 w-3 h-3 rounded-full bg-primary ring-4 ring-surface block sm:hidden"></div>
                                
                                <div className="bg-white rounded-2xl border border-outline-variant/30 p-4 shadow-sm hover:shadow-md transition-shadow">
                                  <div className="flex items-center justify-between mb-3 border-b border-outline-variant/20 pb-2">
                                    <h6 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                      <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-md">{daysMapAr[dayPlan.dayName] || dayPlan.dayName}</span>
                                      <span>{new Date(dayPlan.date).toLocaleDateString('ar-EG', { month: 'long', day: 'numeric' })}</span>
                                    </h6>
                                    <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">{dayPlan.lessons?.length || 0} دروس</span>
                                  </div>
                                  
                                  <div className="space-y-2">
                                    {dayPlan.lessons?.map((lsn, lIdx) => (
                                      <div key={lIdx} className="flex flex-col sm:flex-row sm:items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100 gap-2">
                                        <div className="flex items-center gap-2 overflow-hidden">
                                          <PlayCircle size={14} className="text-primary shrink-0" />
                                          <span className="text-xs font-semibold text-slate-700 truncate" title={lsn.lessonTitle}>{lsn.lessonTitle}</span>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0 pr-6 sm:pr-0">
                                          <span className="text-[10px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200 truncate max-w-[120px]">{lsn.moduleName}</span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </Card>
              ))
            )
          )}
        </div>
      </div>
    </>
  );
}
