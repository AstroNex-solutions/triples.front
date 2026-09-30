import React, { useState, useEffect, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2, Camera } from 'lucide-react';
import { Card, SectionHeader, Input, Textarea, SubmitBtn, Avatar } from '../ui/SharedUI';
import { useOutletContext } from 'react-router-dom';
import { AuthContext } from '../../../context/AuthContext';
import API from '../../../api/axios';

export default function ProfileSection() {
  const { t } = useTranslation();
  const { showMsg } = useOutletContext();
  const { user: authUser, checkAuth } = useContext(AuthContext);
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    shortBio: '',
    detail: '',
    department: '',
    qualification: '',
    github: '',
    youtube: '',
    twitter: '',
    facebook: '',
    instagram: '',
    linkedin: ''
  });
  const [profileImage, setProfileImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    API.get('/auth/profile')
      .then(res => {
        if (res.data.user) {
          const u = res.data.user;
          setFormData({
            name: u.name || '',
            phone: u.phone || '',
            shortBio: u.shortBio || '',
            detail: u.detail || '',
            department: u.department || '',
            qualification: u.qualification || '',
            github: u.github || '',
            youtube: u.youtube || '',
            twitter: u.twitter || '',
            facebook: u.facebook || '',
            instagram: u.instagram || '',
            linkedin: u.linkedin || ''
          });
          if (u.image_profile && u.image_profile !== 'blank.png') {
            const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
            const imagePath = u.image_profile.startsWith('/') ? u.image_profile : `/uploads/${u.image_profile}`;
            setPreviewImage(`${baseUrl}${imagePath}`);
          }
        }
      })
      .catch(err => {
        console.error(err);
        showMsg('error', 'فشل تحميل بيانات الملف الشخصي');
      })
      .finally(() => setLoading(false));
  }, []);

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfileImage(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    const form = new FormData();
    Object.keys(formData).forEach(key => {
      form.append(key, formData[key] || '');
    });
    
    if (profileImage) {
      form.append('image_profile', profileImage);
    }

    try {
      await API.put('/auth/profile', form);
      checkAuth();
    } catch (err) {
      console.error('Update Profile Error:', err.response || err);
      const errorMsg = err.response?.data?.message || err.message || 'حدث خطأ أثناء التحديث';
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="flex justify-center p-10"><Loader2 size={32} className="animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300 max-w-5xl mx-auto">
      <SectionHeader title="إعدادات الملف الشخصي للآدمن" />
      
      <Card>
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Avatar Section */}
          <div className="flex flex-col items-center sm:items-start sm:flex-row gap-6 border-b border-outline-variant/30 pb-6">
            <div className="relative group">
              <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-surface shadow-md bg-primary/10 flex items-center justify-center">
                {previewImage ? (
                  <img src={previewImage} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <Avatar name={authUser?.name || 'A'} size="xl" />
                )}
              </div>
              <label className="absolute bottom-0 right-0 p-2 bg-primary text-white rounded-full cursor-pointer shadow-glow hover:bg-primary-hover transition-colors">
                <Camera size={16} />
                <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
              </label>
            </div>
            <div className="flex-1 space-y-1 text-center sm:text-start pt-2">
              <h3 className="text-xl font-black text-on-surface">{authUser?.name || 'Admin'}</h3>
              <p className="text-sm text-on-surface-variant font-medium">{authUser?.email}</p>
              <div className="inline-flex mt-2 items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary">
                {authUser?.status || 'Admin'}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-bold text-primary border-b border-outline-variant/30 pb-2">البيانات الأساسية</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input 
                label="الاسم الكامل" 
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})} 
                required
              />
              <Input 
                label="رقم الهاتف" 
                value={formData.phone} 
                onChange={e => setFormData({...formData, phone: e.target.value})} 
              />
              <Input 
                label="القسم (Department)" 
                value={formData.department} 
                onChange={e => setFormData({...formData, department: e.target.value})} 
              />
              <Input 
                label="المؤهل (Qualification)" 
                value={formData.qualification} 
                onChange={e => setFormData({...formData, qualification: e.target.value})} 
              />
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-bold text-primary border-b border-outline-variant/30 pb-2">نبذة وتفاصيل</h4>
            <div className="space-y-4">
              <Input 
                label="نبذة قصيرة (Short Bio)" 
                value={formData.shortBio} 
                onChange={e => setFormData({...formData, shortBio: e.target.value})} 
              />
              <Textarea 
                label="التفاصيل (Detail)" 
                value={formData.detail} 
                onChange={e => setFormData({...formData, detail: e.target.value})} 
                rows={4}
              />
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-bold text-primary border-b border-outline-variant/30 pb-2">روابط السوشيال ميديا</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="فيسبوك" value={formData.facebook} onChange={e => setFormData({...formData, facebook: e.target.value})} />
              <Input label="تويتر" value={formData.twitter} onChange={e => setFormData({...formData, twitter: e.target.value})} />
              <Input label="إنستجرام" value={formData.instagram} onChange={e => setFormData({...formData, instagram: e.target.value})} />
              <Input label="لينكد إن" value={formData.linkedin} onChange={e => setFormData({...formData, linkedin: e.target.value})} />
              <Input label="يوتيوب" value={formData.youtube} onChange={e => setFormData({...formData, youtube: e.target.value})} />
              <Input label="جيت هب" value={formData.github} onChange={e => setFormData({...formData, github: e.target.value})} />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-outline-variant/30">
            <SubmitBtn loading={submitting} label="حفظ الملف الشخصي" className="w-full sm:w-auto" />
          </div>
        </form>
      </Card>
    </div>
  );
}
