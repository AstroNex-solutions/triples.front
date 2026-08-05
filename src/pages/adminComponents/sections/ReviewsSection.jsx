import React, { useState, useEffect } from 'react';
import API from '../../../api/axios';
import { Loader2, Eye, Lock } from 'lucide-react';
import { SectionHeader, Card, Badge } from '../ui/SharedUI';

export default function ReviewsSection({ showMsg }) {
  const [reviews, setReviews] = useState([]);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = () => { setLoading(true); Promise.all([API.get('/admin/reviews'), API.get('/admin/comments')]).then(([r, c]) => { setReviews(r.data.reviews); setComments(c.data.comments); }).catch(console.error).finally(() => setLoading(false)); };
  useEffect(() => { fetchData(); }, []);

  const toggleReview = async (id) => { try { await API.post(`/admin/reviews/${id}/toggle`); showMsg('success', 'تم تحديث التقييم'); fetchData(); } catch { showMsg('error', 'خطأ'); } };
  const toggleComment = async (id) => { try { await API.post(`/admin/comments/${id}/toggle`); showMsg('success', 'تم تحديث التعليق'); fetchData(); } catch { showMsg('error', 'خطأ'); } };

  if (loading) return <div className="py-12 flex justify-center"><Loader2 size={24} className="animate-spin text-primary" /></div>;

  return (
    <>
      <SectionHeader title="تقييمات الكورسات" count={reviews.length} />
      <Card className="mb-6">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs sm:text-sm border-separate border-spacing-y-1">
            <thead><tr className="text-on-surface-variant/70"><th className="p-3">المستخدم</th><th className="p-3">الكورس</th><th className="p-3">التقييم</th><th className="p-3">النص</th><th className="p-3">حالة</th><th className="p-3 text-center">تبديل</th></tr></thead>
            <tbody>{reviews.map(r => (
              <tr key={r.id} className="bg-surface/50 hover:bg-surface/80 transition-all">
                <td className="p-3 font-bold text-on-surface">{r.user?.name || '—'}</td>
                <td className="p-3 text-on-surface-variant">{r.Course?.title || '—'}</td>
                <td className="p-3">{'⭐'.repeat(r.rating)}</td>
                <td className="p-3 text-xs text-on-surface-variant max-w-[200px] truncate">{r.review_text || '—'}</td>
                <td className="p-3">{r.is_approved ? <Badge text="ظاهر" variant="success" /> : <Badge text="مخفي" variant="danger" />}</td>
                <td className="p-3 text-center"><button onClick={() => toggleReview(r.id)} className="p-1.5 rounded-lg bg-surface border border-outline-variant/40 text-on-surface-variant hover:text-primary transition-all cursor-pointer">{r.is_approved ? <Eye size={14} /> : <Lock size={14} />}</button></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </Card>

      <SectionHeader title="تعليقات الدروس" count={comments.length} />
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs sm:text-sm border-separate border-spacing-y-1">
            <thead><tr className="text-on-surface-variant/70"><th className="p-3">المستخدم</th><th className="p-3">الكورس</th><th className="p-3">النص</th><th className="p-3">حالة</th><th className="p-3 text-center">تبديل</th></tr></thead>
            <tbody>{comments.map(c => (
              <tr key={c.id} className="bg-surface/50 hover:bg-surface/80 transition-all">
                <td className="p-3 font-bold text-on-surface">{c.user?.name || '—'}</td>
                <td className="p-3 text-on-surface-variant">{c.Course?.title || '—'}</td>
                <td className="p-3 text-xs text-on-surface-variant max-w-[200px] truncate">{c.content}</td>
                <td className="p-3">{c.is_active ? <Badge text="ظاهر" variant="success" /> : <Badge text="مخفي" variant="danger" />}</td>
                <td className="p-3 text-center"><button onClick={() => toggleComment(c.id)} className="p-1.5 rounded-lg bg-surface border border-outline-variant/40 text-on-surface-variant hover:text-primary transition-all cursor-pointer">{c.is_active ? <Eye size={14} /> : <Lock size={14} />}</button></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
