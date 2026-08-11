import React, { useState, useEffect, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import API from '../../api/axios';
import { AuthContext } from '../../context/AuthContext';
import { SectionHeader, Card, Input, SubmitBtn } from './SharedUI';

export default function AccountSection({ showMsg }) {
  const { t } = useTranslation();
  const { user, setUser } = useContext(AuthContext);
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '', interests: user?.interests || '' });
  const [password, setPassword] = useState('');
  const [file, setFile] = useState(null);
  const [sub, setSub] = useState(false);

  const handleProfileSubmit = async (e) => {
    e.preventDefault(); 
    setSub(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (password) fd.append('password', password);
      if (file) fd.append('image_profile', file);
      const res = await API.put('/student/profile', fd);
      setUser(res.data.user);
      showMsg('success', t('student.account.updateSuccess'));
      setPassword('');
    } catch { 
      showMsg('error', t('student.account.updateError')); 
    } finally { 
      setSub(false); 
    }
  };

  return (
    <div className="space-y-6">
      <SectionHeader title={t('student.account.title')} />
      <Card>
        <form onSubmit={handleProfileSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label={t('student.account.fullName')} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            <Input label={t('student.account.phone')} value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} dir="ltr" />
            <Input label={t('student.account.newPassword')} type="password" value={password} onChange={e => setPassword(e.target.value)} dir="ltr" placeholder={t('student.account.newPasswordPlaceholder')} />
            <Input label={t('student.account.interests')} value={form.interests} onChange={e => setForm({ ...form, interests: e.target.value })} placeholder={t('student.account.interestsPlaceholder')} />
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-on-surface-variant block">{t('student.account.profileImage')}</label>
              <input type="file" accept="image/*" onChange={e => setFile(e.target.files[0])} className="text-sm text-on-surface-variant cursor-pointer" />
            </div>
          </div>
          <SubmitBtn loading={sub} label={t('student.account.updateBtn')} />
        </form>
      </Card>
    </div>
  );
}
