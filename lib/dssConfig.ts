/**
 * DSS設定管理モジュール
 * 
 * 改善ループ（Improvement Loop）の実装：
 * - 重み/係数を外部化して、設定変更でDSSの挙動を調整可能にする
 * - 将来：店舗別にconfigを差し替えできる設計（今はグローバル）
 * 
 * DSSとしての強さ：
 * - Accuracy: 重み調整により推薦精度を改善可能
 * - Velocity: 設定変更で即座に反映（再デプロイ不要）
 */

// MCDM重み設定（総合スコア計算用）
export const WEIGHTS = {
  mood: 0.4,      // 気分スコアの重み
  sweetness: 0.3, // 甘さスコアの重み
  texture: 0.3,   // テクスチャースコアの重み
} as const;

// 気分ごとの属性係数テーブル
export const MOOD_COEFFICIENTS = {
  refreshing: {
    refreshing: 50,  // refreshing属性の係数
    fruity: 30,      // fruity属性の係数
    rich: -20,       // richが低いほど良い（負の係数）
  },
  tired: {
    refreshing: 40,
    caffeine: { medium: 30, high: 20, low: 10, none: 10 },
    rich: -30,
    fruity: 0, // 使用しないが型エラー回避のため
  },
  excited: {
    fruity: 40,
    refreshing: 30,
    caffeine: { high: 30, medium: 20, low: 10, none: 10 },
    rich: 0, // 使用しないが型エラー回避のため
  },
  calm: {
    rich: -50,       // richが低いほど良い
    teaCategory: 30, // Pure Tea/Hojichaカテゴリのボーナス
    refreshing: -20, // refreshingが低いほど良い
    fruity: 0, // 使用しないが型エラー回避のため
  },
} as const;

// テクスチャーごとの属性係数
export const TEXTURE_COEFFICIENTS = {
  light: {
    chewy: -40,  // chewyが低いほど良い
    jelly: -30,  // jellyが低いほど良い
    rich: -30,   // richが低いほど良い
  },
  jelly: {
    jelly: 100,  // jelly属性を重視
    chewy: 0,    // 使用しないが型エラー回避のため
    rich: 0,     // 使用しないが型エラー回避のため
  },
  chewy: {
    chewy: 100,  // chewy属性を重視
    jelly: 0,    // 使用しないが型エラー回避のため
    rich: 0,     // 使用しないが型エラー回避のため
  },
  smooth: {
    rich: -50,
    chewy: -25,
    jelly: -25,
  },
} as const;

// 甘さスコアリング設定
export const SWEETNESS_CONFIG = {
  preferenceMap: {
    noSugar: 0,
    light: 25,
    medium: 50,
    sweet: 75,
  },
  categorySugarMap: {
    'Pure Tea': 0,
    'Hojicha': 0,
    'Fruit Tea': 75,
    'Milk Tea': 50,
    'Latte': 50,
    'Tea Latte': 50,
    'Chocolate': 50,
    'Oat Milk': 50,
    'Dessert': 75,
  },
  richBonus: 25, // rich属性が高い場合の甘さボーナス
  maxSugar: 75,
} as const;

