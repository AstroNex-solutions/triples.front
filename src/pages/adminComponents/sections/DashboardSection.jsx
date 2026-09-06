import { useOutletContext } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import API from '../../../api/axios';
import { 
  Users, GraduationCap, Shield, BookOpen, Layers, Package, 
  DollarSign, ClipboardList, FileText, BookMarked, Mail, Loader2,
  TrendingUp, BarChart3, PieChart as PieChartIcon
} from 'lucide-react';
import { StatCard } from '../ui/SharedUI';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

export default function DashboardSection() {
  const { t } = useTranslation();
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
      <h2 className="text-2xl font-extrabold text-on-surface">{t('admin.sections.dashboardTitle')}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <StatCard label={t('admin.sections.totalUsers')} value={stats.totalUsers} icon={Users} color="primary" to="/admin/users" />
        <StatCard label={t('admin.sections.students')} value={stats.totalStudents} icon={GraduationCap} color="emerald" to="/admin/users" />
        <StatCard label={t('admin.sections.instructors')} value={stats.totalInstructors} icon={Shield} color="violet" to="/admin/users" />
        <StatCard label={t('admin.sections.courses')} value={stats.totalCourses} icon={BookOpen} color="cyan" to="/admin/courses" />
        <StatCard label={t('admin.sections.enrollments')} value={stats.totalEnrollments} icon={Layers} color="amber" to="/admin/enrollments" />
        <StatCard label={t('admin.sections.completedOrders')} value={stats.totalOrders} icon={Package} color="emerald" to="/admin/orders" />
        <StatCard label={t('admin.sections.totalRevenue')} value={`${stats.totalRevenue?.toFixed(2) || '0.00'}`} icon={DollarSign} color="cyan" to="/admin/orders" />
        <StatCard label={t('admin.sections.pendingCourses')} value={stats.pendingCourses} icon={ClipboardList} color="amber" to="/admin/courses" />
        <StatCard label={t('admin.sections.articlesLabel')} value={stats.totalArticles} icon={FileText} color="violet" to="/admin/articles" />
        <StatCard label={t('admin.sections.booksLabel')} value={stats.totalBooks} icon={BookMarked} color="primary" to="/admin/books" />
        <StatCard label={t('admin.sections.newMessages')} value={stats.newMessages} icon={Mail} color="rose" to="/admin/messages" />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        
        {/* Revenue Chart */}
        <div className="bg-surface border border-outline-variant/30 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 mb-6 text-on-surface">
            <TrendingUp className="text-emerald-500" size={20} />
            <h3 className="font-extrabold text-lg">Revenue Overview</h3>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.revenueChartData || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#88888833" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Enrollments Chart */}
        <div className="bg-surface border border-outline-variant/30 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 mb-6 text-on-surface">
            <BarChart3 className="text-primary" size={20} />
            <h3 className="font-extrabold text-lg">New Enrollments</h3>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.enrollmentsChartData || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#88888833" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} />
                <Tooltip cursor={{ fill: '#88888811' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                <Bar dataKey="enrollments" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Categories Pie Chart */}
        <div className="bg-surface border border-outline-variant/30 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow lg:col-span-2">
          <div className="flex items-center gap-2 mb-6 text-on-surface">
            <PieChartIcon className="text-violet-500" size={20} />
            <h3 className="font-extrabold text-lg">Courses by Category</h3>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={stats.categoryChartData || []} 
                  cx="50%" cy="50%" 
                  innerRadius={60} 
                  outerRadius={90} 
                  paddingAngle={5} 
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {(stats.categoryChartData || []).map((entry, index) => {
                    const COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4'];
                    return <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />;
                  })}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </>
  );
}
