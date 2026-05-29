"use client";

import { FormEvent, useState } from "react";
import { Meal, getMealTypeLabel } from "./MealForm";

type MealItemProps = {
  meal: Meal;
  onChanged: () => void;
};

const mealTypes = [
  { value: "breakfast", label: "朝食" },
  { value: "lunch", label: "昼食" },
  { value: "dinner", label: "夕食" },
  { value: "snack", label: "間食" },
];

export function MealItem({ meal, onChanged }: MealItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    date: meal.date,
    mealType: meal.mealType,
    foodName: meal.foodName,
    calories: String(meal.calories),
    proteinG: String(meal.proteinG),
    fatG: String(meal.fatG),
    carbsG: String(meal.carbsG),
    memo: meal.memo ?? "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");

    const calories = Number(form.calories);
    const proteinG = Number(form.proteinG);
    const fatG = Number(form.fatG);
    const carbsG = Number(form.carbsG);

    if (!form.date || !form.mealType || !form.foodName || !form.calories) {
      setError("日付、食事区分、食品名、カロリーを入力してください。");
      return;
    }

    if (
      !Number.isInteger(calories) ||
      calories < 0 ||
      !Number.isFinite(proteinG) ||
      proteinG < 0 ||
      !Number.isFinite(fatG) ||
      fatG < 0 ||
      !Number.isFinite(carbsG) ||
      carbsG < 0
    ) {
      setError("カロリーとPFCは0以上の数値で入力してください。");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/meals/${meal.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: form.date,
          mealType: form.mealType,
          foodName: form.foodName,
          calories,
          proteinG,
          fatG,
          carbsG,
          memo: form.memo,
        }),
      });

      if (!response.ok) {
        const data = (await response.json()) as { message?: string };
        throw new Error(data.message ?? "食事記録の更新に失敗しました。");
      }

      setMessage("更新しました。");
      setIsEditing(false);
      onChanged();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "食事記録の更新に失敗しました。",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete() {
    setMessage("");
    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/meals/${meal.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = (await response.json()) as { message?: string };
        throw new Error(data.message ?? "食事記録の削除に失敗しました。");
      }

      onChanged();
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "食事記録の削除に失敗しました。",
      );
      setIsSubmitting(false);
    }
  }

  if (isEditing) {
    return (
      <form onSubmit={handleSave} className="border-b border-slate-100 py-4 last:border-b-0">
        <div className="grid min-w-0 gap-3 md:grid-cols-2">
          <label className="block">
            <span className="text-xs font-semibold text-slate-500">日付</span>
            <input
              type="date"
              value={form.date}
              onChange={(event) => updateField("date", event.target.value)}
              className="date-input mt-1 h-10 w-full rounded-md border border-slate-300 px-3 text-sm leading-10 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              required
            />
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-slate-500">食事区分</span>
            <select
              value={form.mealType}
              onChange={(event) => updateField("mealType", event.target.value)}
              className="mt-1 h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              required
            >
              {mealTypes.map((mealType) => (
                <option key={mealType.value} value={mealType.value}>
                  {mealType.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block md:col-span-2">
            <span className="text-xs font-semibold text-slate-500">食品名</span>
            <input
              type="text"
              value={form.foodName}
              onChange={(event) => updateField("foodName", event.target.value)}
              className="mt-1 h-10 w-full rounded-md border border-slate-300 px-3 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              required
            />
          </label>
          <div className="grid min-w-0 gap-3 md:col-span-2 sm:grid-cols-4">
            {[
              ["calories", "kcal", "1"],
              ["proteinG", "P g", "any"],
              ["fatG", "F g", "any"],
              ["carbsG", "C g", "any"],
            ].map(([field, label, step]) => (
              <label key={field} className="block">
                <span className="text-xs font-semibold text-slate-500">{label}</span>
                <input
                  type="number"
                  min="0"
                  step={step}
                  value={form[field as keyof typeof form]}
                  onChange={(event) =>
                    updateField(field as keyof typeof form, event.target.value)
                  }
                  className="mt-1 h-10 w-full rounded-md border border-slate-300 px-3 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                  required={field === "calories"}
                />
              </label>
            ))}
          </div>
          <label className="block md:col-span-2">
            <span className="text-xs font-semibold text-slate-500">メモ</span>
            <textarea
              value={form.memo}
              onChange={(event) => updateField("memo", event.target.value)}
              className="mt-1 min-h-20 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            />
          </label>
        </div>

        {error ? <p className="mt-3 text-sm font-medium text-rose-700">{error}</p> : null}

        <div className="mt-4 flex flex-wrap justify-end gap-2">
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="h-9 w-full rounded-md border border-slate-200 px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 sm:w-auto"
          >
            キャンセル
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="h-9 w-full rounded-md bg-slate-950 px-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400 sm:w-auto"
          >
            {isSubmitting ? "保存中..." : "保存する"}
          </button>
        </div>
      </form>
    );
  }

  return (
    <article className="grid min-w-0 gap-3 border-b border-slate-100 py-4 last:border-b-0 md:grid-cols-[96px_1fr_240px_auto] md:items-center">
      <div>
        <span className="inline-flex rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800">
          {getMealTypeLabel(meal.mealType)}
        </span>
      </div>
      <div>
        <h4 className="font-semibold text-slate-950">{meal.foodName}</h4>
        <p className="mt-1 text-sm text-slate-500">{meal.memo || "メモなし"}</p>
        {message ? (
          <p className="mt-1 text-sm font-medium text-emerald-700">{message}</p>
        ) : null}
        {error ? (
          <p className="mt-1 text-sm font-medium text-rose-700">{error}</p>
        ) : null}
      </div>
      <div className="grid min-w-0 grid-cols-4 gap-2 text-sm">
        <p>
          <span className="block text-xs text-slate-400">kcal</span>
          <span className="font-semibold text-slate-950">{meal.calories}</span>
        </p>
        <p>
          <span className="block text-xs text-slate-400">P</span>
          <span className="font-semibold text-slate-950">{meal.proteinG.toFixed(1)}</span>
        </p>
        <p>
          <span className="block text-xs text-slate-400">F</span>
          <span className="font-semibold text-slate-950">{meal.fatG.toFixed(1)}</span>
        </p>
        <p>
          <span className="block text-xs text-slate-400">C</span>
          <span className="font-semibold text-slate-950">{meal.carbsG.toFixed(1)}</span>
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setIsEditing(true)}
          className="h-8 flex-1 rounded-md border border-slate-200 px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 sm:flex-none"
        >
          編集
        </button>
        <button
          type="button"
          onClick={handleDelete}
          disabled={isSubmitting}
          className="h-8 flex-1 rounded-md border border-rose-200 px-3 text-xs font-semibold text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60 sm:flex-none"
        >
          削除
        </button>
      </div>
    </article>
  );
}
