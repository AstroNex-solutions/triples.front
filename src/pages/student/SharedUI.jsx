import React from 'react';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const API_URL = import.meta.env.VITE_API_URL || '';

export const getImageSrc = (imgSrc) => {
  if (!imgSrc) return '';
  if (imgSrc.startsWith('http://') || imgSrc.startsWith('https://')) {
    return imgSrc;
  }
  const cleanBase = API_URL.replace(/\/$/, '');
  const cleanPath = imgSrc.startsWith('/') ? imgSrc : `/${imgSrc}`;
  return `${cleanBase}${cleanPath}`;
};

export function Card({ children, className = '' }) {
  return <div className={`relative rounded-3xl bg-surface-container-low/70 border border-outline-variant/40 p-5 backdrop-blur-xl shadow-lg ${className}`}>{children}</div>;
}

export function StatCard({ label, value, icon: Icon, color = 'primary' }) {
  const colors = {
    primary: 'bg-primary/15 border-primary/20 text-primary',
    emerald: 'bg-emerald-500/15 border-emerald-500/20 text-emerald-400',
    cyan: 'bg-cyan-500/15 border-cyan-500/20 text-cyan-400',
    amber: 'bg-amber-500/15 border-amber-500/20 text-amber-400',
    rose: 'bg-rose-500/15 border-rose-500/20 text-rose-400',
  };
  return (
    <Card className="flex items-center justify-between">
      <div className="space-y-1">
        <p className="text-xs font-bold text-on-surface-variant">{label}</p>
        <h3 className="text-2xl font-black text-on-surface">{value}</h3>
      </div>
      <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center ${colors[color]}`}><Icon size={24} /></div>
    </Card>
  );
}

export function SectionHeader({ title, count, children }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-extrabold text-on-surface">{title} {count !== undefined && <span className="text-xs text-on-surface-variant font-medium mx-2">({count})</span>}</h3>
      {children && <div className="flex items-center gap-2">{children}</div>}
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

export function Textarea({ label, ...props }) {
  return (
    <div className="space-y-1.5">
      {label && <label className="text-xs font-bold text-on-surface-variant block">{label}</label>}
      <textarea {...props} className="w-full px-4 py-2.5 bg-surface/80 border border-outline-variant/50 rounded-2xl text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" rows={3} />
    </div>
  );
}

export function SubmitBtn({ loading, label }) {
  const { t } = useTranslation();
  const btnLabel = label || t('student.account.updateBtn');
  return (
    <button type="submit" disabled={loading} className="py-2.5 px-6 bg-primary text-on-primary font-bold text-sm rounded-2xl hover:bg-primary-hover disabled:opacity-60 transition-all flex items-center gap-2 shadow-glow cursor-pointer">
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

export function Avatar({ name = '', size = 'md', image = null }) {
  const sizes = { sm: 'w-7 h-7 text-xs', md: 'w-9 h-9 text-xs', lg: 'w-11 h-11 text-sm' };
  const imgSource = image ? getImageSrc(image) : 'https://ui-avatars.com/api/?name=' + encodeURIComponent(name || 'User') + '&background=random';
  
  return (
    <img
      src={imgSource}
      alt={name || 'User'}
      className={`${sizes[size]} rounded-full object-cover border border-outline-variant/30 bg-surface-container`}
      onError={(e) => { e.target.src = 'https://ui-avatars.com/api/?name=U&background=random'; }}
    />
  );
}
