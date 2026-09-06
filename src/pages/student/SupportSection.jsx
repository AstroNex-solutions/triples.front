import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  MessageSquare, Send, CheckCircle2, Clock, 
  AlertCircle, ChevronDown, Mail, MessageCircle, X
} from 'lucide-react';
import API from '../../api/axios';
import { useOutletContext } from 'react-router-dom';

export default function SupportSection() {
  const { showMsg } = useOutletContext();
  const { t, i18n } = useTranslation();
  
  const [form, setForm] = useState({ subject: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [expandedMsg, setExpandedMsg] = useState(null);

  const fetchMessages = () => {
    setLoading(true);
    API.get('/student/support')
      .then(r => {
        setMessages(r.data.messages || []);
        if (r.data.messages?.length > 0) {
          setExpandedMsg(r.data.messages[0].id); // Auto expand first message
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const send = async (e) => {
    e.preventDefault(); 
    setSubmitting(true);
    try {
      await API.post('/student/support', form);
      showMsg('success', t('studentDashboard.shared.success'));
      setForm({ subject: '', message: '' });
      setIsFormOpen(false);
      fetchMessages();
    } catch { 
      showMsg('error', t('studentDashboard.shared.error')); 
    } finally { 
      setSubmitting(false); 
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'replied': return <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-500 text-xs font-bold border border-emerald-500/20"><CheckCircle2 size={14} />{t('studentDashboard.support.status.resolved')}</span>;
      case 'new': return <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500/10 text-amber-500 text-xs font-bold border border-amber-500/20"><Clock size={14} />{t('studentDashboard.support.status.pending')}</span>;
      case 'closed': return <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-surface-variant text-on-surface-variant text-xs font-bold border border-outline-variant/30"><AlertCircle size={14} />{t('studentDashboard.support.status.closed')}</span>;
      default: return <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-surface-variant text-on-surface-variant text-xs font-bold border border-outline-variant/30">{status}</span>;
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Header & Stats Banner */}
      <div className="bg-gradient-to-br from-primary to-violet-600 rounded-3xl p-6 sm:p-8 shadow-lg shadow-primary/20 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2" />
        
        <div className="relative z-10 text-center md:text-start">
          <h2 className="text-2xl sm:text-3xl font-black text-white mb-2 flex items-center justify-center md:justify-start gap-3">
            <MessageSquare size={28} className="text-white/80" />
            {t('studentDashboard.support.title')}
          </h2>
          <p className="text-white/80 text-sm max-w-lg">
            {t('studentDashboard.support.noTicketsDesc')}
          </p>
        </div>

        <button 
          onClick={() => setIsFormOpen(true)}
          className="relative z-10 shrink-0 bg-white text-primary px-6 py-3.5 rounded-2xl font-black text-sm shadow-xl hover:-translate-y-1 hover:shadow-2xl transition-all flex items-center gap-2"
        >
          <Mail size={18} />{t('studentDashboard.support.createNew')}</button>
      </div>

      {/* Ticket History */}
      <div className="bg-surface rounded-3xl border border-outline-variant/30 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-outline-variant/30 bg-surface-container-low/50 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <MessageCircle size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-on-surface">{t('studentDashboard.support.title')}</h3>
            <p className="text-xs text-on-surface-variant">View your previous messages and administration replies.</p>
          </div>
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4" />
            <p className="text-on-surface-variant font-bold text-sm">{t('studentDashboard.shared.loading')}</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="py-20 text-center flex flex-col items-center justify-center px-4">
            <div className="w-20 h-20 bg-surface-container-high rounded-full flex items-center justify-center mb-4 text-outline-variant">
              <MessageCircle size={32} />
            </div>
            <h4 className="text-lg font-bold text-on-surface mb-2">{t('studentDashboard.support.noTickets')}</h4>
            <p className="text-sm text-on-surface-variant max-w-md">{t('studentDashboard.support.noTicketsDesc')}</p>
          </div>
        ) : (
          <div className="divide-y divide-outline-variant/20">
            {messages.map(msg => (
              <div key={msg.id} className="transition-colors hover:bg-surface-container-low/30">
                {/* Ticket Header (Clickable) */}
                <button 
                  onClick={() => setExpandedMsg(expandedMsg === msg.id ? null : msg.id)}
                  className="w-full text-start px-6 py-5 flex items-start sm:items-center justify-between gap-4 cursor-pointer"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h4 className="font-bold text-on-surface text-base truncate">{msg.subject}</h4>
                      {getStatusBadge(msg.status)}
                    </div>
                    <p className="text-xs text-on-surface-variant font-mono"> {t('studentDashboard.support.title')} #{msg.id} • {new Date(msg.createdAt).toLocaleString(i18n.language === 'en' ? 'en-US' : 'ar-EG')}
                    </p>
                  </div>
                  <ChevronDown size={20} className={`text-on-surface-variant shrink-0 transition-transform duration-300 ${expandedMsg === msg.id ? 'rotate-180' : ''}`} />
                </button>

                {/* Ticket Body (Expanded) */}
                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${expandedMsg === msg.id ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                  <div className="px-6 pb-6 pt-2 space-y-6">
                    {/* Student Message */}
                    <div className="flex gap-4">
                      <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center shrink-0 font-bold text-on-surface-variant shadow-sm border border-outline-variant/20"> {t('studentDashboard.support.chat.you')} </div>
                      <div className="flex-1 bg-surface-container-low rounded-2xl rounded-tl-none p-4 sm:p-5 border border-outline-variant/30 text-sm text-on-surface leading-relaxed shadow-sm whitespace-pre-wrap">
                        {msg.message}
                      </div>
                    </div>

                    {/* Admin Response */}
                    {msg.admin_response ? (
                      <div className="flex gap-4 flex-row-reverse">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0 shadow-sm border border-primary/30 text-primary">
                          <MessageSquare size={18} />
                        </div>
                        <div className="flex-1 bg-primary/5 rounded-2xl rounded-tr-none p-4 sm:p-5 border border-primary/20 text-sm text-on-surface leading-relaxed shadow-sm whitespace-pre-wrap">
                          <p className="text-xs font-black text-primary mb-2 uppercase tracking-wide">{t('studentDashboard.support.chat.support')}</p>
                          {msg.admin_response}
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-end">
                        <div className="bg-surface-variant/50 px-4 py-2 rounded-xl text-xs font-bold text-on-surface-variant flex items-center gap-2">
                          <Clock size={14} /> Support team is reviewing your message...
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Ticket Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsFormOpen(false)} />
          <div className="relative bg-surface w-full max-w-lg rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-5 border-b border-outline-variant/30 bg-surface-container-low/50">
              <h2 className="font-bold text-lg text-on-surface flex items-center gap-2">
                <Mail size={20} className="text-primary" />{t('studentDashboard.support.createNew')}</h2>
              <button 
                onClick={() => setIsFormOpen(false)}
                className="w-8 h-8 rounded-full bg-surface-variant text-on-surface-variant flex items-center justify-center hover:bg-rose-500 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={send} className="p-6 space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-on-surface-variant">Subject / الموضوع <span className="text-rose-500">*</span></label>
                <input 
                  required 
                  value={form.subject} 
                  onChange={e => setForm({ ...form, subject: e.target.value })} 
                  placeholder={t('student.support.subjectPlaceholder') || 'e.g. Payment Issue'} 
                  className="w-full bg-surface border border-outline-variant/50 text-on-surface text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all shadow-sm"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-on-surface-variant">Message / تفاصيل الرسالة <span className="text-rose-500">*</span></label>
                <textarea 
                  required 
                  rows="5"
                  value={form.message} 
                  onChange={e => setForm({ ...form, message: e.target.value })} 
                  placeholder={t('student.support.messagePlaceholder') || 'Please describe your issue in detail...'} 
                  className="w-full bg-surface border border-outline-variant/50 text-on-surface text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all shadow-sm resize-none custom-scrollbar"
                />
              </div>
              
              <div className="pt-4 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsFormOpen(false)}
                  className="px-5 py-2.5 rounded-xl font-bold text-sm text-on-surface-variant bg-surface hover:bg-surface-variant transition-colors"
                > {t('studentDashboard.shared.cancel')} </button>
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl font-bold text-sm text-white bg-primary hover:bg-primary-hover shadow-md hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {submitting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send size={16} />}
                  {submitting ? 'Sending...' : 'Submit Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
