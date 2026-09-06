import React from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, X, Loader2, CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function Card({ children, className = '' }) {
  return (
    <div className={`relative rounded-3xl bg-surface-container-low/70 border border-outline-variant/40 p-5 backdrop-blur-xl shadow-lg ${className}`}>
      {children}
    </div>
  );
}

export function StatCard({ label, value, icon: Icon, color = 'primary', to }) {
  const colors = {
    primary: 'bg-primary/15 border-primary/20 text-primary',
    emerald: 'bg-emerald-500/15 border-emerald-500/20 text-emerald-400',
    cyan: 'bg-cyan-500/15 border-cyan-500/20 text-cyan-400',
    amber: 'bg-amber-500/15 border-amber-500/20 text-amber-400',
    rose: 'bg-rose-500/15 border-rose-500/20 text-rose-400',
    violet: 'bg-violet-500/15 border-violet-500/20 text-violet-400',
  };
  
  const content = (
    <Card className={`flex items-center justify-between ${to ? 'hover:scale-105 hover:shadow-lg transition-all duration-300 cursor-pointer' : ''}`}>
      <div className="space-y-1">
        <p className="text-xs font-bold text-on-surface-variant">{label}</p>
        <h3 className="text-2xl font-black text-on-surface">{value}</h3>
      </div>
      <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center ${colors[color]}`}>
        <Icon size={24} />
      </div>
    </Card>
  );

  return to ? <Link to={to} className="block">{content}</Link> : content;
}

export function SectionHeader({ title, count, onAdd, addLabel }) {
  const { t } = useTranslation();
  const labelText = addLabel || t('admin.common.add');
  return (
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-extrabold text-on-surface">{title} {count !== undefined && <span className="text-xs text-on-surface-variant font-medium mx-2">({count})</span>}</h3>
      {onAdd && (
        <button onClick={onAdd} className="py-2 px-4 bg-primary text-on-primary font-bold text-xs rounded-2xl hover:bg-primary-hover transition-all flex items-center gap-1.5 shadow-glow cursor-pointer">
          <PlusCircle size={16} /> {labelText}
        </button>
      )}
    </div>
  );
}

export function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-3xl bg-surface-container-low border border-outline-variant/50 p-6 sm:p-8 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-outline-variant/30 pb-3">
          <h3 className="text-lg font-extrabold text-on-surface">{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-surface/50 text-on-surface-variant hover:text-on-surface transition-all cursor-pointer"><X size={20} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Input({ label, ...props }) {
  return (
    <div className="space-y-1.5">
      {label && <label className="text-xs font-bold text-on-surface-variant block">{label}</label>}
      <input {...props} className="w-full px-4 py-2.5 bg-surface/80 border border-outline-variant/50 rounded-2xl text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" />
    </div>
  );
}

export function Select({ label, children, ...props }) {
  return (
    <div className="space-y-1.5">
      {label && <label className="text-xs font-bold text-on-surface-variant block">{label}</label>}
      <select {...props} className="w-full px-4 py-2.5 bg-surface/80 border border-outline-variant/50 rounded-2xl text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all">
        {children}
      </select>
    </div>
  );
}

export function Textarea({ label, ...props }) {
  return (
    <div className="space-y-1.5">
      {label && <label className="text-xs font-bold text-on-surface-variant block">{label}</label>}
      <textarea {...props} className="w-full px-4 py-2.5 bg-surface/80 border border-outline-variant/50 rounded-2xl text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" rows={3} />
    </div>
  );
}

export function SubmitBtn({ loading, label, ...props }) {
  const { t } = useTranslation();
  const btnLabel = label || t('admin.common.save');
  return (
    <button type="submit" disabled={loading || props.disabled} {...props} className={`py-2.5 px-6 bg-primary text-on-primary font-bold text-sm rounded-2xl hover:bg-primary-hover disabled:opacity-60 transition-all flex items-center gap-2 shadow-glow cursor-pointer ${props.className || ''}`}>
      {loading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />} {btnLabel}
    </button>
  );
}

export function Badge({ text, variant = 'default' }) {
  const styles = {
    default: 'bg-primary/10 text-primary border-primary/20',
    success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    danger: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    info: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  };
  return <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${styles[variant]}`}>{text}</span>;
}

export function StatusBadge({ status }) {
  const map = {
    Admin: 'danger', Instructor: 'warning', Student: 'info', Organization: 'default',
    published: 'success', draft: 'warning', pending_review: 'info', archived: 'default',
    completed: 'success', active: 'success', pending: 'warning', cancelled: 'danger',
    refunded: 'danger', new: 'info', read: 'default', replied: 'success', closed: 'danger'
  };
  return <Badge text={status} variant={map[status] || 'default'} />;
}

export const statusBadge = (status) => <StatusBadge status={status} />;

export function Avatar({ name = '', size = 'md' }) {
  const initials = name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  const sizes = { sm: 'w-7 h-7 text-xs', md: 'w-9 h-9 text-xs', lg: 'w-11 h-11 text-sm' };
  return (
    <div className={`${sizes[size]} rounded-full bg-primary/10 text-primary font-black border border-primary/20 flex items-center justify-center shrink-0`}>
      {initials || 'A'}
    </div>
  );
}
