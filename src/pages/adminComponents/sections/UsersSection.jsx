import { useOutletContext } from 'react-router-dom';
import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import API from '../../../api/axios';
import { 
  Search, Loader2, Edit3, Lock, Unlock, Ban, Trash2, ChevronRight, ChevronLeft,
  Users, GraduationCap, UserCheck, Snowflake, PlusCircle, X, CheckCircle2,
  ShieldAlert, User, RefreshCw, KeyRound, Phone, Mail
} from 'lucide-react';
import { SectionHeader, Card, Badge, statusBadge, Modal, Input, Select, SubmitBtn, StatCard } from '../ui/SharedUI';

const getBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  return envUrl.replace(/\/api\/?$/, '');
};

// Helper component to render User Avatar with fallback image / badge
function UserAvatar({ user }) {
  const [imgError, setImgError] = useState(false);

  const rawImg = user?.image_profile;
  const isInvalidImg = !rawImg || rawImg === 'blank.png' || rawImg === 'null' || rawImg === 'default.png';

  const baseUrl = getBaseUrl();
  let imageSrc = null;
  if (rawImg && !isInvalidImg) {
    if (rawImg.startsWith('http://') || rawImg.startsWith('https://')) {
      imageSrc = rawImg;
    } else {
      const path = rawImg.startsWith('/') ? rawImg : `/uploads/${rawImg}`;
      imageSrc = `${baseUrl}${path}`;
    }
  }

  const initials = user?.name
    ? user.name.trim().split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : null;

  if (imageSrc && !imgError) {
    return (
      <img
        src={imageSrc}
        alt={user?.name || 'User'}
        onError={() => setImgError(true)}
        className="w-10 h-10 rounded-2xl object-cover border border-outline-variant/40 shrink-0 shadow-sm"
      />
    );
  }

  return (
    <div className="w-10 h-10 rounded-2xl bg-primary/15 text-primary border border-primary/20 flex items-center justify-center font-black text-xs shrink-0 shadow-sm">
      {initials || <User size={18} />}
    </div>
  );
}

export default function UsersSection() {
  const { showMsg } = useOutletContext();
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState(''); // Student, Instructor, Admin
  const [filterFreeze, setFilterFreeze] = useState('all'); // 'all', 'active', 'frozen'

  // Modals
  const [editUser, setEditUser] = useState(null);
  const [freezeUserModal, setFreezeUserModal] = useState(null);
  const [unfreezeUserModal, setUnfreezeUserModal] = useState(null);
  const [deleteUserModal, setDeleteUserModal] = useState(null);
  const [freezeReason, setFreezeReason] = useState('');
  
  const [pwdUser, setPwdUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [pwdLoading, setPwdLoading] = useState(false);
  
  const [showAdd, setShowAdd] = useState(false);
  const [createForm, setCreateForm] = useState({ name: '', username: '', email: '', phone: '', password: '', status: 'Student' });
  const [createLoading, setCreateLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const itemsPerPage = 10;

  const fetchUsers = () => { 
    setLoading(true); 
    API.get(`/admin/users?search=${encodeURIComponent(search)}&status=${filterStatus}&page=${currentPage}&limit=${itemsPerPage}`)
      .then(r => {
        setUsers(r.data.users || []);
        setTotalPages(r.data.totalPages || 1);
        setTotalUsers(r.data.totalUsers || 0);
      })
      .catch(err => {
        console.error('Failed to fetch users', err);
        showMsg('error', t('admin.common.error') || 'Error fetching users');
      })
      .finally(() => setLoading(false)); 
  };

  useEffect(() => { setCurrentPage(1); }, [search, filterStatus]);
  useEffect(() => { fetchUsers(); }, [search, filterStatus, currentPage]);

  const handlePageChange = (p) => { if (p >= 1 && p <= totalPages) setCurrentPage(p); };

  // Local filtered list for freeze state
  const displayedUsers = useMemo(() => {
    if (filterFreeze === 'all') return users;
    if (filterFreeze === 'frozen') return users.filter(u => u.account_freeze?.is_frozen);
    if (filterFreeze === 'active') return users.filter(u => !u.account_freeze?.is_frozen);
    return users;
  }, [users, filterFreeze]);

  // Statistics Summary
  const stats = useMemo(() => {
    const students = users.filter(u => u.status === 'Student').length;
    const instructors = users.filter(u => u.status === 'Instructor').length;
    const frozen = users.filter(u => u.account_freeze?.is_frozen).length;
    return { total: totalUsers, students, instructors, frozen };
  }, [users, totalUsers]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await API.put(`/admin/users/${editUser.id}`, editUser);
      showMsg('success', t('admin.sections.users.userUpdatedSuccess'));
      setEditUser(null);
      fetchUsers();
    } catch (err) { 
      showMsg('error', err.response?.data?.message || t('admin.common.error') || 'Error'); 
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteUserModal) return;
    setActionLoading(true);
    try { 
      await API.delete(`/admin/users/${deleteUserModal.id}`); 
      showMsg('success', t('admin.sections.users.userDeletedSuccess')); 
      setDeleteUserModal(null);
      fetchUsers(); 
    } catch (err) { 
      showMsg('error', err.response?.data?.message || t('admin.common.error') || 'Error'); 
    } finally {
      setActionLoading(false);
    }
  };

  const handleFreezeSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await API.post(`/admin/users/${freezeUserModal.id}/freeze`, { reason: freezeReason });
      showMsg('success', t('admin.sections.users.userFrozenSuccess'));
      setFreezeUserModal(null); 
      setFreezeReason(''); 
      fetchUsers();
    } catch (err) { 
      showMsg('error', err.response?.data?.message || t('admin.common.error') || 'Error'); 
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnfreezeConfirm = async () => {
    if (!unfreezeUserModal) return;
    setActionLoading(true);
    try {
      await API.post(`/admin/users/${unfreezeUserModal.id}/unfreeze`);
      showMsg('success', t('admin.sections.users.userUnfrozenSuccess'));
      setUnfreezeUserModal(null);
      fetchUsers();
    } catch (err) { 
      showMsg('error', err.response?.data?.message || t('admin.common.error') || 'Error'); 
    } finally {
      setActionLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPwdLoading(true);
    try {
      await API.put(`/admin/users/${pwdUser.id}/password`, { password: newPassword });
      showMsg('success', t('admin.sections.users.passwordUpdated'));
      setPwdUser(null); 
      setNewPassword('');
    } catch (err) { 
      showMsg('error', err.response?.data?.message || t('admin.common.error') || 'Error'); 
    } finally { 
      setPwdLoading(false); 
    }
  };

  const resetCreateForm = () => {
    setCreateForm({ name: '', username: '', email: '', phone: '', password: '', status: 'Student' });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreateLoading(true);
    try {
      await API.post('/admin/users', createForm);
      showMsg('success', t('admin.sections.users.userCreatedSuccess'));
      setShowAdd(false);
      resetCreateForm();
      fetchUsers();
    } catch (err) {
      showMsg('error', err.response?.data?.message || t('admin.common.error') || 'Error');
    } finally {
      setCreateLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Section Title */}
      <SectionHeader 
        title={t('admin.sections.users.title')} 
        count={totalUsers} 
        onAdd={() => { resetCreateForm(); setShowAdd(true); }} 
        addLabel={t('admin.sections.users.addUser')} 
      />

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          label={t('admin.sections.users.totalUsers')} 
          value={stats.total} 
          icon={Users} 
          color="primary" 
        />
        <StatCard 
          label={t('admin.sections.users.studentsCount')} 
          value={stats.students} 
          icon={GraduationCap} 
          color="cyan" 
        />
        <StatCard 
          label={t('admin.sections.users.instructorsCount')} 
          value={stats.instructors} 
          icon={UserCheck} 
          color="amber" 
        />
        <StatCard 
          label={t('admin.sections.users.frozenCount')} 
          value={stats.frozen} 
          icon={Snowflake} 
          color="rose" 
        />
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4 sm:p-5">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search size={18} className="absolute inset-y-0 my-auto start-3.5 text-on-surface-variant/60" />
            <input 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              placeholder={t('admin.sections.users.searchPlaceholder')} 
              className="w-full ps-10 pe-4 py-2.5 bg-surface/80 border border-outline-variant/40 rounded-2xl text-xs sm:text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" 
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute inset-y-0 my-auto end-3 text-on-surface-variant/60 hover:text-on-surface"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Role & Status Filters */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
            <select 
              value={filterStatus} 
              onChange={e => setFilterStatus(e.target.value)} 
              className="px-3.5 py-2.5 bg-surface/80 border border-outline-variant/40 rounded-2xl text-xs sm:text-sm font-bold text-on-surface focus:outline-none focus:border-primary transition-all cursor-pointer"
            >
              <option value="">{t('admin.sections.users.allRoles')}</option>
              <option value="Student">{t('admin.sections.users.student')}</option>
              <option value="Instructor">{t('admin.sections.users.instructor')}</option>
              <option value="Admin">{t('admin.sections.users.admin')}</option>
            </select>

            <select 
              value={filterFreeze} 
              onChange={e => setFilterFreeze(e.target.value)} 
              className="px-3.5 py-2.5 bg-surface/80 border border-outline-variant/40 rounded-2xl text-xs sm:text-sm font-bold text-on-surface focus:outline-none focus:border-primary transition-all cursor-pointer"
            >
              <option value="all">{t('admin.sections.users.allStatuses')}</option>
              <option value="active">🟢 {t('admin.sections.users.active')}</option>
              <option value="frozen">🔴 {t('admin.sections.users.frozen')}</option>
            </select>

            <button
              onClick={fetchUsers}
              disabled={loading}
              title={isAr ? 'تحديث البيانات' : 'Refresh'}
              className="p-2.5 rounded-2xl bg-surface/80 border border-outline-variant/40 text-on-surface hover:bg-surface-variant transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin text-primary' : ''} />
            </button>
          </div>
        </div>
      </Card>

      {/* Main Table / Users List */}
      {loading ? (
        <Card className="py-20 flex flex-col justify-center items-center gap-3">
          <Loader2 size={36} className="animate-spin text-primary" />
          <p className="text-xs font-bold text-on-surface-variant animate-pulse">
            {t('admin.common.loading')}
          </p>
        </Card>
      ) : displayedUsers.length === 0 ? (
        <Card className="py-16 text-center text-on-surface-variant flex flex-col items-center justify-center gap-3">
          <div className="w-16 h-16 rounded-full bg-surface-variant/40 flex items-center justify-center text-on-surface-variant/50">
            <ShieldAlert size={34} />
          </div>
          <div className="space-y-1">
            <h4 className="text-base font-bold text-on-surface">
              {isAr ? 'لم يتم العثور على أي مستخدمين' : 'No users found'}
            </h4>
            <p className="text-xs text-on-surface-variant/70">
              {search || filterStatus || filterFreeze !== 'all'
                ? (isAr ? 'جرب تغيير خيارات البحث أو الفلترة.' : 'Try changing search query or filters.')
                : (isAr ? 'لا يوجد مستخدمون مسجلون حالياً.' : 'No registered users currently.')}
            </p>
          </div>
        </Card>
      ) : (
        <Card className="overflow-hidden p-0 border border-outline-variant/40">
          <div className="overflow-x-auto">
            <table className="w-full text-start text-xs sm:text-sm border-collapse">
              <thead>
                <tr className="border-b border-outline-variant/30 text-on-surface-variant/80 bg-surface-variant/20">
                  <th className="p-4 font-extrabold text-start">{t('admin.sections.users.name')}</th>
                  <th className="p-4 font-extrabold text-start">{t('admin.sections.users.email')}</th>
                  <th className="p-4 font-extrabold text-start">{isAr ? 'الكورسات المشترك بها' : 'Enrolled Courses'}</th>
                  <th className="p-4 font-extrabold text-start">{t('admin.sections.users.role')}</th>
                  <th className="p-4 font-extrabold text-start">{t('admin.sections.users.status')}</th>
                  <th className="p-4 font-extrabold text-center">{t('admin.sections.users.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {displayedUsers.map(u => {
                  const isFrozen = u.account_freeze?.is_frozen;

                  return (
                    <tr key={u.id} className="hover:bg-surface-variant/20 transition-colors group">
                      {/* User Avatar + Name */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <UserAvatar user={u} />
                          <div className="space-y-0.5">
                            <span className="font-extrabold text-on-surface text-sm block">
                              {u.name}
                            </span>
                            {u.username && (
                              <span className="text-[11px] text-on-surface-variant/70 font-mono block dir-ltr text-start">
                                @{u.username}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Email & Phone */}
                      <td className="p-4">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 text-xs text-on-surface font-medium" dir="ltr">
                            <Mail size={13} className="text-on-surface-variant/60" />
                            <span>{u.email}</span>
                          </div>
                          {u.phone && (
                            <div className="flex items-center gap-1.5 text-[11px] text-on-surface-variant/70 font-mono" dir="ltr">
                              <Phone size={12} className="text-on-surface-variant/50" />
                              <span>{u.phone}</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Courses */}
                      <td className="p-4 max-w-[200px]">
                        <div className="flex flex-wrap gap-1">
                          {u.status === 'Student' && u.enrollments && u.enrollments.length > 0 ? (
                            u.enrollments.map(en => (
                              <span key={en.id} className="text-[10px] px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20 line-clamp-1" title={en.course?.title}>
                                {en.course?.title || 'كورس'}
                              </span>
                            ))
                          ) : (
                            <span className="text-[11px] text-on-surface-variant/50">-</span>
                          )}
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td className="p-4">
                        <Badge 
                          text={
                            u.status === 'Student' ? t('admin.sections.users.student')
                            : u.status === 'Instructor' ? t('admin.sections.users.instructor')
                            : u.status === 'Admin' ? t('admin.sections.users.admin')
                            : u.status
                          }
                          variant={
                            u.status === 'Admin' ? 'danger'
                            : u.status === 'Instructor' ? 'warning'
                            : 'info'
                          }
                        />
                      </td>

                      {/* Freeze Status Badge */}
                      <td className="p-4">
                        {isFrozen ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                            {t('admin.sections.users.frozen')}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                            {t('admin.sections.users.active')}
                          </span>
                        )}
                      </td>

                      {/* Action Buttons */}
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button 
                            onClick={() => setEditUser({...u})} 
                            title={t('admin.sections.users.editUser')} 
                            className="p-2 rounded-xl bg-surface border border-outline-variant/40 text-on-surface-variant hover:text-amber-400 hover:bg-amber-500/10 transition-all cursor-pointer"
                          >
                            <Edit3 size={15} />
                          </button>

                          <button 
                            onClick={() => { setPwdUser(u); setNewPassword(''); }} 
                            title={t('admin.sections.users.changePassword')} 
                            className="p-2 rounded-xl bg-surface border border-outline-variant/40 text-on-surface-variant hover:text-violet-400 hover:bg-violet-500/10 transition-all cursor-pointer"
                          >
                            <KeyRound size={15} />
                          </button>

                          {isFrozen ? (
                            <button 
                              onClick={() => setUnfreezeUserModal(u)} 
                              title={t('admin.sections.users.unfreezeUser')} 
                              className="p-2 rounded-xl bg-surface border border-outline-variant/40 text-on-surface-variant hover:text-emerald-400 hover:bg-emerald-500/10 transition-all cursor-pointer"
                            >
                              <Unlock size={15} />
                            </button>
                          ) : (
                            <button 
                              onClick={() => { setFreezeUserModal(u); setFreezeReason(''); }} 
                              title={t('admin.sections.users.freezeUser')} 
                              className="p-2 rounded-xl bg-surface border border-outline-variant/40 text-on-surface-variant hover:text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer"
                            >
                              <Ban size={15} />
                            </button>
                          )}

                          <button 
                            onClick={() => setDeleteUserModal(u)} 
                            title={t('admin.common.delete')} 
                            className="p-2 rounded-xl bg-surface border border-outline-variant/40 text-on-surface-variant hover:text-rose-500 hover:bg-rose-500/10 transition-all cursor-pointer"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Table Footer with Pagination */}
          <div className="p-4 border-t border-outline-variant/30 bg-surface-variant/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs sm:text-sm text-on-surface-variant">
            <div className="font-medium">
              {isAr ? (
                <>عرض الصفحة <span className="font-extrabold text-on-surface">{currentPage}</span> من إجمالي <span className="font-extrabold text-on-surface">{totalPages}</span> ({totalUsers} مستخدم)</>
              ) : (
                <>Showing page <span className="font-extrabold text-on-surface">{currentPage}</span> of <span className="font-extrabold text-on-surface">{totalPages}</span> ({totalUsers} users)</>
              )}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 rounded-xl border border-outline-variant/40 bg-surface/50 text-on-surface disabled:opacity-30 disabled:pointer-events-none hover:bg-surface transition-all cursor-pointer"
                >
                  <ChevronLeft size={16} className={isAr ? 'rotate-180' : ''} />
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
                  className="p-2 rounded-xl border border-outline-variant/40 bg-surface/50 text-on-surface disabled:opacity-30 disabled:pointer-events-none hover:bg-surface transition-all cursor-pointer"
                >
                  <ChevronRight size={16} className={isAr ? 'rotate-180' : ''} />
                </button>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Edit User Modal */}
      <Modal open={Boolean(editUser)} onClose={() => setEditUser(null)} title={t('admin.sections.users.editUser')}>
        {editUser && (
          <form onSubmit={handleUpdate} className="space-y-4">
            <Input 
              label={`${t('admin.sections.users.name')} *`} 
              value={editUser.name} 
              onChange={e => setEditUser({...editUser, name: e.target.value})} 
              required 
            />
            <Input 
              label={t('admin.sections.users.phone')} 
              value={editUser.phone || ''} 
              onChange={e => setEditUser({...editUser, phone: e.target.value})} 
              dir="ltr" 
            />
            <Select 
              label={t('admin.sections.users.role')} 
              value={editUser.status} 
              onChange={e => setEditUser({...editUser, status: e.target.value})}
            >
              <option value="Student">{t('admin.sections.users.student')}</option>
              <option value="Instructor">{t('admin.sections.users.instructor')}</option>
              <option value="Admin">{t('admin.sections.users.admin')}</option>
            </Select>
            <SubmitBtn loading={actionLoading} label={t('admin.common.save')} />
          </form>
        )}
      </Modal>

      {/* Add User Modal */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title={t('admin.sections.users.addUser')}>
        <form onSubmit={handleCreate} className="space-y-4">
          <Input 
            label={`${t('admin.sections.users.name')} *`} 
            value={createForm.name} 
            onChange={e => setCreateForm({...createForm, name: e.target.value})} 
            required 
          />
          <Input 
            label={`${t('admin.sections.users.username')} *`} 
            value={createForm.username} 
            onChange={e => setCreateForm({...createForm, username: e.target.value})} 
            required 
            dir="ltr" 
          />
          <Input 
            label={`${t('admin.sections.users.email')} *`} 
            type="email" 
            value={createForm.email} 
            onChange={e => setCreateForm({...createForm, email: e.target.value})} 
            required 
            dir="ltr" 
          />
          <Input 
            label={t('admin.sections.users.phone')} 
            value={createForm.phone} 
            onChange={e => setCreateForm({...createForm, phone: e.target.value})} 
            dir="ltr" 
          />
          <Input 
            label={`${t('admin.sections.users.newPassword')} *`} 
            type="password" 
            value={createForm.password} 
            onChange={e => setCreateForm({...createForm, password: e.target.value})} 
            required 
            dir="ltr" 
          />
          <Select 
            label={t('admin.sections.users.role')} 
            value={createForm.status} 
            onChange={e => setCreateForm({...createForm, status: e.target.value})}
          >
            <option value="Student">{t('admin.sections.users.student')}</option>
            <option value="Instructor">{t('admin.sections.users.instructor')}</option>
            <option value="Admin">{t('admin.sections.users.admin')}</option>
          </Select>
          <SubmitBtn loading={createLoading} label={t('admin.sections.users.addUser')} />
        </form>
      </Modal>

      {/* Change Password Modal */}
      <Modal open={Boolean(pwdUser)} onClose={() => setPwdUser(null)} title={`${t('admin.sections.users.changePassword')} - ${pwdUser?.name}`}>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <Input 
            label={`${t('admin.sections.users.newPassword')} *`} 
            type="password" 
            required 
            value={newPassword} 
            onChange={e => setNewPassword(e.target.value)} 
            dir="ltr" 
          />
          <SubmitBtn loading={pwdLoading} label={t('admin.common.save')} />
        </form>
      </Modal>

      {/* Freeze Account Confirmation Modal */}
      <Modal open={Boolean(freezeUserModal)} onClose={() => setFreezeUserModal(null)} title={t('admin.sections.users.confirmFreezeTitle')}>
        {freezeUserModal && (
          <form onSubmit={handleFreezeSubmit} className="space-y-4">
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-start gap-3">
              <Ban size={22} className="shrink-0 mt-0.5" />
              <div className="space-y-1 text-xs sm:text-sm">
                <h5 className="font-bold">{freezeUserModal.name}</h5>
                <p className="opacity-90">{t('admin.sections.users.confirmFreezeMessage')}</p>
              </div>
            </div>

            <Input 
              label={t('admin.sections.users.freezeReason')} 
              value={freezeReason} 
              onChange={e => setFreezeReason(e.target.value)} 
              placeholder={isAr ? 'مخالفة الشروط والأحكام...' : 'Violation of terms...'} 
            />

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setFreezeUserModal(null)}
                className="px-4 py-2.5 rounded-2xl border border-outline-variant/40 text-on-surface-variant hover:text-on-surface hover:bg-surface-variant text-xs font-bold transition-all cursor-pointer"
              >
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="submit"
                disabled={actionLoading}
                className="px-5 py-2.5 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-glow cursor-pointer disabled:opacity-50"
              >
                {actionLoading ? <Loader2 size={16} className="animate-spin" /> : <Ban size={16} />}
                <span>{t('admin.sections.users.freezeUser')}</span>
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Unfreeze Account Confirmation Modal */}
      <Modal open={Boolean(unfreezeUserModal)} onClose={() => setUnfreezeUserModal(null)} title={t('admin.sections.users.confirmUnfreezeTitle')}>
        {unfreezeUserModal && (
          <div className="space-y-5">
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-start gap-3">
              <Unlock size={22} className="shrink-0 mt-0.5" />
              <div className="space-y-1 text-xs sm:text-sm">
                <h5 className="font-bold">{unfreezeUserModal.name}</h5>
                <p className="opacity-90">{t('admin.sections.users.confirmUnfreezeMessage')}</p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setUnfreezeUserModal(null)}
                className="px-4 py-2.5 rounded-2xl border border-outline-variant/40 text-on-surface-variant hover:text-on-surface hover:bg-surface-variant text-xs font-bold transition-all cursor-pointer"
              >
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleUnfreezeConfirm}
                disabled={actionLoading}
                className="px-5 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-glow cursor-pointer disabled:opacity-50"
              >
                {actionLoading ? <Loader2 size={16} className="animate-spin" /> : <Unlock size={16} />}
                <span>{t('admin.sections.users.unfreezeUser')}</span>
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete User Confirmation Modal */}
      <Modal open={Boolean(deleteUserModal)} onClose={() => setDeleteUserModal(null)} title={t('admin.sections.users.confirmDeleteTitle')}>
        {deleteUserModal && (
          <div className="space-y-5">
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-start gap-3">
              <ShieldAlert size={24} className="shrink-0 mt-0.5" />
              <div className="space-y-1 text-xs sm:text-sm">
                <h5 className="font-bold">{deleteUserModal.name} ({deleteUserModal.email})</h5>
                <p className="opacity-90">{t('admin.sections.users.confirmDeleteMessage')}</p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteUserModal(null)}
                className="px-4 py-2.5 rounded-2xl border border-outline-variant/40 text-on-surface-variant hover:text-on-surface hover:bg-surface-variant text-xs font-bold transition-all cursor-pointer"
              >
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={actionLoading}
                className="px-5 py-2.5 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-glow cursor-pointer disabled:opacity-50"
              >
                {actionLoading ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                <span>{t('admin.common.delete')}</span>
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
