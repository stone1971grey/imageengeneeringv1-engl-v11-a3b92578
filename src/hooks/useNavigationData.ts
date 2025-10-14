import { useLanguage } from '@/contexts/LanguageContext';
import { navigationDataEn } from '@/translations/navigationData';
import { navigationDataZh } from '@/translations/navigationData.zh';

export const useNavigationData = () => {
  const { language } = useLanguage();
  
  const navigationData = {
    en: navigationDataEn,
    zh: navigationDataZh,
    de: navigationDataEn, // Fallback
    ja: navigationDataEn, // Fallback
    ko: navigationDataEn  // Fallback
  };
  
  return navigationData[language];
};
