import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronRight, Filter, PlayCircle, Loader2 } from 'lucide-react';
import API from '../../api/axios';

export default function ModuleSection() {
  const { t } = useTranslation();
  const { courseId, moduleId } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSubmodules, setExpandedSubmodules] = useState([]);

  useEffect(() => {
    setLoading(true);
    API.get(`/student/courses/${courseId}/modules/${moduleId}`)
      .then(res => {
        setData(res.data);
        setError(null);
      })
      .catch(err => {
        console.error(err);
        setError(err.response?.data?.message || 'Error fetching module details');
      })
      .finally(() => setLoading(false));
  }, [courseId, moduleId]);

  if (loading) {
    return (
      <div className="flex-1 p-6 flex justify-center items-center min-h-[60vh]">
        <Loader2 size={32} className="animate-spin text-primary" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex-1 p-6 flex flex-col items-center justify-center min-h-[60vh]">
        <p className="text-red-500 font-bold mb-4">{error}</p>
        <button onClick={() => navigate(-1)} className="px-6 py-2 bg-surface text-on-surface border border-outline-variant/30 rounded-full text-sm font-bold shadow-sm hover:shadow-md transition-all">
          Go Back
        </button>
      </div>
    );
  }

  const { course, module, completedLessons } = data;
  const submodules = module.submodules || [];

  const toggleSubmodule = (id) => {
    setExpandedSubmodules(prev => 
      prev.includes(id) ? prev.filter(modId => modId !== id) : [...prev, id]
    );
  };

  // Calculate totals for the header
  const totalQuestions = module.questionsCount || 0; // Backend does not have questions per module currently
  
  const allSubmoduleLessons = submodules.flatMap(sm => sm.lessons || []);
  const totalLessons = allSubmoduleLessons.length + (module.lessons ? module.lessons.length : 0);
  const totalDuration = allSubmoduleLessons.reduce((acc, l) => acc + (l.duration_seconds || 0), 0) + (module.lessons ? module.lessons.reduce((acc, l) => acc + (l.duration_seconds || 0), 0) : 0);
  
  const formatTime = (seconds) => {
    if (!seconds) return '0h 0m';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  };

  return (
    <div className="flex-1 p-4 md:p-8 min-h-screen">
      
      {/* 1. Purple Header Area */}
      <div className="bg-[#5c4be4] rounded-[2rem] p-8 text-white relative overflow-hidden mb-6 shadow-lg border border-white/10">
        {/* Subtle background glow effect */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-white/70 text-xs font-bold mb-4 relative z-10">
          <Link to="/dashboard/overview" className="hover:text-white transition-colors cursor-pointer">{t('Home')}</Link>
          <ChevronRight size={14} className="rtl:rotate-180" />
          <span className="text-white">{course.title}</span>
        </div>

        {/* Title & Description */}
        <h1 className="text-3xl md:text-4xl font-extrabold mb-3 relative z-10">{module.name}</h1>
        {module.description && (
          <p className="text-white/80 text-sm max-w-2xl leading-relaxed mb-6 relative z-10">
            {module.description}
          </p>
        )}

        {/* Badges */}
        <div className="flex flex-wrap items-center gap-3 mb-8 relative z-10">
          {totalQuestions > 0 && (
            <div className="px-3 py-1.5 bg-white/10 rounded-xl text-xs font-bold flex items-center gap-2 backdrop-blur-sm">
              <span className="opacity-70">📋</span> {totalQuestions} {t('questions')}
            </div>
          )}
          <div className="px-3 py-1.5 bg-white/10 rounded-xl text-xs font-bold flex items-center gap-2 backdrop-blur-sm">
            <span className="opacity-70">▶️</span> {totalLessons} {t('lessons')} ({formatTime(totalDuration)})
          </div>
        </div>

        {/* Instructors */}
        {course.instructors && course.instructors.length > 0 && (
          <div className="flex items-center gap-4 relative z-10">
            <div className="flex -space-x-3 rtl:space-x-reverse">
              {course.instructors.slice(0, 3).map((inst, idx) => (
                <img 
                  key={idx} 
                  src={inst.image_profile || `https://ui-avatars.com/api/?name=${encodeURIComponent(inst.name)}&background=random`} 
                  alt={inst.name} 
                  className="w-10 h-10 rounded-full border-2 border-[#5c4be4] object-cover" 
                  style={{ zIndex: 3 - idx }} 
                />
              ))}
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] font-bold text-white/70 tracking-widest uppercase">{t('content_experts')}</span>
              <span className="text-xs font-bold">{course.instructors.map(i => i.name.split(' ')[0]).join(', ')}</span>
            </div>
          </div>
        )}
      </div>

      {/* 2. Filter Bar */}
      <div className="relative mb-6">
        <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50" size={18} />
        <input 
          type="text" 
          placeholder={t('search_lessons_placeholder') || "Start typing to filter the lessons"} 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-[#7a6df1]/10 border border-[#7a6df1]/20 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-semibold text-on-surface focus:outline-none focus:border-[#5c4be4] transition-all placeholder:text-on-surface-variant/60"
        />
      </div>

      {/* 3. Submodules List */}
      <div className="space-y-4">
        {submodules.length > 0 ? submodules.map((sub, index) => {
          const isExpanded = expandedSubmodules.includes(sub.id);
          const lessons = sub.lessons || [];
          
          // Filter lessons if search query exists
          const filteredLessons = searchQuery 
            ? lessons.filter(l => l.title.toLowerCase().includes(searchQuery.toLowerCase()))
            : lessons;
            
          const compCount = lessons.filter(l => completedLessons.includes(l.id)).length;
          const subDuration = lessons.reduce((acc, l) => acc + (l.duration_seconds || 0), 0);
          
          // Hide submodule if it doesn't match search query (only if we're actually searching)
          if (searchQuery && filteredLessons.length === 0) return null;

          return (
            <div key={sub.id} className="bg-surface rounded-2xl shadow-sm border border-outline-variant/30 overflow-hidden">
              {/* Card Header (Always visible) */}
              <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 relative">
                
                {/* Index & Title */}
                <div className="flex gap-4">
                  <span className="text-2xl font-extrabold text-on-surface-variant/40 mt-1">{index + 1}</span>
                  <div>
                    <h3 className="text-lg md:text-xl font-extrabold text-on-surface mb-4">{sub.name}</h3>
                    
                    {/* Progress Bar & Details */}
                    <div className="w-full md:w-80 space-y-2">
                      <div className="h-1.5 w-full bg-surface-container-highest rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${lessons.length > 0 ? (compCount/lessons.length)*100 : 0}%` }}></div>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-bold text-on-surface-variant">
                        <span className="text-on-surface">{compCount}</span> of {lessons.length} lessons completed
                        <span className="w-1 h-1 rounded-full bg-outline-variant/60"></span>
                        {formatTime(subDuration)} runtime
                      </div>
                    </div>
                  </div>
                </div>

                {/* Start Button */}
                {lessons.length > 0 && (
                  <button 
                    onClick={() => navigate(`/learn/${courseId}/lesson/${lessons[0].id}?module=${sub.id}`)}
                    className="self-start md:self-center px-8 py-3 bg-[#5c4be4] hover:bg-[#4a3bc6] text-white rounded-full text-sm font-bold shadow-md shadow-[#5c4be4]/20 transition-all active:scale-95"
                  >
                    Start
                  </button>
                )}
              </div>

              {/* Accordion Toggle */}
              <div 
                onClick={() => toggleSubmodule(sub.id)}
                className={`flex items-center gap-2 px-6 py-3 cursor-pointer transition-colors ${isExpanded ? 'bg-surface-container/50 border-t border-outline-variant/30' : 'bg-surface-container-low border-t border-outline-variant/10 hover:bg-surface-container/30'}`}
              >
                <ChevronRight size={16} className={`text-on-surface-variant transition-transform ${isExpanded ? 'rotate-90 rtl:rotate-90' : 'rtl:rotate-180'}`} />
                <span className="text-xs font-bold text-on-surface-variant">
                  {isExpanded ? 'Hide' : 'Show all'} {lessons.length} lessons
                </span>
              </div>
              
              {/* Expanded Lessons List */}
              {isExpanded && (
                <div className="border-t border-outline-variant/20 bg-surface-container-lowest divide-y divide-outline-variant/10">
                  {filteredLessons.map((lesson, lIdx) => (
                    <div key={lesson.id} className="p-4 px-6 flex items-center justify-between hover:bg-surface-container-low transition-colors cursor-pointer" onClick={() => navigate(`/learn/${courseId}/lesson/${lesson.id}?module=${sub.id}`)}>
                      <div className="flex items-center gap-4">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border-2 ${completedLessons.includes(lesson.id) ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-outline-variant/50'}`}>
                          {completedLessons.includes(lesson.id) && <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                        </div>
                        <span className="text-sm font-bold text-on-surface">{lesson.title}</span>
                      </div>
                      <div className="flex items-center gap-4 text-xs font-bold text-on-surface-variant">
                        {lesson.lesson_type === 'video' ? (
                           <div className="flex items-center gap-1.5"><PlayCircle size={14} className="opacity-70" /> {formatTime(lesson.duration_seconds)}</div>
                        ) : (
                           <span className="uppercase text-[10px] tracking-wider px-2 py-0.5 bg-primary/10 text-primary rounded-lg">Article</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        }) : (
          <div className="p-8 bg-surface border border-outline-variant/30 rounded-2xl text-center shadow-sm">
             <p className="text-on-surface-variant font-bold text-sm">No modules found.</p>
          </div>
        )}
      </div>
      
    </div>
  );
}
