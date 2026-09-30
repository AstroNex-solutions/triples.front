import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2, Trash2, Edit, Plus, ArrowRight, ArrowLeft, Upload } from 'lucide-react';
import { Card, Modal, Input, Textarea, SubmitBtn } from '../../ui/SharedUI';
import API from '../../../../api/axios';

export default function ModuleFlashcardsModal({ show, onClose, module, course, showMsg }) {
  const { t, i18n } = useTranslation();
  const [decks, setDecks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDeck, setSelectedDeck] = useState(null);
  
  // Modals state
  const [showDeckModal, setShowDeckModal] = useState(false);
  const [deckForm, setDeckForm] = useState({ id: null, chapter_name: '', topic_name: '', order: 1 });
  const [submittingDeck, setSubmittingDeck] = useState(false);
  
  // Upload State
  const [uploading, setUploading] = useState(false);

  // Load Decks
  const loadDecks = () => {
    if (!module?.id) return;
    setLoading(true);
    API.get(`/admin/modules/${module?.id}/flashcards`)
      .then(res => setDecks(res.data.decks || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };
  useEffect(() => { 
    if (show) loadDecks(); 
  }, [show, module?.id]);

  // Deck CRUD
  const saveDeck = async (e) => {
    e.preventDefault(); setSubmittingDeck(true);
    try {
      if (deckForm.id) {
        await API.put(`/admin/flashcard-decks/${deckForm.id}`, deckForm);
        showMsg('success', 'تم تعديل الفصل');
      } else {
        await API.post(`/admin/modules/${module?.id}/flashcards`, deckForm);
        showMsg('success', 'تم إضافة الفصل');
      }
      setShowDeckModal(false); loadDecks();
    } catch { showMsg('error', 'Error'); }
    finally { setSubmittingDeck(false); }
  };
  
  const deleteDeck = async (id) => {
    if (!confirm('هل أنت متأكد من حذف هذا الفصل بجميع الكروت التي بداخله؟')) return;
    try { await API.delete(`/admin/flashcard-decks/${id}`); showMsg('success', 'تم الحذف'); loadDecks(); }
    catch { showMsg('error', 'Error'); }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const res = await API.post(`/admin/modules/${module?.id}/flashcards/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      showMsg('success', res.data.message);
      loadDecks();
    } catch (err) {
      showMsg('error', 'فشل في استيراد الملف');
    } finally {
      setUploading(false);
      e.target.value = null; // reset input
    }
  };

  return show ? (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md flex justify-center p-4 sm:p-6 overflow-hidden">
      <div className="bg-surface-container border border-outline-variant/30 w-full max-w-6xl rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-outline-variant/20 bg-surface/50">
          <div>
            <h2 className="text-xl font-extrabold text-on-surface flex items-center gap-2">
              <button type="button" onClick={onClose} className="p-2 bg-surface hover:bg-surface-variant rounded-full transition-colors">
                {i18n.language === 'en' ? <ArrowLeft size={20} /> : <ArrowRight size={20} />}
              </button>
              إدارة الفصول والكروت: {module?.name}
            </h2>
          </div>
          {!selectedDeck && (
            <div className="flex gap-2">
              {/* <label className="px-4 py-2 bg-emerald-500/10 text-emerald-500 font-bold rounded-xl flex items-center gap-2 hover:bg-emerald-500/20 transition-all cursor-pointer">
                {uploading ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
                استيراد Excel
                <input type="file" accept=".xlsx, .xls" className="hidden" onChange={handleFileUpload} disabled={uploading} />
              </label> */}
              <button type="button" onClick={() => { setDeckForm({ id: null, chapter_name: '', topic_name: '', order: decks.length + 1 }); setShowDeckModal(true); }} className="px-4 py-2 bg-primary text-on-primary font-bold rounded-xl flex items-center gap-2 hover:bg-primary/90 transition-all">
                <Plus size={18} /> إضافة فصل
              </button>
            </div>
          )}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-hidden relative">
          {selectedDeck ? (
            <ItemsManager deck={selectedDeck} goBack={() => setSelectedDeck(null)} showMsg={showMsg} />
          ) : loading ? (
            <div className="flex justify-center items-center h-full"><Loader2 size={32} className="animate-spin text-primary" /></div>
          ) : decks.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-on-surface-variant">
              <p className="font-bold mb-4">لا توجد فصول بعد.</p>
            </div>
          ) : (
            <div className="p-6 overflow-y-auto h-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {decks.map(deck => (
                <div key={deck.id} className="bg-surface border border-outline-variant/30 rounded-2xl p-5 hover:border-primary/50 transition-all group flex flex-col">
                  <h3 className="font-bold text-on-surface mb-4 truncate">{deck.chapter_name}</h3>
                  <div className="flex items-center gap-2 mt-auto">
                    <button type="button" onClick={() => setSelectedDeck(deck)} className="flex-1 px-3 py-2 bg-primary/10 text-primary font-bold rounded-xl hover:bg-primary hover:text-on-primary transition-colors text-sm">
                      إدارة الكروت
                    </button>
                    <button type="button" onClick={() => { setDeckForm(deck); setShowDeckModal(true); }} className="p-2 text-on-surface-variant hover:text-primary bg-surface-variant/30 rounded-xl transition-colors"><Edit size={16} /></button>
                    <button type="button" onClick={() => deleteDeck(deck.id)} className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-xl transition-colors"><Trash2 size={16} /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Deck Modal */}
      <Modal open={showDeckModal} onClose={() => setShowDeckModal(false)} title={deckForm.id ? 'تعديل الفصل' : 'إضافة فصل'}>
        <form onSubmit={saveDeck} className="space-y-4">
          <Input label="اسم الفصل *" required value={deckForm.chapter_name} onChange={e => setDeckForm({...deckForm, chapter_name: e.target.value})} />
          <Input label="الترتيب" type="number" required value={deckForm.order} onChange={e => setDeckForm({...deckForm, order: e.target.value})} />
          <div className="pt-4 border-t border-outline-variant/30 flex justify-end gap-3">
            <button type="button" onClick={() => setShowDeckModal(false)} className="px-4 py-2 text-sm font-bold text-on-surface-variant">إلغاء</button>
            <SubmitBtn loading={submittingDeck} label="حفظ" />
          </div>
        </form>
      </Modal>
    </div>
  ) : null;
}

// -------------------------------------------------------------
// Items Manager (Cards inside a Deck)
// -------------------------------------------------------------
function ItemsManager({ deck, goBack, showMsg }) {
  const { t } = useTranslation();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  
  const [showItemModal, setShowItemModal] = useState(false);
  const [itemForm, setItemForm] = useState({ id: null, front_text: '', back_text: '', order: 1 });
  const [submittingItem, setSubmittingItem] = useState(false);

  const loadItems = () => {
    setLoading(true);
    API.get(`/admin/flashcard-decks/${deck.id}/items`)
      .then(res => setItems(res.data.items || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };
  useEffect(() => { loadItems(); }, [deck.id]);

  const handleItemsUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const res = await API.post(`/admin/flashcard-decks/${deck.id}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      showMsg('success', res.data.message);
      loadItems();
    } catch (err) {
      showMsg('error', 'فشل في استيراد الكروت');
    } finally {
      setUploading(false);
      e.target.value = null; // reset input
    }
  };

  const saveItem = async (e) => {
    e.preventDefault(); setSubmittingItem(true);
    try {
      if (itemForm.id) {
        await API.put(`/admin/flashcard-items/${itemForm.id}`, itemForm);
        showMsg('success', 'تم تعديل الكارت');
      } else {
        await API.post(`/admin/flashcard-decks/${deck.id}/items`, itemForm);
        showMsg('success', 'تم إضافة الكارت');
      }
      setShowItemModal(false); loadItems();
    } catch { showMsg('error', 'Error'); }
    finally { setSubmittingItem(false); }
  };

  const deleteItem = async (id) => {
    if (!confirm('حذف هذا الكارت؟')) return;
    try { await API.delete(`/admin/flashcard-items/${id}`); showMsg('success', 'تم الحذف'); loadItems(); }
    catch { showMsg('error', 'Error'); }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 bg-surface-variant/30 border-b border-outline-variant/20 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <button type="button" onClick={goBack} className="p-1.5 bg-surface hover:bg-surface-variant rounded-lg"><ArrowRight size={18} className="rtl:rotate-180" /></button>
          <span className="font-bold text-on-surface truncate max-w-md">{deck.chapter_name} (الكروت)</span>
        </div>
        <div className="flex items-center gap-2">
          <label className="px-4 py-2 bg-emerald-500/10 text-emerald-500 text-sm font-bold rounded-xl flex items-center gap-2 hover:bg-emerald-500/20 transition-all cursor-pointer">
            {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
            استيراد Excel
            <input type="file" accept=".xlsx, .xls" className="hidden" onChange={handleItemsUpload} disabled={uploading} />
          </label>
          <button type="button" onClick={() => { setItemForm({ id: null, front_text: '', back_text: '', order: items.length + 1 }); setShowItemModal(true); }} className="px-4 py-2 bg-primary text-on-primary text-sm font-bold rounded-xl flex items-center gap-2 hover:bg-primary/90">
            <Plus size={16} /> كارت جديد
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {loading ? (
          <div className="flex justify-center mt-10"><Loader2 size={24} className="animate-spin text-primary" /></div>
        ) : items.length === 0 ? (
          <div className="text-center font-bold text-on-surface-variant mt-10">لا توجد كروت. قم بإضافة كارت جديد.</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {items.map(item => (
              <div key={item.id} className="bg-surface border border-outline-variant/30 rounded-2xl p-4 flex flex-col group hover:border-primary/50 transition-colors">
                <div className="flex-1 space-y-4 mb-4">
                  <div className="bg-surface-container-low p-3 rounded-xl border border-outline-variant/20 relative pt-5">
                    <span className="absolute -top-2.5 rtl:right-3 ltr:left-3 px-2 bg-surface-container-low text-[10px] font-bold text-primary">السؤال (أمامي)</span>
                    <p className="text-sm font-bold text-on-surface leading-relaxed">{item.front_text}</p>
                  </div>
                  <div className="bg-surface-container-low p-3 rounded-xl border border-outline-variant/20 relative pt-5">
                    <span className="absolute -top-2.5 rtl:right-3 ltr:left-3 px-2 bg-surface-container-low text-[10px] font-bold text-emerald-500">الإجابة (خلفي)</span>
                    <p className="text-sm font-bold text-on-surface leading-relaxed">{item.back_text}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-auto pt-3 border-t border-outline-variant/20">
                  <span className="text-xs font-bold text-on-surface-variant bg-surface-variant px-2 py-1 rounded-md">ترتيب: {item.order}</span>
                  <div className="flex-1" />
                  <button type="button" onClick={() => { setItemForm(item); setShowItemModal(true); }} className="p-1.5 text-primary hover:bg-primary/10 rounded-lg"><Edit size={16} /></button>
                  <button type="button" onClick={() => deleteItem(item.id)} className="p-1.5 text-rose-500 hover:bg-rose-500/10 rounded-lg"><Trash2 size={16} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Item Modal */}
      <Modal open={showItemModal} onClose={() => setShowItemModal(false)} title={itemForm.id ? 'تعديل الكارت' : 'إضافة كارت جديد'}>
        <form onSubmit={saveItem} className="space-y-4">
          <Textarea label="الوجه الأمامي (السؤال) *" required value={itemForm.front_text} onChange={e => setItemForm({...itemForm, front_text: e.target.value})} rows={3} />
          <Textarea label="الوجه الخلفي (الإجابة) *" required value={itemForm.back_text} onChange={e => setItemForm({...itemForm, back_text: e.target.value})} rows={3} />
          <Input label="الترتيب" type="number" required value={itemForm.order} onChange={e => setItemForm({...itemForm, order: e.target.value})} />
          <div className="pt-4 border-t border-outline-variant/30 flex justify-end gap-3">
            <button type="button" onClick={() => setShowItemModal(false)} className="px-4 py-2 text-sm font-bold text-on-surface-variant">إلغاء</button>
            <SubmitBtn loading={submittingItem} label="حفظ الكارت" />
          </div>
        </form>
      </Modal>
    </div>
  );
}
