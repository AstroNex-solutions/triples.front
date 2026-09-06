import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import API from '../../../api/axios';
import ArticlesList from './articles/ArticlesList';
import ArticleForm from './articles/ArticleForm';

export default function ArticlesSection() {
  const { showMsg } = useOutletContext();
  const { t } = useTranslation();
  
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // View state: 'list' | 'add' | 'edit'
  const [view, setView] = useState('list');
  const [currentArticle, setCurrentArticle] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchArticles = () => {
    setLoading(true);
    API.get('/admin/articles')
      .then(r => setArticles(r.data.articles || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const handleAdd = () => {
    setCurrentArticle(null);
    setView('add');
  };

  const handleEdit = (article) => {
    setCurrentArticle(article);
    setView('edit');
  };

  const handleCancel = () => {
    setView('list');
    setCurrentArticle(null);
  };

  const handleSubmit = async (form, file) => {
    setSubmitting(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (file) fd.append('image', file);

      if (view === 'add') {
        await API.post('/admin/articles', fd);
        showMsg('success', t('admin.sections.articles.addArticle'));
      } else if (view === 'edit' && currentArticle) {
        await API.put(`/admin/articles/${currentArticle.id}`, fd);
        showMsg('success', t('admin.common.save'));
      }
      
      fetchArticles();
      setView('list');
    } catch (err) {
      showMsg('error', 'Error saving article');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure? / هل أنت متأكد؟')) return;
    try {
      await API.delete(`/admin/articles/${id}`);
      showMsg('success', t('admin.common.delete'));
      fetchArticles();
    } catch {
      showMsg('error', 'Error deleting article');
    }
  };

  if (view === 'add' || view === 'edit') {
    return (
      <ArticleForm 
        initialData={currentArticle} 
        onSubmit={handleSubmit} 
        onCancel={handleCancel} 
        submitting={submitting} 
      />
    );
  }

  return (
    <ArticlesList 
      articles={articles} 
      loading={loading} 
      onAdd={handleAdd} 
      onEdit={handleEdit} 
      onDelete={handleDelete} 
    />
  );
}
