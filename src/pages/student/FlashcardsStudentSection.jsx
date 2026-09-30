import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  BookOpen, Search, Play, CheckCircle2, BookmarkPlus, Sparkles, BookMarked
} from 'lucide-react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { Card } from './SharedUI';

export default function FlashcardsStudentSection() {
  const { t } = useTranslation();
  const { stats } = useOutletContext();
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const unpurchasedFlashcardCourses = useMemo(() => {
    if (!stats || !stats.activeCourses) return [];
    // Only show courses that DO NOT have flashcards active yet
    return stats.activeCourses.filter(c => !c.features || c.features.flashcards !== true);
  }, [stats]);

  const filteredCourses = useMemo(() => {
    return unpurchasedFlashcardCourses.filter(c => {
      const match = (c.title || '').toLowerCase().includes(search.toLowerCase());
      return match;
    });
  }, [unpurchasedFlashcardCourses, search]);

  const handleBuyFeature = async (courseId) => {
    navigate(`/checkout/feature/${courseId}/flashcards`);
  };

  return (
    <div className="space-y-6">
      
      {/* 3. Courses Grid */}
      {!stats ? (
        <div className="py-16 flex flex-col items-center justify-center bg-surface rounded-3xl border border-outline-variant/30 shadow-sm">
          <span className="text-xs font-bold text-on-surface-variant">{t('flashcardsStudentSection.loading', 'جاري التحميل...')}</span>
        </div>
      ) : unpurchasedFlashcardCourses.length === 0 ? (
        <Card className="text-center py-16 px-6">
          <div className="w-20 h-20 bg-primary/10 border border-primary/20 rounded-3xl flex items-center justify-center mx-auto mb-4 text-primary">
            <BookOpen size={36} />
          </div>
          <h3 className="text-xl font-black text-on-surface mb-2" dir="auto">{t('flashcardsStudentSection.emptyTitle', 'لا توجد دورات بطاقات تعليمية')}</h3>
          <p className="text-xs sm:text-sm text-on-surface-variant max-w-md mx-auto mb-6 leading-relaxed" dir="auto">
            {t('flashcardsStudentSection.emptyDesc', 'أنت غير مسجل في أي دورات تتيح الوصول للبطاقات التعليمية حالياً.')}
          </p>
          <button 
            onClick={() => navigate('/courses')}
            className="px-6 py-3 bg-primary hover:bg-primary-hover text-on-primary font-black text-xs rounded-xl shadow-md transition-all cursor-pointer inline-flex items-center gap-2 hover:-translate-y-1"
          >
            <Sparkles size={16} />
            <span>{t('flashcardsStudentSection.browseCourses', 'تصفح الدورات')}</span>
          </button>
        </Card>
      ) : filteredCourses.length === 0 ? (
        <div className="py-12 text-center bg-surface rounded-3xl border border-outline-variant/30 shadow-sm">
          <p className="text-xs font-bold text-on-surface-variant" dir="auto">{t('flashcardsStudentSection.noCoursesMatch', 'لا توجد دورات تطابق بحثك.')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map(c => {
            const hasFlashcards = c.features && c.features.flashcards === true;

            return (
              <div 
                key={c.id} 
                className="group bg-surface rounded-3xl border border-outline-variant/30 hover:border-primary/40 p-6 flex flex-col justify-between transition-all duration-300 hover:shadow-lg relative overflow-hidden hover:shadow-primary/10"
              >
                {/* Top Colored Border */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-primary-hover" />

                <div>
                  {/* Category Pill */}
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border truncate bg-primary/10 text-primary border-primary/20">
                      {t('flashcardsStudentSection.coursePack', 'حزمة الدورة')}
                    </span>
                    <span className={`flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${hasFlashcards ? 'text-primary bg-primary/10 border-primary/20' : 'text-amber-600 bg-amber-500/10 border-amber-500/20'}`}>
                      <CheckCircle2 size={11} /> {hasFlashcards ? t('flashcardsStudentSection.active', 'نشط') : t('flashcardsStudentSection.locked', 'مغلق')}
                    </span>
                  </div>

                  {/* Icon & Title */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 rounded-2xl border flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform bg-primary/10 text-primary border-primary/20">
                      <BookMarked size={22} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-black text-on-surface text-base leading-snug group-hover:text-primary transition-colors line-clamp-2">
                        {c.title}
                      </h3>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-on-surface-variant line-clamp-3 mb-6 leading-relaxed" dir="auto">
                    {hasFlashcards 
                      ? t('flashcardsStudentSection.viewFlashcardsDesc', "عرض ومراجعة حزم البطاقات التعليمية المضمنة في هذه الدورة.")
                      : t('flashcardsStudentSection.purchaseFlashcardsDesc', `قم بشراء البطاقات التعليمية لهذه الدورة لفتح خاصية التكرار المتباعد الذكي.`)
                    }
                  </p>
                </div>

                {/* Launch Button */}
                <div className="pt-4 border-t border-outline-variant/20">
                  {hasFlashcards ? (
                    <button 
                      onClick={() => navigate(`/dashboard/course/${c.id}/flashcards`)}
                      className="w-full flex items-center justify-center gap-2 py-3 bg-primary hover:bg-primary-hover text-on-primary rounded-xl font-black text-xs shadow-md transition-all cursor-pointer group-hover:scale-[1.01]"
                    >
                      <BookOpen size={15} className="fill-current" />
                      <span>{t('flashcardsStudentSection.viewDecks', 'عرض الحزم')}</span>
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleBuyFeature(c.id)}
                      className="w-full flex items-center justify-center gap-2 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-black text-xs shadow-md transition-all cursor-pointer group-hover:scale-[1.01]"
                      dir="auto"
                    >
                      <BookmarkPlus size={15} className="fill-current" />
                      <span>
                        {t('flashcardsStudentSection.buyFlashcards', 'شراء البطاقات')} - ${c.flashcard_price || 0}
                      </span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
