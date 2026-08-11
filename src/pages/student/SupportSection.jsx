import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import API from '../../api/axios';
import { SectionHeader, Card, Input, Textarea, SubmitBtn } from './SharedUI';

export default function SupportSection({ showMsg }) {
  const { t } = useTranslation();
  const [form, setForm] = useState({ subject: '', message: '' });
  const [sub, setSub] = useState(false);

  const send = async (e) => {
    e.preventDefault(); 
    setSub(true);
    try {
      await API.post('/student/support', form);
      showMsg('success', t('student.support.success'));
      setForm({ subject: '', message: '' });
    } catch { 
      showMsg('error', t('student.support.error')); 
    } finally { 
      setSub(false); 
    }
  };

  return (
    <>
      <SectionHeader title={t('student.support.title')} />
      <Card>
        <p className="text-xs text-on-surface-variant mb-4">{t('student.support.description')}</p>
        <form onSubmit={send} className="space-y-4 max-w-lg">
          <Input label={t('student.support.subject')} required value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} placeholder={t('student.support.subjectPlaceholder')} />
          <Textarea label={t('student.support.message')} required value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} placeholder={t('student.support.messagePlaceholder')} />
          <SubmitBtn loading={sub} label={t('student.support.submit')} />
        </form>
      </Card>
    </>
  );
}
