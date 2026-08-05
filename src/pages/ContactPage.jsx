import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Send, 
  MessageSquare, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  Loader2,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube
} from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const [status, setStatus] = useState({ loading: false, success: null, message: '' });
  const [contactInfo, setContactInfo] = useState(null);
  const [loadingInfo, setLoadingInfo] = useState(true);

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        const res = await API.get('/extras/contact-info');
        if (res.data.info) setContactInfo(res.data.info);
      } catch (err) {
        console.error('Error fetching contact info:', err);
      }
      setLoadingInfo(false);
    };
    fetchInfo();
  }, []);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, success: null, message: '' });

    try {
      await API.post('/extras/contact', formData);
      setStatus({
        loading: false,
        success: true,
        message: 'تم إرسال رسالتك بنجاح! سيتواصل معك فريق الدعم في أقرب وقت.'
      });
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch (err) {
      console.error('Contact error:', err);
      setStatus({
        loading: false,
        success: false,
        message: err.response?.data?.message || 'حدث خطأ أثناء إرسال الرسالة، يرجى المحاولة لاحقاً.'
      });
    }
  };

  const displayInfo = [
    {
      icon: Phone,
      title: 'رقم الهاتف',
      value: contactInfo?.phone ,
    },
    {
      icon: Mail,
      title: 'البريد الإلكتروني',
      value: contactInfo?.email,
    },
    {
      icon: MapPin,
      title: 'العنوان',
      value: contactInfo?.address_ar || contactInfo?.address ,
    }
  ];

  if (loadingInfo) {
    return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>;
  }

  return (
    <div className="min-h-screen pb-20 pt-6 px-4 sm:px-6 lg:px-12 max-w-container-max mx-auto space-y-12 " dir="rtl">
      
      {/* 1. Page Header */}
      <div className="relative rounded-3xl bg-surface-container-low/70 border border-outline-variant/40 p-6 sm:p-10 backdrop-blur-xl overflow-hidden shadow-sm">
        <div className="absolute -top-12 -right-12 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold border border-primary/20">
            <MessageSquare size={15} />
            <span>نحن هنا للمساعدة</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-on-surface tracking-tight">
            تواصل معنا
          </h1>
          <p className="text-on-surface-variant text-sm sm:text-base leading-relaxed">
            {contactInfo?.description_ar || contactInfo?.description || 'هل لديك استفسار حول الدورات أو الاشتراكات؟ فريق الدعم الأكاديمي جاهز للإجابة على جميع أسئلتك.'}
          </p>
        </div>
      </div>

      {/* 2. Contact Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Contact Info Cards */}
        <div className="space-y-4">
          {displayInfo.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div 
                key={idx} 
                className="rounded-3xl bg-surface-container-low/50 border border-outline-variant/30 p-5 backdrop-blur-md flex items-start gap-4 hover:border-primary/30 transition-all"
              >
                <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Icon size={22} />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xs font-bold text-on-surface-variant">{item.title}</h3>
                  <p className="text-base font-bold text-on-surface" dir="ltr">{item.value}</p>
                </div>
              </div>
            );
          })}

          {/* Social Links if exist */}
          <div className="flex gap-3 justify-center pt-4">
            {contactInfo?.facebook && <a href={contactInfo.facebook} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center text-primary hover:bg-primary hover:text-on-primary transition-all"><Facebook size={18} /></a>}
            {contactInfo?.twitter && <a href={contactInfo.twitter} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center text-primary hover:bg-primary hover:text-on-primary transition-all"><Twitter size={18} /></a>}
            {contactInfo?.instagram && <a href={contactInfo.instagram} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center text-primary hover:bg-primary hover:text-on-primary transition-all"><Instagram size={18} /></a>}
            {contactInfo?.linkedin && <a href={contactInfo.linkedin} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center text-primary hover:bg-primary hover:text-on-primary transition-all"><Linkedin size={18} /></a>}
            {contactInfo?.youtube && <a href={contactInfo.youtube} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center text-primary hover:bg-primary hover:text-on-primary transition-all"><Youtube size={18} /></a>}
          </div>
        </div>

        {/* Contact Form Panel */}
        <div className="lg:col-span-2 rounded-3xl bg-surface-container-low/70 border border-outline-variant/40 p-6 sm:p-8 backdrop-blur-xl">
          <h2 className="text-xl font-extrabold text-on-surface mb-6">أرسل لنا رسالة</h2>

          {status.message && (
            <div className={`p-4 rounded-2xl mb-6 flex items-start gap-3 border text-sm ${
              status.success 
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                : 'bg-error/10 border-error/30 text-error'
            }`}>
              {status.success ? <CheckCircle2 size={20} className="shrink-0 mt-0.5" /> : <AlertCircle size={20} className="shrink-0 mt-0.5" />}
              <span>{status.message}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-on-surface-variant">الاسم الكامل *</label>
                <input 
                  type="text" 
                  name="name" 
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="أدخل اسمك الثلاثي" 
                  className="w-full px-4 py-3 bg-surface/80 border border-outline-variant/50 rounded-2xl text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-on-surface-variant">البريد الإلكتروني *</label>
                <input 
                  type="email" 
                  name="email" 
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="example@domain.com" 
                  className="w-full px-4 py-3 bg-surface/80 border border-outline-variant/50 rounded-2xl text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Phone */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-on-surface-variant">رقم الهاتف</label>
                <input 
                  type="tel" 
                  name="phone" 
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+20 100 000 0000" 
                  className="w-full px-4 py-3 bg-surface/80 border border-outline-variant/50 rounded-2xl text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>

              {/* Subject */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-on-surface-variant">موضوع الرسالة *</label>
                <input 
                  type="text" 
                  name="subject" 
                  required
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="مثال: استفسار عن تسجيل دوره..." 
                  className="w-full px-4 py-3 bg-surface/80 border border-outline-variant/50 rounded-2xl text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
            </div>

            {/* Message */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-on-surface-variant">نص الرسالة *</label>
              <textarea 
                name="message" 
                rows="5"
                required
                value={formData.message}
                onChange={handleChange}
                placeholder="اكتب تفاصيل استفسارك هنا..." 
                className="w-full px-4 py-3 bg-surface/80 border border-outline-variant/50 rounded-2xl text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none"
              ></textarea>
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={status.loading}
              className="w-full sm:w-auto px-8 py-3.5 bg-primary text-on-primary font-bold text-sm rounded-2xl hover:bg-primary-hover disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-glow cursor-pointer"
            >
              {status.loading ? (
                <span>جاري الإرسال...</span>
              ) : (
                <>
                  <Send size={16} />
                  <span>إرسال الرسالة</span>
                </>
              )}
            </button>
          </form>
        </div>

      </div>

    </div>
  );
}