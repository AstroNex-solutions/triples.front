const fs = require('fs');
const path = require('path');

const arPath = path.join(__dirname, 'src', 'locales', 'ar', 'translation.json');
const enPath = path.join(__dirname, 'src', 'locales', 'en', 'translation.json');

const arLocales = JSON.parse(fs.readFileSync(arPath, 'utf8'));
const enLocales = JSON.parse(fs.readFileSync(enPath, 'utf8'));

const newTranslations = {
  cart: {
    couponSuccess: 'تم تطبيق خصم الكوبون بنجاح!',
    couponError: 'كوبون الخصم غير صالح أو منتهي الصلاحية',
    checkoutError: 'حدث خطأ في عملية الشراء، يرجى المحاولة لاحقاً',
    emptyTitle: 'سلة التسوق فارغة حالياً',
    emptyMessage: 'لم تقم بإضافة أي دورات تدريبية بعد. استكشف دليل الدورات واختر ما يساعدك في رحلتك التعليمية.',
    browseCourses: 'تصفح الدورات المتاحة',
    cartTitle: 'سلة الشراء',
    selectedCourses: 'الدورات المحددة',
    courseType: 'دورة تدريبية',
    courseAccessInfo: 'وصول كامل لجميع المحاضرات والمواد العلمية',
    removeFromCart: 'حذف من السلة',
    orderSummary: 'ملخص الطلب',
    haveCoupon: 'هل لديك كوبون خصم؟',
    couponPlaceholder: 'رمز الكوبون',
    apply: 'تطبيق',
    subtotal: 'المجموع الفرعي',
    discountAmount: 'الخصم المستحق',
    finalTotal: 'الإجمالي النهائي',
    processingOrder: 'جاري معالجة الطلب...',
    checkoutBtn: 'طلب شراء',
    secureTransaction: 'معاملة آمنة ومشفّرة 100%'
  },
  courseDetails: {
    module: 'موديول',
    subModule: 'قسم فرعي',
    lessons: 'دروس',
    freePreview: 'معاينة مجانية',
    watch: 'مشاهدة',
    locked: 'مغلق',
    addedToCart: 'تمت إضافة الدورة بنجاح إلى سلة الشراء!',
    addCartError: 'حدث خطأ أثناء الإضافة للسلة',
    linkCopied: 'تم نسخ رابط الدورة إلى الحافظة!',
    courseNotFound: 'عذراً، الدورة التدريبية غير موجودة',
    courseNotFoundMsg: 'ربما تم تغيير الرابط أو حذف الدورة من النظام.',
    backToCourses: 'العودة لجميع الدورات',
    devCategory: 'برمجة وتطوير',
    certifiedCourse: 'دورة معتمدة',
    shareCourse: 'مشاركة الدورة',
    rating: 'تقييم',
    enrolledStudents: 'طالب مسجل',
    durationNotSet: 'مدة غير محددة',
    hoursAndMins: '{{hours}} ساعة و {{mins}} دقيقة',
    certifiedInstructor: 'شهادة معتمدة',
    instructorTitle: 'المحاضر والمعد',
    watchPreview: 'مشاهدة المعاينة المجانية',
    overviewTitle: 'نظرة عامة عن الدورة',
    defaultDesc: 'تمنحك هذه الدورة معرفة شاملة وتطبيقات عملية ومبسطة للوصول للإتقان والأداء الأكاديمي والمهني المتميز.',
    curriculumTitle: 'منهاج وموديولات الدورة',
    curriculumStats: 'يتضمن {{modulesCount}} موديولات • {{lessonsCount}} درس فيديو',
    collapseAll: 'طي الكل',
    expandAll: 'توسيع الكل',
    subscriptionPrice: 'سعر الاشتراك بالدورة:',
    resumeLearning: 'متابعة التعلم',
    addToCartNow: 'إضافة الدورة للسلة الآن',
    includesTitle: 'تشتمل هذه الدورة على:',
    includeLifeTime: 'وصول كامل ومستمر مدى الحياة',
    includeInteractive: 'شرح تفاعلي وبنك أسئلة متكامل',
    includeCert: 'شهادة إتمام معتمدة فور الانتهاء',
    includeDevices: 'مشاهدة من الهاتف أو الحاسوب',
    moneyBack: 'ضمان استعادة الأموال وسداد آمن 100%',
    reviewsTitle: 'آراء وتقييمات الطلاب'
  }
};

const newEnTranslations = {
  cart: {
    couponSuccess: 'Coupon applied successfully!',
    couponError: 'Invalid or expired coupon',
    checkoutError: 'Checkout error, please try again later',
    emptyTitle: 'Your cart is currently empty',
    emptyMessage: 'You haven\'t added any courses yet. Explore the course directory and choose what helps your learning journey.',
    browseCourses: 'Browse Available Courses',
    cartTitle: 'Shopping Cart',
    selectedCourses: 'Selected Courses',
    courseType: 'Training Course',
    courseAccessInfo: 'Full access to all lectures and materials',
    removeFromCart: 'Remove from cart',
    orderSummary: 'Order Summary',
    haveCoupon: 'Have a discount coupon?',
    couponPlaceholder: 'Coupon Code',
    apply: 'Apply',
    subtotal: 'Subtotal',
    discountAmount: 'Discount',
    finalTotal: 'Final Total',
    processingOrder: 'Processing order...',
    checkoutBtn: 'Checkout',
    secureTransaction: '100% secure and encrypted transaction'
  },
  courseDetails: {
    module: 'Module',
    subModule: 'Sub-section',
    lessons: 'Lessons',
    freePreview: 'Free Preview',
    watch: 'Watch',
    locked: 'Locked',
    addedToCart: 'Course successfully added to cart!',
    addCartError: 'Error adding to cart',
    linkCopied: 'Course link copied to clipboard!',
    courseNotFound: 'Sorry, course not found',
    courseNotFoundMsg: 'The link might have changed or the course was removed from the system.',
    backToCourses: 'Back to all courses',
    devCategory: 'Programming & Development',
    certifiedCourse: 'Certified Course',
    shareCourse: 'Share Course',
    rating: 'Rating',
    enrolledStudents: 'Enrolled Students',
    durationNotSet: 'Duration not set',
    hoursAndMins: '{{hours}}h and {{mins}}m',
    certifiedInstructor: 'Certified Certificate',
    instructorTitle: 'Instructor & Creator',
    watchPreview: 'Watch Free Preview',
    overviewTitle: 'Course Overview',
    defaultDesc: 'This course gives you comprehensive knowledge and simplified practical applications to achieve mastery and outstanding academic and professional performance.',
    curriculumTitle: 'Curriculum & Modules',
    curriculumStats: 'Includes {{modulesCount}} modules • {{lessonsCount}} video lessons',
    collapseAll: 'Collapse All',
    expandAll: 'Expand All',
    subscriptionPrice: 'Course Subscription Price:',
    resumeLearning: 'Resume Learning',
    addToCartNow: 'Add to Cart Now',
    includesTitle: 'This course includes:',
    includeLifeTime: 'Full and continuous lifetime access',
    includeInteractive: 'Interactive explanations and integrated question bank',
    includeCert: 'Certified completion certificate upon finish',
    includeDevices: 'Watch from mobile or computer',
    moneyBack: 'Money-back guarantee & 100% secure payment',
    reviewsTitle: 'Student Reviews & Ratings'
  }
};

arLocales.cart = newTranslations.cart;
arLocales.courseDetails = newTranslations.courseDetails;
enLocales.cart = newEnTranslations.cart;
enLocales.courseDetails = newEnTranslations.courseDetails;

fs.writeFileSync(arPath, JSON.stringify(arLocales, null, 2), 'utf8');
fs.writeFileSync(enPath, JSON.stringify(enLocales, null, 2), 'utf8');

console.log('Locales updated successfully');
