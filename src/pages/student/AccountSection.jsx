import React, { useState, useEffect, useContext } from 'react';
import API from '../../api/axios';
import { AuthContext } from '../../context/AuthContext';
import { SectionHeader, Card, Input, SubmitBtn } from './SharedUI';

export default function AccountSection({ showMsg }) {
  const { user, setUser, logout } = useContext(AuthContext);
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '', interests: user?.interests || '' });
  const [password, setPassword] = useState('');
  const [file, setFile] = useState(null);
  const [sub, setSub] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [freezeReason, setFreezeReason] = useState('');

  const fetchSessions = () => API.get('/student/sessions').then(r => setSessions(r.data.sessions)).catch(console.error);
  useEffect(() => { fetchSessions(); }, []);

  const handleProfileSubmit = async (e) => {
    e.preventDefault(); setSub(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (password) fd.append('password', password);
      if (file) fd.append('image_profile', file);
      const res = await API.put('/student/profile', fd);
      setUser(res.data.user);
      showMsg('success', 'تم تحديث البيانات بنجاح');
      setPassword('');
    } catch { showMsg('error', 'حدث خطأ في التحديث'); }
    finally { setSub(false); }
  };

  const revokeSession = async (id) => {
    try { await API.post(`/student/sessions/${id}/revoke`); fetchSessions(); showMsg('success', 'تم إنهاء الجلسة'); } catch { showMsg('error', 'خطأ'); }
  };

  const handleFreeze = async () => {
    if(!window.confirm('تحذير: سيتم إيقاف حسابك مؤقتاً ولن تتمكن من تسجيل الدخول حتى تتواصل مع الإدارة لفك التجميد. هل أنت متأكد؟')) return;
    try {
      await API.post('/student/freeze', { reason: freezeReason });
      logout();
    } catch { showMsg('error', 'خطأ في تجميد الحساب'); }
  };

  return (
    <div className="space-y-6">
      <SectionHeader title="الملف الشخصي" />
      <Card>
        <form onSubmit={handleProfileSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="الاسم الكامل" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            <Input label="رقم الهاتف" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} dir="ltr" />
            <Input label="كلمة المرور الجديدة (اختياري)" type="password" value={password} onChange={e => setPassword(e.target.value)} dir="ltr" placeholder="اتركه فارغاً إذا لم ترد تغييره" />
            <Input label="الاهتمامات التعليمية" value={form.interests} onChange={e => setForm({ ...form, interests: e.target.value })} placeholder="مثال: الطب البشري، الصيدلة..." />
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-on-surface-variant block">الصورة الشخصية</label>
              <input type="file" accept="image/*" onChange={e => setFile(e.target.files[0])} className="text-sm text-on-surface-variant" />
            </div>
          </div>
          <SubmitBtn loading={sub} label="تحديث البيانات" />
        </form>
      </Card>
    </div>
  );
}
