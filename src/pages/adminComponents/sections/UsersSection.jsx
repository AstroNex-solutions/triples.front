import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import API from '../../../api/axios';
import { 
  Search, Loader2, Edit3Icon, Lock, Unlock, Ban, Trash2, ChevronRight, ChevronLeft
} from 'lucide-react';
import { SectionHeader, Card, Badge, statusBadge, Modal, Input, Select, SubmitBtn } from '../ui/SharedUI';

export default function UsersSection({ showMsg }) {
  const { t, i18n } = useTranslation();
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
        setUsers(r.data.users || []);
        setTotalPages(r.data.totalPages || 1);
        setTotalUsers(r.data.totalUsers || 0);
      })
      .catch(console.error)
      .finally(() => setLoading(false)); 
  };

  useEffect(() => { setCurrentPage(1); }, [search, filterStatus]);
  useEffect(() => { fetchUsers(); }, [search, filterStatus, currentPage]);

  const handlePageChange = (p) => { if (p >= 1 && p <= totalPages) setCurrentPage(p); };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await API.put(`/admin/users/${editUser.id}`, editUser);
      showMsg('success', t('admin.sections.users.editUser'));
      setEditUser(null); fetchUsers();
    } catch { showMsg('error', 'Error'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure? / هل أنت متأكد؟')) return;
    try { await API.delete(`/admin/users/${id}`); showMsg('success', t('admin.common.delete')); fetchUsers(); }
    catch (err) { showMsg('error', err.response?.data?.message || 'Error'); }
  };

  const handleFreeze = async (e) => {
    e.preventDefault();
    try {
      await API.post(`/admin/users/${freezeUser.id}/freeze`, { reason: freezeReason });
      showMsg('success', 'User frozen');
      setFreezeUser(null); setFreezeReason(''); fetchUsers();
    } catch { showMsg('error', 'Error'); }
  };

  const handleUnfreeze = async (id) => {
    try {
      await API.post(`/admin/users/${id}/unfreeze`);
      showMsg('success', 'User unfrozen');
      fetchUsers();
    } catch { showMsg('error', 'Error'); }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPwdLoading(true);
    try {
      await API.put(`/admin/users/${pwdUser.id}/password`, { password: newPassword });
      showMsg('success', 'Password updated');
      setPwdUser(null); setNewPassword('');
    } catch { showMsg('error', 'Error'); }
    finally { setPwdLoading(false); }
  };

  const resetCreateForm = () => {
    setCreateForm({ name: '', username: '', email: '', phone: '', password: '', status: 'Student' });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreateLoading(true);
    try {
      await API.post('/admin/users', createForm);
      showMsg('success', t('admin.sections.users.addUser'));
      setShowAdd(false);
      resetCreateForm();
      fetchUsers();
    } catch (err) {
      showMsg('error', err.response?.data?.message || 'Error');
    } finally {
      setCreateLoading(false);
    }
  };

  return (
    <>
      <SectionHeader title={t('admin.sections.users.title')} count={totalUsers} onAdd={() => { resetCreateForm(); setShowAdd(true); }} addLabel={t('admin.sections.users.addUser')} />
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className={`absolute top-1/2 -translate-y-1/2 text-on-surface-variant/50 ${i18n.language === 'en' ? 'left-3' : 'right-3'}`} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t('admin.common.search')} className={`w-full py-2.5 bg-surface/80 border border-outline-variant/50 rounded-2xl text-sm text-on-surface focus:outline-none focus:border-primary transition-all ${i18n.language === 'en' ? 'pl-9 pr-4' : 'pr-9 pl-4'}`} />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="px-4 py-2.5 bg-surface/80 border border-outline-variant/50 rounded-2xl text-sm text-on-surface focus:outline-none focus:border-primary transition-all">
          <option value="">All / الكل</option>
          <option value="Student">Student / طالب</option>
          <option value="Instructor">Instructor / محاضر</option>
          <option value="Admin">Admin / أدمن</option>
        </select>
      </div>

      {loading ? <div className="py-12 flex justify-center"><Loader2 size={24} className="animate-spin text-primary" /></div> : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-start text-xs sm:text-sm border-separate border-spacing-y-1">
              <thead>
                <tr className="text-on-surface-variant/70">
                  <th className="p-3 font-bold text-start">{t('admin.sections.users.name')}</th>
                  <th className="p-3 font-bold text-start">{t('admin.sections.users.email')}</th>
                  <th className="p-3 font-bold text-start">{t('admin.sections.users.role')}</th>
                  <th className="p-3 font-bold text-start">{t('admin.sections.users.status')}</th>
                  <th className="p-3 font-bold text-center">{t('admin.sections.users.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} className="bg-surface/50 hover:bg-surface/80 transition-all">
                    <td className="p-3 font-bold text-on-surface">{u.name}</td>
                    <td className="p-3 text-on-surface-variant" dir="ltr">{u.email}</td>
                    <td className="p-3">{statusBadge(u.status)}</td>
                    <td className="p-3">{u.account_freeze?.is_frozen ? <Badge text="Frozen / مجمد" variant="danger" /> : <Badge text="Active / نشط" variant="success" />}</td>
                    <td className="p-3">
                      <div className="flex items-center justify-center gap-1.5">
                        <button onClick={() => setEditUser({...u})} title="Edit" className="p-1.5 rounded-lg bg-surface border border-outline-variant/40 text-on-surface-variant hover:text-amber-400 transition-all cursor-pointer"><Edit3Icon size={14} /></button>
                        <button onClick={() => { setPwdUser(u); setNewPassword(''); }} title="Password" className="p-1.5 rounded-lg bg-surface border border-outline-variant/40 text-on-surface-variant hover:text-violet-400 transition-all cursor-pointer"><Lock size={14} /></button>
                        {u.account_freeze?.is_frozen
                          ? <button onClick={() => handleUnfreeze(u.id)} title="Unfreeze" className="p-1.5 rounded-lg bg-surface border border-outline-variant/40 text-on-surface-variant hover:text-emerald-400 transition-all cursor-pointer"><Unlock size={14} /></button>
                          : <button onClick={() => setFreezeUser(u)} title="Freeze" className="p-1.5 rounded-lg bg-surface border border-outline-variant/40 text-on-surface-variant hover:text-amber-400 transition-all cursor-pointer"><Ban size={14} /></button>
                        }
                        <button onClick={() => handleDelete(u.id)} title="Delete" className="p-1.5 rounded-lg bg-surface border border-outline-variant/40 text-on-surface-variant hover:text-rose-400 transition-all cursor-pointer"><Trash2 size={14} /></button>
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
                Page {currentPage} of {totalPages} ({totalUsers} total)
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-xl border border-outline-variant/40 bg-surface/50 text-on-surface-variant hover:text-on-surface hover:bg-surface disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
                >
                  <ChevronLeft size={16} className={i18n.language === 'ar' ? 'rotate-180' : ''} />
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                  .map((p, idx, arr) => (
                    <React.Fragment key={p}>
                      {idx > 0 && arr[idx - 1] !== p - 1 && <span className="px-1 text-on-surface-variant/40">...</span>}
                      <button
                        onClick={() => handlePageChange(p)}
                        className={`w-8 h-8 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                          currentPage === p
                            ? 'bg-primary text-on-primary shadow-sm'
                            : 'bg-surface/50 text-on-surface-variant border border-outline-variant/40 hover:bg-surface hover:text-on-surface'
                        }`}
                      >
                        {p}
                      </button>
                    </React.Fragment>
                  ))
                }

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded-xl border border-outline-variant/40 bg-surface/50 text-on-surface-variant hover:text-on-surface hover:bg-surface disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
                >
                  <ChevronRight size={16} className={i18n.language === 'ar' ? 'rotate-180' : ''} />
                </button>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Edit User Modal */}
      <Modal open={!!editUser} onClose={() => setEditUser(null)} title={t('admin.sections.users.editUser')}>
        {editUser && (
          <form onSubmit={handleUpdate} className="space-y-4">
            <Input label={t('admin.sections.users.name')} value={editUser.name} onChange={e => setEditUser({...editUser, name: e.target.value})} required />
            <Input label={t('admin.sections.users.phone')} value={editUser.phone || ''} onChange={e => setEditUser({...editUser, phone: e.target.value})} dir="ltr" />
            <Select label={t('admin.sections.users.role')} value={editUser.status} onChange={e => setEditUser({...editUser, status: e.target.value})}>
              <option value="Student">Student / طالب</option>
              <option value="Instructor">Instructor / محاضر</option>
              <option value="Admin">Admin / أدمن</option>
            </Select>
            <SubmitBtn label={t('admin.common.save')} />
          </form>
        )}
      </Modal>

      {/* Add User Modal */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title={t('admin.sections.users.addUser')}>
        <form onSubmit={handleCreate} className="space-y-4">
          <Input label={`${t('admin.sections.users.name')} *`} value={createForm.name} onChange={e => setCreateForm({...createForm, name: e.target.value})} required />
          <Input label="Username / اسم المستخدم *" value={createForm.username} onChange={e => setCreateForm({...createForm, username: e.target.value})} required dir="ltr" />
          <Input label={`${t('admin.sections.users.email')} *`} type="email" value={createForm.email} onChange={e => setCreateForm({...createForm, email: e.target.value})} required dir="ltr" />
          <Input label={t('admin.sections.users.phone')} value={createForm.phone} onChange={e => setCreateForm({...createForm, phone: e.target.value})} dir="ltr" />
          <Input label="Password / كلمة المرور *" type="password" value={createForm.password} onChange={e => setCreateForm({...createForm, password: e.target.value})} required dir="ltr" />
          <Select label={t('admin.sections.users.role')} value={createForm.status} onChange={e => setCreateForm({...createForm, status: e.target.value})}>
            <option value="Student">Student / طالب</option>
            <option value="Instructor">Instructor / محاضر</option>
            <option value="Admin">Admin / أدمن</option>
          </Select>
          <SubmitBtn loading={createLoading} label={t('admin.sections.users.addUser')} />
        </form>
      </Modal>

      {/* Change Password Modal */}
      <Modal open={!!pwdUser} onClose={() => setPwdUser(null)} title={`Password for ${pwdUser?.name}`}>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <Input label="New Password / كلمة المرور الجديدة *" type="password" required value={newPassword} onChange={e => setNewPassword(e.target.value)} dir="ltr" />
          <SubmitBtn loading={pwdLoading} label={t('admin.common.save')} />
        </form>
      </Modal>

      {/* Freeze Account Modal */}
      <Modal open={!!freezeUser} onClose={() => setFreezeUser(null)} title={`Freeze Account - ${freezeUser?.name}`}>
        <form onSubmit={handleFreeze} className="space-y-4">
          <Input label="Freeze Reason / سبب التجميد" value={freezeReason} onChange={e => setFreezeReason(e.target.value)} placeholder="Violation..." />
          <SubmitBtn label="Freeze / تجميد" className="!bg-rose-500 hover:!bg-rose-600" />
        </form>
      </Modal>
    </>
  );
}
