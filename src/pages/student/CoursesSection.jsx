import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, PlayCircle, Loader2, Compass } from 'lucide-react';
import API from '../../api/axios';
import { SectionHeader, Card, getImageSrc } from './SharedUI';

export default function CoursesSection() {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    API.get('/student/enrollments').then(r => setEnrollments(r.data.enrollments)).catch(console.error).finally(() => setLoading(false));
  }, []);

  return (
    <>
      <SectionHeader title="دوراتي المسجلة" count={enrollments.length}>
        <Link to="/courses" className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-xl text-xs font-bold hover:bg-primary-hover shadow-glow transition-all">
          <Compass size={16} />
          استكشاف الدورات
        </Link>
      </SectionHeader>
      {loading ? <div className="py-12 flex justify-center"><Loader2 size={24} className="animate-spin text-primary" /></div> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {enrollments.map(e => (
            <Card key={e.id} className="flex flex-col">
              <div className="h-32 rounded-xl bg-surface-variant/50 mb-4 overflow-hidden relative">
                {e.course?.image ? (
                  <img src={(e.course.image?.startsWith('http') ? e.course.image : getImageSrc(e.course.image))} alt={e.course.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-on-surface-variant opacity-50"><BookOpen size={40} /></div>
                )}
                {e.status === 'completed' && <div className="absolute top-2 right-2 bg-emerald-500 text-white text-[10px] font-bold px-2 py-1 rounded-lg">مكتمل 🎉</div>}
              </div>
              <h4 className="text-sm font-extrabold text-on-surface line-clamp-2 mb-2">{e.course?.title}</h4>
              
              <div className="mt-auto space-y-3">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px] font-bold text-on-surface-variant">
                    <span>التقدم</span>
                    <span>{Math.round(e.progress || 0)}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-outline-variant/20 overflow-hidden">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${e.progress || 0}%` }} />
                  </div>
                </div>
                
                <Link to={`/learn/${e.course_id}`} className="w-full py-2 bg-primary/10 text-primary hover:bg-primary/20 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer">
                  <PlayCircle size={16} /> متابعة التعلم
                </Link>
              </div>
            </Card>
          ))}
          {enrollments.length === 0 && (
            <div className="col-span-full py-12 text-center">
              <div className="w-16 h-16 bg-surface-variant/30 text-on-surface-variant/50 rounded-2xl flex items-center justify-center mx-auto mb-3"><BookOpen size={24} /></div>
              <p className="text-sm font-bold text-on-surface">لم تقم بالتسجيل في أي كورس بعد.</p>
              <Link to="/courses" className="text-xs text-primary font-bold hover:underline mt-2 inline-block">تصفح الكورسات المتاحة</Link>
            </div>
          )}
        </div>
      )}
    </>
  );
}
