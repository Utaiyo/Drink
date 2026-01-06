# GitHub公開手順

## 1. Gitリポジトリの初期化

```bash
cd /Users/taiyomac/Desktop/python/drink-dss
git init
git add .
git commit -m "Initial commit: ドリンク選別アプリ完成"
```

## 2. GitHubでリポジトリを作成

1. [GitHub](https://github.com) にログイン
2. 右上の「+」→「New repository」をクリック
3. リポジトリ名を入力（例: `drink-dss`）
4. 「Public」または「Private」を選択
5. 「Initialize this repository with a README」は**チェックしない**（既にREADMEがあるため）
6. 「Create repository」をクリック

## 3. リモートリポジトリを追加してプッシュ

GitHubで作成したリポジトリのURLをコピーして、以下のコマンドを実行：

```bash
# リモートリポジトリを追加（YOUR_USERNAMEとYOUR_REPO_NAMEを置き換えてください）
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# ブランチ名をmainに変更（必要に応じて）
git branch -M main

# プッシュ
git push -u origin main
```

## 4. Vercelでデプロイ（推奨）

### 方法1: GitHub連携（簡単）

1. [Vercel](https://vercel.com) にアクセス
2. 「Sign Up」→「Continue with GitHub」でGitHubアカウントでログイン
3. 「Add New Project」をクリック
4. 作成したGitHubリポジトリを選択
5. 「Import」をクリック
6. Vercelが自動的にNext.jsプロジェクトを検出
7. 「Deploy」をクリック
8. 数分でデプロイ完了！URLが発行されます

### 方法2: Vercel CLI

```bash
# Vercel CLIをインストール
npm i -g vercel

# デプロイ
vercel

# 初回はログインが必要です
# プロジェクトの設定を確認してEnter
```

## 5. デプロイ後の確認

- Vercelから発行されたURLでアプリが動作することを確認
- 必要に応じてカスタムドメインを設定可能

## 注意事項

- `.gitignore`に`node_modules`や`.next`が含まれていることを確認
- `public/data/drinks.csv`がコミットされていることを確認
- 環境変数が必要な場合は、Vercelのダッシュボードで設定

