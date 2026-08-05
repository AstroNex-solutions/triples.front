import React from 'react';
import { 
  GraduationCap, 
  Target, 
  Eye, 
  Award, 
  Users, 
  BookOpen, 
  ShieldCheck, 
  HeartPulse,
  Sparkles 
} from 'lucide-react';

export default function AboutPage() {
  const stats = [
    { id: 1, label: 'طالب وطبيبة', value: '+10,000', icon: Users },
    { id: 2, label: 'دورة تدريبية', value: '+150', icon: BookOpen },
    { id: 3, label: 'محاضر متخصص', value: '+45', icon: GraduationCap },
    { id: 4, label: 'نسبة رضا الطلاب', value: '98%', icon: Award },
  ];

  const values = [
    {
      icon: ShieldCheck,
      title: 'الجودة والأمانة العلمية',
      description: 'نلتزم تقديم محتوى طبي وأكاديمي موثوق ومحدث وفق أحدث المعايير والدراسات الطبية العالمية.'
    },
    {
      icon: HeartPulse,
      title: 'التطوير المستمر',
      description: 'نسعى دائماً لتحديث المناهج والأدوات التعليمية لمواكبة التطورات السريعة في العلوم الطبية.'
    },
    {
      icon: Users,
      title: 'مجتمع أكاديمي تفاعلي',
      description: 'نوفر بيئة تعلّم داعمة تشجع على النقاش والمشاركة بين الطلاب والأطباء والمحاضرين.'
    }
  ];

  return (
    <div className="min-h-screen pb-20 pt-6 px-4 sm:px-6 lg:px-12 max-w-container-max mx-auto space-y-12 " dir="rtl">
      
      {/* 1. Hero Header */}
      <div className="relative rounded-3xl bg-surface-container-low/70 border border-outline-variant/40 p-8 sm:p-14 backdrop-blur-xl overflow-hidden shadow-sm text-center sm:text-right">
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold border border-primary/20">
            <Sparkles size={15} />
            <span>عن Triple S Academy</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-on-surface tracking-tight leading-tight">
            رائدون في تمكين الكوادر الطبية والأكاديمية
          </h1>
          <p className="text-on-surface-variant text-base sm:text-lg leading-relaxed">
            أكاديمية تعليمية متخصصة تهدف إلى تطوير مهارات الأطباء وطلاب الكليات الطبية من خلال دورات احترافية، ورش عمل تفاعلية، ومحتوى علمي رفيع المستوى.
          </p>
        </div>
      </div>

      {/* 2. Stats Section */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((item) => {
          const Icon = item.icon;
          return (
            <div 
              key={item.id} 
              className="rounded-3xl bg-surface-container-low/50 border border-outline-variant/30 p-6 text-center backdrop-blur-md hover:bg-surface-container-low transition-all"
            >
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary mx-auto flex items-center justify-center mb-3">
                <Icon size={24} />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-on-surface tracking-tight mb-1">
                {item.value}
              </div>
              <div className="text-xs sm:text-sm text-on-surface-variant/80 font-medium">
                {item.label}
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Vision & Mission Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Vision */}
        <div className="rounded-3xl bg-surface-container-low/60 border border-outline-variant/40 p-8 backdrop-blur-md space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-secondary-container/80 text-on-secondary-container flex items-center justify-center">
            <Eye size={24} />
          </div>
          <h2 className="text-xl font-extrabold text-on-surface">رؤيتنا</h2>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            أن نكون المنصة التعليمية الطبية الأولى والموثوقة في الوطن العربي، عبر تقديم تعليم طبي ذكي وتفاعلي يواكب أرقى المعايير العالمية ويصنع فارقاً حقيقياً في الممارسة الإكلينيكية.
          </p>
        </div>

        {/* Mission */}
        <div className="rounded-3xl bg-surface-container-low/60 border border-outline-variant/40 p-8 backdrop-blur-md space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
            <Target size={24} />
          </div>
          <h2 className="text-xl font-extrabold text-on-surface">رسالتنا</h2>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            تسهيل الوصول للتعليم الطبي المتقدم من خلال برامج تدريبية شاملة يلقيها أطباء واستشاريون بارزون، مع توفير بيئة تعليمية مرنة تدعم الطالب والممارس في جميع مراحل مسيرته المهنية.
          </p>
        </div>
      </div>

      {/* 4. Core Values */}
      <div className="space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-2xl font-extrabold text-on-surface">قيمنا الأساسية</h2>
          <p className="text-sm text-on-surface-variant">المبادئ التي تقودنا في تقديم أفضل خدمة تعليمية ممكنة</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {values.map((val, idx) => {
            const Icon = val.icon;
            return (
              <div 
                key={idx} 
                className="rounded-3xl bg-surface-container-low/40 border border-outline-variant/30 p-6 backdrop-blur-sm space-y-3"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <Icon size={20} />
                </div>
                <h3 className="text-base font-bold text-on-surface">{val.title}</h3>
                <p className="text-xs sm:text-sm text-on-surface-variant/80 leading-relaxed">
                  {val.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}