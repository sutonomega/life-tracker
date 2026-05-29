"use client";

import { FormEvent, useState } from "react";

export type Meal = {
  id: number;
  date: string;
  mealType: string;
  foodName: string;
  calories: number;
  proteinG: number;
  fatG: number;
  carbsG: number;
  memo: string | null;
};

type MealFormProps = {
  selectedDate: string;
  onCreated: () => void;
};

type FormState = {
  mealType: string;
  foodName: string;
  calories: string;
  proteinG: string;
  fatG: string;
  carbsG: string;
  memo: string;
};

const initialFormState: FormState = {
  mealType: "breakfast",
  foodName: "",
  calories: "",
  proteinG: "",
  fatG: "",
  carbsG: "",
  memo: "",
};

export const mealTypeOptions = [
  { value: "breakfast", label: "朝食" },
  { value: "lunch", label: "昼食" },
  { value: "dinner", label: "夕食" },
  { value: "snack", label: "間食" },
];

export function getMealTypeLabel(mealType: string) {
  return mealTypeOptions.find((option) => option.value === mealType)?.label ?? mealType;
}

export function MealForm({ selectedDate, onCreated }: MealFormProps) {
  const [form, setForm] = useState<FormState>(initialFormState);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField(field: keyof FormState, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");

    const calories = Number(form.calories);
    const proteinG = Number(form.proteinG);
    const fatG = Number(form.fatG);
    const carbsG = Number(form.carbsG);

    if (!form.foodName || !form.calories) {
      setError("食品名とカロリーを入力してください。");
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
      const response = await fetch("/api/meals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: selectedDate,
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
        throw new Error(data.message ?? "食事登録に失敗しました。");
      }

      setMessage("食事を登録しました。");
      setForm(initialFormState);
      onCreated();
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : "食事登録に失敗しました。",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
    >
      <div>
        <h3 className="text-lg font-semibold text-slate-950">登録</h3>
        <p className="mt-1 text-sm text-slate-500">
          カロリーとPFCを食事ごとに記録します。
        </p>
      </div>

      <div className="mt-5 grid gap-4">
        <label className="block">
          <span className="text-sm font-medium text-slate-700">食事区分</span>
          <select
            value={form.mealType}
            onChange={(event) => updateField("mealType", event.target.value)}
            className="mt-1 h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          >
            {mealTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">食品名</span>
          <input
            type="text"
            value={form.foodName}
            onChange={(event) => updateField("foodName", event.target.value)}
            className="mt-1 h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            placeholder="例: オートミール"
            required
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">kcal</span>
            <input
              type="number"
              min="0"
              step="1"
              value={form.calories}
              onChange={(event) => updateField("calories", event.target.value)}
              className="mt-1 h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              required
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">P g</span>
            <input
              type="number"
              min="0"
              step="any"
              value={form.proteinG}
              onChange={(event) => updateField("proteinG", event.target.value)}
              className="mt-1 h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">F g</span>
            <input
              type="number"
              min="0"
              step="any"
              value={form.fatG}
              onChange={(event) => updateField("fatG", event.target.value)}
              className="mt-1 h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">C g</span>
            <input
              type="number"
              min="0"
              step="any"
              value={form.carbsG}
              onChange={(event) => updateField("carbsG", event.target.value)}
              className="mt-1 h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            />
          </label>
        </div>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">メモ</span>
          <textarea
            value={form.memo}
            onChange={(event) => updateField("memo", event.target.value)}
            className="mt-1 min-h-20 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            placeholder="外食、調理方法など"
          />
        </label>
      </div>

      {error ? <p className="mt-4 text-sm font-medium text-rose-700">{error}</p> : null}
      {message ? (
        <p className="mt-4 text-sm font-medium text-emerald-700">{message}</p>
      ) : null}

      <div className="mt-6 flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex h-11 items-center justify-center rounded-md bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {isSubmitting ? "登録中..." : "登録する"}
        </button>
      </div>
    </form>
  );
}
