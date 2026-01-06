# DSSIP評価基準に沿った拡張機能

このドキュメントでは、DSSIP評価基準（Point 5/6/7）に沿って追加された機能について説明します。

## 追加された機能一覧

### A. 計測・ログ（Point 5/6/7：客観証拠）

**実装ファイル**:
- `lib/analytics.ts`: ログイベント送信機能
- `pages/api/log.ts`: ログ記録APIエンドポイント

**計測するイベント**:
- `start`: 診断開始
- `answer`: 質問に回答
- `recommend`: 推薦結果表示
- `select`: ドリンク選択（店員さんに見せる）
- `fallback`: フォールバック発生
- `finish`: 診断完了
- `abandon`: 離脱

**計測指標**:
- **Accuracy**: 推薦採用率、fallback率
- **Velocity**: 意思決定時間（start→recommend）
- **Problemの深刻度**: 離脱率

**実装方針**:
- 開発環境：`/api/log` にPOSTして、`logs/events.jsonl` に追記
- 本番環境：外部DB（Supabase等）に差し替え必要
- **注意**: Vercelではファイル永続化できないため、本番では必ずDBを使用

---

### B. 店舗向けダッシュボード（Back-DSS）

**実装ファイル**:
- `pages/admin/dashboard.tsx`: ダッシュボードページ
- `pages/admin/dashboard.module.css`: ダッシュボードスタイル
- `pages/api/logs.ts`: ログ取得API

**表示するKPI**:
1. **総セッション数**: 診断を開始したユーザー数
2. **平均意思決定時間**: Velocity指標（短いほど良い）
3. **推薦採用率**: Accuracy指標（Top3から選ばれた割合）
4. **離脱率**: Problemの深刻度（低いほど良い）
5. **Fallback率**: 制約が厳しすぎる兆候
6. **選択された順位分布**: 1位/2位/3位それぞれの選択回数
7. **言語別利用割合**: どの言語が多く使われているか
8. **A/Bテスト比較**: baseline vs DSSの比較

**アクセス方法**:
- URL: `/admin/dashboard`
- 開発環境：`http://localhost:3000/admin/dashboard`

---

### C. 改善ループ（Improvement Loop）

**実装ファイル**:
- `lib/dssConfig.ts`: DSS設定管理

**外部化した設定**:
1. **MCDM重み** (`WEIGHTS`):
   - `mood`: 0.4（気分スコアの重み）
   - `sweetness`: 0.3（甘さスコアの重み）
   - `texture`: 0.3（テクスチャースコアの重み）

2. **気分ごとの係数** (`MOOD_COEFFICIENTS`):
   - `refreshing`: refreshing/fruity/richの係数
   - `tired`: refreshing/caffeine/richの係数
   - `excited`: fruity/refreshing/caffeineの係数
   - `calm`: rich/teaCategory/refreshingの係数

3. **テクスチャーごとの係数** (`TEXTURE_COEFFICIENTS`):
   - `light`: chewy/jelly/richの係数
   - `jelly`: jelly属性の係数
   - `chewy`: chewy属性の係数
   - `smooth`: rich/chewy/jellyの係数

4. **甘さスコアリング設定** (`SWEETNESS_CONFIG`):
   - 希望甘さマップ
   - カテゴリ別甘さ推定値
   - rich属性ボーナス

**改善ループの利点**:
- コードを変更せずに設定ファイルを編集するだけで、DSSの挙動を調整可能
- 店舗別にconfigを差し替え可能（将来拡張）
- Accuracy/Velocityの改善を設定変更で実現

---

### D. 説明可能性（Explainability）

**実装ファイル**:
- `lib/dss.ts`: `calculateTotalScore()` で寄与度を計算
- `components/ResultCard.tsx`: 寄与度を表示

**寄与度の計算**:
```typescript
contributions: {
  mood: number;        // 気分による寄与度（重み付け後）
  sweetness: number;   // 甘さによる寄与度（重み付け後）
  texture: number;     // テクスチャーによる寄与度（重み付け後）
  constraint: number;  // 制約条件による寄与度（ボーナス）
}
```

**UI表示**:
- 結果カードに「寄与度」セクションを追加
- 各要素の点数を表示（例：気分+32 / 甘さ+21 / 食感+18）
- 多言語対応

**説明可能性の意義**:
- 推薦理由を定量的に説明
- ユーザーが結果を理解し、納得して意思決定できるよう支援
- DSSの透明性を向上

---

### E. A/Bテスト（Innovation = Accuracy/Velocityの著しい改善）

**実装ファイル**:
- `lib/analytics.ts`: variant割り当て機能
- `pages/index.tsx`: baseline/DSSの分岐処理

**実装内容**:
1. **Variant割り当て**: 50/50で `baseline` または `dss` を割り当て
2. **Baselineバリアント**: 翻訳メニュー（人気順固定、ランキングなし）
3. **DSSバリアント**: 既存の `recommendDrinks()` を使用
4. **計測**: 各variantの平均意思決定時間、推薦採用率を記録
5. **比較**: ダッシュボードでbaseline vs DSSを比較

**A/Bテストの意義**:
- DSSの効果を定量的に検証
- Accuracy/Velocityの改善を数値で示す
- 改善の根拠を提供

---

## DSSとしての強さ

### Input/Model/Output

- **Input**: ユーザー回答（mood/sweetness/texture/constraints）
- **Model**: MCDM重み付けスコアリング + 制約フィルタリング + フォールバック
- **Output**: Top3推薦 + 理由 + 寄与度

### Accuracy/Velocity

- **Accuracy**: 推薦採用率、fallback率で計測
- **Velocity**: 意思決定時間で計測
- **改善**: A/Bテストでbaselineと比較

### 客観計測

- ユーザー行動イベントを記録
- KPIを可視化してDSSの効果を検証可能に
- ダッシュボードで店舗が確認可能

### Back-DSS

- 店舗向けダッシュボードでKPIを表示
- DSSの価値を検証し、改善に活用可能

---

## 本番環境への移行

### 注意事項

1. **Vercelではファイル永続化できない**
   - 開発環境：`logs/events.jsonl` に追記
   - 本番環境：外部DB（Supabase/PostgreSQL等）に差し替え必要

2. **推奨DB**:
   - Supabase（PostgreSQL）
   - Firebase Firestore
   - MongoDB Atlas

3. **移行手順**:
   - `pages/api/log.ts` のコメント部分を実装
   - `pages/api/logs.ts` のコメント部分を実装
   - 環境変数でDB接続情報を設定

---

## ファイル変更サマリー

### 新規作成ファイル

1. `lib/dssConfig.ts` - DSS設定管理
2. `lib/analytics.ts` - 計測・ログ機能
3. `pages/api/log.ts` - ログ記録API
4. `pages/api/logs.ts` - ログ取得API
5. `pages/admin/dashboard.tsx` - ダッシュボード
6. `pages/admin/dashboard.module.css` - ダッシュボードスタイル

### 修正ファイル

1. `lib/dss.ts` - dssConfig参照、寄与度返却、fallbackStage返却
2. `pages/index.tsx` - A/Bテスト、ログ送信
3. `components/ResultCard.tsx` - 寄与度表示
4. `components/ResultCard.module.css` - 寄与度スタイル
5. `.gitignore` - logsディレクトリを追加
6. `README.md` - 追加機能の説明

---

## 使用方法

### ダッシュボードの確認

1. 開発サーバーを起動: `npm run dev`
2. ブラウザで `http://localhost:3000/admin/dashboard` を開く
3. KPIが表示される（ログがない場合は空の状態）

### 設定の変更

1. `lib/dssConfig.ts` を編集
2. 重みや係数を調整
3. 再デプロイ（または開発サーバー再起動）

### ログの確認

1. 開発環境：`logs/events.jsonl` を確認
2. 本番環境：外部DBから取得

---

## 今後の拡張

- 店舗別config管理（Supabase等で店舗ごとの設定を保存）
- リアルタイムダッシュボード（WebSocket等で更新）
- 機械学習による重み最適化
- より詳細な分析（時間帯別、曜日別など）

