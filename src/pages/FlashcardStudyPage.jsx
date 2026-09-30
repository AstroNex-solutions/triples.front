import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
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

// UI Sound Synthesis using Web Audio API (Clinical & Elegant Tones)
const playSound = (type) => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    if (type === 'flip') {
      // Smooth "shwip" (digital swipe)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      // Triangle wave gives a softer, warmer tone
      osc.type = 'triangle';
      
      // Sweep frequency up for a "lifting" or "flipping" feel
      osc.frequency.setValueAtTime(300, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.15);
      
      // Smooth Envelope
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
      
    } else if (type === 'nav') {
      // Elegant clinical UI chime (glassy pop)
      const osc = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc2.type = 'sine';
      
      // C6 and E6 (Major third interval, clean and positive)
      osc.frequency.setValueAtTime(1046.50, ctx.currentTime);
      osc2.frequency.setValueAtTime(1318.51, ctx.currentTime);
      
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      
      osc.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      osc2.start();
      osc.stop(ctx.currentTime + 0.15);
      osc2.stop(ctx.currentTime + 0.15);
    }
  } catch (e) {
    // Ignore audio errors (e.g. autoplay blocked)
  }
};


export default function FlashcardStudyPage() {
  const { t } = useTranslation();
  const { deckId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const moduleId = searchParams.get('moduleId');
  
  const [decks, setDecks] = useState([]);
  const [selectedDeck, setSelectedDeck] = useState(null);
  const [items, setItems] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isFinished, setIsFinished] = useState(false);
  const [showDiagram, setShowDiagram] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
 
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        let fetchedDecks = [];
        if (moduleId) {
          const decksRes = await API.get(`/student/flashcards/${moduleId}/decks`);
          fetchedDecks = decksRes.data.decks || [];
          setDecks(fetchedDecks);
        }

        const itemsRes = await API.get(`/student/flashcards/${deckId}/items`);
        setItems(itemsRes.data.items || []);
        
        let initialDeck = fetchedDecks.find(d => String(d.id) === String(deckId));
        if (!initialDeck) {
            initialDeck = { id: deckId, chapter_name: 'Current Deck', topic_name: 'Topic' };
        }

        setSelectedDeck(initialDeck);
        setCurrentIndex(0);
        setIsFlipped(false);
        setIsFinished(false);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [deckId, moduleId]);

  const loadItems = (deck) => {
    navigate(`/study-flashcards/${deck.id}${moduleId ? `?moduleId=${moduleId}` : ''}`);
  };

  const nextCard = useCallback(() => {
    if (currentIndex < items.length - 1) {
      playSound('nav');
      setIsFlipped(false);
      setTimeout(() => setCurrentIndex(prev => prev + 1), 150);
    } else if (currentIndex === items.length - 1) {
      setIsFinished(true);
    }
  }, [currentIndex, items.length]);

  const prevCard = useCallback(() => {
    if (currentIndex > 0) {
      playSound('nav');
      setIsFlipped(false);
      setIsFinished(false);
      setTimeout(() => setCurrentIndex(prev => prev - 1), 150);
    }
  }, [currentIndex]);

  const flipCard = useCallback(() => {
    playSound('flip');
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
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50  text-on-surface transition-colors">
        <div className="relative">
          <div className="absolute inset-0 bg-primary/50/20 blur-xl rounded-full animate-ping"></div>
          <div className="w-16 h-16 rounded-2xl bg-surface border border-primary/30 shadow-xl flex items-center justify-center relative z-10 text-primary">
            <Atom size={32} className="animate-spin" />
          </div>
        </div>
        <p className="mt-5 font-bold text-on-surface-variant/70 text-sm tracking-wide">{t('flashcards.study.loadingPlatform', 'جاري تحميل المنصة...')}</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-surface-container-lowest overflow-hidden font-sans" dir="ltr">
      
      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col min-h-0 relative z-10 w-full overflow-hidden bg-[#F8F9FA]" dir="rtl">
        
        {/* Flashcard Area */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 lg:p-10 flex flex-col items-center custom-scrollbar">
          <div className="w-full max-w-4xl mx-auto flex-1 flex flex-col justify-between gap-6">
            
            {/* Top Section: Back Button + Progress */}
            <div className="space-y-4 w-full">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 px-5 py-2.5 bg-white border border-outline-variant/30 text-on-surface-variant hover:text-[#5c4be4] hover:bg-[#5c4be4]/5 rounded-xl shadow-sm transition-all cursor-pointer font-bold text-sm w-max"
              >
                <ArrowRight size={18} />
                <span>{t('flashcards.study.backBtn', 'العودة')}</span>
              </button>

              {/* Top Header: Progress */}
              <div className="bg-white border border-outline-variant/30 rounded-2xl px-6 py-4 shadow-sm transition-colors">
              <div className="flex items-center justify-between gap-4 mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#5c4be4]/50 animate-pulse"></span>
                  <span className="text-sm font-black text-on-surface uppercase tracking-wide">
                    {t('flashcards.study.progressInChapter', 'التقدم في هذا القسم')}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-black text-[#5c4be4] bg-[#5c4be4]/10 px-3 py-1 rounded-full">
                    {progressPercent}%
                  </span>
                  <span className="text-xs font-bold text-on-surface-variant bg-surface-variant px-3 py-1 rounded-full border border-outline-variant/30">
                    {isFinished ? items.length : currentIndex + 1} / {items.length} {t('flashcards.study.cardUnit', 'بطاقة')}
                  </span>
                </div>
              </div>

              {/* Progress Line */}
              <div className="w-full h-2.5 bg-surface-variant rounded-full overflow-hidden p-0.5 border border-outline-variant/30/60">
                <div 
                  className="h-full bg-gradient-to-l from-[#5c4be4] to-[#7a6df1] rounded-full transition-all duration-500 ease-out shadow-sm"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Main Flashcard Core */}
            <div className="flex-1 flex flex-col items-center justify-center relative w-full perspective-1000 my-4 py-1">
              {isFinished ? (
                <div className="w-full max-w-xl bg-white border border-outline-variant/30 rounded-3xl p-10 text-center shadow-md animate-in fade-in zoom-in-95 duration-500">
                  <div className="w-20 h-20 bg-[#5c4be4]/10 text-[#5c4be4] rounded-full flex items-center justify-center mx-auto mb-6">
                    <Award size={40} />
                  </div>
                  <h2 className="text-3xl font-black text-on-surface mb-3">{t('flashcards.study.congratsTitle', 'تهانينا!')}</h2>
                  <p className="text-on-surface-variant/70 text-base mb-8 max-w-sm mx-auto">
                    {t('flashcards.study.congratsDesc', 'لقد أكملت جميع البطاقات في هذا القسم بنجاح.')}
                  </p>
                  <div className="flex items-center justify-center gap-3">
                    <button 
                      onClick={() => { setIsFinished(false); setCurrentIndex(0); setIsFlipped(false); }}
                      className="bg-[#5c4be4] hover:bg-[#4a3bc6] text-white px-8 py-3.5 rounded-xl font-bold text-sm transition-all shadow-md flex items-center gap-2 cursor-pointer"
                    >
                      <RotateCcw size={18} /> {t('flashcards.study.reviewAgain', 'مراجعة مرة أخرى')}
                    </button>
                  </div>
                </div>
              ) : items.length === 0 ? (
                <div className="w-full max-w-xl bg-white border border-outline-variant/30 rounded-3xl p-10 text-center shadow-md">
                   <h3 className="text-xl font-bold text-on-surface-variant">{t('flashcards.study.noCards', 'لا توجد بطاقات تعليمية متاحة.')}</h3>
                </div>
              ) : (
                <div 
                  className="relative w-full h-[320px] sm:h-[400px] cursor-pointer group select-none"
                  onClick={flipCard}
                >
                  <div className={`w-full h-full transition-transform duration-600 ease-[cubic-bezier(0.2,0.8,0.2,1)] transform-style-preserve-3d rounded-3xl shadow-lg ${isFlipped ? 'rotate-y-180' : ''}`}>
                    
                    {/* Front Face: Question */}
                    <div className="absolute inset-0 backface-hidden bg-white border-2 border-outline-variant/30 group-hover:border-[#5c4be4]/30 rounded-3xl p-8 sm:p-12 flex flex-col justify-between overflow-y-auto transition-colors">
                      <div className="flex items-center justify-between border-b border-outline-variant/30 pb-4">
                        <span className="px-3 py-1.5 rounded-lg bg-[#5c4be4]/10 text-[#5c4be4] text-xs font-black tracking-wide">
                          {t('flashcards.study.questionBadge', 'سؤال')}
                        </span>
                        <span className="text-xs font-bold text-on-surface-variant bg-surface-variant px-3 py-1.5 rounded-md">
                          {t('flashcards.study.clickToFlip', 'انقر للقلب')}
                        </span>
                      </div>
                      <div className="my-auto py-4 text-center">
                        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-on-surface leading-snug tracking-tight font-sans" dir="ltr">
                          {currentItem?.front_text}
                        </h2>
                      </div>
                      <div className="flex items-center justify-between text-xs text-on-surface-variant/50 pt-3 border-t border-outline-variant/30">
                        <span className="font-medium">
                           {selectedDeck?.topic_name || selectedDeck?.chapter_name}
                        </span>
                        <span className="text-[#5c4be4] font-bold hover:underline">
                          {t('flashcards.study.showFullAnswer', 'عرض الإجابة الكاملة')}
                        </span>
                      </div>
                    </div>
                    
                    {/* Back Face: Answer */}
                    <div className="absolute inset-0 backface-hidden rotate-y-180 bg-[#5c4be4] text-white border-2 border-[#5c4be4] rounded-3xl p-8 sm:p-12 flex flex-col justify-between overflow-y-auto shadow-xl">
                      <div className="flex items-center justify-between border-b border-white/20 pb-4">
                        <span className="px-3 py-1.5 rounded-lg bg-white/20 text-white text-xs font-black tracking-wide">
                          {t('flashcards.study.answerBadge', 'إجابة')}
                        </span>
                        <span className="text-xs font-bold text-white/80 bg-black/10 px-3 py-1.5 rounded-md">
                          {t('flashcards.study.clickToReturn', 'انقر للعودة')}
                        </span>
                      </div>
                      <div className="my-auto py-6 text-center">
                        <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-white leading-relaxed font-sans" dir="ltr">
                          {currentItem?.back_text}
                        </p>
                      </div>
                      <div className="bg-black/10 rounded-xl p-4 text-sm text-white/90 flex items-center justify-between">
                        <span className="font-bold flex items-center gap-2">
                          <CheckCircle2 size={18} /> {t('flashcards.study.verifiedConcept', 'مفهوم مؤكد')}
                        </span>
                        <span className="text-xs opacity-70 font-mono">
                          {t('flashcards.study.highYield', 'عالي الأهمية')}
                        </span>
                      </div>
                    </div>

                  </div>
                </div>
              )}
            </div>

            {/* Bottom Navigation */}
            {!isFinished && items.length > 0 && (
              <div className="mt-2 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white border border-outline-variant/30 p-4 rounded-2xl shadow-sm">
                
                <button 
                  onClick={prevCard} 
                  disabled={currentIndex === 0}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-surface-variant hover:bg-surface-container-low text-on-surface-variant font-bold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <ArrowRight size={18} />
                  <span>{t('flashcards.study.prevBtn', 'السابق')}</span>
                </button>
                
                <button
                  onClick={flipCard}
                  className="w-full sm:w-auto px-8 py-3 rounded-xl bg-[#5c4be4]/10 hover:bg-[#5c4be4]/20 text-[#5c4be4] font-black text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <RotateCcw size={18} />
                  <span>{t('flashcards.study.flipBtn', 'اقلب البطاقة')}</span>
                </button>

                <button 
                  onClick={nextCard} 
                  className="w-full sm:w-auto px-8 py-3 rounded-xl bg-[#5c4be4] hover:bg-[#4a3bc6] text-white font-black text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-[#5c4be4]/20 cursor-pointer"
                >
                  <span>{t('flashcards.study.nextBtn', 'التالي')}</span>
                  <ArrowLeft size={18} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  </div>
  )
}
