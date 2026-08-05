import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axios';
import { 
  BookOpen, 
  Calendar, 
  User as UserIcon, 
  Eye, 
  Sparkles, 
  ArrowLeft,
  Newspaper,
  Clock
} from 'lucide-react';

export default function ArticlesPage() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/extras/articles')
      .then(res => setArticles(res.data.articles || []))
      .catch(err => console.error('Error fetching articles:', err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen pb-20 pt-6 px-4 sm:px-6 lg:px-12 max-w-container-max mx-auto space-y-8" dir="rtl">
      
      {/* 1. Page Header & Hero Section */}
      <div className="relative rounded-3xl bg-surface-container-low/70 border border-outline-variant/40 p-6 sm:p-10 backdrop-blur-xl overflow-hidden shadow-sm">
        <div className="absolute -top-12 -right-12 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold border border-primary/20">
            <Newspaper size={15} />
            <span>المكتبة الطبية الأكاديمية</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-on-surface tracking-tight">
            المدونة والأخبار الطبية
          </h1>
          <p className="text-on-surface-variant text-sm sm:text-base leading-relaxed">
            استكشف أحدث المقالات العلمية، الأبحاث، والأخبار الطبية والمراجعات الأكاديمية المعدّة بواسطة نخبة من المتخصصين والأطباء.
          </p>
        </div>
      </div>

      {/* 2. Articles Grid & Loading States */}
      {loading ? (
        /* Skeleton Grid Loading */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div 
              key={n} 
              className="rounded-3xl bg-surface-container-low/50 border border-outline-variant/30 h-[420px] animate-pulse p-5 flex flex-col justify-between"
            >
              <div className="w-full h-48 bg-surface-container-high/60 rounded-2xl" />
              <div className="space-y-3 mt-4">
                <div className="h-5 bg-surface-container-high/80 rounded-md w-3/4" />
                <div className="h-3 bg-surface-container-high/50 rounded-md w-full" />
                <div className="h-3 bg-surface-container-high/50 rounded-md w-2/3" />
              </div>
              <div className="h-10 bg-surface-container-high/70 rounded-xl mt-6" />
            </div>
          ))}
        </div>
      ) : articles.length === 0 ? (
        /* Empty State */
        <div className="rounded-3xl border border-dashed border-outline-variant/60 p-12 text-center bg-surface-container-low/30 backdrop-blur-sm space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-surface-container-high text-on-surface-variant mx-auto flex items-center justify-center">
            <BookOpen size={32} />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-on-surface">لا توجد مقالات مضافة حالياً</h3>
            <p className="text-sm text-on-surface-variant max-w-md mx-auto">
              لم يتم نشر أي مقالات علمية في المدونة في الوقت الحالي. يرجى العودة لاحقاً لمتابعة التحديثات.
            </p>
          </div>
        </div>
      ) : (
        /* Articles Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((art) => {
            const formattedDate = art.created_at 
              ? new Date(art.created_at).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' })
              : 'منذ فترة';

            return (
              <article 
                key={art.id} 
                className="group relative rounded-3xl bg-surface-container-low/60 hover:bg-surface border border-outline-variant/40 hover:border-primary/30 p-5 flex flex-col justify-between backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div>
                  {/* Article Thumbnail */}
                  <div className="relative w-full h-48 rounded-2xl overflow-hidden mb-4 bg-surface-container-high">
                    {art.image ? (
                      <img 
                        src={art.image} 
                        alt={art.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-primary/5 text-primary/40">
                        <BookOpen size={48} />
                      </div>
                    )}
                    
                    {/* Badge */}
                    <div className="absolute top-3 right-3 bg-surface/90 backdrop-blur-md text-primary text-[11px] font-bold px-3 py-1 rounded-full border border-outline-variant/40 flex items-center gap-1 shadow-sm">
                      <Sparkles size={12} className="text-secondary-fixed" />
                      <span>مقالة مميزة</span>
                    </div>
                  </div>

                  {/* Article Meta Header */}
                  <div className="flex items-center gap-4 text-xs text-on-surface-variant/80 mb-3">
                    <span className="flex items-center gap-1">
                      <Calendar size={13} className="text-primary/70" />
                      {formattedDate}
                    </span>
                    {art.author_name && (
                      <span className="flex items-center gap-1">
                        <UserIcon size={13} className="text-primary/70" />
                        {art.author_name}
                      </span>
                    )}
                  </div>

                  {/* Title & Excerpt */}
                  <h2 className="text-lg font-extrabold text-on-surface group-hover:text-primary transition-colors line-clamp-2 leading-snug mb-2">
                    {art.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-on-surface-variant/80 line-clamp-3 leading-relaxed mb-4">
                    {art.summary || art.content?.replace(/<[^>]*>?/gm, '').substring(0, 130) + '...'}
                  </p>
                </div>

                {/* Article Card Footer */}
                <div className="pt-4 border-t border-outline-variant/30 flex items-center justify-between mt-auto">
                  <div className="flex items-center gap-1 text-xs text-on-surface-variant/70">
                    <Eye size={14} />
                    <span>{art.views_count || 0} مشاهدة</span>
                  </div>

                  <Link 
                    to={`/articles/${art.id}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary-hover transition-colors"
                  >
                    <span>اقرأ المقال</span>
                    <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-1" />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      )}

    </div>
  );
}