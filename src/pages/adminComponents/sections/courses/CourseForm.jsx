import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import API from '../../../../api/axios';
import { 
  Upload, ArrowRight, ArrowLeft, Plus, Trash2, Loader2, Edit, ClipboardList,
  Sparkles, Layers, HelpCircle, CreditCard, Zap, Database, Award, Star,
  MessageSquare, CheckCircle2, Image as ImageIcon, ChevronDown, ChevronUp,
  Save, FileText, Check, AlertCircle, Eye, ShieldCheck, Tag, BarChart3,
  Sliders, RefreshCw, X
} from 'lucide-react';
import { Card, Input, Select, Textarea, SubmitBtn, Badge, Modal } from '../../ui/SharedUI';
import FlashcardsManager from '../../ui/FlashcardsManager';
import QuestionsManager from '../../ui/QuestionsManager';
import { getFileUrl } from '../../../../utils/fileHelper';

/* =========================================================================
   1. Modern Animated Layout Picker
   ========================================================================= */
const LayoutPicker = ({ value, onChange, t }) => {
  const layouts = [
    { 
      id: '1_image', 
      label: t('adminCourseForm.layoutPicker.oneImage') || 'صورة واحدة', 
      desc: 'صورة بارزة رئيسية مع تفاصيل نصية كاملة',
      render: (isSelected) => (
        <div className="flex items-center justify-center h-20 w-full gap-2.5 p-2.5" dir="rtl">
          <div className={`w-2/5 h-full rounded-xl transition-all duration-300 flex items-center justify-center shadow-inner ${
            isSelected 
              ? 'bg-gradient-to-br from-primary to-primary-light text-white shadow-primary/30' 
              : 'bg-surface-variant/70 border border-outline-variant/30 text-on-surface-variant/40'
          }`}>
            <ImageIcon size={18} className={isSelected ? 'text-white' : 'text-on-surface-variant/50'} />
          </div>
          <div className="w-3/5 flex flex-col gap-2 justify-center">
            <div className={`w-3/4 h-2.5 rounded-full transition-colors ${isSelected ? 'bg-primary/90' : 'bg-surface-variant/90'}`} />
            <div className={`w-full h-1.5 rounded-full transition-colors ${isSelected ? 'bg-primary/50' : 'bg-surface-variant/50'}`} />
            <div className={`w-5/6 h-1.5 rounded-full transition-colors ${isSelected ? 'bg-primary/40' : 'bg-surface-variant/40'}`} />
          </div>
        </div>
      )
    },
    { 
      id: '2_images', 
      label: t('adminCourseForm.layoutPicker.twoImages') || 'صورتين', 
      desc: 'صورتان متجاورتان لعرض مقارنة أو تفاصيل مزدوجة',
      render: (isSelected) => (
        <div className="flex items-center justify-center h-20 w-full gap-2.5 p-2.5" dir="rtl">
          <div className="w-2/5 flex flex-col gap-1.5 h-full">
            <div className={`w-full h-1/2 rounded-lg transition-colors flex items-center justify-center ${
              isSelected ? 'bg-primary/80 text-white' : 'bg-surface-variant/70 border border-outline-variant/30'
            }`}>
              <ImageIcon size={12} className={isSelected ? 'text-white' : 'text-on-surface-variant/40'} />
            </div>
            <div className={`w-full h-1/2 rounded-lg transition-colors flex items-center justify-center ${
              isSelected ? 'bg-primary text-white' : 'bg-surface-variant/70 border border-outline-variant/30'
            }`}>
              <ImageIcon size={12} className={isSelected ? 'text-white' : 'text-on-surface-variant/40'} />
            </div>
          </div>
          <div className="w-3/5 flex flex-col gap-2 justify-center">
            <div className={`w-3/4 h-2.5 rounded-full transition-colors ${isSelected ? 'bg-primary/90' : 'bg-surface-variant/90'}`} />
            <div className={`w-full h-1.5 rounded-full transition-colors ${isSelected ? 'bg-primary/50' : 'bg-surface-variant/50'}`} />
            <div className={`w-5/6 h-1.5 rounded-full transition-colors ${isSelected ? 'bg-primary/40' : 'bg-surface-variant/40'}`} />
          </div>
        </div>
      )
    },
    { 
      id: '3_images', 
      label: t('adminCourseForm.layoutPicker.threeImages') || '٣ صور', 
      desc: 'معرض شبكي ثلاثي متناسق مع عمود نصي إيضاحي',
      render: (isSelected) => (
        <div className="flex items-center justify-center h-20 w-full gap-2 p-2" dir="rtl">
          <div className="w-1/2 flex gap-1.5 h-full">
            <div className={`w-1/2 h-full rounded-lg transition-colors flex items-center justify-center ${
              isSelected ? 'bg-primary text-white' : 'bg-surface-variant/70 border border-outline-variant/30'
            }`}>
              <ImageIcon size={14} className={isSelected ? 'text-white' : 'text-on-surface-variant/40'} />
            </div>
            <div className="w-1/2 flex flex-col gap-1.5 h-full">
              <div className={`w-full h-1/2 rounded-md transition-colors ${isSelected ? 'bg-primary/80' : 'bg-surface-variant/60'}`} />
              <div className={`w-full h-1/2 rounded-md transition-colors ${isSelected ? 'bg-primary/60' : 'bg-surface-variant/50'}`} />
            </div>
          </div>
          <div className="w-1/2 flex flex-col gap-2 justify-center">
            <div className={`w-4/5 h-2.5 rounded-full transition-colors ${isSelected ? 'bg-primary/90' : 'bg-surface-variant/90'}`} />
            <div className={`w-full h-1.5 rounded-full transition-colors ${isSelected ? 'bg-primary/50' : 'bg-surface-variant/50'}`} />
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-black tracking-wide text-on-surface flex items-center gap-1.5 uppercase">
          <Sliders size={14} className="text-primary" />
          {t('adminCourseForm.layoutPicker.title') || 'نمط وتخطيط القسم'}
        </label>
        <span className="text-[11px] text-on-surface-variant font-medium">اختر النمط المناسب لعرض الصور والنصوص</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {layouts.map(layout => {
          const isSelected = value === layout.id;
          return (
            <button
              key={layout.id}
              type="button"
              onClick={() => onChange(layout.id)}
              className={`relative group rounded-2xl flex flex-col overflow-hidden transition-all duration-300 text-start cursor-pointer border ${
                isSelected 
                  ? 'border-primary/80 bg-primary/[0.04] shadow-md shadow-primary/10 ring-2 ring-primary/30' 
                  : 'border-outline-variant/30 bg-surface/80 hover:border-primary/40 hover:bg-surface-variant/10 hover:shadow-sm'
              }`}
            >
              {isSelected && (
                <div className="absolute top-2 left-2 z-10 w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center shadow-md animate-in zoom-in-50 duration-200">
                  <Check size={12} strokeWidth={3} />
                </div>
              )}
              <div className="w-full bg-surface-container-low/40 flex justify-center items-center border-b border-outline-variant/20 pt-1">
                {layout.render(isSelected)}
              </div>
              <div className="p-3">
                <div className={`text-xs font-black transition-colors ${isSelected ? 'text-primary' : 'text-on-surface'}`}>
                  {layout.label}
                </div>
                <div className="text-[11px] text-on-surface-variant/80 mt-0.5 line-clamp-1">
                  {layout.desc}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

/* =========================================================================
   2. Main CourseForm Component
   ========================================================================= */
export default function CourseForm({ showMsg, course, categories, onBack, onSaveSuccess }) {
  const { t, i18n } = useTranslation();
  const isEditing = !!course;
  const BackIcon = i18n.language === 'en' ? ArrowLeft : ArrowRight;

  // Active Tab State
  const [activeTab, setActiveTab] = useState('basic');

  // Basic Info State
  const [form, setForm] = useState({ 
    title: '', 
    subtitle: '', 
    level: 'beginner', 
    category_id: '', 
    allow_feedback: true,
    qbank_price: 0,
    self_assessment_price: 0,
    flashcard_price: 0
  });
  const [shortDescriptions, setShortDescriptions] = useState([{ ar: '', en: '' }]);
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

  // Sections State
  const [sections, setSections] = useState([]);
  const [expandedSections, setExpandedSections] = useState({});

  // FAQs State
  const [faqs, setFaqs] = useState([]);
  const [expandedFaqs, setExpandedFaqs] = useState({});

  // Packages State
  const [packages, setPackages] = useState([]);

  // Sub-Products & Review States
  const [courseFlashcards, setCourseFlashcards] = useState([]);
  const [flashcardLoading, setFlashcardLoading] = useState(false);
  const [showAddFlashcard, setShowAddFlashcard] = useState(false);
  const [flashcardForm, setFlashcardForm] = useState({ id: null, title: '', description: '', price: 0, is_active: true });
  const [submittingFlashcard, setSubmittingFlashcard] = useState(false);
  const [manageCardsFor, setManageCardsFor] = useState(null);

  const [courseQBProducts, setCourseQBProducts] = useState([]);
  const [qbLoading, setQbLoading] = useState(false);
  const [showAddQB, setShowAddQB] = useState(false);
  const [qbForm, setQbForm] = useState({ id: null, title: '', description: '', price: 0, is_free: false, status: 'published' });
  const [submittingQB, setSubmittingQB] = useState(false);
  const [manageQBQuestionsFor, setManageQBQuestionsFor] = useState(null);

  const [courseSAProducts, setCourseSAProducts] = useState([]);
  const [saLoading, setSaLoading] = useState(false);
  const [showAddSA, setShowAddSA] = useState(false);
  const [saForm, setSaForm] = useState({ id: null, title: '', description: '', price: 0, is_free: false, duration_minutes: 120, status: 'published' });
  const [submittingSA, setSubmittingSA] = useState(false);
  const [manageSAQuestionsFor, setManageSAQuestionsFor] = useState(null);

  const [courseReviewsList, setCourseReviewsList] = useState([]);
  const [courseReviewsLoading, setCourseReviewsLoading] = useState(false);

  const [lessonReviewsList, setLessonReviewsList] = useState([]);
  const [lessonReviewsLoading, setLessonReviewsLoading] = useState(false);

  const [submitting, setSubmitting] = useState(false);

  // Set initial form values
  useEffect(() => {
    if (course) {
      setForm({ 
        title: course.title || '', 
        subtitle: course.subtitle || '', 
        level: course.level || 'beginner', 
        category_id: course.category_id || '',
        allow_feedback: course.allow_feedback !== false,
        qbank_price: course.qbank_price || 0,
        self_assessment_price: course.self_assessment_price || 0,
        flashcard_price: course.flashcard_price || 0
      });

      let parsedShortDesc = [{ ar: '', en: '' }];
      try {
        if (course.short_description) {
          const parsed = JSON.parse(course.short_description);
          if (Array.isArray(parsed) && parsed.length > 0) {
            parsedShortDesc = parsed.map(item => {
              if (typeof item === 'object' && item !== null) {
                return { ar: item.ar || '', en: item.en || '' };
              }
              return { ar: String(item), en: '' };
            });
          }
        }
      } catch (e) {
        parsedShortDesc = [{ ar: course.short_description || '', en: '' }];
      }
      setShortDescriptions(parsedShortDesc);

      const parsedSections = (course.sections || []).map(sec => {
        let imgs = [];
        if (typeof sec.images === 'string') {
          try {
            imgs = JSON.parse(sec.images);
            if (!Array.isArray(imgs)) imgs = [sec.images];
          } catch (e) {
            imgs = [sec.images];
          }
        } else if (Array.isArray(sec.images)) {
          imgs = sec.images;
        }
        return { ...sec, images: imgs };
      });
      setSections(parsedSections);

      setFaqs(course.faqs || []);
      setPackages(course.packages || []);

      if (course.image) {
        setPreviewUrl(getFileUrl(course.image));
      }
    }
  }, [course]);

  // Handle local file preview
  useEffect(() => {
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    }
  }, [file]);

  // Fetch sub-products on tab change
  useEffect(() => {
    if (course?.id) {
      if (activeTab === 'flashcards') fetchCourseFlashcards();
      if (activeTab === 'question_banks') fetchCourseQBProducts();
      if (activeTab === 'self_assessments') fetchCourseSAProducts();
      if (activeTab === 'course_reviews') fetchCourseReviews();
      if (activeTab === 'lesson_reviews') fetchLessonReviews();
    }
  }, [activeTab, course?.id]);

  // --- Handlers: Sub-products ---
  const fetchCourseFlashcards = async () => {
    if (!course?.id) return;
    setFlashcardLoading(true);
    try {
      const res = await API.get('/admin/flashcard-products');
      const all = res.data.products || [];
      setCourseFlashcards(all.filter(p => p.course_id === course.id));
    } catch (err) {
      console.error(err);
    } finally {
      setFlashcardLoading(false);
    }
  };

  const handleSaveFlashcard = async (e) => {
    e.preventDefault();
    setSubmittingFlashcard(true);
    try {
      const payload = { ...flashcardForm, course_id: course.id };
      if (flashcardForm.id) {
        await API.put(`/admin/flashcard-products/${flashcardForm.id}`, payload);
        showMsg('success', 'تم تحديث منتج الفلاش كارد بنجاح');
      } else {
        await API.post('/admin/flashcard-products', payload);
        showMsg('success', 'تم إضافة منتج الفلاش كارد بنجاح');
      }
      setShowAddFlashcard(false);
      fetchCourseFlashcards();
    } catch (err) {
      showMsg('error', 'حدث خطأ في حفظ منتج الفلاش كارد');
    } finally {
      setSubmittingFlashcard(false);
    }
  };

  const handleDeleteFlashcard = async (id) => {
    if (!confirm('هل أنت متأكد من حذف هذا المنتج؟')) return;
    try {
      await API.delete(`/admin/flashcard-products/${id}`);
      showMsg('success', 'تم الحذف بنجاح');
      fetchCourseFlashcards();
    } catch (err) {
      showMsg('error', 'حدث خطأ أثناء الحذف');
    }
  };

  const fetchCourseQBProducts = async () => {
    if (!course?.id) return;
    setQbLoading(true);
    try {
      const res = await API.get('/admin/question-bank-products');
      const all = res.data.products || [];
      setCourseQBProducts(all.filter(p => p.course_id === course.id));
    } catch (err) {
      console.error(err);
    } finally {
      setQbLoading(false);
    }
  };

  const handleSaveQB = async (e) => {
    e.preventDefault();
    setSubmittingQB(true);
    try {
      const payload = { ...qbForm, course_id: course.id };
      if (qbForm.id) {
        await API.put(`/admin/question-bank-products/${qbForm.id}`, payload);
        showMsg('success', 'تم تحديث بنك الأسئلة بنجاح');
      } else {
        await API.post('/admin/question-bank-products', payload);
        showMsg('success', 'تم إضافة بنك الأسئلة بنجاح');
      }
      setShowAddQB(false);
      fetchCourseQBProducts();
    } catch (err) {
      showMsg('error', 'حدث خطأ في حفظ بنك الأسئلة');
    } finally {
      setSubmittingQB(false);
    }
  };

  const handleDeleteQB = async (id) => {
    if (!confirm('هل أنت متأكد من حذف بنك الأسئلة هذا؟')) return;
    try {
      await API.delete(`/admin/question-bank-products/${id}`);
      showMsg('success', 'تم الحذف بنجاح');
      fetchCourseQBProducts();
    } catch (err) {
      showMsg('error', 'حدث خطأ أثناء الحذف');
    }
  };

  const fetchCourseSAProducts = async () => {
    if (!course?.id) return;
    setSaLoading(true);
    try {
      const res = await API.get('/admin/self-assessment-products');
      const all = res.data.products || [];
      setCourseSAProducts(all.filter(p => p.course_id === course.id));
    } catch (err) {
      console.error(err);
    } finally {
      setSaLoading(false);
    }
  };

  const handleSaveSA = async (e) => {
    e.preventDefault();
    setSubmittingSA(true);
    try {
      const payload = { ...saForm, course_id: course.id };
      if (saForm.id) {
        await API.put(`/admin/self-assessment-products/${saForm.id}`, payload);
        showMsg('success', 'تم تحديث التقييم الذاتي بنجاح');
      } else {
        await API.post('/admin/self-assessment-products', payload);
        showMsg('success', 'تم إضافة التقييم الذاتي بنجاح');
      }
      setShowAddSA(false);
      fetchCourseSAProducts();
    } catch (err) {
      showMsg('error', 'حدث خطأ في حفظ التقييم الذاتي');
    } finally {
      setSubmittingSA(false);
    }
  };

  const handleDeleteSA = async (id) => {
    if (!confirm('هل أنت متأكد من حذف هذا التقييم الذاتي؟')) return;
    try {
      await API.delete(`/admin/self-assessment-products/${id}`);
      showMsg('success', 'تم الحذف بنجاح');
      fetchCourseSAProducts();
    } catch (err) {
      showMsg('error', 'حدث خطأ أثناء الحذف');
    }
  };

  // --- Reviews Handlers ---
  const fetchCourseReviews = async () => {
    if (!course?.id) return;
    setCourseReviewsLoading(true);
    try {
      const res = await API.get(`/admin/reviews?course_id=${course.id}`);
      setCourseReviewsList(res.data.reviews || []);
    } catch (err) {
      console.error(err);
    } finally {
      setCourseReviewsLoading(false);
    }
  };

  const handleToggleCourseReview = async (id) => {
    try {
      const res = await API.post(`/admin/reviews/${id}/toggle`);
      showMsg('success', res.data.message || 'تم تحديث حالة التقييم');
      fetchCourseReviews();
    } catch (err) {
      showMsg('error', 'حدث خطأ أثناء تعديل حالة التقييم');
    }
  };

  const handleDeleteCourseReview = async (id) => {
    if (!confirm('هل أنت متأكد من حذف هذا التقييم؟')) return;
    try {
      await API.delete(`/admin/reviews/${id}`);
      showMsg('success', 'تم حذف التقييم بنجاح');
      fetchCourseReviews();
    } catch (err) {
      showMsg('error', 'حدث خطأ أثناء حذف التقييم');
    }
  };

  const fetchLessonReviews = async () => {
    if (!course?.id) return;
    setLessonReviewsLoading(true);
    try {
      const res = await API.get(`/admin/lesson-reviews?course_id=${course.id}`);
      setLessonReviewsList(res.data.reviews || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLessonReviewsLoading(false);
    }
  };

  const handleToggleLessonReview = async (id) => {
    try {
      const res = await API.post(`/admin/lesson-reviews/${id}/toggle`);
      showMsg('success', res.data.message || 'تم تحديث حالة تقييم الدرس');
      fetchLessonReviews();
    } catch (err) {
      showMsg('error', 'حدث خطأ أثناء تعديل حالة تقييم الدرس');
    }
  };

  const handleDeleteLessonReview = async (id) => {
    if (!confirm('هل أنت متأكد من حذف تقييم الدرس هذا؟')) return;
    try {
      await API.delete(`/admin/lesson-reviews/${id}`);
      showMsg('success', 'تم حذف التقييم بنجاح');
      fetchLessonReviews();
    } catch (err) {
      showMsg('error', 'حدث خطأ أثناء حذف تقييم الدرس');
    }
  };

  // --- Main Form Submit ---
  const handleSubmit = async (e) => {
    if (e) e.preventDefault(); 
    setSubmitting(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (file) fd.append('image', file);
      
      fd.append('short_description', JSON.stringify(
        shortDescriptions.filter(d => (d.ar && d.ar.trim() !== '') || (d.en && d.en.trim() !== ''))
      ));
      
      const formattedSections = sections.map(sec => ({
        ...sec,
        title_ar: sec.title_ar || sec.title_en || '',
        title_en: sec.title_en || sec.title_ar || 'Section'
      }));
      const formattedFaqs = faqs.map(f => ({
        ...f,
        question_ar: f.question_ar || f.question_en || '',
        question_en: f.question_en || f.question_ar || 'Question',
        answer_ar: f.answer_ar || f.answer_en || '',
        answer_en: f.answer_en || f.answer_ar || 'Answer'
      }));
      const formattedPackages = packages.map(p => ({
        ...p,
        name_ar: p.name_ar || p.name_en || '',
        name_en: p.name_en || p.name_ar || 'Package'
      }));

      fd.append('sections', JSON.stringify(formattedSections));
      fd.append('faqs', JSON.stringify(formattedFaqs));
      fd.append('packages', JSON.stringify(formattedPackages));
      
      let savedCourse = null;
      if (isEditing) {
        const res = await API.put(`/admin/courses/${course.id}`, fd);
        savedCourse = res.data.course;
        showMsg('success', t('adminCourseForm.basicInfo.saveSuccessUpdate') || 'تم تحديث الكورس بنجاح');
      } else {
        const res = await API.post('/admin/courses', fd);
        savedCourse = res.data.course;
        showMsg('success', t('adminCourseForm.basicInfo.saveSuccessCreate') || 'تم إنشاء الكورس بنجاح');
      }
      
      if (onSaveSuccess) onSaveSuccess(savedCourse);
    } catch (err) { 
      showMsg('error', err.response?.data?.message || (isEditing ? 'خطأ في تحديث الكورس' : 'خطأ في إنشاء الكورس')); 
    } finally { 
      setSubmitting(false); 
    }
  };

  // Sections management
  const handleAddSection = () => {
    const newIdx = sections.length;
    setSections([...sections, { title_ar: '', title_en: '', description_ar: '', description_en: '', layout_type: '1_image', images: [] }]);
    setExpandedSections(prev => ({ ...prev, [newIdx]: true }));
  };

  const handleUpdateSection = (index, field, value) => {
    const newSecs = [...sections];
    newSecs[index][field] = value;
    setSections(newSecs);
  };

  const handleUpdateSectionImage = (sectionIndex, imageIndex, url) => {
    const newSecs = [...sections];
    if (!newSecs[sectionIndex].images) newSecs[sectionIndex].images = [];
    newSecs[sectionIndex].images[imageIndex] = url;
    setSections(newSecs);
  };

  const uploadSectionImage = async (sectionIndex, imageIndex, imgFile) => {
    if (!imgFile) return;
    try {
      showMsg('info', t('adminCourseForm.common.uploadingImage') || 'جاري رفع الصورة...');
      const fd = new FormData();
      fd.append('image', imgFile);
      const res = await API.post('/admin/upload-image', fd);
      handleUpdateSectionImage(sectionIndex, imageIndex, res.data.url);
      showMsg('success', t('adminCourseForm.common.uploadSuccess') || 'تم رفع الصورة بنجاح');
    } catch (err) {
      showMsg('error', t('adminCourseForm.common.uploadError') || 'فشل في رفع الصورة');
    }
  };

  const handleRemoveSection = (index) => {
    setSections(sections.filter((_, i) => i !== index));
  };

  // FAQs management
  const handleAddFaq = () => {
    const newIdx = faqs.length;
    setFaqs([...faqs, { question_ar: '', question_en: '', answer_ar: '', answer_en: '' }]);
    setExpandedFaqs(prev => ({ ...prev, [newIdx]: true }));
  };

  const handleUpdateFaq = (index, field, value) => {
    const newFaqs = [...faqs];
    newFaqs[index][field] = value;
    setFaqs(newFaqs);
  };

  const handleRemoveFaq = (index) => {
    setFaqs(faqs.filter((_, i) => i !== index));
  };

  // Packages management
  const handleAddPackage = () => {
    setPackages([...packages, { 
      name_ar: '', name_en: '', 
      note_ar: '', note_en: '',
      price: 0, 
      includes_course_content: true, 
      includes_flashcards: false, 
      includes_question_banks: false, 
      includes_self_assessments: false 
    }]);
  };

  const handleUpdatePackage = (index, field, value) => {
    const newPkgs = [...packages];
    newPkgs[index][field] = value;
    setPackages(newPkgs);
  };

  const handleRemovePackage = (index) => {
    setPackages(packages.filter((_, i) => i !== index));
  };

  // Short descriptions management
  const handleAddShortDesc = () => setShortDescriptions([...shortDescriptions, { ar: '', en: '' }]);
  const handleUpdateShortDesc = (index, field, value) => {
    const newDescs = [...shortDescriptions];
    newDescs[index] = { ...newDescs[index], [field]: value };
    setShortDescriptions(newDescs);
  };
  const handleRemoveShortDesc = (index) => {
    setShortDescriptions(shortDescriptions.filter((_, i) => i !== index));
  };

  // Enhanced Tab Definitions with Icons & Counts
  const tabs = [
    { 
      id: 'basic', 
      label: t('adminCourseForm.tabs.basic') || 'البيانات الأساسية', 
      icon: Sparkles,
      count: null
    },
    { 
      id: 'sections', 
      label: t('adminCourseForm.tabs.sections') || 'أقسام الكورس', 
      icon: Layers,
      count: sections.length
    },
    { 
      id: 'faqs', 
      label: t('adminCourseForm.tabs.faqs') || 'الأسئلة الشائعة', 
      icon: HelpCircle,
      count: faqs.length
    },
    { 
      id: 'packages', 
      label: t('adminCourseForm.tabs.packages') || 'الباقات والتسعير', 
      icon: CreditCard,
      count: packages.length
    },
    { 
      id: 'course_reviews', 
      label: t('adminCourseForm.tabs.courseReviews') || 'تقييمات الكورس', 
      icon: Star,
      count: courseReviewsList.length,
      disabled: !course?.id
    },
    { 
      id: 'lesson_reviews', 
      label: t('adminCourseForm.tabs.lessonReviews') || 'تقييمات الدروس', 
      icon: MessageSquare,
      count: lessonReviewsList.length,
      disabled: !course?.id
    },
  ];

  // Selected Category Object
  const selectedCategory = categories.find(c => String(c.id) === String(form.category_id));

  return (
    <div className="space-y-6 pb-24">
      
      {/* =========================================================================
          HERO TOP COMMAND BAR
         ========================================================================= */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-surface-container-low via-surface to-surface-container-low/80 border border-outline-variant/40 p-5 sm:p-7 shadow-xl backdrop-blur-xl">
        <div className="absolute -top-24 -left-24 w-60 h-60 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-60 h-60 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <button 
              type="button"
              onClick={onBack} 
              className="p-3 rounded-2xl bg-surface/90 border border-outline-variant/50 text-on-surface-variant hover:text-primary hover:border-primary/40 hover:scale-105 active:scale-95 shadow-sm transition-all duration-200 cursor-pointer shrink-0"
              title={t('adminCourseForm.common.back') || 'رجوع'}
            >
              <BackIcon size={20} />
            </button>

            <div className="space-y-1.5">
              <div className="flex items-center flex-wrap gap-2">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                  isEditing ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${isEditing ? 'bg-amber-500' : 'bg-emerald-500'} animate-pulse`} />
                  {isEditing ? 'تعديل كورس قائم' : 'كورس تدريبي جديد'}
                </span>

                {selectedCategory && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
                    <Tag size={12} />
                    {selectedCategory.name}
                  </span>
                )}

                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-surface-variant/40 text-on-surface-variant border border-outline-variant/30">
                  <BarChart3 size={12} />
                  {form.level === 'beginner' ? 'مبتدئ' : form.level === 'intermediate' ? 'متوسط' : 'متقدم'}
                </span>
              </div>

              <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-on-surface tracking-tight">
                {form.title || (isEditing ? course?.title : 'عنوان الكورس الجديد')}
              </h1>
              <p className="text-xs sm:text-sm text-on-surface-variant font-medium">
                {form.subtitle || 'قم بإعداد وتنسيق تفاصيل الدبلومة، المحاضرات، المنتجات الملحقة، والتسعير بدقة'}
              </p>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="py-2.5 px-5 rounded-2xl bg-gradient-to-r from-primary to-primary-light text-white font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
            >
              {submitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {isEditing ? (t('adminCourseForm.common.save') || 'حفظ التعديلات') : (t('adminCourseForm.common.createNewCourse') || 'إنشاء الكورس الآن')}
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================================
          SLICK SEGMENTED TABS DOCK
         ========================================================================= */}
      <div className="sticky top-3 z-30 bg-surface/85 backdrop-blur-xl border border-outline-variant/40 p-2 rounded-2xl shadow-lg">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button 
                key={tab.id} 
                onClick={() => setActiveTab(tab.id)}
                className={`group flex items-center gap-2 px-3.5 py-2.5 rounded-xl font-black text-xs sm:text-sm whitespace-nowrap transition-all duration-200 cursor-pointer ${
                  isActive 
                    ? 'bg-primary text-white shadow-md shadow-primary/25 scale-[1.02]' 
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/40'
                }`}
              >
                <Icon size={16} className={isActive ? 'text-white' : 'text-on-surface-variant/70 group-hover:text-primary transition-colors'} />
                <span>{tab.label}</span>
                {tab.count !== null && tab.count > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black leading-none ${
                    isActive ? 'bg-white/20 text-white' : 'bg-surface-container-high text-on-surface-variant'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* =========================================================================
          MAIN FORM CONTENT TABS
         ========================================================================= */}
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* -----------------------------------------------------------------------
            1. BASIC INFO TAB
           ----------------------------------------------------------------------- */}
        {activeTab === 'basic' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left/Main Column: Text Fields & Configuration */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Primary Details Card */}
              <div className="rounded-3xl bg-surface-container-low/70 border border-outline-variant/40 p-6 shadow-md space-y-5 backdrop-blur-md">
                <div className="flex items-center gap-2 border-b border-outline-variant/20 pb-3">
                  <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                    <FileText size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-on-surface">العناوين والتفاصيل الأساسية</h3>
                    <p className="text-xs text-on-surface-variant">الاسم الرئيسي والعنوان التوضيحي الذي سيظهر في الصفحة والبطاقات</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <Input 
                    label={t('adminCourseForm.basicInfo.titleLabel') || 'عنوان الكورس *'} 
                    required 
                    placeholder={t('adminCourseForm.basicInfo.titlePlaceholder') || 'مثال: دبلومة البرمجة والذكاء الاصطناعي الشاملة'} 
                    value={form.title} 
                    onChange={e => setForm({ ...form, title: e.target.value })} 
                  />
                  <Input 
                    label={t('adminCourseForm.basicInfo.subtitleLabel') || 'العنوان الفرعي الترويجي'} 
                    placeholder="مثال: تعلم من الصفر حتى احتراف بناء المشاريع الحقيقية مع تدريب عملي"
                    value={form.subtitle} 
                    onChange={e => setForm({ ...form, subtitle: e.target.value })} 
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <Select 
                    label={t('adminCourseForm.basicInfo.levelLabel') || 'مستوى الكورس'} 
                    value={form.level} 
                    onChange={e => setForm({ ...form, level: e.target.value })}
                  >
                    <option value="beginner">{t('adminCourseForm.basicInfo.levels.beginner') || 'مبتدئ'}</option>
                    <option value="intermediate">{t('adminCourseForm.basicInfo.levels.intermediate') || 'متوسط'}</option>
                    <option value="advanced">{t('adminCourseForm.basicInfo.levels.advanced') || 'متقدم'}</option>
                  </Select>

                  <Select 
                    label={t('adminCourseForm.basicInfo.categoryLabel') || 'التصنيف الرئيسي'} 
                    value={form.category_id} 
                    onChange={e => setForm({ ...form, category_id: e.target.value })}
                  >
                    <option value="">{t('adminCourseForm.basicInfo.categorySelect') || 'اختر التصنيف'}</option>
                    {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                  </Select>
                </div>
              </div>

              {/* Course Objectives / Short Descriptions Card */}
              <div className="rounded-3xl bg-surface-container-low/70 border border-outline-variant/40 p-6 shadow-md space-y-4 backdrop-blur-md">
                <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
                      <CheckCircle2 size={18} />
                    </div>
                    <div>
                      <h3 className="text-base font-black text-on-surface">{t('adminCourseForm.basicInfo.shortDescLabel') || 'أهداف ونقاط الكورس البارزة'}</h3>
                      <p className="text-xs text-on-surface-variant">{t('adminCourseForm.basicInfo.shortDescHint') || 'إضافة النقاط والأهداف الرئيسية باللغتين العربية والإنجليزية'}</p>
                    </div>
                  </div>

                  <button 
                    type="button" 
                    onClick={handleAddShortDesc} 
                    className="flex items-center gap-1.5 text-xs font-black bg-primary/10 text-primary hover:bg-primary hover:text-white px-3.5 py-2 rounded-xl transition-all cursor-pointer"
                  >
                    <Plus size={15} /> {t('adminCourseForm.basicInfo.addShortDescBtn') || 'إضافة هدف جديد'}
                  </button>
                </div>

                <div className="space-y-3 pt-1">
                  {shortDescriptions.map((desc, i) => (
                    <div 
                      key={i} 
                      className="flex items-start gap-3 p-3.5 rounded-2xl bg-surface/90 border border-outline-variant/30 hover:border-primary/40 transition-all shadow-sm group"
                    >
                      <span className="w-7 h-7 rounded-xl bg-primary/10 text-primary font-black text-xs flex items-center justify-center shrink-0 mt-2">
                        {String(i + 1).padStart(2, '0')}
                      </span>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 flex-1">
                        <div className="space-y-1">
                          <span className="text-[10px] font-black text-on-surface-variant/80 px-1 uppercase">العربية</span>
                          <Input 
                            placeholder={`${t('adminCourseForm.basicInfo.descArPlaceholder') || 'نقطة أو مهارة سيكتسبها الطالب'} #${i + 1}`} 
                            value={desc.ar || ''} 
                            onChange={e => handleUpdateShortDesc(i, 'ar', e.target.value)} 
                          />
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] font-black text-on-surface-variant/80 px-1 uppercase">English</span>
                          <Input 
                            placeholder={`${t('adminCourseForm.basicInfo.descEnPlaceholder') || 'Learning objective'} #${i + 1}`} 
                            value={desc.en || ''} 
                            onChange={e => handleUpdateShortDesc(i, 'en', e.target.value)} 
                          />
                        </div>
                      </div>

                      {shortDescriptions.length > 1 && (
                        <button 
                          type="button" 
                          onClick={() => handleRemoveShortDesc(i)} 
                          className="text-on-surface-variant/50 hover:text-rose-500 hover:bg-rose-500/10 p-2 rounded-xl transition-colors shrink-0 mt-5 cursor-pointer" 
                          title={t('adminCourseForm.basicInfo.removeDescBtn') || 'حذف النقطة'}
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Right/Side Column: Cover Image & Settings */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Cover Image Uploader */}
              <div className="rounded-3xl bg-surface-container-low/70 border border-outline-variant/40 p-6 shadow-md space-y-4 backdrop-blur-md">
                <div className="flex items-center gap-2 border-b border-outline-variant/20 pb-3">
                  <div className="w-8 h-8 rounded-xl bg-violet-500/10 text-violet-500 flex items-center justify-center font-bold">
                    <ImageIcon size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-on-surface">
                      {isEditing ? (t('adminCourseForm.basicInfo.coverImageLabelEdit') || 'تغيير صورة الغلاف') : (t('adminCourseForm.basicInfo.coverImageLabelNew') || 'صورة غلاف الكورس')}
                    </h3>
                    <p className="text-xs text-on-surface-variant">النسبة الموصى بها 16:9 بجودة عالية</p>
                  </div>
                </div>

                <div className="relative group overflow-hidden rounded-2xl border-2 border-dashed border-outline-variant/50 hover:border-primary/60 transition-all bg-surface/60">
                  {previewUrl ? (
                    <div className="relative aspect-video w-full overflow-hidden rounded-xl">
                      <img 
                        src={previewUrl} 
                        alt="Course Cover Preview" 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-4">
                        <label 
                          htmlFor="courseImg" 
                          className="py-2 px-4 rounded-xl bg-white/90 text-black font-black text-xs hover:bg-white flex items-center justify-center gap-1.5 cursor-pointer shadow-lg w-full transition-all"
                        >
                          <Upload size={14} /> تغيير الصورة الحالية
                        </label>
                      </div>
                    </div>
                  ) : (
                    <label htmlFor="courseImg" className="p-8 flex flex-col items-center justify-center gap-3 cursor-pointer text-center block">
                      <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Upload size={24} />
                      </div>
                      <div>
                        <span className="text-xs font-black text-on-surface block">
                          {t('adminCourseForm.basicInfo.coverImageUpload') || 'اضغط لاختيار صورة الغلاف'}
                        </span>
                        <span className="text-[11px] text-on-surface-variant block mt-1">
                          PNG, JPG, WEBP حتى 5MB
                        </span>
                      </div>
                    </label>
                  )}
                  <input 
                    type="file" 
                    id="courseImg" 
                    accept="image/*" 
                    onChange={e => {
                      if (e.target.files && e.target.files[0]) {
                        setFile(e.target.files[0]);
                      }
                    }} 
                    className="hidden" 
                  />
                </div>

                {file && (
                  <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-bold">
                    <span className="truncate">{file.name}</span>
                    <button 
                      type="button" 
                      onClick={() => { setFile(null); setPreviewUrl(course?.image ? getFileUrl(course.image) : ''); }}
                      className="text-rose-500 hover:bg-rose-500/10 p-1 rounded-lg"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
              </div>

              {/* Feature Settings Card */}
              <div className="rounded-3xl bg-surface-container-low/70 border border-outline-variant/40 p-6 shadow-md space-y-4 backdrop-blur-md">
                <div className="flex items-center gap-2 border-b border-outline-variant/20 pb-3">
                  <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center font-bold">
                    <ShieldCheck size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-on-surface">إعدادات المشاركة والمراجعات</h3>
                    <p className="text-xs text-on-surface-variant">التحكم في الميزات التفاعلية للطلاب</p>
                  </div>
                </div>

                <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-surface/90 border border-outline-variant/30 hover:border-primary/40 cursor-pointer transition-all">
                  <input 
                    type="checkbox" 
                    id="allow_feedback" 
                    checked={form.allow_feedback} 
                    onChange={e => setForm({ ...form, allow_feedback: e.target.checked })} 
                    className="w-5 h-5 rounded-lg border-outline-variant/50 text-primary mt-0.5" 
                  />
                  <div>
                    <span className="font-bold text-xs sm:text-sm text-on-surface block">
                      {t('adminCourseForm.basicInfo.allowFeedback') || 'السماح بتقييمات وتعليقات الطلاب'}
                    </span>
                    <span className="text-[11px] text-on-surface-variant block mt-0.5">
                      إتاحة قسم مراجعات الطلاب بعد إكمال الدورة
                    </span>
                  </div>
                </label>
              </div>

              {/* Pricing Settings Card */}
              <div className="rounded-3xl bg-surface-container-low/70 border border-outline-variant/40 p-6 shadow-md space-y-4 backdrop-blur-md">
                <div className="flex items-center gap-2 border-b border-outline-variant/20 pb-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
                    <CreditCard size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-on-surface">تسعير الميزات الإضافية</h3>
                    <p className="text-xs text-on-surface-variant">الأسعار الخاصة بكل ميزة عند شرائها مع الكورس</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <Input 
                    label="سعر بنك الأسئلة (Q-Bank Price) $" 
                    type="number" 
                    step="0.01" 
                    min="0"
                    value={form.qbank_price} 
                    onChange={e => setForm({ ...form, qbank_price: e.target.value })} 
                  />
                  <Input 
                    label="سعر التقييم الذاتي (Self Assessment) $" 
                    type="number" 
                    step="0.01" 
                    min="0"
                    value={form.self_assessment_price} 
                    onChange={e => setForm({ ...form, self_assessment_price: e.target.value })} 
                  />
                  <Input 
                    label="سعر البطاقات التعليمية (Flashcards) $" 
                    type="number" 
                    step="0.01" 
                    min="0"
                    value={form.flashcard_price} 
                    onChange={e => setForm({ ...form, flashcard_price: e.target.value })} 
                  />
                </div>
              </div>

            </div>

          </div>
        )}

        {/* -----------------------------------------------------------------------
            2. SECTIONS TAB
           ----------------------------------------------------------------------- */}
        {activeTab === 'sections' && (
          <div className="space-y-6">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface-container-low/60 p-5 rounded-3xl border border-outline-variant/40">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                  <Layers size={22} />
                </div>
                <div>
                  <h3 className="font-black text-on-surface text-lg">{t('adminCourseForm.sections.title') || 'أقسام صفحة العرض'}</h3>
                  <p className="text-xs text-on-surface-variant">{t('adminCourseForm.sections.hint') || 'يمكنك إضافة أكثر من قسم لصفحة تفاصيل الكورس مع دعم اللغتين وتخطيط الصور'}</p>
                </div>
              </div>
              
              <button 
                type="button" 
                onClick={handleAddSection} 
                className="flex items-center justify-center gap-2 text-xs sm:text-sm font-black bg-primary text-white px-5 py-2.5 rounded-2xl hover:bg-primary-hover shadow-lg shadow-primary/20 transition-all cursor-pointer shrink-0"
              >
                <Plus size={18} /> {t('adminCourseForm.sections.addSectionBtn') || 'إضافة قسم جديد'}
              </button>
            </div>

            {sections.length === 0 ? (
              <div className="text-center py-16 px-4 border-2 border-dashed border-outline-variant/40 rounded-3xl bg-surface-container-low/30 space-y-4">
                <div className="w-16 h-16 rounded-3xl bg-primary/10 text-primary flex items-center justify-center mx-auto shadow-inner">
                  <Layers size={32} />
                </div>
                <div className="max-w-md mx-auto space-y-1">
                  <h4 className="text-base font-black text-on-surface">{t('adminCourseForm.sections.emptyMessage') || 'لا توجد سكاشن مضافة بعد لهذا الكورس.'}</h4>
                  <p className="text-xs text-on-surface-variant">السكاشن تمنح صفحة تفاصيل الكورس جاذبية واحترافية لعرض مميزات ومحاور الدورة للطلاب.</p>
                </div>
                <button 
                  type="button" 
                  onClick={handleAddSection} 
                  className="inline-flex items-center gap-2 text-xs font-black bg-primary text-white px-5 py-2.5 rounded-2xl shadow-md hover:bg-primary-hover transition-all cursor-pointer"
                >
                  <Plus size={16} /> {t('adminCourseForm.sections.addSectionNow') || 'إضافة أول قسم الآن'}
                </button>
              </div>
            ) : (
              <div className="space-y-5">
                {sections.map((sec, i) => {
                  const isExpanded = expandedSections[i] !== false; // default expanded
                  return (
                    <div 
                      key={i} 
                      className="rounded-3xl border border-outline-variant/40 bg-surface-container-low/70 overflow-hidden shadow-sm hover:shadow-md transition-all duration-200"
                    >
                      {/* Section Header Bar */}
                      <div className="flex items-center justify-between p-4 sm:p-5 bg-surface-container-low/90 border-b border-outline-variant/30">
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => setExpandedSections(prev => ({ ...prev, [i]: !isExpanded }))}
                            className="w-8 h-8 rounded-xl bg-surface border border-outline-variant/40 text-on-surface flex items-center justify-center hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer"
                          >
                            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                          </button>
                          
                          <div className="flex items-center gap-2">
                            <span className="w-7 h-7 rounded-xl bg-primary text-white font-black text-xs flex items-center justify-center shadow-sm">
                              {i + 1}
                            </span>
                            <div>
                              <h4 className="font-black text-sm text-on-surface">
                                {sec.title_ar || sec.title_en || `${t('adminCourseForm.sections.sectionPrefix') || 'قسم #'} ${i + 1}`}
                              </h4>
                              <span className="text-[11px] text-on-surface-variant font-medium">
                                النمط: {sec.layout_type === '1_image' ? 'صورة واحدة' : sec.layout_type === '2_images' ? 'صورتين' : '٣ صور'}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button 
                            type="button" 
                            onClick={() => handleRemoveSection(i)} 
                            className="text-rose-500 hover:bg-rose-500/10 px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1.5 text-xs font-black cursor-pointer"
                          >
                            <Trash2 size={16} /> {t('adminCourseForm.sections.removeSection') || 'حذف'}
                          </button>
                        </div>
                      </div>

                      {/* Section Body */}
                      {isExpanded && (
                        <div className="p-5 sm:p-6 space-y-6">
                          
                          {/* Interactive Layout Selector */}
                          <LayoutPicker 
                            value={sec.layout_type} 
                            onChange={(val) => handleUpdateSection(i, 'layout_type', val)} 
                            t={t} 
                          />

                          {/* Titles Bilingual */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <span className="text-[11px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">العربية</span>
                              <Input 
                                label={t('adminCourseForm.sections.titleAr') || 'العنوان بالعربية *'} 
                                placeholder={t('adminCourseForm.sections.titleArPlaceholder') || 'مثال: مميزات وحقائب الكورس'} 
                                value={sec.title_ar || ''} 
                                onChange={(e) => handleUpdateSection(i, 'title_ar', e.target.value)} 
                              />
                            </div>
                            <div className="space-y-1">
                              <span className="text-[11px] font-black text-secondary uppercase tracking-wide">English</span>
                              <Input 
                                label={t('adminCourseForm.sections.titleEn') || 'العنوان بالإنجليزية'} 
                                placeholder={t('adminCourseForm.sections.titleEnPlaceholder') || 'e.g. Course Key Features'} 
                                value={sec.title_en || ''} 
                                onChange={(e) => handleUpdateSection(i, 'title_en', e.target.value)} 
                              />
                            </div>
                          </div>

                          {/* Descriptions Bilingual */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Textarea 
                              label={t('adminCourseForm.sections.descAr') || 'الوصف بالعربية'} 
                              placeholder={t('adminCourseForm.sections.descArPlaceholder') || 'اكتب شرحاً مشوقاً لمحتوى ومميزات القسم بالعربية...'} 
                              value={sec.description_ar || ''} 
                              onChange={(e) => handleUpdateSection(i, 'description_ar', e.target.value)} 
                              rows={3} 
                            />
                            <Textarea 
                              label={t('adminCourseForm.sections.descEn') || 'الوصف بالإنجليزية'} 
                              placeholder={t('adminCourseForm.sections.descEnPlaceholder') || 'Describe section details in English...'} 
                              value={sec.description_en || ''} 
                              onChange={(e) => handleUpdateSection(i, 'description_en', e.target.value)} 
                              rows={3} 
                            />
                          </div>

                          {/* Dynamic Images Grid */}
                          <div className="pt-2">
                            <label className="text-xs font-black text-on-surface mb-3 flex items-center gap-2">
                              <ImageIcon size={16} className="text-primary" />
                              {t('adminCourseForm.sections.sectionImages') || 'صور القسم المرفقة'}
                            </label>

                            {/* 1, 2, or 3 images slots */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                              {Array.from({ length: sec.layout_type === '1_image' ? 1 : sec.layout_type === '2_images' ? 2 : 3 }).map((_, imgIdx) => {
                                const imgUrl = sec.images?.[imgIdx];
                                return (
                                  <div 
                                    key={imgIdx} 
                                    className="relative group rounded-2xl border-2 border-dashed border-outline-variant/50 hover:border-primary/60 bg-surface overflow-hidden transition-all text-center"
                                  >
                                    {imgUrl ? (
                                      <div className="relative aspect-video w-full overflow-hidden">
                                        <img 
                                          src={getFileUrl(imgUrl)} 
                                          alt={`Section ${i+1} image ${imgIdx+1}`} 
                                          className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                                        />
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                          <label 
                                            htmlFor={`sec-${i}-img-${imgIdx}`} 
                                            className="p-2 rounded-xl bg-white text-black font-bold text-xs hover:bg-white/90 cursor-pointer shadow-md"
                                            title="تغيير الصورة"
                                          >
                                            <RefreshCw size={14} />
                                          </label>
                                          <button
                                            type="button"
                                            onClick={() => handleUpdateSectionImage(i, imgIdx, '')}
                                            className="p-2 rounded-xl bg-rose-600 text-white font-bold text-xs hover:bg-rose-700 cursor-pointer shadow-md"
                                            title="حذف الصورة"
                                          >
                                            <Trash2 size={14} />
                                          </button>
                                        </div>
                                      </div>
                                    ) : (
                                      <label 
                                        htmlFor={`sec-${i}-img-${imgIdx}`} 
                                        className="p-6 flex flex-col items-center justify-center gap-2 cursor-pointer h-full"
                                      >
                                        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                                          <Upload size={18} />
                                        </div>
                                        <span className="text-xs font-bold text-on-surface">
                                          {t('adminCourseForm.sections.uploadImageNum') || 'رفع الصورة'} #{imgIdx + 1}
                                        </span>
                                      </label>
                                    )}

                                    <input 
                                      type="file" 
                                      id={`sec-${i}-img-${imgIdx}`} 
                                      accept="image/*" 
                                      onChange={(e) => uploadSectionImage(i, imgIdx, e.target.files[0])} 
                                      className="hidden" 
                                    />
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                        </div>
                      )}
                    </div>
                  );
                })}

                <div className="flex justify-center pt-3">
                  <button 
                    type="button" 
                    onClick={handleAddSection} 
                    className="flex items-center gap-2 text-xs sm:text-sm font-black bg-primary/10 text-primary hover:bg-primary hover:text-white px-6 py-3 rounded-2xl transition-all shadow-sm cursor-pointer"
                  >
                    <Plus size={18} /> {t('adminCourseForm.sections.addAnotherSection') || 'إضافة قسم جديد آخر'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* -----------------------------------------------------------------------
            3. FAQS TAB
           ----------------------------------------------------------------------- */}
        {activeTab === 'faqs' && (
          <div className="space-y-6">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface-container-low/60 p-5 rounded-3xl border border-outline-variant/40">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
                  <HelpCircle size={22} />
                </div>
                <div>
                  <h3 className="font-black text-on-surface text-lg">{t('adminCourseForm.faqs.title') || 'الأسئلة الشائعة حول الكورس'}</h3>
                  <p className="text-xs text-on-surface-variant">{t('adminCourseForm.faqs.hint') || 'إضافة الأسئلة والأجوبة باللغتين العربية والإنجليزية لتقديم إجابات سريعة للطلاب'}</p>
                </div>
              </div>
              
              <button 
                type="button" 
                onClick={handleAddFaq} 
                className="flex items-center justify-center gap-2 text-xs sm:text-sm font-black bg-primary text-white px-5 py-2.5 rounded-2xl hover:bg-primary-hover shadow-lg shadow-primary/20 transition-all cursor-pointer shrink-0"
              >
                <Plus size={18} /> {t('adminCourseForm.faqs.addFaqBtn') || 'إضافة سؤال'}
              </button>
            </div>

            {faqs.length === 0 ? (
              <div className="text-center py-16 px-4 border-2 border-dashed border-outline-variant/40 rounded-3xl bg-surface-container-low/30 space-y-4">
                <div className="w-16 h-16 rounded-3xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto shadow-inner">
                  <HelpCircle size={32} />
                </div>
                <div className="max-w-md mx-auto space-y-1">
                  <h4 className="text-base font-black text-on-surface">{t('adminCourseForm.faqs.emptyMessage') || 'لا توجد أسئلة مضافة بعد.'}</h4>
                  <p className="text-xs text-on-surface-variant">أضف الأسئلة الأكثر تكراراً لتوفير الوقت على فريق الدعم وتسهيل قرار الشراء على الطلاب.</p>
                </div>
                <button 
                  type="button" 
                  onClick={handleAddFaq} 
                  className="inline-flex items-center gap-2 text-xs font-black bg-primary text-white px-5 py-2.5 rounded-2xl shadow-md hover:bg-primary-hover transition-all cursor-pointer"
                >
                  <Plus size={16} /> {t('adminCourseForm.faqs.addFaqNow') || 'إضافة سؤال جديد الآن'}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {faqs.map((faq, i) => {
                  const isExpanded = expandedFaqs[i] !== false;
                  return (
                    <div 
                      key={i} 
                      className="rounded-3xl border border-outline-variant/40 bg-surface-container-low/70 overflow-hidden shadow-sm hover:shadow-md transition-all"
                    >
                      <div className="flex items-center justify-between p-4 sm:p-5 bg-surface-container-low/90 border-b border-outline-variant/30">
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => setExpandedFaqs(prev => ({ ...prev, [i]: !isExpanded }))}
                            className="w-8 h-8 rounded-xl bg-surface border border-outline-variant/40 text-on-surface flex items-center justify-center hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer"
                          >
                            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                          </button>
                          
                          <div className="flex items-center gap-2">
                            <span className="w-7 h-7 rounded-xl bg-amber-500/10 text-amber-500 font-black text-xs flex items-center justify-center">
                              {i + 1}
                            </span>
                            <h4 className="font-black text-sm text-on-surface">
                              {faq.question_ar || faq.question_en || `${t('adminCourseForm.faqs.faqPrefix') || 'سؤال شائع #'} ${i + 1}`}
                            </h4>
                          </div>
                        </div>

                        <button 
                          type="button" 
                          onClick={() => handleRemoveFaq(i)} 
                          className="text-rose-500 hover:bg-rose-500/10 px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1.5 text-xs font-black cursor-pointer"
                        >
                          <Trash2 size={16} /> {t('adminCourseForm.faqs.removeFaq') || 'حذف'}
                        </button>
                      </div>

                      {isExpanded && (
                        <div className="p-5 sm:p-6 space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input 
                              label={t('adminCourseForm.faqs.questionAr') || 'السؤال بالعربية *'} 
                              placeholder={t('adminCourseForm.faqs.questionArPlaceholder') || 'مثال: هل أحصل على شهادة معتمدة بعد إتمام الكورس؟'} 
                              value={faq.question_ar || ''} 
                              onChange={(e) => handleUpdateFaq(i, 'question_ar', e.target.value)} 
                            />
                            <Input 
                              label={t('adminCourseForm.faqs.questionEn') || 'السؤال بالإنجليزية'} 
                              placeholder={t('adminCourseForm.faqs.questionEnPlaceholder') || 'e.g. Will I receive an accredited certificate?'} 
                              value={faq.question_en || ''} 
                              onChange={(e) => handleUpdateFaq(i, 'question_en', e.target.value)} 
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Textarea 
                              label={t('adminCourseForm.faqs.answerAr') || 'الإجابة بالعربية *'} 
                              placeholder={t('adminCourseForm.faqs.answerArPlaceholder') || 'الإجابة الشافية بالعربية...'} 
                              value={faq.answer_ar || ''} 
                              onChange={(e) => handleUpdateFaq(i, 'answer_ar', e.target.value)} 
                              rows={3} 
                            />
                            <Textarea 
                              label={t('adminCourseForm.faqs.answerEn') || 'الإجابة بالإنجليزية'} 
                              placeholder={t('adminCourseForm.faqs.answerEnPlaceholder') || 'Detailed answer in English...'} 
                              value={faq.answer_en || ''} 
                              onChange={(e) => handleUpdateFaq(i, 'answer_en', e.target.value)} 
                              rows={3} 
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}

                <div className="flex justify-center pt-3">
                  <button 
                    type="button" 
                    onClick={handleAddFaq} 
                    className="flex items-center gap-2 text-xs sm:text-sm font-black bg-primary/10 text-primary hover:bg-primary hover:text-white px-6 py-3 rounded-2xl transition-all shadow-sm cursor-pointer"
                  >
                    <Plus size={18} /> {t('adminCourseForm.faqs.addAnotherFaq') || 'إضافة سؤال شائع آخر'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* -----------------------------------------------------------------------
            4. PACKAGES & PRICING TAB
           ----------------------------------------------------------------------- */}
        {activeTab === 'packages' && (
          <div className="space-y-6">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface-container-low/60 p-5 rounded-3xl border border-outline-variant/40">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
                  <CreditCard size={22} />
                </div>
                <div>
                  <h3 className="font-black text-on-surface text-lg">باقات التسعير</h3>
                  <p className="text-xs text-on-surface-variant">قم بإعداد باقات مخصصة للكورس بأسعار وصلاحيات مختلفة لزيادة المبيعات</p>
                </div>
              </div>
              
              <button 
                type="button" 
                onClick={handleAddPackage} 
                className="flex items-center justify-center gap-2 text-xs sm:text-sm font-black bg-primary text-white px-5 py-2.5 rounded-2xl hover:bg-primary-hover shadow-lg shadow-primary/20 transition-all cursor-pointer shrink-0"
              >
                <Plus size={18} /> إضافة باقة جديدة
              </button>
            </div>

            {packages.length === 0 ? (
              <div className="text-center py-16 px-4 border-2 border-dashed border-outline-variant/40 rounded-3xl bg-surface-container-low/30 space-y-4">
                <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto shadow-inner">
                  <CreditCard size={32} />
                </div>
                <div className="max-w-md mx-auto space-y-1">
                  <h4 className="text-base font-black text-on-surface">لا توجد باقات تسعير محددة حتى الآن.</h4>
                  <p className="text-xs text-on-surface-variant">أنشئ باقات مميزة (مثل: الباقة الأساسية، الباقة المتقدمة، أو الدبلومة الشاملة).</p>
                </div>
                <button 
                  type="button" 
                  onClick={handleAddPackage} 
                  className="inline-flex items-center gap-2 text-xs font-black bg-primary text-white px-5 py-2.5 rounded-2xl shadow-md hover:bg-primary-hover transition-all cursor-pointer"
                >
                  <Plus size={16} /> إضافة أول باقة الآن
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {packages.map((pkg, i) => (
                  <div 
                    key={i} 
                    className="rounded-3xl border border-outline-variant/40 bg-surface-container-low/70 p-6 space-y-5 shadow-sm hover:shadow-lg transition-all duration-200 relative group flex flex-col justify-between"
                  >
                    <div className="space-y-4">
                      {/* Package Header */}
                      <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
                        <div className="flex items-center gap-2.5">
                          <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-primary-light text-white font-black text-xs flex items-center justify-center shadow-sm">
                            {i + 1}
                          </span>
                          <div>
                            <h4 className="font-black text-sm text-on-surface">
                              {pkg.name_ar || pkg.name_en || `باقة #${i + 1}`}
                            </h4>
                            <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                              ${pkg.price || 0}
                            </span>
                          </div>
                        </div>

                        <button 
                          type="button" 
                          onClick={() => handleRemovePackage(i)} 
                          className="text-rose-500 hover:bg-rose-500/10 p-2 rounded-xl transition-colors cursor-pointer" 
                          title="حذف الباقة"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      {/* Package Names & Price */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <Input 
                          label="اسم الباقة بالعربية *" 
                          placeholder="مثال: الباقة الذهبية" 
                          value={pkg.name_ar || ''} 
                          onChange={(e) => handleUpdatePackage(i, 'name_ar', e.target.value)} 
                        />
                        <Input 
                          label="اسم الباقة بالإنجليزية" 
                          placeholder="e.g. Gold Package" 
                          value={pkg.name_en || ''} 
                          onChange={(e) => handleUpdatePackage(i, 'name_en', e.target.value)} 
                        />
                        <Input 
                          label="السعر ($) *" 
                          type="number" 
                          step="0.01" 
                          value={pkg.price || 0} 
                          onChange={(e) => handleUpdatePackage(i, 'price', e.target.value)} 
                        />
                      </div>

                      {/* Notes */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Input 
                          label="ملاحظة أو ميزة الباقة بالعربية" 
                          placeholder="مثال: تشمل دعم ومراجعة شهرية" 
                          value={pkg.note_ar || ''} 
                          onChange={(e) => handleUpdatePackage(i, 'note_ar', e.target.value)} 
                        />
                        <Input 
                          label="ملاحظة أو ميزة الباقة بالإنجليزية" 
                          placeholder="e.g. Includes monthly live mentor calls" 
                          value={pkg.note_en || ''} 
                          onChange={(e) => handleUpdatePackage(i, 'note_en', e.target.value)} 
                        />
                      </div>

                      {/* Included Features Checklist */}
                      <div className="pt-2 space-y-2.5">
                        <p className="text-xs font-black text-on-surface">صلاحيات ومشتملات هذه الباقة:</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          <label className={`flex items-center gap-2.5 p-3 rounded-2xl border transition-all cursor-pointer ${
                            pkg.includes_course_content ? 'bg-primary/10 border-primary/40 text-primary font-bold' : 'bg-surface border-outline-variant/30 text-on-surface'
                          }`}>
                            <input 
                              type="checkbox" 
                              checked={pkg.includes_course_content} 
                              onChange={(e) => handleUpdatePackage(i, 'includes_course_content', e.target.checked)} 
                              className="text-primary rounded-md w-4 h-4" 
                            />
                            <span className="text-xs">المحاضرات الأساسية</span>
                          </label>

                          <label className={`flex items-center gap-2.5 p-3 rounded-2xl border transition-all cursor-pointer ${
                            pkg.includes_flashcards ? 'bg-primary/10 border-primary/40 text-primary font-bold' : 'bg-surface border-outline-variant/30 text-on-surface'
                          }`}>
                            <input 
                              type="checkbox" 
                              checked={pkg.includes_flashcards} 
                              onChange={(e) => handleUpdatePackage(i, 'includes_flashcards', e.target.checked)} 
                              className="text-primary rounded-md w-4 h-4" 
                            />
                            <span className="text-xs">الفلاش كارد المربوط</span>
                          </label>

                          <label className={`flex items-center gap-2.5 p-3 rounded-2xl border transition-all cursor-pointer ${
                            pkg.includes_question_banks ? 'bg-primary/10 border-primary/40 text-primary font-bold' : 'bg-surface border-outline-variant/30 text-on-surface'
                          }`}>
                            <input 
                              type="checkbox" 
                              checked={pkg.includes_question_banks} 
                              onChange={(e) => handleUpdatePackage(i, 'includes_question_banks', e.target.checked)} 
                              className="text-primary rounded-md w-4 h-4" 
                            />
                            <span className="text-xs">بنك الأسئلة المربوط</span>
                          </label>

                          <label className={`flex items-center gap-2.5 p-3 rounded-2xl border transition-all cursor-pointer ${
                            pkg.includes_self_assessments ? 'bg-primary/10 border-primary/40 text-primary font-bold' : 'bg-surface border-outline-variant/30 text-on-surface'
                          }`}>
                            <input 
                              type="checkbox" 
                              checked={pkg.includes_self_assessments} 
                              onChange={(e) => handleUpdatePackage(i, 'includes_self_assessments', e.target.checked)} 
                              className="text-primary rounded-md w-4 h-4" 
                            />
                            <span className="text-xs">التقييم الذاتي المربوط</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}



        {/* -----------------------------------------------------------------------
            8. COURSE REVIEWS TAB
           ----------------------------------------------------------------------- */}
        {activeTab === 'course_reviews' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between bg-surface-container-low/60 p-5 rounded-3xl border border-outline-variant/40">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
                  <Star size={22} />
                </div>
                <div>
                  <h3 className="font-black text-on-surface text-lg">تقييمات ومراجعات الكورس</h3>
                  <p className="text-xs text-on-surface-variant">الاطلاع على تقييمات الطلاب الشاملة والموافقة على إظهارها في الصفحة</p>
                </div>
              </div>
            </div>

            {!course?.id ? (
              <div className="p-8 text-center rounded-3xl border-2 border-dashed border-outline-variant/40 bg-surface-container-low/30 space-y-3">
                <AlertCircle size={32} className="mx-auto text-amber-500" />
                <h4 className="text-sm font-black text-on-surface">يرجى حفظ الكورس أولاً</h4>
                <p className="text-xs text-on-surface-variant max-w-sm mx-auto">لعرض وإدارة التقييمات، يجب حفظ الكورس والبدء في استلام المراجعات.</p>
              </div>
            ) : courseReviewsLoading ? (
              <div className="py-16 flex justify-center"><Loader2 size={32} className="animate-spin text-primary" /></div>
            ) : courseReviewsList.length === 0 ? (
              <div className="text-center py-16 px-4 border-2 border-dashed border-outline-variant/40 rounded-3xl bg-surface-container-low/30 space-y-2">
                <p className="text-sm font-black text-on-surface">لا توجد تقييمات للكورس حتى الآن.</p>
                <p className="text-xs text-on-surface-variant">ستظهر تقييمات وآراء الطلاب هنا فور إضافتها من قبل المشتركين.</p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-3xl border border-outline-variant/40 bg-surface-container-low/70 shadow-sm">
                <table className="w-full text-start text-xs sm:text-sm">
                  <thead className="bg-surface-container-low/90 border-b border-outline-variant/30 text-on-surface-variant">
                    <tr>
                      <th className="p-4 text-start font-black">الطالب</th>
                      <th className="p-4 text-start font-black">التقييم</th>
                      <th className="p-4 text-start font-black">التعليق</th>
                      <th className="p-4 text-start font-black">الحالة</th>
                      <th className="p-4 text-center font-black">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/20">
                    {courseReviewsList.map(r => (
                      <tr key={r.id} className="hover:bg-surface/60 transition-colors">
                        <td className="p-4 font-black text-on-surface">
                          <div className="flex items-center gap-2.5">
                            <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-black text-xs uppercase shadow-sm">
                              {r.user?.name ? r.user.name.charAt(0) : 'S'}
                            </span>
                            <span>{r.user?.name || 'طالب'}</span>
                          </div>
                        </td>
                        <td className="p-4 font-black text-amber-500">
                          {'★'.repeat(r.rating || 5)}{'☆'.repeat(5 - (r.rating || 5))} 
                          <span className="text-xs text-on-surface-variant font-medium mr-1.5">({r.rating}/5)</span>
                        </td>
                        <td className="p-4 text-on-surface max-w-xs truncate">{r.review_text || '—'}</td>
                        <td className="p-4">
                          {r.is_approved ? <Badge text="مقبول / معروض" variant="success" /> : <Badge text="مرفوض / مخفي" variant="danger" />}
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button 
                              type="button" 
                              onClick={() => handleToggleCourseReview(r.id)} 
                              className={`px-3 py-1.5 rounded-xl font-black transition-colors text-xs flex items-center gap-1 cursor-pointer ${
                                r.is_approved ? 'bg-amber-500/10 text-amber-600 hover:bg-amber-500 hover:text-white' : 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500 hover:text-white'
                              }`}
                            >
                              {r.is_approved ? 'إخفاء التقييم' : 'موافقة وقبول'}
                            </button>
                            <button 
                              type="button" 
                              onClick={() => handleDeleteCourseReview(r.id)} 
                              className="p-2 rounded-xl text-rose-500 hover:bg-rose-500/10 cursor-pointer" 
                              title="حذف"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* -----------------------------------------------------------------------
            9. LESSON REVIEWS TAB
           ----------------------------------------------------------------------- */}
        {activeTab === 'lesson_reviews' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between bg-surface-container-low/60 p-5 rounded-3xl border border-outline-variant/40">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-secondary/10 text-secondary flex items-center justify-center font-bold">
                  <MessageSquare size={22} />
                </div>
                <div>
                  <h3 className="font-black text-on-surface text-lg">تقييمات الدروس والمحاضرات</h3>
                  <p className="text-xs text-on-surface-variant">مراجعة تقييمات الطلاب لكل درس على حدة لمتابعة جودة المحتوى</p>
                </div>
              </div>
            </div>

            {!course?.id ? (
              <div className="p-8 text-center rounded-3xl border-2 border-dashed border-outline-variant/40 bg-surface-container-low/30 space-y-3">
                <AlertCircle size={32} className="mx-auto text-amber-500" />
                <h4 className="text-sm font-black text-on-surface">يرجى حفظ الكورس أولاً</h4>
                <p className="text-xs text-on-surface-variant max-w-sm mx-auto">لعرض تقييمات الدروس، يجب حفظ الكورس والبدء في تلقي التعليقات.</p>
              </div>
            ) : lessonReviewsLoading ? (
              <div className="py-16 flex justify-center"><Loader2 size={32} className="animate-spin text-primary" /></div>
            ) : lessonReviewsList.length === 0 ? (
              <div className="text-center py-16 px-4 border-2 border-dashed border-outline-variant/40 rounded-3xl bg-surface-container-low/30 space-y-2">
                <p className="text-sm font-black text-on-surface">لا توجد تقييمات للدروس حتى الآن.</p>
                <p className="text-xs text-on-surface-variant">عندما يترك الطلاب تقييماً لدرس معين داخل الكورس، سيظهر هنا مباشرة.</p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-3xl border border-outline-variant/40 bg-surface-container-low/70 shadow-sm">
                <table className="w-full text-start text-xs sm:text-sm">
                  <thead className="bg-surface-container-low/90 border-b border-outline-variant/30 text-on-surface-variant">
                    <tr>
                      <th className="p-4 text-start font-black">الدرس</th>
                      <th className="p-4 text-start font-black">الطالب</th>
                      <th className="p-4 text-start font-black">التقييم</th>
                      <th className="p-4 text-start font-black">التعليق</th>
                      <th className="p-4 text-start font-black">الحالة</th>
                      <th className="p-4 text-center font-black">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/20">
                    {lessonReviewsList.map(r => (
                      <tr key={r.id} className="hover:bg-surface/60 transition-colors">
                        <td className="p-4 font-black text-primary">{r.Lesson?.title || 'درس'}</td>
                        <td className="p-4 font-black text-on-surface">
                          <div className="flex items-center gap-2.5">
                            <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-black text-xs uppercase shadow-sm">
                              {r.user?.name ? r.user.name.charAt(0) : 'S'}
                            </span>
                            <span>{r.user?.name || 'طالب'}</span>
                          </div>
                        </td>
                        <td className="p-4 font-black text-amber-500">
                          {'★'.repeat(r.rating || 5)}{'☆'.repeat(5 - (r.rating || 5))}
                          <span className="text-xs text-on-surface-variant font-medium mr-1.5">({r.rating}/5)</span>
                        </td>
                        <td className="p-4 text-on-surface max-w-xs truncate">{r.review_text || '—'}</td>
                        <td className="p-4">
                          {r.is_approved ? <Badge text="مقبول" variant="success" /> : <Badge text="مرفوض / مخفي" variant="danger" />}
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button 
                              type="button" 
                              onClick={() => handleToggleLessonReview(r.id)} 
                              className={`px-3 py-1.5 rounded-xl font-black transition-colors text-xs flex items-center gap-1 cursor-pointer ${
                                r.is_approved ? 'bg-amber-500/10 text-amber-600 hover:bg-amber-500 hover:text-white' : 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500 hover:text-white'
                              }`}
                            >
                              {r.is_approved ? 'إخفاء' : 'قبول'}
                            </button>
                            <button 
                              type="button" 
                              onClick={() => handleDeleteLessonReview(r.id)} 
                              className="p-2 rounded-xl text-rose-500 hover:bg-rose-500/10 cursor-pointer" 
                              title="حذف"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            BOTTOM FLOATING GLASS DOCK
           ========================================================================= */}
        {/* <div className="fixed bottom-4 left-0 right-0 z-40 px-4 max-w-5xl mx-auto pointer-events-none">
          <div className="pointer-events-auto p-3.5 sm:p-4 rounded-3xl bg-surface/90 border border-outline-variant/40 shadow-2xl backdrop-blur-2xl flex items-center justify-between gap-4">
            
            <div className="hidden sm:flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-black text-sm">
                <Sparkles size={20} />
              </div>
              <div className="space-y-0.5">
                <span className="text-xs font-black text-on-surface block truncate max-w-xs">
                  {form.title || 'كورس بدون عنوان'}
                </span>
                <span className="text-[11px] text-on-surface-variant font-medium block">
                  {sections.length} سكاشن • {packages.length} باقات • {faqs.length} أسئلة
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <button 
                type="button" 
                onClick={onBack}
                className="px-5 py-2.5 rounded-2xl border border-outline-variant/40 text-on-surface hover:bg-surface-variant/30 text-xs sm:text-sm font-black transition-all cursor-pointer"
              >
                {t('adminCourseForm.common.back') || 'إلغاء'}
              </button>

              <button
                type="submit"
                disabled={submitting}
                className="py-2.5 px-7 rounded-2xl bg-gradient-to-r from-primary via-primary-light to-primary text-white font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-primary/30 hover:shadow-primary/50 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer disabled:opacity-60"
              >
                {submitting ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                {isEditing ? (t('adminCourseForm.common.save') || 'حفظ كافة التعديلات') : (t('adminCourseForm.common.createNewCourse') || 'إنشاء الكورس الآن')}
              </button>
            </div>

          </div>
        </div> */}

      </form>

      {/* =========================================================================
          MODALS
         ========================================================================= */}
      
      {/* 1. Flashcard Modal */}
      <Modal open={showAddFlashcard} onClose={() => setShowAddFlashcard(false)} title={flashcardForm.id ? 'تعديل منتج الفلاش كارد' : 'إضافة منتج فلاش كارد للكورس'}>
        <form onSubmit={handleSaveFlashcard} className="space-y-4">
          <Input label="العنوان *" required value={flashcardForm.title} onChange={e => setFlashcardForm({ ...flashcardForm, title: e.target.value })} />
          <Textarea label="الوصف" value={flashcardForm.description} onChange={e => setFlashcardForm({ ...flashcardForm, description: e.target.value })} />
          <Input label="السعر ($)" type="number" step="0.01" min="0" required value={flashcardForm.price} onChange={e => setFlashcardForm({ ...flashcardForm, price: e.target.value })} />
          <label className="flex items-center gap-2.5 p-3 rounded-2xl bg-surface border border-outline-variant/30 text-sm font-bold text-on-surface cursor-pointer">
            <input type="checkbox" id="fc_active" checked={flashcardForm.is_active} onChange={e => setFlashcardForm({ ...flashcardForm, is_active: e.target.checked })} className="w-4 h-4 rounded text-primary" />
            <span>منتج نشط ومتاح للطلاب في المنصة</span>
          </label>
          <div className="pt-4 border-t border-outline-variant/30 flex justify-end gap-3">
            <button type="button" onClick={() => setShowAddFlashcard(false)} className="px-4 py-2 text-sm font-bold text-on-surface-variant hover:text-on-surface cursor-pointer">إلغاء</button>
            <SubmitBtn loading={submittingFlashcard} label="حفظ" />
          </div>
        </form>
      </Modal>

      {/* 2. Question Bank Modal */}
      <Modal open={showAddQB} onClose={() => setShowAddQB(false)} title={qbForm.id ? 'تعديل بنك الأسئلة' : 'إضافة بنك أسئلة للكورس'}>
        <form onSubmit={handleSaveQB} className="space-y-4">
          <Input label="عنوان بنك الأسئلة *" required value={qbForm.title} onChange={e => setQbForm({ ...qbForm, title: e.target.value })} />
          <Textarea label="الوصف" value={qbForm.description} onChange={e => setQbForm({ ...qbForm, description: e.target.value })} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="السعر ($)" type="number" step="0.01" min="0" value={qbForm.price} onChange={e => setQbForm({ ...qbForm, price: e.target.value })} disabled={qbForm.is_free} />
            <div className="flex items-center gap-2 mt-6">
              <input type="checkbox" id="form_qb_free" checked={qbForm.is_free} onChange={e => setQbForm({ ...qbForm, is_free: e.target.checked, price: e.target.checked ? 0 : qbForm.price })} className="w-4 h-4 cursor-pointer" />
              <label htmlFor="form_qb_free" className="text-sm font-bold text-on-surface cursor-pointer">مجاني للجميع</label>
            </div>
          </div>
          <Select label="الحالة" value={qbForm.status} onChange={e => setQbForm({ ...qbForm, status: e.target.value })}>
            <option value="published">منشور</option>
            <option value="draft">مسودة</option>
            <option value="archived">مؤرشف</option>
          </Select>
          <div className="pt-4 border-t border-outline-variant/30 flex justify-end gap-3">
            <button type="button" onClick={() => setShowAddQB(false)} className="px-4 py-2 text-sm font-bold text-on-surface-variant hover:text-on-surface cursor-pointer">إلغاء</button>
            <SubmitBtn loading={submittingQB} label="حفظ" />
          </div>
        </form>
      </Modal>

      {/* 3. Self Assessment Modal */}
      <Modal open={showAddSA} onClose={() => setShowAddSA(false)} title={saForm.id ? 'تعديل التقييم الذاتي' : 'إضافة تقييم ذاتي للكورس'}>
        <form onSubmit={handleSaveSA} className="space-y-4">
          <Input label="عنوان التقييم الذاتي *" required value={saForm.title} onChange={e => setSaForm({ ...saForm, title: e.target.value })} />
          <Textarea label="الوصف" value={saForm.description} onChange={e => setSaForm({ ...saForm, description: e.target.value })} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="المدة (بالدقائق)" type="number" min="1" value={saForm.duration_minutes} onChange={e => setSaForm({ ...saForm, duration_minutes: e.target.value })} />
            <Input label="السعر ($)" type="number" step="0.01" min="0" value={saForm.price} onChange={e => setSaForm({ ...saForm, price: e.target.value })} disabled={saForm.is_free} />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="form_sa_free" checked={saForm.is_free} onChange={e => setSaForm({ ...saForm, is_free: e.target.checked, price: e.target.checked ? 0 : saForm.price })} className="w-4 h-4 cursor-pointer" />
            <label htmlFor="form_sa_free" className="text-sm font-bold text-on-surface cursor-pointer">مجاني للجميع</label>
          </div>
          <Select label="الحالة" value={saForm.status} onChange={e => setSaForm({ ...saForm, status: e.target.value })}>
            <option value="published">منشور</option>
            <option value="draft">مسودة</option>
            <option value="archived">مؤرشف</option>
          </Select>
          <div className="pt-4 border-t border-outline-variant/30 flex justify-end gap-3">
            <button type="button" onClick={() => setShowAddSA(false)} className="px-4 py-2 text-sm font-bold text-on-surface-variant hover:text-on-surface cursor-pointer">إلغاء</button>
            <SubmitBtn loading={submittingSA} label="حفظ" />
          </div>
        </form>
      </Modal>

      {/* =========================================================================
          MANAGERS
         ========================================================================= */}
      {manageCardsFor && (
        <FlashcardsManager 
          product={manageCardsFor} 
          onClose={() => setManageCardsFor(null)} 
          showMsg={showMsg} 
        />
      )}

      {manageQBQuestionsFor && (
        <QuestionsManager 
          target={{ ...manageQBQuestionsFor, type: 'question_bank_product' }} 
          onClose={() => setManageQBQuestionsFor(null)} 
          showMsg={showMsg} 
          onUpdate={fetchCourseQBProducts} 
        />
      )}

      {manageSAQuestionsFor && (
        <QuestionsManager 
          target={{ ...manageSAQuestionsFor, type: 'self_assessment_product' }} 
          onClose={() => setManageSAQuestionsFor(null)} 
          showMsg={showMsg} 
          onUpdate={fetchCourseSAProducts} 
        />
      )}

    </div>
  );
}
