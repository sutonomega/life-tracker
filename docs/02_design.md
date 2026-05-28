# 基本設計書

> **マイルストーン**: 基本設計 / **期限**: 2026-06-14  
> 関連 Issue: #15 #17 #18 #19 #20 #21 #23

---

## 1. システム構成 <!-- #15 -->

### 全体アーキテクチャ

```
┌─────────────────────────────────────┐
│           ブラウザ (Chrome)           │
│  Next.js App Router (React / TSX)   │
└────────────────┬────────────────────┘
                 │ HTTP (fetch)
┌────────────────▼────────────────────┐
│        Next.js API Routes           │
│     (Server Actions / Route Handler) │
└────────────────┬────────────────────┘
                 │ Prisma Client
┌────────────────▼────────────────────┐
│           SQLite (local)            │
│            dev.db                   │
└─────────────────────────────────────┘
```

### 技術スタック（確定）

| カテゴリ | 技術 | バージョン目安 |
|----------|------|----------------|
| フレームワーク | Next.js (App Router) | 14.x |
| 言語 | TypeScript | 5.x |
| DB | SQLite | - |
| ORM | Prisma | 5.x |
| スタイリング | Tailwind CSS | 3.x |
| グラフ | Recharts | 2.x |
| パッケージマネージャー | npm | - |

### データフロー

```
ユーザー操作
    ↓
React コンポーネント（クライアント）
    ↓
Server Actions / fetch → API Route Handler
    ↓
Prisma Client
    ↓
SQLite (dev.db)
```

---

## 2. DB テーブル設計 <!-- #17 -->

### テーブル一覧

| テーブル名 | 説明 | 対応機能 |
|-----------|------|---------|
| `schedule_categories` | カテゴリマスタ | スケジュール管理 |
| `schedules` | 予定記録 | スケジュール管理 |
| `weight_logs` | 体重記録 | 体重管理 |
| `meals` | 食事記録 | 食事管理 |
| `nutrition_goals` | 栄養目標値 | 栄養評価 |

### Prisma スキーマ

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model ScheduleCategory {
  id        Int        @id @default(autoincrement())
  name      String     @unique
  color     String                      // HEX カラーコード（例: #4A6CF7）
  schedules Schedule[]
  createdAt DateTime   @default(now())

  @@map("schedule_categories")
}

model Schedule {
  id         Int              @id @default(autoincrement())
  date       String                       // YYYY-MM-DD
  title      String
  categoryId Int
  category   ScheduleCategory @relation(fields: [categoryId], references: [id])
  startTime  String                       // HH:MM
  endTime    String                       // HH:MM
  memo       String?
  createdAt  DateTime         @default(now())
  updatedAt  DateTime         @updatedAt

  @@map("schedules")
}

model WeightLog {
  id        Int      @id @default(autoincrement())
  date      String   @unique                // YYYY-MM-DD（1日1件）
  weightKg  Float                           // 例: 65.4
  memo      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("weight_logs")
}

model Meal {
  id        Int      @id @default(autoincrement())
  date      String                           // YYYY-MM-DD
  mealType  String                           // breakfast / lunch / dinner / snack
  foodName  String
  calories  Int                              // kcal
  proteinG  Float                            // g
  fatG      Float                            // g
  carbsG    Float                            // g（UI表示は「糖質」）
  memo      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("meals")
}

model NutritionGoal {
  id        Int      @id @default(autoincrement())
  calories  Int                              // kcal（デフォルト: 2000）
  proteinG  Float                            // g（デフォルト: 60）
  fatG      Float                            // g（デフォルト: 65）
  carbsG    Float                            // g（デフォルト: 260）
  updatedAt DateTime @updatedAt

  @@map("nutrition_goals")
}
```

### テーブル間のリレーション

```
schedule_categories ──< schedules     （1対多）
nutrition_goals                        （独立・設定値として1件管理）
weight_logs                            （日付でユニーク）
meals                                  （日付 + 食事区分で複数可）
```

### シードデータ（`prisma/seed.ts`）

```typescript
// カテゴリ初期データ
const categories = [
  { name: '仕事',   color: '#4A6CF7' },
  { name: '運動',   color: '#22C55E' },
  { name: '食事',   color: '#F59E0B' },
  { name: '休憩',   color: '#8B5CF6' },
  { name: 'その他', color: '#6B7280' },
];

// 栄養目標値 初期データ
const nutritionGoal = {
  calories: 2000,
  proteinG: 60,
  fatG:     65,
  carbsG:   260,
};
```

---

## 3. 画面設計

### 3.1 共通レイアウト

```
┌────────────────────────────────────┐
│  ヘッダー（アプリ名 + 現在日付）      │
├──────────┬─────────────────────────┤
│          │                         │
│ サイド   │   メインコンテンツ        │
│ ナビ     │                         │
│          │                         │
│ ・ダッシュ│                         │
│ ・スケジュ│                         │
│ ・体重   │                         │
│ ・食事   │                         │
│ ・設定   │                         │
└──────────┴─────────────────────────┘
```

### 3.2 ダッシュボード（`/`）

**目的**: 今日の状態をひと目で把握する

```
┌─────────────────────────────────────┐
│  今日の概要  2026-05-28（木）         │
├──────────┬──────────┬───────────────┤
│ 今日の予定 │  体重    │  カロリー     │
│ ・〇〇    │  65.4 kg │  1,200 kcal  │
│ ・〇〇    │ （昨日比）│ / 2,000 kcal │
│ →もっと見る│          │               │
└──────────┴──────────┴───────────────┘
│  栄養バランス（今日）                  │
│  P ████░░  40g / 60g                │
│  F ██████  65g / 65g ✅             │
│  C ██░░░░  100g / 260g             │
└─────────────────────────────────────┘
```

**表示内容**
- 今日の予定（直近3件、リンク付き）
- 今日の体重（未入力時は「-」表示）
- 今日の摂取カロリー合計 / 目標
- PFC の簡易プログレスバー

### 3.3 スケジュール画面（`/schedule`）<!-- #18 -->

**目的**: 一日の行動をタイムチャートで管理する

```
┌──────────────────────────────────────┐
│ < 2026-05-28（木）>    ＋ 予定を追加  │
├──────────────────────────────────────┤
│ 00:00 │                              │
│  ...  │                              │
│ 09:00 │ ████ 仕事（ミーティング）      │
│ 10:00 │ ████                         │
│ 11:00 │                              │
│ 12:00 │ ██ 食事（ランチ）             │
│  ...  │                              │
│ 18:00 │ ███ 運動（ジム）              │
│  ...  │                              │
│ 23:00 │                              │
└──────────────────────────────────────┘
```

**コンポーネント構成**

| コンポーネント | 役割 |
|--------------|------|
| `DateNavigator` | 日付の前後移動 |
| `TimeChart` | 24時間タイムライン描画 |
| `ScheduleBlock` | 予定ブロック（カテゴリカラー） |
| `ScheduleForm` | 予定の登録・編集フォーム |

**操作フロー**
1. 日付セレクターで対象日を選択
2. タイムチャート上の予定ブロックをクリック → 詳細・編集
3. 「＋ 予定を追加」→ フォームモーダルを開く
4. タイトル・カテゴリ・開始/終了時間を入力して保存

### 3.4 体重画面（`/weight`）<!-- #19 -->

**目的**: 日次体重を記録し推移を確認する

```
┌──────────────────────────────────────┐
│ 今日の体重を記録                       │
│  [  65.4  ] kg    メモ: [        ]   │
│                           ［ 保存 ］  │
├──────────────────────────────────────┤
│ 過去14日間の推移                       │
│                                      │
│  66 ┤       ╭─╮                     │
│  65 ┤  ╭────╯  ╰──╮                 │
│  64 ┤──╯           ╰──              │
│     └──────────────────              │
│      5/15        5/28               │
│                                      │
│  14日間平均: 65.1 kg                  │
└──────────────────────────────────────┘
```

**コンポーネント構成**

| コンポーネント | 役割 |
|--------------|------|
| `WeightForm` | 体重・メモの入力フォーム |
| `WeightChart` | Recharts 折れ線グラフ |
| `WeightStats` | 平均・最高・最低値の表示 |

**操作フロー**
1. 体重（kg）を入力して保存
2. 当日分がすでにある場合は上書き確認
3. グラフで直近14日の推移を確認

### 3.5 食事画面（`/meals`）<!-- #20 -->

**目的**: 食事内容とPFCを記録・管理する

```
┌──────────────────────────────────────┐
│ ＜ 2026-05-28（木）＞   ＋ 食事を追加  │
├──────────────────────────────────────┤
│ 🌅 朝食                              │
│  ご飯         200kcal  P5  F0  C44   │
│  目玉焼き      80kcal  P6  F6  C0    │
│                                      │
│ ☀️ 昼食                              │
│  ざるそば     350kcal  P14 F2  C68   │
│                                      │
│ 🌙 夕食                              │
│  （未記録）                           │
│                                      │
│ 🍪 間食                              │
│  （未記録）                           │
├──────────────────────────────────────┤
│ 合計  630kcal   P25g  F8g  C112g    │
└──────────────────────────────────────┘
```

**コンポーネント構成**

| コンポーネント | 役割 |
|--------------|------|
| `DateNavigator` | 日付の前後移動 |
| `MealSection` | 食事区分ごとのセクション |
| `MealItem` | 食品1件の表示行 |
| `MealForm` | 食事登録・編集フォーム |
| `NutritionSummary` | 一日の栄養合計表示 |

**操作フロー**
1. 「＋ 食事を追加」→ フォームを開く
2. 食品名・食事区分・カロリー・PFC を入力して保存
3. 食品行のクリックで編集・削除

### 3.6 栄養評価画面（`/meals` 下部 or ダッシュボード）<!-- #21 -->

**目的**: 目標値との比較で食生活の過不足を把握する

```
┌──────────────────────────────────────┐
│ 今日の栄養評価                         │
├──────────────────────────────────────┤
│ カロリー   630 / 2000 kcal           │
│           ████░░░░░░░░  31%  不足    │
│                                      │
│ タンパク質  25 / 60 g                 │
│           ████░░░░░░░░  41%  不足    │
│                                      │
│ 脂質        8 / 65 g                 │
│           █░░░░░░░░░░░  12%  不足    │
│                                      │
│ 糖質      112 / 260 g               │
│           █████░░░░░░░  43%  不足    │
└──────────────────────────────────────┘
```

**判定ロジック**（要件定義書 §3.4 より）

| 達成率 | 判定 | バーカラー |
|--------|------|-----------|
| 90〜110% | 適正 ✅ | `#22C55E` |
| 110%超 | 過剰 ⚠️ | `#EF4444` |
| 90%未満 | 不足 📉 | `#F59E0B` |

---

## 4. 設計チェックリスト <!-- #23 -->

- [x] システム構成を整理した（#15）
- [x] DBテーブル構成を設計した（#17）
- [x] スケジュール管理画面を設計した（#18）
- [x] 体重管理画面を設計した（#19）
- [x] 食事管理画面を設計した（#20）
- [x] 栄養評価画面を設計した（#21）
- [ ] ディレクトリ構成を設計した（#16）→ `04_directory.md` 参照
- [ ] API一覧を整理した（#22）→ `03_api.md` 参照
- [ ] 基本設計書のレビューと最終確認（#23）
