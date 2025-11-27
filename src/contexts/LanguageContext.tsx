import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export type Language = 'en' | 'de' | 'zh' | 'ja' | 'ko';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Extract language from URL path (e.g., /en/page -> 'en')
  const getLanguageFromPath = (): Language => {
    const pathParts = location.pathname.split('/').filter(Boolean);
    const firstPart = pathParts[0];
    
    const supportedLanguages: Language[] = ['en', 'de', 'zh', 'ja', 'ko'];
    const urlLang = supportedLanguages.includes(firstPart as Language) ? (firstPart as Language) : 'en';

    console.log('[LanguageProvider] getLanguageFromPath', {
      pathname: location.pathname,
      pathParts,
      resolvedLanguage: urlLang,
    });

    return urlLang;
  };

  const [language, setLanguageState] = useState<Language>(() => {
    const initialLang = getLanguageFromPath();
    console.log('[LanguageProvider] initial language state', { initialLang });
    return initialLang;
  });

  // Update language when URL changes
  useEffect(() => {
    const urlLang = getLanguageFromPath();
    if (urlLang !== language) {
      setLanguageState(urlLang);
      localStorage.setItem('language', urlLang);
    }
  }, [location.pathname]);

  // Persist language to localStorage
  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    
    // Update URL with new language prefix
    const pathParts = location.pathname.split('/').filter(Boolean);
    const currentLang = ['en', 'de', 'zh', 'ja', 'ko'].includes(pathParts[0]) ? pathParts[0] : null;
    
    let newPath: string;
    if (currentLang) {
      // Replace existing language prefix
      pathParts[0] = lang;
      newPath = '/' + pathParts.join('/');
    } else {
      // Add language prefix
      newPath = `/${lang}${location.pathname}`;
    }
    
    navigate(newPath, { replace: true });
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
