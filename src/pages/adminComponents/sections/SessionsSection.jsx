import { useOutletContext } from 'react-router-dom';
import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import API from '../../../api/axios';
import { 
  Loader2, ShieldAlert, X, ChevronRight, ChevronLeft,
  Monitor, Smartphone, Tablet, Search, RefreshCw,
  Globe, Copy, Check, Activity, LogOut, Clock,
  UserCheck, ShieldCheck, Filter, User
} from 'lucide-react';
import { SectionHeader, Card, Badge, StatCard, Modal } from '../ui/SharedUI';

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

// Helper to parse User-Agent header into readable Device / Browser / OS details
const parseUserAgent = (uaString) => {
  if (!uaString) return { browser: 'غير معروف', os: 'غير معروف', type: 'desktop' };

  let os = 'Unknown OS';
  let browser = 'Unknown Browser';
  let type = 'desktop';

  // Detect OS
  if (/windows/i.test(uaString)) os = 'Windows';
  else if (/macintosh|mac os x/i.test(uaString)) os = 'macOS';
  else if (/iphone|ipod/i.test(uaString)) {
    os = 'iOS';
    type = 'mobile';
  } else if (/ipad/i.test(uaString)) {
    os = 'iPadOS';
    type = 'tablet';
  } else if (/android/i.test(uaString)) {
    os = 'Android';
    type = /mobile/i.test(uaString) ? 'mobile' : 'tablet';
  } else if (/linux/i.test(uaString)) os = 'Linux';

  // Detect Browser
  if (/edg/i.test(uaString)) browser = 'Microsoft Edge';
  else if (/chrome|crios/i.test(uaString)) browser = 'Google Chrome';
  else if (/firefox|fxios/i.test(uaString)) browser = 'Mozilla Firefox';
  else if (/safari/i.test(uaString) && !/chrome|crios/i.test(uaString)) browser = 'Apple Safari';
  else if (/opera|opr/i.test(uaString)) browser = 'Opera';

  return { browser, os, type };
};

// Relative time formatter helper
const formatRelativeTime = (dateString, lang) => {
  if (!dateString) return '—';
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return lang === 'ar' ? 'الآن' : 'Just now';
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return lang === 'ar' ? `منذ ${diffInMinutes} دقيقة` : `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return lang === 'ar' ? `منذ ${diffInHours} ساعة` : `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return lang === 'ar' ? `منذ ${diffInDays} يوم` : `${diffInDays}d ago`;

  return date.toLocaleDateString(lang === 'en' ? 'en-US' : 'ar-EG', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export default function SessionsSection() {
  const { showMsg } = useOutletContext();
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [revokingId, setRevokingId] = useState(null);
  const [confirmRevokeModal, setConfirmRevokeModal] = useState(null);
  const [copiedIp, setCopiedIp] = useState(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'active', 'ended'
  const [roleFilter, setRoleFilter] = useState('all'); // 'all', 'Student', 'Instructor', 'Admin'

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const fetchSessions = () => {
    setLoading(true);
    API.get('/admin/sessions')
      .then(r => setSessions(r.data.sessions || []))
      .catch(err => {
        console.error('Failed to fetch sessions', err);
        showMsg('error', isAr ? 'حدث خطأ أثناء تحميل الجلسات' : 'Failed to fetch sessions');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleRevoke = async (id) => {
    try {
      setRevokingId(id);
      await API.post(`/admin/sessions/${id}/revoke`);
      showMsg('success', isAr ? 'تم إنهاء الجلسة بنجاح' : 'Session revoked successfully');
      setConfirmRevokeModal(null);
      fetchSessions();
    } catch {
      showMsg('error', isAr ? 'حدث خطأ أثناء إنهاء الجلسة' : 'Failed to revoke session');
    } finally {
      setRevokingId(null);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedIp(text);
    setTimeout(() => setCopiedIp(null), 2000);
  };

  // Filtered Sessions
  const filteredSessions = useMemo(() => {
    return sessions.filter(s => {
      // Search
      const userName = s.user?.name || '';
      const userEmail = s.user?.email || '';
      const ip = s.ip_address || '';
      const ua = s.user_agent || '';
      const matchesSearch = 
        userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ip.includes(searchQuery) ||
        ua.toLowerCase().includes(searchQuery.toLowerCase());

      // Status
      let matchesStatus = true;
      if (statusFilter === 'active') matchesStatus = s.is_active === true;
      if (statusFilter === 'ended') matchesStatus = s.is_active === false;

      // Role
      let matchesRole = true;
      if (roleFilter !== 'all') matchesRole = s.user?.status === roleFilter;

      return matchesSearch && matchesStatus && matchesRole;
    });
  }, [sessions, searchQuery, statusFilter, roleFilter]);

  // Statistics Summary
  const stats = useMemo(() => {
    const total = sessions.length;
    const active = sessions.filter(s => s.is_active).length;
    const ended = total - active;
    const uniqueUsers = new Set(sessions.filter(s => s.is_active).map(s => s.user_id)).size;
    
    let mobileCount = 0;
    let desktopCount = 0;
    sessions.forEach(s => {
      const parsed = parseUserAgent(s.user_agent);
      if (parsed.type === 'mobile' || parsed.type === 'tablet') mobileCount++;
      else desktopCount++;
    });

    return { total, active, ended, uniqueUsers, mobileCount, desktopCount };
  }, [sessions]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredSessions.length / itemsPerPage) || 1;
  const paginatedSessions = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredSessions.slice(start, start + itemsPerPage);
  }, [filteredSessions, currentPage, itemsPerPage]);

  // Reset pagination on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, roleFilter]);

  return (
    <div className="space-y-6">
      {/* Top Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-on-surface flex items-center gap-2">
            <Activity className="text-primary" size={26} />
            {isAr ? 'إدارة الجلسات النشطة' : 'Active Sessions Management'}
          </h2>
          <p className="text-xs sm:text-sm text-on-surface-variant font-medium mt-1">
            {isAr 
              ? 'مراقبة وإدارة جلسات الدخول الحالية للمستخدمين والتحكم في الأجهزة المتصلة بالمنصة'
              : 'Monitor and manage active user login sessions and connected devices across the platform'}
          </p>
        </div>

        <button
          onClick={fetchSessions}
          disabled={loading}
          className="self-start sm:self-auto py-2.5 px-4 rounded-2xl bg-surface-container-low border border-outline-variant/40 hover:bg-surface-variant text-on-surface text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
        >
          <RefreshCw size={15} className={loading ? 'animate-spin text-primary' : ''} />
          {isAr ? 'تحديث البيانات' : 'Refresh'}
        </button>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          label={isAr ? 'الجلسات النشطة الآن' : 'Active Sessions Now'} 
          value={
            <span className="flex items-center gap-2">
              {stats.active}
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
            </span>
          } 
          icon={Activity} 
          color="emerald" 
        />
        <StatCard 
          label={isAr ? 'المستخدمون المتصلون' : 'Active Connected Users'} 
          value={stats.uniqueUsers} 
          icon={UserCheck} 
          color="primary" 
        />
        <StatCard 
          label={isAr ? 'أجهزة الكمبيوتر / الجوال' : 'Desktop / Mobile Ratio'} 
          value={`${stats.desktopCount} / ${stats.mobileCount}`} 
          icon={Monitor} 
          color="cyan" 
        />
        <StatCard 
          label={isAr ? 'إجمالي سجل الجلسات' : 'Total Sessions Record'} 
          value={stats.total} 
          icon={ShieldCheck} 
          color="violet" 
        />
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4 sm:p-5">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search size={18} className="absolute inset-y-0 my-auto start-3.5 text-on-surface-variant/60" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isAr ? 'بحث باسم المستخدم، الإيميل، أو الـ IP...' : 'Search by user, email, IP or browser...'}
              className="w-full ps-10 pe-4 py-2.5 bg-surface/80 border border-outline-variant/40 rounded-2xl text-xs sm:text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 my-auto end-3 text-on-surface-variant/60 hover:text-on-surface"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
            <div className="flex items-center gap-2">
              <Filter size={15} className="text-on-surface-variant opacity-70" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-surface/80 border border-outline-variant/40 rounded-xl text-xs font-bold text-on-surface focus:outline-none focus:border-primary transition-all"
              >
                <option value="all">{isAr ? 'جميع الحالات' : 'All Statuses'}</option>
                <option value="active">{isAr ? '🟢 نشطة فقط' : '🟢 Active Only'}</option>
                <option value="ended">{isAr ? '⚪ منتهية / ملغاة' : '⚪ Ended / Revoked'}</option>
              </select>
            </div>

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 bg-surface/80 border border-outline-variant/40 rounded-xl text-xs font-bold text-on-surface focus:outline-none focus:border-primary transition-all"
            >
              <option value="all">{isAr ? 'جميع الأدوار' : 'All Roles'}</option>
              <option value="Student">{isAr ? 'طلاب' : 'Students'}</option>
              <option value="Instructor">{isAr ? 'مدربون' : 'Instructors'}</option>
              <option value="Admin">{isAr ? 'مسؤولون (Admins)' : 'Admins'}</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Main Table / Sessions List */}
      {loading ? (
        <Card className="py-20 flex flex-col justify-center items-center gap-3">
          <Loader2 size={36} className="animate-spin text-primary" />
          <p className="text-xs font-bold text-on-surface-variant animate-pulse">
            {isAr ? 'جاري تحميل الجلسات...' : 'Loading active sessions...'}
          </p>
        </Card>
      ) : filteredSessions.length === 0 ? (
        <Card className="py-16 text-center text-on-surface-variant flex flex-col items-center justify-center gap-3">
          <div className="w-16 h-16 rounded-full bg-surface-variant/40 flex items-center justify-center text-on-surface-variant/50">
            <ShieldAlert size={34} />
          </div>
          <div className="space-y-1">
            <h4 className="text-base font-bold text-on-surface">
              {isAr ? 'لم يتم العثور على أي جلسات' : 'No sessions found'}
            </h4>
            <p className="text-xs text-on-surface-variant/70">
              {searchQuery || statusFilter !== 'all' || roleFilter !== 'all'
                ? (isAr ? 'جرب تغيير خيارات البحث أو التصفية.' : 'Try changing search criteria or reset filters.')
                : (isAr ? 'لا توجد جلسات متصلة بالمنصة حالياً.' : 'No active sessions currently on the platform.')}
            </p>
          </div>
        </Card>
      ) : (
        <Card className="overflow-hidden p-0 border border-outline-variant/40">
          <div className="overflow-x-auto">
            <table className="w-full text-start text-xs sm:text-sm border-collapse">
              <thead>
                <tr className="border-b border-outline-variant/30 text-on-surface-variant/80 bg-surface-variant/20">
                  <th className="p-4 font-extrabold text-start">{isAr ? 'المستخدم' : 'User'}</th>
                  <th className="p-4 font-extrabold text-start">{isAr ? 'الجهاز والمتصفح' : 'Device & Browser'}</th>
                  <th className="p-4 font-extrabold text-start">{isAr ? 'عنوان الـ IP' : 'IP Address'}</th>
                  <th className="p-4 font-extrabold text-start">{isAr ? 'وقت الدخول' : 'Logged In At'}</th>
                  <th className="p-4 font-extrabold text-start">{isAr ? 'الحالة' : 'Status'}</th>
                  <th className="p-4 font-extrabold text-center">{isAr ? 'الإجراءات' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {paginatedSessions.map((s) => {
                  const parsedUA = parseUserAgent(s.user_agent);

                  return (
                    <tr 
                      key={s.id} 
                      className="hover:bg-surface-variant/20 transition-colors group"
                    >
                      {/* User Column */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <UserAvatar user={s.user} />
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-on-surface text-sm">
                                {s.user?.name || (isAr ? 'مستخدم غير معروف' : 'Unknown User')}
                              </span>
                              {s.user?.status && (
                                <Badge 
                                  text={
                                    s.user.status === 'Student' ? (isAr ? 'طالب' : 'Student')
                                    : s.user.status === 'Instructor' ? (isAr ? 'مدرب' : 'Instructor')
                                    : s.user.status === 'Admin' ? (isAr ? 'مسؤول' : 'Admin')
                                    : s.user.status
                                  } 
                                  variant={
                                    s.user.status === 'Admin' ? 'danger'
                                    : s.user.status === 'Instructor' ? 'warning'
                                    : 'info'
                                  }
                                />
                              )}
                            </div>
                            <p className="text-xs text-on-surface-variant opacity-75 font-mono dir-ltr text-start">
                              {s.user?.email || '—'}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Device & Browser Column */}
                      <td className="p-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-surface-variant/40 border border-outline-variant/30 flex items-center justify-center text-primary shrink-0">
                            {parsedUA.type === 'mobile' ? (
                              <Smartphone size={16} />
                            ) : parsedUA.type === 'tablet' ? (
                              <Tablet size={16} />
                            ) : (
                              <Monitor size={16} />
                            )}
                          </div>
                          <div className="space-y-0.5">
                            <p className="font-bold text-on-surface text-xs">
                              {parsedUA.browser}
                            </p>
                            <p className="text-[11px] text-on-surface-variant/80 font-medium">
                              {parsedUA.os}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* IP Address Column */}
                      <td className="p-4">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-xs text-on-surface font-semibold bg-surface/70 border border-outline-variant/30 px-2.5 py-1 rounded-xl dir-ltr inline-block">
                            {s.ip_address || '127.0.0.1'}
                          </span>
                          {s.ip_address && (
                            <button
                              onClick={() => copyToClipboard(s.ip_address)}
                              title={isAr ? 'نسخ عنوان الـ IP' : 'Copy IP Address'}
                              className="p-1 rounded-lg text-on-surface-variant/60 hover:text-primary hover:bg-surface-variant transition-all cursor-pointer"
                            >
                              {copiedIp === s.ip_address ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                            </button>
                          )}
                        </div>
                      </td>

                      {/* Logged In Time Column */}
                      <td className="p-4">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-on-surface">
                            <Clock size={13} className="text-primary/70" />
                            <span>{formatRelativeTime(s.createdAt, i18n.language)}</span>
                          </div>
                          <p className="text-[11px] text-on-surface-variant/70 font-mono" dir="ltr">
                            {new Date(s.createdAt).toLocaleString(isAr ? 'ar-EG' : 'en-US', {
                              dateStyle: 'medium',
                              timeStyle: 'short',
                            })}
                          </p>
                        </div>
                      </td>

                      {/* Status Column */}
                      <td className="p-4">
                        {s.is_active ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            {isAr ? 'نشطة الآن' : 'Active Now'}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-surface-variant/50 text-on-surface-variant/70 border border-outline-variant/30">
                            <span className="w-2 h-2 rounded-full bg-on-surface-variant/40"></span>
                            {isAr ? 'منتهية / ملغاة' : 'Revoked'}
                          </span>
                        )}
                      </td>

                      {/* Action Column */}
                      <td className="p-4 text-center">
                        {s.is_active ? (
                          <button
                            onClick={() => setConfirmRevokeModal(s)}
                            disabled={revokingId === s.id}
                            className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 text-xs font-bold transition-all flex items-center gap-1.5 mx-auto cursor-pointer disabled:opacity-50"
                          >
                            {revokingId === s.id ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : (
                              <LogOut size={14} />
                            )}
                            <span>{isAr ? 'إنهاء الجلسة' : 'Revoke'}</span>
                          </button>
                        ) : (
                          <span className="text-xs text-on-surface-variant/40 italic">
                            {isAr ? 'معطلة' : 'Disabled'}
                          </span>
                        )}
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
                <>عرض <span className="font-extrabold text-on-surface">{paginatedSessions.length}</span> من إجمالي <span className="font-extrabold text-on-surface">{filteredSessions.length}</span> جلسة</>
              ) : (
                <>Showing <span className="font-extrabold text-on-surface">{paginatedSessions.length}</span> of <span className="font-extrabold text-on-surface">{filteredSessions.length}</span> sessions</>
              )}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-xl border border-outline-variant/40 hover:bg-surface-variant text-on-surface disabled:opacity-30 disabled:hover:bg-transparent transition-all cursor-pointer disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={16} className={isAr ? 'rotate-180' : ''} />
                </button>

                <span className="px-3 py-1.5 rounded-xl bg-surface/80 border border-outline-variant/30 text-xs font-bold text-on-surface">
                  {currentPage} / {totalPages}
                </span>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-xl border border-outline-variant/40 hover:bg-surface-variant text-on-surface disabled:opacity-30 disabled:hover:bg-transparent transition-all cursor-pointer disabled:cursor-not-allowed"
                >
                  <ChevronRight size={16} className={isAr ? 'rotate-180' : ''} />
                </button>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Revoke Session Confirmation Modal */}
      <Modal
        open={Boolean(confirmRevokeModal)}
        onClose={() => setConfirmRevokeModal(null)}
        title={isAr ? 'تأكيد إنهاء الجلسة' : 'Confirm Session Revocation'}
      >
        {confirmRevokeModal && (
          <div className="space-y-5">
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-start gap-3">
              <ShieldAlert size={24} className="shrink-0 mt-0.5" />
              <div className="space-y-1 text-xs sm:text-sm">
                <h5 className="font-bold">{isAr ? 'هل أنت تأكد من إنهاء هذه الجلسة؟' : 'Are you sure you want to revoke this session?'}</h5>
                <p className="opacity-90">
                  {isAr 
                    ? 'سيتم تسجيل خروج المستخدم فوراً من الجهاز الحالي وسيُطلب منه إعادة تسجيل الدخول.'
                    : 'The user will be immediately logged out from this device and will be required to log in again.'}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-surface/60 border border-outline-variant/40 space-y-2 text-xs sm:text-sm">
              <div className="flex justify-between">
                <span className="text-on-surface-variant">{isAr ? 'المستخدم:' : 'User:'}</span>
                <span className="font-bold text-on-surface">{confirmRevokeModal.user?.name || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">{isAr ? 'البريد الإلكتروني:' : 'Email:'}</span>
                <span className="font-mono text-on-surface">{confirmRevokeModal.user?.email || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">{isAr ? 'عنوان IP:' : 'IP Address:'}</span>
                <span className="font-mono text-on-surface">{confirmRevokeModal.ip_address || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">{isAr ? 'الجهاز / المتصفح:' : 'Device:'}</span>
                <span className="font-medium text-on-surface">
                  {parseUserAgent(confirmRevokeModal.user_agent).browser} ({parseUserAgent(confirmRevokeModal.user_agent).os})
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setConfirmRevokeModal(null)}
                className="px-4 py-2.5 rounded-2xl border border-outline-variant/40 text-on-surface-variant hover:text-on-surface hover:bg-surface-variant text-xs font-bold transition-all cursor-pointer"
              >
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                onClick={() => handleRevoke(confirmRevokeModal.id)}
                disabled={revokingId === confirmRevokeModal.id}
                className="px-5 py-2.5 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-glow cursor-pointer disabled:opacity-50"
              >
                {revokingId === confirmRevokeModal.id ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <LogOut size={16} />
                )}
                <span>{isAr ? 'نعم، إنهاء الجلسة الآن' : 'Yes, Revoke Session'}</span>
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
