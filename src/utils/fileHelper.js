export const getFileUrl = (path) => {
  if (!path) return '';
  if (typeof path !== 'string') return '';
  
  if (path.startsWith('http')) {
    return path.replace(/\/uploads\/\/uploads\//g, '/uploads/')
               .replace(/\/uploads\/uploads\//g, '/uploads/');
  }
  
  // Remove leading slashes
  let cleanPath = path.replace(/^\/+/, '');
  
  // Remove all occurrences of 'uploads/' and leading slashes at the beginning
  while (cleanPath.startsWith('uploads/') || cleanPath.startsWith('/')) {
    cleanPath = cleanPath.replace(/^uploads\//, '').replace(/^\/+/, '');
  }

  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const finalBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  
  return `${finalBase}/uploads/${cleanPath}`;
};
