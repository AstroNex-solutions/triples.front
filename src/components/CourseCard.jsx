import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { 
  Star, 
  Users, 
  Clock, 
  ShoppingCart, 
  Stethoscope, 
  ShieldCheck, 
  Activity, 
  Loader2,
  Check
} from 'lucide-react';
import { CartContext } from '../context/CartContext';

export default function CourseCard({ course }) {
  const { addToCart } = useContext(CartContext);
  const [loading, setLoading] = useState(false);
  const [added, setAdded] = useState(false);

  // صورة افتراضية ذات طابع طبي أكاديمي
  const defaultImg = 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80';
  const imgUrl = course.image 
    ? (course.image.startsWith('http') ? course.image : course.image) 
    : defaultImg;

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setLoading(true);
    try {
      await addToCart(course.id);
      setAdded(true);
      setTimeout(() => setAdded(false), 2500);
    } catch (err) {
      console.error('Error adding to cart:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      dir="rtl" 
      className="group relative rounded-3xl bg-surface-container-low/70 border border-outline-variant/40 hover:border-emerald-500/40 backdrop-blur-xl overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-emerald-500/10 flex flex-col h-full"
    >
      {/* 1. Course Thumbnail Container */}
      <div className="relative h-48 w-full overflow-hidden bg-slate-900">
        <img 
          src={import.meta.env.VITE_API_URL+imgUrl} 
          alt={course.title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/20" />

        {/* Top Badges */}
        <div className="absolute top-3 right-3 left-3 flex items-center justify-between pointer-events-none">
          {/* Category Badge */}
          <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-slate-900/80 backdrop-blur-md text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
            <Stethoscope size={13} className="text-emerald-400" />
            <span>{course.category?.name || 'علوم طبية'}</span>
          </span>

          {/* Featured Badge */}
          {course.is_featured && (
            <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-amber-500/20 backdrop-blur-md text-amber-300 border border-amber-500/40 flex items-center gap-1 shadow-sm">
              <span>اعتماد خاص ✨</span>
            </span>
          )}
        </div>

        {/* Rating overlay bottom left */}
        <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 flex items-center gap-1 text-amber-400 font-bold text-xs">
          <Star size={13} className="fill-amber-400" />
          <span>{course.average_rating || 5.0}</span>
        </div>
      </div>

      {/* 2. Course Details Body */}
      <div className="p-5 flex flex-col flex-1 justify-between space-y-4">
        <div className="space-y-2">
          {/* Medical Sub-Badge / Accreditation info */}
          <div className="flex items-center gap-2 text-[11px] text-emerald-400/90 font-medium">
            <ShieldCheck size={14} className="shrink-0" />
            <span>دورة طبية معتمدة ومحدثة</span>
          </div>

          {/* Title */}
          <h3 className="text-base font-extrabold text-on-surface line-clamp-2 leading-snug group-hover:text-emerald-400 transition-colors">
            <Link to={`/courses/${course.slug}`}>
              {course.title}
            </Link>
          </h3>

          {/* Subtitle or Short Description */}
          <p className="text-xs text-on-surface-variant line-clamp-2 leading-relaxed">
            {course.subtitle || course.short_description || 'منهاج طبي شامل يغطي الجوانب النظرية والتطبيقية المعتمدة.'}
          </p>
        </div>

        {/* Meta Stats Row */}
        <div className="flex items-center justify-between text-xs text-on-surface-variant/80 border-t border-outline-variant/30 pt-3">
          <div className="flex items-center gap-1.5">
            <Users size={14} className="text-primary" />
            <span>{course.total_enrollments || 0} متدرب</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Activity size={14} className="text-emerald-400" />
            <span>تطبيقات عملية</span>
          </div>
        </div>

        {/* 3. Footer Price & Actions */}
        <div className="border-t border-outline-variant/30 pt-3.5 flex items-center justify-between gap-2 mt-auto">
          {/* Price Tag */}
          <div>
            {course.is_free ? (
              <span className="text-base font-black text-emerald-400">مجاناً</span>
            ) : (
              <div className="flex items-baseline gap-1.5">
                <span className="text-lg font-black text-on-surface" dir="ltr">${course.discount_price || course.price}</span>
                {course.discount_price && (
                  <span className="text-xs font-bold text-on-surface-variant/60 line-through" dir="ltr">
                    ${course.price}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button 
              onClick={handleAddToCart}
              disabled={loading}
              className={`p-2.5 rounded-xl border transition-all flex items-center justify-center ${
                added 
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' 
                  : 'bg-surface border-outline-variant/60 text-on-surface-variant hover:text-emerald-400 hover:border-emerald-500/40 hover:bg-emerald-500/10'
              }`}
              title="إضافة إلى سلة الشراء"
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin text-emerald-400" />
              ) : added ? (
                <Check size={16} className="text-emerald-400" />
              ) : (
                <ShoppingCart size={16} />
              )}
            </button>

            <Link 
              to={`/courses/${course.slug}`} 
              className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-500/15 transition-all flex items-center justify-center shrink-0"
            >
              تفاصيل الدورة
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}