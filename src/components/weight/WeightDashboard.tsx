"use client";

import { useEffect, useState } from "react";
import { WeightChart } from "./WeightChart";
import { WeightForm } from "./WeightForm";
import { WeightLog, WeightStats } from "./WeightStats";

export function WeightDashboard() {
  const [activeTab, setActiveTab] = useState<"chart" | "form" | "logs">("chart");
  const [refreshKey, setRefreshKey] = useState(0);
  const [logs, setLogs] = useState<WeightLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchLogs() {
      setIsLoading(true);
      setError("");

      try {
        const response = await fetch("/api/weight-logs");

        if (!response.ok) {
          throw new Error("体重記録の取得に失敗しました。");
        }

        const data = (await response.json()) as WeightLog[];
        setLogs(data);
      } catch (fetchError) {
        setError(
          fetchError instanceof Error
            ? fetchError.message
            : "体重記録の取得に失敗しました。",
        );
      } finally {
        setIsLoading(false);
      }
    }

    fetchLogs();
  }, [refreshKey]);

  function refreshLogs() {
    setRefreshKey((current) => current + 1);
  }

  return (
    <div className="min-w-0 space-y-6">
      <div className="rounded-lg border border-slate-200 bg-white p-1 shadow-sm">
        <div className="grid grid-cols-3 gap-1">
          {[
            ["chart", "グラフ"],
            ["form", "入力"],
            ["logs", "記録"],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setActiveTab(value as typeof activeTab)}
              className={`h-9 rounded-md px-1 text-xs font-semibold transition sm:h-10 sm:px-2 sm:text-sm ${
                activeTab === value
                  ? "bg-slate-950 text-white"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "form" ? (
        <WeightForm onCreated={refreshLogs} />
      ) : null}
      {activeTab === "logs" ? (
        <WeightStats
          logs={logs}
          isLoading={isLoading}
          error={error}
          onChanged={refreshLogs}
        />
      ) : null}
      {activeTab === "chart" ? (
        <WeightChart logs={logs} isLoading={isLoading} error={error} />
      ) : null}
    </div>
  );
}
