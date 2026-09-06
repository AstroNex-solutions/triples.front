import React, { useState, useEffect, useMemo } from 'react';
import { Loader2, ShoppingBag, Calendar, CheckCircle2, AlertCircle, Clock, Package, DollarSign, ArrowUpRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import API from '../../api/axios';
import { SectionHeader, Card } from './SharedUI';
import { useNavigate } from 'react-router-dom';

export default function OrdersSection() {
  const { t, i18n } = useTranslation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  useEffect(() => {
    API.get('/student/orders')
      .then(r => setOrders(r.data.orders || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const { totalSpent, completedOrders, pendingOrders } = useMemo(() => {
    return orders.reduce((acc, order) => {
      if (order.status === 'completed') {
        acc.totalSpent += parseFloat(order.total) || 0;
        acc.completedOrders += 1;
      } else if (order.status === 'pending') {
        acc.pendingOrders += 1;
      }
      return acc;
    }, { totalSpent: 0, completedOrders: 0, pendingOrders: 0 });
  }, [orders]);

  const getStatusConfig = (status) => {
    switch(status) {
      case 'completed': return { icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', label: t('studentDashboard.orders.status.completed') };
      case 'pending': return { icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20', label: t('studentDashboard.orders.status.pending') };
      case 'failed': return { icon: AlertCircle, color: 'text-rose-500', bg: 'bg-rose-500/10', border: 'border-rose-500/20', label: t('studentDashboard.orders.status.failed') };
      default: return { icon: Package, color: 'text-slate-500', bg: 'bg-slate-500/10', border: 'border-slate-500/20', label: status };
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-surface rounded-2xl border border-outline-variant/30 p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <ShoppingBag size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">{t('studentDashboard.orders.stats.total')}</p>
            <h3 className="text-2xl font-black text-on-surface">{orders.length}</h3>
          </div>
        </div>
        <div className="bg-surface rounded-2xl border border-outline-variant/30 p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
            <DollarSign size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">{t('studentDashboard.orders.stats.totalSpent')}</p>
            <h3 className="text-2xl font-black text-on-surface">${totalSpent.toFixed(2)}</h3>
          </div>
        </div>
        <div className="bg-surface rounded-2xl border border-outline-variant/30 p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">{t('studentDashboard.orders.stats.pending')}</p>
            <h3 className="text-2xl font-black text-on-surface">{pendingOrders}</h3>
          </div>
        </div>
      </div>

      <SectionHeader title={t('studentDashboard.orders.title')} count={orders.length} />

      {/* Orders List */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center bg-surface rounded-3xl border border-outline-variant/30">
          <Loader2 size={36} className="animate-spin text-primary mb-3" />
          <span className="text-sm font-bold text-on-surface-variant">{t('studentDashboard.shared.loading')}</span>
        </div>
      ) : orders.length === 0 ? (
        <Card className="text-center py-20 flex flex-col items-center justify-center">
          <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
            <Package size={40} />
          </div>
          <h3 className="text-xl font-bold text-on-surface mb-2">{t('studentDashboard.orders.noOrders')}</h3>
          <p className="text-on-surface-variant text-sm max-w-sm mb-6">{t('studentDashboard.orders.noOrdersDesc')}</p>
          <button onClick={() => navigate('/courses')} className="px-6 py-3 bg-primary text-on-primary rounded-xl font-bold text-sm shadow-md hover:-translate-y-1 transition-transform">
            Browse Courses
          </button>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map(order => {
            const statusConfig = getStatusConfig(order.status);
            const StatusIcon = statusConfig.icon;
            
            return (
              <div key={order.id} className="bg-surface rounded-3xl border border-outline-variant/30 overflow-hidden shadow-sm hover:shadow-md transition-all group">
                {/* Order Header */}
                <div className="bg-surface-container-low/50 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant/20">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <ShoppingBag size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-on-surface text-lg">{t('studentDashboard.orders.invoice')} #{order.order_number}</h4>
                      <p className="text-xs text-on-surface-variant flex items-center gap-1 mt-0.5">
                        <Calendar size={12} />
                        {new Date(order.createdAt).toLocaleDateString(i18n.language === 'en' ? 'en-US' : 'ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 shrink-0 justify-between sm:justify-end">
                    <div className="text-end">
                      <p className="text-xs text-on-surface-variant uppercase font-bold tracking-wider mb-0.5">{t('studentDashboard.orders.total')}</p>
                      <p className="font-black text-on-surface text-lg">${parseFloat(order.total).toFixed(2)}</p>
                    </div>
                    <div className={`px-3 py-1.5 rounded-lg border flex items-center gap-1.5 text-xs font-bold ${statusConfig.bg} ${statusConfig.color} ${statusConfig.border}`}>
                      <StatusIcon size={14} />
                      {statusConfig.label}
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="p-6">
                  <h5 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-4 border-b border-outline-variant/20 pb-2">{t('studentDashboard.orders.items')}</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {order.items && order.items.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-4 p-4 rounded-2xl bg-surface-container-low/30 border border-outline-variant/20 hover:border-primary/30 transition-colors">
                        <div className="w-12 h-12 rounded-xl bg-surface-variant/50 flex items-center justify-center shrink-0 overflow-hidden">
                          {item.course?.image_cover ? (
                            <img src={item.course.image_cover.startsWith('http') ? item.course.image_cover : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/uploads/${item.course.image_cover}`} alt={item.course?.title} className="w-full h-full object-cover" />
                          ) : (
                            <Package size={20} className="text-on-surface-variant" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h6 className="font-bold text-sm text-on-surface line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                            {item.course?.[`title_${i18n.language}`] || item.course?.title || 'Unknown Course'}
                          </h6>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-[10px] font-mono text-on-surface-variant bg-surface-variant/50 px-2 py-0.5 rounded">{t('navbar.courses')}</span>
                            <span className="text-xs font-bold text-on-surface">${parseFloat(item.price).toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                    {(!order.items || order.items.length === 0) && (
                      <div className="col-span-full py-4 text-center text-sm text-on-surface-variant italic">
                        No items found for this order.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
