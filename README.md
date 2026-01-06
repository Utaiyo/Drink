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

- 4問の心理テスト風質問
- 多言語対応（日本語、韓国語、英語）
- DSSロジックによるおすすめTop3表示
- 理由付きの結果表示

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

## ファイル構成

```
drink-dss/
├── pages/
│   ├── index.tsx          # メインページ（質問フロー管理）
│   └── _app.tsx           # Next.jsアプリ設定
├── components/
│   ├── LanguageSelector.tsx    # 言語選択コンポーネント
│   ├── QuestionCard.tsx        # 質問カードコンポーネント
│   └── ResultCard.tsx         # 結果表示カードコンポーネント
├── lib/
│   ├── dss.ts             # DSSロジック（核心部分）
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

### スコアリングの調整
1. `lib/dss.ts` の `calculateTotalScore()` 関数で重みを変更
2. `calculateMoodScore()`, `calculateSweetnessScore()`, `calculateTextureScore()` で各基準の計算方法を調整

