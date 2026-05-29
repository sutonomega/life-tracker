"use client";

import { FormEvent, useState } from "react";

export type WeightLog = {
  id: number;
  date: string;
  weightKg: number;
  memo: string | null;
};

type WeightStatsProps = {
  logs: WeightLog[];
  isLoading: boolean;
  error: string;
  onChanged: () => void;
};

type WeightLogItemProps = {
  log: WeightLog;
  onChanged: () => void;
};

function formatDate(date: string) {
  return new Intl.DateTimeFormat("ja-JP", {
    month: "numeric",
    day: "numeric",
    weekday: "short",
  }).format(new Date(`${date}T00:00:00`));
}

function WeightLogItem({ log, onChanged }: WeightLogItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    date: log.date,
    weightKg: String(log.weightKg),
    memo: log.memo ?? "",
  });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");

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
      const response = await fetch(`/api/weight-logs/${log.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: form.date,
          weightKg,
          memo: form.memo,
        }),
      });

      if (!response.ok) {
        const data = (await response.json()) as { message?: string };
        throw new Error(data.message ?? "体重記録の更新に失敗しました。");
      }

      setMessage("更新しました。");
      setIsEditing(false);
      onChanged();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "体重記録の更新に失敗しました。",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete() {
    setError("");
    setMessage("");
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/weight-logs/${log.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = (await response.json()) as { message?: string };
        throw new Error(data.message ?? "体重記録の削除に失敗しました。");
      }

      onChanged();
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "体重記録の削除に失敗しました。",
      );
      setIsSubmitting(false);
    }
  }

  if (isEditing) {
    return (
      <form onSubmit={handleSave} className="grid gap-3 py-4">
        <div className="grid gap-3 sm:grid-cols-[150px_140px_1fr]">
          <label className="block">
            <span className="text-xs font-semibold text-slate-500">日付</span>
            <input
              type="date"
              value={form.date}
              onChange={(event) => updateField("date", event.target.value)}
              className="mt-1 h-10 w-full rounded-md border border-slate-300 px-3 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              required
            />
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-slate-500">体重 kg</span>
            <input
              type="number"
              min="0.1"
              max="300"
              step="0.1"
              value={form.weightKg}
              onChange={(event) => updateField("weightKg", event.target.value)}
              className="mt-1 h-10 w-full rounded-md border border-slate-300 px-3 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              required
            />
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-slate-500">メモ</span>
            <input
              type="text"
              value={form.memo}
              onChange={(event) => updateField("memo", event.target.value)}
              className="mt-1 h-10 w-full rounded-md border border-slate-300 px-3 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            />
          </label>
        </div>

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
            disabled={isSubmitting}
            className="h-9 w-full rounded-md bg-slate-950 px-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400 sm:w-auto"
          >
            {isSubmitting ? "保存中..." : "保存する"}
          </button>
        </div>
      </form>
    );
  }

  return (
    <article className="grid gap-2 py-4 sm:grid-cols-[120px_120px_1fr_auto] sm:items-center">
      <p className="text-sm font-medium text-slate-500">{formatDate(log.date)}</p>
      <p className="text-base font-semibold text-slate-950">
        {log.weightKg.toFixed(1)} kg
      </p>
      <div>
        <p className="text-sm text-slate-500">{log.memo || "メモなし"}</p>
        {message ? (
          <p className="mt-1 text-sm font-medium text-emerald-700">{message}</p>
        ) : null}
        {error ? (
          <p className="mt-1 text-sm font-medium text-rose-700">{error}</p>
        ) : null}
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setIsEditing(true)}
          className="h-8 flex-1 rounded-md border border-slate-200 px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 sm:flex-none"
        >
          編集
        </button>
        <button
          type="button"
          onClick={handleDelete}
          disabled={isSubmitting}
          className="h-8 flex-1 rounded-md border border-rose-200 px-3 text-xs font-semibold text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60 sm:flex-none"
        >
          削除
        </button>
      </div>
    </article>
  );
}

export function WeightStats({
  logs,
  isLoading,
  error,
  onChanged,
}: WeightStatsProps) {
  const latestLog = logs[0];
  const previousLog = logs[1];
  const diff = (() => {
    if (!latestLog || !previousLog) {
      return null;
    }

    return latestLog.weightKg - previousLog.weightKg;
  })();

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-2 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-950">体重記録</h3>
          <p className="mt-1 text-sm text-slate-500">新しい日付順で表示</p>
        </div>
        <span className="text-sm font-semibold text-slate-500">
          {logs.length}件
        </span>
      </div>

      {isLoading ? (
        <p className="py-8 text-sm text-slate-500">読み込み中...</p>
      ) : null}

      {error ? (
        <p className="py-8 text-sm font-medium text-rose-700">{error}</p>
      ) : null}

      {!isLoading && !error && logs.length === 0 ? (
        <div className="py-8">
          <p className="text-sm font-medium text-slate-700">
            体重記録はまだありません。
          </p>
          <p className="mt-2 text-sm text-slate-500">
            左のフォームから今日の体重を登録できます。
          </p>
        </div>
      ) : null}

      {!isLoading && !error && logs.length > 0 ? (
        <div>
          <div className="grid gap-4 border-b border-slate-100 py-5 sm:grid-cols-3">
            <div>
              <p className="text-sm text-slate-500">最新体重</p>
              <p className="mt-2 text-2xl font-semibold text-slate-950">
                {latestLog.weightKg.toFixed(1)} kg
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-500">前回差分</p>
              <p className="mt-2 text-2xl font-semibold text-slate-950">
                {diff === null
                  ? "--"
                  : `${diff > 0 ? "+" : ""}${diff.toFixed(1)} kg`}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-500">最新日付</p>
              <p className="mt-2 text-2xl font-semibold text-slate-950">
                {formatDate(latestLog.date)}
              </p>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {logs.map((log) => (
              <WeightLogItem key={log.id} log={log} onChanged={onChanged} />
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
