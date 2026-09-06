import { useOutletContext } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import API from '../../../api/axios';
import { Loader2, Trash2, Edit, ArrowLeft, ArrowRight } from 'lucide-react';
import { SectionHeader, Card, Badge, statusBadge, Input, Textarea, SubmitBtn } from '../ui/SharedUI';

export default function BannersSection() {
  const { showMsg } = useOutletContext();
  const { t, i18n } = useTranslation();
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('list'); // 'list', 'add', 'edit'
  const [editId, setEditId] = useState(null);
  
  const initialForm = { title: '', title_ar: '', description: '', description_ar: '', banner_type: 'main', button_text: '', button_text_ar: '', url: '' };
  const [form, setForm] = useState(initialForm);
  const [fileEn, setFileEn] = useState(null);
  const [fileAr, setFileAr] = useState(null);
  const [sub, setSub] = useState(false);

  const fetchBanners = () => { setLoading(true); API.get('/admin/banners').then(r => setBanners(r.data.banners || [])).catch(console.error).finally(() => setLoading(false)); };
  useEffect(() => { fetchBanners(); }, []);

  const handleAdd = () => {
    setForm(initialForm);
    setFileEn(null);
    setFileAr(null);
    setEditId(null);
    setView('add');
  };

  const handleEdit = (b) => {
    setForm({
      title: b.title || '',
      title_ar: b.title_ar || '',
      description: b.description || '',
      description_ar: b.description_ar || '',
      banner_type: b.banner_type || 'main',
      button_text: b.button_text || '',
      button_text_ar: b.button_text_ar || '',
      url: b.url || b.button_url || ''
    });
    setFileEn(null);
    setFileAr(null);
    setEditId(b.id);
    setView('edit');
  };

  const save = async (e) => {
    e.preventDefault(); setSub(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (fileEn) fd.append('image', fileEn);
      if (fileAr) fd.append('image_ar', fileAr);
      
      if (view === 'edit') {
        await API.put(`/admin/banners/${editId}`, fd);
        showMsg('success', 'Banner updated successfully / تم التعديل بنجاح');
      } else {
        await API.post('/admin/banners', fd);
        showMsg('success', t('admin.sections.banners.addBanner'));
      }
      setView('list'); 
      fetchBanners();
    } catch { showMsg('error', 'Error occurred / حدث خطأ'); } finally { setSub(false); }
  };

  const del = async (id) => { 
    if (!confirm('Delete? / هل أنت متأكد؟')) return; 
    try { await API.delete(`/admin/banners/${id}`); showMsg('success', t('admin.common.delete')); fetchBanners(); } 
    catch { showMsg('error', 'Error'); } 
  };

  const getDimensions = (type) => {
    switch (type) {
      case 'main': return '1920x800 px (Slider)';
      case 'header': return '1920x400 px (Header)';
      case 'sidebar': return '400x800 px (Sidebar)';
      case 'about_us': return '800x600 px (About)';
      case 'why_choose_us': return '800x600 px (Why Choose Us)';
      case 'med_message': return '1200x600 px (Med Msg)';
      default: return '1920x800 px';
    }
  };

  if (view === 'add' || view === 'edit') {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <button onClick={() => setView('list')} className="p-2 bg-surface rounded-xl border border-outline-variant/40 hover:bg-surface-container-high transition-colors text-on-surface-variant">
            {i18n.language === 'ar' ? <ArrowRight size={20} /> : <ArrowLeft size={20} />}
          </button>
          <h2 className="text-xl font-extrabold text-on-surface">
            {view === 'add' ? 'Add New Banner / إضافة بنر جديد' : 'Edit Banner / تعديل البنر'}
          </h2>
        </div>
        
        <Card className="p-6">
          <form onSubmit={save} className="space-y-6">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Title (EN) *" required value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
              <Input label="Title (AR)" value={form.title_ar} onChange={e => setForm({...form, title_ar: e.target.value})} />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-on-surface-variant block">Type / النوع</label>
              <select value={form.banner_type} onChange={e => setForm({...form, banner_type: e.target.value})} className="w-full p-3 rounded-xl border border-outline-variant/50 bg-surface text-sm text-on-surface outline-none focus:border-primary transition-colors">
                <option value="main">Main (Slider) / رئيسي</option>
                <option value="header">Header / رأس الصفحة</option>
                <option value="sidebar">Sidebar / جانبي</option>
                <option value="about_us">About Us / من نحن</option>
                <option value="why_choose_us">Why Choose Us / لماذا نحن</option>
                <option value="med_message">Medical Student Msg / رسالة لطلاب الطب</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Textarea label="Description (EN)" value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={3} />
              <Textarea label="Description (AR) / الوصف بالعربية" value={form.description_ar} onChange={e => setForm({...form, description_ar: e.target.value})} rows={3} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Button Text (EN)" value={form.button_text || ''} onChange={e => setForm({...form, button_text: e.target.value})} />
              <Input label="Button Text (AR) / نص الزر بالعربية" value={form.button_text_ar || ''} onChange={e => setForm({...form, button_text_ar: e.target.value})} />
            </div>

            <Input label="Button URL / رابط الزر" value={form.url || ''} onChange={e => setForm({...form, url: e.target.value})} />

            <div className="space-y-4 p-5 bg-surface-container-low rounded-2xl border border-outline-variant/30">
              <div className="flex items-center gap-2 text-primary font-bold bg-primary/10 p-3 rounded-xl">
                <span>Recommended Size / المقاس الموصى به:</span>
                <span className="text-on-surface bg-surface px-2 py-1 rounded-md text-xs">{getDimensions(form.banner_type)}</span>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-on-surface-variant block">Banner Image (EN) {view === 'add' && '*'}</label>
                  <input type="file" accept="image/*" onChange={e => setFileEn(e.target.files[0])} className="w-full text-sm text-on-surface-variant file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer" required={view === 'add'} />
                  {view === 'edit' && <p className="text-xs text-on-surface-variant/70 mt-1">Leave empty to keep current image.</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-on-surface-variant block">Banner Image (AR) {view === 'add' && '*'}</label>
                  <input type="file" accept="image/*" onChange={e => setFileAr(e.target.files[0])} className="w-full text-sm text-on-surface-variant file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer" required={view === 'add'} />
                  {view === 'edit' && <p className="text-xs text-on-surface-variant/70 mt-1">Leave empty to keep current image.</p>}
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <SubmitBtn loading={sub} label={view === 'add' ? 'Save Banner / حفظ البنر' : 'Update Banner / تحديث البنر'} className="px-8" />
            </div>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <>
      <SectionHeader title={t('admin.sections.banners.title')} count={banners.length} onAdd={handleAdd} addLabel={t('admin.sections.banners.addBanner')} />
      {loading ? <div className="py-12 flex justify-center"><Loader2 size={24} className="animate-spin text-primary" /></div> : (
        <Card>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 p-2">
            {banners.length === 0 ? (
              <div className="col-span-full py-16 flex flex-col items-center justify-center text-on-surface-variant/50 border-2 border-dashed border-outline-variant/30 rounded-3xl bg-surface-container-low/30">
                <p className="text-lg font-bold">No Banners Found / لا توجد بنرات</p>
                <p className="text-sm mt-2">Click "Add New Banner" to create one.</p>
              </div>
            ) : (
              banners.map(b => {
                const bTitleEN = b.title || 'No English Title';
                const bTitleAR = b.title_ar || 'بدون عنوان عربي';
                
                return (
                  <div key={b.id} className="bg-surface border border-outline-variant/40 rounded-3xl overflow-hidden hover:shadow-md hover:border-primary/30 transition-all group flex flex-col">
                    
                    {/* Image Section */}
                    <div className="relative aspect-[21/9] bg-surface-container-low overflow-hidden border-b border-outline-variant/20">
                      {b.image ? (
                        <img 
                          src={import.meta.env.VITE_API_URL+b.image} 
                          alt={bTitleEN} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" 
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-on-surface-variant/40 font-bold text-sm">
                          No Image
                        </div>
                      )}
                      
                      {/* Badges overlay */}
                      <div className="absolute top-3 right-3 flex flex-col gap-2 items-end">
                        {b.is_active ? <Badge text="Active" variant="success" /> : <Badge text="Inactive" variant="default" />}
                      </div>
                      <div className="absolute top-3 left-3">
                        {statusBadge(b.banner_type)}
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="p-5 flex-1 flex flex-col justify-between bg-gradient-to-b from-surface to-surface-container-low/30">
                      <div className="space-y-4 mb-6">
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-on-surface-variant/70 mb-1 font-bold">Title (EN)</p>
                          <h3 className="font-extrabold text-on-surface text-base line-clamp-1" title={bTitleEN}>{bTitleEN}</h3>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-on-surface-variant/70 mb-1 font-bold">العنوان (AR)</p>
                          <h3 className="font-extrabold text-on-surface text-base line-clamp-1" title={bTitleAR}>{bTitleAR}</h3>
                        </div>
                      </div>
                      
                      <div className="pt-4 border-t border-outline-variant/30 flex items-center justify-between mt-auto">
                        <span className="text-xs font-bold text-on-surface-variant bg-surface-container px-3 py-1.5 rounded-xl border border-outline-variant/30">
                          {b.banner_type.toUpperCase()}
                        </span>
                        <div className="flex items-center gap-2">
                          <button onClick={() => handleEdit(b)} className="p-2.5 rounded-xl bg-primary/10 text-primary hover:bg-primary border border-transparent hover:border-primary hover:text-on-primary hover:shadow-glow transition-all" title="Edit">
                            <Edit size={16} />
                          </button>
                          <button onClick={() => del(b.id)} className="p-2.5 rounded-xl bg-error/10 text-error hover:bg-error border border-transparent hover:border-error hover:text-on-error hover:shadow-glow-error transition-all" title="Delete">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>
      )}
    </>
  );
}
