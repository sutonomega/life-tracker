"use client";

import { useState } from "react";
import { ScheduleCopyPanel } from "./ScheduleCopyPanel";
import { ScheduleForm } from "./ScheduleForm";
import { ScheduleTemplatePanel } from "./ScheduleTemplatePanel";
import { TimeChart } from "./TimeChart";

function getToday() {
  return new Date().toISOString().slice(0, 10);
}

export function ScheduleDashboard() {
  const [selectedDate, setSelectedDate] = useState(getToday);
  const [refreshKey, setRefreshKey] = useState(0);

  function refreshSchedules(date: string) {
    setSelectedDate(date);
    setRefreshKey((current) => current + 1);
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(360px,420px)_1fr]">
      <div className="space-y-4">
        <label className="block rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <span className="text-sm font-medium text-slate-700">表示日</span>
          <input
            type="date"
            value={selectedDate}
            onChange={(event) => setSelectedDate(event.target.value)}
            className="mt-2 h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          />
        </label>
        <ScheduleForm onCreated={refreshSchedules} />
        <ScheduleCopyPanel selectedDate={selectedDate} onCopied={refreshSchedules} />
        <ScheduleTemplatePanel
          key={selectedDate}
          selectedDate={selectedDate}
          onApplied={refreshSchedules}
        />
      </div>

      <TimeChart selectedDate={selectedDate} refreshKey={refreshKey} />
    </div>
  );
}
