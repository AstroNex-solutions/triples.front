import React, { useState, useEffect, useCallback, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import API from '../api/axios';
import { AuthContext } from '../context/AuthContext';
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
  const [categoriesLoaded, setCategoriesLoaded] = useState(false);
  const [enrollments, setEnrollments] = useState([]);
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const categoryQuery = searchParams.get('category');

  const fetchEnrollments = useCallback(async () => {
    if (user) {
      try {
        const res = await API.get('/student/enrollments');
        setEnrollments(res.data.enrollments || []);
      } catch (err) {
        console.error('Error fetching enrollments:', err);
      }
    }
  }, [user]);

  useEffect(() => {
    fetchEnrollments();
  }, [fetchEnrollments]);

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
      .then(res => {
        const fetchedCats = res.data.categories || [];
        setCategories(fetchedCats);

        if (categoryQuery) {
          const matchedCat = fetchedCats.find(c =>
            c.name === categoryQuery ||
            c.name_ar === categoryQuery ||
            c.name_en === categoryQuery
          );
          if (matchedCat) {
            setSelectedCat(matchedCat.id);
          } else {
            setSelectedCat('');
          }
        } else {
          setSelectedCat('');
        }
      })
      .catch(err => console.error('Error fetching categories:', err))
      .finally(() => setCategoriesLoaded(true));
  }, [categoryQuery]);

  // إعادة التحديث عند تغيير الفلاتر أو عند اكتمال جلب التصنيفات
  useEffect(() => {
    if (categoriesLoaded) {
      fetchCourses();
    }
  }, [selectedCat, selectedLevel, categoriesLoaded, fetchCourses]);

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
          {courses.map(course => {
            const enrollment = enrollments.find(e => e.course_id === course.id);
            return (
              <CourseCard
                key={course.id}
                course={course}
                enrollment={enrollment}
                onEnrollmentUpdate={fetchEnrollments}
              />
            );
          })}
        </div>
      )}

    </div>
  );
}