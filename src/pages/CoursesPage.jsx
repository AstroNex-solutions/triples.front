import React, { useState, useEffect, useCallback } from 'react';
import API from '../api/axios';
import CourseCard from '../components/CourseCard';
import { 
  Search, 
  Filter, 
  RotateCcw, 
  BookOpen, 
  GraduationCap, 
  Sparkles,
  SlidersHorizontal
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function CoursesPage() {
  const { t } = useTranslation();
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [loading, setLoading] = useState(true);

  // دالة جلب الدورات
  const fetchCourses = useCallback(async () => {
    setLoading(true);
    try {
      let query = `/courses?status=published`;
      if (search) query += `&search=${encodeURIComponent(search)}`;
      if (selectedCat) query += `&category_id=${selectedCat}`;
      if (selectedLevel) query += `&level=${selectedLevel}`;

      const res = await API.get(query);
      setCourses(res.data.courses || []);
    } catch (err) {
      console.error('Error fetching courses:', err);
    } finally {
      setLoading(false);
    }
  }, [search, selectedCat, selectedLevel]);

  // جلب التصنيفات عند التحميل الأول
  useEffect(() => {
    API.get('/courses/categories')
      .then(res => setCategories(res.data.categories || []))
      .catch(err => console.error('Error fetching categories:', err));
  }, []);

  // إعادة التحديث عند تغيير الفلاتر
  useEffect(() => {
    fetchCourses();
  }, [selectedCat, selectedLevel]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchCourses();
  };

  const handleResetFilters = () => {
    setSearch('');
    setSelectedCat('');
    setSelectedLevel('');
  };

  const isFiltered = search !== '' || selectedCat !== '' || selectedLevel !== '';

  return (
    <div className="min-h-screen pb-20 pt-6 px-4 sm:px-6 lg:px-12 max-w-container-max mx-auto space-y-10">
      
      {/* 1. Header & Hero Title */}
      <div className="relative rounded-3xl bg-surface-container-low/70 border border-outline-variant/40 p-6 sm:p-10 backdrop-blur-xl overflow-hidden shadow-sm">
        <div className="absolute -top-10 -left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold border border-primary/20">
            <GraduationCap size={15} />
            <span>{t('coursesPage.header.badge')}</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-on-surface tracking-tight">
            {t('coursesPage.header.title')}
          </h1>
          <p className="text-on-surface-variant text-sm sm:text-base leading-relaxed">
            {t('coursesPage.header.subtitle')}
          </p>
        </div>

        {/* Filter Controls Panel */}
        <form 
          onSubmit={handleSearchSubmit} 
          className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 relative z-10 pt-6 border-t border-outline-variant/30"
        >
          {/* Search Field */}
          <div className="relative">
            <Search size={18} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant/70" />
            <input 
              type="text" 
              placeholder={t('coursesPage.filters.searchPlaceholder')} 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pr-10 pl-4 py-3 bg-surface/80 border border-outline-variant/50 rounded-2xl text-sm text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>

          {/* Categories Filter */}
          <div className="relative">
            <Filter size={18} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant/70 pointer-events-none" />
            <select 
              value={selectedCat} 
              onChange={(e) => setSelectedCat(e.target.value)}
              className="w-full pr-10 pl-4 py-3 bg-surface/80 border border-outline-variant/50 rounded-2xl text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all appearance-none cursor-pointer"
            >
              <option value="">{t('coursesPage.filters.allCategories')}</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* Level Filter */}
          <div className="relative">
            <SlidersHorizontal size={18} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant/70 pointer-events-none" />
            <select 
              value={selectedLevel} 
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="w-full pr-10 pl-4 py-3 bg-surface/80 border border-outline-variant/50 rounded-2xl text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all appearance-none cursor-pointer"
            >
              <option value="">{t('coursesPage.filters.allLevels')}</option>
              <option value="beginner">{t('coursesPage.filters.beginner')}</option>
              <option value="intermediate">{t('coursesPage.filters.intermediate')}</option>
              <option value="advanced">{t('coursesPage.filters.advanced')}</option>
            </select>
          </div>

          {/* Buttons Group */}
          <div className="flex gap-2">
            <button 
              type="submit" 
              className="flex-1 bg-primary text-on-primary font-bold text-sm rounded-2xl py-3 px-4 hover:bg-primary-hover transition-all duration-200 flex items-center justify-center gap-2 shadow-glow"
            >
              <Search size={16} />
              <span>{t('coursesPage.filters.searchButton')}</span>
            </button>
            
            {isFiltered && (
              <button 
                type="button" 
                onClick={handleResetFilters}
                className="p-3 bg-surface-container-high text-on-surface-variant hover:text-error rounded-2xl border border-outline-variant/40 transition-colors"
                title={t('coursesPage.filters.resetTitle')}
              >
                <RotateCcw size={18} />
              </button>
            )}
          </div>
        </form>
      </div>

      {/* 2. Courses Grid & Loading States */}
      {loading ? (
        /* Skeleton Grid Loading */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="rounded-3xl bg-surface-container-low/50 border border-outline-variant/30 h-80 animate-pulse p-4 flex flex-col justify-between">
              <div className="w-full h-40 bg-surface-container-high/60 rounded-2xl" />
              <div className="space-y-3 mt-4">
                <div className="h-4 bg-surface-container-high/80 rounded-md w-3/4" />
                <div className="h-3 bg-surface-container-high/50 rounded-md w-1/2" />
              </div>
              <div className="h-8 bg-surface-container-high/70 rounded-xl mt-4" />
            </div>
          ))}
        </div>
      ) : courses.length === 0 ? (
        /* Empty State */
        <div className="rounded-3xl border border-dashed border-outline-variant/60 p-12 text-center bg-surface-container-low/30 backdrop-blur-sm space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-surface-container-high text-on-surface-variant mx-auto flex items-center justify-center">
            <BookOpen size={32} />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-on-surface">{t('coursesPage.empty.title')}</h3>
            <p className="text-sm text-on-surface-variant max-w-md mx-auto">
              {t('coursesPage.empty.subtitle')}
            </p>
          </div>
          {isFiltered && (
            <button 
              onClick={handleResetFilters}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary font-bold text-sm rounded-xl hover:bg-primary/20 transition-colors"
            >
              <RotateCcw size={16} />
              <span>{t('coursesPage.empty.viewAll')}</span>
            </button>
          )}
        </div>
      ) : (
        /* Courses Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map(course => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}

    </div>
  );
}