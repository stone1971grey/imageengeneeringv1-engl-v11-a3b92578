import { Language } from '@/contexts/LanguageContext';

export const getLanguagePrefix = (language: Language): string => {
  return `/${language}`;
};

export const addLanguagePrefix = (path: string, language: Language): string => {
  // Remove any leading slashes
  const cleanPath = path.replace(/^\/+/, '');
  
  // Add language prefix
  return `/${language}/${cleanPath}`;
};

export const removeLanguagePrefix = (path: string): string => {
  const validLanguages = ['en', 'de', 'zh', 'ja', 'ko'];
  const parts = path.replace(/^\/+/, '').split('/');
  
  if (validLanguages.includes(parts[0])) {
    return '/' + parts.slice(1).join('/');
  }
  
  return path;
};
