"use client";

import { useEffect, useMemo, useState } from "react";
import { ScheduleBlock } from "./ScheduleBlock";

type Schedule = {
  id: number;
  date: string;
  title: string;
  startTime: string;
  endTime: string;
  memo: string | null;
  category: {
    name: string;
    color: string;
  };
};

type TimeChartProps = {
  selectedDate: string;
  refreshKey: number;
};

function formatDateLabel(date: string) {
  return new Intl.DateTimeFormat("ja-JP", {
    month: "long",
    day: "numeric",
    weekday: "short",
  }).format(new Date(`${date}T00:00:00`));
}

export function TimeChart({ selectedDate, refreshKey }: TimeChartProps) {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchSchedules() {
      setIsLoading(true);
      setError("");

      try {
        const params = new URLSearchParams({ date: selectedDate });
        const response = await fetch(`/api/schedules?${params.toString()}`);

        if (!response.ok) {
          throw new Error("スケジュールの取得に失敗しました。");
        }

        const data = (await response.json()) as Schedule[];
        setSchedules(data);
      } catch (fetchError) {
        setError(
          fetchError instanceof Error
            ? fetchError.message
            : "スケジュールの取得に失敗しました。",
        );
      } finally {
        setIsLoading(false);
      }
    }

    fetchSchedules();
  }, [refreshKey, selectedDate]);

  const sortedSchedules = useMemo(() => {
    return [...schedules].sort((a, b) => {
      if (a.startTime === b.startTime) {
        return a.endTime.localeCompare(b.endTime);
      }

      return a.startTime.localeCompare(b.startTime);
    });
  }, [schedules]);

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-2 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-950">
            タイムチャート
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            {formatDateLabel(selectedDate)} の予定
          </p>
        </div>
        <span className="text-sm font-semibold text-slate-500">
          {sortedSchedules.length}件
        </span>
      </div>

      {isLoading ? (
        <p className="py-8 text-sm text-slate-500">読み込み中...</p>
      ) : null}

      {error ? (
        <p className="py-8 text-sm font-medium text-rose-700">{error}</p>
      ) : null}

      {!isLoading && !error && sortedSchedules.length === 0 ? (
        <div className="py-8">
          <p className="text-sm font-medium text-slate-700">
            この日のスケジュールはまだありません。
          </p>
          <p className="mt-2 text-sm text-slate-500">
            左のフォームから予定を登録すると、時間順に表示されます。
          </p>
        </div>
      ) : null}

      {!isLoading && !error && sortedSchedules.length > 0 ? (
        <div className="relative">
          <div
            className="absolute bottom-4 left-10 top-4 hidden w-px bg-slate-200 sm:block"
            aria-hidden="true"
          />
          <div className="relative">
            {sortedSchedules.map((schedule) => (
              <ScheduleBlock
                key={schedule.id}
                title={schedule.title}
                startTime={schedule.startTime}
                endTime={schedule.endTime}
                memo={schedule.memo}
                category={schedule.category}
              />
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
