import React, { useState, useEffect } from 'react';
import API from '../../../api/axios';
import { Loader2, MessageSquare, X, Mail } from 'lucide-react';
import { SectionHeader, Card, statusBadge, Modal, Textarea } from '../ui/SharedUI';

export default function MessagesSection({ showMsg }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyMsg, setReplyMsg] = useState(null);
  const [replyText, setReplyText] = useState('');

  const fetchMessages = () => { setLoading(true); API.get('/admin/messages').then(r => setMessages(r.data.messages)).catch(console.error).finally(() => setLoading(false)); };
  useEffect(() => { fetchMessages(); }, []);

  const reply = async () => {
    try { await API.post(`/admin/messages/${replyMsg.id}/reply`, { admin_response: replyText }); showMsg('success', 'تم الرد'); setReplyMsg(null); setReplyText(''); fetchMessages(); }
    catch { showMsg('error', 'خطأ'); }
  };
  const updateStatus = async (id, status) => {
    try { await API.put(`/admin/messages/${id}/status`, { status }); showMsg('success', 'تم التحديث'); fetchMessages(); }
    catch { showMsg('error', 'خطأ'); }
  };

  return (
    <>
      <SectionHeader title="رسائل اتصل بنا" count={messages.length} />
      {loading ? <div className="py-12 flex justify-center"><Loader2 size={24} className="animate-spin text-primary" /></div> : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs sm:text-sm border-separate border-spacing-y-1">
              <thead><tr className="text-on-surface-variant/70"><th className="p-3">المرسل</th><th className="p-3">الموضوع</th><th className="p-3">الحالة</th><th className="p-3">التاريخ</th><th className="p-3 text-center">إجراء</th></tr></thead>
              <tbody>{messages.map(m => (
                <tr key={m.id} className="bg-surface/50 hover:bg-surface/80 transition-all">
                  <td className="p-3 font-bold text-on-surface">{m.name}</td>
                  <td className="p-3 text-on-surface-variant max-w-[200px] truncate">{m.subject}</td>
                  <td className="p-3">{statusBadge(m.status)}</td>
                  <td className="p-3 text-xs text-on-surface-variant">{new Date(m.createdAt).toLocaleDateString('ar-EG')}</td>
                  <td className="p-3">
                    <div className="flex items-center justify-center gap-1.5">
                      <button onClick={() => { setReplyMsg(m); setReplyText(''); }} className="p-1.5 rounded-lg bg-surface border border-outline-variant/40 text-on-surface-variant hover:text-primary transition-all cursor-pointer"><MessageSquare size={14} /></button>
                      {m.status !== 'closed' && <button onClick={() => updateStatus(m.id, 'closed')} className="p-1.5 rounded-lg bg-surface border border-outline-variant/40 text-on-surface-variant hover:text-rose-400 transition-all cursor-pointer"><X size={14} /></button>}
                    </div>
                  </td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </Card>
      )}
      <Modal open={!!replyMsg} onClose={() => setReplyMsg(null)} title="الرد على الرسالة">
        {replyMsg && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-surface/60 border border-outline-variant/30 space-y-2">
              <p className="text-xs text-on-surface-variant"><strong>من:</strong> {replyMsg.name} ({replyMsg.email})</p>
              <p className="text-xs text-on-surface-variant"><strong>الموضوع:</strong> {replyMsg.subject}</p>
              <p className="text-sm text-on-surface mt-2">{replyMsg.message}</p>
            </div>
            {replyMsg.admin_response && (
              <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20 space-y-1">
                <p className="text-xs font-bold text-primary">ردك السابق:</p>
                <p className="text-sm text-on-surface">{replyMsg.admin_response}</p>
              </div>
            )}
            <Textarea label="ردك" value={replyText} onChange={e => setReplyText(e.target.value)} placeholder="اكتب ردك هنا..." />
            <button onClick={reply} className="py-2.5 px-6 bg-primary text-on-primary font-bold text-sm rounded-2xl hover:bg-primary-hover transition-all flex items-center gap-2 shadow-glow cursor-pointer"><Mail size={16} /> إرسال الرد</button>
          </div>
        )}
      </Modal>
    </>
  );
}
