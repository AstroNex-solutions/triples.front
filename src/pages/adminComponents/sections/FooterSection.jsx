import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2 } from 'lucide-react';
import { Card, SectionHeader, Input, Textarea, SubmitBtn } from '../ui/SharedUI';
import { useOutletContext } from 'react-router-dom';
import API from '../../../api/axios';

export default function FooterSection() {
  const { t } = useTranslation();
  const { showMsg } = useOutletContext();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    description: '',
    description_ar: '',
    email: '',
    address: '',
    address_ar: '',
    facebook: '',
    instagram: '',
    twitter: '',
    youtube: ''
  });

  useEffect(() => {
    API.get('/admin/contact-info')
      .then(res => {
        if (res.data.contactInfo) setFormData(res.data.contactInfo);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await API.put('/admin/contact-info', formData);
      showMsg('success', 'تم حفظ إعدادات الفوتر بنجاح');
    } catch (err) {
      showMsg('error', 'حدث خطأ أثناء الحفظ');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="flex justify-center p-10"><Loader2 size={32} className="animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
      <SectionHeader title="إعدادات الفوتر (Footer)" />
      
      <Card className="max-w-4xl">
        <form onSubmit={handleSubmit} className="space-y-8">
          
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-primary border-b border-outline-variant/30 pb-2">الوصف والنص التعريفي</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Textarea 
                label="وصف المنصة (عربي)" 
                value={formData.description_ar || ''} 
                onChange={e => setFormData({...formData, description_ar: e.target.value})} 
              />
              <Textarea 
                label="وصف المنصة (إنجليزي)" 
                value={formData.description || ''} 
                onChange={e => setFormData({...formData, description: e.target.value})} 
              />
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-bold text-primary border-b border-outline-variant/30 pb-2">بيانات التواصل</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input 
                label="البريد الإلكتروني (Email)" 
                type="email" 
                value={formData.email || ''} 
                onChange={e => setFormData({...formData, email: e.target.value})} 
              />
              <div className="col-span-1"></div>
              <Input 
                label="العنوان (عربي)" 
                value={formData.address_ar || ''} 
                onChange={e => setFormData({...formData, address_ar: e.target.value})} 
              />
              <Input 
                label="العنوان (إنجليزي)" 
                value={formData.address || ''} 
                onChange={e => setFormData({...formData, address: e.target.value})} 
              />
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-bold text-primary border-b border-outline-variant/30 pb-2">روابط السوشيال ميديا</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input 
                label="رابط فيسبوك (Facebook)" 
                type="url"
                value={formData.facebook || ''} 
                onChange={e => setFormData({...formData, facebook: e.target.value})} 
              />
              <Input 
                label="رابط تويتر (Twitter)" 
                type="url"
                value={formData.twitter || ''} 
                onChange={e => setFormData({...formData, twitter: e.target.value})} 
              />
              <Input 
                label="رابط إنستجرام (Instagram)" 
                type="url"
                value={formData.instagram || ''} 
                onChange={e => setFormData({...formData, instagram: e.target.value})} 
              />
              <Input 
                label="رابط يوتيوب (Youtube)" 
                type="url"
                value={formData.youtube || ''} 
                onChange={e => setFormData({...formData, youtube: e.target.value})} 
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-outline-variant/30">
            <SubmitBtn loading={submitting} label="حفظ التعديلات" className="w-full sm:w-auto" />
          </div>
        </form>
      </Card>
    </div>
  );
}
