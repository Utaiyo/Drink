import React from 'react';
import { ScoredDrink } from '../lib/dss';
import { Language, translations } from '../lib/translations';
import styles from './ResultCard.module.css';

interface ResultCardProps {
  drink: ScoredDrink;
  rank: number;
  language: Language;
  onShowStaffView?: () => void;
}

export const ResultCard: React.FC<ResultCardProps> = ({ drink, rank, language, onShowStaffView }) => {
  console.log('ResultCard rendered for', drink.name_ja, 'with reasons:', drink.reasons, 'length:', drink.reasons?.length);
  const t = translations[language];
  const rankEmoji = ['🥇', '🥈', '🥉'][rank - 1] || '⭐';
  
  const rankLabels: Record<Language, string> = {
    ja: '位',
    ko: '위',
    en: '',
    'zh-TW': '名',
  };
  
  // 言語に応じたドリンク名を取得
  const getDrinkName = (): string => {
    if (language === 'zh-TW') return drink.name_zh;
    if (language === 'ja') return drink.name_ja;
    if (language === 'en') return drink.name_en;
    if (language === 'ko') return drink.name_ko;
    return drink.name_zh; // デフォルト
  };
  
  const categoryLabels: Record<Language, Record<string, string>> = {
    ja: {
      'Pure Tea': '純茶',
      'Fruit Tea': 'フルーツティー',
      'Milk Tea': 'ミルクティー',
      'Chocolate': 'チョコレート',
      'Latte': 'ラテ',
      'Tea Latte': 'ティーラテ',
      'Hojicha': 'ほうじ茶',
      'Oat Milk': 'オートミルク',
      'Dessert': 'デザート',
    },
    ko: {
      'Pure Tea': '순수 차',
      'Fruit Tea': '과일 차',
      'Milk Tea': '밀크티',
      'Chocolate': '초콜릿',
      'Latte': '라떼',
      'Tea Latte': '티 라떼',
      'Hojicha': '호지차',
      'Oat Milk': '오트밀크',
      'Dessert': '디저트',
    },
    en: {
      'Pure Tea': 'Pure Tea',
      'Fruit Tea': 'Fruit Tea',
      'Milk Tea': 'Milk Tea',
      'Chocolate': 'Chocolate',
      'Latte': 'Latte',
      'Tea Latte': 'Tea Latte',
      'Hojicha': 'Hojicha',
      'Oat Milk': 'Oat Milk',
      'Dessert': 'Dessert',
    },
    'zh-TW': {
      'Pure Tea': '純茶',
      'Fruit Tea': '水果茶',
      'Milk Tea': '奶茶',
      'Chocolate': '巧克力',
      'Latte': '拿鐵',
      'Tea Latte': '茶拿鐵',
      'Hojicha': '焙茶',
      'Oat Milk': '燕麥奶',
      'Dessert': '甜品',
    },
  };
  
  const detailLabels: Record<Language, { hasMilk: string; caffeine: string }> = {
    ja: {
      hasMilk: '乳製品あり',
      caffeine: 'カフェイン',
    },
    ko: {
      hasMilk: '유제품 있음',
      caffeine: '카페인',
    },
    en: {
      hasMilk: 'Contains dairy',
      caffeine: 'Caffeine',
    },
    'zh-TW': {
      hasMilk: '含乳製品',
      caffeine: '咖啡因',
    },
  };
  
  const caffeineLabels: Record<Language, Record<string, string>> = {
    ja: {
      none: 'なし',
      low: '低',
      medium: '中',
      high: '高',
    },
    ko: {
      none: '없음',
      low: '낮음',
      medium: '중간',
      high: '높음',
    },
    en: {
      none: 'None',
      low: 'Low',
      medium: 'Medium',
      high: 'High',
    },
    'zh-TW': {
      none: '無',
      low: '低',
      medium: '中',
      high: '高',
    },
  };

  // カテゴリ別のカラーコード
  const getCategoryColor = (category: string): string => {
    const colorMap: Record<string, string> = {
      'Pure Tea': '#8B9A46',
      'Fruit Tea': '#FF6B6B',
      'Milk Tea': '#FFD93D',
      'Chocolate': '#6B4423',
      'Latte': '#D4A574',
      'Tea Latte': '#A8D5BA',
      'Hojicha': '#8B4513',
      'Oat Milk': '#E6D3A3',
      'Dessert': '#FF69B4',
    };
    return colorMap[category] || '#8B4513';
  };

  // スコアを星で表示（0-100を5段階に変換）
  const getScoreStars = (score: number): string => {
    const normalizedScore = Math.min(100, Math.max(0, score));
    const stars = Math.round((normalizedScore / 100) * 5);
    return '⭐'.repeat(stars) + '☆'.repeat(5 - stars);
  };

  const scorePercentage = Math.round((drink.score / 100) * 100);

  return (
    <div className={styles.card}>
      <div 
        className={styles.categoryBorder}
        style={{ borderTopColor: getCategoryColor(drink.category) }}
      />
      <div className={styles.header}>
        <span className={styles.rank}>
          {rankEmoji} {rank}{rankLabels[language]}
        </span>
        <h3 className={styles.name}>{getDrinkName()}</h3>
      </div>
      
      <div className={styles.scoreSection}>
        <div className={styles.scoreLabel}>
          {language === 'ja' && 'マッチ度'}
          {language === 'ko' && '매칭도'}
          {language === 'en' && 'Match Score'}
          {language === 'zh-TW' && '匹配度'}
        </div>
        <div className={styles.scoreBar}>
          <div 
            className={styles.scoreFill}
            style={{ width: `${scorePercentage}%` }}
          />
        </div>
        <div className={styles.scoreStars}>{getScoreStars(drink.score)}</div>
        <div className={styles.scorePercent}>{scorePercentage}%</div>
        
        {/* 説明可能性：寄与度の可視化 */}
        {drink.contributions && (
          <div className={styles.contributions}>
            <div className={styles.contributionsLabel}>
              {language === 'ja' && '寄与度'}
              {language === 'ko' && '기여도'}
              {language === 'en' && 'Contributions'}
              {language === 'zh-TW' && '貢獻度'}
            </div>
            <div className={styles.contributionsList}>
              <span className={styles.contributionItem}>
                {language === 'ja' && '気分'}
                {language === 'ko' && '기분'}
                {language === 'en' && 'Mood'}
                {language === 'zh-TW' && '心情'}
                : +{drink.contributions.mood}
              </span>
              <span className={styles.contributionItem}>
                {language === 'ja' && '甘さ'}
                {language === 'ko' && '단맛'}
                {language === 'en' && 'Sweetness'}
                {language === 'zh-TW' && '甜度'}
                : +{drink.contributions.sweetness}
              </span>
              <span className={styles.contributionItem}>
                {language === 'ja' && '食感'}
                {language === 'ko' && '식감'}
                {language === 'en' && 'Texture'}
                {language === 'zh-TW' && '口感'}
                : +{drink.contributions.texture}
              </span>
              {drink.contributions.constraint > 0 && (
                <span className={styles.contributionItem}>
                  {language === 'ja' && '制約'}
                  {language === 'ko' && '제약'}
                  {language === 'en' && 'Constraint'}
                  {language === 'zh-TW' && '限制'}
                  : +{drink.contributions.constraint}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
      
      <div className={styles.reasons}>
        <h4 className={styles.reasonsTitle}>{t.ui.whyRecommended}</h4>
        <ul className={styles.reasonsList}>
          {drink.reasons && drink.reasons.length > 0 ? (
            drink.reasons.map((reason, index) => (
              <li key={index} className={styles.reasonItem}>
                {reason}
              </li>
            ))
          ) : (
            <li className={styles.reasonItem}>
              {language === 'ja' && '理由を生成中...'}
              {language === 'ko' && '이유 생성 중...'}
              {language === 'en' && 'Generating reasons...'}
              {language === 'zh-TW' && '正在生成理由...'}
            </li>
          )}
        </ul>
      </div>
      
      <div className={styles.details}>
        <span className={styles.detailTag}>
          {categoryLabels[language][drink.category] || drink.category}
        </span>
        {drink.has_milk && (
          <span className={styles.detailTag}>
            {detailLabels[language].hasMilk}
          </span>
        )}
        <span className={styles.detailTag}>
          {detailLabels[language].caffeine}: {caffeineLabels[language][drink.caffeine]}
        </span>
      </div>
      
      {onShowStaffView && (
        <button className={styles.staffButton} onClick={onShowStaffView}>
          {language === 'ja' && '店員さんに見せる'}
          {language === 'ko' && '직원에게 보여주기'}
          {language === 'en' && 'Show to Staff'}
          {language === 'zh-TW' && '給店員看'}
        </button>
      )}
    </div>
  );
};

