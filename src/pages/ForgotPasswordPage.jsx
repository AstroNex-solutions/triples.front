import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { 
  KeyRound, 
  Mail, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  Loader2 
} from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      await API.post('/auth/forgot-password', { email });
      setSuccess(true);
      // توجيه المستخدم لصفحة إعادة تعيين كلمة المرور مع تمرير البريد
      setTimeout(() => {
        navigate('/reset-password', { state: { email } });
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'حدث خطأ أثناء إرسال الكود. تحقق من البريد الإلكتروني.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 " dir="rtl">
      {/* Background Glow */}
      <div className="relative w-full max-w-md">
        <div className="absolute -top-10 -right-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-72 h-72 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />

        {/* Main Card */}
        <div className="relative rounded-3xl bg-surface-container-low/70 border border-outline-variant/40 p-6 sm:p-10 backdrop-blur-xl shadow-xl space-y-6">
          
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary to-secondary text-on-primary shadow-glow mb-2">
              <KeyRound size={28} />
            </div>
            <h1 className="text-2xl font-extrabold text-on-surface tracking-tight">
              استعادة كلمة المرور
            </h1>
            <p className="text-xs sm:text-sm text-on-surface-variant">
              أدخل بريدك الإلكتروني وسيتم إرسال كود تحقق مكون من 5 أرقام لاستعادة كلمة المرور الخاصة بك.
            </p>
          </div>

          {/* Feedback Messages */}
          {error && (
            <div className="p-3.5 rounded-2xl bg-error/10 border border-error/30 text-error text-xs sm:text-sm flex items-start gap-2.5 animate-shake">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs sm:text-sm flex items-start gap-2.5">
              <CheckCircle2 size={18} className="shrink-0 mt-0.5" />
              <span>تم إرسال كود التحقق المكون من 5 أرقام إلى بريدك الإلكتروني. سيتم تحويلك الآن...</span>
            </div>
          )}

          {/* Form */}
          {!success && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-on-surface-variant block">
                  البريد الإلكتروني
                </label>
                <div className="relative">
                  <Mail size={18} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant/60" />
                  <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pr-10 pl-4 py-3 bg-surface/80 border border-outline-variant/50 rounded-2xl text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    dir="ltr"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-3.5 bg-primary text-on-primary font-bold text-sm rounded-2xl hover:bg-primary-hover disabled:opacity-60 transition-all flex items-center justify-center gap-2 shadow-glow cursor-pointer mt-2"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>جاري الإرسال...</span>
                  </>
                ) : (
                  <span>إرسال رابط الإعادة</span>
                )}
              </button>
            </form>
          )}

          {/* Footer Back Link */}
          <div className="pt-4 border-t border-outline-variant/30 text-center">
            <Link 
              to="/login" 
              className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
            >
              <ArrowRight size={16} />
              <span>العودة لتسجيل الدخول</span>
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}