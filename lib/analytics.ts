/**
 * 計測・ログモジュール（DSSIP Point 5/6/7：客観証拠）
 * 
 * DSSとしての強さ：
 * - Accuracy: 推薦採用率、fallback率などの客観指標を計測
 * - Velocity: 意思決定時間を計測してUX改善の根拠を提供
 * - 客観計測: ユーザー行動イベントを記録し、DSSの効果を検証可能に
 * 
 * 実装方針：
 * - まずはサーバ不要で動く形（ローカル保存/ファイル保存）
 * - 将来の事業化に備えて、Supabase等に差し替えやすい設計
 */

export type EventType = 
  | 'start'      // 診断開始
  | 'answer'     // 質問に回答
  | 'recommend'  // 推薦結果表示
  | 'select'     // ドリンク選択（店員さんに見せる）
  | 'fallback'   // フォールバック発生
  | 'finish'     // 診断完了
  | 'abandon';   // 離脱

export type Variant = 'baseline' | 'dss';

export interface LogEvent {
  sessionId: string;
  eventType: EventType;
  timestamp: number;
  language: 'ja' | 'ko' | 'en' | 'zh-TW';
  variant?: Variant; // A/Bテスト用
  payload?: {
    // start
    // answer
    questionKey?: string;
    answerValue?: string;
    
    // recommend
    decisionTimeMs?: number; // start→recommendまでの時間
    answers?: {
      mood?: string;
      sweetness?: string;
      texture?: string;
      constraints?: Record<string, boolean>;
    };
    recommendedTop3?: Array<{ id: string; name: string; score: number }>;
    
    // select
    selectedDrink?: { id: string; name: string; rank: number };
    
    // fallback
    fallbackStage?: number; // 1: 第1段階緩和, 2: 第2段階緩和
    
    // finish/abandon
    completed?: boolean;
  };
}

/**
 * セッションIDを生成または取得
 */
export function getSessionId(): string {
  if (typeof window === 'undefined') return '';
  
  const key = 'dss_session_id';
  let sessionId = localStorage.getItem(key);
  
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem(key, sessionId);
  }
  
  return sessionId;
}

/**
 * A/Bテストのvariantを取得または割り当て
 */
export function getVariant(): Variant {
  if (typeof window === 'undefined') return 'dss';
  
  const key = 'dss_variant';
  let variant = localStorage.getItem(key) as Variant | null;
  
  if (!variant) {
    // 50/50で割り当て
    variant = Math.random() < 0.5 ? 'baseline' : 'dss';
    localStorage.setItem(key, variant);
  }
  
  return variant;
}

/**
 * イベントをログに記録
 * 
 * 実装方針：
 * - 開発環境では /api/log にPOST
 * - 本番環境では外部DB（Supabase等）に差し替え可能な設計
 */
export async function logEvent(event: Omit<LogEvent, 'sessionId' | 'timestamp'>): Promise<void> {
  if (typeof window === 'undefined') return;
  
  const sessionId = getSessionId();
  const fullEvent: LogEvent = {
    ...event,
    sessionId,
    timestamp: Date.now(),
  };
  
  try {
    // APIエンドポイントに送信
    await fetch('/api/log', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(fullEvent),
    });
  } catch (error) {
    // エラーは無視（オフライン時など）
    console.warn('Failed to log event:', error);
  }
}

/**
 * セッション開始を記録
 */
export function logStart(language: 'ja' | 'ko' | 'en' | 'zh-TW'): void {
  const variant = getVariant();
  logEvent({
    eventType: 'start',
    language,
    variant,
  });
}

/**
 * 質問回答を記録
 */
export function logAnswer(
  language: 'ja' | 'ko' | 'en' | 'zh-TW',
  questionKey: string,
  answerValue: string
): void {
  const variant = getVariant();
  logEvent({
    eventType: 'answer',
    language,
    variant,
    payload: {
      questionKey,
      answerValue,
    },
  });
}

/**
 * 推薦結果を記録
 */
export function logRecommend(
  language: 'ja' | 'ko' | 'en' | 'zh-TW',
  decisionTimeMs: number,
  answers: {
    mood?: string;
    sweetness?: string;
    texture?: string;
    constraints?: Record<string, boolean>;
  },
  recommendedTop3: Array<{ id: string; name: string; score: number }>
): void {
  const variant = getVariant();
  logEvent({
    eventType: 'recommend',
    language,
    variant,
    payload: {
      decisionTimeMs,
      answers,
      recommendedTop3,
    },
  });
}

/**
 * ドリンク選択を記録
 */
export function logSelect(
  language: 'ja' | 'ko' | 'en' | 'zh-TW',
  selectedDrink: { id: string; name: string; rank: number }
): void {
  const variant = getVariant();
  logEvent({
    eventType: 'select',
    language,
    variant,
    payload: {
      selectedDrink,
    },
  });
}

/**
 * フォールバック発生を記録
 */
export function logFallback(
  language: 'ja' | 'ko' | 'en' | 'zh-TW',
  fallbackStage: number
): void {
  const variant = getVariant();
  logEvent({
    eventType: 'fallback',
    language,
    variant,
    payload: {
      fallbackStage,
    },
  });
}

/**
 * 診断完了を記録
 */
export function logFinish(language: 'ja' | 'ko' | 'en' | 'zh-TW'): void {
  const variant = getVariant();
  logEvent({
    eventType: 'finish',
    language,
    variant,
    payload: {
      completed: true,
    },
  });
}

/**
 * 離脱を記録
 */
export function logAbandon(language: 'ja' | 'ko' | 'en' | 'zh-TW'): void {
  const variant = getVariant();
  logEvent({
    eventType: 'abandon',
    language,
    variant,
    payload: {
      completed: false,
    },
  });
}

