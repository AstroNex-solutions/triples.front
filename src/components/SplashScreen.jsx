import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Stethoscope } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function SplashScreen({ onFinish }) {
  const { t } = useTranslation();
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    // محاكاة التقدم بدقة وانسيابية
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + Math.floor(Math.random() * 12) + 6;
      });
    }, 150);

    // إنهاء الشاشة الترحيبية بانسيابية
    const timeout = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => {
        if (onFinish) onFinish();
      }, 700);
    }, 3000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [onFinish]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ 
            opacity: 0, 
            scale: 1.03, 
            filter: "blur(8px)",
            transition: { duration: 0.7, ease: [0.4, 0, 0.2, 1] } 
          }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background text-on-background font-sans overflow-hidden select-none"
        >
          {/* 1. خلفية زجاجية معتمدة على توهج الألوان الخاصة بك (Primary & Secondary Glow) */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* توهج اللون الرئيسي Primary */}
            <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-primary/15 rounded-full blur-[120px] animate-pulse" />
            
            {/* توهج اللون الثانوي Secondary */}
            <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-secondary/15 rounded-full blur-[120px]" />
            
            {/* توهج عميق في المنتصف */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-primary-container/40 rounded-full blur-[100px]" />

            {/* شبكة هندسية ناعمة */}
            <div 
              className="absolute inset-0 opacity-[0.04]"
              style={{
                backgroundImage: `radial-gradient(circle at 1px 1px, #0f172a 1px, transparent 0)`,
                backgroundSize: '24px 24px'
              }}
            />
          </div>

          <div className="relative z-10 flex flex-col items-center text-center px-sm max-w-md mx-auto">
            
            {/* 2. أنيميشن اللوجو وتأثيرات التوهج المعتمدة */}
            <motion.div
              initial={{ scale: 0.75, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="mb-md relative"
            >
              {/* حلقات النبض المضيئة */}
              <motion.div 
                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.1, 0.3] }}
                transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                className="absolute -inset-3 bg-gradient-to-tr from-primary/30 to-secondary/30 rounded-3xl blur-xl"
              />
              
              <div className="relative w-28 h-28 md:w-36 md:h-36 flex items-center justify-center p-xs rounded-3xl bg-surface border border-outline-variant shadow-soft backdrop-blur-xl">
                {!imgError ? (
                  <img 
                    src="/logo.png" 
                    alt="Triple S Academy Logo" 
                    className="w-full h-full object-contain drop-shadow-md"
                    onError={() => setImgError(true)}
                  />
                ) : (
                  <div className="w-full h-full rounded-2xl bg-gradient-to-tr from-primary to-secondary text-on-primary font-black text-headline-lg flex items-center justify-center shadow-glow">
                    SSS
                  </div>
                )}
              </div>
            </motion.div>

            {/* 3. النصوص والعناوين بالتسلسل البصري الخاص بك */}
            <div className="space-y-xs mb-lg">
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-container text-on-secondary-container text-label-sm font-semibold mb-xs shadow-sm"
              >
                <Stethoscope size={14} className="text-secondary" />
                <span>{t('splash.subtitle')}</span>
                <Sparkles size={13} className="text-tertiary" />
              </motion.div>

              <motion.h1 
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45, duration: 0.6 }}
                className="text-headline-lg md:text-display-lg font-black text-on-surface tracking-tight"
              >
                Triple S Academy
              </motion.h1>
              
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
                className="flex items-center justify-center gap-xs flex-wrap text-body-md font-semibold text-on-surface-variant"
              >
                <span>{t('splash.location_prefix')}</span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-surface-container-high rounded-full border border-outline-variant text-on-surface text-label-md shadow-sm">
                  <img src="/jo.png" alt="JO" className="h-4 w-auto object-contain" />
                  <span>{t('splash.jordan')}</span>
                </span>
              </motion.div>
              
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.75, duration: 0.6 }}
                className="text-label-md text-on-surface-variant font-medium max-w-xs mx-auto leading-relaxed mt-xs"
              >
                {t('splash.description')}
              </motion.p>
            </div>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}