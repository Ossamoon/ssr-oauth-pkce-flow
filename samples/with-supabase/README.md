# OAuth 2.0 PKCE Flow with Supabase

このサンプルは、Supabase Auth を使用した OAuth 2.0 認可コードフロー with PKCE（Proof Key for Code Exchange）の実装を示しています。React Router による SSR アプリケーションを Cloudflare Workers にデプロイします。

## 機能

- OAuth 2.0 with PKCE フローの実装
- Google OAuth プロバイダー統合
- React Router v7 によるサーバーサイドレンダリング
- Cookie ベースのセッション管理
- Cloudflare Workers でのエッジデプロイメント
- 教育目的の包括的な PKCE フローロギング

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
     - `http://localhost:5173/auth/callback`
     - `https://your-app.workers.dev/auth/callback` （本番環境のURL）

### 2. Google OAuth の設定

1. [Google Cloud Console](https://console.cloud.google.com)にアクセス
2. プロジェクトを作成または選択
3. Google+ API を有効化
4. OAuth 2.0 認証情報（ウェブアプリケーション）を作成
5. 承認済みリダイレクト URI を追加:
   - `http://localhost:5173/auth/callback` (開発環境)
   - `https://your-app.workers.dev/auth/callback` (本番環境)

### 3. 環境変数

#### ローカル開発環境

`.dev.vars`ファイルを作成し、以下の環境変数を設定:

```bash
# SupabaseプロジェクトのURL（ダッシュボードから取得）
SUPABASE_URL=https://your-project-ref.supabase.co

# Supabase Anon Key（公開可能なキー、ダッシュボードから取得）
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# アプリケーションのベースURL
PUBLIC_URL=http://localhost:5173
```

> **環境変数の取得方法:**
>
> 1. Supabase ダッシュボードにログイン
> 2. プロジェクトを選択
> 3. Settings > API に移動
> 4. Project URL と Anon Key をコピー

## 開発

```bash
# 依存関係のインストール
pnpm install

# 開発サーバーの起動
pnpm dev

# 型チェック
pnpm typecheck
```

## PKCE フローの理解

実装には PKCE フローの詳細なロギングが含まれています：

1. **Code Verifier の生成**: 暗号学的にランダムな文字列を生成
2. **Code Challenge の作成**: Verifier の SHA-256 ハッシュ
3. **認可リクエスト**: Code Challenge を Google に送信
4. **コード交換**: 認可コードを元の Verifier と共に交換
5. **セッション作成**: 検証成功後、Supabase がセッションを作成

ブラウザコンソールとサーバーログで PKCE フローの動作を確認できます。

## デプロイ

### 環境変数を含めたデプロイ

```bash
# ビルド
pnpm build

# 環境変数を設定してデプロイ
npx wrangler deploy \
  --var SUPABASE_URL:https://your-project-ref.supabase.co \
  --var SUPABASE_ANON_KEY:your-anon-key \
  --var PUBLIC_URL:https://your-app.workers.dev
```

### デプロイ後の設定

1. **Google Cloud Console**で承認済みリダイレクトURIに追加：
   - `https://your-app.workers.dev/auth/callback`

2. **Supabaseダッシュボード**のAuthentication > URL Configurationで：
   - Redirect URLsに `https://your-app.workers.dev/auth/callback` を追加

## アーキテクチャ

- **フレームワーク**: React Router v7 with SSR
- **認証**: Supabase Auth with @supabase/ssr
- **ランタイム**: Cloudflare Workers (エッジ)
- **セッション保存**: HTTPOnly Cookie
- **OAuth フロー**: PKCE 付き認可コード

## セキュリティ機能

- PKCE による認可コード傍受の防止
- HTTPOnly Cookie による XSS 攻撃の防止
- サーバーサイドでのセッション検証
- セキュアなトークン保存
- state パラメータによる CSRF 保護
