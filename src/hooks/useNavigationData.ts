import { useLanguage } from '@/contexts/LanguageContext';
import { navigationDataEn } from '@/translations/navigationData';
import { navigationDataDe } from '@/translations/navigationData.de';
import { navigationDataZh } from '@/translations/navigationData.zh';
import { navigationDataJa } from '@/translations/navigationData.ja';
import { navigationDataKo } from '@/translations/navigationData.ko';

export const useNavigationData = () => {
  const { language } = useLanguage();
  
  const navigationData = {
    en: navigationDataEn,
    de: navigationDataDe,
    zh: navigationDataZh,
    ja: navigationDataJa,
    ko: navigationDataKo
  };
  
  return navigationData[language];
};
