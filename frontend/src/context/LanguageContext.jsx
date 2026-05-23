// frontend/src/context/LanguageContext.jsx

import React, { createContext, useContext, useEffect, useState } from 'react';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('en');
  const [translations, setTranslations] = useState({});

  useEffect(() => {
    // Load from localStorage or API
    const savedLanguage = localStorage.getItem('ulms_language') || 'en';
    loadLanguage(savedLanguage);
  }, []);

  const loadLanguage = async (lang) => {
    try {
      const response = await import(`../locales/${lang}.json`);
      setTranslations(response.default || response);
      setLanguage(lang);
      localStorage.setItem('ulms_language', lang);
      document.documentElement.lang = lang;
    } catch (error) {
      console.error('Failed to load language:', error);
    }
  };

  return (
    <LanguageContext.Provider value={{ language, translations, setLanguage: loadLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};