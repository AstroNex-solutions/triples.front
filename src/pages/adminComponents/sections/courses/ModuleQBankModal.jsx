import React, { useState, useEffect } from 'react';
import { Modal, Input, Textarea, SubmitBtn } from '../../ui/SharedUI';
import { 
  Database, Plus, Trash2, Edit3, Image as ImageIcon, ArrowLeft, ArrowRight, 
  FileSpreadsheet, Upload, Download, CheckCircle2, HelpCircle, Layers, 
  Search, Loader2, Sparkles, ChevronDown, ChevronUp, AlertCircle, X, Check
} from 'lucide-react';
import API from '../../../../api/axios';
import { useTranslation } from 'react-i18next';

export default function ModuleQBankModal({ show, onClose, module, course, showMsg }) {
  const { i18n } = useTranslation();
  const isRTL = i18n.language !== 'en';

  // Navigation: 'chapters' or 'questions'
  const [currentView, setCurrentView] = useState('chapters');
  const [selectedChapter, setSelectedChapter] = useState(null);

  // Chapters State
  const [chapters, setChapters] = useState([]);
  const [loadingChapters, setLoadingChapters] = useState(true);
  const [chapterSearch, setChapterSearch] = useState('');

  // Questions State
  const [questions, setQuestions] = useState([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [questionSearch, setQuestionSearch] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [expandedExplanations, setExpandedExplanations] = useState({});

  // Chapter Modals
  const [showAddChapter, setShowAddChapter] = useState(false);
  const [showEditChapter, setShowEditChapter] = useState(null);
  const [chapterToDelete, setChapterToDelete] = useState(null);
  const [chapterForm, setChapterForm] = useState({ title: '', description: '', order: 1 });
  const [submittingChapter, setSubmittingChapter] = useState(false);

  // Question Modals
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [showEditQuestion, setShowEditQuestion] = useState(null);
  const [questionToDelete, setQuestionToDelete] = useState(null);
  const [submittingQuestion, setSubmittingQuestion] = useState(false);
  const [questionForm, setQuestionForm] = useState({
    question_text: '',
    topic: '',
    difficulty_level: 'medium',
    options: ['', '', '', ''],
    correct_answer: '',
    explanation: '',
    hint: '',
    image: null
  });

  // Excel Import Modal
  const [showImportModal, setShowImportModal] = useState(false);
  const [importTargetChapter, setImportTargetChapter] = useState(null); // null = entire module, object = chapter
  const [excelFile, setExcelFile] = useState(null);
  const [uploadingExcel, setUploadingExcel] = useState(false);

  // Reset view on open/close
  useEffect(() => {
    if (show && module?.id) {
      setCurrentView('chapters');
      setSelectedChapter(null);
      fetchChapters();
    }
  }, [show, module?.id]);

  // Fetch Chapters
  const fetchChapters = async () => {
    setLoadingChapters(true);
    try {
      const res = await API.get(`/admin/modules/${module.id}/qbank-chapters`);
      setChapters(res.data.chapters || []);
    } catch (err) {
      showMsg('error', 'فشل في جلب فصول بنك الأسئلة');
    } finally {
      setLoadingChapters(false);
    }
  };

  // Fetch Questions for Selected Chapter
  const fetchChapterQuestions = async (chapterId) => {
    setLoadingQuestions(true);
    try {
      const res = await API.get(`/admin/qbank-chapters/${chapterId}/questions`);
      setQuestions(res.data.questions || []);
    } catch (err) {
      showMsg('error', 'فشل في جلب أسئلة الفصل');
    } finally {
      setLoadingQuestions(false);
    }
  };

  const handleOpenChapter = (chapter) => {
    setSelectedChapter(chapter);
    setCurrentView('questions');
    fetchChapterQuestions(chapter.id);
  };

  const handleBackToChapters = () => {
    setCurrentView('chapters');
    setSelectedChapter(null);
    fetchChapters();
  };

  // ═══════════════════════════════════════════
  // Chapter Actions
  // ═══════════════════════════════════════════
  const handleSaveChapter = async (e) => {
    e.preventDefault();
    if (!chapterForm.title.trim()) return showMsg('error', 'يرجى كتابة عنوان الفصل');
    setSubmittingChapter(true);
    try {
      if (showEditChapter) {
        await API.put(`/admin/qbank-chapters/${showEditChapter.id}`, chapterForm);
        showMsg('success', 'تم تعديل الفصل بنجاح');
      } else {
        await API.post(`/admin/modules/${module.id}/qbank-chapters`, {
          ...chapterForm,
          order: chapterForm.order || chapters.length + 1
        });
        showMsg('success', 'تمت إضافة الفصل بنجاح');
      }
      setShowAddChapter(false);
      setShowEditChapter(null);
      setChapterForm({ title: '', description: '', order: 1 });
      fetchChapters();
    } catch (err) {
      showMsg('error', err.response?.data?.message || 'خطأ في حفظ الفصل');
    } finally {
      setSubmittingChapter(false);
    }
  };

  const handleDeleteChapter = async () => {
    if (!chapterToDelete) return;
    setSubmittingChapter(true);
    try {
      await API.delete(`/admin/qbank-chapters/${chapterToDelete.id}`);
      showMsg('success', 'تم حذف الفصل وأسئلته بنجاح');
      setChapterToDelete(null);
      fetchChapters();
    } catch (err) {
      showMsg('error', err.response?.data?.message || 'خطأ في حذف الفصل');
    } finally {
      setSubmittingChapter(false);
    }
  };

  // ═══════════════════════════════════════════
  // Question Form Helpers
  // ═══════════════════════════════════════════
  const resetQuestionForm = () => {
    setQuestionForm({
      question_text: '',
      topic: '',
      difficulty_level: 'medium',
      options: ['', '', '', ''],
      correct_answer: '',
      explanation: '',
      hint: '',
      image: null
    });
  };

  const handleOptionChange = (idx, value) => {
    const updated = [...questionForm.options];
    const prevVal = updated[idx];
    updated[idx] = value;
    
    // If the changed option was the correct answer, update correct answer too
    let updatedCorrect = questionForm.correct_answer;
    if (updatedCorrect === prevVal) {
      updatedCorrect = value;
    }

    setQuestionForm({
      ...questionForm,
      options: updated,
      correct_answer: updatedCorrect
    });
  };

  const handleAddOptionField = () => {
    if (questionForm.options.length < 6) {
      setQuestionForm({
        ...questionForm,
        options: [...questionForm.options, '']
      });
    }
  };

  const handleRemoveOptionField = (idx) => {
    if (questionForm.options.length <= 2) return;
    const removedVal = questionForm.options[idx];
    const updated = questionForm.options.filter((_, i) => i !== idx);
    let updatedCorrect = questionForm.correct_answer;
    if (updatedCorrect === removedVal) {
      updatedCorrect = updated[0] || '';
    }
    setQuestionForm({
      ...questionForm,
      options: updated,
      correct_answer: updatedCorrect
    });
  };

  const handleSaveQuestion = async (e) => {
    e.preventDefault();
    if (!questionForm.question_text.trim()) {
      return showMsg('error', 'يرجى إدخال نص السؤال');
    }
    const filteredOptions = questionForm.options.filter(o => o.trim() !== '');
    if (filteredOptions.length < 2) {
      return showMsg('error', 'يجب إدخال خيارين على الأقل');
    }
    if (!questionForm.correct_answer || !filteredOptions.includes(questionForm.correct_answer)) {
      return showMsg('error', 'يجب تحديد الإجابة الصحيحة من بين الخيارات المتاحة');
    }

    setSubmittingQuestion(true);
    try {
      const formData = new FormData();
      formData.append('question_text', questionForm.question_text);
      formData.append('options', JSON.stringify(filteredOptions));
      formData.append('correct_answer', questionForm.correct_answer);
      formData.append('difficulty_level', questionForm.difficulty_level);
      if (questionForm.topic) formData.append('topic', questionForm.topic);
      if (questionForm.explanation) formData.append('explanation', questionForm.explanation);
      if (questionForm.hint) formData.append('hint', questionForm.hint);
      if (questionForm.image instanceof File) formData.append('image', questionForm.image);

      if (showEditQuestion) {
        await API.put(`/admin/qbank-questions/${showEditQuestion.id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        showMsg('success', 'تم تحديث السؤال بنجاح');
      } else {
        await API.post(`/admin/qbank-chapters/${selectedChapter.id}/questions`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        showMsg('success', 'تمت إضافة السؤال بنجاح');
      }

      setShowAddQuestion(false);
      setShowEditQuestion(null);
      resetQuestionForm();
      fetchChapterQuestions(selectedChapter.id);
    } catch (err) {
      showMsg('error', err.response?.data?.message || 'خطأ في حفظ السؤال');
    } finally {
      setSubmittingQuestion(false);
    }
  };

  const handleDeleteQuestion = async () => {
    if (!questionToDelete) return;
    setSubmittingQuestion(true);
    try {
      await API.delete(`/admin/qbank-questions/${questionToDelete.id}`);
      showMsg('success', 'تم حذف السؤال بنجاح');
      setQuestionToDelete(null);
      fetchChapterQuestions(selectedChapter.id);
    } catch (err) {
      showMsg('error', err.response?.data?.message || 'خطأ في حذف السؤال');
    } finally {
      setSubmittingQuestion(false);
    }
  };

  // ═══════════════════════════════════════════
  // Excel Import & Template Download
  // ═══════════════════════════════════════════
  const handleDownloadTemplate = async () => {
    try {
      const response = await API.get('/admin/qbank/template', {
        responseType: 'blob'
      });
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'question_bank_template.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      showMsg('error', 'حدث خطأ أثناء تحميل ملف النموذج');
    }
  };

  const handleUploadExcel = async (e) => {
    e.preventDefault();
    if (!excelFile) {
      return showMsg('error', 'يرجى اختيار ملف Excel أولاً');
    }

    setUploadingExcel(true);
    const formData = new FormData();
    formData.append('file', excelFile);

    try {
      let endpoint = `/admin/modules/${module.id}/qbank/import-excel`;
      if (importTargetChapter?.id) {
        endpoint = `/admin/qbank-chapters/${importTargetChapter.id}/import-excel`;
      }

      const res = await API.post(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      showMsg('success', res.data.message || 'تم استيراد الأسئلة بنجاح');
      setShowImportModal(false);
      setExcelFile(null);

      // Refresh current view
      if (currentView === 'questions' && selectedChapter?.id) {
        fetchChapterQuestions(selectedChapter.id);
      } else {
        fetchChapters();
      }
    } catch (err) {
      showMsg('error', err.response?.data?.message || 'فشل في استيراد ملف الإكسيل');
    } finally {
      setUploadingExcel(false);
    }
  };

  // Filters
  const filteredChapters = chapters.filter(c =>
    (c.title || '').toLowerCase().includes(chapterSearch.toLowerCase()) ||
    (c.description || '').toLowerCase().includes(chapterSearch.toLowerCase())
  );

  const filteredQuestions = questions.filter(q => {
    const matchSearch = (q.question_text || '').toLowerCase().includes(questionSearch.toLowerCase()) ||
      (q.topic || '').toLowerCase().includes(questionSearch.toLowerCase());
    const matchDiff = difficultyFilter === 'all' || q.difficulty_level === difficultyFilter;
    return matchSearch && matchDiff;
  });

  const totalModuleQuestions = chapters.reduce((acc, c) => acc + (c.questions_count || 0), 0);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex justify-center items-center p-3 sm:p-6 overflow-hidden">
      <div className="bg-surface border border-outline-variant/40 w-full max-w-6xl h-[92vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* ═══════════════ MODAL HEADER ═══════════════ */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-outline-variant/30 bg-surface-container-low/40">
          <div className="flex items-center gap-3">
            {currentView === 'questions' ? (
              <button
                onClick={handleBackToChapters}
                className="p-2 rounded-xl bg-surface-container hover:bg-primary/10 hover:text-primary text-on-surface transition-all flex items-center gap-1.5 text-xs font-bold cursor-pointer"
                title="الرجوع إلى الفصول"
              >
                {isRTL ? <ArrowRight size={18} /> : <ArrowLeft size={18} />}
                <span>الفصول</span>
              </button>
            ) : (
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0 border border-indigo-500/20">
                <Database size={20} />
              </div>
            )}

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-extrabold text-on-surface">
                  {currentView === 'questions' 
                    ? selectedChapter?.title 
                    : `بنك أسئلة الموديول: ${module?.name}`}
                </h2>
                {currentView === 'chapters' && (
                  <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 text-[11px] font-black border border-indigo-500/20">
                    {totalModuleQuestions} سؤال
                  </span>
                )}
                {currentView === 'questions' && (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 text-[11px] font-black border border-emerald-500/20">
                    {questions.length} سؤال بهذا الفصل
                  </span>
                )}
              </div>
              <p className="text-xs text-on-surface-variant font-medium mt-0.5">
                {currentView === 'questions'
                  ? `إدارة أسئلة فصل "${selectedChapter?.title}" - موديول: ${module?.name}`
                  : 'قسم بنك الأسئلة إلى فصول وأضف أسئلة أو استورد ملفات إكسيل مباشرة'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-surface-container-low hover:bg-rose-500/10 hover:text-rose-500 text-on-surface-variant transition-colors cursor-pointer"
              title="إغلاق"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* ═══════════════ MODAL CONTENT ═══════════════ */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar bg-background/50">
          
          {/* ──────────────── VIEW 1: CHAPTERS LIST ──────────────── */}
          {currentView === 'chapters' && (
            <div className="space-y-6">
              
              {/* Actions Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="relative flex-1 max-w-md">
                  <Search size={16} className="absolute left-3.5 rtl:left-auto rtl:right-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant/50" />
                  <input
                    type="text"
                    value={chapterSearch}
                    onChange={e => setChapterSearch(e.target.value)}
                    placeholder="ابحث في الفصول..."
                    className="w-full bg-surface border border-outline-variant/30 rounded-2xl py-2 pl-4 pr-10 rtl:pl-10 rtl:pr-4 text-xs font-semibold text-on-surface focus:outline-none focus:border-indigo-500 transition-all"
                  />
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => {
                      setChapterForm({ title: '', description: '', order: chapters.length + 1 });
                      setShowAddChapter(true);
                    }}
                    className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Plus size={16} />
                    <span>إضافة فصل جديد</span>
                  </button>
                </div>
              </div>

              {/* Chapters List / Grid */}
              {loadingChapters ? (
                <div className="py-24 text-center">
                  <Loader2 size={36} className="animate-spin text-indigo-500 mx-auto mb-3" />
                  <p className="text-xs font-bold text-on-surface-variant">جاري تحميل فصول بنك الأسئلة...</p>
                </div>
              ) : filteredChapters.length === 0 ? (
                <div className="py-16 text-center border-2 border-dashed border-outline-variant/40 rounded-3xl bg-surface-container-low/20">
                  <div className="w-16 h-16 rounded-3xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mx-auto mb-4 border border-indigo-500/20">
                    <Layers size={32} />
                  </div>
                  <h3 className="text-base font-bold text-on-surface">لا توجد فصول لبنك الأسئلة بعد</h3>
                  <p className="text-xs text-on-surface-variant max-w-sm mx-auto mt-1 mb-6">
                    قم بإضافة فصول للموديول ثم ضع أسئلة بداخل كل فصل، أو استورد ملف Excel جاهزاً مباشرة.
                  </p>
                  <div className="flex items-center justify-center gap-3">
                    <button
                      onClick={() => setShowAddChapter(true)}
                      className="px-4 py-2 bg-indigo-600 text-white font-bold text-xs rounded-xl shadow-sm hover:bg-indigo-700 transition-all cursor-pointer"
                    >
                      إضافة أول فصل
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredChapters.map((ch, idx) => (
                    <div
                      key={ch.id}
                      className="group bg-surface rounded-3xl border border-outline-variant/30 hover:border-indigo-500/40 p-5 flex flex-col justify-between transition-all duration-200 hover:shadow-lg relative overflow-hidden"
                    >
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-indigo-400 opacity-60 group-hover:opacity-100 transition-opacity" />

                      <div>
                        {/* Top Meta */}
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <span className="w-7 h-7 rounded-lg bg-surface-container font-mono font-black text-xs text-on-surface-variant flex items-center justify-center border border-outline-variant/20">
                            {idx + 1}
                          </span>
                          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 border border-indigo-500/20 flex items-center gap-1">
                            <Database size={11} /> {ch.questions_count || 0} أسئلة
                          </span>
                        </div>

                        {/* Title & Desc */}
                        <h3 className="font-extrabold text-on-surface text-base mb-1 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                          {ch.title}
                        </h3>
                        {ch.description && (
                          <p className="text-xs text-on-surface-variant line-clamp-2 leading-relaxed mb-4">
                            {ch.description}
                          </p>
                        )}
                      </div>

                      {/* Card Footer Actions */}
                      <div className="pt-4 border-t border-outline-variant/20 mt-4 flex items-center justify-between gap-2">
                        <button
                          onClick={() => handleOpenChapter(ch)}
                          className="flex-1 py-2 px-3 bg-indigo-500/10 hover:bg-indigo-600 hover:text-white text-indigo-600 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <span>عرض وإدارة الأسئلة</span>
                          {isRTL ? <ArrowLeft size={14} /> : <ArrowRight size={14} />}
                        </button>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              setImportTargetChapter(ch);
                              setShowImportModal(true);
                            }}
                            className="p-2 rounded-xl bg-surface-container hover:bg-emerald-500/10 hover:text-emerald-600 text-on-surface-variant transition-colors cursor-pointer"
                            title="استيراد Excel لهذا الفصل"
                          >
                            <FileSpreadsheet size={15} />
                          </button>
                          <button
                            onClick={() => {
                              setChapterForm({ title: ch.title, description: ch.description || '', order: ch.order || 1 });
                              setShowEditChapter(ch);
                            }}
                            className="p-2 rounded-xl bg-surface-container hover:bg-indigo-500/10 hover:text-indigo-600 text-on-surface-variant transition-colors cursor-pointer"
                            title="تعديل الفصل"
                          >
                            <Edit3 size={15} />
                          </button>
                          <button
                            onClick={() => setChapterToDelete(ch)}
                            className="p-2 rounded-xl bg-surface-container hover:bg-rose-500/10 hover:text-rose-600 text-on-surface-variant transition-colors cursor-pointer"
                            title="حذف الفصل"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ──────────────── VIEW 2: CHAPTER QUESTIONS ──────────────── */}
          {currentView === 'questions' && selectedChapter && (
            <div className="space-y-6">
              
              {/* Actions & Filters Bar */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-surface p-4 rounded-2xl border border-outline-variant/30">
                <div className="flex items-center gap-2 flex-1">
                  <div className="relative flex-1">
                    <Search size={16} className="absolute left-3.5 rtl:left-auto rtl:right-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant/50" />
                    <input
                      type="text"
                      value={questionSearch}
                      onChange={e => setQuestionSearch(e.target.value)}
                      placeholder="ابحث في نص السؤال أو الموضوع..."
                      className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl py-2 pl-4 pr-10 rtl:pl-10 rtl:pr-4 text-xs font-semibold text-on-surface focus:outline-none focus:border-indigo-500 transition-all"
                    />
                  </div>

                  <select
                    value={difficultyFilter}
                    onChange={e => setDifficultyFilter(e.target.value)}
                    className="bg-surface-container-low border border-outline-variant/30 rounded-xl py-2 px-3 text-xs font-bold text-on-surface focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="all">جميع المستويات</option>
                    <option value="easy">سهل (Easy)</option>
                    <option value="medium">متوسط (Medium)</option>
                    <option value="hard">صعب (Hard)</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setImportTargetChapter(selectedChapter);
                      setShowImportModal(true);
                    }}
                    className="px-3.5 py-2 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500 hover:text-white border border-emerald-500/30 text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <FileSpreadsheet size={15} />
                    <span>استيراد Excel لهذا الفصل</span>
                  </button>

                  <button
                    onClick={() => {
                      resetQuestionForm();
                      setShowAddQuestion(true);
                    }}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus size={16} />
                    <span>إضافة سؤال جديد</span>
                  </button>
                </div>
              </div>

              {/* Questions List */}
              {loadingQuestions ? (
                <div className="py-24 text-center">
                  <Loader2 size={36} className="animate-spin text-indigo-500 mx-auto mb-3" />
                  <p className="text-xs font-bold text-on-surface-variant">جاري تحميل الأسئلة...</p>
                </div>
              ) : filteredQuestions.length === 0 ? (
                <div className="py-16 text-center border-2 border-dashed border-outline-variant/40 rounded-3xl bg-surface-container-low/20">
                  <HelpCircle size={40} className="mx-auto text-indigo-400 mb-3" />
                  <h3 className="text-base font-bold text-on-surface">لا توجد أسئلة في هذا الفصل بعد</h3>
                  <p className="text-xs text-on-surface-variant max-w-sm mx-auto mt-1 mb-6">
                    أضف أول سؤال يدوياً أو استورد ملف Excel الخاص بهذا الفصل مباشرة.
                  </p>
                  <div className="flex items-center justify-center gap-3">
                    <button
                      onClick={() => {
                        resetQuestionForm();
                        setShowAddQuestion(true);
                      }}
                      className="px-4 py-2 bg-indigo-600 text-white font-bold text-xs rounded-xl shadow-sm hover:bg-indigo-700 transition-all cursor-pointer"
                    >
                      إضافة سؤال
                    </button>
                    <button
                      onClick={() => {
                        setImportTargetChapter(selectedChapter);
                        setShowImportModal(true);
                      }}
                      className="px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-sm hover:bg-emerald-700 transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <FileSpreadsheet size={15} /> استيراد Excel لهذا الفصل
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredQuestions.map((q, idx) => {
                    let parsedOptions = q.options;
                    if (parsedOptions && !Array.isArray(parsedOptions)) {
                      try { parsedOptions = JSON.parse(parsedOptions); } catch (e) { parsedOptions = []; }
                    }
                    if (!Array.isArray(parsedOptions)) parsedOptions = [];

                    const isExplanationOpen = !!expandedExplanations[q.id];

                    return (
                      <div
                        key={q.id}
                        className="p-5 bg-surface rounded-3xl border border-outline-variant/30 flex flex-col gap-4 shadow-sm hover:shadow-md transition-all"
                      >
                        {/* Header: Number, Stem, Tags, Actions */}
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            <span className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-600 font-mono font-black text-xs flex items-center justify-center shrink-0 border border-indigo-500/20 mt-0.5">
                              {idx + 1}
                            </span>
                            <div className="flex-1 min-w-0" dir="auto">
                              <div className="flex flex-wrap items-center gap-2 mb-2">
                                {q.topic && (
                                  <span className="px-2 py-0.5 rounded-lg bg-surface-container text-on-surface-variant font-bold text-[10px] border border-outline-variant/30">
                                    {q.topic}
                                  </span>
                                )}
                                <span className={`px-2 py-0.5 rounded-lg font-bold text-[10px] border ${
                                  q.difficulty_level === 'easy'
                                    ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                                    : q.difficulty_level === 'hard'
                                      ? 'bg-rose-500/10 text-rose-600 border-rose-500/20'
                                      : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                                }`}>
                                  {q.difficulty_level === 'easy' ? 'سهل' : q.difficulty_level === 'hard' ? 'صعب' : 'متوسط'}
                                </span>
                              </div>
                              <p className="font-extrabold text-on-surface text-sm sm:text-base leading-relaxed whitespace-pre-line">
                                {q.question_text}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              onClick={() => {
                                while (parsedOptions.length < 4) parsedOptions.push('');
                                setQuestionForm({
                                  question_text: q.question_text,
                                  topic: q.topic || '',
                                  difficulty_level: q.difficulty_level || 'medium',
                                  options: parsedOptions,
                                  correct_answer: q.correct_answer,
                                  explanation: q.explanation || '',
                                  hint: q.hint || '',
                                  image: q.image
                                });
                                setShowEditQuestion(q);
                              }}
                              className="p-2 rounded-xl bg-surface-container hover:bg-indigo-500/10 hover:text-indigo-600 text-on-surface-variant transition-colors cursor-pointer"
                              title="تعديل السؤال"
                            >
                              <Edit3 size={16} />
                            </button>
                            <button
                              onClick={() => setQuestionToDelete(q)}
                              className="p-2 rounded-xl bg-surface-container hover:bg-rose-500/10 hover:text-rose-600 text-on-surface-variant transition-colors cursor-pointer"
                              title="حذف السؤال"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>

                        {/* Optional Question Image */}
                        {q.image && (
                          <div className="mt-2">
                            <img
                              src={q.image.startsWith('http') ? q.image : `${API.defaults.baseURL?.replace('/api', '') || ''}${q.image}`}
                              alt="Question"
                              className="max-h-48 rounded-2xl border border-outline-variant/30 object-contain bg-black/5"
                            />
                          </div>
                        )}

                        {/* Options Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                          {parsedOptions.map((opt, optIdx) => {
                            const isCorrect = opt.trim() === (q.correct_answer || '').trim();
                            const letter = String.fromCharCode(65 + optIdx); // A, B, C, D...

                            return (
                              <div
                                key={optIdx}
                                className={`p-3 rounded-2xl border text-xs font-bold flex items-center gap-2.5 transition-all ${
                                  isCorrect
                                    ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-700 dark:text-emerald-300'
                                    : 'bg-surface-container-low/40 border-outline-variant/20 text-on-surface'
                                }`}
                                dir="auto"
                              >
                                <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black shrink-0 ${
                                  isCorrect ? 'bg-emerald-500 text-white' : 'bg-surface-container text-on-surface-variant'
                                }`}>
                                  {isCorrect ? <Check size={12} strokeWidth={3} /> : letter}
                                </span>
                                <span className="flex-1">{opt}</span>
                                {isCorrect && (
                                  <span className="text-[10px] font-black uppercase text-emerald-600 tracking-wider">
                                    الإجابة الصحيحة
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        {/* Explanation Toggle & Content */}
                        {(q.explanation || q.hint) && (
                          <div className="mt-2 pt-3 border-t border-outline-variant/20">
                            <button
                              onClick={() => setExpandedExplanations(prev => ({ ...prev, [q.id]: !prev[q.id] }))}
                              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1.5 cursor-pointer"
                            >
                              <span>{isExplanationOpen ? 'إخفاء الشرح والتلميح' : 'عرض الشرح والتلميح'}</span>
                              {isExplanationOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            </button>

                            {isExplanationOpen && (
                              <div className="mt-3 p-4 rounded-2xl bg-surface-container-low/60 border border-outline-variant/20 space-y-3 text-xs leading-relaxed animate-in fade-in duration-150">
                                {q.hint && (
                                  <div className="flex items-start gap-2 text-amber-700 dark:text-amber-400">
                                    <Sparkles size={14} className="shrink-0 mt-0.5" />
                                    <div>
                                      <strong className="block font-black mb-0.5">تلميح (Hint):</strong>
                                      <span>{q.hint}</span>
                                    </div>
                                  </div>
                                )}
                                {q.explanation && (
                                  <div>
                                    <strong className="block font-black text-on-surface mb-1">الشرح والتفسير:</strong>
                                    {/* Render HTML explanation or pre-line text */}
                                    <div
                                      className="prose prose-sm dark:prose-invert max-w-none text-on-surface-variant font-normal"
                                      dangerouslySetInnerHTML={{ __html: q.explanation }}
                                    />
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )}

                      </div>
                    );
                  })}
                </div>
              )}

            </div>
          )}

        </div>

        {/* ═══════════════ MODALS ═══════════════ */}

        {/* 1. Add / Edit Chapter Modal */}
        {(showAddChapter || showEditChapter) && (
          <Modal
            open={true}
            onClose={() => { setShowAddChapter(false); setShowEditChapter(null); }}
            title={showAddChapter ? 'إضافة فصل جديد' : 'تعديل الفصل'}
            size="md"
          >
            <form onSubmit={handleSaveChapter} className="space-y-4">
              <Input
                label="عنوان الفصل *"
                required
                placeholder="مثال: 1- Molecular Biology أو كيمياء الخلية"
                value={chapterForm.title}
                onChange={e => setChapterForm({ ...chapterForm, title: e.target.value })}
              />
              <Textarea
                label="وصف الفصل (اختياري)"
                placeholder="نبذة عن موضوعات هذا الفصل..."
                rows={3}
                value={chapterForm.description}
                onChange={e => setChapterForm({ ...chapterForm, description: e.target.value })}
              />
              <Input
                label="الترتيب"
                type="number"
                value={chapterForm.order}
                onChange={e => setChapterForm({ ...chapterForm, order: e.target.value })}
              />
              <SubmitBtn loading={submittingChapter} label={showAddChapter ? 'إضافة الفصل' : 'حفظ التعديلات'} />
            </form>
          </Modal>
        )}

        {/* 2. Delete Chapter Modal */}
        {chapterToDelete && (
          <Modal open={true} onClose={() => setChapterToDelete(null)} title="تأكيد حذف الفصل" size="sm">
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 flex items-center gap-3">
                <AlertCircle size={24} className="shrink-0" />
                <p className="text-xs font-bold leading-relaxed">
                  هل أنت متأكد من حذف فصل "{chapterToDelete.title}"؟ سيتم حذف جميع الأسئلة ({chapterToDelete.questions_count || 0} أسئلة) المرتبطة بهذا الفصل.
                </p>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setChapterToDelete(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold hover:bg-surface-variant/50 cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  onClick={handleDeleteChapter}
                  disabled={submittingChapter}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-500 text-white hover:bg-rose-600 cursor-pointer disabled:opacity-50"
                >
                  {submittingChapter ? 'جاري الحذف...' : 'نعم، احذف'}
                </button>
              </div>
            </div>
          </Modal>
        )}

        {/* 3. Add / Edit Question Modal */}
        {(showAddQuestion || showEditQuestion) && (
          <Modal
            open={true}
            onClose={() => { setShowAddQuestion(false); setShowEditQuestion(null); resetQuestionForm(); }}
            title={showAddQuestion ? `إضافة سؤال جديد (${selectedChapter?.title})` : 'تعديل السؤال'}
            size="4xl"
          >
            <form onSubmit={handleSaveQuestion} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1 custom-scrollbar">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="الموضوع الفرعي (Topic)"
                  placeholder="مثال: Chromatin and Epigenetics"
                  value={questionForm.topic}
                  onChange={e => setQuestionForm({ ...questionForm, topic: e.target.value })}
                />
                <div>
                  <label className="block text-xs font-bold text-on-surface mb-2">مستوى الصعوبة</label>
                  <select
                    value={questionForm.difficulty_level}
                    onChange={e => setQuestionForm({ ...questionForm, difficulty_level: e.target.value })}
                    className="w-full bg-surface-container-low border border-outline-variant/40 rounded-xl py-2.5 px-3 text-xs font-bold text-on-surface focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="easy">سهل (Easy)</option>
                    <option value="medium">متوسط (Medium)</option>
                    <option value="hard">صعب (Hard)</option>
                  </select>
                </div>
              </div>

              <Textarea
                label="نص السؤال *"
                required
                rows={4}
                placeholder="اكتب نص السؤال هنا..."
                value={questionForm.question_text}
                onChange={e => setQuestionForm({ ...questionForm, question_text: e.target.value })}
              />

              <div>
                <label className="block text-xs font-bold text-on-surface mb-2">صورة توضيحية للسؤال (اختياري)</label>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 px-4 py-2 bg-surface-container hover:bg-surface-container-high cursor-pointer rounded-xl text-xs font-bold transition-colors border border-outline-variant/30">
                    <ImageIcon size={16} /> اختيار صورة
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={e => {
                        if (e.target.files[0]) {
                          setQuestionForm({ ...questionForm, image: e.target.files[0] });
                        }
                      }}
                    />
                  </label>
                  {questionForm.image && (
                    <span className="text-xs text-indigo-600 font-bold truncate max-w-[250px]">
                      {questionForm.image instanceof File ? questionForm.image.name : 'صورة مرفقة مسبقاً'}
                    </span>
                  )}
                </div>
              </div>

              {/* Options Section */}
              <div className="pt-4 border-t border-outline-variant/20">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="text-sm font-bold text-on-surface">خيارات الإجابة *</h4>
                    <p className="text-[11px] text-on-surface-variant">اختر زر الراديو بجانب الإجابة الصحيحة</p>
                  </div>
                  {questionForm.options.length < 6 && (
                    <button
                      type="button"
                      onClick={handleAddOptionField}
                      className="px-3 py-1 bg-indigo-500/10 text-indigo-600 hover:bg-indigo-500 hover:text-white rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                    >
                      <Plus size={14} /> إضافة خيار
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  {questionForm.options.map((opt, i) => {
                    const letter = String.fromCharCode(65 + i);
                    const isSelected = questionForm.correct_answer !== '' && questionForm.correct_answer === opt && opt.trim() !== '';

                    return (
                      <div key={i} className="flex items-center gap-2">
                        <label className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border cursor-pointer font-bold text-xs transition-colors ${
                          isSelected ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-surface-container border-outline-variant/40 text-on-surface-variant'
                        }`}>
                          <input
                            type="radio"
                            name="correct_answer_radio"
                            className="hidden"
                            checked={isSelected}
                            onChange={() => {
                              if (opt.trim()) {
                                setQuestionForm({ ...questionForm, correct_answer: opt });
                              }
                            }}
                          />
                          {letter}
                        </label>

                        <input
                          type="text"
                          required
                          placeholder={`الخيار ${letter}`}
                          value={opt}
                          onChange={e => handleOptionChange(i, e.target.value)}
                          className={`flex-1 bg-surface-container-low border rounded-xl py-2 px-3 text-xs font-semibold text-on-surface focus:outline-none transition-all ${
                            isSelected ? 'border-emerald-500 ring-1 ring-emerald-500' : 'border-outline-variant/40 focus:border-indigo-500'
                          }`}
                        />

                        {questionForm.options.length > 2 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveOptionField(i)}
                            className="p-2 text-on-surface-variant/50 hover:text-rose-500 transition-colors"
                            title="حذف هذا الخيار"
                          >
                            <X size={16} />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Explanation & Hint */}
              <div className="pt-4 border-t border-outline-variant/20 space-y-4">
                <Textarea
                  label="تفسير وشرح الإجابة (Explanation)"
                  placeholder="اكتب التفسير العلمي للإجابة الصحيحة ولماذا بقية الخيارات غير صحيحة..."
                  rows={4}
                  value={questionForm.explanation}
                  onChange={e => setQuestionForm({ ...questionForm, explanation: e.target.value })}
                />

                <Input
                  label="تلميح للمتعلم (Hint)"
                  placeholder="تلميح يساعد الطالب في التفكير..."
                  value={questionForm.hint}
                  onChange={e => setQuestionForm({ ...questionForm, hint: e.target.value })}
                />
              </div>

              <SubmitBtn loading={submittingQuestion} label={showAddQuestion ? 'إضافة السؤال' : 'حفظ التعديلات'} />
            </form>
          </Modal>
        )}

        {/* 4. Delete Question Modal */}
        {questionToDelete && (
          <Modal open={true} onClose={() => setQuestionToDelete(null)} title="تأكيد حذف السؤال" size="sm">
            <div className="space-y-4">
              <p className="text-xs font-semibold text-on-surface leading-relaxed">
                هل أنت متأكد من حذف هذا السؤال نهائياً؟
              </p>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setQuestionToDelete(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold hover:bg-surface-variant/50 cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  onClick={handleDeleteQuestion}
                  disabled={submittingQuestion}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-500 text-white hover:bg-rose-600 cursor-pointer disabled:opacity-50"
                >
                  {submittingQuestion ? 'جاري الحذف...' : 'نعم، احذف'}
                </button>
              </div>
            </div>
          </Modal>
        )}

        {/* 5. Excel Import Modal */}
        {showImportModal && (
          <Modal
            open={true}
            onClose={() => { setShowImportModal(false); setExcelFile(null); }}
            title={importTargetChapter ? `استيراد أسئلة من Excel: فصل "${importTargetChapter.title}"` : 'استيراد أسئلة بنك الأسئلة من ملف Excel'}
            size="lg"
          >
            <form onSubmit={handleUploadExcel} className="space-y-5">
              
              {/* Info Box */}
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-xs space-y-2">
                <div className="flex items-center gap-2 font-black">
                  <CheckCircle2 size={16} />
                  <span>تنسيق الأعمدة المدعوم في ملف Excel:</span>
                </div>
                <p className="leading-relaxed opacity-90">
                  الأعمدة المعترف بها تلقائياً: <code>question</code>, <code>option_a</code>, <code>option_b</code>, <code>option_c</code>, <code>option_d</code>, <code>option_e</code>, <code>correct_option</code> (A/B/C/D), <code>explanation</code>, <code>hint</code>, <code>topic</code>, <code>difficulty</code>
                  {!importTargetChapter && <>, و <code>chapter</code> (لإنشاء الفصول تلقائياً وتوزيع الأسئلة عليها)</>}.
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleDownloadTemplate}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-lg font-bold text-[11px] hover:bg-emerald-700 transition-colors cursor-pointer"
                  >
                    <Download size={13} /> تحميل ملف Excel تجريبي فارغ
                  </button>
                </div>
              </div>

              {/* File Drop Area */}
              <div>
                <label className="block text-xs font-bold text-on-surface mb-2">اختر ملف Excel (.xlsx, .xls, .csv)</label>
                <label className="border-2 border-dashed border-outline-variant/40 hover:border-indigo-500/60 rounded-3xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors bg-surface-container-low/30 hover:bg-surface-container-low/60">
                  <FileSpreadsheet size={40} className="text-emerald-500 mb-3" />
                  <span className="text-sm font-bold text-on-surface">
                    {excelFile ? excelFile.name : 'اسحب الملف هنا أو اضغط للاختيار'}
                  </span>
                  <span className="text-xs text-on-surface-variant mt-1">
                    {excelFile ? `${(excelFile.size / 1024).toFixed(1)} KB` : 'يدعم ملفات .xlsx و .xls و .csv'}
                  </span>
                  <input
                    type="file"
                    accept=".xlsx, .xls, .csv"
                    className="hidden"
                    onChange={e => {
                      if (e.target.files[0]) setExcelFile(e.target.files[0]);
                    }}
                  />
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowImportModal(false); setExcelFile(null); }}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-surface-variant/50 cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={uploadingExcel || !excelFile}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {uploadingExcel ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>جاري معالجة واستيراد الأسئلة...</span>
                    </>
                  ) : (
                    <>
                      <Upload size={16} />
                      <span>بدء الاستيراد</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          </Modal>
        )}

      </div>
    </div>
  );
}
