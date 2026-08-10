import React, { useState, useEffect, useMemo } from 'react';
import API from '../../../api/axios';
import { 
  Search, Loader2, Edit3Icon, Lock, Unlock, Ban, Trash2, ChevronRight, ChevronLeft, PlusCircle
} from 'lucide-react';
import { SectionHeader, Card, Badge, statusBadge, Modal, Input, Select, Textarea, SubmitBtn } from '../ui/SharedUI';

export default function UsersSection({ showMsg }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [editUser, setEditUser] = useState(null);
  const [freezeUser, setFreezeUser] = useState(null);
  const [freezeReason, setFreezeReason] = useState('');
  const [pwdUser, setPwdUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [pwdLoading, setPwdLoading] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [createForm, setCreateForm] = useState({ name: '', username: '', email: '', phone: '', password: '', status: 'Student' });
  const [createLoading, setCreateLoading] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const itemsPerPage = 10;

  const fetchUsers = () => { 
    setLoading(true); 
    API.get(`/admin/users?search=${search}&status=${filterStatus}&page=${currentPage}&limit=${itemsPerPage}`)
      .then(r => {
        setUsers(r.data.users);
        setTotalPages(r.data.totalPages || 1);
        setTotalUsers(r.data.totalUsers || 0);
      })
      .catch(console.error)
      .finally(() => setLoading(false)); 
  };

  useEffect(() => { setCurrentPage(1); }, [search, filterStatus]);
  useEffect(() => { fetchUsers(); }, [search, filterStatus, currentPage]);

  const paginatedUsers = users; // Now using server-side pagination, so 'users' holds only the current page's items

  const handlePageChange = (p) => { if (p >= 1 && p <= totalPages) setCurrentPage(p); };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await API.put(`/admin/users/${editUser.id}`, editUser);
      showMsg('success', 'تم تحديث المستخدم بنجاح');
      setEditUser(null); fetchUsers();
    } catch { showMsg('error', 'خطأ في التحديث'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('هل تريد حذف هذا المستخدم؟')) return;
    try { await API.delete(`/admin/users/${id}`); showMsg('success', 'تم حذف المستخدم'); fetchUsers(); }
    catch (err) { showMsg('error', err.response?.data?.message || 'خطأ في الحذف'); }
  };

  const handleFreeze = async () => {
    try { await API.post(`/admin/users/${freezeUser.id}/freeze`, { reason: freezeReason }); showMsg('success', 'تم تجميد الحساب'); setFreezeUser(null); setFreezeReason(''); fetchUsers(); }
    catch { showMsg('error', 'خطأ في التجميد'); }
  };

  const handleUnfreeze = async (id) => {
    try { await API.post(`/admin/users/${id}/unfreeze`); showMsg('success', 'تم فك التجميد'); fetchUsers(); }
    catch { showMsg('error', 'خطأ'); }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) { showMsg('error', 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'); return; }
    setPwdLoading(true);
    try {
      await API.put(`/admin/users/${pwdUser.id}/password`, { password: newPassword });
      showMsg('success', `تم تغيير كلمة مرور ${pwdUser.name} بنجاح`);
      setPwdUser(null); setNewPassword('');
    } catch (err) { showMsg('error', err.response?.data?.message || 'خطأ في تغيير كلمة المرور'); }
    finally { setPwdLoading(false); }
  };

  const resetCreateForm = () => setCreateForm({ name: '', username: '', email: '', phone: '', password: '', status: 'Student' });

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreateLoading(true);
    try {
      await API.post('/admin/users', createForm);
      showMsg('success', `تم إنشاء حساب ${createForm.name || createForm.username} بنجاح`);
      setShowAdd(false); resetCreateForm(); fetchUsers();
    } catch (err) { showMsg('error', err.response?.data?.message || 'خطأ في إنشاء المستخدم'); }
    finally { setCreateLoading(false); }
  };

  return (
    <>
      <SectionHeader title="إدارة المستخدمين" count={totalUsers} onAdd={() => { resetCreateForm(); setShowAdd(true); }} addLabel="مستخدم جديد" />
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="بحث بالاسم أو الإيميل..." className="w-full pr-9 pl-4 py-2.5 bg-surface/80 border border-outline-variant/50 rounded-2xl text-sm text-on-surface focus:outline-none focus:border-primary transition-all" />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="px-4 py-2.5 bg-surface/80 border border-outline-variant/50 rounded-2xl text-sm text-on-surface focus:outline-none focus:border-primary transition-all">
          <option value="">الكل</option>
          <option value="Student">طالب</option>
          <option value="Instructor">محاضر</option>
          <option value="Admin">أدمن</option>
        </select>
      </div>

      {loading ? <div className="py-12 flex justify-center"><Loader2 size={24} className="animate-spin text-primary" /></div> : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs sm:text-sm border-separate border-spacing-y-1">
              <thead><tr className="text-on-surface-variant/70">
                <th className="p-3 font-bold">الاسم</th><th className="p-3 font-bold">الإيميل</th><th className="p-3 font-bold">النوع</th><th className="p-3 font-bold">الحالة</th><th className="p-3 font-bold text-center">الإجراءات</th>
              </tr></thead>
              <tbody>
                {paginatedUsers.map(u => (
                  <tr key={u.id} className="bg-surface/50 hover:bg-surface/80 transition-all">
                    <td className="p-3 font-bold text-on-surface">{u.name}</td>
                    <td className="p-3 text-on-surface-variant" dir="ltr">{u.email}</td>
                    <td className="p-3">{statusBadge(u.status)}</td>
                    <td className="p-3">{u.account_freeze?.is_frozen ? <Badge text="مجمد" variant="danger" /> : <Badge text="نشط" variant="success" />}</td>
                    <td className="p-3">
                      <div className="flex items-center justify-center gap-1.5">
                        <button onClick={() => setEditUser({...u})} title="تعديل" className="p-1.5 rounded-lg bg-surface border border-outline-variant/40 text-on-surface-variant hover:text-amber-400 transition-all cursor-pointer"><Edit3Icon size={14} /></button>
                        <button onClick={() => { setPwdUser(u); setNewPassword(''); }} title="تغيير كلمة المرور" className="p-1.5 rounded-lg bg-surface border border-outline-variant/40 text-on-surface-variant hover:text-violet-400 transition-all cursor-pointer"><Lock size={14} /></button>
                        {u.account_freeze?.is_frozen
                          ? <button onClick={() => handleUnfreeze(u.id)} title="فك التجميد" className="p-1.5 rounded-lg bg-surface border border-outline-variant/40 text-on-surface-variant hover:text-emerald-400 transition-all cursor-pointer"><Unlock size={14} /></button>
                          : <button onClick={() => setFreezeUser(u)} title="تجميد" className="p-1.5 rounded-lg bg-surface border border-outline-variant/40 text-on-surface-variant hover:text-amber-400 transition-all cursor-pointer"><Ban size={14} /></button>
                        }
                        <button onClick={() => handleDelete(u.id)} title="حذف" className="p-1.5 rounded-lg bg-surface border border-outline-variant/40 text-on-surface-variant hover:text-rose-400 transition-all cursor-pointer"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-3 sm:p-4 border-t border-outline-variant/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm text-on-surface-variant">
              <span>
                عرض {((currentPage - 1) * itemsPerPage) + 1} إلى {Math.min(currentPage * itemsPerPage, totalUsers)} من إجمالي {totalUsers} مستخدم
              </span>
              <div className="flex items-center gap-1.5" dir="rtl">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-lg border border-outline-variant/40 hover:bg-surface-variant disabled:opacity-40 disabled:hover:bg-transparent transition-all cursor-pointer disabled:cursor-not-allowed"
                >
                  <ChevronRight size={16} />
                </button>
                {(() => {
                  const pages = [];
                  if (totalPages <= 7) {
                    for (let i = 1; i <= totalPages; i++) pages.push(i);
                  } else {
                    pages.push(1);
                    if (currentPage > 3) pages.push('...');
                    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) pages.push(i);
                    if (currentPage < totalPages - 2) pages.push('...');
                    pages.push(totalPages);
                  }
                  return pages.map((p, idx) =>
                    p === '...'
                      ? <span key={`ellipsis-${idx}`} className="w-7 h-7 flex items-center justify-center text-on-surface-variant/50 text-xs select-none">…</span>
                      : <button
                          key={p}
                          onClick={() => handlePageChange(p)}
                          className={`w-7 h-7 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                            p === currentPage
                              ? 'bg-primary text-on-primary border-primary'
                              : 'border-outline-variant/40 hover:bg-surface-variant text-on-surface-variant'
                          }`}
                        >
                          {p}
                        </button>
                  );
                })()}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded-lg border border-outline-variant/40 hover:bg-surface-variant disabled:opacity-40 disabled:hover:bg-transparent transition-all cursor-pointer disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={16} />
                </button>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Create User Modal */}
      <Modal open={showAdd} onClose={() => { setShowAdd(false); resetCreateForm(); }} title="إضافة مستخدم جديد">
        <form onSubmit={handleCreate} className="space-y-4">
          {/* Role selector cards */}
          <div>
            <label className="text-xs font-bold text-on-surface-variant block mb-2">نوع الحساب *</label>
            <div className="grid grid-cols-3 gap-2">
              {[{ value: 'Student', label: 'طالب', color: 'cyan' }, { value: 'Instructor', label: 'محاضر', color: 'violet' }, { value: 'Admin', label: 'أدمن', color: 'rose' }].map(role => (
                <button
                  key={role.value}
                  type="button"
                  onClick={() => setCreateForm({ ...createForm, status: role.value })}
                  className={`py-2 px-3 rounded-2xl text-xs font-bold border-2 transition-all cursor-pointer ${
                    createForm.status === role.value
                      ? role.color === 'cyan' ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400'
                        : role.color === 'violet' ? 'bg-violet-500/20 border-violet-500 text-violet-400'
                        : 'bg-rose-500/20 border-rose-500 text-rose-400'
                      : 'border-outline-variant/40 text-on-surface-variant hover:border-outline-variant'
                  }`}
                >
                  {role.label}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="الاسم الكامل" value={createForm.name} onChange={e => setCreateForm({ ...createForm, name: e.target.value })} placeholder="محمد أحمد" />
            <Input label="اسم المستخدم *" required value={createForm.username} onChange={e => setCreateForm({ ...createForm, username: e.target.value })} placeholder="mohamedahmed" dir="ltr" />
            <Input label="البريد الإلكتروني *" type="email" required value={createForm.email} onChange={e => setCreateForm({ ...createForm, email: e.target.value })} placeholder="email@example.com" dir="ltr" />
            <Input label="رقم الهاتف" type="tel" value={createForm.phone} onChange={e => setCreateForm({ ...createForm, phone: e.target.value })} placeholder="+201234567890" dir="ltr" />
          </div>
          <Input label="كلمة المرور *" type="password" required minLength={6} value={createForm.password} onChange={e => setCreateForm({ ...createForm, password: e.target.value })} placeholder="6 أحرف على الأقل" />
          <div className="flex items-center gap-3 pt-1">
            <button type="submit" disabled={createLoading} className="py-2.5 px-6 bg-primary text-on-primary font-bold text-sm rounded-2xl hover:bg-primary-hover disabled:opacity-60 transition-all flex items-center gap-2 shadow-glow cursor-pointer">
              {createLoading ? <Loader2 size={16} className="animate-spin" /> : <PlusCircle size={16} />}
              إنشاء الحساب
            </button>
            <button type="button" onClick={() => { setShowAdd(false); resetCreateForm(); }} className="py-2.5 px-4 rounded-2xl border border-outline-variant/50 text-xs text-on-surface-variant hover:bg-surface/50 transition-all cursor-pointer">
              إلغاء
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit User Modal */}
      <Modal open={!!editUser} onClose={() => setEditUser(null)} title="تعديل المستخدم">
        {editUser && (
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Input label="الاسم" value={editUser.name || ''} onChange={e => setEditUser({...editUser, name: e.target.value})} />
              <Input label="الإيميل" value={editUser.email || ''} onChange={e => setEditUser({...editUser, email: e.target.value})} dir="ltr" />
              <Select label="النوع" value={editUser.status} onChange={e => setEditUser({...editUser, status: e.target.value})}>
                <option value="Student">طالب</option><option value="Instructor">محاضر</option><option value="Admin">أدمن</option>
              </Select>
              <Select label="نشط" value={editUser.is_active ? 'true' : 'false'} onChange={e => setEditUser({...editUser, is_active: e.target.value === 'true'})}>
                <option value="true">نعم</option><option value="false">لا</option>
              </Select>
            </div>
            <SubmitBtn label="حفظ التعديلات" />
          </form>
        )}
      </Modal>

      {/* Change Password Modal */}
      <Modal open={!!pwdUser} onClose={() => { setPwdUser(null); setNewPassword(''); }} title="تغيير كلمة المرور">
        {pwdUser && (
          <form onSubmit={handleChangePassword} className="space-y-5">
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-violet-500/10 border border-violet-500/20">
              <div className="w-9 h-9 rounded-full bg-violet-500/20 text-violet-400 flex items-center justify-center shrink-0">
                <Lock size={16} />
              </div>
              <div>
                <p className="text-xs text-on-surface-variant">تغيير كلمة مرور</p>
                <p className="text-sm font-bold text-on-surface">{pwdUser.name}</p>
                <p className="text-xs text-on-surface-variant/70" dir="ltr">{pwdUser.email}</p>
              </div>
            </div>
            <Input
              label="كلمة المرور الجديدة *"
              type="password"
              required
              minLength={6}
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="أدخل كلمة مرور جديدة (6 أحرف على الأقل)"
            />
            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={pwdLoading}
                className="py-2.5 px-6 bg-violet-600 text-white font-bold text-sm rounded-2xl hover:bg-violet-700 disabled:opacity-60 transition-all flex items-center gap-2 cursor-pointer"
              >
                {pwdLoading ? <Loader2 size={16} className="animate-spin" /> : <Lock size={16} />}
                تغيير كلمة المرور
              </button>
              <button type="button" onClick={() => { setPwdUser(null); setNewPassword(''); }} className="py-2.5 px-4 rounded-2xl border border-outline-variant/50 text-xs text-on-surface-variant hover:bg-surface/50 transition-all cursor-pointer">
                إلغاء
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Freeze Modal */}
      <Modal open={!!freezeUser} onClose={() => setFreezeUser(null)} title="تجميد الحساب">
        {freezeUser && (
          <div className="space-y-4">
            <p className="text-sm text-on-surface-variant">تجميد حساب: <strong className="text-on-surface">{freezeUser.name}</strong></p>
            <Textarea label="سبب التجميد" value={freezeReason} onChange={e => setFreezeReason(e.target.value)} placeholder="أدخل سبب التجميد..." />
            <button onClick={handleFreeze} className="py-2.5 px-6 bg-rose-500 text-white font-bold text-sm rounded-2xl hover:bg-rose-600 transition-all flex items-center gap-2 cursor-pointer"><Ban size={16} /> تأكيد التجميد</button>
          </div>
        )}
      </Modal>
    </>
  );
}
