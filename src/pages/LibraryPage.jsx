import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import { Book, Download, Eye, Search, BookOpen, Layers, Globe, FileText, Sparkles } from 'lucide-react';

export default function LibraryPage() {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      API.get('/extras/books'),
      API.get('/extras/categories').catch(() => ({ data: { categories: [] } }))
    ])
      .then(([booksRes, catRes]) => {
        const fetchedBooks = booksRes.data.books || [];
        setBooks(fetchedBooks);

        if (catRes.data.categories && catRes.data.categories.length > 0) {
          setCategories(catRes.data.categories);
        } else {
          const uniqueCatIds = [...new Set(fetchedBooks.map((b) => b.category_id).filter(Boolean))];
          setCategories(uniqueCatIds.map((id) => ({ id, name: `قسم ${id}` })));
        }
      })
      .catch((err) => console.error('Error fetching library data:', err))
      .finally(() => setLoading(false));
  }, []);

  // زيادة عداد التحميل عند الضغط
  const handleDownload = (bookId) => {
    API.post(`/extras/books/${bookId}/download`).catch((err) =>
      console.error('Failed to update download count:', err)
    );

    setBooks((prev) =>
      prev.map((b) => (b.id === bookId ? { ...b, download_count: (b.download_count || 0) + 1 } : b))
    );
  };

  // تصفية الكتب حسب البحث والقسم
  const filteredBooks = books.filter((book) => {
    const matchesCategory =
      selectedCategory === 'all' || String(book.category_id) === String(selectedCategory);

    const matchesSearch =
      book.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.description?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-container-max mx-auto px-sm md:px-md py-lg space-y-md font-arabic text-on-background dir-rtl min-h-screen">
      
      {/* قسم الهيدر والتحكم الرئيسي */}
      <div className="relative overflow-hidden rounded-2xl bg-surface border border-outline-variant p-md md:p-lg shadow-glass space-y-md">
        
        {/* لمسة خلفية مضيئة */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-primary-container/40 rounded-full filter blur-3xl -z-10 pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-sm">
          <div>
            <div className="inline-flex items-center gap-xs px-sm py-1 rounded-full bg-primary-container text-on-primary-container text-label-sm mb-xs">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span>المكتبة الرقمية والمراجع</span>
            </div>
            <h1 className="text-headline-lg font-bold text-on-surface flex items-center gap-xs mt-xs">
              <BookOpen className="w-8 h-8 text-primary" /> الكتب والمراجع العلمية
            </h1>
            <p className="text-body-md text-on-surface-variant mt-xs">
              كتب ومراجع مجانية وقابلة للتحميل في تخصصات البرمجيات وتطوير الذكاء الاصطناعي
            </p>
          </div>

          <div className="self-start md:self-auto bg-surface-container-low border border-outline-variant px-md py-xs rounded-xl text-label-md text-on-surface-variant">
             المتاح حالياً: <span className="text-primary font-bold">{filteredBooks.length}</span> كتاب
          </div>
        </div>

        {/* حقل البحث */}
        <div className="relative">
          <Search className="absolute right-md top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
          <input
            type="text"
            placeholder="ابحث عن اسم الكتاب، اسم المؤلف، أو الموضوع..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pr-12 pl-md py-xs rounded-xl bg-surface-container border border-outline-variant text-on-surface text-body-md placeholder:text-on-surface-variant focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-container transition-all"
          />
        </div>

        {/* شريط الأقسام والتصنيفات */}
        {categories.length > 0 && (
          <div className="space-y-xs pt-xs">
            <div className="flex items-center gap-xs text-label-sm text-on-surface-variant">
              <Layers className="w-4 h-4 text-secondary" />
              <span>تصفية حسب القسم:</span>
            </div>

            <div className="flex items-center gap-xs overflow-x-auto pb-xs scrollbar-none">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-md py-xs rounded-xl text-label-md whitespace-nowrap transition-all ${
                  selectedCategory === 'all'
                    ? 'bg-primary text-on-primary shadow-glow'
                    : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant border border-outline-variant'
                }`}
              >
                الكل ({books.length})
              </button>

              {categories.map((cat) => {
                const count = books.filter((b) => String(b.category_id) === String(cat.id)).length;
                const isSelected = String(selectedCategory) === String(cat.id);

                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-md py-xs rounded-xl text-label-md whitespace-nowrap transition-all flex items-center gap-xs ${
                      isSelected
                        ? 'bg-primary text-on-primary shadow-glow'
                        : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant border border-outline-variant'
                    }`}
                  >
                    <span>{cat.name || `قسم ${cat.id}`}</span>
                    <span
                      className={`px-xs py-0.5 rounded-md text-label-sm ${
                        isSelected ? 'bg-on-primary/20 text-on-primary' : 'bg-surface-container-high text-on-surface'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* شبكة عرض الكتب */}
      {loading ? (
        /* شاشة التحميل skeleton */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-md">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className="animate-pulse bg-surface rounded-2xl p-md border border-outline-variant space-y-sm h-[380px]"
            >
              <div className="bg-surface-container-high rounded-xl h-40 w-full" />
              <div className="h-5 bg-surface-container-high rounded w-3/4" />
              <div className="h-4 bg-surface-container-high rounded w-1/2" />
              <div className="space-y-xs">
                <div className="h-3 bg-surface-container-high rounded w-full" />
                <div className="h-3 bg-surface-container-high rounded w-4/5" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredBooks.length === 0 ? (
        /* حالة عدم وجود نتائج */
        <div className="text-center py-xxl bg-surface rounded-2xl border border-outline-variant space-y-xs">
          <Book className="w-12 h-12 text-outline mx-auto" />
          <h3 className="text-headline-md text-on-surface">لم يتم العثور على أي كتب</h3>
          <p className="text-body-md text-on-surface-variant">جرب تغيير كلمات البحث أو اختيار قسم آخر</p>
        </div>
      ) : (
        /* قائمة الكروت */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-md">
          {filteredBooks.map((b) => (
            <div
              key={b.id}
              className="group bg-surface hover:bg-surface-container-lowest border border-outline-variant hover:border-primary/40 rounded-2xl p-md flex flex-col justify-between transition-all duration-300 hover:shadow-soft hover:-translate-y-1"
            >
              <div className="space-y-xs">
                {/* غلاف الكتاب */}
                <div className="relative h-44 w-full rounded-xl overflow-hidden bg-surface-container border border-outline-variant flex items-center justify-center">
                  {b.cover_image ? (
                    <img
                      src={b.cover_image}
                      alt={b.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="p-sm rounded-2xl bg-primary-container text-primary">
                      <Book className="w-10 h-10" />
                    </div>
                  )}

                  {/* الشارات العلوية */}
                  <div className="absolute top-2 right-2 flex gap-xs">
                    {b.language && (
                      <span className="inline-flex items-center gap-0.5 bg-surface/90 text-on-surface-variant text-label-sm px-xs py-0.5 rounded-md border border-outline-variant">
                        <Globe className="w-3 h-3 text-secondary" />
                        {b.language}
                      </span>
                    )}
                  </div>
                </div>

                {/* التفاصيل والعناوين */}
                <div className="space-y-xs">
                  <div className="flex items-center justify-between text-label-sm text-on-surface-variant">
                    <span className="text-primary font-semibold truncate">
                      المؤلف: {b.author_name}
                    </span>
                    {b.pages_count && (
                      <span className="flex items-center gap-0.5 text-on-surface-variant shrink-0">
                        <FileText className="w-3.5 h-3.5" />
                        {b.pages_count} ص
                      </span>
                    )}
                  </div>

                  <h3 className="text-headline-md text-on-surface font-bold line-clamp-1 group-hover:text-primary transition-colors">
                    {b.title}
                  </h3>

                  <p className="text-body-md text-on-surface-variant line-clamp-2 leading-relaxed">
                    {b.description || 'لا يوجد وصف متاح لهذا الكتاب.'}
                  </p>
                </div>
              </div>

              {/* الجزء السفلي: الإحصائيات وزر التحميل */}
              <div className="pt-sm mt-md border-t border-outline-variant space-y-xs">
                <div className="flex items-center justify-between text-label-sm text-on-surface-variant px-xs">
                  <span className="flex items-center gap-1">
                    <Download className="w-3.5 h-3.5 text-secondary" />
                    {b.download_count || 0} تحميل
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5 text-tertiary" />
                    {b.view_count || 0} مشاهدة
                  </span>
                </div>

                <a
                  href={b.book_file}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => handleDownload(b.id)}
                  className="w-full inline-flex items-center justify-center gap-xs py-xs px-md rounded-xl bg-primary hover:bg-primary-hover text-on-primary text-label-md transition-all shadow-glow active:scale-[0.98] text-center"
                >
                  <Download className="w-4 h-4" /> تحميل النسخة (PDF)
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}