import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

export default function LanguageSwitcher() {
  const { i18n, t } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'ar' ? 'en' : 'ar';
    i18n.changeLanguage(newLang);
  };

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface border border-outline-variant/40 text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
      title="تغيير اللغة / Change Language"
    >
      <Globe size={18} />
      <span className="text-xs font-bold">{t('language.switch')}</span>
    </button>
  );
}
