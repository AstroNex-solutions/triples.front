import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronRight, ChevronLeft } from 'lucide-react';

import CoursesList from './CoursesList';
import ModulesList from './ModulesList';
import SubModulesList from './SubModulesList';
import LessonsList from './LessonsList';
import LessonForm from './LessonForm';

export default function CoursesManager({ showMsg }) {
  const { t, i18n } = useTranslation();
  
  const [viewState, setViewState] = useState('courses'); // courses, modules, submodules, lessons
  
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedModule, setSelectedModule] = useState(null);
  const [selectedSubModule, setSelectedSubModule] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null);

  const navigateToCourses = () => {
    setViewState('courses');
    setSelectedCourse(null);
    setSelectedModule(null);
    setSelectedSubModule(null);
  };

  const navigateToModules = (course) => {
    setSelectedCourse(course);
    setViewState('modules');
    setSelectedModule(null);
    setSelectedSubModule(null);
  };

  const navigateToSubModules = (module) => {
    setSelectedModule(module);
    setViewState('submodules');
    setSelectedSubModule(null);
  };

  const navigateToLessons = (moduleOrSub, type) => {
    if (type === 'module') {
      setSelectedModule(moduleOrSub);
      setSelectedSubModule(null);
    } else if (type === 'submodule') {
      setSelectedSubModule(moduleOrSub);
    }
    setViewState('lessons');
  };

  const navigateToLessonForm = (lesson = null) => {
    setSelectedLesson(lesson);
    setViewState('lesson-form');
  };

  // Breadcrumbs
  const ChevronIcon = i18n.language === 'en' ? ChevronRight : ChevronLeft;

  const renderBreadcrumbs = () => {
    return (
      <div className="flex items-center gap-2 mb-6 text-sm font-bold bg-surface-container-low/50 p-3 rounded-2xl border border-outline-variant/30 overflow-x-auto whitespace-nowrap">
        <button onClick={navigateToCourses} className={`hover:text-primary transition-colors ${viewState === 'courses' ? 'text-primary' : 'text-on-surface-variant'} cursor-pointer`}>
          {t('admin.sections.courses') || 'الكورسات'}
        </button>
        
        {selectedCourse && (
          <>
            <ChevronIcon size={16} className="text-on-surface-variant/50 shrink-0" />
            <button onClick={() => navigateToModules(selectedCourse)} className={`hover:text-primary transition-colors ${viewState === 'modules' ? 'text-primary' : 'text-on-surface-variant'} cursor-pointer`}>
              {selectedCourse.title}
            </button>
          </>
        )}

        {selectedModule && (viewState === 'submodules' || viewState === 'lessons') && (
          <>
            <ChevronIcon size={16} className="text-on-surface-variant/50 shrink-0" />
            <button 
              onClick={() => {
                if (viewState === 'lessons' && !selectedSubModule) {
                  // stay
                } else {
                  navigateToSubModules(selectedModule);
                }
              }} 
              className={`hover:text-primary transition-colors ${(viewState === 'submodules' || (viewState === 'lessons' && !selectedSubModule)) ? 'text-primary' : 'text-on-surface-variant'} cursor-pointer`}
            >
              {selectedModule.name}
            </button>
          </>
        )}

        {selectedSubModule && (viewState === 'lessons' || viewState === 'lesson-form') && (
          <>
            <ChevronIcon size={16} className="text-on-surface-variant/50 shrink-0" />
            <button 
              onClick={() => navigateToLessons(selectedSubModule, 'submodule')}
              className={`hover:text-primary transition-colors ${(viewState === 'lessons' && !selectedLesson) ? 'text-primary' : 'text-on-surface-variant'} cursor-pointer`}
            >
              {selectedSubModule.name} (دروس)
            </button>
          </>
        )}

        {viewState === 'lesson-form' && (
          <>
            <ChevronIcon size={16} className="text-on-surface-variant/50 shrink-0" />
            <button className="text-primary cursor-default">
              {selectedLesson ? 'تعديل الدرس' : 'إضافة درس جديد'}
            </button>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4 w-full">
      {renderBreadcrumbs()}

      {viewState === 'courses' && (
        <CoursesList 
          showMsg={showMsg} 
          onManageModules={navigateToModules} 
        />
      )}

      {viewState === 'modules' && selectedCourse && (
        <ModulesList 
          showMsg={showMsg} 
          course={selectedCourse} 
          onManageSubModules={navigateToSubModules}
          onManageLessons={(mod) => navigateToLessons(mod, 'module')}
        />
      )}

      {viewState === 'submodules' && selectedModule && (
        <SubModulesList 
          showMsg={showMsg} 
          course={selectedCourse} 
          parentModule={selectedModule}
          onManageLessons={(subMod) => navigateToLessons(subMod, 'submodule')}
        />
      )}

      {viewState === 'lessons' && (selectedModule || selectedSubModule) && (
        <LessonsList 
          showMsg={showMsg} 
          course={selectedCourse} 
          module={selectedSubModule || selectedModule} 
          isSubModule={!!selectedSubModule}
          onManageLesson={navigateToLessonForm}
        />
      )}

      {viewState === 'lesson-form' && (selectedModule || selectedSubModule) && (
        <LessonForm
          showMsg={showMsg}
          module={selectedSubModule || selectedModule}
          lesson={selectedLesson}
          onBack={() => navigateToLessons(selectedSubModule || selectedModule, selectedSubModule ? 'submodule' : 'module')}
        />
      )}
    </div>
  );
}
