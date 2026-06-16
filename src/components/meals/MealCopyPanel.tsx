"use client";

import { useEffect, useMemo, useState } from "react";
import { getMealTypeLabel, Meal, mealTypeOptions } from "./MealForm";

type MealCopyPanelProps = {
  selectedDate: string;
  targetMealCount: number;
  onCopied: () => void;
};

export function MealCopyPanel({
  selectedDate,
  targetMealCount: _targetMealCount,
  onCopied,
}: MealCopyPanelProps) {
  const [sourceDate, setSourceDate] = useState(selectedDate);
  const [targetMealType, setTargetMealType] = useState("breakfast");
  const [previewMeals, setPreviewMeals] = useState<Meal[]>([]);
  const [selectedMealIds, setSelectedMealIds] = useState<number[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedMealCount = selectedMealIds.length;
  const isAllSelected = previewMeals.length > 0 && selectedMealCount === previewMeals.length;

  const selectedMeals = useMemo(() => {
    const selectedIds = new Set(selectedMealIds);
    return previewMeals.filter((meal) => selectedIds.has(meal.id));
  }, [previewMeals, selectedMealIds]);

  const selectedCalories = selectedMeals.reduce((total, meal) => total + meal.calories, 0);

  useEffect(() => {
    async function fetchPreview() {
      setMessage("");
      setError("");
      setPreviewMeals([]);
      setSelectedMealIds([]);

      if (!sourceDate) {
        return;
      }

      setIsLoading(true);

      try {
        const params = new URLSearchParams({ date: sourceDate });
        const response = await fetch(`/api/meals?${params.toString()}`);

        if (!response.ok) {
          throw new Error("コピー元の食事取得に失敗しました。");
        }

        setPreviewMeals((await response.json()) as Meal[]);
      } catch (fetchError) {
        setError(
          fetchError instanceof Error
            ? fetchError.message
            : "コピー元の食事取得に失敗しました。",
        );
      } finally {
        setIsLoading(false);
      }
    }

    fetchPreview();
  }, [sourceDate]);

  function toggleMealId(mealId: number) {
    setSelectedMealIds((current) =>
      current.includes(mealId)
        ? current.filter((id) => id !== mealId)
        : [...current, mealId],
    );
  }

  function toggleAllMeals() {
    setSelectedMealIds(isAllSelected ? [] : previewMeals.map((meal) => meal.id));
  }

  async function handleCopy() {
    setMessage("");
    setError("");

    if (!sourceDate) {
      setError("コピー元の日付を指定してください。");
      return;
    }

    if (selectedMealIds.length === 0) {
      setError("コピーする食品を選択してください。");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/meals/copy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceDate,
          targetDate: selectedDate,
          targetMealType,
          mealIds: selectedMealIds,
        }),
      });

      const data = (await response.json()) as { count?: number; message?: string };

      if (!response.ok) {
        throw new Error(data.message ?? "食事コピーに失敗しました。");
      }

      setMessage(`${data.count ?? 0}件の食事をコピーしました。`);
      setSelectedMealIds([]);
      onCopied();
    } catch (copyError) {
      setError(
        copyError instanceof Error ? copyError.message : "食事コピーに失敗しました。",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="min-w-0 rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div>
        <h3 className="text-lg font-semibold text-slate-950">コピー</h3>
        <p className="mt-1 text-sm text-slate-500">
          過去日の食事から、必要な食品だけ表示日へコピーします。
        </p>
      </div>

      <div className="mt-4 grid min-w-0 gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium text-slate-700">コピー元日付</span>
          <input
            type="date"
            value={sourceDate}
            onChange={(event) => setSourceDate(event.target.value)}
            className="date-input mt-1 h-11 w-full rounded-md border border-slate-300 px-3 text-sm leading-[2.75rem] outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">コピー先の食事区分</span>
          <select
            value={targetMealType}
            onChange={(event) => setTargetMealType(event.target.value)}
            className="mt-1 h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          >
            {mealTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-4 rounded-md bg-slate-50 p-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-700">コピーする食品</p>
            <p className="mt-1 text-xs text-slate-500">
              {selectedMealCount}件選択中 / {selectedCalories}kcal
            </p>
          </div>
          <button
            type="button"
            onClick={toggleAllMeals}
            disabled={isLoading || previewMeals.length === 0}
            className="h-9 rounded-md border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isAllSelected ? "すべて解除" : "すべて選択"}
          </button>
        </div>

        <div className="mt-3">
          {isLoading ? <p className="text-sm text-slate-500">読み込み中...</p> : null}
          {!isLoading && previewMeals.length === 0 ? (
            <p className="text-sm text-slate-500">コピー対象の食事はありません。</p>
          ) : null}
          {!isLoading && previewMeals.length > 0 ? (
            <div className="space-y-2">
              {previewMeals.map((meal) => (
                <label
                  key={meal.id}
                  className="flex cursor-pointer gap-3 rounded-md bg-white p-3 text-sm text-slate-700 transition hover:bg-slate-100"
                >
                  <input
                    type="checkbox"
                    checked={selectedMealIds.includes(meal.id)}
                    onChange={() => toggleMealId(meal.id)}
                    className="mt-1 h-4 w-4 rounded border-slate-300"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold text-slate-950">{meal.foodName}</span>
                    <span className="mt-1 block text-xs text-slate-500">
                      {getMealTypeLabel(meal.mealType)} / {meal.calories}kcal / P {meal.proteinG}g /
                      F {meal.fatG}g / C {meal.carbsG}g
                    </span>
                    {meal.memo ? (
                      <span className="mt-1 block text-xs text-slate-400">{meal.memo}</span>
                    ) : null}
                  </span>
                </label>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      {error ? <p className="mt-3 text-sm font-medium text-rose-700">{error}</p> : null}
      {message ? (
        <p className="mt-3 text-sm font-medium text-emerald-700">{message}</p>
      ) : null}

      <div className="mt-4 flex justify-end">
        <button
          type="button"
          onClick={handleCopy}
          disabled={isSubmitting || selectedMealIds.length === 0}
          className="h-10 w-full rounded-md bg-slate-950 px-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400 sm:w-auto"
        >
          {isSubmitting
            ? "コピー中..."
            : `${getMealTypeLabel(targetMealType)}へコピー`}
        </button>
      </div>
    </section>
  );
}
