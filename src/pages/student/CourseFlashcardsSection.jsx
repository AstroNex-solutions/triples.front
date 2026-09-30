import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BookMarked, Search, Loader2, Sparkles, CheckCircle2, Play, BookOpen } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card } from './SharedUI';
import API from '../../api/axios';
import { useOutletContext } from 'react-router-dom';

// Utility for icon/color matching (reusing logic)
const getStudentSpecialty = (title = '', desc = '') => {
  return {
    icon: BookMarked,
    gradient: 'from-primary to-primary-hover',
    badge: 'bg-primary/10 text-primary border-primary/20',
    iconBox: 'bg-primary/10 text-primary border-primary/20',
    shadow: 'hover:shadow-primary/10'
  };
};

export default function CourseFlashcardsSection() {
  const { courseId } = useParams();
  const { t } = useTranslation();
  const { stats } = useOutletContext();
  const [modulesWithDecks, setModulesWithDecks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const activeCourse = stats?.activeCourses?.find(c => String(c.id) === String(courseId));
  const modules = activeCourse?.modules || [];

  useEffect(() => {
    if (!modules.length) {
      setLoading(false);
      return;
    }

    setLoading(true);
    Promise.all(
      modules.map(m => 
        API.get(`/student/flashcards/${m.id}/decks`)
           .then(res => ({ module: m, decks: res.data.decks || [] }))
           .catch(() => ({ module: m, decks: [] }))
      )
    )
    .then(results => {
      const filtered = results.filter(r => r.decks.length > 0);
      setModulesWithDecks(filtered);
    })
    .finally(() => setLoading(false));
  }, [courseId, modules.length]);

  const filteredModules = useMemo(() => {
    if (!search) return modulesWithDecks;
    return modulesWithDecks.map(mw => {
      const filteredDecks = mw.decks.filter(d => 
        (d.chapter_name || '').toLowerCase().includes(search.toLowerCase()) ||
        (d.topic_name || '').toLowerCase().includes(search.toLowerCase())
      );
      return { ...mw, decks: filteredDecks };
    }).filter(mw => mw.decks.length > 0 || (mw.module.name || '').toLowerCase().includes(search.toLowerCase()));
  }, [modulesWithDecks, search]);

  return (
    <div className="space-y-6">

      {/* Grid */}
      {loading ? (
        <div className="py-16 flex flex-col items-center justify-center bg-surface rounded-3xl border border-outline-variant/30 shadow-sm">
          <Loader2 size={36} className="animate-spin text-primary mb-3" />
        </div>
      ) : modulesWithDecks.length === 0 ? (
        <Card className="text-center py-16 px-6">
          <div className="w-20 h-20 bg-primary/10 border border-primary/20 rounded-3xl flex items-center justify-center mx-auto mb-4 text-primary">
            <BookOpen size={36} />
          </div>
          <h3 className="text-xl font-black text-on-surface mb-2">{t('courseFlashcards.noFlashcards', 'لا توجد بطاقات بعد')}</h3>
          <p className="text-sm text-on-surface-variant max-w-md mx-auto leading-relaxed">
            {t('courseFlashcards.noFlashcardsDesc', 'لا توجد حزم بطاقات متاحة لهذه الدورة حالياً.')}
          </p>
        </Card>
      ) : filteredModules.length === 0 ? (
        <div className="py-12 text-center bg-surface rounded-3xl border border-outline-variant/30 shadow-sm">
          <p className="text-xs font-bold text-on-surface-variant">{t('courseFlashcards.noMatch', 'لا توجد حزم تطابق بحثك.')}</p>
        </div>
      ) : (
        <div className="space-y-8">
          {filteredModules.map(mw => (
            <div key={mw.module.id} className="space-y-4">
              <h3 className="text-xl font-black text-on-surface flex items-center gap-2 border-b border-outline-variant/20 pb-2">
                <BookOpen className="text-primary" size={24} />
                {mw.module.name}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mw.decks.map(deck => {
                  const specialty = getStudentSpecialty(deck.chapter_name, deck.topic_name);
                  const IconComponent = specialty.icon;
                  
                  return (
                    <div 
                      key={deck.id} 
                      className={`group bg-surface rounded-3xl border border-outline-variant/30 hover:border-primary/40 p-6 flex flex-col justify-between transition-all duration-300 hover:shadow-lg relative overflow-hidden ${specialty.shadow}`}
                    >
                      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${specialty.gradient}`} />

                      <div>
                        <div className="flex items-center justify-between gap-2 mb-4">
                          <span className="flex items-center gap-1 text-[10px] font-mono font-bold text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
                            <CheckCircle2 size={11} /> {t('courseFlashcards.active', 'نشط')}
                          </span>
                        </div>

                        <div className="flex items-start gap-4 mb-4">
                          <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform ${specialty.iconBox}`}>
                            <IconComponent size={22} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-black text-on-surface text-base leading-snug group-hover:text-primary transition-colors line-clamp-2">
                              {deck.chapter_name}
                            </h3>
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-outline-variant/20">
                        <button 
                          onClick={() => navigate(`/study-flashcards/${deck.id}?moduleId=${mw.module.id}`)}
                          className="w-full flex items-center justify-center gap-2 py-3 bg-primary hover:bg-primary-hover text-on-primary rounded-xl font-black text-xs shadow-md transition-all cursor-pointer group-hover:scale-[1.01]"
                        >
                          <Play size={15} className="fill-current" />
                          <span>{t('courseFlashcards.startSession', 'ابدأ المراجعة')}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
