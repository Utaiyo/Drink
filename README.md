# 飲料店向け意思決定支援システム（DSS）MVP

台湾の飲料店向けに、観光客がQRコードからアクセスして1分以内の質問に答えるだけで、おすすめドリンクを理由付き・多言語で提示するDSSシステムです。

## 技術スタック

- **フロントエンド**: Next.js (Pages Router) + TypeScript
- **データ**: CSV（Googleスプレッドシートからエクスポート）
- **デプロイ**: Vercel推奨

## セットアップ

### ローカル開発

```bash
# 依存関係のインストール
npm install

# 開発サーバー起動
npm run dev
```

ブラウザで http://localhost:3000 を開いてください。

### ビルド

```bash
npm run build
npm start
```

### GitHub公開・Vercelへのデプロイ

**📖 初心者向けの詳しい手順**: [GITHUB_SETUP_DETAILED.md](./GITHUB_SETUP_DETAILED.md) を参照してください。

#### 簡単な手順

1. **GitHubアカウント作成**: [GitHub](https://github.com) でアカウントを作成
2. **Gitリポジトリ初期化**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```
3. **GitHubでリポジトリ作成**: GitHubで新しいリポジトリを作成
4. **コードをプッシュ**:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/drink-dss.git
   git branch -M main
   git push -u origin main
   ```
5. **Vercelでデプロイ**: [Vercel](https://vercel.com) にGitHubアカウントでログインし、リポジトリをインポート

詳細は [GITHUB_SETUP_DETAILED.md](./GITHUB_SETUP_DETAILED.md) をご覧ください。

## 機能

- 5問の心理テスト風質問
- 多言語対応（日本語、韓国語、英語、中国語繁体字）
- DSSロジックによるおすすめTop3表示
- 理由付きの結果表示
- **計測・ログ機能**（DSSIP Point 5/6/7：客観証拠）
- **店舗向けダッシュボード**（Back-DSS）
- **改善ループ**（重み/係数を設定で管理）
- **説明可能性**（寄与度の可視化）
- **A/Bテスト**（baseline vs DSS）

## DSSの特徴

このシステムは単なる診断ではなく、意思決定支援システム（DSS）として設計されています：

### 1. 制約条件フィルタリング（Constraint Filtering）
- **場所**: `lib/dss.ts` の `filterByConstraints()` 関数
- **機能**: ユーザーの制約（乳製品NG、カフェイン控えめ、低糖）を満たす商品を優先的に抽出
- **DSSとしての意義**: 意思決定の前提条件（制約）を明確にし、実行可能な選択肢のみを提示

### 2. MCDM（多基準意思決定 / Multi-Criteria Decision Making）
- **場所**: `lib/dss.ts` の `calculateTotalScore()` 関数
- **機能**: 複数の基準（気分40%、甘さ30%、テクスチャー30%）を重み付けしてスコアリング
- **DSSとしての意義**: 主観的な好みを定量的に評価し、最適解を客観的に算出

### 3. フォールバック機能（Fallback Mechanism）
- **場所**: `lib/dss.ts` の `recommendDrinks()` 関数内
- **機能**: 制約が厳しすぎて0件になった場合、段階的に制約を緩和して再計算
- **DSSとしての意義**: 実行不可能な解を避け、常に実用的な提案を提供

### 4. 理由付き説明（Explanation）
- **場所**: `lib/dss.ts` の `generateReasons()` 関数
- **機能**: 選択内容と結果の因果関係を自然文で説明
- **DSSとしての意義**: ユーザーが結果を理解し、納得して意思決定できるよう支援

### 5. 計測・ログ（Analytics - DSSIP Point 5/6/7：客観証拠）
- **場所**: `lib/analytics.ts`、`pages/api/log.ts`
- **機能**: ユーザー行動イベントを計測（start/answer/recommend/select/fallback/finish/abandon）
- **計測指標**: 
  - Accuracy: 推薦採用率、fallback率
  - Velocity: 意思決定時間
  - Problemの深刻度: 離脱率
- **DSSとしての意義**: DSSの効果を客観的に検証可能に

### 6. 店舗向けダッシュボード（Back-DSS）
- **場所**: `pages/admin/dashboard.tsx`
- **機能**: KPIを可視化してDSSの効果を確認
- **表示KPI**: 
  - 平均意思決定時間
  - 推薦採用率（Top3から選ばれた割合）
  - 離脱率
  - fallback率
  - 言語別利用割合
  - A/Bテスト比較（baseline vs DSS）
- **DSSとしての意義**: 店舗がDSSの価値を検証し、改善に活用

### 7. 改善ループ（Improvement Loop）
- **場所**: `lib/dssConfig.ts`
- **機能**: 重み/係数を外部化して設定変更でDSSの挙動を調整可能に
- **設定項目**:
  - MCDM重み（mood/sweetness/texture）
  - 気分ごとの属性係数
  - テクスチャーごとの属性係数
- **DSSとしての意義**: Accuracy/Velocityの改善を設定変更で実現

### 8. 説明可能性（Explainability）
- **場所**: `lib/dss.ts` の `calculateTotalScore()`、`components/ResultCard.tsx`
- **機能**: 各要素の寄与度を可視化（気分+32 / 甘さ+21 / 食感+18）
- **DSSとしての意義**: 推薦理由を定量的に説明し、透明性を向上

### 9. A/Bテスト（Innovation = Accuracy/Velocityの著しい改善）
- **場所**: `lib/analytics.ts`、`pages/index.tsx`
- **機能**: baseline（翻訳メニュー）とDSSを50/50で比較
- **計測**: 平均意思決定時間、推薦採用率を比較
- **DSSとしての意義**: DSSの効果を定量的に検証し、改善の根拠を提供

## ファイル構成

```
drink-dss/
├── pages/
│   ├── index.tsx          # メインページ（質問フロー管理）
│   ├── _app.tsx           # Next.jsアプリ設定
│   ├── api/
│   │   ├── log.ts         # ログ記録API（DSSIP Point 5/6/7）
│   │   └── logs.ts        # ログ取得API（ダッシュボード用）
│   └── admin/
│       └── dashboard.tsx  # 店舗向けダッシュボード（Back-DSS）
├── components/
│   ├── LanguageSelector.tsx    # 言語選択コンポーネント
│   ├── QuestionCard.tsx        # 質問カードコンポーネント
│   └── ResultCard.tsx         # 結果表示カードコンポーネント（寄与度表示追加）
├── lib/
│   ├── dss.ts             # DSSロジック（核心部分）
│   ├── dssConfig.ts       # DSS設定（改善ループ用）
│   ├── analytics.ts       # 計測・ログ機能（DSSIP Point 5/6/7）
│   └── translations.ts    # 多言語辞書
├── data/
│   └── drinks.csv         # ドリンクデータ（元データ）
├── public/
│   └── data/
│       └── drinks.csv     # ドリンクデータ（静的配信用）
└── styles/
    ├── globals.css        # グローバルスタイル
    └── Home.module.css    # ホームページスタイル
```

## カスタマイズ方法

### ドリンクデータの更新
1. `data/drinks.csv` を編集
2. `public/data/drinks.csv` にも同じ内容をコピー
3. カラム構造は変更しないこと（属性名は変更可能）

### 質問の変更
1. `lib/translations.ts` の `questions` セクションを編集
2. `lib/dss.ts` のスコアリングロジックを必要に応じて調整

### スコアリングの調整（改善ループ）
1. `lib/dssConfig.ts` の `WEIGHTS` でMCDM重みを変更
2. `lib/dssConfig.ts` の `MOOD_COEFFICIENTS` で気分ごとの係数を調整
3. `lib/dssConfig.ts` の `TEXTURE_COEFFICIENTS` でテクスチャーごとの係数を調整
4. `lib/dssConfig.ts` の `SWEETNESS_CONFIG` で甘さスコアリング設定を調整

**改善ループの利点**: コードを変更せずに設定ファイルを編集するだけで、DSSの挙動を調整可能
