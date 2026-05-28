"use client";

import { useState } from "react";
import { WeightForm } from "./WeightForm";
import { WeightStats } from "./WeightStats";

export function WeightDashboard() {
  const [refreshKey, setRefreshKey] = useState(0);

  function refreshLogs() {
    setRefreshKey((current) => current + 1);
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(320px,400px)_1fr]">
      <WeightForm onCreated={refreshLogs} />
      <WeightStats refreshKey={refreshKey} />
    </div>
  );
}
