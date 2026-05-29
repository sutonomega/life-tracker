"use client";

import { useEffect, useMemo, useState } from "react";
import { getMealTypeLabel, Meal } from "./MealForm";

type MealTemplatePanelProps = {
  selectedDate: string;
  meals: Meal[];
  onCreated: () => void;
};

type MealTemplate = {
  id: number;
  name: string;
  mealType: string;
  foodName: string;
  calories: number;
  proteinG: number;
  fatG: number;
  carbsG: number;
  memo: string | null;
};

export function MealTemplatePanel({
  selectedDate,
  meals,
  onCreated,
}: MealTemplatePanelProps) {
  const [templates, setTemplates] = useState<MealTemplate[]>([]);
  const [selectedMealId, setSelectedMealId] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [templateName, setTemplateName] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedMeal = useMemo(() => {
    return meals.find((meal) => String(meal.id) === selectedMealId);
  }, [meals, selectedMealId]);

  const selectedTemplate = useMemo(() => {
    return templates.find((template) => String(template.id) === selectedTemplateId);
  }, [selectedTemplateId, templates]);

  async function refreshTemplates() {
    const response = await fetch("/api/meal-templates");

    if (!response.ok) {
      throw new Error("テンプレートの取得に失敗しました。");
    }

    const data = (await response.json()) as MealTemplate[];
    setTemplates(data);
    setSelectedTemplateId((current) => current || String(data[0]?.id ?? ""));
  }

  useEffect(() => {
    async function fetchTemplates() {
      setIsLoading(true);
      setError("");

      try {
        await refreshTemplates();
      } catch (fetchError) {
        setError(
          fetchError instanceof Error
            ? fetchError.message
            : "テンプレートの取得に失敗しました。",
        );
      } finally {
        setIsLoading(false);
      }
    }

    fetchTemplates();
  }, []);

  async function handleSaveTemplate() {
    setMessage("");
    setError("");

    if (!selectedMeal) {
      setError("テンプレート化する食事記録を選択してください。");
      return;
    }

    const name = templateName.trim() || selectedMeal.foodName;
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/meal-templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          mealType: selectedMeal.mealType,
          foodName: selectedMeal.foodName,
          calories: selectedMeal.calories,
          proteinG: selectedMeal.proteinG,
          fatG: selectedMeal.fatG,
          carbsG: selectedMeal.carbsG,
          memo: selectedMeal.memo,
        }),
      });
      const data = (await response.json()) as MealTemplate & { message?: string };

      if (!response.ok) {
        throw new Error(data.message ?? "テンプレートの保存に失敗しました。");
      }

      setTemplateName("");
      setSelectedTemplateId(String(data.id));
      setMessage("テンプレートを保存しました。");
      await refreshTemplates();
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "テンプレートの保存に失敗しました。",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleCreateFromTemplate() {
    setMessage("");
    setError("");

    if (!selectedTemplate) {
      setError("登録するテンプレートを選択してください。");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/meals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: selectedDate,
          mealType: selectedTemplate.mealType,
          foodName: selectedTemplate.foodName,
          calories: selectedTemplate.calories,
          proteinG: selectedTemplate.proteinG,
          fatG: selectedTemplate.fatG,
          carbsG: selectedTemplate.carbsG,
          memo: selectedTemplate.memo,
        }),
      });
      const data = (await response.json()) as { message?: string };

      if (!response.ok) {
        throw new Error(data.message ?? "テンプレートからの食事登録に失敗しました。");
      }

      setMessage("テンプレートから食事を登録しました。");
      onCreated();
    } catch (createError) {
      setError(
        createError instanceof Error
          ? createError.message
          : "テンプレートからの食事登録に失敗しました。",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeleteTemplate() {
    setMessage("");
    setError("");

    if (!selectedTemplate) {
      setError("削除するテンプレートを選択してください。");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/meal-templates/${selectedTemplate.id}`, {
        method: "DELETE",
      });
      const data = (await response.json()) as { message?: string };

      if (!response.ok) {
        throw new Error(data.message ?? "テンプレートの削除に失敗しました。");
      }

      setSelectedTemplateId("");
      setMessage("テンプレートを削除しました。");
      await refreshTemplates();
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "テンプレートの削除に失敗しました。",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="min-w-0 rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div>
        <h3 className="text-lg font-semibold text-slate-950">テンプレート</h3>
        <p className="mt-1 text-sm text-slate-500">
          食事記録からテンプレートを作成し、表示日へ登録します。
        </p>
      </div>

      <div className="mt-5 grid min-w-0 gap-4">
        <div className="rounded-md bg-slate-50 p-3">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">
              テンプレート化する食事記録
            </span>
            <select
              value={selectedMealId}
              onChange={(event) => setSelectedMealId(event.target.value)}
              className="mt-1 h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            >
              <option value="">選択してください</option>
              {meals.map((meal) => (
                <option key={meal.id} value={meal.id}>
                  {getMealTypeLabel(meal.mealType)} / {meal.foodName}
                </option>
              ))}
            </select>
          </label>
          <label className="mt-3 block">
            <span className="text-sm font-medium text-slate-700">保存名</span>
            <input
              type="text"
              value={templateName}
              onChange={(event) => setTemplateName(event.target.value)}
              className="mt-1 h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              placeholder="未入力なら食品名で保存"
            />
          </label>
          <button
            type="button"
            onClick={handleSaveTemplate}
            disabled={isSubmitting || !selectedMeal}
            className="mt-3 h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            選択した食事をテンプレ保存
          </button>
        </div>

        <div className="rounded-md bg-slate-50 p-3">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">
              登録するテンプレート
            </span>
            <select
              value={selectedTemplateId}
              onChange={(event) => setSelectedTemplateId(event.target.value)}
              className="mt-1 h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              disabled={isLoading}
            >
              <option value="">選択してください</option>
              {templates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>
          </label>

          {selectedTemplate ? (
            <div className="mt-3 rounded-md bg-white p-3 text-sm text-slate-700">
              <p className="font-semibold text-slate-950">
                {getMealTypeLabel(selectedTemplate.mealType)} /{" "}
                {selectedTemplate.foodName}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {selectedTemplate.calories}kcal / P {selectedTemplate.proteinG}g /
                F {selectedTemplate.fatG}g / C {selectedTemplate.carbsG}g
              </p>
            </div>
          ) : null}

          <div className="mt-3 grid min-w-0 gap-2 sm:grid-cols-2">
            <button
              type="button"
              onClick={handleCreateFromTemplate}
              disabled={isSubmitting || !selectedTemplate}
              className="h-10 rounded-md bg-slate-950 px-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              表示日に登録
            </button>
            <button
              type="button"
              onClick={handleDeleteTemplate}
              disabled={isSubmitting || !selectedTemplate}
              className="h-10 rounded-md border border-rose-200 bg-white px-3 text-sm font-semibold text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              削除
            </button>
          </div>
        </div>
      </div>

      {error ? <p className="mt-4 text-sm font-medium text-rose-700">{error}</p> : null}
      {message ? (
        <p className="mt-4 text-sm font-medium text-emerald-700">{message}</p>
      ) : null}
    </section>
  );
}
