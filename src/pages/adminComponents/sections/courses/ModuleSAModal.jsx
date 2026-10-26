import React, { useState, useEffect } from 'react';
import { Modal, Input, Textarea, SubmitBtn } from '../../ui/SharedUI';
import { 
  Award, Plus, Trash2, Edit3, Image as ImageIcon, FileSpreadsheet, 
  Upload, Download, CheckCircle2, Sliders, X, Check, Search, 
  Loader2, HelpCircle, Sparkles, ChevronDown, ChevronUp, AlertCircle, Tag
} from 'lucide-react';
import API from '../../../../api/axios';
import { useTranslation } from 'react-i18next';

// Default metadata taxonomy fallback
const DEFAULT_TAXONOMY = {
  knowledgeDomains: [
    'Pharmacology',
    'Pathology',
    'Physiology',
    'Microbiology',
    'Biochemistry',
    'Anatomy',
    'Immunology',
    'Genetics',
    'Behavioral Science & Psychiatry',
    'Public Health & Epidemiology'
  ],
  clinicianTasks: [
    'Management',
    'Pharmacotherapy',
    'Diagnosis',
    'History & Physical Examination',
    'Health Maintenance & Prevention',
    'Pathology / Underlying Mechanism',
    'Ethical / Legal Principles'
  ],
  healthGroups: [
    'Adult_Health',
    'Pediatric_Health',
    'Women_Health & Reproduction',
    'Geriatric_Health',
    'Emergency & Critical_Care'
  ],
  topics: [
    'Chronic Obstructive Pulmonary Disease (COPD)',
    'Asthma',
    'Pneumonia & Respiratory Infections',
    'Heart Failure',
    'Coronary Artery Disease & Myocardial Infarction',
    'Hypertension',
    'Diabetes Mellitus Type 1 & 2',
    'Thyroid Disorders',
    'Acute Kidney Injury & CKD',
    'Stroke & Transient Ischemic Attack'
  ],
  difficultyLevels: ['Easy', 'Medium', 'Hard']
};

export default function ModuleSAModal({ show, onClose, module, course, showMsg }) {
  const { t, i18n } = useTranslation();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDomain, setFilterDomain] = useState('all');

  // Modals state
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Metadata Taxonomy state
  const [taxonomy, setTaxonomy] = useState(DEFAULT_TAXONOMY);
  const [showTaxonomyModal, setShowTaxonomyModal] = useState(false);
  const [savingTaxonomy, setSavingTaxonomy] = useState(false);
  const [activeTaxonomyTab, setActiveTaxonomyTab] = useState('knowledgeDomains');
  const [newTagInput, setNewTagInput] = useState('');

  // Excel Import state
  const [showImportModal, setShowImportModal] = useState(false);
  const [excelFile, setExcelFile] = useState(null);
  const [uploadingExcel, setUploadingExcel] = useState(false);

  // Expanded explanations toggle
  const [expandedExplanations, setExpandedExplanations] = useState({});

  // Question Form State (Structured according to user's specification)
  const initialFormState = {
    questionId: '',
    text: '',
    options: [
      { id: 'A', text: '', isCorrect: true },
      { id: 'B', text: '', isCorrect: false },
      { id: 'C', text: '', isCorrect: false },
      { id: 'D', text: '', isCorrect: false }
    ],
    metadata: {
      chapter: '',
      topic: '',
      knowledgeDomain: '',
      clinicianTask: '',
      healthGroup: '',
      difficultyLevel: 'Medium'
    },
    explanation: '',
    hint: '',
    image: null
  };

  const [form, setForm] = useState(initialFormState);

  // Load questions and metadata taxonomy on modal open
  useEffect(() => {
    if (show && module?.id) {
      fetchQuestions();
      fetchTaxonomy();
    }
  }, [show, module?.id]);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const res = await API.get(`/admin/modules/${module.id}/self-assessment-questions`);
      setQuestions(res.data.questions || []);
    } catch (err) {
      showMsg('error', 'فشل في جلب أسئلة التقييم الذاتي');
    } finally {
      setLoading(false);
    }
  };

  const fetchTaxonomy = async () => {
    try {
      const res = await API.get('/admin/metadata-taxonomy');
      if (res.data.taxonomy) {
        setTaxonomy(res.data.taxonomy);
      }
    } catch (err) {
      console.warn('Using default taxonomy fallback:', err.message);
    }
  };

  const resetForm = () => {
    setForm({
      ...initialFormState,
      questionId: `Q-${Math.floor(1000 + Math.random() * 9000)}`,
      options: [
        { id: 'A', text: '', isCorrect: true },
        { id: 'B', text: '', isCorrect: false },
        { id: 'C', text: '', isCorrect: false },
        { id: 'D', text: '', isCorrect: false }
      ],
      metadata: {
        chapter: module?.name || '',
        topic: '',
        knowledgeDomain: taxonomy.knowledgeDomains?.[0] || 'Pharmacology',
        clinicianTask: taxonomy.clinicianTasks?.[0] || 'Management',
        healthGroup: taxonomy.healthGroups?.[0] || 'Adult_Health',
        difficultyLevel: 'Medium'
      }
    });
  };

  // ═══════════════════════════════════════════
  // Options Handlers
  // ═══════════════════════════════════════════
  const handleOptionTextChange = (idx, value) => {
    const updated = [...form.options];
    updated[idx] = { ...updated[idx], text: value };
    setForm({ ...form, options: updated });
  };

  const handleSetCorrectOption = (idx) => {
    const updated = form.options.map((opt, i) => ({
      ...opt,
      isCorrect: i === idx
    }));
    setForm({ ...form, options: updated });
  };

  const handleAddOption = () => {
    if (form.options.length < 8) {
      const nextLetter = String.fromCharCode(65 + form.options.length);
      setForm({
        ...form,
        options: [...form.options, { id: nextLetter, text: '', isCorrect: false }]
      });
    }
  };

  const handleRemoveOption = (idx) => {
    if (form.options.length <= 2) return;
    const isRemovingCorrect = form.options[idx].isCorrect;
    const updated = form.options
      .filter((_, i) => i !== idx)
      .map((opt, i) => ({ ...opt, id: String.fromCharCode(65 + i) }));

    if (isRemovingCorrect && updated.length > 0) {
      updated[0].isCorrect = true;
    }

    setForm({ ...form, options: updated });
  };

  // ═══════════════════════════════════════════
  // Metadata & Form Handlers
  // ═══════════════════════════════════════════
  const handleMetadataChange = (field, value) => {
    setForm({
      ...form,
      metadata: {
        ...form.metadata,
        [field]: value
      }
    });
  };

  const handleOpenEdit = (q) => {
    let parsedOptions = q.options;
    if (parsedOptions && typeof parsedOptions === 'string') {
      try { parsedOptions = JSON.parse(parsedOptions); } catch (e) { parsedOptions = []; }
    }
    if (!Array.isArray(parsedOptions)) parsedOptions = [];

    // Format options as [{ id, text, isCorrect }]
    let formattedOptions = [];
    if (parsedOptions.length > 0 && typeof parsedOptions[0] === 'object' && parsedOptions[0] !== null) {
      formattedOptions = parsedOptions.map((opt, i) => ({
        id: opt.id || String.fromCharCode(65 + i),
        text: opt.text || '',
        isCorrect: !!opt.isCorrect || (q.correct_answer && opt.text === q.correct_answer)
      }));
    } else {
      formattedOptions = parsedOptions.map((optStr, i) => ({
        id: String.fromCharCode(65 + i),
        text: String(optStr),
        isCorrect: q.correct_answer === optStr
      }));
    }

    if (formattedOptions.length === 0) {
      formattedOptions = [
        { id: 'A', text: '', isCorrect: true },
        { id: 'B', text: '', isCorrect: false },
        { id: 'C', text: '', isCorrect: false },
        { id: 'D', text: '', isCorrect: false }
      ];
    }

    // Ensure at least one is marked correct
    if (!formattedOptions.some(o => o.isCorrect)) {
      formattedOptions[0].isCorrect = true;
    }

    setForm({
      questionId: q.custom_id || `Q-${q.id}`,
      text: q.question_text || '',
      options: formattedOptions,
      metadata: {
        chapter: q.chapter || '',
        topic: q.topic || '',
        knowledgeDomain: q.knowledge_domain || '',
        clinicianTask: q.clinician_task || '',
        healthGroup: q.health_group || '',
        difficultyLevel: q.difficulty_level ? (q.difficulty_level.charAt(0).toUpperCase() + q.difficulty_level.slice(1)) : 'Medium'
      },
      explanation: q.explanation || '',
      hint: q.hint || '',
      image: q.image
    });

    setShowEdit(q);
  };

  const handleSaveQuestion = async (e) => {
    e.preventDefault();
    if (!form.text.trim()) {
      return showMsg('error', 'يرجى إدخال نص السؤال');
    }

    const filledOptions = form.options.filter(o => o.text.trim() !== '');
    if (filledOptions.length < 2) {
      return showMsg('error', 'يجب إدخال خيارين على الأقل');
    }

    const correctOpt = form.options.find(o => o.isCorrect);
    if (!correctOpt || !correctOpt.text.trim()) {
      return showMsg('error', 'يرجى تحديد إجابة صحيحة وكتابة نصها');
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('questionId', form.questionId || `Q-${Date.now().toString().slice(-4)}`);
      formData.append('text', form.text);
      formData.append('options', JSON.stringify(filledOptions));
      formData.append('correct_answer', correctOpt.text);
      formData.append('metadata', JSON.stringify({
        ...form.metadata,
        chapter: module?.name || form.metadata.chapter || ''
      }));
      formData.append('explanation', form.explanation || '');
      formData.append('hint', form.hint || '');
      if (form.image instanceof File) {
        formData.append('image', form.image);
      }

      if (showEdit) {
        await API.put(`/admin/modules/${module.id}/self-assessment-questions/${showEdit.id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        showMsg('success', 'تم تحديث السؤال بنجاح');
        setShowEdit(null);
      } else {
        await API.post(`/admin/modules/${module.id}/self-assessment-questions`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        showMsg('success', 'تمت إضافة السؤال بنجاح');
        setShowAdd(false);
      }

      resetForm();
      fetchQuestions();
    } catch (err) {
      showMsg('error', err.response?.data?.message || 'خطأ في حفظ السؤال');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    setSubmitting(true);
    try {
      await API.delete(`/admin/modules/${module.id}/self-assessment-questions/${itemToDelete.id}`);
      showMsg('success', 'تم حذف السؤال بنجاح');
      setItemToDelete(null);
      fetchQuestions();
    } catch (err) {
      showMsg('error', 'خطأ في الحذف');
    } finally {
      setSubmitting(false);
    }
  };

  // ═══════════════════════════════════════════
  // Taxonomy Management Handlers
  // ═══════════════════════════════════════════
  const handleAddTaxonomyTag = () => {
    if (!newTagInput.trim()) return;
    const currentList = taxonomy[activeTaxonomyTab] || [];
    if (currentList.includes(newTagInput.trim())) {
      return showMsg('error', 'هذا العنصر موجود بالفعل');
    }
    const updated = {
      ...taxonomy,
      [activeTaxonomyTab]: [...currentList, newTagInput.trim()]
    };
    setTaxonomy(updated);
    setNewTagInput('');
  };

  const handleRemoveTaxonomyTag = (tag) => {
    const currentList = taxonomy[activeTaxonomyTab] || [];
    const updated = {
      ...taxonomy,
      [activeTaxonomyTab]: currentList.filter(t => t !== tag)
    };
    setTaxonomy(updated);
  };

  const handleSaveTaxonomy = async () => {
    setSavingTaxonomy(true);
    try {
      await API.put('/admin/metadata-taxonomy', { taxonomy });
      showMsg('success', 'تم حفظ وتحديث تصنيفات البيانات الوصفية (Metadata) بنجاح');
      setShowTaxonomyModal(false);
    } catch (err) {
      showMsg('error', err.response?.data?.message || 'خطأ في حفظ التصنيفات');
    } finally {
      setSavingTaxonomy(false);
    }
  };

  // ═══════════════════════════════════════════
  // Excel Import & Template
  // ═══════════════════════════════════════════
  const handleDownloadSATemplate = async () => {
    try {
      const response = await API.get('/admin/self-assessment/template', {
        responseType: 'blob'
      });
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'self_assessment_template.xlsx');
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
    if (!excelFile) return showMsg('error', 'يرجى اختيار ملف Excel أولاً');

    setUploadingExcel(true);
    const formData = new FormData();
    formData.append('file', excelFile);

    try {
      const res = await API.post(`/admin/modules/${module.id}/self-assessment-questions/import-excel`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      showMsg('success', res.data.message || 'تم استيراد الأسئلة بنجاح');
      setShowImportModal(false);
      setExcelFile(null);
      fetchQuestions();
    } catch (err) {
      showMsg('error', err.response?.data?.message || 'فشل في استيراد ملف الإكسيل');
    } finally {
      setUploadingExcel(false);
    }
  };

  // Filter Questions
  const filteredQuestions = questions.filter(q => {
    const matchSearch = (q.question_text || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (q.custom_id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (q.topic || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (q.chapter || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchDomain = filterDomain === 'all' || q.knowledge_domain === filterDomain;
    return matchSearch && matchDomain;
  });

  const taxonomyTabs = [
    { key: 'knowledgeDomains', label: 'المجالات المعرفية (Knowledge Domain)' },
    { key: 'clinicianTasks', label: 'المهام السريرية (Clinician Task)' },
    { key: 'healthGroups', label: 'الفئات الصحية (Health Group)' },
    { key: 'topics', label: 'المواضيع (Topics)' }
  ];

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex justify-center items-center p-3 sm:p-6 overflow-hidden">
      <div className="bg-surface border border-outline-variant/40 w-full max-w-6xl h-[92vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* ═══════════════ MODAL HEADER ═══════════════ */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-outline-variant/30 bg-surface-container-low/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-violet-500/10 text-violet-600 flex items-center justify-center shrink-0 border border-violet-500/20">
              <Award size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-extrabold text-on-surface">
                  تقييم ذاتي (Self Assessment): {module?.name}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-violet-500/10 text-violet-600 text-[11px] font-black border border-violet-500/20">
                  {questions.length} أسئلة
                </span>
              </div>
              <p className="text-xs text-on-surface-variant font-medium mt-0.5">
                إدارة أسئلة التقييم الذاتي مع البيانات الوصفية الطبية (Metadata) وإمكانية استيراد Excel
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowTaxonomyModal(true)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-bold rounded-xl border border-outline-variant/30 transition-all cursor-pointer"
              title="إدارة البيانات الوصفية (Metadata Taxonomy)"
            >
              <Sliders size={15} className="text-violet-500" />
              <span>إدارة الـ Metadata</span>
            </button>

            <button
              onClick={handleDownloadSATemplate}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-bold rounded-xl border border-outline-variant/30 transition-all cursor-pointer"
              title="تحميل نموذج Excel لأسئلة التقييم الذاتي"
            >
              <Download size={15} className="text-emerald-500" />
              <span>نموذج Excel</span>
            </button>

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
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar bg-background/50 space-y-6">
          
          {/* Action & Filter Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-surface p-4 rounded-2xl border border-outline-variant/30">
            <div className="flex items-center gap-2 flex-1">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3.5 rtl:left-auto rtl:right-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant/50" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="ابحث برقم السؤال، النص، أو الموضوع..."
                  className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl py-2 pl-4 pr-10 rtl:pl-10 rtl:pr-4 text-xs font-semibold text-on-surface focus:outline-none focus:border-violet-500 transition-all"
                />
              </div>

              <select
                value={filterDomain}
                onChange={e => setFilterDomain(e.target.value)}
                className="bg-surface-container-low border border-outline-variant/30 rounded-xl py-2 px-3 text-xs font-bold text-on-surface focus:outline-none focus:border-violet-500 cursor-pointer"
              >
                <option value="all">جميع المجالات المعرفية</option>
                {(taxonomy.knowledgeDomains || []).map(kd => (
                  <option key={kd} value={kd}>{t(`metadataTaxonomy.knowledgeDomains.${kd}`, kd)}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setShowImportModal(true)}
                className="px-3.5 py-2 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500 hover:text-white border border-emerald-500/30 text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <FileSpreadsheet size={15} />
                <span>استيراد Excel</span>
              </button>

              <button
                onClick={() => {
                  resetForm();
                  setShowAdd(true);
                }}
                className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Plus size={16} />
                <span>إضافة سؤال جديد</span>
              </button>
            </div>
          </div>

          {/* Questions List */}
          {loading ? (
            <div className="py-24 text-center">
              <Loader2 size={36} className="animate-spin text-violet-500 mx-auto mb-3" />
              <p className="text-xs font-bold text-on-surface-variant">جاري تحميل أسئلة التقييم الذاتي...</p>
            </div>
          ) : filteredQuestions.length === 0 ? (
            <div className="py-16 text-center border-2 border-dashed border-outline-variant/40 rounded-3xl bg-surface-container-low/20">
              <Award size={40} className="mx-auto text-violet-400 mb-3" />
              <h3 className="text-base font-bold text-on-surface">لا توجد أسئلة تقييم ذاتي لهذا الموديول بعد</h3>
              <p className="text-xs text-on-surface-variant max-w-sm mx-auto mt-1 mb-6">
                أضف أول سؤال مع البيانات الوصفية (Metadata) أو استورد ملف Excel بالكامل مباشرة.
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => {
                    resetForm();
                    setShowAdd(true);
                  }}
                  className="px-4 py-2 bg-violet-600 text-white font-bold text-xs rounded-xl shadow-sm hover:bg-violet-700 transition-all cursor-pointer"
                >
                  إضافة سؤال
                </button>
                <button
                  onClick={() => setShowImportModal(true)}
                  className="px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-sm hover:bg-emerald-700 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <FileSpreadsheet size={15} /> استيراد من Excel
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredQuestions.map((q, idx) => {
                let parsedOptions = q.options;
                if (parsedOptions && typeof parsedOptions === 'string') {
                  try { parsedOptions = JSON.parse(parsedOptions); } catch (e) { parsedOptions = []; }
                }
                if (!Array.isArray(parsedOptions)) parsedOptions = [];

                const isExplanationOpen = !!expandedExplanations[q.id];

                return (
                  <div
                    key={q.id}
                    className="p-5 bg-surface rounded-3xl border border-outline-variant/30 flex flex-col gap-4 shadow-sm hover:shadow-md transition-all relative overflow-hidden"
                  >
                    {/* Top Bar: Question ID, Metadata Chips, Actions */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        {/* Custom Question ID Badge */}
                        <div className="px-2.5 py-1 rounded-xl bg-violet-500/10 text-violet-600 font-mono font-black text-xs shrink-0 border border-violet-500/20 mt-0.5">
                          {q.custom_id || `Q-${q.id}`}
                        </div>

                        <div className="flex-1 min-w-0" dir="auto">
                          {/* Metadata Pills */}
                          <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
                            {q.chapter && (
                              <span className="px-2 py-0.5 rounded-lg bg-surface-container text-on-surface-variant font-bold text-[10px] border border-outline-variant/30">
                                📖 {q.chapter}
                              </span>
                            )}
                            {q.topic && (
                              <span className="px-2 py-0.5 rounded-lg bg-surface-container text-on-surface-variant font-bold text-[10px] border border-outline-variant/30">
                                🔬 {q.topic}
                              </span>
                            )}
                            {q.knowledge_domain && (
                              <span className="px-2 py-0.5 rounded-lg bg-indigo-500/10 text-indigo-600 font-bold text-[10px] border border-indigo-500/20">
                                {q.knowledge_domain}
                              </span>
                            )}
                            {q.clinician_task && (
                              <span className="px-2 py-0.5 rounded-lg bg-cyan-500/10 text-cyan-600 font-bold text-[10px] border border-cyan-500/20">
                                {q.clinician_task}
                              </span>
                            )}
                            {q.health_group && (
                              <span className="px-2 py-0.5 rounded-lg bg-amber-500/10 text-amber-600 font-bold text-[10px] border border-amber-500/20">
                                {q.health_group}
                              </span>
                            )}
                            <span className={`px-2 py-0.5 rounded-lg font-bold text-[10px] border ${
                              (q.difficulty_level || '').toLowerCase() === 'easy'
                                ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                                : (q.difficulty_level || '').toLowerCase() === 'hard'
                                  ? 'bg-rose-500/10 text-rose-600 border-rose-500/20'
                                  : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                            }`}>
                              {(q.difficulty_level || 'Medium').toUpperCase()}
                            </span>
                          </div>

                          {/* Question Text */}
                          <p className="font-extrabold text-on-surface text-sm sm:text-base leading-relaxed whitespace-pre-line">
                            {q.question_text}
                          </p>
                        </div>
                      </div>

                      {/* Edit & Delete Actions */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => handleOpenEdit(q)}
                          className="p-2 rounded-xl bg-surface-container hover:bg-violet-500/10 hover:text-violet-600 text-on-surface-variant transition-colors cursor-pointer"
                          title="تعديل السؤال"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          onClick={() => setItemToDelete(q)}
                          className="p-2 rounded-xl bg-surface-container hover:bg-rose-500/10 hover:text-rose-600 text-on-surface-variant transition-colors cursor-pointer"
                          title="حذف السؤال"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Image if present */}
                    {q.image && (
                      <div className="mt-1">
                        <img
                          src={q.image.startsWith('http') ? q.image : `${API.defaults.baseURL?.replace('/api', '') || ''}${q.image}`}
                          alt="Question Media"
                          className="max-h-48 rounded-2xl border border-outline-variant/30 object-contain bg-black/5"
                        />
                      </div>
                    )}

                    {/* Options List */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                      {parsedOptions.map((opt, optIdx) => {
                        const optText = typeof opt === 'object' && opt !== null ? opt.text : opt;
                        const optId = typeof opt === 'object' && opt !== null && opt.id ? opt.id : String.fromCharCode(65 + optIdx);
                        const isCorrect = (typeof opt === 'object' && opt?.isCorrect) || (optText && q.correct_answer === optText);

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
                              {isCorrect ? <Check size={12} strokeWidth={3} /> : optId}
                            </span>
                            <span className="flex-1">{optText}</span>
                            {isCorrect && (
                              <span className="text-[10px] font-black uppercase text-emerald-600 tracking-wider">
                                الإجابة الصحيحة
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Explanation & Hint */}
                    {(q.explanation || q.hint) && (
                      <div className="mt-1 pt-3 border-t border-outline-variant/20">
                        <button
                          onClick={() => setExpandedExplanations(prev => ({ ...prev, [q.id]: !prev[q.id] }))}
                          className="text-xs font-bold text-violet-600 hover:text-violet-700 flex items-center gap-1.5 cursor-pointer"
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

        {/* ═══════════════ MODAL 1: ADD / EDIT QUESTION (NEW STRUCTURE) ═══════════════ */}
        {(showAdd || showEdit) && (
          <Modal
            open={true}
            onClose={() => { setShowAdd(false); setShowEdit(null); resetForm(); }}
            title={showAdd ? 'إضافة سؤال تقييم ذاتي جديد' : `تعديل السؤال (${form.questionId})`}
            size="4xl"
          >
            <form onSubmit={handleSaveQuestion} className="space-y-5 max-h-[75vh] overflow-y-auto pr-1 custom-scrollbar">
              
              {/* Question Auto Metadata Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-surface-container-low/60 border border-outline-variant/30">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-on-surface-variant">معرف السؤال (تلقائي):</span>
                  <span className="px-2.5 py-0.5 rounded-lg bg-violet-500/10 text-violet-600 font-mono font-black text-xs border border-violet-500/20">
                    {form.questionId || 'سيتم توليده تلقائياً'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-on-surface-variant">الفصل (الموديول الحالي):</span>
                  <span className="px-2.5 py-0.5 rounded-lg bg-surface text-on-surface font-black text-xs border border-outline-variant/30">
                    📖 {module?.name}
                  </span>
                </div>
              </div>

              {/* Topic */}
              <div>
                <Input
                  label="الموضوع (topic)"
                  placeholder="مثال: Chronic Obstructive Pulmonary Disease (COPD)"
                  value={form.metadata.topic}
                  onChange={e => handleMetadataChange('topic', e.target.value)}
                />
              </div>

              {/* Question Text */}
              <Textarea
                label="نص السؤال (text) *"
                required
                rows={4}
                placeholder="اكتب سيناريو ونص السؤال السريري هنا..."
                value={form.text}
                onChange={e => setForm({ ...form, text: e.target.value })}
              />

              {/* Image attachment */}
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
                        if (e.target.files[0]) setForm({ ...form, image: e.target.files[0] });
                      }}
                    />
                  </label>
                  {form.image && (
                    <span className="text-xs text-violet-600 font-bold truncate max-w-[250px]">
                      {form.image instanceof File ? form.image.name : 'صورة مرفقة مسبقاً'}
                    </span>
                  )}
                </div>
              </div>

              {/* ──────────────── OPTIONS BUILDER ──────────────── */}
              <div className="p-4 rounded-2xl bg-surface-container-low/40 border border-outline-variant/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-extrabold text-on-surface uppercase tracking-wider">
                      خيارات الإجابة (options) *
                    </h4>
                    <p className="text-[11px] text-on-surface-variant mt-0.5">
                      اضغط على زر الحرف لاختيار الإجابة الصحيحة (isCorrect: true)
                    </p>
                  </div>
                  {form.options.length < 8 && (
                    <button
                      type="button"
                      onClick={handleAddOption}
                      className="px-3 py-1 bg-violet-500/10 text-violet-600 hover:bg-violet-500 hover:text-white rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                    >
                      <Plus size={14} /> إضافة خيار
                    </button>
                  )}
                </div>

                <div className="space-y-2.5 pt-1">
                  {form.options.map((opt, i) => (
                    <div key={opt.id} className="flex items-center gap-2">
                      {/* IsCorrect Radio Button */}
                      <button
                        type="button"
                        onClick={() => handleSetCorrectOption(i)}
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border cursor-pointer font-bold text-xs transition-all ${
                          opt.isCorrect 
                            ? 'bg-emerald-500 text-white border-emerald-500 shadow-md ring-2 ring-emerald-500/20' 
                            : 'bg-surface border-outline-variant/40 text-on-surface-variant hover:border-violet-500'
                        }`}
                        title={opt.isCorrect ? 'الإجابة الصحيحة (isCorrect: true)' : 'اضغط لجعلها الإجابة الصحيحة'}
                      >
                        {opt.isCorrect ? <Check size={16} strokeWidth={3} /> : opt.id}
                      </button>

                      <input
                        type="text"
                        required
                        placeholder={`نص الخيار ${opt.id}...`}
                        value={opt.text}
                        onChange={e => handleOptionTextChange(i, e.target.value)}
                        className={`flex-1 bg-surface border rounded-xl py-2 px-3 text-xs font-semibold text-on-surface focus:outline-none transition-all ${
                          opt.isCorrect ? 'border-emerald-500 ring-1 ring-emerald-500' : 'border-outline-variant/40 focus:border-violet-500'
                        }`}
                      />

                      {form.options.length > 2 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveOption(i)}
                          className="p-2 text-on-surface-variant/40 hover:text-rose-500 transition-colors cursor-pointer"
                          title="حذف هذا الخيار"
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* ──────────────── METADATA SECTION ──────────────── */}
              <div className="p-4 rounded-2xl bg-surface-container-low/40 border border-outline-variant/30 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold text-on-surface uppercase tracking-wider flex items-center gap-1.5">
                    <Tag size={14} className="text-violet-500" />
                    <span>البيانات الوصفية للسؤال (metadata)</span>
                  </h4>
                  <button
                    type="button"
                    onClick={() => setShowTaxonomyModal(true)}
                    className="text-[11px] font-bold text-violet-600 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Sliders size={12} /> تخصيص الـ Metadata
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {/* Knowledge Domain */}
                  <div>
                    <label className="block text-[11px] font-bold text-on-surface mb-1">
                      المجال المعرفي (knowledgeDomain)
                    </label>
                    <select
                      value={form.metadata.knowledgeDomain || ''}
                      onChange={e => handleMetadataChange('knowledgeDomain', e.target.value)}
                      className="w-full bg-surface border border-outline-variant/40 rounded-xl py-2 px-3 text-xs font-bold text-on-surface focus:outline-none focus:border-violet-500 cursor-pointer"
                    >
                      <option value="">اختر المجال المعرفي...</option>
                      {(taxonomy.knowledgeDomains || []).map(d => (
                        <option key={d} value={d}>
                          {t(`metadataTaxonomy.knowledgeDomains.${d}`, d)}
                        </option>
                      ))}
                      {form.metadata.knowledgeDomain && !(taxonomy.knowledgeDomains || []).includes(form.metadata.knowledgeDomain) && (
                        <option value={form.metadata.knowledgeDomain}>{form.metadata.knowledgeDomain}</option>
                      )}
                    </select>
                  </div>

                  {/* Clinician Task */}
                  <div>
                    <label className="block text-[11px] font-bold text-on-surface mb-1">
                      المهمة السريرية (clinicianTask)
                    </label>
                    <select
                      value={form.metadata.clinicianTask || ''}
                      onChange={e => handleMetadataChange('clinicianTask', e.target.value)}
                      className="w-full bg-surface border border-outline-variant/40 rounded-xl py-2 px-3 text-xs font-bold text-on-surface focus:outline-none focus:border-violet-500 cursor-pointer"
                    >
                      <option value="">اختر المهمة السريرية...</option>
                      {(taxonomy.clinicianTasks || []).map(tItem => (
                        <option key={tItem} value={tItem}>
                          {t(`metadataTaxonomy.clinicianTasks.${tItem}`, tItem)}
                        </option>
                      ))}
                      {form.metadata.clinicianTask && !(taxonomy.clinicianTasks || []).includes(form.metadata.clinicianTask) && (
                        <option value={form.metadata.clinicianTask}>{form.metadata.clinicianTask}</option>
                      )}
                    </select>
                  </div>

                  {/* Health Group */}
                  <div>
                    <label className="block text-[11px] font-bold text-on-surface mb-1">
                      الفئة الصحية (healthGroup)
                    </label>
                    <select
                      value={form.metadata.healthGroup || ''}
                      onChange={e => handleMetadataChange('healthGroup', e.target.value)}
                      className="w-full bg-surface border border-outline-variant/40 rounded-xl py-2 px-3 text-xs font-bold text-on-surface focus:outline-none focus:border-violet-500 cursor-pointer"
                    >
                      <option value="">اختر الفئة الصحية...</option>
                      {(taxonomy.healthGroups || []).map(h => (
                        <option key={h} value={h}>
                          {t(`metadataTaxonomy.healthGroups.${h}`, h)}
                        </option>
                      ))}
                      {form.metadata.healthGroup && !(taxonomy.healthGroups || []).includes(form.metadata.healthGroup) && (
                        <option value={form.metadata.healthGroup}>{form.metadata.healthGroup}</option>
                      )}
                    </select>
                  </div>

                  {/* Difficulty Level */}
                  <div>
                    <label className="block text-[11px] font-bold text-on-surface mb-1">
                      مستوى الصعوبة (difficultyLevel)
                    </label>
                    <select
                      value={form.metadata.difficultyLevel || 'Medium'}
                      onChange={e => handleMetadataChange('difficultyLevel', e.target.value)}
                      className="w-full bg-surface border border-outline-variant/40 rounded-xl py-2 px-3 text-xs font-bold text-on-surface focus:outline-none focus:border-violet-500 cursor-pointer"
                    >
                      <option value="Easy">{t('metadataTaxonomy.difficultyLevels.Easy', 'سهل (Easy)')}</option>
                      <option value="Medium">{t('metadataTaxonomy.difficultyLevels.Medium', 'متوسط (Medium)')}</option>
                      <option value="Hard">{t('metadataTaxonomy.difficultyLevels.Hard', 'صعب (Hard)')}</option>
                    </select>
                  </div>
                </div>

                {/* Topic (optional) */}
                <div>
                  <label className="block text-[11px] font-bold text-on-surface mb-1">
                    الموضوع السريري (topic) - اختياري
                  </label>
                  <select
                    value={form.metadata.topic || ''}
                    onChange={e => handleMetadataChange('topic', e.target.value)}
                    className="w-full bg-surface border border-outline-variant/40 rounded-xl py-2 px-3 text-xs font-bold text-on-surface focus:outline-none focus:border-violet-500 cursor-pointer"
                  >
                    <option value="">اختر الموضوع أو الحالة السريرية (اختياري)...</option>
                    {(taxonomy.topics || []).map(tp => (
                      <option key={tp} value={tp}>{tp}</option>
                    ))}
                    {form.metadata.topic && !(taxonomy.topics || []).includes(form.metadata.topic) && (
                      <option value={form.metadata.topic}>{form.metadata.topic}</option>
                    )}
                  </select>
                </div>
              </div>

              {/* Explanation & Hint */}
              <div className="space-y-4 pt-1">
                <Textarea
                  label="شرح وتفسير الإجابة (explanation)"
                  rows={4}
                  placeholder="اكتب التفسير الطبي للحل والهدف التعليمي..."
                  value={form.explanation}
                  onChange={e => setForm({ ...form, explanation: e.target.value })}
                />
                <Input
                  label="تلميح (hint)"
                  placeholder="تلميح يساعد الطالب في التفكير السريري..."
                  value={form.hint}
                  onChange={e => setForm({ ...form, hint: e.target.value })}
                />
              </div>

              <SubmitBtn loading={submitting} label={showAdd ? 'إضافة السؤال' : 'حفظ التعديلات'} />
            </form>
          </Modal>
        )}

        {/* ═══════════════ MODAL 2: METADATA TAXONOMY MANAGEMENT ═══════════════ */}
        {showTaxonomyModal && (
          <Modal
            open={true}
            onClose={() => setShowTaxonomyModal(false)}
            title="إدارة البيانات الوصفية للنظام (Metadata Taxonomy)"
            size="2xl"
          >
            <div className="space-y-5">
              <p className="text-xs text-on-surface-variant leading-relaxed">
                هنا يمكنك بناء وإدارة عناصر الـ Metadata الأساسية في النظام (المجالات المعرفية، المهام السريرية، الفئات الصحية، والفصول والمواضيع) لتظهر كخيارات افتراضية عند إضافة وتعديل الأسئلة.
              </p>

              {/* Tabs */}
              <div className="flex overflow-x-auto custom-scrollbar gap-1.5 pb-1 border-b border-outline-variant/20">
                {taxonomyTabs.map(t => (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => setActiveTaxonomyTab(t.key)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                      activeTaxonomyTab === t.key
                        ? 'bg-violet-600 text-white shadow-sm'
                        : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Add New Tag input */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="اكتب قيمة جديدة وأضفها..."
                  value={newTagInput}
                  onChange={e => setNewTagInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddTaxonomyTag(); } }}
                  className="flex-1 bg-surface-container-low border border-outline-variant/30 rounded-xl py-2 px-3 text-xs font-semibold text-on-surface focus:outline-none focus:border-violet-500"
                />
                <button
                  type="button"
                  onClick={handleAddTaxonomyTag}
                  className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1 cursor-pointer"
                >
                  <Plus size={14} /> إضافة
                </button>
              </div>

              {/* Tags Cloud */}
              <div className="p-4 rounded-2xl bg-surface-container-low/40 border border-outline-variant/30 max-h-56 overflow-y-auto custom-scrollbar">
                <div className="flex flex-wrap gap-2">
                  {(taxonomy[activeTaxonomyTab] || []).map(tag => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 rounded-xl bg-surface border border-outline-variant/30 text-xs font-bold text-on-surface flex items-center gap-1.5 shadow-xs"
                    >
                      <span>{tag}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTaxonomyTag(tag)}
                        className="text-on-surface-variant/40 hover:text-rose-500 transition-colors cursor-pointer"
                        title="حذف"
                      >
                        <X size={13} />
                      </button>
                    </span>
                  ))}
                  {(!taxonomy[activeTaxonomyTab] || taxonomy[activeTaxonomyTab].length === 0) && (
                    <p className="text-xs text-on-surface-variant italic">لا توجد عناصر مضافة في هذا التصنيف بعد.</p>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-end gap-2 pt-2 border-t border-outline-variant/20">
                <button
                  type="button"
                  onClick={() => setShowTaxonomyModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold hover:bg-surface-variant/50 cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  onClick={handleSaveTaxonomy}
                  disabled={savingTaxonomy}
                  className="px-5 py-2 bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {savingTaxonomy ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                  <span>حفظ التغييرات في النظام</span>
                </button>
              </div>
            </div>
          </Modal>
        )}

        {/* ═══════════════ MODAL 3: EXCEL IMPORT ═══════════════ */}
        {showImportModal && (
          <Modal
            open={true}
            onClose={() => { setShowImportModal(false); setExcelFile(null); }}
            title="استيراد أسئلة التقييم الذاتي من ملف Excel"
            size="lg"
          >
            <form onSubmit={handleUploadExcel} className="space-y-5">
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-xs space-y-2">
                <div className="flex items-center gap-2 font-black">
                  <CheckCircle2 size={16} />
                  <span>تنسيق الأعمدة المعترف بها تلقائياً في ملف Excel:</span>
                </div>
                <p className="leading-relaxed opacity-90 font-mono text-[11px]">
                  questionId, text, option_a, option_b, option_c, option_d, correct_option, chapter, topic, knowledgeDomain, clinicianTask, healthGroup, difficultyLevel, explanation, hint
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleDownloadSATemplate}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-lg font-bold text-[11px] hover:bg-emerald-700 transition-colors cursor-pointer"
                  >
                    <Download size={13} /> تحميل ملف Excel تجريبي جاهز
                  </button>
                </div>
              </div>

              {/* File Drop Box */}
              <div>
                <label className="block text-xs font-bold text-on-surface mb-2">اختر ملف Excel (.xlsx, .xls, .csv)</label>
                <label className="border-2 border-dashed border-outline-variant/40 hover:border-violet-500/60 rounded-3xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors bg-surface-container-low/30 hover:bg-surface-container-low/60">
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
                      <span>جاري المعالجة والاستيراد...</span>
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

        {/* ═══════════════ MODAL 4: DELETE CONFIRMATION ═══════════════ */}
        {itemToDelete && (
          <Modal open={true} onClose={() => setItemToDelete(null)} title="تأكيد حذف السؤال" size="sm">
            <div className="space-y-4">
              <p className="text-xs font-semibold text-on-surface leading-relaxed">
                هل أنت متأكد من حذف هذا السؤال ({itemToDelete.custom_id || `Q-${itemToDelete.id}`})؟
              </p>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setItemToDelete(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold hover:bg-surface-variant/50 cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-500 text-white hover:bg-rose-600 cursor-pointer disabled:opacity-50"
                >
                  {submitting ? 'جاري الحذف...' : 'نعم، احذف'}
                </button>
              </div>
            </div>
          </Modal>
        )}

      </div>
    </div>
  );
}
