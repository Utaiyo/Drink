/**
 * DSS（意思決定支援システム）ロジック
 * 
 * このモジュールは、単なる診断ではなく意思決定支援システムとして設計されています。
 * 
 * DSSの特徴：
 * 1. 制約条件フィルタリング: ユーザーの制約を満たす商品を優先
 * 2. MCDM（多基準意思決定）: 複数の基準をスコアリングして最適解を提示
 * 3. フォールバック機能: 制約が厳しすぎる場合は自動的に緩和
 * 4. 説明可能性: 寄与度を可視化して推薦理由を明確化
 * 
 * DSSIP評価基準：
 * - Input: ユーザー回答（mood/sweetness/texture/constraints）
 * - Model: MCDM重み付けスコアリング + 制約フィルタリング
 * - Output: Top3推薦 + 理由 + 寄与度
 * - Accuracy: 推薦採用率、fallback率で計測
 * - Velocity: 意思決定時間で計測
 */

import Papa from 'papaparse';
import { Language } from './translations';
import { WEIGHTS, MOOD_COEFFICIENTS, TEXTURE_COEFFICIENTS, SWEETNESS_CONFIG } from './dssConfig';

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

// 寄与度（説明可能性用）
export interface Contributions {
  mood: number;        // 気分による寄与度
  sweetness: number;   // 甘さによる寄与度
  texture: number;     // テクスチャーによる寄与度
  constraint: number;  // 制約条件による寄与度（ボーナス）
}

// スコアリング結果
export interface ScoredDrink extends Drink {
  score: number;
  reasons: string[];
  contributions?: Contributions; // 説明可能性：各要素の寄与度
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
 * 
 * 改善ループ：dssConfigから設定を読み込む
 */
function calculateSweetnessScore(
  drink: Drink,
  sweetnessPreference: UserAnswers['sweetness']
): number {
  const sweetnessMap = SWEETNESS_CONFIG.preferenceMap;
  
  // カテゴリと属性から甘さを推測（dssConfigから設定を読み込み）
  let estimatedSugar = 50; // デフォルトは中程度
  
  const categorySugar = SWEETNESS_CONFIG.categorySugarMap[drink.category as keyof typeof SWEETNESS_CONFIG.categorySugarMap];
  if (categorySugar !== undefined) {
    estimatedSugar = categorySugar;
  }
  
  // rich属性が高いと甘さも高い傾向
  if (drink.rich > 0) {
    estimatedSugar = Math.min(SWEETNESS_CONFIG.maxSugar, estimatedSugar + SWEETNESS_CONFIG.richBonus);
  }
  
  const preferredSugar = sweetnessMap[sweetnessPreference];
  const distance = Math.abs(estimatedSugar - preferredSugar);
  
  // 距離が0なら100点、距離が75なら0点（線形減点）
  return Math.max(0, 100 - (distance / 75) * 100);
}

/**
 * 気分に基づく属性スコアリング
 * DSSの第2段階: 気分に応じた属性の重み付け
 * 
 * 改善ループ：dssConfigから係数を読み込む
 */
function calculateMoodScore(drink: Drink, mood: UserAnswers['mood']): number {
  let score = 0;
  const coeffs = MOOD_COEFFICIENTS[mood];
  
  switch (mood) {
    case 'refreshing':
      score = drink.refreshing * coeffs.refreshing;
      score += drink.fruity * coeffs.fruity;
      score += (1 - drink.rich) * Math.abs(coeffs.rich); // richが低いほど良い
      break;
      
    case 'tired':
      score = drink.refreshing * coeffs.refreshing;
      if ('caffeine' in coeffs) {
        score += coeffs.caffeine[drink.caffeine];
      }
      score += (1 - drink.rich) * Math.abs(coeffs.rich);
      break;
      
    case 'excited':
      score = drink.fruity * coeffs.fruity;
      score += drink.refreshing * coeffs.refreshing;
      if ('caffeine' in coeffs) {
        score += coeffs.caffeine[drink.caffeine];
      }
      break;
      
    case 'calm':
      score = (1 - drink.rich) * Math.abs(coeffs.rich);
      if ('teaCategory' in coeffs) {
        score += (drink.category === 'Pure Tea' || drink.category === 'Hojicha') ? coeffs.teaCategory : 10;
      }
      score += (1 - drink.refreshing) * Math.abs(coeffs.refreshing);
      break;
  }
  
  return score;
}

/**
 * 口当たり（テクスチャー）スコアリング
 * 
 * 改善ループ：dssConfigから係数を読み込む
 */
function calculateTextureScore(drink: Drink, texture: UserAnswers['texture']): number {
  const coeffs = TEXTURE_COEFFICIENTS[texture];
  
  switch (texture) {
    case 'light':
      return (1 - drink.chewy) * Math.abs(coeffs.chewy) + 
             (1 - drink.jelly) * Math.abs(coeffs.jelly) + 
             (1 - drink.rich) * Math.abs(coeffs.rich);
      
    case 'jelly':
      return drink.jelly * coeffs.jelly;
      
    case 'chewy':
      return drink.chewy * coeffs.chewy;
      
    case 'smooth':
      return (1 - drink.rich) * Math.abs(coeffs.rich) + 
             (1 - drink.chewy) * Math.abs(coeffs.chewy) + 
             (1 - drink.jelly) * Math.abs(coeffs.jelly);
      
    default:
      return 0;
  }
}

/**
 * MCDM（多基準意思決定）による総合スコアリング
 * DSSの核心: 複数の基準を統合して最適解を算出
 * 
 * スコアリング式:
 * 総合スコア = 気分スコア(WEIGHTS.mood) + 甘さスコア(WEIGHTS.sweetness) + テクスチャースコア(WEIGHTS.texture)
 * 
 * 改善ループ：dssConfigから重みを読み込む
 * 
 * 説明可能性：各要素の寄与度を返す
 */
function calculateTotalScore(
  drink: Drink, 
  answers: UserAnswers
): { totalScore: number; contributions: Contributions } {
  const moodScore = calculateMoodScore(drink, answers.mood);
  const sweetnessScore = calculateSweetnessScore(drink, answers.sweetness);
  const textureScore = calculateTextureScore(drink, answers.texture);
  
  // 重み付けスコアリング（MCDMの手法）- dssConfigから重みを読み込み
  const weightedMood = moodScore * WEIGHTS.mood;
  const weightedSweetness = sweetnessScore * WEIGHTS.sweetness;
  const weightedTexture = textureScore * WEIGHTS.texture;
  
  const totalScore = weightedMood + weightedSweetness + weightedTexture;
  
  // 制約条件によるボーナス（説明可能性用）
  let constraintBonus = 0;
  if (answers.constraints.noMilk && !drink.has_milk) {
    constraintBonus += 5;
  }
  if (answers.constraints.lowCaffeine && drink.caffeine !== 'high') {
    constraintBonus += 5;
  }
  if (answers.constraints.lowSugar && 
      (drink.category === 'Pure Tea' || drink.category === 'Hojicha' || 
       (drink.rich === 0 && drink.category !== 'Fruit Tea' && drink.category !== 'Dessert'))) {
    constraintBonus += 5;
  }
  
  // 寄与度を計算（説明可能性）
  const contributions: Contributions = {
    mood: Math.round(weightedMood),
    sweetness: Math.round(weightedSweetness),
    texture: Math.round(weightedTexture),
    constraint: constraintBonus,
  };
  
  return {
    totalScore: totalScore + constraintBonus,
    contributions,
  };
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
  try {
    const reasons: string[] = [];
    
    // 気分に基づく理由（必須）
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
    
    if (answers.mood && moodReasons[answers.mood] && moodReasons[answers.mood][language]) {
      reasons.push(moodReasons[answers.mood][language]);
    }
    
    // 甘さのマッチング理由（必須）
    const sweetnessMap: Record<string, Record<Language, string>> = {
      noSugar: { ja: '甘くない', ko: '달지 않게', en: 'no sugar', 'zh-TW': '不甜' },
      light: { ja: 'ほんのり', ko: '은은하게', en: 'lightly sweet', 'zh-TW': '微甜' },
      medium: { ja: 'ちょい甘', ko: '조금 달게', en: 'moderately sweet', 'zh-TW': '適中甜' },
      sweet: { ja: '甘い', ko: '달게', en: 'sweet', 'zh-TW': '甜的' },
    };
    
    const sweetnessText = answers.sweetness && sweetnessMap[answers.sweetness]?.[language] 
      ? sweetnessMap[answers.sweetness][language] 
      : answers.sweetness || 'medium';
    const sweetnessReasons: Record<Language, string> = {
      ja: `ご希望の「${sweetnessText}」に合わせた甘さです。`,
      ko: `원하시는 "${sweetnessText}"에 맞춘 단맛입니다.`,
      en: `The sweetness level matches your preference for "${sweetnessText}".`,
      'zh-TW': `已根據您偏好的「${sweetnessText}」甜度選擇。`,
    };
    reasons.push(sweetnessReasons[language]);
    
    // 氷の量のマッチング理由（必須）
    const iceMap: Record<string, Record<Language, string>> = {
      noIce: { ja: '氷なし', ko: '얼음 없음', en: 'no ice', 'zh-TW': '無冰' },
      light: { ja: '少なめ', ko: '적게', en: 'light ice', 'zh-TW': '少冰' },
      normal: { ja: '普通', ko: '보통', en: 'normal', 'zh-TW': '正常' },
      extra: { ja: '多め', ko: '많이', en: 'extra ice', 'zh-TW': '多冰' },
    };
    
    const iceText = answers.ice && iceMap[answers.ice]?.[language] 
      ? iceMap[answers.ice][language] 
      : answers.ice || 'normal';
    const iceReasons: Record<Language, string> = {
      ja: `ご希望の「${iceText}」でお作りします。`,
      ko: `원하시는 "${iceText}"로 만들어드립니다.`,
      en: `We'll prepare it with "${iceText}" as requested.`,
      'zh-TW': `將根據您的要求以「${iceText}」製作。`,
    };
    reasons.push(iceReasons[language]);
    
    // テクスチャーのマッチング理由（必須）
    const textureMap: Record<string, Record<Language, string>> = {
      light: { ja: 'すっきり軽い', ko: '깔끔하고 가볍게', en: 'light and crisp', 'zh-TW': '清爽輕盈' },
      jelly: { ja: 'ぷるぷる', ko: '젤리처럼', en: 'jelly-like', 'zh-TW': 'Q彈' },
      chewy: { ja: 'もちもち', ko: '쫄깃하게', en: 'chewy', 'zh-TW': '有嚼勁' },
      smooth: { ja: 'なめらか', ko: '부드럽게', en: 'smooth', 'zh-TW': '滑順' },
    };
    
    const textureText = answers.texture && textureMap[answers.texture]?.[language] 
      ? textureMap[answers.texture][language] 
      : answers.texture || 'smooth';
    const textureReasons: Record<Language, string> = {
      ja: `お好みの「${textureText}」という口当たりに合います。`,
      ko: `선호하시는 "${textureText}" 식감에 맞습니다.`,
      en: `The texture matches your preference for "${textureText}".`,
      'zh-TW': `這款飲品符合您偏好的「${textureText}」口感。`,
    };
    reasons.push(textureReasons[language]);
    
    // 制約条件の理由（オプション）
    if (answers.constraints) {
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
    }
    
    // 理由が空の場合はデフォルト理由を返す
    if (reasons.length === 0) {
      return [
        language === 'ja' ? 'あなたの好みに合わせて選ばれました。' :
        language === 'ko' ? '선호도에 맞춰 선택되었습니다.' :
        language === 'en' ? 'Selected based on your preferences.' :
        '根據您的偏好選擇。'
      ];
    }
    
    return reasons;
  } catch (error) {
    console.error('Error generating reasons:', error, { drink: drink.name_ja, answers });
    // エラーが発生した場合でも、最低限の理由を返す
    return [
      language === 'ja' ? 'あなたの好みに合わせて選ばれました。' :
      language === 'ko' ? '선호도에 맞춰 선택되었습니다.' :
      language === 'en' ? 'Selected based on your preferences.' :
      '根據您的偏好選擇。'
    ];
  }
}

/**
 * DSSメイン関数: 制約フィルタリング → スコアリング → Top3選択
 * 
 * フォールバック機能:
 * 制約が厳しすぎて0件になった場合、制約を段階的に緩和して再計算
 * 
 * 戻り値: 推薦結果とフォールバック情報
 */
export interface RecommendResult {
  drinks: ScoredDrink[];
  fallbackStage: number; // 0: フォールバックなし, 1: 第1段階緩和, 2: 第2段階緩和
}

export async function recommendDrinks(
  answers: UserAnswers,
  language: Language
): Promise<RecommendResult> {
  console.log('recommendDrinks called with:', { answers, language });
  let allDrinks = await loadDrinks();
  
  // 第1段階: 制約条件フィルタリング
  let filteredDrinks = filterByConstraints(allDrinks, answers.constraints);
  let fallbackStage = 0;
  
  // フォールバック: 制約が厳しすぎる場合の緩和ロジック
  if (filteredDrinks.length === 0) {
    // 第1段階：乳製品制約と低糖制約を緩和
    const relaxedConstraints = {
      noMilk: false, // 乳製品制約を緩和
      lowCaffeine: answers.constraints.lowCaffeine,
      lowSugar: false, // 低糖制約を緩和
    };
    filteredDrinks = filterByConstraints(allDrinks, relaxedConstraints);
    fallbackStage = 1;
    
    // 第2段階：それでも0件なら、カフェイン制約も緩和
    if (filteredDrinks.length === 0) {
      filteredDrinks = allDrinks;
      fallbackStage = 2;
    }
  }
  
  // 第2段階: MCDMによるスコアリング（寄与度も計算）
  const scoredDrinks: ScoredDrink[] = filteredDrinks.map((drink) => {
    const { totalScore, contributions } = calculateTotalScore(drink, answers);
    return {
      ...drink,
      score: totalScore,
      contributions,
      reasons: [], // 後で生成
    };
  });
  
  // スコアで降順ソート
  scoredDrinks.sort((a, b) => b.score - a.score);
  
  // 第3段階: Top3を選択
  const top3 = scoredDrinks.slice(0, 3);
  
  // 理由文を生成
  const drinksWithReasons = top3.map((drink) => {
    try {
      console.log('Generating reasons for', drink.name_ja, 'with answers:', answers);
      const reasons = generateReasons(drink, answers, language);
      console.log('Generated reasons:', reasons);
      if (!reasons || reasons.length === 0) {
        console.warn('No reasons generated for', drink.name_ja);
      }
      return {
        ...drink,
        reasons: reasons || [],
      };
    } catch (error) {
      console.error('Error in generateReasons for', drink.name_ja, ':', error);
      return {
        ...drink,
        reasons: [
          language === 'ja' ? 'あなたの好みに合わせて選ばれました。' :
          language === 'ko' ? '선호도에 맞춰 선택되었습니다.' :
          language === 'en' ? 'Selected based on your preferences.' :
          '根據您的偏好選擇。'
        ],
      };
    }
  });
  
  return {
    drinks: drinksWithReasons,
    fallbackStage,
  };
}

