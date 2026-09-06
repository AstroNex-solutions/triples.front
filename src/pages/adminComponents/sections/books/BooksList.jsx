import React from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2, Trash2, Edit } from 'lucide-react';
import { SectionHeader, Card } from '../../ui/SharedUI';

export default function BooksList({ books, loading, onAdd, onEdit, onDelete }) {
  const { t, i18n } = useTranslation();

  return (
    <>
      <SectionHeader title={t('admin.sections.books.title')} count={books.length} onAdd={onAdd} addLabel={t('admin.sections.books.addBook')} />
      {loading ? <div className="py-12 flex justify-center"><Loader2 size={24} className="animate-spin text-primary" /></div> : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-start text-xs sm:text-sm border-separate border-spacing-y-1">
              <thead>
                <tr className="text-on-surface-variant/70">
                  <th className="p-3 text-start">{t('admin.sections.books.bookTitle')}</th>
                  <th className="p-3 text-start">{t('admin.sections.articles.author')}</th>
                  <th className="p-3 text-start">Language / اللغة</th>
                  <th className="p-3 text-start">{t('admin.sections.books.download')}</th>
                  <th className="p-3 text-center">{t('admin.common.actions')}</th>
                </tr>
              </thead>
              <tbody>{books.map(b => {
                const bTitle = b[`title_${i18n.language}`] || b.title;
                return (
                  <tr key={b.id} className="bg-surface/50 hover:bg-surface/80 transition-all">
                    <td className="p-3 font-bold text-on-surface">
                      <div className="flex items-center gap-3">
                        {b.cover_image ? (
                          <img src={import.meta.env.VITE_API_URL + b.cover_image} alt={bTitle} className="w-8 h-10 object-cover rounded shadow-sm" />
                        ) : (
                          <div className="w-8 h-10 bg-primary/10 rounded border border-primary/20"></div>
                        )}
                        {bTitle}
                      </div>
                    </td>
                    <td className="p-3 text-on-surface-variant">{b.author_name}</td>
                    <td className="p-3 text-on-surface-variant">{b.language}</td>
                    <td className="p-3 font-bold text-on-surface">{b.download_count || 0}</td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => onEdit(b)} className="p-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all cursor-pointer">
                          <Edit size={14} />
                        </button>
                        <button onClick={() => onDelete(b.id)} className="p-1.5 rounded-lg bg-surface border border-outline-variant/40 text-on-surface-variant hover:text-rose-400 transition-all cursor-pointer">
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
