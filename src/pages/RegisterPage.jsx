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

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('Student');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register({ name, username, email, password, status });
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'حدث خطأ أثناء إنشاء الحساب');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-10 " dir="rtl">
      {/* Background Glow Elements */}
      <div className="relative w-full max-w-lg">
        <div className="absolute -top-12 -right-12 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-80 h-80 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />

        {/* Form Card */}
        <div className="relative rounded-3xl bg-surface-container-low/70 border border-outline-variant/40 p-6 sm:p-10 backdrop-blur-xl shadow-xl space-y-6">
          
          {/* Header */}
          <div className="text-center space-y-2">
            <img className="w-40 mx-auto mb-4" src="logo.png" alt="logo" />
            <h1 className="text-2xl font-extrabold text-on-surface tracking-tight">
              إنشاء حساب جديد
            </h1>
            <p className="text-xs sm:text-sm text-on-surface-variant">
              انضم لأكبر تجمع تعليمي وتطويري في منصة <span className="font-bold text-primary">Triple S Academy</span>
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
            

            {/* Name Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-on-surface-variant block">
                الاسم الكامل
              </label>
              <div className="relative">
                <User size={18} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant/60" />
                <input 
                  type="text" 
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="مثال: أحمد صبري"
                  className="w-full pr-10 pl-4 py-3 bg-surface/80 border border-outline-variant/50 rounded-2xl text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
            </div>

            {/* Username Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-on-surface-variant block">
                اسم المستخدم
              </label>
              <div className="relative">
                <AtSign size={18} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant/60" />
                <input 
                  type="text" 
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="username"
                  className="w-full pr-10 pl-4 py-3 bg-surface/80 border border-outline-variant/50 rounded-2xl text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  dir="ltr"
                />
              </div>
            </div>

            {/* Email Input */}
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

            {/* Password Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-on-surface-variant block">
                كلمة المرور
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

            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-3.5 bg-primary text-on-primary font-bold text-sm rounded-2xl hover:bg-primary-hover disabled:opacity-60 transition-all flex items-center justify-center gap-2 shadow-glow cursor-pointer mt-3"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>جاري إنشاء الحساب...</span>
                </>
              ) : (
                <>
                  <UserPlus size={18} />
                  <span>إنشاء الحساب</span>
                </>
              )}
            </button>
          </form>

          {/* Footer Link */}
          <div className="pt-4 border-t border-outline-variant/30 text-center text-xs text-on-surface-variant">
            لديك حساب بالفعل؟{' '}
            <Link to="/login" className="text-primary font-bold hover:underline">
              تسجيل الدخول
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}