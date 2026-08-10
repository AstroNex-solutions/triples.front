import React, { useState } from 'react';
import API from '../../api/axios';
import { SectionHeader, Card, Input, Textarea, SubmitBtn } from './SharedUI';

export default function SupportSection({ showMsg }) {
  const [form, setForm] = useState({ subject: '', message: '' });
  const [sub, setSub] = useState(false);

  const send = async (e) => {
    e.preventDefault(); setSub(true);
    try {
      await API.post('/student/support', form);
      showMsg('success', 'تم إرسال رسالتك بنجاح وسنتواصل معك قريباً');
      setForm({ subject: '', message: '' });
    } catch { showMsg('error', 'خطأ في الإرسال'); }
    finally { setSub(false); }
  };

  return (
    <>
      <SectionHeader title="الدعم الفني والشكاوى" />
      <Card>
        <p className="text-xs text-on-surface-variant mb-4">هل واجهت مشكلة في الدفع؟ أو لديك استفسار بخصوص المنهج؟ أرسل لنا رسالة وسنقوم بالرد في أسرع وقت.</p>
        <form onSubmit={send} className="space-y-4 max-w-lg">
          <Input label="الموضوع *" required value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} placeholder="مثال: مشكلة في فتح الدرس..." />
          <Textarea label="الرسالة بالتفصيل *" required value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} placeholder="اكتب استفسارك أو مشكلتك هنا..." />
          <SubmitBtn loading={sub} label="إرسال الطلب" />
        </form>
      </Card>
    </>
  );
}
