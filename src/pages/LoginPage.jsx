import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { 
  LogIn, 
  Sparkles, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  Loader2,
  KeyRound,
  ShieldCheck
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function LoginPage() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // 2FA States
  const [show2FA, setShow2FA] = useState(false);
  const [code, setCode] = useState('');

  const { login, verifyLogin } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await login(email, password);
      
      if (data.requires2FA) {
        setShow2FA(true);
      } else {
        if (data.user?.status === 'Admin') {
          navigate('/admin');
        } else if (data.user?.status === 'Instructor') {
          navigate('/instructor');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || t('auth.login.errInvalid'));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await verifyLogin(email, code);
      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.message || t('auth.login.errCode'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      {/* Container Background Glow */}
      <div className="relative w-full max-w-md">
        <div className="absolute -top-10 -right-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-72 h-72 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />

        {/* Main Form Card */}
        <div className="relative rounded-3xl bg-surface-container-low/70 border border-outline-variant/40 p-6 sm:p-10 backdrop-blur-xl shadow-xl space-y-6">
          
          {/* Header */}
          <div className="text-center space-y-2">
            <img className="w-40 mx-auto mb-4" src="logo.png" alt="logo" />
            <h1 className="text-2xl font-extrabold text-on-surface tracking-tight">
              {show2FA ? t('auth.login.twoFactor') : t('auth.login.title')}
            </h1>
            <p className="text-xs sm:text-sm text-on-surface-variant">
              {show2FA 
                ? t('auth.login.subtitle2fa') 
                : <>{t('auth.login.subtitle')} <span className="font-bold text-primary">Triple S Academy</span></>}
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="p-3.5 rounded-2xl bg-error/10 border border-error/30 text-error text-xs sm:text-sm flex items-start gap-2.5 animate-shake">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          {!show2FA ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              
              {/* Email Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-on-surface-variant block">
                  {t('auth.login.email')}
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

              {/* Password Input */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-on-surface-variant block">
                    {t('auth.login.password')}
                  </label>
                  <Link 
                    to="/forgot-password" 
                    className="text-[11px] text-primary hover:underline font-medium"
                  >
                    {t('auth.login.forgotPassword')}
                  </Link>
                </div>
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

              {/* Submit Button */}
              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-3.5 bg-primary text-on-primary font-bold text-sm rounded-2xl hover:bg-primary-hover disabled:opacity-60 transition-all flex items-center justify-center gap-2 shadow-glow cursor-pointer mt-2"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>{t('auth.login.submitting')}</span>
                  </>
                ) : (
                  <>
                    <LogIn size={18} />
                    <span>{t('auth.login.submit')}</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifySubmit} className="space-y-4 animate-fade-in">
              {/* Code Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-on-surface-variant block text-center mb-4">
                  {t('auth.login.verifyCode')} ({email})
                </label>
                <div className="relative max-w-xs mx-auto">
                  <KeyRound size={18} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant/60" />
                  <input 
                    type="text"
                    required
                    maxLength={5}
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="12345"
                    className="w-full pr-10 pl-4 py-3 bg-surface/80 border border-outline-variant/50 rounded-2xl text-lg text-center tracking-[1em] text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    dir="ltr"
                  />
                </div>
              </div>
              
              <button 
                type="submit" 
                disabled={loading || code.length !== 5}
                className="w-full py-3.5 bg-primary text-on-primary font-bold text-sm rounded-2xl hover:bg-primary-hover disabled:opacity-60 transition-all flex items-center justify-center gap-2 shadow-glow cursor-pointer mt-4"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>{t('auth.login.verifying')}</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck size={18} />
                    <span>{t('auth.login.confirmLogin')}</span>
                  </>
                )}
              </button>

              <button 
                type="button"
                onClick={() => setShow2FA(false)}
                className="w-full text-xs text-on-surface-variant hover:text-on-surface mt-2 transition-colors cursor-pointer"
              >
                {t('auth.login.backToLogin')}
              </button>
            </form>
          )}

          {/* Footer Navigation Link */}
          {!show2FA && (
            <div className="pt-4 border-t border-outline-variant/30 text-center text-xs text-on-surface-variant">
              {t('auth.login.noAccount')}{' '}
              <Link to="/register" className="text-primary font-bold hover:underline">
                {t('auth.login.createAccount')}
              </Link>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}