import React, { useState, useEffect } from 'react';
import API from '../../../api/axios';
import { Loader2 } from 'lucide-react';
import { SectionHeader, Card, Input, Textarea, SubmitBtn } from '../ui/SharedUI';

export default function PagesSection({ showMsg }) {
  const [activeTab, setActiveTab] = useState('terms');
  
  // States
  const [terms, setTerms] = useState({ title: '', content: '', title_ar: '', content_ar: '', is_active: true });
  const [privacy, setPrivacy] = useState({ title: '', content: '', title_ar: '', content_ar: '', is_active: true });
  const [contact, setContact] = useState({ email: '', phone: '', address: '', address_ar: '', facebook: '', twitter: '', instagram: '', linkedin: '', youtube: '', is_active: true });
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [resTerms, resPrivacy, resContact] = await Promise.all([
          API.get('/admin/terms'),
          API.get('/admin/privacy'),
          API.get('/admin/contact-info')
        ]);
        if (resTerms.data.terms) setTerms(resTerms.data.terms);
        if (resPrivacy.data.privacy) setPrivacy(resPrivacy.data.privacy);
        if (resContact.data.info) setContact(resContact.data.info);
      } catch (err) {
        showMsg('error', 'خطأ في جلب بيانات الصفحات الثابتة');
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const saveTerms = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await API.put('/admin/terms', terms);
      showMsg('success', 'تم حفظ الشروط والأحكام');
    } catch (err) { showMsg('error', 'خطأ في الحفظ'); }
    setSubmitting(false);
  };

  const savePrivacy = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await API.put('/admin/privacy', privacy);
      showMsg('success', 'تم حفظ سياسة الخصوصية');
    } catch (err) { showMsg('error', 'خطأ في الحفظ'); }
    setSubmitting(false);
  };

  const saveContact = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await API.put('/admin/contact-info', contact);
      showMsg('success', 'تم حفظ معلومات التواصل');
    } catch (err) { showMsg('error', 'خطأ في الحفظ'); }
    setSubmitting(false);
  };

  if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <>
      <SectionHeader title="الصفحات الثابتة" description="إدارة نصوص الشروط، الخصوصية، ومعلومات التواصل" />

      {/* Tabs */}
      <div className="flex gap-2 mb-6 p-1 bg-surface-container-high rounded-xl w-fit">
        {['terms', 'privacy', 'contact'].map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              activeTab === tab ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface'
            }`}
          >
            {tab === 'terms' ? 'الشروط والأحكام' : tab === 'privacy' ? 'سياسة الخصوصية' : 'معلومات التواصل'}
          </button>
        ))}
      </div>

      <Card>
        {activeTab === 'terms' && (
          <form onSubmit={saveTerms} className="space-y-4">
            <h3 className="text-lg font-bold text-on-surface mb-2 border-b border-outline-variant/30 pb-2">الشروط والأحكام</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <Input label="العنوان (EN)" value={terms.title} onChange={e => setTerms({...terms, title: e.target.value})} />
                <Textarea label="المحتوى (EN) - يدعم HTML" value={terms.content} onChange={e => setTerms({...terms, content: e.target.value})} rows="10" />
              </div>
              <div className="space-y-3">
                <Input label="العنوان (AR)" value={terms.title_ar} onChange={e => setTerms({...terms, title_ar: e.target.value})} />
                <Textarea label="المحتوى (AR) - يدعم HTML" value={terms.content_ar} onChange={e => setTerms({...terms, content_ar: e.target.value})} rows="10" />
              </div>
            </div>
            <div className="flex items-center gap-2 mt-2 mb-4">
              <input type="checkbox" id="terms_active" checked={terms.is_active} onChange={e => setTerms({...terms, is_active: e.target.checked})} className="w-4 h-4 cursor-pointer" />
              <label htmlFor="terms_active" className="text-sm font-bold cursor-pointer text-on-surface">عرض الصفحة للعامة</label>
            </div>
            <SubmitBtn loading={submitting} label="حفظ التغييرات" className="w-48" />
          </form>
        )}

        {activeTab === 'privacy' && (
          <form onSubmit={savePrivacy} className="space-y-4">
            <h3 className="text-lg font-bold text-on-surface mb-2 border-b border-outline-variant/30 pb-2">سياسة الخصوصية</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <Input label="العنوان (EN)" value={privacy.title} onChange={e => setPrivacy({...privacy, title: e.target.value})} />
                <Textarea label="المحتوى (EN) - يدعم HTML" value={privacy.content} onChange={e => setPrivacy({...privacy, content: e.target.value})} rows="10" />
              </div>
              <div className="space-y-3">
                <Input label="العنوان (AR)" value={privacy.title_ar} onChange={e => setPrivacy({...privacy, title_ar: e.target.value})} />
                <Textarea label="المحتوى (AR) - يدعم HTML" value={privacy.content_ar} onChange={e => setPrivacy({...privacy, content_ar: e.target.value})} rows="10" />
              </div>
            </div>
            <div className="flex items-center gap-2 mt-2 mb-4">
              <input type="checkbox" id="privacy_active" checked={privacy.is_active} onChange={e => setPrivacy({...privacy, is_active: e.target.checked})} className="w-4 h-4 cursor-pointer" />
              <label htmlFor="privacy_active" className="text-sm font-bold cursor-pointer text-on-surface">عرض الصفحة للعامة</label>
            </div>
            <SubmitBtn loading={submitting} label="حفظ التغييرات" className="w-48" />
          </form>
        )}

        {activeTab === 'contact' && (
          <form onSubmit={saveContact} className="space-y-4">
            <h3 className="text-lg font-bold text-on-surface mb-2 border-b border-outline-variant/30 pb-2">معلومات التواصل (Contact Info)</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="البريد الإلكتروني *" type="email" required value={contact.email} onChange={e => setContact({...contact, email: e.target.value})} dir="ltr" />
              <Input label="رقم الهاتف" value={contact.phone} onChange={e => setContact({...contact, phone: e.target.value})} dir="ltr" />
              <Textarea label="العنوان (AR)" value={contact.address_ar} onChange={e => setContact({...contact, address_ar: e.target.value})} rows="2" />
              <Textarea label="العنوان (EN)" value={contact.address} onChange={e => setContact({...contact, address: e.target.value})} rows="2" />
            </div>

            <h4 className="text-sm font-bold text-on-surface-variant mt-6 border-t border-outline-variant/20 pt-4">روابط التواصل الاجتماعي</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="رابط فيسبوك" type="url" value={contact.facebook} onChange={e => setContact({...contact, facebook: e.target.value})} dir="ltr" />
              <Input label="رابط تويتر (X)" type="url" value={contact.twitter} onChange={e => setContact({...contact, twitter: e.target.value})} dir="ltr" />
              <Input label="رابط انستجرام" type="url" value={contact.instagram} onChange={e => setContact({...contact, instagram: e.target.value})} dir="ltr" />
              <Input label="رابط لينكدإن" type="url" value={contact.linkedin} onChange={e => setContact({...contact, linkedin: e.target.value})} dir="ltr" />
              <Input label="رابط يوتيوب" type="url" value={contact.youtube} onChange={e => setContact({...contact, youtube: e.target.value})} dir="ltr" />
            </div>
            
            <div className="flex items-center gap-2 mt-4 mb-4">
              <input type="checkbox" id="contact_active" checked={contact.is_active} onChange={e => setContact({...contact, is_active: e.target.checked})} className="w-4 h-4 cursor-pointer" />
              <label htmlFor="contact_active" className="text-sm font-bold cursor-pointer text-on-surface">إظهار المعلومات للعامة</label>
            </div>
            
            <SubmitBtn loading={submitting} label="حفظ بيانات التواصل" className="w-48" />
          </form>
        )}
      </Card>
    </>
  );
}
