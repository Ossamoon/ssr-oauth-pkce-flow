# OAuth 2.0 PKCE Flow with Supabase

このサンプルは、Supabase Auth を使用した OAuth 2.0 認可コードフロー with PKCE（Proof Key for Code Exchange）の実装を示しています。React Router による SSR アプリケーションを Cloudflare Workers にデプロイします。

## 前提条件

1. Google OAuth が設定された Supabase プロジェクト
2. Google Cloud Console の OAuth 2.0 認証情報
3. デプロイ用の Cloudflare アカウント

## セットアップ

### 1. Supabase の設定

1. [supabase.com](https://supabase.com)で新しいプロジェクトを作成
2. Supabase ダッシュボードで Authentication > Providers に移動
3. Google プロバイダーを有効化
4. Google OAuth 認証情報を追加
5. Authentication > URL Configuration で以下を設定：
   - **Site URL**: `http://localhost:5173` （開発環境）
   - **Redirect URLs**に以下を追加：
     - `http://localhost:5173/**` （開発環境）
     - `https://<your-app>.workers.dev/**` （本番環境）

### 2. Google OAuth の設定

1. [Google Cloud Console](https://console.cloud.google.com)にアクセス
2. プロジェクトを作成または選択
3. OAuth 2.0 認証情報（ウェブアプリケーション）を作成
4. 承認済みリダイレクト URI には、Supabase ダッシュボードで表示されるリダイレクト URI を設定:
   - Supabase Dashboard > Authentication > Providers > Google で表示される
   - 通常は `https://<your-project-ref>.supabase.co/auth/v1/callback` の形式

### 3. 環境変数

#### ローカル開発環境

`.dev.vars`ファイルを作成し、以下の環境変数を設定:

```bash
# SupabaseプロジェクトのURL（ダッシュボードから取得）
SUPABASE_URL=https://<your-project-ref>.supabase.co

# Supabase Anon Key（公開可能なキー、ダッシュボードから取得）
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# アプリケーションのベースURL
PUBLIC_URL=http://localhost:5173
```

## 開発

```bash
# 依存関係のインストール
pnpm install

# 型チェック
pnpm typecheck

# 開発サーバーの起動
pnpm dev
```

## デプロイ

### 環境変数を含めたデプロイ

```bash
# ビルド&デプロイ
pnpm run deploy

# 環境変数を設定してデプロイ
npx wrangler deploy \
  --var SUPABASE_URL:https://your-project-ref.supabase.co \
  --var SUPABASE_ANON_KEY:your-anon-key \
  --var PUBLIC_URL:https://your-app.workers.dev
```
