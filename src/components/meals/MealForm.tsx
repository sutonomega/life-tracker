"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

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

const initialFormState: FormState = {
  mealType: "breakfast",
  foodName: "",
  calories: "",
  proteinG: "",
  fatG: "",
  carbsG: "",
  memo: "",
};

const mealTypeOptions = [
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
  const [templates, setTemplates] = useState<MealTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [templateName, setTemplateName] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [templateMessage, setTemplateMessage] = useState("");
  const [templateError, setTemplateError] = useState("");
  const [isTemplateLoading, setIsTemplateLoading] = useState(true);
  const [isTemplateSubmitting, setIsTemplateSubmitting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedTemplate = useMemo(() => {
    return templates.find((template) => String(template.id) === selectedTemplateId);
  }, [selectedTemplateId, templates]);

  async function refreshTemplates() {
    const response = await fetch("/api/meal-templates");

    if (!response.ok) {
      throw new Error("食事テンプレートの取得に失敗しました。");
    }

    const data = (await response.json()) as MealTemplate[];
    setTemplates(data);
    setSelectedTemplateId((current) => current || String(data[0]?.id ?? ""));
  }

  useEffect(() => {
    async function fetchTemplates() {
      setIsTemplateLoading(true);
      setTemplateError("");

      try {
        await refreshTemplates();
      } catch (fetchError) {
        setTemplateError(
          fetchError instanceof Error
            ? fetchError.message
            : "食事テンプレートの取得に失敗しました。",
        );
      } finally {
        setIsTemplateLoading(false);
      }
    }

    fetchTemplates();
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

  function applyTemplate() {
    setTemplateMessage("");
    setTemplateError("");

    if (!selectedTemplate) {
      setTemplateError("読み出すテンプレートを選択してください。");
      return;
    }

    setForm({
      mealType: selectedTemplate.mealType,
      foodName: selectedTemplate.foodName,
      calories: String(selectedTemplate.calories),
      proteinG: String(selectedTemplate.proteinG),
      fatG: String(selectedTemplate.fatG),
      carbsG: String(selectedTemplate.carbsG),
      memo: selectedTemplate.memo ?? "",
    });
    setTemplateMessage("テンプレートを読み出しました。");
  }

  async function saveTemplate() {
    setTemplateMessage("");
    setTemplateError("");

    const calories = Number(form.calories);
    const proteinG = Number(form.proteinG);
    const fatG = Number(form.fatG);
    const carbsG = Number(form.carbsG);
    const name = templateName.trim() || form.foodName.trim();

    if (!name || !form.foodName || !form.calories) {
      setTemplateError("テンプレート名、食品名、カロリーを入力してください。");
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
      setTemplateError("カロリーとPFCは0以上の数値で入力してください。");
      return;
    }

    setIsTemplateSubmitting(true);

    try {
      const response = await fetch("/api/meal-templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          mealType: form.mealType,
          foodName: form.foodName,
          calories,
          proteinG,
          fatG,
          carbsG,
          memo: form.memo,
        }),
      });

      const data = (await response.json()) as MealTemplate & { message?: string };

      if (!response.ok) {
        throw new Error(data.message ?? "食事テンプレートの保存に失敗しました。");
      }

      setTemplateName("");
      setSelectedTemplateId(String(data.id));
      setTemplateMessage("食事テンプレートを保存しました。");
      await refreshTemplates();
    } catch (saveError) {
      setTemplateError(
        saveError instanceof Error
          ? saveError.message
          : "食事テンプレートの保存に失敗しました。",
      );
    } finally {
      setIsTemplateSubmitting(false);
    }
  }

  async function deleteTemplate() {
    setTemplateMessage("");
    setTemplateError("");

    if (!selectedTemplate) {
      setTemplateError("削除するテンプレートを選択してください。");
      return;
    }

    setIsTemplateSubmitting(true);

    try {
      const response = await fetch(`/api/meal-templates/${selectedTemplate.id}`, {
        method: "DELETE",
      });
      const data = (await response.json()) as { message?: string };

      if (!response.ok) {
        throw new Error(data.message ?? "食事テンプレートの削除に失敗しました。");
      }

      setSelectedTemplateId("");
      setTemplateMessage("食事テンプレートを削除しました。");
      await refreshTemplates();
    } catch (deleteError) {
      setTemplateError(
        deleteError instanceof Error
          ? deleteError.message
          : "食事テンプレートの削除に失敗しました。",
      );
    } finally {
      setIsTemplateSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
    >
      <div>
        <h3 className="text-lg font-semibold text-slate-950">食事入力</h3>
        <p className="mt-1 text-sm text-slate-500">
          カロリーとPFCを食事ごとに記録します。
        </p>
      </div>

      <div className="mt-5 grid gap-4">
        <section className="rounded-md bg-slate-50 p-3">
          <div className="grid gap-3">
            <label className="block">
              <span className="text-sm font-medium text-slate-700">
                食事テンプレート
              </span>
              <select
                value={selectedTemplateId}
                onChange={(event) => setSelectedTemplateId(event.target.value)}
                className="mt-1 h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                disabled={isTemplateLoading}
              >
                <option value="">選択してください</option>
                {templates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </select>
            </label>
            <div className="grid gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={applyTemplate}
                disabled={isTemplateSubmitting || !selectedTemplate}
                className="h-9 rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                読み出し
              </button>
              <button
                type="button"
                onClick={deleteTemplate}
                disabled={isTemplateSubmitting || !selectedTemplate}
                className="h-9 rounded-md border border-rose-200 bg-white px-3 text-sm font-semibold text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                削除
              </button>
            </div>
            <label className="block">
              <span className="text-sm font-medium text-slate-700">
                保存名
              </span>
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
              onClick={saveTemplate}
              disabled={isTemplateSubmitting}
              className="h-9 rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              現在の入力内容をテンプレ保存
            </button>
          </div>

          {templateError ? (
            <p className="mt-3 text-sm font-medium text-rose-700">
              {templateError}
            </p>
          ) : null}
          {templateMessage ? (
            <p className="mt-3 text-sm font-medium text-emerald-700">
              {templateMessage}
            </p>
          ) : null}
        </section>

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
