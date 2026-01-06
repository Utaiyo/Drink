/**
 * 店舗向けダッシュボード（Back-DSS）
 * 
 * DSSIP評価基準：
 * - Back-DSS: 店舗がDSSの効果を確認できるダッシュボード
 * - 客観計測: KPIを可視化してDSSの価値を検証
 * 
 * 表示するKPI：
 * - 平均意思決定時間（Velocity）
 * - 推薦採用率（Accuracy）
 * - 離脱率（Problemの深刻度）
 * - fallback率（制約が厳しすぎる兆候）
 * - 言語別の利用割合
 * - A/Bテスト比較（baseline vs DSS）
 * 
 * 実装方針：
 * - 開発環境：/api/log から取得したログを集計
 * - 本番環境：外部DB（Supabase等）から取得
 * - 注意：Vercelではファイル永続化できないため、本番ではDBに差し替え必要
 */

import React, { useState, useEffect } from 'react';
import styles from './dashboard.module.css';

interface LogEvent {
  sessionId: string;
  eventType: string;
  timestamp: number;
  language: string;
  variant?: string;
  payload?: any;
}

interface DashboardStats {
  totalSessions: number;
  avgDecisionTimeMs: number;
  adoptionRate: number; // Top3から選ばれた割合
  rankDistribution: { rank1: number; rank2: number; rank3: number };
  abandonmentRate: number;
  fallbackRate: number;
  languageDistribution: Record<string, number>;
  variantComparison: {
    baseline: { avgTime: number; adoptionRate: number };
    dss: { avgTime: number; adoptionRate: number };
  };
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      // 開発環境：/api/logs から取得（簡易実装）
      // 本番環境：外部DBから取得
      const response = await fetch('/api/logs');
      if (!response.ok) {
        throw new Error('Failed to load logs');
      }
      const events: LogEvent[] = await response.json();
      
      const calculatedStats = calculateStats(events);
      setStats(calculatedStats);
    } catch (err) {
      console.error('Failed to load dashboard stats:', err);
      setError('ダッシュボードデータの読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (events: LogEvent[]): DashboardStats => {
    const sessions = new Set<string>();
    const decisionTimes: number[] = [];
    const selections: Array<{ rank: number }> = [];
    const finishes = new Set<string>();
    const abandons = new Set<string>();
    const fallbacks = new Set<string>();
    const languageCounts: Record<string, number> = {};
    const variantStats = {
      baseline: { times: [] as number[], selections: 0, total: 0 },
      dss: { times: [] as number[], selections: 0, total: 0 },
    };

    events.forEach((event) => {
      sessions.add(event.sessionId);
      
      if (event.language) {
        languageCounts[event.language] = (languageCounts[event.language] || 0) + 1;
      }

      if (event.eventType === 'start') {
        if (event.variant) {
          variantStats[event.variant as 'baseline' | 'dss'].total++;
        }
      }

      if (event.eventType === 'recommend') {
        if (event.payload?.decisionTimeMs) {
          decisionTimes.push(event.payload.decisionTimeMs);
          if (event.variant) {
            variantStats[event.variant as 'baseline' | 'dss'].times.push(event.payload.decisionTimeMs);
          }
        }
      }

      if (event.eventType === 'select') {
        if (event.payload?.selectedDrink?.rank) {
          selections.push({ rank: event.payload.selectedDrink.rank });
          if (event.variant) {
            variantStats[event.variant as 'baseline' | 'dss'].selections++;
          }
        }
      }

      if (event.eventType === 'fallback') {
        fallbacks.add(event.sessionId);
      }

      if (event.eventType === 'finish') {
        finishes.add(event.sessionId);
      }

      if (event.eventType === 'abandon') {
        abandons.add(event.sessionId);
      }
    });

    const totalSessions = sessions.size;
    const sessionsWithRecommend = decisionTimes.length;
    const sessionsWithSelection = selections.length;
    const rankDistribution = {
      rank1: selections.filter(s => s.rank === 1).length,
      rank2: selections.filter(s => s.rank === 2).length,
      rank3: selections.filter(s => s.rank === 3).length,
    };

    return {
      totalSessions,
      avgDecisionTimeMs: decisionTimes.length > 0
        ? Math.round(decisionTimes.reduce((a, b) => a + b, 0) / decisionTimes.length)
        : 0,
      adoptionRate: sessionsWithRecommend > 0
        ? Math.round((sessionsWithSelection / sessionsWithRecommend) * 100)
        : 0,
      rankDistribution,
      abandonmentRate: totalSessions > 0
        ? Math.round((abandons.size / totalSessions) * 100)
        : 0,
      fallbackRate: totalSessions > 0
        ? Math.round((fallbacks.size / totalSessions) * 100)
        : 0,
      languageDistribution: languageCounts,
      variantComparison: {
        baseline: {
          avgTime: variantStats.baseline.times.length > 0
            ? Math.round(variantStats.baseline.times.reduce((a, b) => a + b, 0) / variantStats.baseline.times.length)
            : 0,
          adoptionRate: variantStats.baseline.total > 0
            ? Math.round((variantStats.baseline.selections / variantStats.baseline.total) * 100)
            : 0,
        },
        dss: {
          avgTime: variantStats.dss.times.length > 0
            ? Math.round(variantStats.dss.times.reduce((a, b) => a + b, 0) / variantStats.dss.times.length)
            : 0,
          adoptionRate: variantStats.dss.total > 0
            ? Math.round((variantStats.dss.selections / variantStats.dss.total) * 100)
            : 0,
        },
      },
    };
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>読み込み中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>{error}</div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>データがありません</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>DSSダッシュボード</h1>
      <p className={styles.subtitle}>
        意思決定支援システムの効果を可視化（DSSIP Point 5/6/7：客観証拠）
      </p>

      <div className={styles.grid}>
        {/* KPIカード */}
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>総セッション数</h3>
          <div className={styles.cardValue}>{stats.totalSessions}</div>
        </div>

        <div className={styles.card}>
          <h3 className={styles.cardTitle}>平均意思決定時間</h3>
          <div className={styles.cardValue}>
            {Math.round(stats.avgDecisionTimeMs / 1000)}秒
          </div>
          <div className={styles.cardSubtext}>
            Velocity指標：短いほど良い
          </div>
        </div>

        <div className={styles.card}>
          <h3 className={styles.cardTitle}>推薦採用率</h3>
          <div className={styles.cardValue}>{stats.adoptionRate}%</div>
          <div className={styles.cardSubtext}>
            Accuracy指標：Top3から選ばれた割合
          </div>
        </div>

        <div className={styles.card}>
          <h3 className={styles.cardTitle}>離脱率</h3>
          <div className={styles.cardValue}>{stats.abandonmentRate}%</div>
          <div className={styles.cardSubtext}>
            Problemの深刻度：低いほど良い
          </div>
        </div>

        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Fallback率</h3>
          <div className={styles.cardValue}>{stats.fallbackRate}%</div>
          <div className={styles.cardSubtext}>
            制約が厳しすぎる兆候
          </div>
        </div>

        {/* ランク分布 */}
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>選択された順位分布</h3>
          <div className={styles.rankList}>
            <div className={styles.rankItem}>
              <span>1位:</span>
              <span>{stats.rankDistribution.rank1}回</span>
            </div>
            <div className={styles.rankItem}>
              <span>2位:</span>
              <span>{stats.rankDistribution.rank2}回</span>
            </div>
            <div className={styles.rankItem}>
              <span>3位:</span>
              <span>{stats.rankDistribution.rank3}回</span>
            </div>
          </div>
        </div>

        {/* 言語別分布 */}
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>言語別利用割合</h3>
          <div className={styles.languageList}>
            {Object.entries(stats.languageDistribution).map(([lang, count]) => (
              <div key={lang} className={styles.languageItem}>
                <span>{lang}:</span>
                <span>{count}回</span>
              </div>
            ))}
          </div>
        </div>

        {/* A/Bテスト比較 */}
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>A/Bテスト比較</h3>
          <div className={styles.variantComparison}>
            <div className={styles.variantItem}>
              <h4>Baseline（翻訳メニュー）</h4>
              <div>平均時間: {Math.round(stats.variantComparison.baseline.avgTime / 1000)}秒</div>
              <div>採用率: {stats.variantComparison.baseline.adoptionRate}%</div>
            </div>
            <div className={styles.variantItem}>
              <h4>DSS（意思決定支援）</h4>
              <div>平均時間: {Math.round(stats.variantComparison.dss.avgTime / 1000)}秒</div>
              <div>採用率: {stats.variantComparison.dss.adoptionRate}%</div>
            </div>
          </div>
          <div className={styles.improvement}>
            {stats.variantComparison.dss.avgTime < stats.variantComparison.baseline.avgTime && (
              <span className={styles.improvementBadge}>
                Velocity改善: {Math.round((1 - stats.variantComparison.dss.avgTime / stats.variantComparison.baseline.avgTime) * 100)}%
              </span>
            )}
            {stats.variantComparison.dss.adoptionRate > stats.variantComparison.baseline.adoptionRate && (
              <span className={styles.improvementBadge}>
                Accuracy改善: +{stats.variantComparison.dss.adoptionRate - stats.variantComparison.baseline.adoptionRate}%
              </span>
            )}
          </div>
        </div>
      </div>

      <div className={styles.footer}>
        <p>
          <strong>注意：</strong>
          開発環境では簡易ログを使用しています。
          本番環境では外部DB（Supabase等）に差し替えてください。
        </p>
      </div>
    </div>
  );
}

