import { useLanguage } from '@/contexts/LanguageContext';
import { en } from '@/translations/en';
import { zh } from '@/translations/zh';
import { ja } from '@/translations/ja';
import { ko } from '@/translations/ko';

const translations = {
  en,
  zh,
  de: en, // Fallback to English for now
  ja,
  ko
};

export const useTranslation = () => {
  const { language } = useLanguage();
  
  return {
    t: translations[language],
    language
  };
};
