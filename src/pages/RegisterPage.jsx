import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { 
  UserPlus, 
  Sparkles, 
  User, 
  AtSign, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  GraduationCap, 
  Briefcase, 
  AlertCircle, 
  Loader2 
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function RegisterPage() {
  const { t } = useTranslation();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState('Student');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError(t('auth.register.passwordMismatch', 'كلمة المرور غير متطابقة') || 'كلمة المرور غير متطابقة');
      return;
    }

    setLoading(true);

    try {
      const fullName = `${firstName} ${lastName}`.trim();
      const generatedUsername = `${firstName.toLowerCase().replace(/[^a-z0-9]/g, '')}${Math.floor(Math.random() * 10000)}`;
      await register({ name: fullName, username: generatedUsername, email, password, status });
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || t('auth.register.errCreate'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4 py-10 relative overflow-hidden">
      {/* Background Glow Elements */}
      <div className="absolute top-1/4 -right-20 w-96 h-96 bg-primary/20 rounded-full blur-3xl opacity-50 pointer-events-none animate-pulse" />
      <div className="absolute -bottom-10 -left-20 w-96 h-96 bg-secondary/20 rounded-full blur-3xl opacity-50 pointer-events-none animate-pulse" style={{ animationDelay: '1s' }} />

      <div className="relative w-full max-w-lg z-10">
        {/* Form Card */}
        <div className="relative rounded-3xl bg-surface/60 border border-outline-variant/30 dark:border-white/5 p-8 sm:p-10 backdrop-blur-2xl shadow-2xl hover:shadow-primary/5 transition-shadow duration-500 space-y-6">
          
          {/* Header */}
          <div className="text-center space-y-2">
            <img className="w-40 mx-auto mb-4" src="logo.png" alt="logo" />
            <h1 className="text-2xl font-extrabold text-on-surface tracking-tight">
              {t('auth.register.title')}
            </h1>
            <p className="text-xs sm:text-sm text-on-surface-variant">
              {t('auth.register.subtitle')} <span className="font-bold text-primary">Triple S Academy</span>
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
          <form onSubmit={handleSubmit} className="space-y-4">
            

            {/* Name Inputs */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-on-surface-variant block">
                  {t('auth.register.firstName') || 'الاسم الأول'}
                </label>
                <div className="relative group">
                  <User size={18} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant/50 group-focus-within:text-primary transition-colors duration-300" />
                  <input 
                    type="text" 
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder={t('auth.register.firstNamePlaceholder') || 'الاسم الأول'}
                    className="w-full pr-10 pl-4 py-3 bg-surface/50 hover:bg-surface/80 border border-outline-variant/30 rounded-2xl text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:bg-background focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/15 transition-all duration-300"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-on-surface-variant block">
                  {t('auth.register.lastName') || 'الاسم الأخير'}
                </label>
                <div className="relative group">
                  <User size={18} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant/50 group-focus-within:text-primary transition-colors duration-300" />
                  <input 
                    type="text" 
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder={t('auth.register.lastNamePlaceholder') || 'الاسم الأخير'}
                    className="w-full pr-10 pl-4 py-3 bg-surface/50 hover:bg-surface/80 border border-outline-variant/30 rounded-2xl text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:bg-background focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/15 transition-all duration-300"
                  />
                </div>
              </div>
            </div>

            {/* Email Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-on-surface-variant block">
                {t('auth.login.email')}
              </label>
              <div className="relative group">
                <Mail size={18} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant/50 group-focus-within:text-primary transition-colors duration-300" />
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pr-10 pl-4 py-3 bg-surface/50 hover:bg-surface/80 border border-outline-variant/30 rounded-2xl text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:bg-background focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/15 transition-all duration-300"
                  dir="ltr"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-on-surface-variant block">
                {t('auth.login.password')}
              </label>
              <div className="relative group">
                <Lock size={18} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant/50 group-focus-within:text-primary transition-colors duration-300" />
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pr-10 pl-11 py-3 bg-surface/50 hover:bg-surface/80 border border-outline-variant/30 rounded-2xl text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:bg-background focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/15 transition-all duration-300"
                  dir="ltr"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant/50 hover:text-primary transition-colors duration-300"
                  tabIndex="-1"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Confirm Password Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-on-surface-variant block">
                {t('auth.register.confirmPassword') || 'تأكيد كلمة المرور'}
              </label>
              <div className="relative group">
                <Lock size={18} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant/50 group-focus-within:text-primary transition-colors duration-300" />
                <input 
                  type={showConfirmPassword ? 'text' : 'password'} 
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pr-10 pl-11 py-3 bg-surface/50 hover:bg-surface/80 border border-outline-variant/30 rounded-2xl text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:bg-background focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/15 transition-all duration-300"
                  dir="ltr"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant/50 hover:text-primary transition-colors duration-300"
                  tabIndex="-1"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-primary to-primary-hover text-on-primary font-bold text-sm rounded-2xl hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0 transition-all duration-300 flex items-center justify-center gap-2 mt-4"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>{t('auth.register.submitting')}</span>
                </>
              ) : (
                <>
                  <UserPlus size={18} />
                  <span>{t('auth.register.submit')}</span>
                </>
              )}
            </button>
          </form>

          {/* Footer Link */}
          <div className="pt-4 border-t border-outline-variant/30 text-center text-xs text-on-surface-variant">
            {t('auth.register.haveAccount')}{' '}
            <Link to="/login" className="text-primary font-bold hover:underline">
              {t('auth.register.login')}
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}