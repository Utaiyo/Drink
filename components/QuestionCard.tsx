import React from 'react';
import { Translations } from '../lib/translations';
import styles from './QuestionCard.module.css';

interface QuestionCardProps {
  questionKey: 'q1' | 'q2' | 'q3' | 'q4' | 'q5';
  translations: Translations;
  selectedValue?: string | string[];
  onSelect: (value: string) => void;
  isMultiple?: boolean;
}

// アイコンマッピング
const getIcon = (questionKey: string, optionKey: string): string => {
  if (questionKey === 'q1') {
    const icons: Record<string, string> = {
      refreshing: '🌊',
      tired: '😴',
      excited: '🎉',
      calm: '🧘',
    };
    return icons[optionKey] || '💭';
  }
  if (questionKey === 'q2') {
    const icons: Record<string, string> = {
      noSugar: '🚫',
      light: '💧',
      medium: '🍯',
      sweet: '🍬',
    };
    return icons[optionKey] || '🍭';
  }
  if (questionKey === 'q3') {
    const icons: Record<string, string> = {
      noIce: '❄️',
      light: '🧊',
      normal: '🧊🧊',
      extra: '🧊🧊🧊',
    };
    return icons[optionKey] || '🧊';
  }
  if (questionKey === 'q4') {
    const icons: Record<string, string> = {
      light: '💨',
      jelly: '🍮',
      chewy: '🍡',
      smooth: '🥤',
    };
    return icons[optionKey] || '✨';
  }
  if (questionKey === 'q5') {
    const icons: Record<string, string> = {
      noMilk: '🥛',
      lowCaffeine: '☕',
      lowSugar: '🍃',
      none: '✓',
    };
    return icons[optionKey] || '✓';
  }
  return '✓';
};

export const QuestionCard: React.FC<QuestionCardProps> = ({
  questionKey,
  translations,
  selectedValue,
  onSelect,
  isMultiple = false,
}) => {
  const question = translations.questions[questionKey];
  const options = Object.entries(question.options);

  const handleChange = (value: string) => {
    if (isMultiple) {
      const currentValues = Array.isArray(selectedValue) ? selectedValue : [];
      if (currentValues.includes(value)) {
        // チェックボックス: 既に選択されていれば解除
        onSelect(value); // 親コンポーネントで処理
      } else {
        onSelect(value);
      }
    } else {
      // ラジオボタン: 単一選択
      onSelect(value);
    }
  };

  const isSelected = (value: string) => {
    if (isMultiple) {
      return Array.isArray(selectedValue) && selectedValue.includes(value);
    }
    return selectedValue === value;
  };

  return (
    <div className={styles.card}>
      <h2 className={styles.title}>{question.title}</h2>
      <div className={styles.options}>
        {options.map(([key, label], index) => (
          <label
            key={key}
            className={`${styles.option} ${
              isSelected(key) ? styles.selected : ''
            }`}
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <input
              type={isMultiple ? 'checkbox' : 'radio'}
              name={questionKey}
              value={key}
              checked={isSelected(key)}
              onChange={() => handleChange(key)}
              className={styles.input}
            />
            <span className={styles.icon}>{getIcon(questionKey, key)}</span>
            <span className={styles.label}>{label}</span>
            {isSelected(key) && (
              <span className={styles.checkmark}>✓</span>
            )}
          </label>
        ))}
      </div>
    </div>
  );
};

