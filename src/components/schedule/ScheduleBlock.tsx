"use client";

import { CSSProperties, FormEvent, useMemo, useState } from "react";

export type Schedule = {
  id: number;
  date: string;
  title: string;
  startTime: string;
  endTime: string;
  memo: string | null;
  categoryId: number;
  category: {
    name: string;
    color: string;
  };
};

export type ScheduleCategory = {
  id: number;
  name: string;
  color: string;
};

type ScheduleBlockProps = {
  schedule: Schedule;
  categories: ScheduleCategory[];
  onChanged: () => void;
  style?: CSSProperties;
};

function formatEndTime(endTime: string) {
  return endTime === "23:59" ? "0:00" : endTime;
}

export function ScheduleBlock({
  schedule,
  categories,
  onChanged,
  style,
}: ScheduleBlockProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    title: schedule.title,
    startTime: schedule.startTime,
    endTime: schedule.endTime,
    categoryId: String(schedule.categoryId),
    memo: schedule.memo ?? "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isTimeRangeInvalid = useMemo(() => {
    return Boolean(
      form.startTime && form.endTime && form.startTime >= form.endTime,
    );
  }, [form.endTime, form.startTime]);

  function updateField(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");

    if (!form.title || !form.startTime || !form.endTime || !form.categoryId) {
      setError("必須項目を入力してください。");
      return;
    }

    if (isTimeRangeInvalid) {
      setError("終了時刻は開始時刻より後にしてください。");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/schedules/${schedule.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: schedule.date,
          ...form,
          categoryId: Number(form.categoryId),
        }),
      });

      if (!response.ok) {
        const data = (await response.json()) as { message?: string };
        throw new Error(data.message ?? "スケジュール更新に失敗しました。");
      }

      setMessage("更新しました。");
      setIsEditing(false);
      onChanged();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "スケジュール更新に失敗しました。",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete() {
    setMessage("");
    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/schedules/${schedule.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = (await response.json()) as { message?: string };
        throw new Error(data.message ?? "スケジュール削除に失敗しました。");
      }

      onChanged();
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "スケジュール削除に失敗しました。",
      );
      setIsSubmitting(false);
    }
  }

  return (
    <article
      style={style}
      className="grid gap-3 sm:grid-cols-[88px_1fr]"
    >
      <div className="text-sm font-semibold text-slate-700">
        {schedule.startTime}
        <span className="block text-xs font-medium text-slate-400">
          {formatEndTime(schedule.endTime)}
        </span>
      </div>

      <div className="relative h-full overflow-y-auto rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <span
          className="absolute left-0 top-4 h-10 w-1 rounded-r"
          style={{ backgroundColor: schedule.category.color }}
          aria-hidden="true"
        />

        {!isEditing ? (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h4 className="text-base font-semibold text-slate-950">
                {schedule.title}
              </h4>
              {schedule.memo ? (
                <p className="mt-2 text-sm text-slate-500">{schedule.memo}</p>
              ) : null}
              {message ? (
                <p className="mt-2 text-sm font-medium text-emerald-700">
                  {message}
                </p>
              ) : null}
              {error ? (
                <p className="mt-2 text-sm font-medium text-rose-700">{error}</p>
              ) : null}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span
                className="inline-flex w-fit items-center rounded-full px-2.5 py-1 text-xs font-semibold"
                style={{
                  backgroundColor: `${schedule.category.color}20`,
                  color: schedule.category.color,
                }}
              >
                {schedule.category.name}
              </span>
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="h-8 w-full rounded-md border border-slate-200 px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 sm:w-auto"
              >
                編集
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isSubmitting}
                className="h-8 w-full rounded-md border border-rose-200 px-3 text-xs font-semibold text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                削除
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-3">
            <div className="grid gap-3 md:grid-cols-2">
              <label className="block md:col-span-2">
                <span className="text-xs font-semibold text-slate-500">タイトル</span>
                <input
                  type="text"
                  value={form.title}
                  onChange={(event) => updateField("title", event.target.value)}
                  className="mt-1 h-10 w-full rounded-md border border-slate-300 px-3 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                  required
                />
              </label>
              <label className="block">
                <span className="text-xs font-semibold text-slate-500">開始</span>
                <input
                  type="time"
                  value={form.startTime}
                  onChange={(event) => updateField("startTime", event.target.value)}
                  className="mt-1 h-10 w-full rounded-md border border-slate-300 px-3 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                  required
                />
              </label>
              <label className="block">
                <span className="text-xs font-semibold text-slate-500">終了</span>
                <input
                  type="time"
                  value={form.endTime}
                  onChange={(event) => updateField("endTime", event.target.value)}
                  className="mt-1 h-10 w-full rounded-md border border-slate-300 px-3 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                  required
                />
              </label>
              <label className="block md:col-span-2">
                <span className="text-xs font-semibold text-slate-500">カテゴリ</span>
                <select
                  value={form.categoryId}
                  onChange={(event) => updateField("categoryId", event.target.value)}
                  className="mt-1 h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
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
                <span className="text-xs font-semibold text-slate-500">メモ</span>
                <textarea
                  value={form.memo}
                  onChange={(event) => updateField("memo", event.target.value)}
                  className="mt-1 min-h-20 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                />
              </label>
            </div>

            {isTimeRangeInvalid ? (
              <p className="text-sm font-medium text-rose-700">
                終了時刻は開始時刻より後にしてください。
              </p>
            ) : null}
            {error ? <p className="text-sm font-medium text-rose-700">{error}</p> : null}

            <div className="flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="h-9 w-full rounded-md border border-slate-200 px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 sm:w-auto"
              >
                キャンセル
              </button>
              <button
                type="submit"
                disabled={isSubmitting || isTimeRangeInvalid}
                className="h-9 w-full rounded-md bg-slate-950 px-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400 sm:w-auto"
              >
                {isSubmitting ? "保存中..." : "保存する"}
              </button>
            </div>
          </form>
        )}
      </div>
    </article>
  );
}
