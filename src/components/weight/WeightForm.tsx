"use client";

import { FormEvent, useState } from "react";
import { getLocalDateString } from "../../lib/utils";

type WeightFormProps = {
  onCreated?: () => void;
};

type FormState = {
  date: string;
  weightKg: string;
  memo: string;
};

const initialFormState: FormState = {
  date: getLocalDateString(),
  weightKg: "",
  memo: "",
};

export function WeightForm({ onCreated }: WeightFormProps) {
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

    const weightKg = Number(form.weightKg);

    if (!form.date || !Number.isFinite(weightKg)) {
      setError("日付と体重を入力してください。");
      return;
    }

    if (weightKg <= 0 || weightKg > 300) {
      setError("体重は 0 より大きく 300 以下で入力してください。");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/weight-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: form.date,
          weightKg,
          memo: form.memo,
        }),
      });

      if (!response.ok) {
        const data = (await response.json()) as { message?: string };
        throw new Error(data.message ?? "体重登録に失敗しました。");
      }

      setMessage("体重を登録しました。");
      setForm((current) => ({
        ...initialFormState,
        date: current.date,
      }));
      onCreated?.();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "体重登録に失敗しました。",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="min-w-0 rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
    >
      <div>
        <h3 className="text-lg font-semibold text-slate-950">体重入力</h3>
        <p className="mt-1 text-sm text-slate-500">
          日付ごとの体重を記録します。
        </p>
      </div>

      <div className="mt-5 grid gap-4">
        <label className="block">
          <span className="text-sm font-medium text-slate-700">日付</span>
          <input
            type="date"
            value={form.date}
            onChange={(event) => updateField("date", event.target.value)}
            className="date-input mt-1 h-11 w-full rounded-md border border-slate-300 px-3 text-sm leading-[2.75rem] outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            required
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">体重 kg</span>
          <input
            type="number"
            inputMode="decimal"
            min="0.1"
            max="300"
            step="any"
            value={form.weightKg}
            onChange={(event) => updateField("weightKg", event.target.value)}
            className="mt-1 h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            placeholder="例: 62.4"
            required
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">メモ</span>
          <textarea
            value={form.memo}
            onChange={(event) => updateField("memo", event.target.value)}
            className="mt-1 min-h-24 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            placeholder="体調や測定条件を入力"
          />
        </label>
      </div>

      {error ? (
        <p className="mt-4 text-sm font-medium text-rose-700">{error}</p>
      ) : null}

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
