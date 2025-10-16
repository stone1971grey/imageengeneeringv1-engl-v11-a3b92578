import { useLanguage } from '@/contexts/LanguageContext';
import { navigationDataEn } from '@/translations/navigationData';
import { navigationDataDe } from '@/translations/navigationData.de';
import { navigationDataZh } from '@/translations/navigationData.zh';

export const useNavigationData = () => {
  const { language } = useLanguage();
  
  const navigationData = {
    en: navigationDataEn,
    de: navigationDataDe,
    zh: navigationDataZh,
    ja: navigationDataEn, // Fallback
    ko: navigationDataEn  // Fallback
  };
  
  return navigationData[language];
};
