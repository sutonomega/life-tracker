# Life Tracker

生活ログを記録するための Next.js アプリです。スケジュール、体重、食事、栄養目標をまとめて管理できます。

正式なアプリ名は **Life Tracker** です。

## 主な機能

* 今日の生活ログを確認できるトップ画面
* スケジュール登録、タイムチャート表示、編集、削除
* 体重登録、一覧表示、期間切替グラフ表示、14日平均表示、編集、削除
* 食事登録、カロリー / PFC 集計、編集、削除
* 栄養目標設定と過不足評価
* SQLite / Prisma を使ったローカルDB保存

## 技術構成

* Next.js
* React
* TypeScript
* Tailwind CSS
* Prisma
* SQLite

## セットアップ

```bash
npm install
```

`.env.local` を作成し、DATABASE_URL を設定します。

```env
DATABASE_URL="file:./dev.db"
```

Prisma Client を生成します。

```bash
npx prisma generate
```

DB を作成・更新します。

```bash
npx prisma db push
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
```

## 画面

* `/` - トップ画面
* `/schedule` - スケジュール管理
* `/weight` - 体重管理
* `/meals` - 食事管理
* `/settings` - 栄養目標設定

## 補足

ローカルDBが未作成の状態でも主要テーブルはアプリ起動時に補完されます。通常は `npx prisma db push` を実行してから利用してください。
