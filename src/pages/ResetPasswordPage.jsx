import React, { useState } from 'react';
import { useNavigate, useLocation, Link, Navigate } from 'react-router-dom';
import API from '../api/axios';
import { 
  Lock, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  Loader2 
} from 'lucide-react';

export default function ResetPasswordPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const emailFromState = location.state?.email || '';

  const [email, setEmail] = useState(emailFromState);
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // If accessed directly without an email in state, redirect to forgot-password
  if (!emailFromState && !email) {
    return <Navigate to="/forgot-password" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      return setError('كلمتا المرور غير متطابقتين');
    }

    if (password.length < 6) {
      return setError('يجب أن تكون كلمة المرور 6 أحرف على الأقل');
    }

    if (!code || code.length !== 5) {
      return setError('يجب إدخال كود التحقق المكون من 5 أرقام');
    }

    setLoading(true);

    try {
      await API.post(`/auth/reset-password`, { email, code, password });
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'عذراً، الكود غير صالح أو انتهت صلاحيته.');
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
              <ShieldCheck size={28} />
            </div>
            <h1 className="text-2xl font-extrabold text-on-surface tracking-tight">
              إعادة ضبط كلمة المرور
            </h1>
            <p className="text-xs sm:text-sm text-on-surface-variant">
              أدخل كلمة المرور الجديدة الحصينة لحسابك.
            </p>
          </div>

          {/* Feedback Alerts */}
          {error && (
            <div className="p-3.5 rounded-2xl bg-error/10 border border-error/30 text-error text-xs sm:text-sm flex items-start gap-2.5 animate-shake">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs sm:text-sm flex items-start gap-2.5">
              <CheckCircle2 size={18} className="shrink-0 mt-0.5" />
              <span>تم تغيير كلمة المرور بنجاح! جاري تحويلك لصفحة تسجيل الدخول...</span>
            </div>
          )}

          {/* Form */}
          {!success && (
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Verification Code */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-on-surface-variant block">
                  كود التحقق (5 أرقام)
                </label>
                <div className="relative">
                  <ShieldCheck size={18} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant/60" />
                  <input 
                    type="text" 
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 5))}
                    placeholder="12345"
                    className="w-full pr-10 pl-4 py-3 bg-surface/80 border border-outline-variant/50 rounded-2xl text-center tracking-[1em] font-bold text-lg text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    dir="ltr"
                    maxLength={5}
                  />
                </div>
              </div>

              {/* New Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-on-surface-variant block">
                  كلمة المرور الجديدة
                </label>
                <div className="relative">
                  <Lock size={18} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant/60" />
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pr-10 pl-11 py-3 bg-surface/80 border border-outline-variant/50 rounded-2xl text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    dir="ltr"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant/60 hover:text-on-surface transition-colors"
                    tabIndex="-1"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Confirm New Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-on-surface-variant block">
                  تأكيد كلمة المرور الجديدة
                </label>
                <div className="relative">
                  <Lock size={18} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant/60" />
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pr-10 pl-4 py-3 bg-surface/80 border border-outline-variant/50 rounded-2xl text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    dir="ltr"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-3.5 bg-primary text-on-primary font-bold text-sm rounded-2xl hover:bg-primary-hover disabled:opacity-60 transition-all flex items-center justify-center gap-2 shadow-glow cursor-pointer mt-2"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>جاري التحديث...</span>
                  </>
                ) : (
                  <span>حفظ كلمة المرور الجديدة</span>
                )}
              </button>
            </form>
          )}

          {/* Footer Navigation Link */}
          <div className="pt-4 border-t border-outline-variant/30 text-center text-xs text-on-surface-variant">
            تذكرت كلمة المرور؟{' '}
            <Link to="/login" className="text-primary font-bold hover:underline">
              تسجيل الدخول
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}