import React, { useContext, useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';
import ThemeToggle from './ThemeToggle';
import {
    ShoppingBag,
    LogOut,
    BookOpen,
    FileText,
    Info,
    User,
    Home
} from 'lucide-react';

export default function Navbar() {
    const { user, logout } = useContext(AuthContext);
    const { cartCount } = useContext(CartContext);
    const { t, i18n } = useTranslation();
    const location = useLocation();
    const [scrolled, setScrolled] = useState(false);
    const [logoError, setLogoError] = useState(false);

    // متابعة التمرير
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const isActive = (path) => {
        if (path.includes('?')) {
            const basePath = path.split('?')[0];
            if (location.pathname !== basePath) return false;
            
            const params = new URLSearchParams(path.split('?')[1]);
            const targetCat = params.get('category');
            
            const currentParams = new URLSearchParams(location.search);
            return currentParams.get('category') === targetCat;
        }
        return location.pathname === path;
    };

    const navLinks = [
        { name: i18n.language === 'ar' ? 'الرئيسية' : 'Home', path: '/', icon: Home },
        { name: i18n.language === 'ar' ? 'الطب البشري' : 'Medicine', path: '/courses?category=Medicine', icon: BookOpen },
        { name: i18n.language === 'ar' ? 'طب الأسنان' : 'Dentistry', path: '/courses?category=Dentistry', icon: BookOpen },
        { name: i18n.language === 'ar' ? 'المدونة' : 'Blog', path: '/articles', icon: FileText },
        { name: i18n.language === 'ar' ? 'من نحن' : 'About us', path: '/about', icon: Info },
    ];

    return (
        <header
            className={`fixed top-0 w-full z-40 transition-all duration-300 flex flex-col ${scrolled
                    ? 'bg-background/90 backdrop-blur-xl shadow-glass border-b border-outline-variant/50'
                    : 'bg-background/70 backdrop-blur-md border-b border-transparent'
                }`}
        >

            {/* 2. الصف الرئيسي (الشعار وأزرار التفاعل) */}
            <div className={`transition-all duration-300 ${scrolled ? 'py-1' : 'py-2'} h-16 sm:h-20 max-w-container-max w-full mx-auto px-4 sm:px-6 lg:px-12 flex items-center justify-between`}>

                {/* اللوجو */}
                <Link to="/" className="flex items-center gap-3 group text-decoration-none shrink-0">
                    <div className="relative flex items-center">
                        {!logoError ? (
                            <img
                                alt="Triple S Academy"
                                className="h-9 sm:h-12 w-auto object-contain transition-transform group-hover:scale-105 duration-300"
                                src="/logo.png"
                                onError={() => setLogoError(true)}
                            />
                        ) : (
                            <div className="flex h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-primary text-white font-black text-lg items-center justify-center shadow-glow">
                                SSS
                            </div>
                        )}
                    </div>
                </Link>

                {/* روابط الديسktop (تظهر في الشاشات الكبيرة فقط) */}
                <nav className="hidden lg:flex items-center gap-1 bg-surface-container-low/70 backdrop-blur-md p-1.5 rounded-full border border-outline-variant/30">
                    {navLinks.map((link) => {
                        const active = isActive(link.path);
                        return (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`relative px-4 py-2 rounded-full text-sm font-label-md transition-colors duration-200 ${active ? 'text-primary font-bold' : 'text-on-surface-variant hover:text-on-surface'
                                    }`}
                            >
                                {active && (
                                    <motion.div
                                        layoutId="activeTabPill"
                                        className="absolute inset-0 bg-surface shadow-sm rounded-full border border-outline-variant/60 -z-10"
                                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                                    />
                                )}
                                <span className="relative z-10">{link.name}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* أزرار الحساب والسلة */}
                <div className="flex items-center gap-2 sm:gap-3">
                    <ThemeToggle />
                    <LanguageSwitcher />
                    <Link
                        to="/cart"
                        className="relative p-2.5 text-on-surface-variant hover:text-primary transition-all duration-200 rounded-2xl hover:bg-surface-container-high border border-transparent hover:border-outline-variant/40"
                        title={t('navbar.cartTitle')}
                    >
                        <ShoppingBag size={20} />
                        {cartCount > 0 && (
                            <motion.span
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="absolute -top-1 -right-1 bg-primary text-on-primary text-[10px] font-extrabold rounded-full w-5 h-5 flex items-center justify-center border-2 border-surface shadow-sm"
                            >
                                {cartCount}
                            </motion.span>
                        )}
                    </Link>

                    {user ? (
                        <div className="flex items-center gap-2">
                            <Link
                                to={user.status === 'Admin' ? '/admin' : (user.status === 'Student' ? '/dashboard' : '/instructor')}
                                className="p-2.5 text-on-surface-variant hover:text-primary transition-all duration-200 rounded-full hover:bg-surface-container-high border border-outline-variant/40"
                                title={t('navbar.dashboard')}
                            >
                                <User size={20} />
                            </Link>
                            <button
                                onClick={logout}
                                className="p-2.5 text-error hover:bg-error-container/30 rounded-full transition-colors"
                                title={t('navbar.logout')}
                            >
                                <LogOut size={18} />
                            </button>
                        </div>
                    ) : (
                        <Link
                            to="/login"
                            className="p-2.5 text-on-surface-variant hover:text-primary transition-all duration-200 rounded-full hover:bg-surface-container-high border border-outline-variant/40"
                            title={t('navbar.loginShort')}
                        >
                            <User size={20} />
                        </Link>
                    )}
                </div>
            </div>

            {/* 3. شريط روابط القائمة الظاهر دائماً للموبايل (Mobile Scrollable Navbar) */}
            <div className="lg:hidden w-full border-t border-outline-variant/30 bg-surface/80 backdrop-blur-md px-2 py-1.5 overflow-x-auto no-scrollbar">
                <div className="flex items-center justify-around min-w-max gap-1">
                    {navLinks.map((link) => {
                        const active = isActive(link.path);
                        const Icon = link.icon;
                        return (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${active
                                        ? 'bg-primary/15 text-primary border border-primary/30'
                                        : 'text-on-surface-variant hover:text-on-surface'
                                    }`}
                            >
                                <Icon size={14} className={active ? 'text-primary' : 'opacity-70'} />
                                <span>{link.name}</span>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </header>
    );
}