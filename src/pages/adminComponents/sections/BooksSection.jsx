import { useOutletContext } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import API from '../../../api/axios';
import { useTranslation } from 'react-i18next';
import BooksList from './books/BooksList';
import BookForm from './books/BookForm';

export default function BooksSection() {
  const { showMsg } = useOutletContext();
  const { t } = useTranslation();
  
  const [viewState, setViewState] = useState('list'); // 'list', 'add', 'edit'
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingBook, setEditingBook] = useState(null);

  const fetchBooks = () => { 
    setLoading(true); 
    API.get('/admin/books')
      .then(r => setBooks(r.data.books || []))
      .catch(console.error)
      .finally(() => setLoading(false)); 
  };
  
  useEffect(() => { fetchBooks(); }, []);

  const handleAddSubmit = async (form, files) => {
    setSubmitting(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (files.book_file) fd.append('book_file', files.book_file);
      if (files.cover_image) fd.append('cover_image', files.cover_image);
      await API.post('/admin/books', fd);
      showMsg('success', t('admin.sections.books.addBook')); 
      setViewState('list'); 
      fetchBooks();
    } catch { 
      showMsg('error', 'Error adding book'); 
    } finally { 
      setSubmitting(false); 
    }
  };

  const handleEditSubmit = async (form, files) => {
    setSubmitting(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (files.book_file) fd.append('book_file', files.book_file);
      if (files.cover_image) fd.append('cover_image', files.cover_image);
      // Assuming PUT route exists. If not, it needs to be added to backend, 
      // but standard Astronex setup usually has PUT for /admin/books/:id
      await API.put(`/admin/books/${editingBook.id}`, fd);
      showMsg('success', 'Book updated successfully'); 
      setViewState('list'); 
      fetchBooks();
    } catch { 
      showMsg('error', 'Error updating book'); 
    } finally { 
      setSubmitting(false); 
    }
  };

  const handleDelete = async (id) => { 
    if (!confirm('Delete? / هل أنت متأكد؟')) return; 
    try { 
      await API.delete(`/admin/books/${id}`); 
      showMsg('success', t('admin.common.delete')); 
      fetchBooks(); 
    } catch { 
      showMsg('error', 'Error deleting book'); 
    } 
  };

  return (
    <div className="space-y-6">
      {viewState === 'list' && (
        <BooksList 
          books={books} 
          loading={loading} 
          onAdd={() => { setEditingBook(null); setViewState('add'); }}
          onEdit={(book) => { setEditingBook(book); setViewState('edit'); }}
          onDelete={handleDelete}
        />
      )}

      {viewState === 'add' && (
        <BookForm 
          onSubmit={handleAddSubmit}
          onCancel={() => setViewState('list')}
          submitting={submitting}
        />
      )}

      {viewState === 'edit' && (
        <BookForm 
          initialData={editingBook}
          onSubmit={handleEditSubmit}
          onCancel={() => setViewState('list')}
          submitting={submitting}
        />
      )}
    </div>
  );
}
