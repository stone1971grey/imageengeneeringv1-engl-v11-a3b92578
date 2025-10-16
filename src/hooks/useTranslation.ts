import { useLanguage } from '@/contexts/LanguageContext';
import { en } from '@/translations/en';
import { de } from '@/translations/de';
import { zh } from '@/translations/zh';
import { ja } from '@/translations/ja';
import { ko } from '@/translations/ko';

const translations = {
  en,
  de,
  zh,
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
