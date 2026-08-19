import React, { useState } from 'react';
import axios from 'axios';

// Ensure you configure the API base URL appropriately if you have an axios instance.
// Using relative path assuming proxy is set, or relying on global configuration.
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const BrokenVideosList = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const checkVideos = async () => {
    setLoading(true);
    setError(null);
    try {
      // Get token from localStorage assuming standard JWT auth
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/admin/videos/check-broken`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setResult(response.data);
    } catch (err) {
      console.error(err);
      setError('حدث خطأ أثناء فحص الفيديوهات. تأكد من اتصالك بالخادم.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>فحص الفيديوهات المعطوبة</h2>
        <p style={styles.subtitle}>
          يقوم هذا الفحص بالمرور على جميع الدروس التي تحتوي على فيديوهات، والتأكد من أن الرابط يعمل بشكل سليم.
        </p>
      </div>

      <div style={styles.actions}>
        <button 
          onClick={checkVideos} 
          disabled={loading}
          style={{...styles.button, ...(loading ? styles.buttonDisabled : {})}}
        >
          {loading ? 'جاري الفحص (قد يستغرق بعض الوقت)...' : 'بدء فحص الفيديوهات الآن'}
        </button>
      </div>

      {error && (
        <div style={styles.errorAlert}>
          {error}
        </div>
      )}

      {result && (
        <div style={styles.resultContainer}>
          <div style={styles.stats}>
            <div style={styles.statBox}>
              <span style={styles.statLabel}>إجمالي الفيديوهات المفحوصة</span>
              <strong style={styles.statValue}>{result.totalChecked}</strong>
            </div>
            <div style={{...styles.statBox, backgroundColor: result.brokenCount > 0 ? '#fee2e2' : '#dcfce3'}}>
              <span style={styles.statLabel}>الفيديوهات المعطوبة</span>
              <strong style={{...styles.statValue, color: result.brokenCount > 0 ? '#ef4444' : '#22c55e'}}>
                {result.brokenCount}
              </strong>
            </div>
          </div>

          {result.brokenCount > 0 ? (
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>رقم الدرس</th>
                    <th style={styles.th}>اسم الدرس</th>
                    <th style={styles.th}>الرابط</th>
                    <th style={styles.th}>حالة الخطأ</th>
                  </tr>
                </thead>
                <tbody>
                  {result.brokenVideos.map((video, index) => (
                    <tr key={index} style={styles.tr}>
                      <td style={styles.td}>#{video.lessonId}</td>
                      <td style={styles.td}><strong>{video.title}</strong></td>
                      <td style={styles.td}>
                        <a href={video.url} target="_blank" rel="noreferrer" style={styles.link}>
                          {video.url.substring(0, 40)}...
                        </a>
                      </td>
                      <td style={styles.td}>
                        <span style={styles.badgeError}>
                          {video.status ? `Code: ${video.status}` : video.error}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={styles.successMessage}>
              🎉 ممتاز! جميع الفيديوهات التي تم فحصها تعمل بشكل سليم.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: '24px',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    direction: 'rtl'
  },
  header: {
    marginBottom: '24px'
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: '8px'
  },
  subtitle: {
    color: '#6b7280',
    fontSize: '15px'
  },
  actions: {
    marginBottom: '32px'
  },
  button: {
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.2s, transform 0.1s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 'fit-content'
  },
  buttonDisabled: {
    backgroundColor: '#9ca3af',
    cursor: 'not-allowed'
  },
  errorAlert: {
    padding: '16px',
    backgroundColor: '#fee2e2',
    color: '#b91c1c',
    borderRadius: '8px',
    marginBottom: '24px',
    border: '1px solid #f87171'
  },
  resultContainer: {
    marginTop: '24px',
    animation: 'fadeIn 0.5s ease-in-out'
  },
  stats: {
    display: 'flex',
    gap: '24px',
    marginBottom: '32px'
  },
  statBox: {
    flex: 1,
    padding: '20px',
    backgroundColor: '#f3f4f6',
    borderRadius: '12px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
  },
  statLabel: {
    color: '#4b5563',
    fontSize: '14px',
    marginBottom: '8px',
    fontWeight: '500'
  },
  statValue: {
    fontSize: '32px',
    color: '#1f2937'
  },
  successMessage: {
    padding: '24px',
    backgroundColor: '#dcfce3',
    color: '#166534',
    borderRadius: '12px',
    textAlign: 'center',
    fontSize: '18px',
    fontWeight: 'bold',
    border: '1px solid #bbf7d0'
  },
  tableWrapper: {
    overflowX: 'auto',
    borderRadius: '8px',
    border: '1px solid #e5e7eb'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'right'
  },
  th: {
    backgroundColor: '#f9fafb',
    padding: '12px 16px',
    borderBottom: '1px solid #e5e7eb',
    color: '#374151',
    fontWeight: '600',
    fontSize: '14px'
  },
  tr: {
    borderBottom: '1px solid #e5e7eb',
    transition: 'background-color 0.15s'
  },
  td: {
    padding: '16px',
    color: '#4b5563',
    fontSize: '14px'
  },
  link: {
    color: '#2563eb',
    textDecoration: 'none'
  },
  badgeError: {
    backgroundColor: '#fee2e2',
    color: '#dc2626',
    padding: '4px 8px',
    borderRadius: '9999px',
    fontSize: '12px',
    fontWeight: '600'
  }
};

export default BrokenVideosList;
