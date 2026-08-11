import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import API from '../../api/axios';
import { SectionHeader, Card, Badge } from './SharedUI';

export default function OrdersSection() {
  const { t, i18n } = useTranslation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    API.get('/student/orders').then(r => setOrders(r.data.orders || [])).catch(console.error).finally(() => setLoading(false));
  }, []);

  return (
    <>
      <SectionHeader title={t('student.orders.title')} count={orders.length} />
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs sm:text-sm border-separate border-spacing-y-1">
            <thead>
              <tr className="text-on-surface-variant/70">
                <th className="p-3 text-start">{t('student.orders.table.orderNumber')}</th>
                <th className="p-3 text-start">{t('student.orders.table.content')}</th>
                <th className="p-3 text-start">{t('student.orders.table.total')}</th>
                <th className="p-3 text-start">{t('student.orders.table.status')}</th>
                <th className="p-3 text-start">{t('student.orders.table.date')}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? <tr><td colSpan={5} className="p-4 text-center"><Loader2 size={16} className="animate-spin inline" /></td></tr> : (
                orders.map(o => {
                  const content = o.items?.map(i => i.course?.[`title_${i18n.language}`] || i.course?.title).join(' + ');
                  return (
                    <tr key={o.id} className="bg-surface/50 hover:bg-surface/80 transition-all">
                      <td className="p-3 font-bold text-primary" dir="ltr">{o.order_number}</td>
                      <td className="p-3 text-on-surface-variant text-xs max-w-[200px] truncate">{content}</td>
                      <td className="p-3 font-bold text-on-surface" dir="ltr">${o.total}</td>
                      <td className="p-3"><Badge text={o.status === 'completed' ? t('student.orders.table.completed') : o.status} variant={o.status === 'completed' ? 'success' : 'warning'} /></td>
                      <td className="p-3 text-xs text-on-surface-variant">{new Date(o.createdAt).toLocaleDateString(i18n.language === 'en' ? 'en-US' : 'ar-EG')}</td>
                    </tr>
                  );
                })
              )}
              {!loading && orders.length === 0 && <tr><td colSpan={5} className="p-4 text-center text-xs text-on-surface-variant">{t('student.orders.table.empty')}</td></tr>}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
