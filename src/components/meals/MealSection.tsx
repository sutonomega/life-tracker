"use client";

import { useEffect, useState } from "react";
import { getLocalDateString } from "../../lib/utils";
import { Meal, MealForm } from "./MealForm";
import { MealCopyPanel } from "./MealCopyPanel";
import { MealItem } from "./MealItem";
import { MealTemplatePanel } from "./MealTemplatePanel";
import { NutritionGoal, NutritionSummary } from "./NutritionSummary";

export function MealSection() {
  const [selectedDate, setSelectedDate] = useState(getLocalDateString);
  const [activeTab, setActiveTab] = useState<
    "overview" | "form" | "copy" | "template"
  >("overview");
  const [refreshKey, setRefreshKey] = useState(0);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [goal, setGoal] = useState<NutritionGoal | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      setError("");

      try {
        const params = new URLSearchParams({ date: selectedDate });
        const [mealsResponse, goalResponse] = await Promise.all([
          fetch(`/api/meals?${params.toString()}`),
          fetch("/api/nutrition-goals"),
        ]);

        if (!mealsResponse.ok || !goalResponse.ok) {
          throw new Error("食事データの取得に失敗しました。");
        }

        setMeals((await mealsResponse.json()) as Meal[]);
        setGoal((await goalResponse.json()) as NutritionGoal);
      } catch (fetchError) {
        setError(
          fetchError instanceof Error
            ? fetchError.message
            : "食事データの取得に失敗しました。",
        );
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [refreshKey, selectedDate]);

  function refreshMeals() {
    setRefreshKey((current) => current + 1);
  }

  return (
    <div className="min-w-0 space-y-4">
      <div className="min-w-0 space-y-4">
        <label className="block rounded-lg border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
          <span className="sr-only">表示日</span>
          <input
            type="date"
            value={selectedDate}
            onChange={(event) => setSelectedDate(event.target.value)}
            className="date-input h-10 w-full max-w-full rounded-md border border-slate-300 px-3 text-sm leading-10 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          />
        </label>
        <div className="rounded-lg border border-slate-200 bg-white p-1 shadow-sm">
          <div className="grid grid-cols-4 gap-1">
            {[
              ["overview", "サマリー"],
              ["form", "登録"],
              ["copy", "コピー"],
              ["template", "テンプレート"],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setActiveTab(value as typeof activeTab)}
                className={`h-9 rounded-md px-1 text-xs font-semibold transition sm:h-10 sm:px-2 sm:text-sm ${
                  activeTab === value
                    ? "bg-slate-950 text-white"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {activeTab === "form" ? (
          <MealForm selectedDate={selectedDate} onCreated={refreshMeals} />
        ) : null}
        {activeTab === "copy" ? (
          <MealCopyPanel selectedDate={selectedDate} onCopied={refreshMeals} />
        ) : null}
        {activeTab === "template" ? (
          <MealTemplatePanel
            selectedDate={selectedDate}
            meals={meals}
            onCreated={refreshMeals}
          />
        ) : null}
      </div>

      {activeTab === "overview" ? (
        <div className="min-w-0 space-y-4">
          <NutritionSummary meals={meals} goal={goal} />
          <section className="min-w-0 rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="flex flex-col gap-2 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-950">食事記録</h3>
                <p className="mt-1 text-sm text-slate-500">選択日の登録内容</p>
              </div>
              <span className="text-sm font-semibold text-slate-500">
                {meals.length}件
              </span>
            </div>

            {isLoading ? (
              <p className="py-8 text-sm text-slate-500">読み込み中...</p>
            ) : null}
            {error ? <p className="py-8 text-sm font-medium text-rose-700">{error}</p> : null}

            {!isLoading && !error && meals.length === 0 ? (
              <div className="py-8">
                <p className="text-sm font-medium text-slate-700">
                  食事記録はまだありません。
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  左のフォームから食事を登録できます。
                </p>
              </div>
            ) : null}

            {!isLoading && !error && meals.length > 0 ? (
              <div>
                {meals.map((meal) => (
                  <MealItem key={meal.id} meal={meal} onChanged={refreshMeals} />
                ))}
              </div>
            ) : null}
          </section>
        </div>
      ) : null}
    </div>
  );
}
