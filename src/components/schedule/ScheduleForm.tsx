"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { isValidScheduleTimeRange } from "../../lib/scheduleTime";
import { getLocalDateString } from "../../lib/utils";

type ScheduleCategory = {
  id: number;
  name: string;
  color: string;
};

type FormState = {
  date: string;
  title: string;
  startTime: string;
  endTime: string;
  categoryId: string;
  memo: string;
};

const initialFormState: FormState = {
  date: getLocalDateString(),
  title: "",
  startTime: "",
  endTime: "",
  categoryId: "",
  memo: "",
};

type ScheduleFormProps = {
  selectedDate: string;
  onCreated?: (date: string) => void;
};

export function ScheduleForm({ selectedDate, onCreated }: ScheduleFormProps) {
  const [form, setForm] = useState<FormState>({
    ...initialFormState,
    date: selectedDate,
  });
  const [categories, setCategories] = useState<ScheduleCategory[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await fetch("/api/schedule-categories");

        if (!response.ok) {
          throw new Error("カテゴリの取得に失敗しました。");
        }

        const data = (await response.json()) as ScheduleCategory[];
        setCategories(data);

        if (data[0]) {
          setForm((current) => ({ ...current, categoryId: String(data[0].id) }));
        }
      } catch (fetchError) {
        setError(
          fetchError instanceof Error
            ? fetchError.message
            : "カテゴリの取得に失敗しました。",
        );
      }
    }

    fetchCategories();
  }, []);

  const isTimeRangeInvalid = useMemo(() => {
    if (!form.startTime || !form.endTime) {
      return false;
    }

    return !isValidScheduleTimeRange(form.startTime, form.endTime);
  }, [form.endTime, form.startTime]);

  function updateField(field: keyof FormState, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");

    if (!form.date || !form.title || !form.startTime || !form.endTime) {
      setError("日付、タイトル、開始時刻、終了時刻を入力してください。");
      return;
    }

    if (!form.categoryId) {
      setError("カテゴリを選択してください。");
      return;
    }

    if (isTimeRangeInvalid) {
      setError("終了時刻は開始時刻より後にしてください。");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          categoryId: Number(form.categoryId),
        }),
      });

      if (!response.ok) {
        const data = (await response.json()) as { message?: string };
        throw new Error(data.message ?? "スケジュール登録に失敗しました。");
      }

      setMessage("スケジュールを登録しました。");
      setForm((current) => ({
        ...initialFormState,
        date: current.date,
        categoryId: current.categoryId,
      }));
      onCreated?.(form.date);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "スケジュール登録に失敗しました。",
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
      <div className="flex flex-col gap-1">
        <h3 className="text-lg font-semibold text-slate-950">
          登録
        </h3>
        <p className="text-sm text-slate-500">
          日付と時間を指定して予定を登録します。
        </p>
      </div>

      <div className="mt-5 grid min-w-0 gap-4 md:grid-cols-2">
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
          <span className="text-sm font-medium text-slate-700">カテゴリ</span>
          <select
            value={form.categoryId}
            onChange={(event) => updateField("categoryId", event.target.value)}
            className="mt-1 h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            required
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>

        <label className="block md:col-span-2">
          <span className="text-sm font-medium text-slate-700">タイトル</span>
          <input
            type="text"
            value={form.title}
            onChange={(event) => updateField("title", event.target.value)}
            className="mt-1 h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            placeholder="例: 朝の散歩"
            required
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">開始時刻</span>
          <input
            type="time"
            value={form.startTime}
            onChange={(event) => updateField("startTime", event.target.value)}
            className="mt-1 h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            required
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">終了時刻</span>
          <input
            type="time"
            value={form.endTime}
            onChange={(event) => updateField("endTime", event.target.value)}
            className="mt-1 h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            required
          />
        </label>

        <label className="block md:col-span-2">
          <span className="text-sm font-medium text-slate-700">メモ</span>
          <textarea
            value={form.memo}
            onChange={(event) => updateField("memo", event.target.value)}
            className="mt-1 min-h-24 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            placeholder="必要な持ち物や補足を入力"
          />
        </label>
      </div>

      {isTimeRangeInvalid ? (
        <p className="mt-4 text-sm font-medium text-rose-700">
          終了時刻は開始時刻より後にしてください。0:00 終了は24:00として扱います。
        </p>
      ) : null}

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
