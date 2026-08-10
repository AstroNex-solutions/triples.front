import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import API from '../../api/axios';
import { SectionHeader, Card } from './SharedUI';

export default function QuestionBanksSection() {
  const [banks, setBanks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/student/question-banks')
      .then((res) => {
        setBanks(res.data.questionBanks || []);
      })
      .catch((err) => {
        console.error(err);
        setBanks([]);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <SectionHeader title="بنك الأسئلة" count={banks.length} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        {loading ? <Loader2 size={24} className="animate-spin text-primary m-4" /> : (
          banks.length === 0 ? <p className="text-xs text-on-surface-variant">لا توجد بنوك أسئلة متاحة حالياً.</p> :
          banks.map(b => (
            <Card key={b.id} className="border-l-4 border-l-primary">
              <h4 className="text-sm font-bold text-on-surface">{b.title}</h4>
              <p className="text-xs text-on-surface-variant mt-1">{b.price == 0 ? 'مجاني' : `$${b.price}`}</p>
              <Link to={`/question-bank/${b.id}`} className="mt-3 inline-block px-4 py-1.5 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg text-xs font-bold transition-all">
                تصفح الأسئلة
              </Link>
            </Card>
          ))
        )}
      </div>
    </>
  );
}
