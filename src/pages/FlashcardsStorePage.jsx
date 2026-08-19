import React, { useState, useEffect, useContext, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import API from '../api/axios';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { 
  ShoppingCart, Check, Layers, Search, 
  Dna, Heart, Activity, Brain, Microscope, Pill, 
  Atom, ShieldCheck, Bone, Sparkles, ArrowLeft, ArrowRight,
  Flame, Eye, BookOpen, CheckCircle2, ChevronLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Specialized Medical Specialty Details Resolver
const getSpecialtyDetails = (title = '', description = '') => {
  const text = `${title} ${description}`.toLowerCase();
  
  if (text.includes('micro') || text.includes('bacter') || text.includes('virus') || text.includes('أحياء دقيقة') || text.includes('ميكرو')) {
    return {
      icon: Microscope,
      tag: 'علم الأحياء الدقيقة • Microbiology',
      accentColor: 'from-emerald-500 to-teal-600',
      badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800/80',
      iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/80',
      glow: 'group-hover:shadow-emerald-500/10'
    };
  }
  if (text.includes('cardio') || text.includes('heart') || text.includes('قلب') || text.includes('وعائ')) {
    return {
      icon: Heart,
      tag: 'الجهاز القلبي الوعائي • Cardiovascular',
      accentColor: 'from-rose-500 to-red-600',
      badgeBg: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800/80',
      iconBg: 'bg-rose-50 text-rose-600 border-rose-200/80 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800/80',
      glow: 'group-hover:shadow-rose-500/10'
    };
  }
  if (text.includes('pharm') || text.includes('drug') || text.includes('صيدل') || text.includes('دواء') || text.includes('علاج')) {
    return {
      icon: Pill,
      tag: 'علم الصيدلة والعقاقير • Pharmacology',
      accentColor: 'from-amber-500 to-orange-600',
      badgeBg: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800/80',
      iconBg: 'bg-amber-50 text-amber-600 border-amber-200/80 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/80',
      glow: 'group-hover:shadow-amber-500/10'
    };
  }
  if (text.includes('neuro') || text.includes('brain') || text.includes('عصب') || text.includes('دماغ')) {
    return {
      icon: Brain,
      tag: 'الجهاز العصبي • Neuroanatomy & Neurology',
      accentColor: 'from-purple-500 to-indigo-600',
      badgeBg: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800/80',
      iconBg: 'bg-purple-50 text-purple-600 border-purple-200/80 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-800/80',
      glow: 'group-hover:shadow-purple-500/10'
    };
  }
  if (text.includes('bio') || text.includes('chem') || text.includes('dna') || text.includes('كيمياء') || text.includes('جزيئ') || text.includes('وراث')) {
    return {
      icon: Dna,
      tag: 'الكيمياء الحيوية والوراثة • Biochemistry & Genetics',
      accentColor: 'from-cyan-500 to-teal-600',
      badgeBg: 'bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/50 dark:text-cyan-300 dark:border-cyan-800/80',
      iconBg: 'bg-cyan-50 text-cyan-600 border-cyan-200/80 dark:bg-cyan-950/40 dark:text-cyan-400 dark:border-cyan-800/80',
      glow: 'group-hover:shadow-cyan-500/10'
    };
  }
  if (text.includes('bone') || text.includes('osteo') || text.includes('anat') || text.includes('تشريح') || text.includes('عظام')) {
    return {
      icon: Bone,
      tag: 'التشريح وعلم العظام • Anatomy & Orthopedics',
      accentColor: 'from-sky-500 to-blue-600',
      badgeBg: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/50 dark:text-sky-300 dark:border-sky-800/80',
      iconBg: 'bg-sky-50 text-sky-600 border-sky-200/80 dark:bg-sky-950/40 dark:text-sky-400 dark:border-sky-800/80',
      glow: 'group-hover:shadow-sky-500/10'
    };
  }
  if (text.includes('patho') || text.includes('أمراض') || text.includes('نسج')) {
    return {
      icon: ShieldCheck,
      tag: 'علم الأمراض والمناعة • Pathology & Immunology',
      accentColor: 'from-indigo-500 to-teal-600',
      badgeBg: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-800/80',
      iconBg: 'bg-indigo-50 text-indigo-600 border-indigo-200/80 dark:bg-indigo-950/40 dark:text-indigo-400 dark:border-indigo-800/80',
      glow: 'group-hover:shadow-indigo-500/10'
    };
  }

  return {
    icon: Atom,
    tag: 'العلوم الطبية التخصصية • Medical Sciences',
    accentColor: 'from-teal-600 to-cyan-700',
    badgeBg: 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/50 dark:text-teal-300 dark:border-teal-800/80',
    iconBg: 'bg-teal-50 text-teal-600 border-teal-200/80 dark:bg-teal-950/40 dark:text-teal-400 dark:border-teal-800/80',
    glow: 'group-hover:shadow-teal-500/10'
  };
};

export default function FlashcardsStorePage() {
  const { t } = useTranslation();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('ALL');
  
  const { addToCart, cart } = useContext(CartContext);
  const cartItems = cart?.cart?.items || [];
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    API.get('/store/flashcards') 
      .then(res => setProducts(res.data.products || []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleAddToCart = (product) => {
    if (!user) {
      navigate('/login');
      return;
    }
    addToCart(product.id, 'flashcard_product');
  };

  const isInCart = (id) => cartItems.some(i => i.flashcard_product_id === id);

  // Filter Categories
  const categories = [
    { id: 'ALL', label: t('flashcards.store.allSpecialties') },
    { id: 'bio', label: t('flashcards.store.catBiochem') },
    { id: 'pharm', label: t('flashcards.store.catPharma') },
    { id: 'cardio', label: t('flashcards.store.catCardio') },
    { id: 'micro', label: t('flashcards.store.catMicro') },
    { id: 'neuro', label: t('flashcards.store.catNeuro') },
    { id: 'anat', label: t('flashcards.store.catAnat') }
  ];

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchSearch = (p.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (p.description || '').toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchSearch) return false;
      if (selectedFilter === 'ALL') return true;
      const text = `${p.title} ${p.description}`.toLowerCase();
      return text.includes(selectedFilter);
    });
  }, [products, searchQuery, selectedFilter]);

  return (
    <div 
      className="min-h-screen pb-28 pt-6 sm:pt-8 px-4 sm:px-6 lg:px-10 max-w-7xl mx-auto text-slate-900 dark:text-slate-100 relative overflow-hidden transition-colors" 
      dir="rtl"
      style={{
        backgroundImage: `radial-gradient(#cbd5e1 0.75px, transparent 0.75px), radial-gradient(#cbd5e1 0.75px, transparent 0.75px)`,
        backgroundSize: `30px 30px`,
        backgroundPosition: `0 0, 15px 15px`
      }}
    >
      {/* Soft Ambient Clinical Glow */}
      <div className="absolute top-10 right-1/4 w-96 h-96 bg-teal-400/5 dark:bg-teal-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-40 left-1/4 w-96 h-96 bg-cyan-400/5 dark:bg-cyan-400/10 rounded-full blur-3xl pointer-events-none" />

      {/* ═════════════════════════════════════════════
          1. Header Banner: معرض الموارد الطبية الفاخر
         ═════════════════════════════════════════════ */}
      <div className="relative rounded-3xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800 p-8 sm:p-12 shadow-[0_10px_35px_rgba(0,0,0,0.03)] dark:shadow-[0_10px_35px_rgba(0,0,0,0.3)] text-center space-y-4 mb-10 overflow-hidden transition-colors">
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-teal-500/10 to-transparent rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-cyan-500/10 to-transparent rounded-full blur-2xl pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50 dark:bg-teal-950/60 border border-teal-200/80 dark:border-teal-800/80 text-teal-700 dark:text-teal-300 text-xs font-black tracking-wide shadow-2xs">
          <Sparkles size={14} className="text-teal-600 dark:text-teal-400" />
          <span>{t('flashcards.store.badge')}</span>
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-slate-100 tracking-tight leading-tight">
          {t('flashcards.store.title')}
        </h1>
        
        <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
          {t('flashcards.store.subtitle')}
        </p>

        {/* Search & Filter Controls */}
        <div className="pt-4 max-w-xl mx-auto">
          <div className="relative flex items-center">
            <Search size={18} className="absolute right-4 text-slate-400 dark:text-slate-500 pointer-events-none" />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('flashcards.store.searchPlaceholder')}
              className="w-full pl-4 pr-11 py-3 bg-slate-50/90 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all shadow-inner"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center justify-center flex-wrap gap-2 pt-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedFilter(cat.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedFilter === cat.id
                  ? 'bg-teal-600 dark:bg-teal-500 text-white shadow-sm shadow-teal-600/20'
                  : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/80 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* ═════════════════════════════════════════════
          2. Gallery Grid: البطاقات الطبية المتخصصة
         ═════════════════════════════════════════════ */}
      {loading ? (
        <div className="min-h-[40vh] flex flex-col items-center justify-center">
          <div className="w-14 h-14 rounded-2xl bg-white dark:bg-slate-900 border border-teal-200 dark:border-teal-800 shadow-lg flex items-center justify-center text-teal-600 dark:text-teal-400 mb-3 animate-pulse">
            <Atom size={28} className="animate-spin" />
          </div>
          <span className="text-xs font-bold text-slate-400 dark:text-slate-500">{t('flashcards.store.loading')}</span>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white/80 dark:bg-slate-900/80 rounded-3xl border border-slate-200 dark:border-slate-800 p-12 text-center max-w-md mx-auto shadow-sm">
          <BookOpen size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
          <h3 className="text-base font-bold text-slate-700 dark:text-slate-200 mb-1">{t('flashcards.store.noResults')}</h3>
          <p className="text-xs text-slate-400 dark:text-slate-500">{t('flashcards.store.noResultsDesc')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
          {filteredProducts.map(p => {
            const specialty = getSpecialtyDetails(p.title, p.description);
            const IconComponent = specialty.icon;
            const inCart = isInCart(p.id);

            return (
              <div 
                key={p.id} 
                className={`group bg-white/95 dark:bg-slate-900/95 rounded-3xl border border-slate-200/90 dark:border-slate-800 hover:border-teal-500/40 dark:hover:border-teal-500/50 p-6 flex flex-col justify-between transition-all duration-300 hover:shadow-[0_15px_35px_rgba(15,23,42,0.06)] dark:hover:shadow-[0_15px_35px_rgba(0,0,0,0.3)] relative overflow-hidden ${specialty.glow}`}
              >
                {/* Top Accent Line */}
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${specialty.accentColor}`} />

                <div>
                  {/* Category Badge & Price Header */}
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border ${specialty.badgeBg} truncate max-w-[200px]`}>
                      {specialty.tag.split('•')[0]}
                    </span>
                    <div className="flex items-baseline gap-1 text-slate-900 dark:text-slate-100 shrink-0 font-mono">
                      <span className="text-xs font-bold text-teal-600 dark:text-teal-400">$</span>
                      <span className="text-xl font-black">{parseFloat(p.price || 0).toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Icon & Title */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform ${specialty.iconBg}`}>
                      <IconComponent size={26} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-black text-slate-900 dark:text-slate-100 text-base leading-snug group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors line-clamp-2">
                        {p.title}
                      </h3>
                      <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500 tracking-wider">
                        {t('flashcards.store.suiteSubtitle')}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 mb-6 leading-relaxed">
                    {p.description || t('flashcards.store.defaultDesc')}
                  </p>
                </div>

                {/* Bottom Action Section */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3">
                  <button 
                    onClick={() => handleAddToCart(p)}
                    disabled={inCart}
                    className={`w-full py-3 px-4 rounded-xl font-black text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      inCart 
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 cursor-not-allowed shadow-none'
                      : 'bg-gradient-to-l from-teal-600 to-cyan-700 hover:from-teal-700 hover:to-cyan-800 text-white shadow-md shadow-teal-700/20 hover:shadow-lg'
                    }`}
                  >
                    {inCart ? (
                      <>
                        <Check size={16} className="text-emerald-600 dark:text-emerald-400" />
                        <span>{t('flashcards.store.addedToCart')}</span>
                      </>
                    ) : (
                      <>
                        <ShoppingCart size={16} />
                        <span>{t('flashcards.store.addToCart')}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ═════════════════════════════════════════════
          3. Floating Cart Console: السلة الحالية المنسقة
         ═════════════════════════════════════════════ */}
      {cartItems.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-8 duration-400">
          <div className="bg-slate-900/95 dark:bg-slate-950/95 backdrop-blur-xl border border-teal-500/40 shadow-[0_20px_50px_rgba(15,23,42,0.3)] text-white rounded-full p-2 pl-3 pr-6 flex items-center gap-6">
            
            <div className="flex items-center gap-3.5">
              <div className="relative">
                <div className="w-10 h-10 bg-teal-500/20 text-teal-400 rounded-full flex items-center justify-center border border-teal-400/30">
                  <ShoppingCart size={18} />
                </div>
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-teal-500 text-slate-950 font-black text-[11px] rounded-full flex items-center justify-center border-2 border-slate-900">
                  {cartItems.length}
                </span>
              </div>

              <div>
                <p className="text-xs font-black text-white leading-tight">{t('flashcards.store.cartTitle')}</p>
                <p className="text-[10px] text-teal-300/80 font-mono">
                  {cartItems.length} {cartItems.length === 1 ? t('flashcards.store.itemSingle') : t('flashcards.store.itemsPlural')}
                </p>
              </div>
            </div>
            
            <button 
              onClick={() => navigate('/cart')}
              className="bg-gradient-to-l from-teal-500 to-emerald-400 hover:from-teal-400 hover:to-emerald-300 text-slate-950 px-5 py-2.5 rounded-full font-black text-xs transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <span>{t('flashcards.store.checkout')}</span>
              <ChevronLeft size={16} />
            </button>

          </div>
        </div>
      )}
    </div>
  );
}
