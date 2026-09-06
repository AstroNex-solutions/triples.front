import { useOutletContext } from 'react-router-dom';
import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import API from '../../../api/axios';
import { 
  Loader2, ShieldAlert, X, ChevronRight, ChevronLeft
} from 'lucide-react';
import { SectionHeader, Card, Badge } from '../ui/SharedUI';

export default function SessionsSection() {
  const { showMsg } = useOutletContext();
  const { t, i18n } = useTranslation();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [revokingId, setRevokingId] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const fetch = () => {
    setLoading(true);
    API.get('/admin/sessions')
      .then(r => setSessions(r.data.sessions || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetch();
  }, []);

  const revoke = async (id) => {
    try {
      setRevokingId(id);
      await API.post(`/admin/sessions/${id}/revoke`);
      showMsg('success', t('admin.sections.sessions.revoke'));
      fetch();
    } catch {
      showMsg('error', 'Error');
    } finally {
      setRevokingId(null);
    }
  };

  const totalPages = Math.ceil(sessions.length / itemsPerPage) || 1;
  const paginatedSessions = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sessions.slice(start, start + itemsPerPage);
  }, [sessions, currentPage, itemsPerPage]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <>
      <SectionHeader 
        title={t('admin.sections.sessions.title')} 
        count={sessions.filter(s => s.is_active).length} 
      />

      {loading ? (
        <div className="py-16 flex justify-center items-center">
          <Loader2 size={28} className="animate-spin text-primary" />
        </div>
      ) : sessions.length === 0 ? (
        <Card className="p-8 text-center text-on-surface-variant flex flex-col items-center gap-2">
          <ShieldAlert size={32} className="opacity-50 mb-1" />
          <p>No active sessions found / لا توجد جلسات مسجلة حالياً</p>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-start text-xs sm:text-sm border-collapse">
              <thead>
                <tr className="border-b border-outline-variant/30 text-on-surface-variant/70 bg-surface-variant/20">
                  <th className="p-3.5 font-semibold text-start">{t('admin.sections.sessions.user')}</th>
                  <th className="p-3.5 font-semibold text-start">{t('admin.sections.sessions.ip')}</th>
                  <th className="p-3.5 font-semibold text-start">{t('admin.common.status')}</th>
                  <th className="p-3.5 font-semibold text-start">{t('admin.sections.sessions.lastActivity')}</th>
                  <th className="p-3.5 font-semibold text-center">{t('admin.common.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {paginatedSessions.map((s) => (
                  <tr 
                    key={s.id} 
                    className="hover:bg-surface-variant/30 transition-colors"
                  >
                    <td className="p-3.5 font-medium text-on-surface">
                      {s.user?.name || '—'}
                    </td>
                    <td className="p-3.5 text-on-surface-variant font-mono text-xs" dir="ltr">
                      {s.ip_address || '—'}
                    </td>
                    <td className="p-3.5">
                      {s.is_active ? (
                        <Badge text="Active / نشطة" variant="success" />
                      ) : (
                        <Badge text="Ended / منتهية" variant="default" />
                      )}
                    </td>
                    <td className="p-3.5 text-on-surface-variant text-xs" dir="ltr">
                      {new Date(s.createdAt).toLocaleString(i18n.language === 'en' ? 'en-US' : 'ar-EG', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </td>
                    <td className="p-3.5 text-center">
                      {s.is_active && (
                        <button
                          onClick={() => revoke(s.id)}
                          disabled={revokingId === s.id}
                          title={t('admin.sections.sessions.revoke')}
                          className="p-1.5 rounded-lg bg-surface hover:bg-rose-500/10 border border-outline-variant/40 text-on-surface-variant hover:text-rose-500 transition-all cursor-pointer disabled:opacity-50"
                        >
                          {revokingId === s.id ? (
                            <Loader2 size={14} className="animate-spin text-rose-500" />
                          ) : (
                            <X size={14} />
                          )}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-3 sm:p-4 border-t border-outline-variant/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm text-on-surface-variant">
              <span>
                Page {currentPage} of {totalPages} ({sessions.length} total)
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-lg border border-outline-variant/40 hover:bg-surface-variant disabled:opacity-40 disabled:hover:bg-transparent transition-all cursor-pointer disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={16} className={i18n.language === 'ar' ? 'rotate-180' : ''} />
                </button>

                <div className="flex items-center gap-1 px-2 font-medium">
                  <span>{currentPage}</span>
                  <span>/</span>
                  <span>{totalPages}</span>
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded-lg border border-outline-variant/40 hover:bg-surface-variant disabled:opacity-40 disabled:hover:bg-transparent transition-all cursor-pointer disabled:cursor-not-allowed"
                >
                  <ChevronRight size={16} className={i18n.language === 'ar' ? 'rotate-180' : ''} />
                </button>
              </div>
            </div>
          )}
        </Card>
      )}
    </>
  );
}
