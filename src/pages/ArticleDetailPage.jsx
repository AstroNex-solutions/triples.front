import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../api/axios';
import { 
  ArrowLeft, Calendar, Eye, User as UserIcon, Loader2
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function ArticleDetailPage() {
  const { id } = useParams();
  const { t, i18n } = useTranslation();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get(`/extras/articles/${id}`)
      .then(res => setArticle(res.data.article))
      .catch(err => console.error('Error fetching article:', err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-primary" />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <h2 className="text-2xl font-bold text-on-surface">Article not found</h2>
        <Link to="/articles" className="text-primary hover:underline">
          Return to Articles
        </Link>
      </div>
    );
  }

  const title = article[`title_${i18n.language}`] || article.title;
  const content = article[`content_${i18n.language}`] || article.content;
  const date = new Date(article.created_at || article.createdAt).toLocaleDateString(
    i18n.language === 'en' ? 'en-US' : 'ar-EG', 
    { year: 'numeric', month: 'long', day: 'numeric' }
  );

  return (
    <div className="min-h-screen pb-20 pt-6 px-4 sm:px-6 max-w-4xl mx-auto space-y-8">
      {/* Back Button */}
      <Link to="/articles" className="inline-flex items-center gap-2 text-primary hover:text-primary-hover font-bold transition-colors">
        <ArrowLeft size={18} className={i18n.language === 'ar' ? 'rotate-180' : ''} />
        <span>{t('staticPages.articles.title') || 'Articles'}</span>
      </Link>

      {/* Article Header */}
      <div className="space-y-6">
        {article.image && (
          <div className="w-full h-[300px] sm:h-[400px] rounded-3xl overflow-hidden shadow-lg border border-outline-variant/30">
            <img src={article.image} alt={title} className="w-full h-full object-cover" />
          </div>
        )}
        
        <h1 className="text-3xl sm:text-5xl font-extrabold text-on-surface leading-tight">
          {title}
        </h1>

        <div className="flex flex-wrap items-center gap-4 text-sm text-on-surface-variant/80 border-b border-outline-variant/30 pb-6">
          <span className="flex items-center gap-1.5 bg-surface-container-high px-3 py-1.5 rounded-full">
            <Calendar size={14} className="text-primary" />
            <span className="font-bold">{date}</span>
          </span>
          
          {article.author?.name && (
            <span className="flex items-center gap-1.5 bg-surface-container-high px-3 py-1.5 rounded-full">
              <UserIcon size={14} className="text-primary" />
              <span className="font-bold">{article.author.name}</span>
            </span>
          )}

          <span className="flex items-center gap-1.5 bg-surface-container-high px-3 py-1.5 rounded-full">
            <Eye size={14} className="text-primary" />
            <span className="font-bold">{article.views_count || 0}</span>
          </span>
        </div>
      </div>

      {/* Article Content */}
      <div 
        className="prose prose-lg dark:prose-invert prose-p:text-on-surface prose-headings:text-on-surface max-w-none prose-a:text-primary prose-img:rounded-2xl"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </div>
  );
}
