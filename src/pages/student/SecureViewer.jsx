import React, { useEffect, useState, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../../context/AuthContext';
import { getFileUrl } from '../../utils/fileHelper';

export default function SecureViewer() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { t } = useTranslation();
  const [isFocused, setIsFocused] = useState(true);

  // Extract file url and name from state
  const fileUrl = getFileUrl(location.state?.fileUrl);
  const fileName = location.state?.fileName || t('studentDashboard.secureViewer.secureFile', 'Secure File');
  console.log(fileUrl);
  
  useEffect(() => {
    if (!fileUrl) {
      navigate(-1);
    }
  }, [fileUrl, navigate]);
 console.log(fileUrl);
 
  // Protection mechanisms
  useEffect(() => {
    // 1. Disable Right Click
    const handleContextMenu = (e) => e.preventDefault();
    
    // 2. Disable Keyboard Shortcuts (Print Screen, Copy, Print, Save)
    const handleKeyDown = (e) => {
      // Print Screen key
      if (e.key === 'PrintScreen' || e.code === 'PrintScreen') {
        try { navigator.clipboard.writeText(''); } catch (err) {} // Clear clipboard if possible
        e.preventDefault();
      }
      
      // Ctrl/Cmd + P (Print), S (Save), C (Copy), U (View Source)
      if (e.ctrlKey || e.metaKey) {
        if (['p', 's', 'c', 'u'].includes(e.key.toLowerCase())) {
          e.preventDefault();
        }
      }
    };

    // 3. Handle window focus/blur for hiding content when user switches windows (e.g., Snipping Tool)
    const handleFocus = () => setIsFocused(true);
    const handleBlur = () => {
      setIsFocused(false);
      try { navigator.clipboard.writeText(''); } catch (err) {} // Attempt to clear clipboard on blur
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
    };
  }, []);

  if (!fileUrl) return null;

  // Append a timestamp to bypass cached CSP headers
  const separator = fileUrl.includes('?') ? '&' : '?';
  const noCacheUrl = `${fileUrl}${separator}t=${Date.now()}`;

  // Append #toolbar=0 to PDF URLs to hide the native viewer toolbar
  const isPdf = fileUrl.toLowerCase().endsWith('.pdf') || fileUrl.includes('.pdf?');
  const viewerUrl = isPdf ? `${noCacheUrl}#toolbar=0&navpanes=0&scrollbar=0` : noCacheUrl;

  return (
    <div className="fixed inset-0 z-[9999] bg-surface flex flex-col items-center justify-center overflow-hidden select-none" dir="rtl">
      
      {/* Header */}
      <div className="w-full bg-surface-container-low border-b border-outline-variant/40 p-4 flex items-center justify-between z-50">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 bg-surface border border-outline-variant/50 rounded-xl hover:bg-surface-container transition-colors">
            <ArrowRight size={18} className="text-on-surface" />
          </button>
          <div>
            <h1 className="text-sm font-bold text-on-surface">{fileName}</h1>
            <p className="text-[10px] text-on-surface-variant flex items-center gap-1">
              <ShieldAlert size={12} className="text-emerald-500" />
              <span>{t('studentDashboard.secureViewer.copyright', 'This file is protected by copyright')}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="relative flex-1 w-full flex items-center justify-center bg-surface-container/50">
        
        {/* Anti-screenshot blur overlay */}
        {!isFocused && (
          <div className="absolute inset-0 z-50 bg-surface/90 backdrop-blur-xl flex flex-col items-center justify-center text-center p-6">
            <ShieldAlert size={64} className="text-primary mb-4" />
            <h2 className="text-xl font-bold text-on-surface mb-2">حماية المحتوى نشطة</h2>
            <p className="text-sm text-on-surface-variant max-w-md">
              تم إخفاء المحتوى لأن النافذة فقدت التركيز. يرجى النقر هنا أو إغلاق أي أدوات تصوير لاستكمال المشاهدة.
            </p>
          </div>
        )}

        {/* Dynamic Watermark Overlay (pointer-events-none so it doesn't block clicks if needed) */}
        <div className="absolute inset-0 z-40 pointer-events-none flex flex-wrap justify-center items-center opacity-[0.03] overflow-hidden mix-blend-difference">
          {Array.from({ length: 40 }).map((_, i) => (
            <div key={i} className="transform -rotate-45 text-2xl font-black text-on-surface p-12 whitespace-nowrap">
              {user?.name} - {user?.email || user?.phone}
            </div>
          ))}
        </div>

        {/* File Viewer (iframe) */}
        <div className="w-full h-full p-4 md:p-8 max-w-5xl mx-auto">
          <div className="w-full h-full bg-white rounded-2xl overflow-hidden shadow-2xl relative z-30">
            <iframe 
              src={viewerUrl} 
              className="w-full h-full border-0 pointer-events-auto"
              title={fileName}
              onContextMenu={(e) => e.preventDefault()}
            />
          </div>
        </div>

      </div>
    </div>
  );
}
