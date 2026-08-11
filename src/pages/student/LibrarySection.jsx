import React from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { SectionHeader, Card } from './SharedUI';

export default function LibrarySection() {
  const { t } = useTranslation();
  return (
    <>
      <SectionHeader title={t('student.library.title')} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="flex items-center justify-between border-l-4 border-l-cyan-500">
          <div>
            <h4 className="text-sm font-bold text-on-surface">{t('student.library.blogTitle')}</h4>
            <p className="text-xs text-on-surface-variant mt-1 max-w-xs">{t('student.library.blogDesc')}</p>
          </div>
          <Link to="/articles" className="p-3 bg-surface rounded-xl hover:bg-cyan-500/10 text-cyan-500 transition-colors"><ExternalLink size={20} /></Link>
        </Card>
        
        <Card className="flex items-center justify-between border-l-4 border-l-emerald-500">
          <div>
            <h4 className="text-sm font-bold text-on-surface">{t('student.library.libraryTitle')}</h4>
            <p className="text-xs text-on-surface-variant mt-1 max-w-xs">{t('student.library.libraryDesc')}</p>
          </div>
          <Link to="/library" className="p-3 bg-surface rounded-xl hover:bg-emerald-500/10 text-emerald-500 transition-colors"><ExternalLink size={20} /></Link>
        </Card>
      </div>
    </>
  );
}
