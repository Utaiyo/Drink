import React from 'react';
import { Language } from '../lib/translations';
import styles from './LanguageSelector.module.css';

interface LanguageSelectorProps {
  currentLanguage: Language;
  onLanguageChange: (lang: Language) => void;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  currentLanguage,
  onLanguageChange,
}) => {
  const languages: { code: Language; label: string }[] = [
    { code: 'ja', label: '日本語' },
    { code: 'ko', label: '한국어' },
    { code: 'en', label: 'English' },
    { code: 'zh-TW', label: '繁體中文' },
  ];

  return (
    <div className={styles.selector}>
      {languages.map((lang) => (
        <button
          key={lang.code}
          className={`${styles.button} ${
            currentLanguage === lang.code ? styles.active : ''
          }`}
          onClick={() => onLanguageChange(lang.code)}
        >
          {lang.label}
        </button>
      ))}
    </div>
  );
};

