# 🚀 GitHub公開完全ガイド（初心者向け）

このガイドでは、ドリンク選別アプリをGitHubに公開して、誰でもアクセスできるようにする方法を詳しく説明します。

---

## 📋 目次

1. [準備：必要なもの](#準備必要なもの)
2. [ステップ1：GitHubアカウントの作成](#ステップ1githubアカウントの作成)
3. [ステップ2：Gitリポジトリの初期化](#ステップ2gitリポジトリの初期化)
4. [ステップ3：GitHubでリポジトリを作成](#ステップ3githubでリポジトリを作成)
5. [ステップ4：コードをGitHubにアップロード](#ステップ4コードをgithubにアップロード)
6. [ステップ5：Vercelで公開（無料）](#ステップ5vercelで公開無料)
7. [トラブルシューティング](#トラブルシューティング)

---

## 準備：必要なもの

✅ **GitHubアカウント**（まだ持っていない場合は作成します）  
✅ **ターミナル（Terminal）**（Macには標準で入っています）  
✅ **インターネット接続**

---

## ステップ1：GitHubアカウントの作成

### 1-1. GitHubにアクセス

1. ブラウザで [https://github.com](https://github.com) を開く
2. 右上の「Sign up」ボタンをクリック

### 1-2. アカウント情報を入力

- **Username**: 好きなユーザー名を入力（例：`taiyomac`）
- **Email**: メールアドレスを入力
- **Password**: パスワードを入力（8文字以上、英数字と記号を含む）

### 1-3. 確認と登録

1. 「Verify your account」でパズルを解く
2. 「Create account」をクリック
3. メールアドレスに確認メールが届くので、確認リンクをクリック

**✅ これでGitHubアカウントの準備完了！**

---

## ステップ2：Gitリポジトリの初期化

### 2-1. ターミナルを開く

1. Macの「Spotlight検索」（⌘ + スペース）を開く
2. 「ターミナル」または「Terminal」と入力
3. Enterキーを押す

### 2-2. プロジェクトフォルダに移動

ターミナルに以下のコマンドを**1行ずつ**入力してEnterキーを押します：

```bash
cd /Users/taiyomac/Desktop/python/drink-dss
```

**💡 コピペのコツ**: コマンドをコピーして、ターミナルに貼り付け（⌘ + V）、Enterキーを押します。

### 2-3. Gitリポジトリを初期化

以下のコマンドを**順番に**実行します：

```bash
# 1. Gitリポジトリを初期化
git init
```

**出力例**: `Initialized empty Git repository in /Users/taiyomac/Desktop/python/drink-dss/.git/`

```bash
# 2. すべてのファイルをステージング（追加準備）
git add .
```

**出力例**: 何も表示されない場合がありますが、正常です。

```bash
# 3. 最初のコミット（変更を記録）
git commit -m "Initial commit: ドリンク選別アプリ完成"
```

**出力例**: 
```
[main (root-commit) xxxxxxx] Initial commit: ドリンク選別アプリ完成
 X files changed, X insertions(+)
```

**✅ これでローカルのGitリポジトリが準備できました！**

---

## ステップ3：GitHubでリポジトリを作成

### 3-1. 新しいリポジトリを作成

1. GitHubにログインした状態で、右上の「+」アイコンをクリック
2. 「New repository」を選択

### 3-2. リポジトリ情報を入力

以下のように入力します：

- **Repository name**: `drink-dss`（好きな名前でOK）
- **Description**: `台湾飲料店向けドリンク選別アプリ`（任意）
- **Public / Private**: 
  - **Public**: 誰でも見れる（オススメ）
  - **Private**: 自分だけが見れる
- **⚠️ 重要**: 以下のチェックボックスは**すべて外す**
  - ❌ Add a README file
  - ❌ Add .gitignore
  - ❌ Choose a license

### 3-3. リポジトリを作成

「Create repository」ボタンをクリック

**✅ GitHubリポジトリが作成されました！**

---

## ステップ4：コードをGitHubにアップロード

### 4-1. GitHubの指示を確認

リポジトリ作成後、以下のような画面が表示されます：

```
…or push an existing repository from the command line

git remote add origin https://github.com/YOUR_USERNAME/drink-dss.git
git branch -M main
git push -u origin main
```

### 4-2. リモートリポジトリを追加

ターミナルに戻り、以下のコマンドを実行します：

**⚠️ 重要**: `YOUR_USERNAME`を自分のGitHubユーザー名に置き換えてください！

```bash
# 例：ユーザー名が「taiyomac」の場合
git remote add origin https://github.com/taiyomac/drink-dss.git
```

**💡 確認方法**: GitHubのリポジトリページで、緑色の「Code」ボタンをクリックするとURLが表示されます。

### 4-3. ブランチ名をmainに変更

```bash
git branch -M main
```

### 4-4. GitHubにプッシュ（アップロード）

```bash
git push -u origin main
```

**初回の場合、認証が求められます：**

1. **Username**: GitHubのユーザー名を入力
2. **Password**: **⚠️ 注意**: 通常のパスワードではなく、**Personal Access Token**が必要です

### 4-5. Personal Access Tokenの作成（初回のみ）

パスワードの代わりにPersonal Access Tokenを作成します：

1. GitHubの右上のアイコンをクリック → 「Settings」
2. 左メニューの一番下「Developer settings」をクリック
3. 「Personal access tokens」→「Tokens (classic)」をクリック
4. 「Generate new token」→「Generate new token (classic)」をクリック
5. **Note**: `drink-dss-deploy`など、わかりやすい名前を入力
6. **Expiration**: 90 days（または好きな期間）
7. **Select scopes**: `repo`にチェックを入れる
8. 一番下の「Generate token」をクリック
9. **⚠️ 重要**: 表示されたトークンをコピーして保存（後で見れません！）

### 4-6. 再度プッシュ

```bash
git push -u origin main
```

- **Username**: GitHubのユーザー名
- **Password**: 先ほどコピーしたPersonal Access Tokenを貼り付け

**成功すると以下のような出力が表示されます：**

```
Enumerating objects: XX, done.
Counting objects: 100% (XX/XX), done.
Writing objects: 100% (XX/XX), done.
To https://github.com/YOUR_USERNAME/drink-dss.git
 * [new branch]      main -> main
Branch 'main' set up to track remote branch 'main' from 'origin'.
```

**✅ GitHubにコードがアップロードされました！**

GitHubのリポジトリページをリロードすると、すべてのファイルが表示されているはずです。

---

## ステップ5：Vercelで公開（無料）

### 5-1. Vercelにアクセス

1. ブラウザで [https://vercel.com](https://vercel.com) を開く
2. 「Sign Up」をクリック
3. 「Continue with GitHub」をクリック
4. GitHubの認証画面で「Authorize Vercel」をクリック

### 5-2. プロジェクトをインポート

1. Vercelのダッシュボードで「Add New Project」をクリック
2. 「Import Git Repository」で、先ほど作成した`drink-dss`リポジトリを選択
3. 「Import」をクリック

### 5-3. プロジェクト設定

Vercelが自動的にNext.jsプロジェクトを検出します：

- **Framework Preset**: Next.js（自動検出）
- **Root Directory**: `./`（そのまま）
- **Build Command**: `npm run build`（自動）
- **Output Directory**: `.next`（自動）
- **Install Command**: `npm install`（自動）

**そのまま「Deploy」をクリック！**

### 5-4. デプロイ完了

1. 数分待つと「Congratulations!」画面が表示されます
2. **「Visit」ボタンをクリック**すると、公開されたアプリが開きます！
3. URLは `https://drink-dss-xxxxx.vercel.app` のような形式です

**✅ アプリが公開されました！**

このURLをQRコードにして、お店に貼り付けることができます！

---

## トラブルシューティング

### ❌ エラー：`fatal: not a git repository`

**原因**: プロジェクトフォルダに移動していない

**解決方法**:
```bash
cd /Users/taiyomac/Desktop/python/drink-dss
git init
```

### ❌ エラー：`remote origin already exists`

**原因**: 既にリモートリポジトリが設定されている

**解決方法**:
```bash
git remote remove origin
git remote add origin https://github.com/YOUR_USERNAME/drink-dss.git
```

### ❌ エラー：`Permission denied`

**原因**: Personal Access Tokenが間違っている、または期限切れ

**解決方法**: 
1. GitHubで新しいPersonal Access Tokenを作成
2. 再度`git push`を実行

### ❌ エラー：`failed to push some refs`

**原因**: GitHubのリポジトリにREADMEなどが既にある

**解決方法**:
```bash
git pull origin main --allow-unrelated-histories
# コンフリクトがなければ
git push -u origin main
```

### ❌ Vercelでビルドエラー

**原因**: 依存関係の問題

**解決方法**:
1. ローカルで`npm run build`を実行して確認
2. エラーがあれば修正してから再度プッシュ

---

## 🎉 完了！

これで、あなたのアプリが世界中の誰でもアクセスできるようになりました！

### 次のステップ

- **カスタムドメイン**: Vercelのダッシュボードで独自ドメインを設定可能
- **更新**: コードを変更したら、`git push`するだけで自動的に再デプロイされます
- **QRコード**: 公開URLをQRコードジェネレーターでQRコード化して印刷

---

## 📞 困ったときは

- GitHubのヘルプ: [https://docs.github.com](https://docs.github.com)
- Vercelのヘルプ: [https://vercel.com/docs](https://vercel.com/docs)

頑張ってください！🚀

