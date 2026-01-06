/**
 * DSS（意思決定支援システム）ロジック
 * 
 * このモジュールは、単なる診断ではなく意思決定支援システムとして設計されています。
 * 
 * DSSの特徴：
 * 1. 制約条件フィルタリング: ユーザーの制約を満たす商品を優先
 * 2. MCDM（多基準意思決定）: 複数の基準をスコアリングして最適解を提示
 * 3. フォールバック機能: 制約が厳しすぎる場合は自動的に緩和
 */

import Papa from 'papaparse';
import { Language } from './translations';

// ドリンクデータの型定義
export interface Drink {
  id: string;
  name_zh: string; // 中国語繁体字
  name_ja: string; // 日本語
  name_en: string; // 英語
  name_ko: string; // 韓国語
  category: string;
  has_milk: boolean;
  caffeine: 'none' | 'low' | 'medium' | 'high';
  refreshing: number;
  rich: number;
  fruity: number;
  chewy: number;
  jelly: number;
}

// ユーザーの回答
export interface UserAnswers {
  mood: 'refreshing' | 'tired' | 'excited' | 'calm';
  sweetness: 'noSugar' | 'light' | 'medium' | 'sweet';
  ice: 'noIce' | 'light' | 'normal' | 'extra';
  texture: 'light' | 'jelly' | 'chewy' | 'smooth';
  constraints: {
    noMilk: boolean;
    lowCaffeine: boolean;
    lowSugar: boolean;
  };
}

// スコアリング結果
export interface ScoredDrink extends Drink {
  score: number;
  reasons: string[];
}

/**
 * CSVファイルを読み込んでドリンクデータを取得
 */
export async function loadDrinks(): Promise<Drink[]> {
  try {
    const response = await fetch('/data/drinks.csv');
    if (!response.ok) {
      throw new Error('Failed to load drinks data');
    }
    const csvText = await response.text();
    
    return new Promise((resolve, reject) => {
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const drinks: Drink[] = results.data.map((row: any) => ({
            id: String(row.id),
            name_zh: String(row.name_zh),
            name_ja: String(row.name_ja),
            name_en: String(row.name_en),
            name_ko: String(row.name_ko),
            category: String(row.category),
            has_milk: row.has_milk === 'true' || row.has_milk === '1' || row.has_milk === 1,
            caffeine: row.caffeine as 'none' | 'low' | 'medium' | 'high',
            refreshing: parseInt(row.refreshing, 10),
            rich: parseInt(row.rich, 10),
            fruity: parseInt(row.fruity, 10),
            chewy: parseInt(row.chewy, 10),
            jelly: parseInt(row.jelly, 10),
          }));
          resolve(drinks);
        },
        error: (error: Error) => reject(error),
      });
    });
  } catch (error) {
    console.error('Failed to load drinks:', error);
    throw error;
  }
}

/**
 * 制約条件でフィルタリング
 * DSSの第1段階: 制約条件を満たさない商品を除外
 */
function filterByConstraints(drinks: Drink[], constraints: UserAnswers['constraints']): Drink[] {
  return drinks.filter((drink) => {
    // 乳製品NGの制約
    if (constraints.noMilk && drink.has_milk) {
      return false;
    }
    
    // カフェイン控えめの制約
    if (constraints.lowCaffeine && drink.caffeine === 'high') {
      return false;
    }
    
    // 低糖の制約（カテゴリベースで判定）
    if (constraints.lowSugar) {
      // Pure Tea, Hojichaは低糖、Fruit Tea, Dessertは高糖なので除外
      if (drink.category === 'Fruit Tea' || drink.category === 'Dessert' || 
          drink.category === 'Chocolate') {
        return false;
      }
      // rich属性が高いと甘いので除外
      if (drink.rich > 0 && drink.category !== 'Pure Tea' && drink.category !== 'Hojicha') {
        return false;
      }
    }
    
    return true;
  });
}

/**
 * 甘さの希望とカテゴリ/属性から推測される甘さの距離を計算
 * sugar_defaultがないため、カテゴリと属性から甘さを推測
 * 距離が小さいほどスコアが高い
 */
function calculateSweetnessScore(
  drink: Drink,
  sweetnessPreference: UserAnswers['sweetness']
): number {
  const sweetnessMap = {
    noSugar: 0,
    light: 25,
    medium: 50,
    sweet: 75,
  };
  
  // カテゴリと属性から甘さを推測
  let estimatedSugar = 50; // デフォルトは中程度
  
  if (drink.category === 'Pure Tea' || drink.category === 'Hojicha') {
    estimatedSugar = 0; // 純茶は甘さなし
  } else if (drink.category === 'Fruit Tea') {
    estimatedSugar = drink.fruity > 0 ? 75 : 50; // フルーツティーは甘め
  } else if (drink.category === 'Milk Tea' || drink.category === 'Latte' || 
             drink.category === 'Tea Latte' || drink.category === 'Chocolate' || 
             drink.category === 'Oat Milk') {
    estimatedSugar = 50; // ミルク系は中程度
  } else if (drink.category === 'Dessert') {
    estimatedSugar = 75; // デザート系は甘め
  }
  
  // rich属性が高いと甘さも高い傾向
  if (drink.rich > 0) {
    estimatedSugar = Math.min(75, estimatedSugar + 25);
  }
  
  const preferredSugar = sweetnessMap[sweetnessPreference];
  const distance = Math.abs(estimatedSugar - preferredSugar);
  
  // 距離が0なら100点、距離が75なら0点（線形減点）
  return Math.max(0, 100 - (distance / 75) * 100);
}

/**
 * 気分に基づく属性スコアリング
 * DSSの第2段階: 気分に応じた属性の重み付け
 */
function calculateMoodScore(drink: Drink, mood: UserAnswers['mood']): number {
  let score = 0;
  
  switch (mood) {
    case 'refreshing':
      // さっぱりしたい → refreshing属性を重視
      score = drink.refreshing * 50;
      score += drink.fruity * 30;
      score += (1 - drink.rich) * 20; // richが低いほど良い
      break;
      
    case 'tired':
      // 疲れてる → リフレッシュできるものを重視
      score = drink.refreshing * 40;
      score += drink.caffeine === 'medium' ? 30 : drink.caffeine === 'high' ? 20 : 10;
      score += (1 - drink.rich) * 30; // richが低い = 軽い = smooth
      break;
      
    case 'excited':
      // テンション高め → 元気が出るものを重視
      score = drink.fruity * 40;
      score += drink.refreshing * 30;
      score += drink.caffeine === 'high' ? 30 : drink.caffeine === 'medium' ? 20 : 10;
      break;
      
    case 'calm':
      // 落ち着きたい → 穏やかなものを重視
      score = (1 - drink.rich) * 50; // richが低い = 軽い = smooth
      score += (drink.category === 'Pure Tea' || drink.category === 'Hojicha') ? 30 : 10;
      score += (1 - drink.refreshing) * 20; // refreshingが低いほど良い
      break;
  }
  
  return score;
}

/**
 * 口当たり（テクスチャー）スコアリング
 */
function calculateTextureScore(drink: Drink, texture: UserAnswers['texture']): number {
  switch (texture) {
    case 'light':
      // すっきり軽い → chewy, jelly, richが低いほど良い
      return (1 - drink.chewy) * 40 + (1 - drink.jelly) * 30 + (1 - drink.rich) * 30;
      
    case 'jelly':
      // ぷるぷる → jelly属性を重視
      return drink.jelly * 100;
      
    case 'chewy':
      // もちもち → chewy属性を重視
      return drink.chewy * 100;
      
    case 'smooth':
      // なめらか → richが低く、chewy/jellyが低い = なめらか
      return (1 - drink.rich) * 50 + (1 - drink.chewy) * 25 + (1 - drink.jelly) * 25;
      
    default:
      return 0;
  }
}

/**
 * MCDM（多基準意思決定）による総合スコアリング
 * DSSの核心: 複数の基準を統合して最適解を算出
 * 
 * スコアリング式:
 * 総合スコア = 気分スコア(40%) + 甘さスコア(30%) + テクスチャースコア(30%)
 */
function calculateTotalScore(drink: Drink, answers: UserAnswers): number {
  const moodScore = calculateMoodScore(drink, answers.mood);
  const sweetnessScore = calculateSweetnessScore(drink, answers.sweetness);
  const textureScore = calculateTextureScore(drink, answers.texture);
  
  // 重み付けスコアリング（MCDMの手法）
  const totalScore = moodScore * 0.4 + sweetnessScore * 0.3 + textureScore * 0.3;
  
  return totalScore;
}

/**
 * 理由文を生成
 * DSSの出力: 選択内容と結果の因果関係を説明
 */
export function generateReasons(
  drink: ScoredDrink,
  answers: UserAnswers,
  language: Language
): string[] {
  const reasons: string[] = [];
  
  // 気分に基づく理由
  const moodReasons: Record<UserAnswers['mood'], Record<Language, string>> = {
    refreshing: {
      ja: 'さっぱりしたいという気分に合わせて、爽やかで軽い味わいのドリンクです。',
      ko: '시원하게 하고 싶다는 기분에 맞춰 상쾌하고 가벼운 맛의 음료입니다.',
      en: 'Based on your preference for something refreshing, this drink offers a crisp and light taste.',
      'zh-TW': '根據您想要清爽的需求，這款飲品提供清新輕盈的口感。',
    },
    tired: {
      ja: '疲れを感じている方に、リフレッシュできる味わいをおすすめします。',
      ko: '피곤함을 느끼시는 분께 상쾌한 맛을 추천합니다.',
      en: 'For those feeling tired, we recommend this refreshing drink.',
      'zh-TW': '對於感到疲累的您，我們推薦這款能提神的飲品。',
    },
    excited: {
      ja: 'テンション高めの気分にぴったりの、元気が出るドリンクです。',
      ko: '텐션이 높은 기분에 딱 맞는 활력을 주는 음료입니다.',
      en: 'This energizing drink matches your high-energy mood perfectly.',
      'zh-TW': '這款充滿活力的飲品完美符合您精神飽滿的心情。',
    },
    calm: {
      ja: '落ち着きたい気分に合わせて、穏やかで優しい味わいのドリンクです。',
      ko: '차분하게 하고 싶은 기분에 맞춰 온화하고 부드러운 맛의 음료입니다.',
      en: 'This drink offers a gentle and soothing taste that matches your desire to relax.',
      'zh-TW': '這款飲品提供溫和舒緩的口感，符合您想要放鬆的需求。',
    },
  };
  
  reasons.push(moodReasons[answers.mood][language]);
  
  // 甘さのマッチング理由
  const sweetnessMap = {
    noSugar: { ja: '甘くない', ko: '달지 않게', en: 'no sugar', 'zh-TW': '不甜' },
    light: { ja: 'ほんのり', ko: '은은하게', en: 'lightly sweet', 'zh-TW': '微甜' },
    medium: { ja: 'ちょい甘', ko: '조금 달게', en: 'moderately sweet', 'zh-TW': '適中甜' },
    sweet: { ja: '甘い', ko: '달게', en: 'sweet', 'zh-TW': '甜的' },
  };
  
  const sweetnessText = sweetnessMap[answers.sweetness][language];
  const sweetnessReasons: Record<Language, string> = {
    ja: `ご希望の「${sweetnessText}」に合わせた甘さです。`,
    ko: `원하시는 "${sweetnessText}"에 맞춘 단맛입니다.`,
    en: `The sweetness level matches your preference for "${sweetnessText}".`,
    'zh-TW': `已根據您偏好的「${sweetnessText}」甜度選擇。`,
  };
  reasons.push(sweetnessReasons[language]);
  
  // 氷の量のマッチング理由
  const iceMap = {
    noIce: { ja: '氷なし', ko: '얼음 없음', en: 'no ice', 'zh-TW': '無冰' },
    light: { ja: '少なめ', ko: '적게', en: 'light ice', 'zh-TW': '少冰' },
    normal: { ja: '普通', ko: '보통', en: 'normal', 'zh-TW': '正常' },
    extra: { ja: '多め', ko: '많이', en: 'extra ice', 'zh-TW': '多冰' },
  };
  
  const iceText = iceMap[answers.ice][language];
  const iceReasons: Record<Language, string> = {
    ja: `ご希望の「${iceText}」でお作りします。`,
    ko: `원하시는 "${iceText}"로 만들어드립니다.`,
    en: `We'll prepare it with "${iceText}" as requested.`,
    'zh-TW': `將根據您的要求以「${iceText}」製作。`,
  };
  reasons.push(iceReasons[language]);
  
  // テクスチャーのマッチング理由
  const textureMap = {
    light: { ja: 'すっきり軽い', ko: '깔끔하고 가볍게', en: 'light and crisp', 'zh-TW': '清爽輕盈' },
    jelly: { ja: 'ぷるぷる', ko: '젤리처럼', en: 'jelly-like', 'zh-TW': 'Q彈' },
    chewy: { ja: 'もちもち', ko: '쫄깃하게', en: 'chewy', 'zh-TW': '有嚼勁' },
    smooth: { ja: 'なめらか', ko: '부드럽게', en: 'smooth', 'zh-TW': '滑順' },
  };
  
  const textureText = textureMap[answers.texture][language];
  const textureReasons: Record<Language, string> = {
    ja: `お好みの「${textureText}」という口当たりに合います。`,
    ko: `선호하시는 "${textureText}" 식감에 맞습니다.`,
    en: `The texture matches your preference for "${textureText}".`,
    'zh-TW': `這款飲品符合您偏好的「${textureText}」口感。`,
  };
  reasons.push(textureReasons[language]);
  
  // 制約条件の理由
  if (answers.constraints.noMilk && !drink.has_milk) {
    const constraintReasons: Record<Language, string> = {
      ja: '乳製品不使用で、ご指定の制約を満たしています。',
      ko: '유제품 미사용으로 지정하신 제약조건을 만족합니다.',
      en: 'Dairy-free, meeting your specified constraint.',
      'zh-TW': '不含乳製品，符合您指定的限制條件。',
    };
    reasons.push(constraintReasons[language]);
  }
  
  if (answers.constraints.lowCaffeine && drink.caffeine !== 'high') {
    const constraintReasons: Record<Language, string> = {
      ja: 'カフェイン控えめで、ご指定の制約を満たしています。',
      ko: '카페인 적게로 지정하신 제약조건을 만족합니다.',
      en: 'Low caffeine content, meeting your specified constraint.',
      'zh-TW': '低咖啡因，符合您指定的限制條件。',
    };
    reasons.push(constraintReasons[language]);
  }
  
  if (answers.constraints.lowSugar && 
      (drink.category === 'Pure Tea' || drink.category === 'Hojicha' || 
       (drink.rich === 0 && drink.category !== 'Fruit Tea' && drink.category !== 'Dessert'))) {
    const constraintReasons: Record<Language, string> = {
      ja: '低糖で、ご指定の制約を満たしています。',
      ko: '저당으로 지정하신 제약조건을 만족합니다.',
      en: 'Low sugar content, meeting your specified constraint.',
      'zh-TW': '低糖，符合您指定的限制條件。',
    };
    reasons.push(constraintReasons[language]);
  }
  
  return reasons;
}

/**
 * DSSメイン関数: 制約フィルタリング → スコアリング → Top3選択
 * 
 * フォールバック機能:
 * 制約が厳しすぎて0件になった場合、制約を段階的に緩和して再計算
 */
export async function recommendDrinks(
  answers: UserAnswers,
  language: Language
): Promise<ScoredDrink[]> {
  let allDrinks = await loadDrinks();
  
  // 第1段階: 制約条件フィルタリング
  let filteredDrinks = filterByConstraints(allDrinks, answers.constraints);
  
  // フォールバック: 制約が厳しすぎる場合の緩和ロジック
  if (filteredDrinks.length === 0) {
    // 制約を緩和したバージョンで再試行
    const relaxedConstraints = {
      noMilk: false, // 乳製品制約を緩和
      lowCaffeine: answers.constraints.lowCaffeine,
      lowSugar: false, // 低糖制約を緩和
    };
    filteredDrinks = filterByConstraints(allDrinks, relaxedConstraints);
    
    // それでも0件なら、カフェイン制約も緩和
    if (filteredDrinks.length === 0) {
      filteredDrinks = allDrinks;
    }
  }
  
  // 第2段階: MCDMによるスコアリング
  const scoredDrinks: ScoredDrink[] = filteredDrinks.map((drink) => {
    const score = calculateTotalScore(drink, answers);
    return {
      ...drink,
      score,
      reasons: [], // 後で生成
    };
  });
  
  // スコアで降順ソート
  scoredDrinks.sort((a, b) => b.score - a.score);
  
  // 第3段階: Top3を選択
  const top3 = scoredDrinks.slice(0, 3);
  
  // 理由文を生成
  return top3.map((drink) => ({
    ...drink,
    reasons: generateReasons(drink, answers, language),
  }));
}

