import { useLanguage } from '@/contexts/LanguageContext';
import { en } from '@/translations/en';
import { zh } from '@/translations/zh';

const translations = {
  en,
  zh,
  de: en, // Fallback to English for now
  ja: en, // Fallback to English for now
  ko: en  // Fallback to English for now
};

export const useTranslation = () => {
  const { language } = useLanguage();
  
  return {
    t: translations[language],
    language
  };
};
