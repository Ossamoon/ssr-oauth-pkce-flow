# Better Auth サンプルアプリ

SSR と Better Auth を用いた PKCE 付き認可コードフローのデモアプリケーションです。

## 使用技術

- Better Auth（認証）
- Drizzle ORM + Cloudflare D1（データベース）
- Google OAuth（認証プロバイダー）
- React Router v7（SSR 対応）
- Cloudflare Workers（デプロイ先）

## セットアップ

### 1. 依存関係のインストール

```bash
pnpm install
```

### 2. Cloudflare へのログイン

```bash
pnpm wrangler login
```

### 3. D1 データベースの作成

```bash
pnpm wrangler d1 create better-auth-db
```

### 4. 設定ファイルの準備

- `wrangler.jsonc` - D1 データベース ID を設定
- `.dev.vars` - 開発用の環境変数を設定

### 5. データベースマイグレーション

```bash
pnpm wrangler d1 execute better-auth-db --local --file=drizzle/0000_init.sql
```

### 6. 開発サーバーの起動

```bash
pnpm dev
```

## 必要な環境変数

`.dev.vars`に以下を設定：

- `BETTER_AUTH_SECRET` - 認証用シークレット（`openssl rand -base64 32`で生成）
- `BETTER_AUTH_URL` - ベース URL（開発時は`http://localhost:5173`）
- `GOOGLE_CLIENT_ID` - Google OAuth クライアント ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth クライアントシークレット

## Google OAuth 設定

1. [Google Cloud Console](https://console.cloud.google.com/)でプロジェクトを作成
2. OAuth 2.0 クライアント ID を作成
3. リダイレクト URI を追加：
   - 開発用: `http://localhost:5173/api/auth/callback/google`
   - 本番用: `https://your-app.workers.dev/api/auth/callback/google`

## デプロイ

```bash
# 本番環境のシークレット設定
pnpm wrangler secret put BETTER_AUTH_SECRET
pnpm wrangler secret put GOOGLE_CLIENT_ID
pnpm wrangler secret put GOOGLE_CLIENT_SECRET
pnpm wrangler secret put BETTER_AUTH_URL

# デプロイ
pnpm run deploy
```

## ライセンス

MIT
