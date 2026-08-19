const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'pages', 'CourseDetailPage.jsx');
let content = fs.readFileSync(filePath, 'utf8');

const replacements = [
  { from: /`موديول \$\{idx \+ 1\}`/g, to: "`\\${t('courseDetails.module', 'موديول')} \\${idx + 1}`" },
  { from: /'قسم فرعي'/g, to: "t('courseDetails.subModule', 'قسم فرعي')" },
  { from: /دروس\)/g, to: " ${t('courseDetails.lessons', 'دروس')})" }, // it's inside `• (${module.lessons?.length || 0} دروس)` -> `• (${...} ${t(...)})`
  { from: /معاينة مجانية/g, to: "{t('courseDetails.freePreview', 'معاينة مجانية')}" },
  { from: /<span>مشاهدة<\/span>/g, to: "<span>{t('courseDetails.watch', 'مشاهدة')}</span>" },
  { from: /<span>مغلق<\/span>/g, to: "<span>{t('courseDetails.locked', 'مغلق')}</span>" },
  
  { from: /'تمت إضافة الدورة بنجاح إلى سلة الشراء!'/g, to: "t('courseDetails.addedToCart', 'تمت إضافة الدورة بنجاح إلى سلة الشراء!')" },
  { from: /'حدث خطأ أثناء الإضافة للسلة'/g, to: "t('courseDetails.addCartError', 'حدث خطأ أثناء الإضافة للسلة')" },
  { from: /'تم نسخ رابط الدورة إلى الحافظة!'/g, to: "t('courseDetails.linkCopied', 'تم نسخ رابط الدورة إلى الحافظة!')" },
  
  { from: /عذراً، الدورة التدريبية غير موجودة/g, to: "{t('courseDetails.courseNotFound', 'عذراً، الدورة التدريبية غير موجودة')}" },
  { from: /ربما تم تغيير الرابط أو حذف الدورة من النظام\./g, to: "{t('courseDetails.courseNotFoundMsg', 'ربما تم تغيير الرابط أو حذف الدورة من النظام.')}" },
  { from: /<span>العودة لجميع الدورات<\/span>/g, to: "<span>{t('courseDetails.backToCourses', 'العودة لجميع الدورات')}</span>" },
  
  { from: /'برمجة وتطوير'/g, to: "t('courseDetails.devCategory', 'برمجة وتطوير')" },
  { from: /<span>دورة معتمدة<\/span>/g, to: "<span>{t('courseDetails.certifiedCourse', 'دورة معتمدة')}</span>" },
  { from: /title="مشاركة الدورة"/g, to: "title={t('courseDetails.shareCourse', 'مشاركة الدورة')}" },
  { from: /تقييم\)/g, to: " ${t('courseDetails.rating', 'تقييم')})" },
  { from: /طالب مسجل<\/span>/g, to: " ${t('courseDetails.enrolledStudents', 'طالب مسجل')}</span>" },
  { from: /'مدة غير محددة'/g, to: "t('courseDetails.durationNotSet', 'مدة غير محددة')" },
  
  { from: /شهادة معتمدة/g, to: "{t('courseDetails.certifiedInstructor', 'شهادة معتمدة')}" },
  { from: /المحاضر والمعد/g, to: "{t('courseDetails.instructorTitle', 'المحاضر والمعد')}" },
  
  { from: /title="مشاهدة المعاينة المجانية"/g, to: "title={t('courseDetails.watchPreview', 'مشاهدة المعاينة المجانية')}" },
  { from: /<span>مشاهدة المعاينة المجانية<\/span>/g, to: "<span>{t('courseDetails.watchPreview', 'مشاهدة المعاينة المجانية')}</span>" },
  
  { from: /<span>نظرة عامة عن الدورة<\/span>/g, to: "<span>{t('courseDetails.overviewTitle', 'نظرة عامة عن الدورة')}</span>" },
  { from: /'تمنحك هذه الدورة معرفة شاملة وتطبيقات عملية ومبسطة للوصول للإتقان والأداء الأكاديمي والمهني المتميز\.'/g, to: "t('courseDetails.defaultDesc', 'تمنحك هذه الدورة معرفة شاملة وتطبيقات عملية ومبسطة للوصول للإتقان والأداء الأكاديمي والمهني المتميز.')" },
  
  { from: /<span>منهاج وموديولات الدورة<\/span>/g, to: "<span>{t('courseDetails.curriculumTitle', 'منهاج وموديولات الدورة')}</span>" },
  
  { from: /'طي الكل'/g, to: "t('courseDetails.collapseAll', 'طي الكل')" },
  { from: /'توسيع الكل'/g, to: "t('courseDetails.expandAll', 'توسيع الكل')" },
  
  { from: /سعر الاشتراك بالدورة:/g, to: "{t('courseDetails.subscriptionPrice', 'سعر الاشتراك بالدورة:')}" },
  { from: /<span>متابعة التعلم<\/span>/g, to: "<span>{t('courseDetails.resumeLearning', 'متابعة التعلم')}</span>" },
  { from: /<span>إضافة الدورة للسلة الآن<\/span>/g, to: "<span>{t('courseDetails.addToCartNow', 'إضافة الدورة للسلة الآن')}</span>" },
  
  { from: /تشتمل هذه الدورة على:/g, to: "{t('courseDetails.includesTitle', 'تشتمل هذه الدورة على:')}" },
  { from: /<span>وصول كامل ومستمر مدى الحياة<\/span>/g, to: "<span>{t('courseDetails.includeLifeTime', 'وصول كامل ومستمر مدى الحياة')}</span>" },
  { from: /<span>شرح تفاعلي وبنك أسئلة متكامل<\/span>/g, to: "<span>{t('courseDetails.includeInteractive', 'شرح تفاعلي وبنك أسئلة متكامل')}</span>" },
  { from: /<span>شهادة إتمام معتمدة فور الانتهاء<\/span>/g, to: "<span>{t('courseDetails.includeCert', 'شهادة إتمام معتمدة فور الانتهاء')}</span>" },
  { from: /<span>مشاهدة من الهاتف أو الحاسوب<\/span>/g, to: "<span>{t('courseDetails.includeDevices', 'مشاهدة من الهاتف أو الحاسوب')}</span>" },
  { from: /<span>ضمان استعادة الأموال وسداد آمن 100%<\/span>/g, to: "<span>{t('courseDetails.moneyBack', 'ضمان استعادة الأموال وسداد آمن 100%')}</span>" },
  
  { from: /<span>آراء وتقييمات الطلاب<\/span>/g, to: "<span>{t('courseDetails.reviewsTitle', 'آراء وتقييمات الطلاب')}</span>" }
];

replacements.forEach(({ from, to }) => {
  content = content.replace(from, to);
});

// For complex dynamic strings like:
// `يتضمن ${course.modules?.length || 0} موديولات • ${totalLessons} درس فيديو`
content = content.replace(
  /يتضمن \$\{course\.modules\?\.length \|\| 0\} موديولات • \$\{totalLessons\} درس فيديو/g,
  "{t('courseDetails.curriculumStats', 'يتضمن {{modulesCount}} موديولات • {{lessonsCount}} درس فيديو', { modulesCount: course.modules?.length || 0, lessonsCount: totalLessons })}"
);

// `${Math.floor(course.total_duration / 60)} ساعة و ${course.total_duration % 60} دقيقة`
content = content.replace(
  /`\$\{Math\.floor\(course\.total_duration \/ 60\)\} ساعة و \$\{course\.total_duration % 60\} دقيقة`/g,
  "t('courseDetails.hoursAndMins', '{{hours}} ساعة و {{mins}} دقيقة', { hours: Math.floor(course.total_duration / 60), mins: course.total_duration % 60 })"
);

// Add dir={i18n.language === 'ar' ? 'rtl' : 'ltr'} to elements with dir="rtl"
content = content.replace(/dir="rtl"/g, 'dir={i18n.language === \'ar\' ? \'rtl\' : \'ltr\'}');

fs.writeFileSync(filePath, content, 'utf8');
console.log('CourseDetailPage translations updated.');
