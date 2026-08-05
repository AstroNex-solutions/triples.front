import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

export default function GuestRoute() {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  // لو المستخدم مسجل دخول بالفعل، قم بتوجيهه حسب دوره (أو للصفحة الرئيسية)
  if (user) {
    if (user.status === 'Admin' || user.is_superuser) return <Navigate to="/admin" replace />;
    if (user.status === 'Instructor') return <Navigate to="/instructor" replace />;
    if (user.status === 'Student') return <Navigate to="/dashboard" replace />;
    
    return <Navigate to="/" replace />; // توجيه افتراضي
  }

  // لو مش مسجل دخول، اعرض صفحات التسجيل
  return <Outlet />;
}