import { useOutletContext } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import API from '../../../api/axios';
import { Loader2, Eye, EyeOff, MessageSquare, Star, User, BookOpen } from 'lucide-react';
import { SectionHeader, Badge } from '../ui/SharedUI';

export default function ReviewsSection() {
  const { showMsg } = useOutletContext();
  const { t, i18n } = useTranslation();
  const [reviews, setReviews] = useState([]);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('reviews');

  const fetchData = () => { 
    setLoading(true); 
    Promise.all([API.get('/admin/reviews'), API.get('/admin/comments')])
      .then(([r, c]) => { 
        setReviews(r.data.reviews || []); 
        setComments(c.data.comments || []); 
      })
      .catch(console.error)
      .finally(() => setLoading(false)); 
  };
  
  useEffect(() => { fetchData(); }, []);

  const toggleReview = async (id) => { 
    try { await API.post(`/admin/reviews/${id}/toggle`); showMsg('success', 'Review status updated'); fetchData(); } 
    catch { showMsg('error', 'Error updating status'); } 
  };
  
  const toggleComment = async (id) => { 
    try { await API.post(`/admin/comments/${id}/toggle`); showMsg('success', 'Comment status updated'); fetchData(); } 
    catch { showMsg('error', 'Error updating status'); } 
  };

  const getInitials = (name) => name ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'U';

  const ReviewCard = ({ item, isComment }) => {
    const title = item.Course?.[`title_${i18n.language}`] || item.Course?.title || 'Unknown Course';
    const isActive = isComment ? item.is_active : item.is_approved;
    const date = new Date(item.createdAt).toLocaleDateString(i18n.language === 'en' ? 'en-US' : 'ar-EG', { year: 'numeric', month: 'short', day: 'numeric' });

    return (
      <div className={`p-5 rounded-3xl border transition-all duration-300 relative group flex flex-col h-full ${
        isActive 
          ? 'bg-surface border-outline-variant/30 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5' 
          : 'bg-surface-container-low border-outline-variant/10 opacity-70 grayscale-[20%]'
      }`}>
        
        {/* Header: User & Course */}
        <div className="flex justify-between items-start mb-4 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-violet-500 text-on-primary flex items-center justify-center font-bold text-sm shadow-md shrink-0">
              {getInitials(item.user?.name)}
            </div>
            <div>
              <h4 className="font-bold text-on-surface text-sm">{item.user?.name || 'Unknown Student'}</h4>
              <div className="flex items-center gap-1.5 text-xs text-on-surface-variant mt-0.5">
                <BookOpen size={12} className="text-primary/70" />
                <span className="truncate max-w-[150px]" title={title}>{title}</span>
              </div>
            </div>
          </div>
          <div className="shrink-0 flex flex-col items-end gap-2">
            <span className="text-[10px] text-on-surface-variant font-bold">{date}</span>
            <Badge text={isActive ? 'Visible' : 'Hidden'} variant={isActive ? 'success' : 'default'} />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 mb-4">
          {!isComment && (
            <div className="flex items-center gap-1 mb-2">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={14} className={i < item.rating ? 'fill-amber-400 text-amber-400' : 'fill-surface-variant/30 text-surface-variant/30'} />
              ))}
            </div>
          )}
          <p className="text-sm text-on-surface/80 leading-relaxed italic line-clamp-4 relative">
            "{isComment ? item.content : item.review_text}"
          </p>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-outline-variant/20 flex justify-end">
          <button 
            onClick={() => isComment ? toggleComment(item.id) : toggleReview(item.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
              isActive 
                ? 'bg-rose-500/10 text-rose-500 hover:bg-rose-500/20' 
                : 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20'
            }`}
          >
            {isActive ? (
              <><EyeOff size={14} /> Hide</>
            ) : (
              <><Eye size={14} /> Approve & Show</>
            )}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <SectionHeader 
        title={t('admin.sections.reviews.title')} 
        count={activeTab === 'reviews' ? reviews.length : comments.length} 
      />

      {/* Modern Tabs */}
      <div className="flex flex-wrap gap-2 p-1 bg-surface-container-high rounded-2xl w-fit shadow-inner">
        <button 
          onClick={() => setActiveTab('reviews')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'reviews' 
              ? 'bg-primary text-on-primary shadow-md shadow-primary/20 scale-100' 
              : 'text-on-surface-variant hover:text-on-surface hover:bg-surface scale-95'
          }`}
        >
          <Star size={16} className={activeTab === 'reviews' ? 'fill-on-primary' : ''} />
          Course Reviews / تقييمات الكورسات
        </button>
        <button 
          onClick={() => setActiveTab('comments')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'comments' 
              ? 'bg-primary text-on-primary shadow-md shadow-primary/20 scale-100' 
              : 'text-on-surface-variant hover:text-on-surface hover:bg-surface scale-95'
          }`}
        >
          <MessageSquare size={16} className={activeTab === 'comments' ? 'fill-on-primary' : ''} />
          Lesson Comments / تعليقات الدروس
        </button>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center"><Loader2 size={32} className="animate-spin text-primary" /></div>
      ) : (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {activeTab === 'reviews' && (
            reviews.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {reviews.map(r => <ReviewCard key={r.id} item={r} isComment={false} />)}
              </div>
            ) : (
              <div className="py-20 text-center border border-dashed border-outline-variant/40 rounded-3xl bg-surface-container-low/50">
                <Star size={48} className="mx-auto text-on-surface-variant/30 mb-4" />
                <p className="text-on-surface-variant font-bold text-lg">No reviews found.</p>
              </div>
            )
          )}

          {activeTab === 'comments' && (
            comments.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {comments.map(c => <ReviewCard key={c.id} item={c} isComment={true} />)}
              </div>
            ) : (
              <div className="py-20 text-center border border-dashed border-outline-variant/40 rounded-3xl bg-surface-container-low/50">
                <MessageSquare size={48} className="mx-auto text-on-surface-variant/30 mb-4" />
                <p className="text-on-surface-variant font-bold text-lg">No comments found.</p>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}
