// frontend/src/hooks/useTranslation.js

import { useLanguage } from '../context/LanguageContext';

export const useTranslation = () => {
  const { translations } = useLanguage();

  const t = (key, params = {}) => {
    let text = translations[key] || key;
    
    Object.entries(params).forEach(([paramKey, paramValue]) => {
      text = text.replace(`:${paramKey}`, paramValue);
    });
    
    return text;
  };

  return { t };
};