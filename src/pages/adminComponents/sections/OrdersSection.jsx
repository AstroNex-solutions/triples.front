import React, { useState, useEffect } from 'react';
import API from '../../../api/axios';
import { Loader2 } from 'lucide-react';
import { SectionHeader, Card, statusBadge } from '../ui/SharedUI';

export default function OrdersSection({ showMsg }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const fetchOrders = () => { setLoading(true); API.get('/admin/orders').then(r => setOrders(r.data.orders)).catch(console.error).finally(() => setLoading(false)); };
  useEffect(() => { fetchOrders(); }, []);

  const updateStatus = async (id, status) => {
    try { await API.put(`/admin/orders/${id}/status`, { status }); showMsg('success', 'تم تحديث الحالة'); fetchOrders(); }
    catch { showMsg('error', 'خطأ'); }
  };

  return (
    <>
      <SectionHeader title="الطلبات والمدفوعات" count={orders.length} />
      {loading ? <div className="py-12 flex justify-center"><Loader2 size={24} className="animate-spin text-primary" /></div> : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs sm:text-sm border-separate border-spacing-y-1">
              <thead><tr className="text-on-surface-variant/70">
                <th className="p-3">رقم الطلب</th><th className="p-3">العميل</th><th className="p-3">المبلغ</th><th className="p-3">الحالة</th><th className="p-3">التاريخ</th><th className="p-3 text-center">إجراء</th>
              </tr></thead>
              <tbody>{orders.map(o => (
                <tr key={o.id} className="bg-surface/50 hover:bg-surface/80 transition-all">
                  <td className="p-3 font-extrabold text-primary" dir="ltr">{o.order_number}</td>
                  <td className="p-3 font-bold text-on-surface">{o.User?.name || o.billing_name}</td>
                  <td className="p-3 font-bold text-on-surface" dir="ltr">${o.total}</td>
                  <td className="p-3">{statusBadge(o.status)}</td>
                  <td className="p-3 text-xs text-on-surface-variant">{new Date(o.createdAt).toLocaleDateString('ar-EG')}</td>
                  <td className="p-3">
                    <select value={o.status} onChange={e => updateStatus(o.id, e.target.value)} className="px-2 py-1 bg-surface/80 border border-outline-variant/40 rounded-xl text-xs text-on-surface focus:outline-none">
                      <option value="pending">قيد الانتظار</option><option value="processing">قيد المعالجة</option><option value="completed">مكتمل</option><option value="cancelled">ملغي</option><option value="refunded">مسترجع</option>
                    </select>
                  </td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </Card>
      )}
    </>
  );
}
