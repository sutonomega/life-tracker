# 🗂️ Life Stack

> 日々の予定・体重・食事を記録する個人向け生活管理アプリ

[![Issues](https://img.shields.io/github/issues/sutonomega/life-tracker)](https://github.com/sutonomega/life-tracker/issues)
[![Milestone](https://img.shields.io/badge/milestone-要件定義-blue)](https://github.com/sutonomega/life-tracker/milestone/1)

---

## 📖 概要

Life Stack は、毎日の予定・体重・食事を一元管理し、生活習慣の改善と振り返りをサポートする個人向けアプリです。  
記録のハードルを下げ、**継続できる環境**を作ることを目指しています。

---

## ✨ 主な機能（MVP）

| 機能 | 説明 |
|------|------|
| 📅 スケジュール管理 | 一日の予定をカテゴリ付きで登録・タイムチャート表示 |
| ⚖️ 体重管理 | 毎日の体重記録・14日間グラフ表示 |
| 🍽️ 食事管理 | 食事内容・カロリー・PFC を記録 |
| 📊 栄養評価 | 一日の栄養合計と目標値の比較表示 |

---

## 🛠️ 技術スタック

| カテゴリ | 技術 |
|----------|------|
| フレームワーク | Next.js (App Router) |
| 言語 | TypeScript |
| データベース | SQLite |
| ORM | Prisma |
| スタイリング | Tailwind CSS |
| グラフ | Recharts |

---

## 📋 開発ロードマップ

| マイルストーン | 内容 | 期限 | 状況 |
|--------------|------|------|------|
| [要件定義](https://github.com/sutonomega/life-tracker/milestone/1) | アプリ目的・MVP範囲・機能仕様の整理 | 6/7 | 🔄 進行中 |
| [基本設計](https://github.com/sutonomega/life-tracker/milestone/2) | DB設計・画面構成・API設計 | 6/14 | ⏳ 未着手 |
| [MVP実装](https://github.com/sutonomega/life-tracker/milestone/3) | 全機能実装・CRUD操作 | 6/28 | ⏳ 未着手 |
| [テスト・改善](https://github.com/sutonomega/life-tracker/milestone/4) | 動作確認・UI改善・レスポンシブ対応 | 7/5 | ⏳ 未着手 |

進捗は [GitHub Projects](https://github.com/users/sutonomega/projects/2) で管理しています。

---

## 📚 ドキュメント

| ドキュメント | 対応マイルストーン | 状況 |
|------------|------------------|------|
| [要件定義書](docs/01_requirements.md) | 要件定義 | 🔄 作成中 |
| [基本設計書](docs/02_design.md) | 基本設計 | ⏳ 未着手 |
| [API設計書](docs/03_api.md) | 基本設計 | ⏳ 未着手 |
| [ディレクトリ構成](docs/04_directory.md) | 基本設計 | ⏳ 未着手 |

---

## 🚀 セットアップ（実装開始後に更新予定）

```bash
# リポジトリをクローン
git clone https://github.com/sutonomega/life-tracker.git
cd life-tracker

# 依存関係をインストール
npm install

# 環境変数を設定
cp .env.example .env.local

# データベースをセットアップ
npx prisma migrate dev

# 開発サーバーを起動
npm run dev
```

---

## 🔮 今後追加予定の機能

- 😴 睡眠管理
- 🤖 AI による生活分析
- 📱 スマホ対応（PWA）
- 📆 カレンダー連携
- 📤 CSV エクスポート

---

## 📄 ライセンス

MIT
