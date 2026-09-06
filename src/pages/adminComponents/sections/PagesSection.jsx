import { useOutletContext } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import API from '../../../api/axios';
import { Loader2 } from 'lucide-react';
import { SectionHeader, Card, Input, SubmitBtn } from '../ui/SharedUI';
import RichTextEditor from '../ui/RichTextEditor';

export default function PagesSection() {
  const { showMsg } = useOutletContext();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('aboutus');
  
  const [aboutus, setAboutUs] = useState({ title: '', content: '', title_ar: '', content_ar: '', is_active: true });
  const [terms, setTerms] = useState({ title: '', content: '', title_ar: '', content_ar: '', is_active: true });
  const [privacy, setPrivacy] = useState({ title: '', content: '', title_ar: '', content_ar: '', is_active: true });
  const [contact, setContact] = useState({ email: '', phone: '', address: '', address_ar: '', facebook: '', twitter: '', instagram: '', linkedin: '', youtube: '', is_active: true });
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [resAbout, resTerms, resPrivacy, resContact] = await Promise.all([
          API.get('/admin/about-us'),
          API.get('/admin/terms'),
          API.get('/admin/privacy-policy'),
          API.get('/admin/contact-info')
        ]);
        if (resAbout.data.aboutUs) setAboutUs(resAbout.data.aboutUs);
        if (resTerms.data.terms) setTerms(resTerms.data.terms);
        if (resPrivacy.data.policy) setPrivacy(resPrivacy.data.policy);
        if (resContact.data.info) setContact(resContact.data.info);
      } catch (err) {
        showMsg('error', 'Error fetching pages data');
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const saveAboutUs = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await API.put('/admin/about-us', aboutus);
      showMsg('success', t('admin.common.save'));
    } catch { showMsg('error', 'Error'); }
    setSubmitting(false);
  };

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
      await API.put('/admin/privacy-policy', privacy);
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
      <div className="flex flex-wrap gap-2 mb-6 p-1 bg-surface-container-high rounded-xl w-fit">
        {['aboutus', 'terms', 'privacy', 'contact'].map(tab => {
          const labels = {
            aboutus: 'About Us / من نحن',
            terms: 'Terms & Conditions / الشروط والأحكام',
            privacy: 'Privacy Policy / سياسة الخصوصية',
            contact: 'Contact Info / معلومات التواصل'
          };
          return (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer ${
                activeTab === tab ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface'
              }`}
            >
              {labels[tab]}
            </button>
          )
        })}
      </div>

      <Card>
        {activeTab === 'aboutus' && (
          <form onSubmit={saveAboutUs} className="space-y-4">
            <h3 className="text-lg font-bold text-on-surface mb-2 border-b border-outline-variant/30 pb-2">About Us / من نحن</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <Input label="Title (EN)" value={aboutus.title} onChange={e => setAboutUs({...aboutus, title: e.target.value})} />
                <RichTextEditor label="Content (EN)" value={aboutus.content} onChange={val => setAboutUs({...aboutus, content: val})} />
              </div>
              <div className="space-y-4">
                <Input label="العنوان (AR)" value={aboutus.title_ar} onChange={e => setAboutUs({...aboutus, title_ar: e.target.value})} />
                <RichTextEditor label="المحتوى (AR)" value={aboutus.content_ar} onChange={val => setAboutUs({...aboutus, content_ar: val})} />
              </div>
            </div>
            <SubmitBtn label={t('admin.common.save')} loading={submitting} />
          </form>
        )}

        {activeTab === 'terms' && (
          <form onSubmit={saveTerms} className="space-y-4">
            <h3 className="text-lg font-bold text-on-surface mb-2 border-b border-outline-variant/30 pb-2">Terms & Conditions / الشروط والأحكام</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <Input label="Title (EN)" value={terms.title} onChange={e => setTerms({...terms, title: e.target.value})} />
                <RichTextEditor label="Content (EN)" value={terms.content} onChange={val => setTerms({...terms, content: val})} />
              </div>
              <div className="space-y-4">
                <Input label="العنوان (AR)" value={terms.title_ar} onChange={e => setTerms({...terms, title_ar: e.target.value})} />
                <RichTextEditor label="المحتوى (AR)" value={terms.content_ar} onChange={val => setTerms({...terms, content_ar: val})} />
              </div>
            </div>
            <SubmitBtn label={t('admin.common.save')} loading={submitting} />
          </form>
        )}

        {activeTab === 'privacy' && (
          <form onSubmit={savePrivacy} className="space-y-4">
            <h3 className="text-lg font-bold text-on-surface mb-2 border-b border-outline-variant/30 pb-2">Privacy Policy / سياسة الخصوصية</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <Input label="Title (EN)" value={privacy.title} onChange={e => setPrivacy({...privacy, title: e.target.value})} />
                <RichTextEditor label="Content (EN)" value={privacy.content} onChange={val => setPrivacy({...privacy, content: val})} />
              </div>
              <div className="space-y-4">
                <Input label="العنوان (AR)" value={privacy.title_ar} onChange={e => setPrivacy({...privacy, title_ar: e.target.value})} />
                <RichTextEditor label="المحتوى (AR)" value={privacy.content_ar} onChange={val => setPrivacy({...privacy, content_ar: val})} />
              </div>
            </div>
            <SubmitBtn label={t('admin.common.save')} loading={submitting} />
          </form>
        )}

        {activeTab === 'contact' && (
          <form onSubmit={saveContact} className="space-y-4">
            <h3 className="text-lg font-bold text-on-surface mb-2 border-b border-outline-variant/30 pb-2">Contact Info / معلومات التواصل</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Input label="Email Address" type="email" value={contact.email} onChange={e => setContact({...contact, email: e.target.value})} />
              <Input label="Phone Number" value={contact.phone} onChange={e => setContact({...contact, phone: e.target.value})} />
              <div className="sm:col-span-2 lg:col-span-1"></div>
              
              <Input label="Address (EN)" value={contact.address} onChange={e => setContact({...contact, address: e.target.value})} />
              <Input label="Address (AR)" value={contact.address_ar} onChange={e => setContact({...contact, address_ar: e.target.value})} />
              
              <Input label="Facebook URL" value={contact.facebook} onChange={e => setContact({...contact, facebook: e.target.value})} />
              <Input label="Twitter (X) URL" value={contact.twitter} onChange={e => setContact({...contact, twitter: e.target.value})} />
              <Input label="Instagram URL" value={contact.instagram} onChange={e => setContact({...contact, instagram: e.target.value})} />
              <Input label="LinkedIn URL" value={contact.linkedin} onChange={e => setContact({...contact, linkedin: e.target.value})} />
              <Input label="YouTube URL" value={contact.youtube} onChange={e => setContact({...contact, youtube: e.target.value})} />
            </div>
            <SubmitBtn label={t('admin.common.save')} loading={submitting} />
          </form>
        )}
      </Card>
    </>
  );
}
