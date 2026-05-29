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
  const [activeTab, setActiveTab] = useState<"form" | "copy" | "template">("form");
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
        <div className="rounded-lg border border-slate-200 bg-white p-1 shadow-sm">
          <div className="grid grid-cols-3 gap-1">
            {[
              ["form", "登録"],
              ["copy", "コピー"],
              ["template", "テンプレート"],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setActiveTab(value as typeof activeTab)}
                className={`h-10 rounded-md px-2 text-sm font-semibold transition ${
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
          <ScheduleForm onCreated={refreshSchedules} />
        ) : null}
        {activeTab === "copy" ? (
          <ScheduleCopyPanel selectedDate={selectedDate} onCopied={refreshSchedules} />
        ) : null}
        {activeTab === "template" ? (
          <ScheduleTemplatePanel
            selectedDate={selectedDate}
            onApplied={refreshSchedules}
          />
        ) : null}
      </div>

      <TimeChart selectedDate={selectedDate} refreshKey={refreshKey} />
    </div>
  );
}
