import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, Loader2, ChevronDown, ChevronUp, PlayCircle, Trash2, CalendarDays, CalendarRange, Layers, Plus, X, BookOpen } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import API from '../../api/axios';
import { SectionHeader, Card, Input, SubmitBtn } from './SharedUI';
import { useOutletContext } from 'react-router-dom';

export default function ScheduleSection() {
  const { showMsg } = useOutletContext();
  const { t, i18n } = useTranslation();
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrollments, setEnrollments] = useState([]);
  const [form, setForm] = useState({ course_id: '', start_date: '', end_date: '', daily_hours: 4 });
  const [daysOff, setDaysOff] = useState([]);
  const [selectedModules, setSelectedModules] = useState([]);
  const [sub, setSub] = useState(false);
  const [expandedScheduleId, setExpandedScheduleId] = useState(null);
  const [activeTabView, setActiveTabView] = useState('days'); // 'days', 'weeks', 'months'
  const [isFormOpen, setIsFormOpen] = useState(false);

  const DAYS_OF_WEEK = [
    { id: 'Saturday', label: t('studentDashboard.schedule.days.Saturday') },
    { id: 'Sunday', label: t('studentDashboard.schedule.days.Sunday') },
    { id: 'Monday', label: t('studentDashboard.schedule.days.Monday') },
    { id: 'Tuesday', label: t('studentDashboard.schedule.days.Tuesday') },
    { id: 'Wednesday', label: t('studentDashboard.schedule.days.Wednesday') },
    { id: 'Thursday', label: t('studentDashboard.schedule.days.Thursday') },
    { id: 'Friday', label: t('studentDashboard.schedule.days.Friday') }
  ];

  const handleDayToggle = (dayId) => {
    setDaysOff(prev => prev.includes(dayId) ? prev.filter(d => d !== dayId) : [...prev, dayId]);
  };

  const fetchData = () => {
    setLoading(true);
    Promise.all([API.get('/student/schedules'), API.get('/student/enrollments')])
      .then(([s, e]) => { setSchedules(s.data.schedules); setEnrollments(e.data.enrollments); })
      .catch(console.error).finally(() => setLoading(false));
  };

  const toggleLessonComplete = async (e, schedule, dateStr, lessonId, currentStatus) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      let parsedPlan = schedule.plan;
      while (typeof parsedPlan === 'string') {
        parsedPlan = JSON.parse(parsedPlan);
      }
      if (!Array.isArray(parsedPlan)) parsedPlan = [];

      const updatedPlan = parsedPlan.map(day => {
        if (day.date === dateStr) {
          return {
            ...day,
            lessons: day.lessons.map(l => l.lessonId === lessonId ? { ...l, isCompleted: !currentStatus } : l)
          };
        }
        return day;
      });
      
      setSchedules(prev => prev.map(s => s.id === schedule.id ? { ...s, plan: updatedPlan } : s));
      await API.put(`/student/schedules/${schedule.id}`, { plan: updatedPlan });
    } catch(err) {
      console.error(err);
      fetchData(); // rollback
    }
  };

  useEffect(() => { fetchData(); }, []);

  const createSchedule = async (e) => {
    e.preventDefault(); setSub(true);
    try {
      await API.post('/student/schedules', { ...form, days_off: daysOff, module_ids: selectedModules });
      showMsg('success', t('studentDashboard.shared.success'));
      setForm({ course_id: '', start_date: '', end_date: '', daily_hours: 4 });
      setDaysOff([]);
      setSelectedModules([]);
      setIsFormOpen(false);
      fetchData();
    } catch { 
      showMsg('error', t('studentDashboard.shared.error')); 
    } finally { 
      setSub(false); 
    }
  };

  const delSchedule = async (id) => {
    try { 
      await API.delete(`/student/schedules/${id}`); 
      showMsg('success', t('studentDashboard.shared.success')); 
      fetchData(); 
    } catch { 
      showMsg('error', 'Error'); 
    }
  };

  // Grouping logic for the schedule plan
  const groupPlan = (plan, view) => {
    if (!plan || plan.length === 0) return [];
    
    if (view === 'days') return plan; // Already grouped by days

    if (view === 'weeks') {
      const weeks = [];
      let currentWeek = { label: 'Week 1', days: [], totalLessons: 0 };
      plan.forEach((day, index) => {
        currentWeek.days.push(day);
        currentWeek.totalLessons += (day.lessons?.length || 0);
        
        // Break week every 7 days or if it's the last day
        if ((index + 1) % 7 === 0 || index === plan.length - 1) {
          weeks.push(currentWeek);
          currentWeek = { label: `Week ${weeks.length + 1}`, days: [], totalLessons: 0 };
        }
      });
      return weeks;
    }

    if (view === 'months') {
      const monthsMap = {};
      plan.forEach(day => {
        const dateObj = new Date(day.date);
        const monthKey = `${dateObj.toLocaleString('en-US', { month: 'long' })} ${dateObj.getFullYear()}`;
        if (!monthsMap[monthKey]) monthsMap[monthKey] = { label: monthKey, days: [], totalLessons: 0 };
        monthsMap[monthKey].days.push(day);
        monthsMap[monthKey].totalLessons += (day.lessons?.length || 0);
      });
      return Object.values(monthsMap);
    }
  };

  // Organize modules and sub-modules
  const selectedCourseEnrollment = form.course_id ? enrollments.find(e => e.course_id == form.course_id) : null;
  const courseModules = selectedCourseEnrollment?.course?.modules || [];
  
  // Assuming a parent-child relationship via `submodule_id`
  const topLevelModules = courseModules.filter(m => !m.submodule_id);
  const getSubModules = (parentId) => courseModules.filter(m => m.submodule_id === parentId);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <SectionHeader title={t('studentDashboard.schedule.title')} count={schedules.length} />
        <button 
          onClick={() => setIsFormOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary rounded-xl font-bold text-sm shadow-md hover:-translate-y-1 transition-all"
        >
          <Plus size={18} />
          {t('studentDashboard.schedule.addNew')}
        </button>
      </div>

      {isFormOpen && (
        <Card className="animate-in fade-in slide-in-from-top-4 duration-300 relative border-primary/30 shadow-lg">
          <button 
            onClick={() => setIsFormOpen(false)}
            className="absolute top-4 right-4 p-2 text-on-surface-variant hover:text-rose-500 hover:bg-rose-500/10 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
          
          <h4 className="text-xl font-black text-on-surface mb-6 flex items-center gap-2">
            <CalendarDays size={24} className="text-primary" />
            {t('studentDashboard.schedule.addNew')}
          </h4>
          
          <form onSubmit={createSchedule} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-sm font-bold text-on-surface-variant block">{t('studentDashboard.schedule.course')}</label>
                <select 
                  required 
                  value={form.course_id} 
                  onChange={e => {
                    setForm({ ...form, course_id: e.target.value });
                    setSelectedModules([]);
                  }} 
                  className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/50 rounded-2xl text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                >
                  <option value="">{t('student.schedule.selectCourse') || 'Choose a course...'}</option>
                  {enrollments.map(e => (
                    <option key={e.course_id} value={e.course_id}>
                      {e.course?.[`title_${i18n.language}`] || e.course?.title}
                    </option>
                  ))}
                </select>
              </div>

              {form.course_id && (
                <div className="space-y-3 md:col-span-2">
                  <label className="text-sm font-bold text-on-surface-variant block">{t('studentDashboard.schedule.modules')}</label>
                  <div className="border border-outline-variant/30 rounded-2xl bg-surface overflow-hidden max-h-72 overflow-y-auto custom-scrollbar shadow-sm">
                    {topLevelModules.length > 0 ? (
                      <div className="flex flex-col p-2 gap-2">
                        {topLevelModules.map(mod => {
                          const children = getSubModules(mod.id);
                          const isParentSelected = selectedModules.includes(mod.id);
                          const isAllSelected = isParentSelected && (children.length === 0 || children.every(c => selectedModules.includes(c.id)));
                          
                          return (
                            <div key={mod.id} className={`rounded-xl border transition-all duration-300 overflow-hidden ${isParentSelected ? 'border-primary/40 bg-primary/5' : 'border-outline-variant/30 hover:border-outline-variant/60 bg-surface'}`}>
                              {/* Parent Module */}
                              <label className="flex items-center gap-3 p-3 sm:p-4 cursor-pointer">
                                <input 
                                  type="checkbox" 
                                  checked={isParentSelected}
                                  onChange={(e) => {
                                    const isChecked = e.target.checked;
                                    const childIds = children.map(c => c.id);
                                    if (isChecked) {
                                      setSelectedModules(prev => [...new Set([...prev, mod.id, ...childIds])]);
                                    } else {
                                      setSelectedModules(prev => prev.filter(id => id !== mod.id && !childIds.includes(id)));
                                    }
                                  }}
                                  className="w-5 h-5 rounded text-primary focus:ring-primary/20 border-outline-variant cursor-pointer"
                                />
                                <div className="flex flex-col flex-1">
                                  <span className="text-sm font-black text-on-surface">{mod.name}</span>
                                  {children.length > 0 && (
                                    <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mt-0.5">
                                      {children.length} Sub-modules
                                    </span>
                                  )}
                                </div>
                                {children.length > 0 && (
                                  <div className={`p-1.5 rounded-lg transition-colors ${isParentSelected ? 'bg-primary/10 text-primary' : 'bg-surface-variant text-on-surface-variant'}`}>
                                    <ChevronDown size={16} className={`transition-transform duration-300 ${isParentSelected ? 'rotate-180' : ''}`} />
                                  </div>
                                )}
                              </label>
                              
                              {/* Sub-modules (Only visible if parent is selected) */}
                              {isParentSelected && children.length > 0 && (
                                <div className="bg-surface border-t border-primary/20 p-3 sm:p-4 animate-in slide-in-from-top-2 fade-in duration-300">
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {children.map((sub) => (
                                      <label key={sub.id} className={`flex items-center gap-3 py-2.5 px-3 rounded-lg cursor-pointer transition-colors border ${selectedModules.includes(sub.id) ? 'bg-primary/10 border-primary/30 text-primary' : 'bg-surface-container-low border-outline-variant/30 hover:border-outline-variant/60 text-on-surface'}`}>
                                        <input 
                                          type="checkbox" 
                                          checked={selectedModules.includes(sub.id)}
                                          onChange={(e) => {
                                            if (e.target.checked) setSelectedModules(prev => [...new Set([...prev, sub.id])]);
                                            else setSelectedModules(prev => prev.filter(id => id !== sub.id));
                                          }}
                                          className="w-4 h-4 rounded text-primary focus:ring-primary/20 border-outline-variant cursor-pointer"
                                        />
                                        <span className="text-xs font-bold line-clamp-1 flex-1">{sub.name}</span>
                                      </label>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-sm text-on-surface-variant italic">No modules available for this course.</div>
                    )}
                  </div>
                  <p className="text-xs text-on-surface-variant flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                    {t('studentDashboard.schedule.modulesHint')}
                  </p>
                </div>
              )}

              <Input label={t('studentDashboard.schedule.startDate')} type="date" required value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })} />
              <Input label={t('studentDashboard.schedule.endDate')} type="date" required value={form.end_date} onChange={e => setForm({ ...form, end_date: e.target.value })} />
              
              <div className="md:col-span-2">
                <Input label={t('student.schedule.dailyHours') || 'Daily Study Hours'} type="number" min="1" max="24" required value={form.daily_hours} onChange={e => setForm({ ...form, daily_hours: e.target.value })} />
              </div>
              
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-bold text-on-surface-variant block">{t('student.schedule.daysOff') || 'Days Off (Rest Days)'}</label>
                <div className="flex flex-wrap gap-2">
                  {DAYS_OF_WEEK.map(day => (
                    <button
                      key={day.id}
                      type="button"
                      onClick={() => handleDayToggle(day.id)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border-2 cursor-pointer ${daysOff.includes(day.id) ? 'bg-primary text-on-primary border-primary shadow-md' : 'bg-surface border-outline-variant/30 text-on-surface-variant hover:border-primary/50 hover:bg-surface-variant/30'}`}
                    >
                      {day.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-outline-variant/30">
              <button 
                type="button" 
                onClick={() => {
                  setForm({ course_id: '', start_date: '', end_date: '', daily_hours: 4 });
                  setSelectedModules([]);
                  setDaysOff([]);
                  setIsFormOpen(false);
                }}
                className="px-6 py-2.5 rounded-xl font-bold text-sm text-on-surface-variant bg-surface border border-outline-variant/30 hover:bg-surface-container-high transition-colors"
              >
                Cancel
              </button>
              <SubmitBtn loading={sub} label={t('studentDashboard.schedule.saveSchedule')} />
            </div>
          </form>
        </Card>
      )}

      {/* Schedules List */}
      <div className="space-y-6">
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center bg-surface rounded-3xl border border-outline-variant/30">
            <Loader2 size={40} className="animate-spin text-primary mb-4" />
            <p className="text-sm font-bold text-on-surface-variant">{t('studentDashboard.shared.loading')}</p>
          </div>
        ) : schedules.length === 0 ? (
          <Card className="text-center py-20 flex flex-col items-center justify-center">
            <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
              <Calendar size={40} />
            </div>
            <h3 className="text-xl font-bold text-on-surface mb-2">{t('studentDashboard.schedule.noSchedules')}</h3>
            <p className="text-on-surface-variant text-sm max-w-sm">{t('studentDashboard.schedule.noSchedulesDesc')}</p>
          </Card>
        ) : (
          schedules.map(s => {
            const title = s.course?.[`title_${i18n.language}`] || s.course?.title;
            const isExpanded = expandedScheduleId === s.id;
            let parsedPlan = [];
            try { 
              if (s.plan) {
                let parsed = s.plan;
                while (typeof parsed === 'string') {
                  parsed = JSON.parse(parsed);
                }
                parsedPlan = Array.isArray(parsed) ? parsed : [];
              }
            } catch (e) {}
            
            let totalLessons = 0;
            let completedLessons = 0;
            parsedPlan.forEach(d => {
              if(d.lessons) {
                totalLessons += d.lessons.length;
                completedLessons += d.lessons.filter(l => l.isCompleted).length;
              }
            });
            const progress = totalLessons === 0 ? 0 : Math.round((completedLessons / totalLessons) * 100);

            return (
              <Card key={s.id} className="overflow-hidden border-outline-variant/40 hover:border-primary/30 transition-all p-0">
                {/* Header */}
                <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface-container-low/50">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <BookOpen size={24} />
                    </div>
                    <div className="flex-1 max-w-xl">
                      <h4 className="text-lg font-black text-on-surface leading-tight mb-1">{title}</h4>
                      <p className="text-xs font-bold text-on-surface-variant flex flex-wrap items-center gap-2 mb-2">
                        <span className="flex items-center gap-1"><Clock size={14} /> {s.daily_hours} hrs/day</span>
                        <span>•</span>
                        <span className="flex items-center gap-1"><CalendarDays size={14} /> {s.start_date} {s.end_date ? `→ ${s.end_date}` : ''}</span>
                      </p>
                      
                      {/* Progress Bar */}
                      <div className="w-full flex items-center gap-3">
                        <div className="flex-1 h-2 bg-outline-variant/30 rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
                        </div>
                        <span className="text-xs font-bold text-primary">{progress}%</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={() => delSchedule(s.id)} className="p-2.5 text-rose-500 bg-surface hover:bg-rose-500/10 border border-outline-variant/30 rounded-xl transition-all cursor-pointer shadow-sm" title="Delete Schedule">
                      <Trash2 size={18} />
                    </button>
                    <button 
                      onClick={() => {
                        setExpandedScheduleId(isExpanded ? null : s.id);
                        setActiveTabView('days');
                      }}
                      className={`px-4 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm flex items-center gap-2 cursor-pointer ${isExpanded ? 'bg-surface-variant text-on-surface-variant' : 'bg-primary text-on-primary hover:-translate-y-0.5'}`}
                    >
                      {isExpanded ? t('studentDashboard.schedule.hidePlan', 'Hide Plan') : t('studentDashboard.schedule.viewPlan', 'View Plan')}
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                  </div>
                </div>

                {/* Expanded Plan View */}
                {isExpanded && (
                  <div className="border-t border-outline-variant/30 bg-surface">
                    {parsedPlan.length === 0 ? (
                      <div className="p-10 text-center text-on-surface-variant font-bold text-sm bg-surface-container-low/30">
                        {t('studentDashboard.schedule.noLessons', 'No lessons scheduled for this day.')}
                      </div>
                    ) : (
                      <>
                        {/* View Controls (Days, Weeks, Months) */}
                        <div className="p-4 border-b border-outline-variant/20 flex flex-wrap items-center gap-2 bg-surface-container-low/30">
                      <span className="text-xs font-bold text-on-surface-variant mr-2">View by:</span>
                      <button onClick={() => setActiveTabView('days')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-2 ${activeTabView === 'days' ? 'bg-primary text-on-primary' : 'bg-surface border border-outline-variant/40 text-on-surface-variant hover:border-primary/40'}`}>
                        <Calendar size={14} /> Days
                      </button>
                      <button onClick={() => setActiveTabView('weeks')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-2 ${activeTabView === 'weeks' ? 'bg-primary text-on-primary' : 'bg-surface border border-outline-variant/40 text-on-surface-variant hover:border-primary/40'}`}>
                        <Layers size={14} /> Weeks
                      </button>
                      <button onClick={() => setActiveTabView('months')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-2 ${activeTabView === 'months' ? 'bg-primary text-on-primary' : 'bg-surface border border-outline-variant/40 text-on-surface-variant hover:border-primary/40'}`}>
                        <CalendarRange size={14} /> Months
                      </button>
                    </div>

                    <div className="p-6 space-y-6 max-h-[600px] overflow-y-auto custom-scrollbar">
                      {/* --- DAYS VIEW --- */}
                      {activeTabView === 'days' && groupPlan(parsedPlan, 'days').map((day, idx) => (
                        <div key={idx} className="bg-surface rounded-2xl border border-outline-variant/30 overflow-hidden shadow-sm">
                          <div className="bg-primary/5 px-4 py-3 border-b border-primary/10 flex items-center justify-between">
                            <span className="text-sm font-black text-primary flex items-center gap-2">
                              <CalendarDays size={16} />
                              {day.date} <span className="opacity-70 font-medium text-xs">({day.dayName})</span>
                            </span>
                            <span className="text-xs font-bold text-primary/70 bg-primary/10 px-2.5 py-1 rounded-lg">
                              {day.lessons?.length || 0} Lessons
                            </span>
                          </div>
                          <div className="p-2 space-y-1 bg-surface-container-low/30">
                            {day.lessons && day.lessons.length > 0 ? day.lessons.map((lesson, lIdx) => (
                              <Link 
                                to={`/learn/${s.course_id}/lesson/${lesson.lessonId}`} 
                                key={lIdx} 
                                className={`flex items-center justify-between px-4 py-3 bg-surface hover:bg-surface-variant/40 border border-transparent hover:border-outline-variant/40 rounded-xl transition-all group ${lesson.isCompleted ? 'opacity-70' : ''}`}
                              >
                                <div className="flex items-center gap-3">
                                  <button 
                                    onClick={(e) => toggleLessonComplete(e, s, day.date, lesson.lessonId, lesson.isCompleted)}
                                    className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 border-2 transition-colors ${lesson.isCompleted ? 'bg-primary border-primary text-white' : 'border-outline-variant text-transparent hover:border-primary'}`}
                                  >
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-4 h-4">
                                      <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                  </button>
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${lesson.isCompleted ? 'bg-surface-variant text-on-surface-variant' : 'bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white'}`}>
                                    <PlayCircle size={16} />
                                  </div>
                                  <div>
                                    <h5 className={`text-sm font-bold transition-colors line-clamp-1 ${lesson.isCompleted ? 'text-on-surface-variant line-through' : 'text-on-surface group-hover:text-primary'}`}>{lesson.lessonTitle}</h5>
                                    <p className="text-[10px] text-on-surface-variant mt-0.5">{lesson.moduleName}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1.5 text-xs font-bold text-on-surface-variant bg-surface-container-high px-2 py-1 rounded-lg shrink-0">
                                  <Clock size={12} className="text-primary" /> {Math.round(lesson.duration / 60)} min
                                </div>
                              </Link>
                            )) : (
                              <p className="text-sm text-on-surface-variant text-center py-4 italic">{t('studentDashboard.schedule.noLessons')}</p>
                            )}
                          </div>
                        </div>
                      ))}

                      {/* --- WEEKS VIEW --- */}
                      {activeTabView === 'weeks' && groupPlan(parsedPlan, 'weeks').map((week, idx) => (
                        <div key={idx} className="space-y-4 relative pl-4 border-l-2 border-primary/30">
                          <div className="absolute w-3 h-3 bg-primary rounded-full -left-[7px] top-1 border-2 border-surface" />
                          <h4 className="text-lg font-black text-on-surface flex items-center justify-between">
                            <span>{week.label}</span>
                            <span className="text-xs font-bold text-on-surface-variant bg-surface-container-low px-3 py-1 rounded-xl border border-outline-variant/30">{week.totalLessons} Lessons total</span>
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {week.days.map((day, dIdx) => (
                              <div key={dIdx} className="bg-surface rounded-xl border border-outline-variant/30 p-4 shadow-sm hover:border-primary/30 transition-colors">
                                <p className="text-xs font-bold text-primary mb-3 pb-2 border-b border-outline-variant/20 flex justify-between">
                                  <span>{day.dayName}</span>
                                  <span>{day.date}</span>
                                </p>
                                <ul className="space-y-2">
                                  {day.lessons && day.lessons.length > 0 ? day.lessons.map((lesson, lIdx) => (
                                    <li key={lIdx} className="text-xs text-on-surface flex items-start gap-2">
                                      <div className="w-1.5 h-1.5 rounded-full bg-primary/50 mt-1.5 shrink-0" />
                                      <span className="line-clamp-1 flex-1" title={lesson.lessonTitle}>{lesson.lessonTitle}</span>
                                    </li>
                                  )) : <li className="text-xs text-on-surface-variant italic">Rest Day</li>}
                                </ul>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}

                      {/* --- MONTHS VIEW --- */}
                      {activeTabView === 'months' && groupPlan(parsedPlan, 'months').map((month, idx) => (
                        <div key={idx} className="bg-surface rounded-2xl border border-outline-variant/30 shadow-sm overflow-hidden">
                          <div className="bg-surface-container-low px-6 py-4 border-b border-outline-variant/30 flex items-center justify-between">
                            <h4 className="text-xl font-black text-on-surface flex items-center gap-3">
                              <CalendarRange size={24} className="text-primary" /> {month.label}
                            </h4>
                            <span className="text-sm font-bold text-primary bg-primary/10 px-4 py-1.5 rounded-xl border border-primary/20">
                              {month.totalLessons} Lessons
                            </span>
                          </div>
                          <div className="p-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                              {month.days.map((day, dIdx) => {
                                const hasLessons = day.lessons && day.lessons.length > 0;
                                return (
                                  <div key={dIdx} className={`p-4 rounded-xl border transition-all ${hasLessons ? 'bg-surface border-primary/20 shadow-sm' : 'bg-surface-container-low/50 border-outline-variant/20 opacity-60'}`}>
                                    <div className="text-[10px] font-bold uppercase tracking-wider mb-1 flex justify-between">
                                      <span className={hasLessons ? 'text-primary' : 'text-on-surface-variant'}>{day.dayName}</span>
                                      <span className="text-on-surface-variant font-mono">{day.date.split('-')[2]}</span>
                                    </div>
                                    {hasLessons ? (
                                      <div className="mt-2 text-xl font-black text-on-surface">{day.lessons.length}</div>
                                    ) : (
                                      <div className="mt-2 text-xs font-bold text-on-surface-variant italic pt-1">Rest</div>
                                    )}
                                    <p className="text-[10px] text-on-surface-variant mt-1">{hasLessons ? 'Lessons scheduled' : 'No lessons'}</p>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      ))}

                    </div>
                      </>
                    )}
                  </div>
                )}
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
