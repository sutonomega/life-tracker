"use client";

import { useEffect, useState } from "react";
import { Meal } from "./MealForm";

type MealCopyPanelProps = {
  selectedDate: string;
  targetMealCount: number;
  onCopied: () => void;
};

export function MealCopyPanel({
  selectedDate,
  targetMealCount,
  onCopied,
}: MealCopyPanelProps) {
  const [sourceDate, setSourceDate] = useState(selectedDate);
  const [previewMeals, setPreviewMeals] = useState<Meal[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function fetchPreview() {
      setMessage("");
      setError("");
      setPreviewMeals([]);

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

  async function handleCopy() {
    setMessage("");
    setError("");

    if (!sourceDate || sourceDate === selectedDate) {
      setError("コピー元には表示日とは別の日付を指定してください。");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/meals/copy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sourceDate, targetDate: selectedDate }),
      });

      const data = (await response.json()) as { count?: number; message?: string };

      if (!response.ok) {
        throw new Error(data.message ?? "食事コピーに失敗しました。");
      }

      setMessage(`${data.count ?? 0}件の食事をコピーしました。`);
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
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div>
        <h3 className="text-lg font-semibold text-slate-950">コピー</h3>
        <p className="mt-1 text-sm text-slate-500">
          過去日の食事を表示日へまとめてコピーします。
        </p>
      </div>

      <label className="mt-4 block">
        <span className="text-sm font-medium text-slate-700">コピー元日付</span>
        <input
          type="date"
          value={sourceDate}
          onChange={(event) => setSourceDate(event.target.value)}
          className="mt-1 h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
        />
      </label>

      <div className="mt-4 rounded-md bg-slate-50 p-3">
        {isLoading ? <p className="text-sm text-slate-500">読み込み中...</p> : null}
        {!isLoading && previewMeals.length === 0 ? (
          <p className="text-sm text-slate-500">コピー対象の食事はありません。</p>
        ) : null}
        {!isLoading && previewMeals.length > 0 ? (
          <ul className="space-y-2">
            {previewMeals.map((meal) => (
              <li key={meal.id} className="text-sm text-slate-700">
                {meal.foodName}
                <span className="ml-2 text-xs text-slate-500">
                  {meal.calories}kcal
                </span>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      {error ? <p className="mt-3 text-sm font-medium text-rose-700">{error}</p> : null}
      {message ? (
        <p className="mt-3 text-sm font-medium text-emerald-700">{message}</p>
      ) : null}
      {targetMealCount > 0 ? (
        <p className="mt-3 text-sm font-medium text-amber-700">
          コピー先の表示日にはすでに食事記録があります。
        </p>
      ) : null}

      <div className="mt-4 flex justify-end">
        <button
          type="button"
          onClick={handleCopy}
          disabled={isSubmitting || previewMeals.length === 0 || targetMealCount > 0}
          className="h-10 w-full rounded-md bg-slate-950 px-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400 sm:w-auto"
        >
          {isSubmitting ? "コピー中..." : "表示日へコピー"}
        </button>
      </div>
    </section>
  );
}
