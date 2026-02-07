# Cafe Order System

カフェのオンライン注文システム

## 機能

- メニュー表示（カテゴリ別）
- カート機能（LocalStorage永続化）
- Stripe決済
- リアルタイム注文管理（店舗用）
- メール・LINE通知
- PWA対応

## 技術スタック

- **フロントエンド**: Next.js 15 + TypeScript + Tailwind CSS
- **バックエンド**: Supabase (PostgreSQL + Auth + Realtime)
- **決済**: Stripe Checkout
- **通知**: Resend (メール) + LINE Messaging API

## セットアップ

### 1. 依存関係のインストール

```bash
cd cafe-order-system
npm install
```

### 2. 環境変数の設定

`.env.example`をコピーして`.env.local`を作成:

```bash
cp .env.example .env.local
```

各環境変数を設定:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Stripe
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx

# LINE Messaging API
LINE_CHANNEL_ACCESS_TOKEN=your-line-channel-access-token
LINE_CHANNEL_SECRET=your-line-channel-secret

# Email (Resend)
RESEND_API_KEY=re_xxx

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Supabaseデータベースセットアップ

1. [Supabase](https://supabase.com)でプロジェクトを作成
2. SQL Editorで`supabase/migrations/001_initial_schema.sql`を実行
3. Realtimeを有効化（ordersテーブル）

### 4. Stripe設定

1. [Stripe Dashboard](https://dashboard.stripe.com)でアカウント作成
2. テストモードのAPIキーを取得
3. Webhookを設定（`/api/webhook/stripe`）
   - イベント: `checkout.session.completed`

### 5. 開発サーバー起動

```bash
npm run dev
```

http://localhost:3000 でアクセス

## ページ構成

### 顧客向け
- `/` - メニュー一覧
- `/cart` - カート
- `/checkout` - 注文確定
- `/orders/[id]` - 注文状況

### 管理画面
- `/admin` - 注文管理（リアルタイム更新）
- `/admin/menu` - メニュー管理
- `/admin/login` - 管理者ログイン

## 管理者アカウント作成

1. Supabase Dashboardで認証 > ユーザーを追加
2. adminsテーブルにレコードを追加:

```sql
INSERT INTO admins (id, email, name) VALUES
  ('ユーザーUID', 'admin@example.com', '管理者名');
```

## PWA設定

アイコン画像を配置:
- `public/icons/icon-192.png` (192x192)
- `public/icons/icon-512.png` (512x512)

## デプロイ

### Vercel

1. GitHubにプッシュ
2. Vercelでインポート
3. 環境変数を設定
4. Stripe WebhookのURLを更新

```bash
vercel --prod
```
