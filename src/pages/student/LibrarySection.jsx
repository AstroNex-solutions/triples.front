import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2, Book, FileText, Search, ExternalLink, X, Calendar, User, Eye, Download } from 'lucide-react';
import API from '../../api/axios';
import { SectionHeader } from './SharedUI';

export default function LibrarySection() {
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState('books'); // 'books' or 'articles'
  const [books, setBooks] = useState([]);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal for Article Reading
  const [selectedArticle, setSelectedArticle] = useState(null);

  useEffect(() => {
    const fetchLibrary = async () => {
      setLoading(true);
      try {
        const [booksRes, articlesRes] = await Promise.all([
          API.get('/extras/books'),
          API.get('/extras/articles')
        ]);
        // Filter out drafts or inactive if needed, assuming API returns correct ones
        setBooks(booksRes.data.books || []);
        setArticles(articlesRes.data.articles || []);
      } catch (err) {
        console.error("Failed to load library resources", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLibrary();
  }, []);

  const filteredBooks = books.filter(b => b.title.toLowerCase().includes(searchQuery.toLowerCase()) || (b.author_name && b.author_name.toLowerCase().includes(searchQuery.toLowerCase())));
  const filteredArticles = articles.filter(a => a.title.toLowerCase().includes(searchQuery.toLowerCase()) || (a.summary && a.summary.toLowerCase().includes(searchQuery.toLowerCase())));

  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    const cleanBase = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return cleanPath.includes('/uploads/') ? `${cleanBase}${cleanPath}` : `${cleanBase}/uploads${cleanPath}`;
  };

  const getFileUrl = (path) => {
    if (!path) return '#';
    if (path.startsWith('http')) return path;
    const cleanBase = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return cleanPath.includes('/uploads/') ? `${cleanBase}${cleanPath}` : `${cleanBase}/uploads${cleanPath}`;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <SectionHeader title={t('studentDashboard.library.title')} />

      {/* Tabs & Search */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-surface p-2 rounded-2xl border border-outline-variant/30 shadow-sm">
        <div className="flex w-full md:w-auto p-1 bg-surface-container-low rounded-xl">
          <button 
            onClick={() => setActiveTab('books')}
            className={`flex-1 md:w-32 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'books' ? 'bg-surface shadow-sm text-primary' : 'text-on-surface-variant hover:text-on-surface'}`}
          >
            <Book size={16} /> Books
          </button>
          <button 
            onClick={() => setActiveTab('articles')}
            className={`flex-1 md:w-32 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'articles' ? 'bg-surface shadow-sm text-primary' : 'text-on-surface-variant hover:text-on-surface'}`}
          >
            <FileText size={16} /> Articles
          </button>
        </div>

        <div className="relative w-full md:w-80">
          <Search size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant" />
          <input 
            type="text" 
            placeholder={activeTab === 'books' ? t('studentDashboard.library.books.search', 'Search books...') : t('studentDashboard.library.articles.search', 'Search articles...')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface-container-low border border-outline-variant/30 text-on-surface text-sm rounded-xl py-3 pl-4 pr-12 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center bg-surface border border-outline-variant/30 rounded-3xl">
          <Loader2 size={40} className="animate-spin text-primary mb-4" />
          <p className="text-on-surface-variant font-bold text-sm">{t('studentDashboard.shared.loading')}</p>
        </div>
      ) : activeTab === 'books' ? (
        // Books Grid
        filteredBooks.length === 0 ? (
          <div className="py-16 text-center bg-surface border border-outline-variant/30 rounded-3xl">
            <Book size={48} className="mx-auto text-outline-variant mb-4" />
            <h3 className="text-lg font-bold text-on-surface mb-2">{t('studentDashboard.library.books.noBooks')}</h3>
            <p className="text-on-surface-variant text-sm">We couldn't find any books matching your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredBooks.map((book) => (
              <a 
                key={book.id}
                href={getFileUrl(book.book_file)}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col bg-surface border border-outline-variant/30 rounded-3xl overflow-hidden hover:border-primary/40 hover:shadow-lg transition-all duration-300"
              >
                <div className="aspect-[3/4] w-full bg-surface-container-low relative overflow-hidden">
                  {book.cover_image ? (
                    <img src={getImageUrl(book.cover_image)} alt={book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-primary/30">
                      <Book size={64} />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                    <span className="flex items-center gap-2 bg-primary text-on-primary px-4 py-2 rounded-xl text-sm font-bold backdrop-blur-md">
                      <Download size={16} /> Read / Download
                    </span>
                  </div>
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="font-bold text-on-surface line-clamp-2 leading-snug group-hover:text-primary transition-colors mb-1">{book.title}</h3>
                  <p className="text-xs text-on-surface-variant flex items-center gap-1.5 mt-auto">
                    <User size={12} /> {book.author_name || t('studentDashboard.library.books.author')}
                  </p>
                </div>
              </a>
            ))}
          </div>
        )
      ) : (
        // Articles Grid
        filteredArticles.length === 0 ? (
          <div className="py-16 text-center bg-surface border border-outline-variant/30 rounded-3xl">
            <FileText size={48} className="mx-auto text-outline-variant mb-4" />
            <h3 className="text-lg font-bold text-on-surface mb-2">{t('studentDashboard.library.articles.noArticles')}</h3>
            <p className="text-on-surface-variant text-sm">We couldn't find any articles matching your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArticles.map((article) => (
              <div 
                key={article.id}
                onClick={() => setSelectedArticle(article)}
                className="group flex flex-col bg-surface border border-outline-variant/30 rounded-3xl overflow-hidden hover:border-primary/40 hover:shadow-lg transition-all duration-300 cursor-pointer"
              >
                {article.image && (
                  <div className="h-48 w-full bg-surface-container-low relative overflow-hidden">
                    <img src={getImageUrl(article.image)} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                )}
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex items-center gap-3 text-[10px] text-on-surface-variant mb-3 font-mono">
                    <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(article.createdAt).toLocaleDateString()}</span>
                    <span className="flex items-center gap-1"><Eye size={12} /> {article.views_count || 0}</span>
                  </div>
                  <h3 className="font-bold text-on-surface text-lg leading-snug group-hover:text-primary transition-colors mb-3 line-clamp-2">
                    {article.title}
                  </h3>
                  <p className="text-sm text-on-surface-variant line-clamp-3 leading-relaxed mb-4">
                    {article.summary || article.content.substring(0, 150).replace(/<[^>]+>/g, '') + '...'}
                  </p>
                  <div className="mt-auto pt-4 border-t border-outline-variant/20 text-xs font-bold text-primary flex items-center gap-2 group-hover:gap-3 transition-all">{t('studentDashboard.library.articles.read')} <ArrowRight size={14} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Article Reading Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-12">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedArticle(null)} />
          <div className="relative bg-surface w-full max-w-4xl max-h-full rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/30 bg-surface/80 backdrop-blur-md sticky top-0 z-10">
              <h2 className="font-bold text-on-surface truncate pr-4">{selectedArticle.title}</h2>
              <button 
                onClick={() => setSelectedArticle(null)}
                className="w-8 h-8 rounded-full bg-surface-variant text-on-surface-variant flex items-center justify-center hover:bg-rose-500 hover:text-white transition-colors shrink-0"
              >
                <X size={18} />
              </button>
            </div>
            
            {/* Modal Content */}
            <div className="overflow-y-auto p-6 md:p-10 custom-scrollbar">
              {selectedArticle.image && (
                <div className="w-full h-64 md:h-96 rounded-2xl overflow-hidden mb-8 border border-outline-variant/20 shadow-sm">
                  <img src={getImageUrl(selectedArticle.image)} alt={selectedArticle.title} className="w-full h-full object-cover" />
                </div>
              )}
              
              <h1 className="text-3xl md:text-4xl font-black text-on-surface mb-6 leading-tight">
                {selectedArticle.title}
              </h1>
              
              <div className="flex items-center gap-4 text-xs font-bold text-on-surface-variant mb-10 pb-6 border-b border-outline-variant/20">
                <span className="flex items-center gap-1.5"><Calendar size={14} /> {new Date(selectedArticle.createdAt).toLocaleDateString(i18n.language === 'en' ? 'en-US' : 'ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                <span className="flex items-center gap-1.5"><Eye size={14} /> {selectedArticle.views_count || 0} Views</span>
              </div>
              
              <div 
                className="prose prose-sm md:prose-base dark:prose-invert max-w-none prose-headings:font-bold prose-a:text-primary prose-img:rounded-2xl"
                dangerouslySetInnerHTML={{ __html: selectedArticle.content }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const ArrowRight = ({ size }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14"></path>
    <path d="m12 5 7 7-7 7"></path>
  </svg>
);
