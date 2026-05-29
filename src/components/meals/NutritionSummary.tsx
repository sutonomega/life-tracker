"use client";

import { Meal } from "./MealForm";

export type NutritionGoal = {
  id: number;
  calories: number;
  proteinG: number;
  fatG: number;
  carbsG: number;
};

type NutritionSummaryProps = {
  meals: Meal[];
  goal: NutritionGoal | null;
};

function getTotals(meals: Meal[]) {
  return meals.reduce(
    (total, meal) => ({
      calories: total.calories + meal.calories,
      proteinG: total.proteinG + meal.proteinG,
      fatG: total.fatG + meal.fatG,
      carbsG: total.carbsG + meal.carbsG,
    }),
    { calories: 0, proteinG: 0, fatG: 0, carbsG: 0 },
  );
}

function getRate(value: number, goal: number) {
  if (goal === 0) {
    return value === 0 ? 0 : 140;
  }

  return Math.min((value / goal) * 100, 140);
}

function getAssessment(value: number, goal: number) {
  if (goal === 0) {
    return value === 0 ? "適正" : "多め";
  }

  const rate = (value / goal) * 100;

  if (rate < 80) {
    return "不足";
  }

  if (rate > 120) {
    return "多め";
  }

  return "適正";
}

export function NutritionSummary({ meals, goal }: NutritionSummaryProps) {
  const totals = getTotals(meals);
  const rows = [
    {
      label: "カロリー",
      value: totals.calories,
      goal: goal?.calories ?? 2000,
      unit: "kcal",
    },
    { label: "P", value: totals.proteinG, goal: goal?.proteinG ?? 100, unit: "g" },
    { label: "F", value: totals.fatG, goal: goal?.fatG ?? 60, unit: "g" },
    { label: "C", value: totals.carbsG, goal: goal?.carbsG ?? 250, unit: "g" },
  ];

  return (
    <section className="min-w-0 rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex flex-col gap-2 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-950">栄養サマリー</h3>
          <p className="mt-1 text-sm text-slate-500">選択日の合計と目標比較</p>
        </div>
        <span className="text-sm font-semibold text-slate-500">{meals.length}件</span>
      </div>

      <div className="mt-5 grid min-w-0 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {rows.map((row) => (
          <article key={row.label} className="rounded-lg border border-slate-100 p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-slate-500">{row.label}</p>
              <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
                {getAssessment(row.value, row.goal)}
              </span>
            </div>
            <p className="mt-3 text-2xl font-semibold text-slate-950">
              {row.value.toFixed(row.unit === "kcal" ? 0 : 1)}
              <span className="ml-1 text-sm text-slate-500">{row.unit}</span>
            </p>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-emerald-500"
                style={{ width: `${getRate(row.value, row.goal)}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-slate-500">
              目標 {row.goal}
              {row.unit}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
