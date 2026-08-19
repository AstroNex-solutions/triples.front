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

// Specialty Resolver for Student Dashboard
const getStudentSpecialty = (title = '', description = '') => {
  const text = `${title} ${description}`.toLowerCase();
  
  if (text.includes('micro') || text.includes('bacter') || text.includes('virus') || text.includes('أحياء دقيقة') || text.includes('ميكرو')) {
    return {
      icon: Microscope,
      tag: 'Microbiology • أحياء دقيقة',
      gradient: 'from-emerald-500 to-teal-600',
      badge: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800/80',
      iconBox: 'bg-emerald-50 text-emerald-600 border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/80',
      shadow: 'hover:shadow-emerald-500/10'
    };
  }
  if (text.includes('cardio') || text.includes('heart') || text.includes('قلب') || text.includes('وعائ')) {
    return {
      icon: Heart,
      tag: 'Cardiovascular • قلب وأوعية',
      gradient: 'from-rose-500 to-red-600',
      badge: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800/80',
      iconBox: 'bg-rose-50 text-rose-600 border-rose-200/80 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800/80',
      shadow: 'hover:shadow-rose-500/10'
    };
  }
  if (text.includes('pharm') || text.includes('drug') || text.includes('صيدل') || text.includes('دواء') || text.includes('علاج')) {
    return {
      icon: Pill,
      tag: 'Pharmacology • علم الأدوية',
      gradient: 'from-amber-500 to-orange-600',
      badge: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800/80',
      iconBox: 'bg-amber-50 text-amber-600 border-amber-200/80 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/80',
      shadow: 'hover:shadow-amber-500/10'
    };
  }
  if (text.includes('neuro') || text.includes('brain') || text.includes('عصب') || text.includes('دماغ')) {
    return {
      icon: Brain,
      tag: 'Neurology • علم الأعصاب',
      gradient: 'from-purple-500 to-indigo-600',
      badge: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800/80',
      iconBox: 'bg-purple-50 text-purple-600 border-purple-200/80 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-800/80',
      shadow: 'hover:shadow-purple-500/10'
    };
  }
  if (text.includes('bio') || text.includes('chem') || text.includes('dna') || text.includes('كيمياء') || text.includes('وراث')) {
    return {
      icon: Dna,
      tag: 'Biochemistry • كيمياء حيوية',
      gradient: 'from-cyan-500 to-teal-600',
      badge: 'bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/50 dark:text-cyan-300 dark:border-cyan-800/80',
      iconBox: 'bg-cyan-50 text-cyan-600 border-cyan-200/80 dark:bg-cyan-950/40 dark:text-cyan-400 dark:border-cyan-800/80',
      shadow: 'hover:shadow-cyan-500/10'
    };
  }
  if (text.includes('bone') || text.includes('osteo') || text.includes('anat') || text.includes('تشريح') || text.includes('عظام')) {
    return {
      icon: Bone,
      tag: 'Anatomy • تشريح وعظام',
      gradient: 'from-sky-500 to-blue-600',
      badge: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/50 dark:text-sky-300 dark:border-sky-800/80',
      iconBox: 'bg-sky-50 text-sky-600 border-sky-200/80 dark:bg-sky-950/40 dark:text-sky-400 dark:border-sky-800/80',
      shadow: 'hover:shadow-sky-500/10'
    };
  }

  return {
    icon: Atom,
    tag: 'Medical Sciences • علوم طبية',
    gradient: 'from-teal-600 to-cyan-700',
    badge: 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/50 dark:text-teal-300 dark:border-teal-800/80',
    iconBox: 'bg-teal-50 text-teal-600 border-teal-200/80 dark:bg-teal-950/40 dark:text-teal-400 dark:border-teal-800/80',
    shadow: 'hover:shadow-teal-500/10'
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
      <div className="bg-gradient-to-l from-teal-950 via-slate-900 to-slate-950 text-white rounded-3xl p-6 sm:p-8 border border-teal-500/30 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-black border border-teal-400/30">
              <Sparkles size={13} className="animate-pulse" />
              <span>{t('flashcards.student.spaceBadge')}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-teal-50">
              {t('flashcards.student.title')}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              {t('flashcards.student.subtitle')}
            </p>
          </div>

          <button
            onClick={() => navigate('/flashcards-store')}
            className="px-5 py-3 rounded-2xl bg-gradient-to-l from-teal-500 to-emerald-400 hover:from-teal-400 hover:to-emerald-300 text-slate-950 font-black text-xs transition-all shadow-md flex items-center gap-2 cursor-pointer shrink-0"
          >
            <BookmarkPlus size={16} />
            <span>{t('flashcards.student.exploreNew')}</span>
          </button>
        </div>
      </div>

      {/* 2. Search & Stats Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm transition-colors">
        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('flashcards.student.searchPlaceholder')}
            className="w-full pl-4 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400">
          <span>{t('flashcards.student.totalAvailable')}</span>
          <span className="px-2.5 py-1 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 font-mono font-black border border-teal-200 dark:border-teal-800/80">
            {flashcards.length}
          </span>
        </div>
      </div>
      
      {/* 3. Flashcards Grid */}
      {loading ? (
        <div className="py-16 flex flex-col items-center justify-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
          <Loader2 size={36} className="animate-spin text-teal-600 mb-3" />
          <span className="text-xs font-bold text-slate-400">{t('flashcards.student.loading')}</span>
        </div>
      ) : flashcards.length === 0 ? (
        <Card className="text-center py-16 px-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm">
          <div className="w-20 h-20 bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 rounded-3xl flex items-center justify-center mx-auto mb-4 text-teal-600 dark:text-teal-400">
            <BookOpen size={36} />
          </div>
          <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 mb-2">{t('flashcards.student.emptyTitle')}</h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-6 leading-relaxed">
            {t('flashcards.student.emptyDesc')}
          </p>
          <button 
            onClick={() => navigate('/flashcards-store')}
            className="px-6 py-3 bg-gradient-to-l from-teal-600 to-cyan-700 hover:from-teal-700 hover:to-cyan-800 text-white font-black text-xs rounded-xl shadow-md transition-all cursor-pointer inline-flex items-center gap-2"
          >
            <Sparkles size={16} />
            <span>{t('flashcards.student.browseStore')}</span>
          </button>
        </Card>
      ) : filteredDecks.length === 0 ? (
        <div className="py-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400">{t('flashcards.student.noMatch')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDecks.map(f => {
            const specialty = getStudentSpecialty(f.title, f.description);
            const IconComponent = specialty.icon;

            return (
              <div 
                key={f.id} 
                className={`group bg-white dark:bg-slate-900/95 rounded-3xl border border-slate-200/90 dark:border-slate-800 hover:border-teal-500/40 dark:hover:border-teal-500/50 p-6 flex flex-col justify-between transition-all duration-300 hover:shadow-[0_15px_35px_rgba(15,23,42,0.06)] dark:hover:shadow-[0_15px_35px_rgba(0,0,0,0.3)] relative overflow-hidden ${specialty.shadow}`}
              >
                {/* Top Colored Border */}
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${specialty.gradient}`} />

                <div>
                  {/* Category Pill */}
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border ${specialty.badge} truncate`}>
                      {specialty.tag}
                    </span>
                    <span className="flex items-center gap-1 text-[10px] font-mono font-bold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/50 px-2 py-0.5 rounded border border-teal-200 dark:border-teal-800/80">
                      <CheckCircle2 size={11} /> {t('flashcards.student.activeStatus')}
                    </span>
                  </div>

                  {/* Icon & Title */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform ${specialty.iconBox}`}>
                      <IconComponent size={22} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-black text-slate-900 dark:text-slate-100 text-base leading-snug group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors line-clamp-2">
                        {f.title}
                      </h3>
                      <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">
                        {t('flashcards.student.clinicalPack')}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 mb-6 leading-relaxed">
                    {f.description || t('flashcards.student.defaultDesc')}
                  </p>
                </div>

                {/* Launch Button */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button 
                    onClick={() => navigate(`/study-flashcards/${f.id}`)}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-l from-teal-600 to-cyan-700 hover:from-teal-700 hover:to-cyan-800 text-white rounded-xl font-black text-xs shadow-md shadow-teal-700/20 hover:shadow-lg transition-all cursor-pointer group-hover:scale-[1.01]"
                  >
                    <Play size={15} className="fill-current" />
                    <span>{t('flashcards.student.startSession')}</span>
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

