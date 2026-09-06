import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Loader2, Play, Sparkles, BookOpen, Search, ArrowLeft,
  Microscope, Heart, Pill, Brain, Dna, Atom, Bone, ShieldCheck,
  Award, CheckCircle2, BookmarkPlus
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SectionHeader, Card } from './SharedUI';
import API from '../../api/axios';

// Specialty Resolver for Student Dashboard - Using more harmonious or primary colors
const getStudentSpecialty = (title = '', description = '') => {
  const text = `${title} ${description}`.toLowerCase();
  
  if (text.includes('micro') || text.includes('bacter') || text.includes('virus') || text.includes('أحياء دقيقة') || text.includes('ميكرو')) {
    return {
      icon: Microscope,
      tag: 'Microbiology • أحياء دقيقة',
      gradient: 'from-emerald-500 to-teal-600',
      badge: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
      iconBox: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
      shadow: 'hover:shadow-emerald-500/10'
    };
  }
  if (text.includes('cardio') || text.includes('heart') || text.includes('قلب') || text.includes('وعائ')) {
    return {
      icon: Heart,
      tag: 'Cardiovascular • قلب وأوعية',
      gradient: 'from-rose-500 to-red-600',
      badge: 'bg-rose-500/10 text-rose-600 border-rose-500/20',
      iconBox: 'bg-rose-500/10 text-rose-600 border-rose-500/20',
      shadow: 'hover:shadow-rose-500/10'
    };
  }
  if (text.includes('pharm') || text.includes('drug') || text.includes('صيدل') || text.includes('دواء') || text.includes('علاج')) {
    return {
      icon: Pill,
      tag: 'Pharmacology • علم الأدوية',
      gradient: 'from-amber-500 to-orange-600',
      badge: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
      iconBox: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
      shadow: 'hover:shadow-amber-500/10'
    };
  }
  if (text.includes('neuro') || text.includes('brain') || text.includes('عصب') || text.includes('دماغ')) {
    return {
      icon: Brain,
      tag: 'Neurology • علم الأعصاب',
      gradient: 'from-violet-500 to-indigo-600',
      badge: 'bg-violet-500/10 text-violet-600 border-violet-500/20',
      iconBox: 'bg-violet-500/10 text-violet-600 border-violet-500/20',
      shadow: 'hover:shadow-violet-500/10'
    };
  }
  if (text.includes('bio') || text.includes('chem') || text.includes('dna') || text.includes('كيمياء') || text.includes('وراث')) {
    return {
      icon: Dna,
      tag: 'Biochemistry • كيمياء حيوية',
      gradient: 'from-cyan-500 to-teal-600',
      badge: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20',
      iconBox: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20',
      shadow: 'hover:shadow-cyan-500/10'
    };
  }
  if (text.includes('bone') || text.includes('osteo') || text.includes('anat') || text.includes('تشريح') || text.includes('عظام')) {
    return {
      icon: Bone,
      tag: 'Anatomy • تشريح وعظام',
      gradient: 'from-sky-500 to-blue-600',
      badge: 'bg-sky-500/10 text-sky-600 border-sky-500/20',
      iconBox: 'bg-sky-500/10 text-sky-600 border-sky-500/20',
      shadow: 'hover:shadow-sky-500/10'
    };
  }

  return {
    icon: Atom,
    tag: 'Medical Sciences • علوم طبية',
    gradient: 'from-primary to-primary-hover',
    badge: 'bg-primary/10 text-primary border-primary/20',
    iconBox: 'bg-primary/10 text-primary border-primary/20',
    shadow: 'hover:shadow-primary/10'
  };
};

export default function FlashcardsStudentSection() {
  const { t } = useTranslation();
  const [flashcards, setFlashcards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    API.get('/student/flashcards')
      .then(res => setFlashcards(res.data.flashcards || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filteredDecks = useMemo(() => {
    return flashcards.filter(f => {
      const match = (f.title || '').toLowerCase().includes(search.toLowerCase()) ||
                    (f.description || '').toLowerCase().includes(search.toLowerCase());
      return match;
    });
  }, [flashcards, search]);

  return (
    <div className="space-y-6">
      {/* 1. Header Banner & Quick Action */}
      <div className="bg-gradient-to-br from-primary to-violet-600 text-on-primary rounded-3xl p-6 sm:p-8 shadow-lg shadow-primary/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none translate-y-1/3 -translate-x-1/3" />

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-black border border-white/30 backdrop-blur-sm">
              <Sparkles size={13} className="text-amber-300 animate-pulse" />
              <span>{t('studentDashboard.flashcards.spaceBadge', 'Smart Spaced Repetition')}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              {t('studentDashboard.flashcards.title')}
            </h2>
            <p className="text-xs sm:text-sm text-white/80 max-w-xl leading-relaxed">
              {t('studentDashboard.flashcards.subtitle', 'Review your active flashcard decks.')}
            </p>
          </div>

          <button
            onClick={() => navigate('/flashcards-store')}
            className="px-5 py-3 rounded-2xl bg-white text-primary font-black text-xs transition-all shadow-md hover:shadow-lg hover:-translate-y-1 hover:bg-white/90 flex items-center gap-2 cursor-pointer shrink-0"
          >
            <BookmarkPlus size={16} />
            <span>{t('studentDashboard.flashcards.explore', 'Explore Store')}</span>
          </button>
        </div>
      </div>

      {/* 2. Search & Stats Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-surface/60 backdrop-blur-md p-4 rounded-2xl border border-outline-variant/30 shadow-sm transition-colors">
        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('studentDashboard.flashcards.search', 'Search decks...')}
            className="w-full pl-4 pr-10 py-2.5 bg-surface-container-low border border-outline-variant/30 rounded-xl text-xs text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-on-surface-variant">
          <span>{t('flashcards.student.totalAvailable') || 'Available Decks:'}</span>
          <span className="px-2.5 py-1 rounded-lg bg-primary/10 text-primary font-mono font-black border border-primary/20">
            {flashcards.length}
          </span>
        </div>
      </div>
      
      {/* 3. Flashcards Grid */}
      {loading ? (
        <div className="py-16 flex flex-col items-center justify-center bg-surface rounded-3xl border border-outline-variant/30 shadow-sm">
          <Loader2 size={36} className="animate-spin text-primary mb-3" />
          <span className="text-xs font-bold text-on-surface-variant">{t('flashcards.student.loading') || 'Loading flashcards...'}</span>
        </div>
      ) : flashcards.length === 0 ? (
        <Card className="text-center py-16 px-6">
          <div className="w-20 h-20 bg-primary/10 border border-primary/20 rounded-3xl flex items-center justify-center mx-auto mb-4 text-primary">
            <BookOpen size={36} />
          </div>
          <h3 className="text-xl font-black text-on-surface mb-2">{t('flashcards.student.emptyTitle') || 'No Flashcards Yet'}</h3>
          <p className="text-xs sm:text-sm text-on-surface-variant max-w-md mx-auto mb-6 leading-relaxed">
            {t('flashcards.student.emptyDesc') || 'You haven\'t added any flashcards yet. Visit the store to explore and add flashcard decks to your library.'}
          </p>
          <button 
            onClick={() => navigate('/flashcards-store')}
            className="px-6 py-3 bg-primary hover:bg-primary-hover text-on-primary font-black text-xs rounded-xl shadow-md transition-all cursor-pointer inline-flex items-center gap-2 hover:-translate-y-1"
          >
            <Sparkles size={16} />
            <span>{t('flashcards.student.browseStore') || 'Browse Store'}</span>
          </button>
        </Card>
      ) : filteredDecks.length === 0 ? (
        <div className="py-12 text-center bg-surface rounded-3xl border border-outline-variant/30 shadow-sm">
          <p className="text-xs font-bold text-on-surface-variant">{t('flashcards.student.noMatch') || 'No decks match your search.'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDecks.map(f => {
            const specialty = getStudentSpecialty(f.title, f.description);
            const IconComponent = specialty.icon;

            return (
              <div 
                key={f.id} 
                className={`group bg-surface rounded-3xl border border-outline-variant/30 hover:border-primary/40 p-6 flex flex-col justify-between transition-all duration-300 hover:shadow-lg relative overflow-hidden ${specialty.shadow}`}
              >
                {/* Top Colored Border */}
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${specialty.gradient}`} />

                <div>
                  {/* Category Pill */}
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border truncate ${specialty.badge}`}>
                      {specialty.tag}
                    </span>
                    <span className="flex items-center gap-1 text-[10px] font-mono font-bold text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
                      <CheckCircle2 size={11} /> {t('flashcards.student.activeStatus') || 'Active'}
                    </span>
                  </div>

                  {/* Icon & Title */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform ${specialty.iconBox}`}>
                      <IconComponent size={22} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-black text-on-surface text-base leading-snug group-hover:text-primary transition-colors line-clamp-2">
                        {f.title}
                      </h3>
                      <span className="text-[10px] font-mono text-on-surface-variant">
                        {t('flashcards.student.clinicalPack') || 'Clinical Pack'}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-on-surface-variant line-clamp-3 mb-6 leading-relaxed">
                    {f.description || t('flashcards.student.defaultDesc')}
                  </p>
                </div>

                {/* Launch Button */}
                <div className="pt-4 border-t border-outline-variant/20">
                  <button 
                    onClick={() => navigate(`/study-flashcards/${f.id}`)}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-primary hover:bg-primary-hover text-on-primary rounded-xl font-black text-xs shadow-md transition-all cursor-pointer group-hover:scale-[1.01]"
                  >
                    <Play size={15} className="fill-current" />
                    <span>{t('flashcards.student.startSession') || 'Start Session'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
