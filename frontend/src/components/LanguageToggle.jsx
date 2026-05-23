// frontend/src/components/LanguageToggle.jsx

import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from '../hooks/useTranslation';

export default function LanguageToggle() {
  const { language, setLanguage } = useLanguage();
  const { t } = useTranslation();

  return (
    <div className="flex items-center gap-2">
      <label className="text-sm font-medium text-slate-700">
        {t('accessibility.language')}:
      </label>
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
        className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
      >
        <option value="en">{t('accessibility.english')}</option>
        <option value="tl">{t('accessibility.tagalog')}</option>
      </select>
    </div>
  );
}