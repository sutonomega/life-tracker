"use client";

import { useMemo, useState } from "react";
import { WeightLog } from "./WeightStats";

type WeightChartProps = {
  logs: WeightLog[];
  isLoading: boolean;
  error: string;
};

type ChartPoint = {
  date: string;
  weightKg: number;
  averageKg: number;
  x: number;
  y: number;
  averageY: number;
};

const chartWidth = 720;
const chartHeight = 260;
const padding = 32;
const rangeOptions = [
  { value: "14d", label: "14日", days: 14 },
  { value: "1m", label: "1か月", days: 31 },
  { value: "1y", label: "1年", days: 365 },
];

function formatDate(date: string) {
  return new Intl.DateTimeFormat("ja-JP", {
    month: "numeric",
    day: "numeric",
  }).format(new Date(`${date}T00:00:00`));
}

function buildPath(points: ChartPoint[], key: "y" | "averageY") {
  return points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point[key]}`)
    .join(" ");
}

function isNextDay(current: string, next: string) {
  const currentTime = new Date(`${current}T00:00:00`).getTime();
  const nextTime = new Date(`${next}T00:00:00`).getTime();
  return nextTime - currentTime <= 24 * 60 * 60 * 1000;
}

export function WeightChart({ logs, isLoading, error }: WeightChartProps) {
  const [selectedRange, setSelectedRange] = useState(rangeOptions[0]);

  const chartData = useMemo(() => {
    const sortedLogs = [...logs].sort((a, b) => a.date.localeCompare(b.date));
    const latestDate = sortedLogs.at(-1)?.date;
    const latestTime = latestDate ? new Date(`${latestDate}T00:00:00`).getTime() : 0;
    const recentStartTime =
      latestTime - (selectedRange.days - 1) * 24 * 60 * 60 * 1000;
    const recentLogs = sortedLogs.filter((log) => {
      const logTime = new Date(`${log.date}T00:00:00`).getTime();
      return logTime >= recentStartTime && logTime <= latestTime;
    });
    const weights = recentLogs.map((log) => log.weightKg);

    if (recentLogs.length === 0) {
      return {
        points: [] as ChartPoint[],
        minWeight: 0,
        maxWeight: 0,
      };
    }

    const averageValues = recentLogs.map((_, index) => {
      const windowLogs = recentLogs.slice(Math.max(0, index - 13), index + 1);
      const total = windowLogs.reduce((sum, log) => sum + log.weightKg, 0);
      return total / windowLogs.length;
    });

    const minWeight = Math.floor(Math.min(...weights, ...averageValues) - 1);
    const maxWeight = Math.ceil(Math.max(...weights, ...averageValues) + 1);
    const range = Math.max(maxWeight - minWeight, 1);
    const plotWidth = chartWidth - padding * 2;
    const plotHeight = chartHeight - padding * 2;

    const points = recentLogs.map((log, index) => {
      const x =
        recentLogs.length === 1
          ? chartWidth / 2
          : padding + (plotWidth * index) / (recentLogs.length - 1);
      const y =
        padding + plotHeight - ((log.weightKg - minWeight) / range) * plotHeight;
      const averageKg = averageValues[index];
      const averageY =
        padding + plotHeight - ((averageKg - minWeight) / range) * plotHeight;

      return {
        date: log.date,
        weightKg: log.weightKg,
        averageKg,
        x,
        y,
        averageY,
      };
    });

    return { points, minWeight, maxWeight };
  }, [logs, selectedRange.days]);

  const latestAverage = chartData.points.at(-1)?.averageKg ?? null;

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-100 pb-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-950">体重グラフ</h3>
          <p className="mt-1 text-sm text-slate-500">
            表示期間を切り替えて体重推移と14日平均を確認できます
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="inline-flex rounded-md border border-slate-200 bg-slate-50 p-1">
            {rangeOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setSelectedRange(option)}
                className={`h-8 rounded px-3 text-xs font-semibold transition ${
                  selectedRange.value === option.value
                    ? "bg-white text-slate-950 shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 text-xs font-semibold">
            <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">
              体重
            </span>
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-700">
              14日平均
            </span>
          </div>
        </div>
      </div>

      {isLoading ? (
        <p className="py-8 text-sm text-slate-500">読み込み中...</p>
      ) : null}

      {error ? (
        <p className="py-8 text-sm font-medium text-rose-700">{error}</p>
      ) : null}

      {!isLoading && !error && chartData.points.length === 0 ? (
        <div className="py-8">
          <p className="text-sm font-medium text-slate-700">
            グラフに表示できる体重記録がまだありません。
          </p>
          <p className="mt-2 text-sm text-slate-500">
            体重を登録すると折れ線グラフが表示されます。
          </p>
        </div>
      ) : null}

      {!isLoading && !error && chartData.points.length > 0 ? (
        <div className="mt-5">
          <div className="mb-4 grid gap-3 sm:grid-cols-3">
            <div>
              <p className="text-sm text-slate-500">表示件数</p>
              <p className="mt-1 text-xl font-semibold text-slate-950">
                {chartData.points.length}件
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-500">最新14日平均</p>
              <p className="mt-1 text-xl font-semibold text-slate-950">
                {latestAverage === null ? "--" : `${latestAverage.toFixed(1)} kg`}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-500">表示範囲</p>
              <p className="mt-1 text-xl font-semibold text-slate-950">
                {chartData.minWeight} - {chartData.maxWeight} kg
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="h-72 min-w-[640px] rounded-lg border border-slate-100 bg-slate-50"
              role="img"
              aria-label="体重推移グラフ"
            >
              <line
                x1={padding}
                y1={padding}
                x2={padding}
                y2={chartHeight - padding}
                stroke="#cbd5e1"
              />
              <line
                x1={padding}
                y1={chartHeight - padding}
                x2={chartWidth - padding}
                y2={chartHeight - padding}
                stroke="#cbd5e1"
              />

              {[chartData.minWeight, chartData.maxWeight].map((weight) => {
                const y =
                  padding +
                  (chartHeight - padding * 2) *
                    (1 -
                      (weight - chartData.minWeight) /
                        Math.max(chartData.maxWeight - chartData.minWeight, 1));

                return (
                  <g key={weight}>
                    <line
                      x1={padding}
                      y1={y}
                      x2={chartWidth - padding}
                      y2={y}
                      stroke="#e2e8f0"
                    />
                    <text x={8} y={y + 4} className="fill-slate-500 text-xs">
                      {weight}kg
                    </text>
                  </g>
                );
              })}

              {chartData.points.length > 1 ? (
                <path
                  d={buildPath(chartData.points, "averageY")}
                  fill="none"
                  stroke="#059669"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="6 6"
                />
              ) : null}

              {chartData.points.slice(0, -1).map((point, index) => {
                const nextPoint = chartData.points[index + 1];

                return (
                  <line
                    key={`${point.date}-${nextPoint.date}`}
                    x1={point.x}
                    y1={point.y}
                    x2={nextPoint.x}
                    y2={nextPoint.y}
                    stroke="#0f172a"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeDasharray={
                      isNextDay(point.date, nextPoint.date) ? undefined : "4 7"
                    }
                  />
                );
              })}

              {chartData.points.map((point) => (
                <g key={`${point.date}-${point.weightKg}`}>
                  <circle cx={point.x} cy={point.y} r="4" fill="#0f172a" />
                  <text
                    x={point.x}
                    y={chartHeight - 10}
                    textAnchor="middle"
                    className="fill-slate-500 text-xs"
                  >
                    {formatDate(point.date)}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        </div>
      ) : null}
    </section>
  );
}
