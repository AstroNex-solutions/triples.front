import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({ toast, onClose }) {
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        onClose();
      }, 4000); // إغلاق تلقائي بعد 4 ثوانٍ
      return () => clearTimeout(timer);
    }
  }, [toast, onClose]);

  if (!toast) return null;

  const isSuccess = toast.type === 'success';
  const isError = toast.type === 'error';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        className="fixed top-24 left-1/2 -translate-x-1/2 z-[9999] w-[90%] max-w-md pointer-events-auto"
        dir="rtl"
      >
        <div
          className={`relative overflow-hidden rounded-2xl p-4 backdrop-blur-xl border shadow-2xl flex items-center justify-between gap-3 ${
            isSuccess
              ? 'bg-slate-900/90 border-emerald-500/40 text-emerald-400 shadow-emerald-500/10'
              : isError
              ? 'bg-slate-900/90 border-rose-500/40 text-rose-400 shadow-rose-500/10'
              : 'bg-slate-900/90 border-primary/40 text-primary shadow-primary/10'
          }`}
        >
          {/* Subtle Glow Background */}
          <div
            className={`absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl opacity-20 pointer-events-none ${
              isSuccess ? 'bg-emerald-500' : isError ? 'bg-rose-500' : 'bg-primary'
            }`}
          />

          <div className="flex items-center gap-3 relative z-10">
            <div
              className={`p-2 rounded-xl shrink-0 ${
                isSuccess
                  ? 'bg-emerald-500/15 text-emerald-400'
                  : isError
                  ? 'bg-rose-500/15 text-rose-400'
                  : 'bg-primary/15 text-primary'
              }`}
            >
              {isSuccess && <CheckCircle2 size={22} />}
              {isError && <AlertCircle size={22} />}
              {!isSuccess && !isError && <Info size={22} />}
            </div>

            <div className="space-y-0.5">
              <h4 className="text-xs font-extrabold text-white">
                {isSuccess ? 'نجحت العملية' : isError ? 'تنبيه' : 'إشعار'}
              </h4>
              <p className="text-xs font-medium text-slate-300 leading-relaxed">
                {toast.message}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors relative z-10 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}