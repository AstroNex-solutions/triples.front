import React, { useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { CheckCircle, XCircle, ArrowRight, BookOpen } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function PaymentResultPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const status = searchParams.get('status') || searchParams.get('payment'); // support both

  useEffect(() => {
    if (status === 'success') {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [status]);

  if (!status) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <p>جاري التحميل...</p>
      </div>
    );
  }

  const isSuccess = status === 'success';

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-12" dir="rtl">
      <div className="max-w-md w-full rounded-3xl bg-surface-container-low/60 border border-outline-variant/40 p-8 sm:p-10 text-center backdrop-blur-xl shadow-lg space-y-6">
        
        {/* Icon */}
        <div className={`w-24 h-24 rounded-full mx-auto flex items-center justify-center ${isSuccess ? 'bg-emerald-500/10 text-emerald-500' : 'bg-error/10 text-error'}`}>
          {isSuccess ? <CheckCircle size={50} /> : <XCircle size={50} />}
        </div>
        
        {/* Texts */}
        <div className="space-y-3">
          <h1 className={`text-3xl font-black ${isSuccess ? 'text-emerald-500' : 'text-error'}`}>
            {isSuccess ? 'عملية دفع ناجحة!' : 'فشلت عملية الدفع'}
          </h1>
          <p className="text-on-surface-variant text-sm leading-relaxed">
            {isSuccess 
              ? 'تم استلام الدفعة بنجاح وتأكيد طلبك. لقد تمت إضافة الكورسات إلى حسابك ويمكنك البدء في التعلم فوراً.'
              : 'عذراً، لم نتمكن من إتمام عملية الدفع. قد يكون هناك مشكلة في البطاقة أو تم رفض العملية من البنك.'}
          </p>
        </div>

        {/* Actions */}
        <div className="pt-6 flex flex-col gap-3">
          {isSuccess ? (
            <Link 
              to="/dashboard"
              className="w-full py-4 px-6 bg-primary text-on-primary font-bold text-base rounded-2xl hover:bg-primary-hover transition-all flex items-center justify-center gap-2 shadow-glow"
            >
              <BookOpen size={20} />
              <span>الذهاب إلى دوراتي</span>
            </Link>
          ) : (
            <Link 
              to="/cart"
              className="w-full py-4 px-6 bg-primary text-on-primary font-bold text-base rounded-2xl hover:bg-primary-hover transition-all flex items-center justify-center gap-2 shadow-glow"
            >
              <span>العودة للسلة والمحاولة مجدداً</span>
              <ArrowRight size={20} />
            </Link>
          )}
          
          <Link 
            to="/" 
            className="w-full py-3 px-6 bg-surface text-on-surface hover:bg-surface-container font-bold text-sm rounded-2xl border border-outline-variant/50 transition-all flex items-center justify-center"
          >
            العودة للرئيسية
          </Link>
        </div>

      </div>
    </div>
  );
}
