import React, { useState } from 'react';
import { ScoredDrink } from '../lib/dss';
import { UserAnswers } from '../lib/dss';
import styles from './StaffViewModal.module.css';

interface StaffViewModalProps {
  drink: ScoredDrink;
  answers: UserAnswers;
  isOpen: boolean;
  onClose: () => void;
}

export const StaffViewModal: React.FC<StaffViewModalProps> = ({
  drink,
  answers,
  isOpen,
  onClose,
}) => {
  const [size, setSize] = useState<'large' | 'medium' | 'small'>('large');

  if (!isOpen) return null;

  // サイズの中国語表記
  const sizeLabels = {
    large: '大杯',
    medium: '中杯',
    small: '小杯',
  };

  // 氷の量の中国語表記
  const iceLabels: Record<UserAnswers['ice'], string> = {
    noIce: '無冰',
    light: '少冰',
    normal: '正常',
    extra: '多冰',
  };

  // 砂糖の量の中国語表記
  const sweetnessLabels: Record<UserAnswers['sweetness'], string> = {
    noSugar: '無糖',
    light: '微糖',
    medium: '半糖',
    sweet: '全糖',
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}>
          ✕
        </button>
        
        <div className={styles.content}>
          <h2 className={styles.title}>給店員看</h2>
          
          <div className={styles.orderInfo}>
            <div className={styles.orderItem}>
              <span className={styles.label}>飲品名稱：</span>
              <span className={styles.value}>{drink.name_zh}</span>
            </div>
            
            <div className={styles.orderItem}>
              <span className={styles.label}>大小：</span>
              <div className={styles.sizeSelector}>
                {(['large', 'medium', 'small'] as const).map((s) => (
                  <button
                    key={s}
                    className={`${styles.sizeButton} ${
                      size === s ? styles.sizeButtonActive : ''
                    }`}
                    onClick={() => setSize(s)}
                  >
                    {sizeLabels[s]}
                  </button>
                ))}
              </div>
            </div>
            
            <div className={styles.orderItem}>
              <span className={styles.label}>冰塊：</span>
              <span className={styles.value}>{iceLabels[answers.ice]}</span>
            </div>
            
            <div className={styles.orderItem}>
              <span className={styles.label}>甜度：</span>
              <span className={styles.value}>{sweetnessLabels[answers.sweetness]}</span>
            </div>
          </div>
          
          <div className={styles.summary}>
            <div className={styles.summaryTitle}>訂單摘要</div>
            <div className={styles.summaryText}>
              {sizeLabels[size]} {drink.name_zh}，{iceLabels[answers.ice]}，{sweetnessLabels[answers.sweetness]}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

