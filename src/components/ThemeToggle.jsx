import React from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useThemeStore } from '../store/themeStore';
import { useTranslation } from 'react-i18next';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useThemeStore();
  const { t } = useTranslation();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      className="relative flex items-center justify-center p-2.5 rounded-2xl bg-surface border border-outline-variant/40 text-on-surface-variant hover:text-primary hover:bg-surface-container-high transition-all duration-200 cursor-pointer shadow-sm group"
      title={isDark ? t('theme.switchToLight', 'الوضع النهارى / Light Mode') : t('theme.switchToDark', 'الوضع الليلي / Dark Mode')}
      aria-label="Toggle Theme"
    >
      <motion.div
        key={theme}
        initial={{ rotate: -90, scale: 0 }}
        animate={{ rotate: 0, scale: 1 }}
        exit={{ rotate: 90, scale: 0 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="flex items-center justify-center text-amber-500 dark:text-purple-400"
      >
        {isDark ? (
          <Moon size={20} className="fill-purple-400/20" />
        ) : (
          <Sun size={20} className="fill-amber-500/20" />
        )}
      </motion.div>
    </button>
  );
}
