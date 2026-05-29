# Life Tracker

生活ログを記録するための Next.js アプリです。スケジュール、体重、食事、栄養目標をまとめて管理できます。

正式なアプリ名は **Life Tracker** です。

## 主な機能

* 今日の生活ログを確認できるトップ画面
* スケジュール登録、タイムチャート表示、編集、削除
* 体重登録、一覧表示、期間切替グラフ表示、14日平均表示、編集、削除
* 食事登録、カロリー / PFC 集計、編集、削除
* 栄養目標設定と過不足評価
* PostgreSQL / Prisma を使ったDB保存

## 技術構成

* Next.js
* React
* TypeScript
* Tailwind CSS
* Prisma
* PostgreSQL

## セットアップ

```bash
npm install
```

`.env` を作成し、`DATABASE_URL` を設定します。

本番環境では Neon PostgreSQL の接続URLを Vercel の環境変数 `DATABASE_URL` に設定します。

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require"
```

ローカル開発では、ローカルにPostgreSQLを用意するか、Neonの開発用DBを作成して `.env` に接続URLを設定してください。

Prisma Client を生成します。`npm install`、`npm run dev`、`npm run build` でも自動生成されます。

```bash
npx prisma generate
```

DB スキーマを反映します。

```bash
npx prisma migrate deploy
```

## 起動

```bash
npm run dev
```

ブラウザで http://localhost:3000 を開きます。

## 確認コマンド

```bash
npm run lint
npm run build
npx prisma validate
```

## 画面

* `/` - トップ画面
* `/schedule` - スケジュール管理
* `/weight` - 体重管理
* `/meals` - 食事管理
* `/settings` - 栄養目標設定

## DB運用

* 本番DBは Neon PostgreSQL を利用します。
* Vercel には `DATABASE_URL` を環境変数として設定してください。
* SQLite向けの自動テーブル作成処理は廃止し、Prisma migrationでスキーマを管理します。
* ローカル開発では `.env` にPostgreSQL接続URLを設定し、`npx prisma migrate deploy` を実行してから利用してください。
