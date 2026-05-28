# ディレクトリ構成

> **マイルストーン**: 基本設計 / **期限**: 2026-06-14  
> 関連 Issue: #16

---

## 1. ディレクトリツリー

```
life-stack/
├── prisma/
│   ├── schema.prisma          # DB スキーマ定義
│   ├── seed.ts                # 初期データ投入（カテゴリ・栄養目標値）
│   └── migrations/            # Prisma マイグレーションファイル（自動生成）
│
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── layout.tsx         # ルートレイアウト（サイドナビ・ヘッダー）
│   │   ├── page.tsx           # ダッシュボード（/）
│   │   │
│   │   ├── schedule/
│   │   │   └── page.tsx       # スケジュール画面（/schedule）
│   │   │
│   │   ├── weight/
│   │   │   └── page.tsx       # 体重画面（/weight）
│   │   │
│   │   ├── meals/
│   │   │   └── page.tsx       # 食事画面（/meals）
│   │   │
│   │   ├── settings/
│   │   │   └── page.tsx       # 設定画面（/settings）
│   │   │
│   │   └── api/               # Route Handler（REST API）
│   │       ├── schedules/
│   │       │   ├── route.ts           # GET / POST
│   │       │   └── [id]/route.ts      # PUT / DELETE
│   │       ├── schedule-categories/
│   │       │   ├── route.ts
│   │       │   └── [id]/route.ts
│   │       ├── weight-logs/
│   │       │   ├── route.ts
│   │       │   └── [id]/route.ts
│   │       ├── meals/
│   │       │   ├── route.ts
│   │       │   └── [id]/route.ts
│   │       └── nutrition-goals/
│   │           └── route.ts           # GET / PUT
│   │
│   ├── components/            # 再利用コンポーネント
│   │   ├── layout/
│   │   │   ├── Header.tsx             # ヘッダー（アプリ名・現在日付）
│   │   │   └── SideNav.tsx            # サイドナビゲーション
│   │   │
│   │   ├── schedule/
│   │   │   ├── TimeChart.tsx          # 24時間タイムライン
│   │   │   ├── ScheduleBlock.tsx      # 予定ブロック
│   │   │   ├── ScheduleForm.tsx       # 登録・編集フォーム
│   │   │   └── DateNavigator.tsx      # 日付前後移動
│   │   │
│   │   ├── weight/
│   │   │   ├── WeightForm.tsx         # 体重入力フォーム
│   │   │   ├── WeightChart.tsx        # Recharts 折れ線グラフ
│   │   │   └── WeightStats.tsx        # 平均・最高・最低値
│   │   │
│   │   ├── meals/
│   │   │   ├── MealSection.tsx        # 食事区分セクション
│   │   │   ├── MealItem.tsx           # 食品1件の表示行
│   │   │   ├── MealForm.tsx           # 食事登録・編集フォーム
│   │   │   └── NutritionSummary.tsx   # 栄養合計 + 評価バー
│   │   │
│   │   └── ui/                # 汎用 UI パーツ
│   │       ├── Button.tsx
│   │       ├── Input.tsx
│   │       ├── Modal.tsx
│   │       └── ProgressBar.tsx        # 栄養評価バー
│   │
│   ├── lib/
│   │   ├── db.ts              # Prisma クライアント（シングルトン）
│   │   ├── utils.ts           # 汎用ユーティリティ（日付・数値フォーマット）
│   │   └── constants.ts       # 定数（食事区分名・カラーコード等）
│   │
│   └── types/
│       └── index.ts           # TypeScript 型定義（API レスポンス型等）
│
├── .env.local                 # 環境変数（DATABASE_URL）※ Git 管理外
├── .env.example               # 環境変数テンプレート
├── .gitignore
├── next.config.ts
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

---

## 2. 主要ファイルの役割

### `src/lib/db.ts`

Prisma クライアントをシングルトンで管理する（開発時のホットリロード対策）。

```typescript
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ log: ['query'] });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

### `src/lib/constants.ts`

アプリ全体で使う定数をここで一元管理する。

```typescript
export const MEAL_TYPES = {
  breakfast: '朝食',
  lunch:     '昼食',
  dinner:    '夕食',
  snack:     '間食',
} as const;

export const NUTRITION_STATUS_COLOR = {
  optimal:  '#22C55E',  // 90〜110%
  excess:   '#EF4444',  // 110%超
  shortage: '#F59E0B',  // 90%未満
} as const;
```

### `src/types/index.ts`

API レスポンスと共通型をここで定義する。コンポーネント・API ルート双方から import する。

```typescript
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export type NutritionStatus = 'optimal' | 'excess' | 'shortage';

export interface DailyNutrition {
  calories: number;
  proteinG: number;
  fatG:     number;
  carbsG:   number;
}
```

---

## 3. 命名規則

| 対象 | ルール | 例 |
|------|--------|-----|
| コンポーネントファイル | PascalCase | `WeightChart.tsx` |
| ユーティリティ・lib | camelCase | `db.ts`, `utils.ts` |
| API Route | `route.ts` 固定 | `app/api/meals/route.ts` |
| Prisma モデル | PascalCase（単数形） | `WeightLog`, `Meal` |
| DB テーブル | snake_case（複数形） | `weight_logs`, `meals` |
| 環境変数 | UPPER_SNAKE_CASE | `DATABASE_URL` |

---

## 4. 環境変数

`.env.example`:

```env
# Prisma / SQLite
DATABASE_URL="file:./dev.db"
```

---

## 5. セットアップ手順

```bash
# 1. 依存関係インストール
npm install

# 2. 環境変数設定
cp .env.example .env.local

# 3. DB マイグレーション実行
npx prisma migrate dev --name init

# 4. シードデータ投入
npx prisma db seed

# 5. 開発サーバー起動
npm run dev
```
