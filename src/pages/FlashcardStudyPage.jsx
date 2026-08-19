import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import API from '../api/axios';
import { 
  Loader2, ArrowLeft, ArrowRight, RotateCcw, ChevronRight, 
  Dna, Activity, Heart, Brain, Microscope, Pill, Stethoscope, 
  Atom, ShieldCheck, Bone, Sparkles, CheckCircle2, Bookmark, 
  Zap, Info, Compass, Eye, Award, LayoutDashboard
} from 'lucide-react';

// Specialized Medical Icon Resolver
const getMedicalIcon = (chapter = '', topic = '') => {
  const text = `${chapter} ${topic}`.toLowerCase();
  if (text.includes('bio') || text.includes('cell') || text.includes('كيمياء') || text.includes('خل')) return Atom;
  if (text.includes('genet') || text.includes('dna') || text.includes('وراث')) return Dna;
  if (text.includes('cardio') || text.includes('heart') || text.includes('قلب')) return Heart;
  if (text.includes('neuro') || text.includes('brain') || text.includes('عصب')) return Brain;
  if (text.includes('pharm') || text.includes('drug') || text.includes('دواء') || text.includes('علاج')) return Pill;
  if (text.includes('immun') || text.includes('infect') || text.includes('مناع')) return ShieldCheck;
  if (text.includes('bone') || text.includes('osteo') || text.includes('عظام')) return Bone;
  if (text.includes('physio') || text.includes('وظائف')) return Activity;
  if (text.includes('patho') || text.includes('امراض')) return Microscope;
  if (text.includes('eye') || text.includes('ophthal')) return Eye;
  return Stethoscope;
};


export default function FlashcardStudyPage() {
  const { t } = useTranslation();
  const { productId } = useParams();
  const navigate = useNavigate();
  const [decks, setDecks] = useState([]);
  const [selectedDeck, setSelectedDeck] = useState(null);
  const [items, setItems] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isFinished, setIsFinished] = useState(false);
  const [showDiagram, setShowDiagram] = useState(true);

  useEffect(() => {
    API.get(`/student/flashcards/${productId}/decks`)
      .then(res => {
        const fetched = res.data.decks || [];
        setDecks(fetched);
        if (fetched.length > 0 && !selectedDeck) {
          loadItems(fetched[0]);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [productId]);

  const loadItems = (deck) => {
    setLoading(true);
    setSelectedDeck(deck);
    API.get(`/student/flashcards/decks/${deck.id}/items`)
      .then(res => {
        setItems(res.data.items || []);
        setCurrentIndex(0);
        setIsFlipped(false);
        setIsFinished(false);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const nextCard = useCallback(() => {
    if (currentIndex < items.length - 1) {
      setIsFlipped(false);
      setTimeout(() => setCurrentIndex(prev => prev + 1), 150);
    } else if (currentIndex === items.length - 1) {
      setIsFinished(true);
    }
  }, [currentIndex, items.length]);

  const prevCard = useCallback(() => {
    if (currentIndex > 0) {
      setIsFlipped(false);
      setIsFinished(false);
      setTimeout(() => setCurrentIndex(prev => prev - 1), 150);
    }
  }, [currentIndex]);

  const flipCard = useCallback(() => {
    setIsFlipped(prev => !prev);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!selectedDeck || items.length === 0 || isFinished) return;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') prevCard();
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') nextCard();
      else if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        flipCard();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedDeck, items.length, isFinished, nextCard, prevCard, flipCard]);

  const currentItem = items[currentIndex];
  const progressPercent = items.length > 0 
    ? Math.round(((currentIndex + (isFinished ? 1 : 0)) / items.length) * 100) 
    : 0;

  // Check if item or deck mentions biological/cellular topics
  const hasCellCycleRelevance = useMemo(() => {
    if (!currentItem && !selectedDeck) return false;
    const combined = `${selectedDeck?.chapter_name || ''} ${selectedDeck?.topic_name || ''} ${currentItem?.front_text || ''} ${currentItem?.back_text || ''}`.toLowerCase();
    return combined.includes('cell') || combined.includes('cycle') || combined.includes('cdk') || combined.includes('phase') || combined.includes('mitosis') || combined.includes('bio') || combined.includes('خل');
  }, [currentItem, selectedDeck]);

  if (loading && !selectedDeck) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors">
        <div className="relative">
          <div className="absolute inset-0 bg-teal-500/20 blur-xl rounded-full animate-ping"></div>
          <div className="w-16 h-16 rounded-2xl bg-white dark:bg-slate-900 border border-teal-500/30 shadow-xl flex items-center justify-center relative z-10 text-teal-600 dark:text-teal-400">
            <Atom size={32} className="animate-spin" />
          </div>
        </div>
        <p className="mt-5 font-bold text-slate-600 dark:text-slate-400 text-sm tracking-wide">{t('flashcards.study.loadingPlatform')}</p>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-3 sm:py-4 px-3 sm:px-6 lg:px-8 relative overflow-x-hidden flex flex-col transition-colors" 
      dir="rtl"
      style={{
        backgroundImage: `radial-gradient(#cbd5e1 0.75px, transparent 0.75px), radial-gradient(#cbd5e1 0.75px, transparent 0.75px)`,
        backgroundSize: `30px 30px`,
        backgroundPosition: `0 0, 15px 15px`
      }}
    >
      {/* Soft Clinical Ambient Light Orbs */}
      <div className="absolute top-6 left-1/4 w-96 h-96 bg-teal-400/5 dark:bg-teal-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-6 right-1/4 w-96 h-96 bg-cyan-400/5 dark:bg-cyan-400/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col gap-3.5 relative z-10">
        
        {/* Top Navigation Bar: الرجوع للوحة الطالب */}
        <div className="flex items-center justify-between bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800 px-4 py-2.5 rounded-2xl shadow-sm transition-colors">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => navigate('/dashboard')}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white text-xs font-black transition-all cursor-pointer border border-slate-200 dark:border-slate-700 shadow-2xs"
            >
              <LayoutDashboard size={15} className="text-teal-600 dark:text-teal-400" />
              <span>{t('flashcards.study.backToDashboard')}</span>
            </button>

            <button
              onClick={() => navigate('/flashcards-store')}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100 dark:hover:bg-teal-900 text-teal-800 dark:text-teal-300 text-xs font-bold transition-all cursor-pointer border border-teal-200/80 dark:border-teal-800/80"
            >
              <Bookmark size={14} className="text-teal-600 dark:text-teal-400" />
              <span className="hidden sm:inline">{t('flashcards.study.storeBtn')}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-slate-800 dark:text-slate-200 hidden sm:inline">
              {t('flashcards.study.studyPlatform')}
            </span>
            <span className="text-[10px] font-mono text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 px-2.5 py-0.5 rounded-md border border-teal-200 dark:border-teal-800/80">
              {t('flashcards.study.studentMode')}
            </span>
          </div>
        </div>

        <div className="flex-1 flex flex-col lg:flex-row gap-5">
        
        {/* ═════════════════════════════════════════════
            1. Sidebar: فصول المادة مع أيقونات طبية متخصصة
           ═════════════════════════════════════════════ */}
        <aside className="w-full lg:w-72 xl:w-80 shrink-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 rounded-3xl p-4 flex flex-col h-auto lg:h-[calc(100vh-85px)] shadow-[0_10px_30px_rgba(0,0,0,0.02)] transition-colors">
          <div className="flex items-center justify-between mb-4 px-1 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200/60 dark:border-teal-800/60 text-teal-600 dark:text-teal-400 flex items-center justify-center shadow-sm">
                <Microscope size={18} />
              </div>
              <div>
                <h2 className="text-base font-black text-slate-800 dark:text-slate-100 leading-tight">{t('flashcards.study.chaptersTitle')}</h2>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">{t('flashcards.study.chapterSubtitle')}</p>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              {decks.length}
            </span>
          </div>
          
          <div className="space-y-2 overflow-y-auto pr-1 flex-1 custom-scrollbar">
            {decks.map((deck, index) => {
              const isActive = selectedDeck?.id === deck.id;
              const MedicalIcon = getMedicalIcon(deck.chapter_name, deck.topic_name);

              return (
                <button
                  key={deck.id}
                  onClick={() => loadItems(deck)}
                  className={`w-full text-start p-3.5 rounded-2xl transition-all duration-300 flex items-center gap-3.5 group relative border text-right cursor-pointer ${
                    isActive 
                    ? 'bg-gradient-to-l from-teal-600 to-cyan-700 text-white border-teal-600 shadow-md shadow-teal-700/20 scale-[1.01]' 
                    : 'bg-white dark:bg-slate-900 hover:bg-slate-50/90 dark:hover:bg-slate-800/90 border-slate-200/70 dark:border-slate-800 hover:border-teal-300 dark:hover:border-teal-600 text-slate-700 dark:text-slate-200'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                    isActive 
                      ? 'bg-white/20 text-white' 
                      : 'bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 border border-teal-100 dark:border-teal-900'
                  }`}>
                    <MedicalIcon size={20} />
                  </div>

                  <div className="truncate flex-1 min-w-0">
                    <div className={`text-[10px] font-bold uppercase tracking-wider mb-0.5 truncate ${
                      isActive ? 'text-teal-100' : 'text-teal-600 dark:text-teal-400'
                    }`}>
                      {deck.chapter_name || `Chapter ${index + 1}`}
                    </div>
                    <div className={`text-xs font-bold truncate ${
                      isActive ? 'text-white' : 'text-slate-800 dark:text-slate-100'
                    }`}>
                      {deck.topic_name || 'Topic'}
                    </div>
                  </div>

                  <ChevronRight size={16} className={`shrink-0 transition-transform ${
                    isActive ? 'text-white translate-x-[-2px]' : 'text-slate-300 dark:text-slate-600 group-hover:text-teal-600 dark:group-hover:text-teal-400 group-hover:translate-x-[-2px]'
                  }`} />
                </button>
              );
            })}
          </div>
        </aside>

        {/* ═════════════════════════════════════════════
            2. Main Study Zone: بطاقة المذاكرة الطبية
           ═════════════════════════════════════════════ */}
        <main className="flex-1 flex flex-col relative h-auto lg:h-[calc(100vh-85px)] justify-between">
          {!selectedDeck ? (
            <div className="flex-1 flex flex-col items-center justify-center bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-8 text-center shadow-sm transition-colors">
              <div className="w-20 h-20 bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 rounded-3xl flex items-center justify-center mb-5 text-teal-600 dark:text-teal-400 shadow-inner">
                <Sparkles size={36} className="animate-pulse" />
              </div>
              <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100 mb-2">{t('flashcards.study.startPromptTitle')}</h3>
              <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto text-sm leading-relaxed">
                {t('flashcards.study.startPromptDesc')}
              </p>
            </div>
          ) : loading ? (
            <div className="flex-1 flex flex-col items-center justify-center">
              <Loader2 size={44} className="animate-spin text-teal-600 dark:text-teal-400 mb-3" />
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500">{t('flashcards.study.loadingCards')}</span>
            </div>
          ) : items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 text-center">
              <h3 className="text-lg font-bold text-slate-600 dark:text-slate-300">{t('flashcards.study.noCards')}</h3>
            </div>
          ) : (
            <div className="flex-1 flex flex-col w-full max-w-4xl mx-auto h-full justify-between gap-3">
              
              {/* ── Top Header: تقدمك في هذا الفصل ── */}
              <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 rounded-2xl px-4 py-3 shadow-sm transition-colors">
                <div className="flex items-center justify-between gap-4 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-teal-500 animate-pulse"></span>
                    <span className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-wide">
                      {t('flashcards.study.progressInChapter')}
                    </span>
                    <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium hidden sm:inline">
                      • {selectedDeck.chapter_name}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-black text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 px-2.5 py-0.5 rounded-full border border-teal-200 dark:border-teal-800/80">
                      {progressPercent}%
                    </span>
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-0.5 rounded-full border border-slate-200 dark:border-slate-700">
                      {isFinished ? items.length : currentIndex + 1} / {items.length} {t('flashcards.study.cardUnit')}
                    </span>
                  </div>
                </div>

                {/* Precision Progress Line */}
                <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-200/60 dark:border-slate-700">
                  <div 
                    className="h-full bg-gradient-to-l from-teal-500 via-cyan-500 to-emerald-400 rounded-full transition-all duration-500 ease-out shadow-sm"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* ── Main Flashcard Core ── */}
              <div className="flex-1 flex flex-col items-center justify-center relative w-full perspective-1000 my-auto py-1">
                {isFinished ? (
                  <div className="w-full max-w-xl bg-white dark:bg-slate-900 border-2 border-teal-500/30 rounded-3xl p-8 sm:p-10 text-center shadow-xl animate-in fade-in zoom-in-95 duration-500">
                    <div className="w-16 h-16 bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 border border-teal-200 dark:border-teal-800 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
                      <Award size={36} />
                    </div>
                    <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 mb-2">{t('flashcards.study.congratsTitle')}</h2>
                    <p className="text-slate-600 dark:text-slate-400 text-sm mb-6 max-w-sm mx-auto">
                      {t('flashcards.study.congratsDesc')}
                    </p>
                    <div className="flex items-center justify-center gap-3">
                      <button 
                        onClick={() => { setIsFinished(false); setCurrentIndex(0); setIsFlipped(false); }}
                        className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2.5 rounded-xl font-bold text-xs transition-all shadow-md flex items-center gap-2 cursor-pointer"
                      >
                        <RotateCcw size={15} /> {t('flashcards.study.reviewAgain')}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div 
                    className="relative w-full max-w-3xl h-[280px] sm:h-[340px] lg:h-[370px] cursor-pointer group select-none"
                    onClick={flipCard}
                  >
                    {/* The 3D Flip Card Container */}
                    <div className={`w-full h-full transition-transform duration-600 ease-[cubic-bezier(0.2,0.8,0.2,1)] transform-style-preserve-3d rounded-3xl shadow-[0_20px_50px_rgba(15,23,42,0.08)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.4)] ${isFlipped ? 'rotate-y-180' : ''}`}>
                      
                      {/* ── Front Face: Question / وجه السؤال ── */}
                      <div className="absolute inset-0 backface-hidden bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-teal-500/50 dark:hover:border-teal-500/50 rounded-3xl p-6 sm:p-9 flex flex-col justify-between overflow-y-auto transition-colors shadow-sm">
                        {/* Top Badge & Header */}
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-1 rounded-lg bg-teal-50 dark:bg-teal-950/60 border border-teal-200/80 dark:border-teal-800/80 text-teal-700 dark:text-teal-300 text-[11px] font-black tracking-wide">
                              {t('flashcards.study.questionBadge')}
                            </span>
                            <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">
                              MEDICAL QUESTION #{currentIndex + 1}
                            </span>
                          </div>
                          <span className="text-[11px] font-bold text-slate-400 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md">
                            {t('flashcards.study.clickToFlip')}
                          </span>
                        </div>

                        {/* Middle: Question Text */}
                        <div className="my-auto py-3 text-center">
                          <h2 
                            className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-slate-100 leading-snug tracking-tight font-sans" 
                            dir="ltr"
                          >
                            {currentItem?.front_text}
                          </h2>
                        </div>
                        {/* Footer Indicator */}
                        <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
                          <span className="flex items-center gap-1.5 font-medium">
                            <Atom size={13} className="text-teal-600 dark:text-teal-400" /> {selectedDeck?.topic_name || selectedDeck?.chapter_name}
                          </span>
                          <span className="text-teal-600 dark:text-teal-400 font-bold hover:underline">
                            {t('flashcards.study.showFullAnswer')}
                          </span>
                        </div>
                      </div>
                      
                      {/* ── Back Face: Answer / وجه الإجابة ── */}
                      <div className="absolute inset-0 backface-hidden rotate-y-180 bg-gradient-to-br from-teal-950 via-slate-900 to-slate-950 text-white border border-teal-500/40 rounded-3xl p-6 sm:p-9 flex flex-col justify-between overflow-y-auto shadow-2xl">
                        {/* Top Header */}
                        <div className="flex items-center justify-between border-b border-teal-800/60 pb-3">
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[11px] font-black tracking-wide">
                              {t('flashcards.study.answerBadge')}
                            </span>
                            <span className="text-[11px] text-teal-300/60 font-mono">
                              CLINICAL ANSWER EXPLANATION
                            </span>
                          </div>
                          <span className="text-[11px] font-bold text-teal-200/70 bg-white/10 px-2.5 py-1 rounded-md">
                            {t('flashcards.study.clickToReturn')}
                          </span>
                        </div>

                        {/* Middle: Answer Content */}
                        <div className="my-auto py-4 text-center">
                          <p 
                            className="text-lg sm:text-2xl font-extrabold text-teal-50 leading-relaxed font-sans"
                            dir="ltr"
                          >
                            {currentItem?.back_text}
                          </p>
                        </div>

                        {/* Scientific Context Footer */}
                        <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-slate-300 flex items-center justify-between">
                          <span className="font-bold text-teal-300 flex items-center gap-1.5">
                            <ShieldCheck size={15} /> {t('flashcards.study.verifiedConcept')}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {t('flashcards.study.highYield')}
                          </span>
                        </div>
                      </div>

                    </div>
                  </div>
                )}
              </div>

              {/* ═════════════════════════════════════════════
                  3. Bottom Navigation: وحدة التحكم الطبية
                 ═════════════════════════════════════════════ */}
              {!isFinished && (
                <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800 p-3.5 rounded-2xl shadow-sm transition-colors">
                  
                  {/* Previous Button (السابق) */}
                  <button 
                    onClick={prevCard} 
                    disabled={currentIndex === 0}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <ArrowRight size={16} />
                    <span>{t('flashcards.study.prevBtn')}</span>
                  </button>
                  
                  {/* Flip Action Button */}
                  <button
                    onClick={flipCard}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100 dark:hover:bg-teal-900 border border-teal-200/80 dark:border-teal-800/80 text-teal-800 dark:text-teal-300 font-black text-xs flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer"
                  >
                    <RotateCcw size={15} className="text-teal-600 dark:text-teal-400" />
                    <span>{t('flashcards.study.flipBtn')}</span>
                  </button>

                  {/* Next Button (التالي) */}
                  <button 
                    onClick={nextCard} 
                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-l from-teal-600 to-cyan-700 hover:from-teal-700 hover:to-cyan-800 text-white font-black text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-teal-600/20 cursor-pointer"
                  >
                    <span>{t('flashcards.study.nextBtn')}</span>
                    <ArrowLeft size={16} />
                  </button>
                </div>
              )}

              {/* Keyboard Hints Badge */}
              <div className="mt-3 text-center text-[11px] font-bold text-slate-400 dark:text-slate-500 flex items-center justify-center gap-4">
                <span>{t('flashcards.study.spaceHint')} <kbd className="bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-300 dark:border-slate-700 font-mono text-slate-600 dark:text-slate-300 shadow-2xs">Space</kbd> {t('flashcards.study.spaceAction')}</span>
                <span>•</span>
                <span>{t('flashcards.study.arrowsHint')} <kbd className="bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-300 dark:border-slate-700 font-mono text-slate-600 dark:text-slate-300 shadow-2xs">→</kbd> <kbd className="bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-300 dark:border-slate-700 font-mono text-slate-600 dark:text-slate-300 shadow-2xs">←</kbd> {t('flashcards.study.arrowsAction')}</span>
              </div>

            </div>
          )}
        </main>
        </div>
      </div>
    </div>
  );
}


