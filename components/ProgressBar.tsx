import React from 'react';
import styles from './ProgressBar.module.css';

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
  language: 'ja' | 'ko' | 'en' | 'zh-TW';
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  currentStep,
  totalSteps,
  language,
}) => {
  const progress = (currentStep / totalSteps) * 100;
  
  const stepLabels: Record<'ja' | 'ko' | 'en' | 'zh-TW', string> = {
    ja: '問目',
    ko: '번째 질문',
    en: 'of',
    'zh-TW': '題',
  };

  const label = language === 'en' 
    ? `${currentStep} ${stepLabels[language]} ${totalSteps}`
    : `${currentStep}${stepLabels[language]}`;

  return (
    <div className={styles.progressContainer}>
      <div className={styles.progressInfo}>
        <span className={styles.progressText}>{label}</span>
        <span className={styles.progressPercent}>{Math.round(progress)}%</span>
      </div>
      <div className={styles.progressBar}>
        <div 
          className={styles.progressFill}
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className={styles.stepIndicators}>
        {Array.from({ length: totalSteps }, (_, i) => (
          <div
            key={i}
            className={`${styles.stepDot} ${
              i < currentStep ? styles.completed : i === currentStep ? styles.current : ''
            }`}
          />
        ))}
      </div>
    </div>
  );
};

