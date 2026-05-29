"use client";

import { useEffect, useMemo, useState } from "react";
import { Schedule, ScheduleBlock, ScheduleCategory } from "./ScheduleBlock";

type TimeChartProps = {
  selectedDate: string;
  refreshKey: number;
};

const minutesPerDay = 24 * 60;
const timelineHeight = 24 * 96;
const minimumBlockHeight = 8;

function formatDateLabel(date: string) {
  return new Intl.DateTimeFormat("ja-JP", {
    month: "long",
    day: "numeric",
    weekday: "short",
  }).format(new Date(`${date}T00:00:00`));
}

function timeToMinutes(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function formatHourLabel(hour: number) {
  return hour === 24 ? "0:00" : `${hour}:00`;
}

function getScheduleStyle(schedule: Schedule) {
  const startMinutes = timeToMinutes(schedule.startTime);
  const endMinutes = timeToMinutes(schedule.endTime);
  const durationMinutes = Math.max(endMinutes - startMinutes, 1);
  const top = (startMinutes / minutesPerDay) * timelineHeight;
  const height = Math.max(
    (durationMinutes / minutesPerDay) * timelineHeight,
    minimumBlockHeight,
  );

  return {
    top: `${top}px`,
    minHeight: `${height}px`,
    height: `${height}px`,
  };
}

export function TimeChart({ selectedDate, refreshKey }: TimeChartProps) {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [categories, setCategories] = useState<ScheduleCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [localRefreshKey, setLocalRefreshKey] = useState(0);

  useEffect(() => {
    async function fetchSchedules() {
      setIsLoading(true);
      setError("");

      try {
        const params = new URLSearchParams({ date: selectedDate });
        const [schedulesResponse, categoriesResponse] = await Promise.all([
          fetch(`/api/schedules?${params.toString()}`),
          fetch("/api/schedule-categories"),
        ]);

        if (!schedulesResponse.ok || !categoriesResponse.ok) {
          throw new Error("スケジュールの取得に失敗しました。");
        }

        setSchedules((await schedulesResponse.json()) as Schedule[]);
        setCategories((await categoriesResponse.json()) as ScheduleCategory[]);
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
  }, [localRefreshKey, refreshKey, selectedDate]);

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
        <div className="mt-5 overflow-x-auto">
          <div
            className="relative min-w-[680px]"
            style={{ height: `${timelineHeight + 24}px` }}
          >
            {Array.from({ length: 25 }, (_, hour) => {
              const top = (hour / 24) * timelineHeight;

              return (
                <div
                  key={hour}
                  className="absolute left-0 right-0 border-t border-slate-100"
                  style={{ top }}
                >
                  <span className="absolute -top-2 left-0 w-12 bg-white pr-2 text-right text-xs font-semibold text-slate-400">
                    {formatHourLabel(hour)}
                  </span>
                </div>
              );
            })}

            <div
              className="absolute bottom-0 left-16 top-0 w-px bg-slate-200"
              aria-hidden="true"
            />
            <div className="absolute bottom-0 left-20 right-0 top-0">
            {sortedSchedules.map((schedule) => (
              <ScheduleBlock
                key={schedule.id}
                schedule={schedule}
                categories={categories}
                style={{
                  ...getScheduleStyle(schedule),
                  position: "absolute",
                  left: 0,
                  right: 0,
                }}
                onChanged={() => setLocalRefreshKey((current) => current + 1)}
              />
            ))}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
