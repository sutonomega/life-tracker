"use client";

import { FormEvent, useEffect, useState } from "react";
import { NutritionGoal } from "./NutritionSummary";

type FormState = {
  calories: string;
  proteinG: string;
  fatG: string;
  carbsG: string;
};

function goalToForm(goal: NutritionGoal): FormState {
  return {
    calories: String(goal.calories),
    proteinG: String(goal.proteinG),
    fatG: String(goal.fatG),
    carbsG: String(goal.carbsG),
  };
}

export function NutritionGoalForm() {
  const [form, setForm] = useState<FormState>({
    calories: "",
    proteinG: "",
    fatG: "",
    carbsG: "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function fetchGoal() {
      setIsLoading(true);
      setError("");

      try {
        const response = await fetch("/api/nutrition-goals");

        if (!response.ok) {
          throw new Error("栄養目標の取得に失敗しました。");
        }

        const goal = (await response.json()) as NutritionGoal;
        setForm(goalToForm(goal));
      } catch (fetchError) {
        setError(
          fetchError instanceof Error
            ? fetchError.message
            : "栄養目標の取得に失敗しました。",
        );
      } finally {
        setIsLoading(false);
      }
    }

    fetchGoal();
  }, []);

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

    if (
      !Number.isInteger(calories) ||
      calories <= 0 ||
      !Number.isFinite(proteinG) ||
      proteinG < 0 ||
      !Number.isFinite(fatG) ||
      fatG < 0 ||
      !Number.isFinite(carbsG) ||
      carbsG < 0
    ) {
      setError("カロリーは1以上、PFCは0以上の数値で入力してください。");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/nutrition-goals", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ calories, proteinG, fatG, carbsG }),
      });

      if (!response.ok) {
        const data = (await response.json()) as { message?: string };
        throw new Error(data.message ?? "栄養目標の保存に失敗しました。");
      }

      setMessage("栄養目標を保存しました。");
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "栄養目標の保存に失敗しました。",
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
        <h3 className="text-lg font-semibold text-slate-950">栄養目標</h3>
        <p className="mt-1 text-sm text-slate-500">日別評価に使う目標値</p>
      </div>

      {isLoading ? <p className="mt-5 text-sm text-slate-500">読み込み中...</p> : null}

      {!isLoading ? (
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {[
            ["calories", "kcal", "1", "1"],
            ["proteinG", "P g", "any", "0"],
            ["fatG", "F g", "any", "0"],
            ["carbsG", "C g", "any", "0"],
          ].map(([field, label, step, min]) => (
            <label key={field} className="block">
              <span className="text-sm font-medium text-slate-700">{label}</span>
              <input
                type="number"
                min={min}
                step={step}
                value={form[field as keyof FormState]}
                onChange={(event) =>
                  updateField(field as keyof FormState, event.target.value)
                }
                className="mt-1 h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                required
              />
            </label>
          ))}
        </div>
      ) : null}

      {error ? <p className="mt-4 text-sm font-medium text-rose-700">{error}</p> : null}
      {message ? (
        <p className="mt-4 text-sm font-medium text-emerald-700">{message}</p>
      ) : null}

      <div className="mt-6 flex justify-end">
        <button
          type="submit"
          disabled={isLoading || isSubmitting}
          className="inline-flex h-11 items-center justify-center rounded-md bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {isSubmitting ? "保存中..." : "保存する"}
        </button>
      </div>
    </form>
  );
}
