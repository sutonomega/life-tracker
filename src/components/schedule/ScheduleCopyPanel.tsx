"use client";

import { useEffect, useState } from "react";
import { Schedule } from "./ScheduleBlock";

type ScheduleCopyPanelProps = {
  selectedDate: string;
  onCopied: (date: string) => void;
};

export function ScheduleCopyPanel({
  selectedDate,
  onCopied,
}: ScheduleCopyPanelProps) {
  const [sourceDate, setSourceDate] = useState(selectedDate);
  const [previewSchedules, setPreviewSchedules] = useState<Schedule[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [targetScheduleCount, setTargetScheduleCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingTarget, setIsCheckingTarget] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function fetchPreview() {
      setMessage("");
      setError("");
      setPreviewSchedules([]);

      if (!sourceDate) {
        return;
      }

      setIsLoading(true);

      try {
        const params = new URLSearchParams({ date: sourceDate });
        const response = await fetch(`/api/schedules?${params.toString()}`);

        if (!response.ok) {
          throw new Error("コピー元のスケジュール取得に失敗しました。");
        }

        setPreviewSchedules((await response.json()) as Schedule[]);
      } catch (fetchError) {
        setError(
          fetchError instanceof Error
            ? fetchError.message
            : "コピー元のスケジュール取得に失敗しました。",
        );
      } finally {
        setIsLoading(false);
      }
    }

    fetchPreview();
  }, [sourceDate]);

  useEffect(() => {
    async function fetchTargetSchedules() {
      setTargetScheduleCount(0);

      if (!selectedDate) {
        return;
      }

      setIsCheckingTarget(true);

      try {
        const params = new URLSearchParams({ date: selectedDate });
        const response = await fetch(`/api/schedules?${params.toString()}`);

        if (!response.ok) {
          throw new Error("コピー先の確認に失敗しました。");
        }

        const schedules = (await response.json()) as Schedule[];
        setTargetScheduleCount(schedules.length);
      } catch (fetchError) {
        setError(
          fetchError instanceof Error
            ? fetchError.message
            : "コピー先の確認に失敗しました。",
        );
      } finally {
        setIsCheckingTarget(false);
      }
    }

    fetchTargetSchedules();
  }, [selectedDate]);

  async function handleCopy() {
    setMessage("");
    setError("");

    if (!sourceDate || sourceDate === selectedDate) {
      setError("コピー元には表示日とは別の日付を指定してください。");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/schedules/copy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sourceDate, targetDate: selectedDate }),
      });

      const data = (await response.json()) as { count?: number; message?: string };

      if (!response.ok) {
        throw new Error(data.message ?? "スケジュールコピーに失敗しました。");
      }

      setMessage(`${data.count ?? 0}件の予定をコピーしました。`);
      setTargetScheduleCount(data.count ?? 0);
      onCopied(selectedDate);
    } catch (copyError) {
      setError(
        copyError instanceof Error
          ? copyError.message
          : "スケジュールコピーに失敗しました。",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="min-w-0 rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div>
        <h3 className="text-lg font-semibold text-slate-950">コピー</h3>
        <p className="mt-1 text-sm text-slate-500">
          過去日のスケジュールを表示日へまとめてコピーします。
        </p>
      </div>

      <label className="mt-4 block">
        <span className="text-sm font-medium text-slate-700">コピー元日付</span>
        <input
          type="date"
          value={sourceDate}
          onChange={(event) => setSourceDate(event.target.value)}
          className="date-input mt-1 h-11 w-full rounded-md border border-slate-300 px-3 text-sm leading-[2.75rem] outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
        />
      </label>

      <div className="mt-4 rounded-md bg-slate-50 p-3">
        {isLoading ? <p className="text-sm text-slate-500">読み込み中...</p> : null}
        {!isLoading && previewSchedules.length === 0 ? (
          <p className="text-sm text-slate-500">コピー対象の予定はありません。</p>
        ) : null}
        {!isLoading && previewSchedules.length > 0 ? (
          <ul className="space-y-2">
            {previewSchedules.map((schedule) => (
              <li key={schedule.id} className="text-sm text-slate-700">
                {schedule.startTime}-{schedule.endTime} {schedule.title}
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      {error ? <p className="mt-3 text-sm font-medium text-rose-700">{error}</p> : null}
      {message ? (
        <p className="mt-3 text-sm font-medium text-emerald-700">{message}</p>
      ) : null}
      {targetScheduleCount > 0 ? (
        <p className="mt-3 text-sm font-medium text-amber-700">
          コピー先の表示日にはすでにスケジュールがあります。
        </p>
      ) : null}

      <div className="mt-4 flex justify-end">
        <button
          type="button"
          onClick={handleCopy}
          disabled={
            isSubmitting ||
            isCheckingTarget ||
            previewSchedules.length === 0 ||
            targetScheduleCount > 0
          }
          className="h-10 w-full rounded-md bg-slate-950 px-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400 sm:w-auto"
        >
          {isSubmitting ? "コピー中..." : "表示日へコピー"}
        </button>
      </div>
    </section>
  );
}
