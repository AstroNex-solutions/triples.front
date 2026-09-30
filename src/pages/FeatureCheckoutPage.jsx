import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CreditCard, CheckCircle2, AlertCircle, ShieldCheck, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import API from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function FeatureCheckoutPage() {
  const { t } = useTranslation();
  const { courseId, featureType } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  // Mapping feature types to readable text and icons
  const featureConfig = {
    flashcards: { title: t('featureCheckoutPage.flashcards', 'البطاقات التعليمية'), icon: '🧠', priceField: 'flashcard_price' },
    qbank: { title: t('featureCheckoutPage.qbank', 'بنك الأسئلة'), icon: '📝', priceField: 'qbank_price' },
    selfAssessment: { title: t('featureCheckoutPage.selfAssessment', 'التقييم الذاتي'), icon: '✅', priceField: 'self_assessment_price' }
  };

  const feature = featureConfig[featureType];

  useEffect(() => {
    if (!feature) {
      setError(t('featureCheckoutPage.invalidFeature', 'نوع الميزة غير صالح'));
      setLoading(false);
      return;
    }

    const fetchCourse = async () => {
      try {
        const res = await API.get(`/courses/${courseId}`);
        setCourse(res.data.course);
      } catch (err) {
        setError(err.response?.data?.message || t('featureCheckoutPage.fetchCourseError', 'حدث خطأ أثناء جلب تفاصيل الدورة'));
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [courseId, featureType]);

  const handlePayment = async () => {
    setProcessing(true);
    setError('');
    try {
      // Direct API call to purchase feature
      const res = await API.post('/store/purchase-feature', {
        course_id: courseId,
        feature_type: featureType
      });
      // In a real app, this would redirect to payment gateway (Stripe/PayPal)
      // Since they might not be configured, we just simulate a successful purchase
      // Or if there is a payment gateway, the backend would return a URL
      if (res.data.payment_url) {
        window.location.href = res.data.payment_url;
      } else {
        // Fallback or test mode
        navigate('/payment-result?status=success');
      }
    } catch (err) {
      setError(err.response?.data?.message || t('featureCheckoutPage.paymentFailed', 'فشل الدفع. يرجى المحاولة مرة أخرى.'));
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <span className="font-bold text-on-surface-variant animate-pulse">{t('featureCheckoutPage.loadingCheckout', 'جاري تحميل تفاصيل الدفع...')}</span>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <AlertCircle size={48} className="text-error mb-4" />
        <h2 className="text-xl font-bold text-on-surface mb-2">{t('featureCheckoutPage.checkoutError', 'خطأ في الدفع')}</h2>
        <p className="text-sm text-on-surface-variant mb-6">{error}</p>
        <button onClick={() => navigate(-1)} className="px-6 py-2 bg-primary text-white rounded-xl font-bold">
          {t('featureCheckoutPage.goBack', 'العودة')}
        </button>
      </div>
    );
  }

  const price = Number(course[feature.priceField]) || 0;

  return (
    <div 
      className="min-h-screen flex flex-col relative"
      style={{
        backgroundColor: '#f8fafc' // crisp white-ish background
      }}
    >
      {/* Background Watermark */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none opacity-[0.15]"
        style={{
          backgroundImage: 'url(/assets/medical_watermark.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed'
        }}
      />

      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />

        <main className="flex-1 w-full px-4 py-16 flex flex-col items-center justify-center">
          <div className="w-full max-w-2xl bg-white/95 backdrop-blur-md border border-outline-variant/20 rounded-[2rem] p-8 md:p-12 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] shadow-primary/5">
            
            {/* Header */}
            <div className="flex flex-col items-center justify-center text-center mb-10">
              <div className="w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 text-slate-700 rounded-2xl flex items-center justify-center mb-4 shadow-inner border border-slate-200">
                <ShieldCheck size={36} strokeWidth={1.5} />
              </div>
              <h1 className="text-3xl font-black text-on-surface mb-2" dir="auto">{t('featureCheckoutPage.secureCheckout', 'دفع آمن')}</h1>
              <p className="text-sm font-medium text-on-surface-variant max-w-xs mx-auto" dir="auto">
                {t('featureCheckoutPage.unlockFeature', 'فتح {{feature}} لدورة {{course}}', { feature: feature.title, course: course.title })}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
              {/* Order Summary */}
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-on-surface pb-2 border-b border-outline-variant/30" dir="auto">
                  {t('featureCheckoutPage.orderSummary', 'ملخص الطلب')}
                </h3>
                
                <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl flex items-center justify-between gap-4 transition-all hover:border-primary/20 hover:bg-slate-50/80 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center text-xl shrink-0">
                      {feature.icon}
                    </div>
                    <div dir="auto">
                      <h4 className="font-bold text-on-surface text-sm line-clamp-1">{course.title}</h4>
                      <p className="text-xs text-on-surface-variant mt-0.5">{feature.title}</p>
                    </div>
                  </div>
                  <span className="font-black text-primary" dir="ltr">${price.toFixed(2)}</span>
                </div>

                <div className="space-y-4 pt-2">
                  <div className="flex justify-between text-sm text-on-surface-variant font-medium" dir="auto">
                    <span>{t('featureCheckoutPage.subtotal', 'المجموع الفرعي')}</span>
                    <span className="text-on-surface" dir="ltr">${price.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-on-surface-variant font-medium" dir="auto">
                    <span>{t('featureCheckoutPage.tax', 'الضريبة')}</span>
                    <span className="text-on-surface" dir="ltr">$0.00</span>
                  </div>
                  <div className="flex justify-between text-lg font-black text-on-surface pt-4 border-t border-outline-variant/30" dir="auto">
                    <span>{t('featureCheckoutPage.total', 'الإجمالي')}</span>
                    <span className="text-primary text-xl" dir="ltr">${price.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Payment Section */}
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-on-surface pb-2 border-b border-outline-variant/30" dir="auto">
                  {t('featureCheckoutPage.paymentDetails', 'تفاصيل الدفع')}
                </h3>
                
                <div className="space-y-4">
                  {/* Mock Payment Selection - Active State */}
                  <div className="border-[1.5px] border-primary bg-primary/[0.03] p-4 rounded-2xl flex flex-col gap-3 relative shadow-sm">
                    <div className="flex justify-between items-center w-full">
                      <div className="flex items-center gap-2">
                        {/* Fake Visa/MC/Mada Icons for Visuals */}
                        <div className="flex gap-1">
                          <div className="w-8 h-5 bg-white rounded shadow-sm border border-slate-200 flex items-center justify-center text-[8px] font-black italic text-blue-900">VISA</div>
                          <div className="w-8 h-5 bg-white rounded shadow-sm border border-slate-200 flex items-center justify-center relative overflow-hidden">
                            <div className="w-3 h-3 bg-red-500 rounded-full mix-blend-multiply opacity-90 relative -right-1"></div>
                            <div className="w-3 h-3 bg-yellow-500 rounded-full mix-blend-multiply opacity-90 relative -left-1"></div>
                          </div>
                        </div>
                      </div>
                      <CheckCircle2 className="text-primary" size={20} strokeWidth={2.5} />
                    </div>
                    <span className="font-bold text-primary text-sm" dir="auto">{t('featureCheckoutPage.creditCard', 'بطاقة ائتمان / خصم')}</span>
                  </div>
                </div>

                {error && (
                  <div className="p-3 bg-error/10 text-error rounded-xl text-xs font-bold flex items-start gap-2">
                    <AlertCircle size={16} className="shrink-0 mt-0.5" />
                    {error}
                  </div>
                )}

                <div className="pt-2">
                  <button
                    onClick={handlePayment}
                    disabled={processing || price <= 0}
                    className="w-full h-14 bg-gradient-to-r from-primary to-[#4a154b] hover:to-primary hover:from-[#4a154b] text-white rounded-2xl font-black text-base flex items-center justify-center gap-2 shadow-lg shadow-primary/30 transition-all duration-300 active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100"
                  >
                    {processing ? (
                      <span className="animate-pulse">{t('featureCheckoutPage.processing', 'جاري المعالجة...')}</span>
                    ) : (
                      <div className="flex items-center gap-2" dir="auto">
                        {t('featureCheckoutPage.payAmount', 'دفع')} <span dir="ltr">${price.toFixed(2)}</span>
                        <ShieldCheck size={18} className="ml-1 opacity-80" />
                      </div>
                    )}
                  </button>
                  <p className="text-[10px] text-center text-on-surface-variant font-medium mt-4 flex items-center justify-center gap-1.5" dir="auto">
                    <ShieldCheck size={12} className="text-slate-400" />
                    {t('featureCheckoutPage.secureCheckoutDesc', 'عملية دفع آمنة ومضمونة بتشفير AES-256.')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
}
