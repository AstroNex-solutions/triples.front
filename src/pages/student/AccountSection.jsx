import React, { useState, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import API from '../../api/axios';
import { AuthContext } from '../../context/AuthContext';
import { useOutletContext } from 'react-router-dom';
import { SectionHeader, Card, Input, SubmitBtn } from './SharedUI';
import { Shield, User as UserIcon, Lock, Link as LinkIcon, BookOpen, GraduationCap, Briefcase, FileText } from 'lucide-react';

export default function AccountSection() {
  const { showMsg } = useOutletContext();
  const { t } = useTranslation();
  const { user, setUser } = useContext(AuthContext);
  
  // Profile Form State
  const [profileForm, setProfileForm] = useState({ 
    name: user?.name || '', 
    phone: user?.phone || '', 
    department: user?.department || '',
    qualification: user?.qualification || '',
    shortBio: user?.shortBio || '',
    detail: user?.detail || '',
    interests: user?.interests || '',
    github: user?.github || '',
    youtube: user?.youtube || '',
    twitter: user?.twitter || '',
    facebook: user?.facebook || '',
    instagram: user?.instagram || '',
    linkedin: user?.linkedin || ''
  });
  const [file, setFile] = useState(null);
  const [submittingProfile, setSubmittingProfile] = useState(false);

  // Password Form State
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [submittingPassword, setSubmittingPassword] = useState(false);

  const handleProfileSubmit = async (e) => {
    e.preventDefault(); 
    setSubmittingProfile(true);
    try {
      const fd = new FormData();
      Object.entries(profileForm).forEach(([k, v]) => {
        if (v !== null && v !== undefined) fd.append(k, v);
      });
      if (file) fd.append('image_profile', file);
      
      const res = await API.put('/student/profile', fd);
      setUser(res.data.user);
      showMsg('success', t('studentDashboard.account.updateSuccess'));
    } catch { 
      showMsg('error', t('studentDashboard.account.updateError')); 
    } finally { 
      setSubmittingProfile(false); 
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showMsg('error', t('studentDashboard.account.passwordMismatch'));
      return;
    }
    
    setSubmittingPassword(true);
    try {
      await API.post('/student/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      showMsg('success', t('studentDashboard.account.passwordSuccess'));
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      showMsg('error', err.response?.data?.message || t('studentDashboard.account.passwordError'));
    } finally {
      setSubmittingPassword(false);
    }
  };

  const renderInput = (key, label, type = 'text', icon = null, isTextarea = false) => {
    const commonProps = {
      value: profileForm[key],
      onChange: e => setProfileForm({ ...profileForm, [key]: e.target.value }),
      className: "w-full bg-surface-container-low border border-outline-variant/50 text-on-surface text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all shadow-sm",
      placeholder: label
    };

    return (
      <div className="space-y-1.5 w-full">
        <label className="text-xs font-bold text-on-surface-variant flex items-center gap-1.5">
          {icon} {label}
        </label>
        {isTextarea ? (
          <textarea {...commonProps} rows="4" className={`${commonProps.className} resize-y custom-scrollbar`} />
        ) : (
          <input type={type} {...commonProps} />
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <SectionHeader title={t('studentDashboard.account.title')} />
      
      {/* Personal Information Section */}
      <form onSubmit={handleProfileSubmit} className="space-y-6">
        <Card className="overflow-hidden border-outline-variant/30 shadow-sm p-0">
          <div className="bg-surface-container-low/50 border-b border-outline-variant/30 p-5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <UserIcon size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-on-surface">{t('studentDashboard.account.personalInfo')}</h2>
              <p className="text-sm text-on-surface-variant">{t('studentDashboard.account.personalInfoDesc')}</p>
            </div>
          </div>
          
          <div className="p-5 md:p-6 space-y-8">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              {/* Profile Image */}
              <div className="shrink-0 flex flex-col items-center gap-3">
                <div className="w-32 h-32 rounded-full border-4 border-surface-container-high bg-surface-container-low overflow-hidden relative group shadow-md">
                  {file ? (
                    <img src={URL.createObjectURL(file)} alt="Preview" className="w-full h-full object-cover" />
                  ) : user?.image_profile ? (
                    <img 
                      src={(() => {
                        const p = user.image_profile;
                        if (p.startsWith('http')) return p;
                        const base = import.meta.env.VITE_API_URL || 'http://localhost:5000';
                        const cleanBase = base.endsWith('/') ? base.slice(0, -1) : base;
                        const cleanPath = p.startsWith('/') ? p : `/${p}`;
                        if (cleanPath.startsWith('/uploads/')) return `${cleanBase}${cleanPath}`;
                        return `${cleanBase}/uploads${cleanPath}`;
                      })()} 
                      alt="Profile" 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-primary font-black text-4xl">
                      {user?.name?.charAt(0) || 'U'}
                    </div>
                  )}
                  <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer text-white text-sm font-bold backdrop-blur-sm">
                    {t('studentDashboard.account.uploadNew')}
                    <input type="file" accept="image/*" onChange={e => setFile(e.target.files[0])} className="hidden" />
                  </label>
                </div>
                <p className="text-xs font-bold text-on-surface-variant text-center">{t('studentDashboard.account.profilePhoto')}</p>
              </div>
              
              {/* Basic Info */}
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-5 w-full">
                {renderInput('name', t('studentDashboard.account.fullName'))}
                {renderInput('phone', t('studentDashboard.account.phone'), 'tel')}
                {renderInput('department', t('studentDashboard.account.department'), 'text', <Briefcase size={14}/>)}
                {renderInput('qualification', t('studentDashboard.account.qualification'), 'text', <GraduationCap size={14}/>)}
              </div>
            </div>

            {/* Bio & Details */}
            <div className="border-t border-outline-variant/30 pt-6">
              <h3 className="text-sm font-black text-on-surface mb-4 flex items-center gap-2">
                <FileText size={16} className="text-primary" /> {t('studentDashboard.account.aboutMe')}
              </h3>
              <div className="grid grid-cols-1 gap-5">
                {renderInput('shortBio', t('studentDashboard.account.shortBio'))}
                {renderInput('detail', t('studentDashboard.account.detailedBio'), 'text', null, true)}
                {renderInput('interests', t('studentDashboard.account.interests'))}
              </div>
            </div>

            {/* Social Links */}
            <div className="border-t border-outline-variant/30 pt-6">
              <h3 className="text-sm font-black text-on-surface mb-4 flex items-center gap-2">
                <LinkIcon size={16} className="text-primary" /> {t('studentDashboard.account.socialLinks')}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {renderInput('github', t('studentDashboard.account.github'), 'url')}
                {renderInput('linkedin', t('studentDashboard.account.linkedin'), 'url')}
                {renderInput('twitter', t('studentDashboard.account.twitter'), 'url')}
                {renderInput('facebook', t('studentDashboard.account.facebook'), 'url')}
                {renderInput('youtube', t('studentDashboard.account.youtube'), 'url')}
                {renderInput('instagram', t('studentDashboard.account.instagram'), 'url')}
              </div>
            </div>

          </div>
          <div className="bg-surface-container-low/30 p-5 flex justify-end border-t border-outline-variant/30">
            <SubmitBtn loading={submittingProfile} label={t('studentDashboard.account.updateBtn')} />
          </div>
        </Card>
      </form>

      {/* Security Section */}
      <Card className="overflow-hidden border-outline-variant/30 shadow-sm p-0">
        <div className="bg-surface-container-low/50 border-b border-outline-variant/30 p-5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center">
            <Shield size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-on-surface">{t('studentDashboard.account.security')}</h2>
            <p className="text-sm text-on-surface-variant">{t('studentDashboard.account.securityDesc')}</p>
          </div>
        </div>
        
        <form onSubmit={handlePasswordSubmit} className="p-5 md:p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <Input 
                label={t('studentDashboard.account.currentPassword')} 
                type="password" 
                required
                value={passwordForm.currentPassword} 
                onChange={e => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })} 
                dir="ltr" 
              />
            </div>
            <Input 
              label={t('studentDashboard.account.newPassword')} 
              type="password" 
              required
              value={passwordForm.newPassword} 
              onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} 
              dir="ltr" 
            />
            <Input 
              label={t('studentDashboard.account.confirmPassword')} 
              type="password" 
              required
              value={passwordForm.confirmPassword} 
              onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })} 
              dir="ltr" 
            />
          </div>
          <div className="flex justify-end pt-4 border-t border-outline-variant/20">
            <button 
              type="submit" 
              disabled={submittingPassword}
              className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-surface border border-outline-variant/40 text-on-surface-variant font-bold hover:bg-rose-500 hover:text-white hover:border-rose-500 transition-colors disabled:opacity-50"
            >
              <Lock size={16} />
              {submittingPassword ? t('studentDashboard.account.saving') : t('studentDashboard.account.changePasswordBtn')}
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}
