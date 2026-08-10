import React from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';
import { SectionHeader, Card } from './SharedUI';

export default function LibrarySection() {
  return (
    <>
      <SectionHeader title="المصادر الإضافية" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="flex items-center justify-between border-l-4 border-l-cyan-500">
          <div>
            <h4 className="text-sm font-bold text-on-surface">المدونة الطبية</h4>
            <p className="text-xs text-on-surface-variant mt-1 max-w-xs">اقرأ أحدث المقالات والنصائح التعليمية لزيادة معرفتك.</p>
          </div>
          <Link to="/articles" className="p-3 bg-surface rounded-xl hover:bg-cyan-500/10 text-cyan-500 transition-colors"><ExternalLink size={20} /></Link>
        </Card>
        
        <Card className="flex items-center justify-between border-l-4 border-l-emerald-500">
          <div>
            <h4 className="text-sm font-bold text-on-surface">المكتبة الرقمية (الكتب)</h4>
            <p className="text-xs text-on-surface-variant mt-1 max-w-xs">تصفح وحمل أهم المراجع والكتب الطبية المتوفرة مجاناً.</p>
          </div>
          <Link to="/library" className="p-3 bg-surface rounded-xl hover:bg-emerald-500/10 text-emerald-500 transition-colors"><ExternalLink size={20} /></Link>
        </Card>
      </div>
    </>
  );
}
