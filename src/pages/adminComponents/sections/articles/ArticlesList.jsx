import React from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2, Trash2, Edit } from 'lucide-react';
import { SectionHeader, Card, statusBadge } from '../../ui/SharedUI';

export default function ArticlesList({ articles, loading, onAdd, onEdit, onDelete }) {
  const { t, i18n } = useTranslation();

  return (
    <>
      <SectionHeader 
        title={t('admin.sections.articles.title')} 
        count={articles.length} 
        onAdd={onAdd} 
        addLabel={t('admin.sections.articles.addArticle')} 
      />
      {loading ? <div className="py-12 flex justify-center"><Loader2 size={24} className="animate-spin text-primary" /></div> : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-start text-xs sm:text-sm border-separate border-spacing-y-1">
              <thead>
                <tr className="text-on-surface-variant/70">
                  <th className="p-3 text-start">{t('admin.sections.articles.articleTitle')}</th>
                  <th className="p-3 text-start">{t('admin.sections.articles.author')}</th>
                  <th className="p-3 text-start">{t('admin.common.status')}</th>
                  <th className="p-3 text-start">{t('admin.sections.articles.views')}</th>
                  <th className="p-3 text-center">{t('admin.common.actions')}</th>
                </tr>
              </thead>
              <tbody>{articles.map(a => {
                const aTitle = a[`title_${i18n.language}`] || a.title;
                return (
                  <tr key={a.id} className="bg-surface/50 hover:bg-surface/80 transition-all">
                    <td className="p-3 font-bold text-on-surface max-w-[200px] truncate">
                      <div className="flex items-center gap-3">
                        {a.image ? (
                          <img src={import.meta.env.VITE_API_URL + a.image} alt={aTitle} className="w-10 h-10 object-cover rounded shadow-sm" />
                        ) : (
                          <div className="w-10 h-10 bg-primary/10 rounded flex items-center justify-center border border-primary/20 text-xs"></div>
                        )}
                        {aTitle}
                      </div>
                    </td>
                    <td className="p-3 text-on-surface-variant">{a.author?.name || '—'}</td>
                    <td className="p-3">{statusBadge(a.status)}</td>
                    <td className="p-3 text-on-surface-variant">{a.views_count || 0}</td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => onEdit(a)} className="p-1.5 rounded-lg bg-surface border border-outline-variant/40 text-on-surface hover:text-primary transition-all cursor-pointer">
                          <Edit size={14} />
                        </button>
                        <button onClick={() => onDelete(a.id)} className="p-1.5 rounded-lg bg-surface border border-outline-variant/40 text-on-surface-variant hover:text-rose-400 transition-all cursor-pointer">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}</tbody>
            </table>
          </div>
        </Card>
      )}
    </>
  );
}
