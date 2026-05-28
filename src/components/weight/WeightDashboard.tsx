"use client";

import { useEffect, useState } from "react";
import { WeightChart } from "./WeightChart";
import { WeightForm } from "./WeightForm";
import { WeightLog, WeightStats } from "./WeightStats";

export function WeightDashboard() {
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
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[minmax(320px,400px)_1fr]">
        <WeightForm onCreated={refreshLogs} />
        <WeightStats logs={logs} isLoading={isLoading} error={error} />
      </div>
      <WeightChart logs={logs} isLoading={isLoading} error={error} />
    </div>
  );
}
