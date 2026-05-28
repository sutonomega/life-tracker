# API 設計書

> **マイルストーン**: 基本設計 / **期限**: 2026-06-14  
> 関連 Issue: #22

Next.js の Route Handler（`app/api/...`）を使用した REST API。  
すべてのエンドポイントは `Content-Type: application/json` でやり取りする。

---

## 1. エンドポイント一覧

| メソッド | パス | 説明 |
|---------|------|------|
| GET | `/api/schedules` | 予定一覧取得（日付指定） |
| POST | `/api/schedules` | 予定登録 |
| PUT | `/api/schedules/[id]` | 予定更新 |
| DELETE | `/api/schedules/[id]` | 予定削除 |
| GET | `/api/schedule-categories` | カテゴリ一覧取得 |
| POST | `/api/schedule-categories` | カテゴリ登録 |
| DELETE | `/api/schedule-categories/[id]` | カテゴリ削除 |
| GET | `/api/weight-logs` | 体重記録一覧取得（期間指定） |
| POST | `/api/weight-logs` | 体重記録登録（当日分は上書き） |
| DELETE | `/api/weight-logs/[id]` | 体重記録削除 |
| GET | `/api/meals` | 食事記録一覧取得（日付指定） |
| POST | `/api/meals` | 食事記録登録 |
| PUT | `/api/meals/[id]` | 食事記録更新 |
| DELETE | `/api/meals/[id]` | 食事記録削除 |
| GET | `/api/nutrition-goals` | 栄養目標値取得 |
| PUT | `/api/nutrition-goals` | 栄養目標値更新 |

---

## 2. スケジュール管理

### `GET /api/schedules`

日付を指定して予定一覧を取得する。

**クエリパラメータ**

| パラメータ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| `date` | string | ✅ | 対象日（YYYY-MM-DD） |

**レスポンス** `200 OK`

```json
[
  {
    "id": 1,
    "date": "2026-05-28",
    "title": "ミーティング",
    "categoryId": 1,
    "category": { "id": 1, "name": "仕事", "color": "#4A6CF7" },
    "startTime": "09:00",
    "endTime": "10:00",
    "memo": "",
    "createdAt": "2026-05-28T00:00:00.000Z"
  }
]
```

### `POST /api/schedules`

**リクエストボディ**

```json
{
  "date": "2026-05-28",
  "title": "ミーティング",
  "categoryId": 1,
  "startTime": "09:00",
  "endTime": "10:00",
  "memo": ""
}
```

**レスポンス** `201 Created` — 作成したレコードを返す

### `PUT /api/schedules/[id]`

**リクエストボディ** — 変更するフィールドのみ送信可

```json
{
  "title": "定例会議",
  "endTime": "10:30"
}
```

**レスポンス** `200 OK` — 更新後のレコードを返す

### `DELETE /api/schedules/[id]`

**レスポンス** `204 No Content`

---

## 3. カテゴリ管理

### `GET /api/schedule-categories`

**レスポンス** `200 OK`

```json
[
  { "id": 1, "name": "仕事",   "color": "#4A6CF7" },
  { "id": 2, "name": "運動",   "color": "#22C55E" },
  { "id": 3, "name": "食事",   "color": "#F59E0B" },
  { "id": 4, "name": "休憩",   "color": "#8B5CF6" },
  { "id": 5, "name": "その他", "color": "#6B7280" }
]
```

### `POST /api/schedule-categories`

```json
{ "name": "勉強", "color": "#EC4899" }
```

**レスポンス** `201 Created`

### `DELETE /api/schedule-categories/[id]`

> ⚠️ そのカテゴリを参照している `schedules` が存在する場合は `409 Conflict` を返す

**レスポンス** `204 No Content` / `409 Conflict`

---

## 4. 体重管理

### `GET /api/weight-logs`

**クエリパラメータ**

| パラメータ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| `days` | number | ❌ | 直近N日分（デフォルト: 14） |

**レスポンス** `200 OK`

```json
[
  { "id": 1, "date": "2026-05-28", "weightKg": 65.4, "memo": "" },
  { "id": 2, "date": "2026-05-27", "weightKg": 65.6, "memo": "" }
]
```

### `POST /api/weight-logs`

当日分がすでに存在する場合は上書き（upsert）する。

```json
{ "date": "2026-05-28", "weightKg": 65.4, "memo": "" }
```

**レスポンス** `200 OK` または `201 Created`

### `DELETE /api/weight-logs/[id]`

**レスポンス** `204 No Content`

---

## 5. 食事管理

### `GET /api/meals`

**クエリパラメータ**

| パラメータ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| `date` | string | ✅ | 対象日（YYYY-MM-DD） |

**レスポンス** `200 OK`

```json
[
  {
    "id": 1,
    "date": "2026-05-28",
    "mealType": "breakfast",
    "foodName": "ご飯",
    "calories": 200,
    "proteinG": 5.0,
    "fatG": 0.5,
    "carbsG": 44.0,
    "memo": ""
  }
]
```

### `POST /api/meals`

```json
{
  "date": "2026-05-28",
  "mealType": "breakfast",
  "foodName": "ご飯",
  "calories": 200,
  "proteinG": 5.0,
  "fatG": 0.5,
  "carbsG": 44.0,
  "memo": ""
}
```

**レスポンス** `201 Created`

### `PUT /api/meals/[id]`

```json
{ "calories": 220 }
```

**レスポンス** `200 OK`

### `DELETE /api/meals/[id]`

**レスポンス** `204 No Content`

---

## 6. 栄養目標値

### `GET /api/nutrition-goals`

**レスポンス** `200 OK`

```json
{
  "id": 1,
  "calories": 2000,
  "proteinG": 60.0,
  "fatG": 65.0,
  "carbsG": 260.0,
  "updatedAt": "2026-05-28T00:00:00.000Z"
}
```

### `PUT /api/nutrition-goals`

レコードが存在しない場合は新規作成（upsert）する。

```json
{
  "calories": 2200,
  "proteinG": 70.0,
  "fatG": 70.0,
  "carbsG": 280.0
}
```

**レスポンス** `200 OK`

---

## 7. エラーレスポンス共通仕様

| ステータス | 説明 |
|-----------|------|
| `400 Bad Request` | バリデーションエラー（必須項目不足・型不一致） |
| `404 Not Found` | 指定した ID が存在しない |
| `409 Conflict` | 参照整合性の違反（カテゴリ削除時など） |
| `500 Internal Server Error` | DB エラーなど予期しないエラー |

**エラーレスポンス形式**

```json
{
  "error": "エラーの概要",
  "details": "詳細情報（省略可）"
}
```
