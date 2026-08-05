import React, { useState, useEffect } from 'react';
import API from '../../../api/axios';
import { 
  Users, GraduationCap, Shield, BookOpen, Layers, Package, 
  DollarSign, ClipboardList, FileText, BookMarked, Mail, Loader2 
} from 'lucide-react';
import { StatCard } from '../ui/SharedUI';

export default function DashboardSection() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => { 
    API.get('/admin/stats')
      .then(r => setStats(r.data))
      .catch(console.error)
      .finally(() => setLoading(false)); 
  }, []);

  if (loading) return <div className="py-20 flex justify-center"><Loader2 size={32} className="animate-spin text-primary" /></div>;
  if (!stats) return null;

  return (
    <>
      <h2 className="text-2xl font-extrabold text-on-surface">لوحة الإحصائيات</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <StatCard label="إجمالي المستخدمين" value={stats.totalUsers} icon={Users} color="primary" />
        <StatCard label="الطلاب" value={stats.totalStudents} icon={GraduationCap} color="emerald" />
        <StatCard label="المحاضرين" value={stats.totalInstructors} icon={Shield} color="violet" />
        <StatCard label="الكورسات" value={stats.totalCourses} icon={BookOpen} color="cyan" />
        <StatCard label="الاشتراكات" value={stats.totalEnrollments} icon={Layers} color="amber" />
        <StatCard label="الطلبات المكتملة" value={stats.totalOrders} icon={Package} color="emerald" />
        <StatCard label="إجمالي الإيرادات" value={`${stats.totalRevenue?.toFixed(2) || '0.00'}`} icon={DollarSign} color="cyan" />
        <StatCard label="كورسات بانتظار الاعتماد" value={stats.pendingCourses} icon={ClipboardList} color="amber" />
        <StatCard label="المقالات" value={stats.totalArticles} icon={FileText} color="violet" />
        <StatCard label="الكتب" value={stats.totalBooks} icon={BookMarked} color="primary" />
        <StatCard label="رسائل جديدة" value={stats.newMessages} icon={Mail} color="rose" />
      </div>
    </>
  );
}
