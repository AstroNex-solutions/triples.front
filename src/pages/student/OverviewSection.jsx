import React, { useState, useEffect, useContext } from 'react';
import { BookOpen, Award, CheckCircle2, ShoppingBag, Loader2, Play, Calendar as CalendarIcon, Clock, TrendingUp, Sparkles, BrainCircuit, ExternalLink, Lock, HelpCircle, BarChart2, Book, GraduationCap, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useOutletContext } from 'react-router-dom';
import API from '../../api/axios';
import { AuthContext } from '../../context/AuthContext';

export default function OverviewSection() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { stats } = useOutletContext();
  const [selectedCourseId, setSelectedCourseId] = useState(null);

  useEffect(() => {
    if (stats?.activeCourses?.length > 0 && !selectedCourseId) {
      setSelectedCourseId(stats.activeCourses[0].id);
    }
  }, [stats, selectedCourseId]);

  if (!stats) return null;
  const activeCourses = stats.activeCourses;
  const hasCourses = activeCourses.length > 0;

  const selectedCourse = activeCourses.find(c => c.id === selectedCourseId) || activeCourses[0];
  
  // Aggregate features from all active courses so the top cards don't change when switching tabs
  const anyCourseFeatures = {
    flashcards: activeCourses.some(c => c?.features?.flashcards),
    qbank: activeCourses.some(c => c?.features?.qbank),
    selfAssessment: activeCourses.some(c => c?.features?.selfAssessment),
    freeze: activeCourses.some(c => c?.features?.freeze)
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto">

      {/* Welcome Banner */}
      <div className="flex items-center gap-2 mb-6">
        <h2 className="text-2xl font-extrabold text-on-surface" dir="auto">
          {t('student.overview.welcome', 'مرحباً، ')}{user?.name || t('student.overview.student', 'طالب')}!
        </h2>
        <span className="text-2xl">👋</span>
      </div>

      {/* 6 Action Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {[
          {
            id: 'flashcards',
            title: t('student.overview.cards.flashcards.title', 'البطاقات التعليمية'),
            subtitle: t('student.overview.cards.flashcards.subtitle', 'مراجعة ذكية باستخدام التكرار المتباعد'),
            icon: Book,
            colorClass: 'bg-primary/10 text-primary',
            borderClass: 'hover:border-primary/50',
            // Locked if no course OR no course includes flashcards
            isLocked: !hasCourses || !anyCourseFeatures.flashcards,
          },
          {
            id: 'qbank',
            title: t('student.overview.cards.qbank.title', 'بنك الأسئلة'),
            subtitle: t('student.overview.cards.qbank.subtitle', 'آلاف الأسئلة لتقييم مستواك'),
            icon: HelpCircle,
            colorClass: 'bg-secondary/10 text-secondary',
            borderClass: 'hover:border-secondary/50',
            // Locked if no course OR no course includes qbank
            isLocked: !hasCourses || !anyCourseFeatures.qbank,
          },
          {
            id: 'selfAssessment',
            title: t('student.overview.cards.selfAssessment.title', 'التقييم الذاتي'),
            subtitle: t('student.overview.cards.selfAssessment.subtitle', 'اختبارات تحاكي الامتحانات الحقيقية'),
            icon: CheckCircle2,
            colorClass: 'bg-error/10 text-error',
            borderClass: 'hover:border-error/50',
            // Locked if no course OR no course includes self assessment
            isLocked: !hasCourses || !anyCourseFeatures.selfAssessment,
          },
          {
            id: 'schedule',
            title: t('student.overview.cards.schedule.title', 'الجدول الدراسي'),
            subtitle: t('student.overview.cards.schedule.subtitle', 'تنظيم ومتابعة خطتك الدراسية'),
            icon: Clock,
            colorClass: 'bg-primary/10 text-primary',
            borderClass: 'hover:border-primary/50',
            // Schedule is available to all enrolled students
            isLocked: !hasCourses,
            actionIcon: ExternalLink,
            actionColor: 'text-secondary'
          },
          {
            id: 'performance',
            title: t('student.overview.cards.performance.title', 'الأداء والإحصائيات'),
            subtitle: t('student.overview.cards.performance.subtitle', 'تحليل تفصيلي لمستواك الدراسي'),
            icon: BarChart2,
            colorClass: 'bg-secondary/10 text-secondary',
            borderClass: 'hover:border-secondary/50',
            // Performance is available to all enrolled students
            isLocked: !hasCourses,
            actionIcon: ExternalLink,
            actionColor: 'text-secondary'
          },
          {
            id: 'freeze',
            title: t('student.overview.cards.freeze.title', 'تجميد الحساب'),
            subtitle: t('student.overview.cards.freeze.subtitle', 'إيقاف مؤقت للدورات النشطة'),
            customIcon: (
              <div className="flex gap-1">
                <div className="w-1 h-3.5 bg-white rounded-full"></div>
                <div className="w-1 h-3.5 bg-white rounded-full"></div>
              </div>
            ),
            colorClass: 'bg-error text-white',
            borderClass: 'hover:border-error/50',
            // Freeze is available only if student has at least one premium feature
            isLocked: !hasCourses || !anyCourseFeatures.freeze,
          }
        ].map((card) => {
          const locked = card.isLocked;
          const ActionIcon = card.actionIcon;

          // Where to navigate when locked (go subscribe)
          const handleLockedClick = () => {
            if (card.id === 'flashcards') navigate('/dashboard/flashcards');
            else if (card.id === 'qbank') navigate('/dashboard/question_banks');
            else if (card.id === 'selfAssessment') navigate('/dashboard/self_assessments');
            else navigate('/courses');
          };

          return (
            <div
              key={card.id}
              onClick={() => {
                if (locked) {
                  handleLockedClick();
                } else {
                  if (card.id === 'flashcards') navigate('/dashboard/flashcards');
                  else if (card.id === 'qbank') navigate('/dashboard/question_banks');
                  else if (card.id === 'selfAssessment') navigate('/dashboard/self_assessments');
                  else if (card.id === 'schedule') navigate('/dashboard/schedule');
                  else if (card.id === 'performance') navigate('/dashboard/performance');
                  else if (card.id === 'freeze') navigate('/dashboard/freeze');
                }
              }}
              className={`flex items-center justify-between p-4 rounded-3xl bg-surface border transition-all cursor-pointer ${
                locked
                  ? `border-error/20 hover:border-error/50 hover:shadow-md hover:shadow-error/10`
                  : `border-outline-variant/30 hover:shadow-md ${card.borderClass}`
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${locked ? 'bg-surface-container-highest text-on-surface-variant/50' : card.colorClass}`}>
                  {card.customIcon ? card.customIcon : <card.icon size={20} />}
                </div>
                <div className="text-start" dir="auto">
                  <h3 className={`font-bold text-sm ${locked ? 'text-on-surface-variant' : 'text-on-surface'}`}>{card.title}</h3>
                  <p className="text-[11px] text-on-surface-variant">{card.subtitle}</p>
                </div>
              </div>

              {/* Right Side Indicator */}
              <div className="flex flex-col items-center gap-1 shrink-0 px-1">
                {locked ? (
                  <div className="flex items-center gap-1 bg-error/10 border border-error/30 rounded-full px-2 py-1 animate-pulse" dir="auto">
                    <Lock size={10} className="text-error" />
                    <span className="text-[9px] text-error font-black whitespace-nowrap">{t('student.overview.subscribeNow', 'اشترك الآن')}</span>
                  </div>
                ) : ActionIcon ? (
                  <ActionIcon size={18} className={`${card.actionColor} mx-2`} />
                ) : null}
              </div>
            </div>
          );
        })}
      </div>

      {/* Subscribed Courses Section */}
      <div className="rounded-[2rem] border border-outline-variant/30 overflow-hidden bg-surface shadow-sm mb-6">
        <div className="bg-gradient-to-r from-[#1B1B48] to-[#4DBFB3] p-4 flex items-center gap-3 text-white">
          <GraduationCap size={24} />
          <h3 className="font-bold text-base" dir="auto">{t('student.overview.myCourses', 'دوراتي المشترك بها')}</h3>
        </div>

        {activeCourses.length > 0 ? (
          <div className="p-6">
            {/* Study Tab Header */}
            <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 custom-scrollbar border-b border-outline-variant/20">
              {activeCourses.map((course) => (
                <button
                  key={course.id}
                  onClick={() => setSelectedCourseId(course.id)}
                  className={`px-6 py-2.5 rounded-t-xl font-bold text-sm transition-all whitespace-nowrap ${selectedCourseId === course.id ? 'bg-surface-container-low text-primary border-b-2 border-primary' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/20'}`}
                >
                  {course.title}
                </button>
              ))}
            </div>

            <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar pe-2">
              {(() => {
                const selectedCourse = activeCourses.find(c => c.id === selectedCourseId) || activeCourses[0];
                if (!selectedCourse) return null;

                return selectedCourse.modules && selectedCourse.modules.length > 0 ? selectedCourse.modules.map((module) => {
                  const qTotal = selectedCourse.questionsCount || 0;
                  const qDone = selectedCourse.completedQuestions || 0;
                  const lTotal = module.lessonsCount || 0;
                  const lDone = module.completedLessons || 0;
                  const instructors = selectedCourse.instructors || [];

                  return (
                    <div
                      key={module.id}
                      onClick={() => {
                        if (module.submodulesCount > 0) {
                          navigate(`/dashboard/course/${selectedCourse.id}/module/${module.id}`);
                        } else {
                          navigate(`/learn/${selectedCourse.id}`);
                        }
                      }}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl bg-surface shadow-sm hover:shadow-md transition-all cursor-pointer border border-outline-variant/20 gap-6"
                    >
                      {/* Left: Icon and Title */}
                      <div className="flex items-center gap-4 min-w-[200px]">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0">
                          {/* Placeholder Icon representing organ/subject */}
                          <div className="text-2xl">🧠</div>
                        </div>
                        <h4 className="font-extrabold text-base text-on-surface">{module.name}</h4>
                      </div>

                      {/* Middle: Progress Bars */}
                      <div className="flex-1 flex flex-col sm:flex-row gap-6 lg:gap-12 w-full">
                        {/* Questions Progress */}
                        <div className="flex-1">
                          <div className="h-1.5 w-full bg-surface-container-highest rounded-full overflow-hidden mb-2">
                            <div className="h-full bg-primary rounded-full" style={{ width: `${qTotal > 0 ? (qDone / qTotal) * 100 : 0}%` }}></div>
                          </div>
                          <p className="text-[11px] text-on-surface-variant font-medium">
                            {i18n.language === 'ar' ? (
                              <><span className="font-bold text-on-surface">{qDone}</span> من أصل {qTotal} سؤال</>
                            ) : (
                              <><span className="font-bold text-on-surface">{qDone}</span> of {qTotal} questions tagged</>
                            )}
                          </p>
                        </div>

                        {/* Lessons Progress */}
                        <div className="flex-1">
                          <div className="h-1.5 w-full bg-surface-container-highest rounded-full overflow-hidden mb-2">
                            <div className="h-full bg-secondary rounded-full" style={{ width: `${lTotal > 0 ? (lDone / lTotal) * 100 : 0}%` }}></div>
                          </div>
                          <p className="text-[11px] text-on-surface-variant font-medium">
                            {i18n.language === 'ar' ? (
                              <><span className="font-bold text-on-surface">{lDone}</span> من أصل {lTotal} درس مكتمل</>
                            ) : (
                              <><span className="font-bold text-on-surface">{lDone}</span> of {lTotal} lessons completed</>
                            )}
                          </p>
                        </div>
                      </div>

                      {/* Right: Instructors */}
                      <div className="flex items-center gap-4 shrink-0 sm:min-w-[180px] justify-end">
                        {instructors.length > 0 ? (
                          <div className="flex items-center gap-3">
                            <div className="flex -space-x-3 rtl:space-x-reverse">
                              {instructors.slice(0, 3).map((inst, idx) => (
                                <img key={idx} src={inst.image_profile || `https://ui-avatars.com/api/?name=${encodeURIComponent(inst.name)}&background=random`} alt={inst.name} className="w-9 h-9 rounded-full border-2 border-surface object-cover z-10" style={{ zIndex: 3 - idx }} />
                              ))}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[8px] font-bold text-on-surface-variant/70 tracking-wider uppercase mb-0.5">{t('student.overview.contentExperts', 'خبراء المحتوى')}</span>
                              <span className="text-[11px] font-semibold text-on-surface line-clamp-1">{instructors.map(i => i.name.split(' ')[0]).join(', ')}</span>
                            </div>
                          </div>
                        ) : (
                          <div className="text-[11px] text-on-surface-variant">
                            {i18n.language === 'ar' ? 'لا يوجد محاضرين' : 'No instructors'}
                          </div>
                        )}
                        <ChevronRight size={18} className="text-on-surface-variant/40 rtl:rotate-180" />
                      </div>
                    </div>
                  );
                }) : (
                  <p className="text-sm text-on-surface-variant p-4 bg-surface-container-low rounded-2xl text-center shadow-sm" dir="auto">{t('student.overview.noModules', 'لا توجد أقسام في هذه الدورة.')}</p>
                );
              })()}
            </div>
          </div>
        ) : (
          <div className="p-6 md:p-10 bg-surface-container-lowest">
            <div className="border-2 border-dashed border-outline-variant/40 rounded-[2rem] flex flex-col items-center justify-center text-center p-12 bg-surface">
              <GraduationCap size={56} className="text-on-surface-variant/30 mb-4" />
              <h3 className="text-lg font-bold text-on-surface mb-2" dir="auto">{t('student.overview.noCourses', 'لا توجد دورات مشتركة بعد')}</h3>
              <p className="text-sm text-on-surface-variant max-w-sm mb-6" dir="auto">{t('student.overview.noCoursesDesc', 'تصفح أحدث الدورات الطبية وابدأ رحلتك التعليمية.')}</p>
              <button
                onClick={() => navigate('/courses?category=Medicine')}
                className="px-8 py-3 bg-gradient-to-r from-[#1B1B48] to-[#333879] hover:opacity-90 text-white rounded-full font-bold text-sm flex items-center gap-2 transition-all shadow-md"
                dir="auto"
              >
                <span className="text-lg leading-none">+</span> {t('student.overview.browseCourses', 'تصفح الدورات')}
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
