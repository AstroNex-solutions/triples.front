import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import API from '../../../api/axios';
import { Loader2 } from 'lucide-react';
import { SectionHeader, Card, Input, Textarea, SubmitBtn } from '../ui/SharedUI';

export default function PagesSection({ showMsg }) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('terms');
  
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
      } catch {
        showMsg('error', 'Error fetching pages data');
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
      showMsg('success', t('admin.common.save'));
    } catch { showMsg('error', 'Error'); }
    setSubmitting(false);
  };

  const savePrivacy = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await API.put('/admin/privacy', privacy);
      showMsg('success', t('admin.common.save'));
    } catch { showMsg('error', 'Error'); }
    setSubmitting(false);
  };

  const saveContact = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await API.put('/admin/contact-info', contact);
      showMsg('success', t('admin.common.save'));
    } catch { showMsg('error', 'Error'); }
    setSubmitting(false);
  };

  if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <>
      <SectionHeader title={t('admin.sections.pages.title')} />

      {/* Tabs */}
      <div className="flex gap-2 mb-6 p-1 bg-surface-container-high rounded-xl w-fit">
        {['terms', 'privacy', 'contact'].map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer ${
              activeTab === tab ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface'
            }`}
          >
            {tab === 'terms' ? 'Terms & Conditions / الشروط والأحكام' : tab === 'privacy' ? 'Privacy Policy / سياسة الخصوصية' : 'Contact Info / معلومات التواصل'}
          </button>
        ))}
      </div>

      <Card>
        {activeTab === 'terms' && (
          <form onSubmit={saveTerms} className="space-y-4">
            <h3 className="text-lg font-bold text-on-surface mb-2 border-b border-outline-variant/30 pb-2">Terms & Conditions / الشروط والأحكام</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <Input label="Title (EN)" value={terms.title} onChange={e => setTerms({...terms, title: e.target.value})} />
                <Textarea label="Content (EN) - HTML" value={terms.content} onChange={e => setTerms({...terms, content: e.target.value})} rows="10" />
              </div>
              <div className="space-y-3">
                <Input label="Title (AR)" value={terms.title_ar} onChange={e => setTerms({...terms, title_ar: e.target.value})} />
                <Textarea label="Content (AR) - HTML" value={terms.content_ar} onChange={e => setTerms({...terms, content_ar: e.target.value})} rows="10" />
              </div>
            </div>
            <div className="flex items-center gap-2 mt-2 mb-4">
              <input type="checkbox" id="terms_active" checked={terms.is_active} onChange={e => setTerms({...terms, is_active: e.target.checked})} className="w-4 h-4 cursor-pointer" />
              <label htmlFor="terms_active" className="text-sm font-bold cursor-pointer text-on-surface">Publish publicly / عرض العامة</label>
            </div>
            <SubmitBtn loading={submitting} label={t('admin.common.save')} className="w-48" />
          </form>
        )}

        {activeTab === 'privacy' && (
          <form onSubmit={savePrivacy} className="space-y-4">
            <h3 className="text-lg font-bold text-on-surface mb-2 border-b border-outline-variant/30 pb-2">Privacy Policy / سياسة الخصوصية</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <Input label="Title (EN)" value={privacy.title} onChange={e => setPrivacy({...privacy, title: e.target.value})} />
                <Textarea label="Content (EN) - HTML" value={privacy.content} onChange={e => setPrivacy({...privacy, content: e.target.value})} rows="10" />
              </div>
              <div className="space-y-3">
                <Input label="Title (AR)" value={privacy.title_ar} onChange={e => setPrivacy({...privacy, title_ar: e.target.value})} />
                <Textarea label="Content (AR) - HTML" value={privacy.content_ar} onChange={e => setPrivacy({...privacy, content_ar: e.target.value})} rows="10" />
              </div>
            </div>
            <div className="flex items-center gap-2 mt-2 mb-4">
              <input type="checkbox" id="privacy_active" checked={privacy.is_active} onChange={e => setPrivacy({...privacy, is_active: e.target.checked})} className="w-4 h-4 cursor-pointer" />
              <label htmlFor="privacy_active" className="text-sm font-bold cursor-pointer text-on-surface">Publish publicly / عرض العامة</label>
            </div>
            <SubmitBtn loading={submitting} label={t('admin.common.save')} className="w-48" />
          </form>
        )}

        {activeTab === 'contact' && (
          <form onSubmit={saveContact} className="space-y-4">
            <h3 className="text-lg font-bold text-on-surface mb-2 border-b border-outline-variant/30 pb-2">Contact Info / معلومات التواصل</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Email / البريد الإلكتروني *" type="email" required value={contact.email} onChange={e => setContact({...contact, email: e.target.value})} dir="ltr" />
              <Input label="Phone / رقم الهاتف" value={contact.phone} onChange={e => setContact({...contact, phone: e.target.value})} dir="ltr" />
              <Textarea label="Address (AR)" value={contact.address_ar} onChange={e => setContact({...contact, address_ar: e.target.value})} rows="2" />
              <Textarea label="Address (EN)" value={contact.address} onChange={e => setContact({...contact, address: e.target.value})} rows="2" />
            </div>

            <h4 className="text-sm font-bold text-on-surface-variant mt-6 border-t border-outline-variant/20 pt-4">Social Media / مواقع التواصل الاجتماعي</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Facebook URL" type="url" value={contact.facebook} onChange={e => setContact({...contact, facebook: e.target.value})} dir="ltr" />
              <Input label="Twitter (X) URL" type="url" value={contact.twitter} onChange={e => setContact({...contact, twitter: e.target.value})} dir="ltr" />
              <Input label="Instagram URL" type="url" value={contact.instagram} onChange={e => setContact({...contact, instagram: e.target.value})} dir="ltr" />
              <Input label="LinkedIn URL" type="url" value={contact.linkedin} onChange={e => setContact({...contact, linkedin: e.target.value})} dir="ltr" />
              <Input label="YouTube URL" type="url" value={contact.youtube} onChange={e => setContact({...contact, youtube: e.target.value})} dir="ltr" />
            </div>
            
            <div className="flex items-center gap-2 mt-4 mb-4">
              <input type="checkbox" id="contact_active" checked={contact.is_active} onChange={e => setContact({...contact, is_active: e.target.checked})} className="w-4 h-4 cursor-pointer" />
              <label htmlFor="contact_active" className="text-sm font-bold cursor-pointer text-on-surface">Show info publicly / إظهار العامة</label>
            </div>
            
            <SubmitBtn loading={submitting} label={t('admin.common.save')} className="w-48" />
          </form>
        )}
      </Card>
    </>
  );
}
