import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { CartContext } from '../context/CartContext';
import { 
  ShoppingCart, 
  Trash2, 
  Tag, 
  CheckCircle2, 
  ArrowLeft, 
  ShieldCheck, 
  CreditCard,
  AlertCircle,
  Sparkles,
  Loader2
} from 'lucide-react';

export default function CartPage() {
  const { cart, fetchCart } = useContext(CartContext);
  const [couponCode, setCouponCode] = useState('');
  const [couponStatus, setCouponStatus] = useState({ loading: false, success: null, message: '' });
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [removingId, setRemovingId] = useState(null);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'))
  useEffect(() => {
    fetchCart();
  }, []);

  // تطبيق الكوبون
  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    setCouponStatus({ loading: true, success: null, message: '' });
    try {
      const res = await API.post('/store/coupon', { code: couponCode });
      setCouponStatus({
        loading: false,
        success: true,
        message: res.data.message || 'تم تطبيق خصم الكوبون بنجاح!'
      });
      fetchCart();
    } catch (err) {
      setCouponStatus({
        loading: false,
        success: false,
        message: err.response?.data?.message || 'كوبون الخصم غير صالح أو منتهي الصلاحية'
      });
    }
  };

  // إزالة عنصر من السلة
  const handleRemoveItem = async (itemId) => {
    setRemovingId(itemId);
    try {
      await API.delete(`/store/cart/item/${itemId}`);
      fetchCart();
    } catch (err) {
      console.error('Error removing item:', err);
    } finally {
      setRemovingId(null);
    }
  };

  // إتمام عملية الشراء
  const handleCheckout = async () => {
    setCheckoutLoading(true);
    try {
      const res = await API.post('/store/checkout', {
        payment_method: 'credit_card',
        billing_name: user.name,
        billing_email:  user.email
      });
      fetchCart();
      navigate('/dashboard', { state: { checkoutSuccess: true, message: res.data.message } });
    } catch (err) {
      alert(err.response?.data?.message || 'حدث خطأ في عملية الشراء، يرجى المحاولة لاحقاً');
    } finally {
      setCheckoutLoading(false);
    }
  };

  const items = cart?.cart?.items || [];
  const isEmpty = !cart || !cart.cart || items.length === 0;

  if (isEmpty) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-12" dir="rtl">
        <div className="max-w-md w-full rounded-3xl bg-surface-container-low/60 border border-outline-variant/40 p-8 sm:p-10 text-center backdrop-blur-xl shadow-lg space-y-5">
          <div className="w-20 h-20 rounded-3xl bg-primary/10 text-primary mx-auto flex items-center justify-center">
            <ShoppingCart size={40} />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold text-on-surface">سلة التسوق فارغة حالياً</h2>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              لم تقم بإضافة أي دورات تدريبية بعد. استكشف دليل الدورات واختر ما يساعدك في رحلتك التعليمية.
            </p>
          </div>
          <button 
            onClick={() => navigate('/courses')} 
            className="w-full py-3.5 px-6 bg-primary text-on-primary font-bold text-sm rounded-2xl hover:bg-primary-hover transition-all flex items-center justify-center gap-2 shadow-glow cursor-pointer"
          >
            <span>تصفح الدورات المتاحة</span>
            <ArrowLeft size={16} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 pt-6 px-4 sm:px-6 lg:px-12 max-w-container-max mx-auto space-y-8 " dir="rtl">
      
      {/* 1. Header Title */}
      <div className="relative rounded-3xl bg-surface-container-low/70 border border-outline-variant/40 p-6 sm:p-8 backdrop-blur-xl shadow-sm flex items-center justify-between">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold border border-primary/20">
            <ShoppingCart size={14} />
            <span>سلة الشراء</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-on-surface">
            الدورات المحددة ({items.length})
          </h1>
        </div>
      </div>

      {/* 2. Cart Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Side: Items List */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => {
            const course = item.course || {};
            const price = course.discount_price || course.price || 0;
            const originalPrice = course.discount_price ? course.price : null;

            return (
              <div 
                key={item.id} 
                className="group rounded-3xl bg-surface-container-low/60 hover:bg-surface-container-low border border-outline-variant/40 p-4 sm:p-5 backdrop-blur-md transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                {/* Course Details */}
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <img 
                    src={course.image || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=300'} 
                    alt={course.title} 
                    className="w-24 h-20 sm:w-28 sm:h-20 object-cover rounded-2xl border border-outline-variant/30 shrink-0"
                  />
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded-md border border-primary/20">
                      {course.category?.name || 'دورة تدريبية'}
                    </span>
                    <h3 className="text-base font-bold text-on-surface line-clamp-1 group-hover:text-primary transition-colors">
                      {course.title}
                    </h3>
                    <p className="text-xs text-on-surface-variant/70">
                      وصول كامل لجميع المحاضرات والمواد العلمية
                    </p>
                  </div>
                </div>

                {/* Price & Action */}
                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-outline-variant/30">
                  <div className="text-right sm:text-left">
                    <div className="text-lg font-extrabold text-on-surface">
                      ${price}
                    </div>
                    {originalPrice && (
                      <div className="text-xs text-on-surface-variant/60 line-through">
                        ${originalPrice}
                      </div>
                    )}
                  </div>

                  <button 
                    onClick={() => handleRemoveItem(item.id)}
                    disabled={removingId === item.id}
                    className="p-2.5 rounded-xl text-on-surface-variant hover:text-error hover:bg-error/10 border border-transparent hover:border-error/20 transition-all cursor-pointer"
                    title="حذف من السلة"
                  >
                    {removingId === item.id ? (
                      <Loader2 size={18} className="animate-spin text-error" />
                    ) : (
                      <Trash2 size={18} />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Side: Order Summary */}
        <div className="rounded-3xl bg-surface-container-low/70 border border-outline-variant/40 p-6 backdrop-blur-xl space-y-6 sticky top-24">
          <h2 className="text-lg font-extrabold text-on-surface flex items-center gap-2">
            <CreditCard size={20} className="text-primary" />
            <span>ملخص الطلب</span>
          </h2>

          {/* Coupon Input Form */}
          <form onSubmit={handleApplyCoupon} className="space-y-2">
            <label className="text-xs font-bold text-on-surface-variant">هل لديك كوبون خصم؟</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Tag size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant/60" />
                <input 
                  type="text" 
                  placeholder="رمز الكوبون"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="w-full pr-10 pl-3 py-2.5 bg-surface/80 border border-outline-variant/50 rounded-xl text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all uppercase"
                />
              </div>
              <button 
                type="submit" 
                disabled={couponStatus.loading || !couponCode.trim()}
                className="px-4 py-2.5 bg-surface-container-high hover:bg-primary hover:text-on-primary text-on-surface font-bold text-xs rounded-xl border border-outline-variant/40 transition-all disabled:opacity-50 cursor-pointer"
              >
                {couponStatus.loading ? <Loader2 size={16} className="animate-spin" /> : 'تطبيق'}
              </button>
            </div>

            {/* Coupon Status Message */}
            {couponStatus.message && (
              <div className={`p-3 rounded-xl text-xs flex items-center gap-2 border ${
                couponStatus.success 
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                  : 'bg-error/10 border-error/30 text-error'
              }`}>
                {couponStatus.success ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
                <span>{couponStatus.message}</span>
              </div>
            )}
          </form>

          {/* Price Calculation Details */}
          <div className="space-y-3 pt-4 border-t border-outline-variant/30 text-sm">
            <div className="flex justify-between text-on-surface-variant">
              <span>المجموع الفرعي</span>
              <span className="font-bold text-on-surface">${cart.subtotal || 0}</span>
            </div>
            
            <div className="flex justify-between text-emerald-400">
              <span>الخصم المستحق</span>
              <span className="font-bold">-${cart.discount || 0}</span>
            </div>

            <div className="pt-3 border-t border-outline-variant/30 flex justify-between items-center">
              <span className="text-base font-extrabold text-on-surface">الإجمالي النهائي</span>
              <span className="text-2xl font-black text-primary">${cart.total || 0}</span>
            </div>
          </div>

          {/* Checkout Button */}
          <button 
            onClick={handleCheckout} 
            disabled={checkoutLoading}
            className="w-full py-4 bg-primary text-on-primary font-bold text-base rounded-2xl hover:bg-primary-hover transition-all flex items-center justify-center gap-2 shadow-glow cursor-pointer disabled:opacity-60"
          >
            {checkoutLoading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                <span>جاري معالجة الطلب...</span>
              </>
            ) : (
              <>
                <ShieldCheck size={20} />
                <span>طلب شراء</span>
              </>
            )}
          </button>

          {/* Security Badge */}
          <p className="text-[11px] text-center text-on-surface-variant/70 flex items-center justify-center gap-1">
            <ShieldCheck size={14} className="text-emerald-400" />
            <span>معاملة آمنة ومشفّرة 100%</span>
          </p>
        </div>

      </div>

    </div>
  );
}