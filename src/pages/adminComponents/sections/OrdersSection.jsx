import { useOutletContext } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import API from '../../../api/axios';
import { Loader2, ChevronRight, ChevronLeft } from 'lucide-react';
import { SectionHeader, Card, statusBadge } from '../ui/SharedUI';

export default function OrdersSection() {
  const { showMsg } = useOutletContext();
  const { t, i18n } = useTranslation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const itemsPerPage = 10;

  const fetchOrders = () => { 
    setLoading(true); 
    API.get(`/admin/orders?page=${currentPage}&limit=${itemsPerPage}`)
      .then(r => {
        setOrders(r.data.orders || []);
        setTotalPages(r.data.totalPages || 1);
        setTotalOrders(r.data.totalOrders || 0);
      })
      .catch(console.error)
      .finally(() => setLoading(false)); 
  };
  
  useEffect(() => { fetchOrders(); }, [currentPage]);

  const handlePageChange = (p) => { 
    if (p >= 1 && p <= totalPages) setCurrentPage(p); 
  };

  const updateStatus = async (id, status) => {
    try { await API.put(`/admin/orders/${id}/status`, { status }); showMsg('success', 'Status updated'); fetchOrders(); }
    catch { showMsg('error', 'Error'); }
  };

  return (
    <>
      <SectionHeader title={t('admin.sections.orders.title')} count={totalOrders} />
      {loading ? <div className="py-12 flex justify-center"><Loader2 size={24} className="animate-spin text-primary" /></div> : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-start text-xs sm:text-sm border-separate border-spacing-y-1">
              <thead>
                <tr className="text-on-surface-variant/70">
                  <th className="p-3 text-start">{t('admin.sections.orders.orderNumber')}</th>
                  <th className="p-3 text-start">{t('admin.sections.orders.student')}</th>
                  <th className="p-3 text-start">الكورس / الطلب</th>
                  <th className="p-3 text-start">{t('admin.sections.orders.total')}</th>
                  <th className="p-3 text-start">{t('admin.sections.orders.status')}</th>
                  <th className="p-3 text-start">{t('admin.sections.orders.date')}</th>
                  <th className="p-3 text-center">{t('admin.common.actions')}</th>
                </tr>
              </thead>
              <tbody>{orders.map(o => (
                <tr key={o.id} className="bg-surface/50 hover:bg-surface/80 transition-all">
                  <td className="p-3 font-extrabold text-primary" dir="ltr">{o.order_number}</td>
                  <td className="p-3 font-bold text-on-surface">{o.User?.name || o.billing_name}</td>
                  <td className="p-3 text-xs text-on-surface-variant font-medium max-w-[250px]">
                    {o.items?.length > 0 ? (
                      <div className="flex flex-col gap-1.5">
                        {o.items.map((i, idx) => {
                          const isFlashcard = !!i.flashcard_product;
                          const isCourse = !!i.course;
                          const typeLabel = isFlashcard ? 'فلاش كارد' : (isCourse ? 'دورة' : 'أخرى');
                          const title = i.course?.title || i.flashcard_product?.title || 'عنصر مجهول';
                          return (
                            <div key={idx} className="flex items-center gap-2">
                              <span className={`px-2 py-0.5 text-[10px] rounded-md font-bold shrink-0 ${isFlashcard ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' : 'bg-primary/10 text-primary border border-primary/20'}`}>
                                {typeLabel}
                              </span>
                              <span className="truncate" title={title}>{title}</span>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      'طلب عام'
                    )}
                  </td>
                  <td className="p-3 font-bold text-on-surface" dir="ltr">{o.total} د.أ</td>
                  <td className="p-3">{statusBadge(o.status)}</td>
                  <td className="p-3 text-xs text-on-surface-variant" dir="ltr">{new Date(o.createdAt).toLocaleDateString(i18n.language === 'en' ? 'en-US' : 'ar-EG')}</td>
                  <td className="p-3 text-center">
                    <select value={o.status} onChange={e => updateStatus(o.id, e.target.value)} className="px-2 py-1 bg-surface/80 border border-outline-variant/40 rounded-xl text-xs text-on-surface focus:outline-none cursor-pointer">
                      <option value="pending">Pending / قيد الانتظار</option>
                      <option value="processing">Processing / قيد المعالجة</option>
                      <option value="completed">Completed / مكتمل</option>
                      <option value="cancelled">Cancelled / ملغي</option>
                      <option value="refunded">Refunded / مسترجع</option>
                    </select>
                  </td>
                </tr>
              ))}</tbody>
            </table>
          </div>
          
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-outline-variant/20 flex flex-wrap items-center justify-between gap-4 bg-surface-container-low/30 rounded-b-2xl">
              <span className="text-xs text-on-surface-variant font-bold">
                صفحة {currentPage} من {totalPages}
              </span>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => handlePageChange(currentPage - 1)} 
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-lg border border-outline-variant/30 text-on-surface hover:bg-surface-variant/50 disabled:opacity-30 transition-all cursor-pointer"
                >
                  {i18n.language === 'en' ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) pageNum = i + 1;
                    else if (currentPage <= 3) pageNum = i + 1;
                    else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                    else pageNum = currentPage - 2 + i;
                    
                    return (
                      <button 
                        key={pageNum} 
                        onClick={() => handlePageChange(pageNum)}
                        className={`w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer ${currentPage === pageNum ? 'bg-primary text-on-primary shadow-glow' : 'bg-surface hover:bg-surface-variant/50 text-on-surface border border-outline-variant/30'}`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                <button 
                  onClick={() => handlePageChange(currentPage + 1)} 
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded-lg border border-outline-variant/30 text-on-surface hover:bg-surface-variant/50 disabled:opacity-30 transition-all cursor-pointer"
                >
                  {i18n.language === 'en' ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                </button>
              </div>
            </div>
          )}
        </Card>
      )}
    </>
  );
}
