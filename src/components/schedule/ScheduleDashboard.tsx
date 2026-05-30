"use client";

import { useState } from "react";
import { getLocalDateString } from "../../lib/utils";
import { ScheduleCopyPanel } from "./ScheduleCopyPanel";
import { ScheduleCardList } from "./ScheduleCardList";
import { ScheduleForm } from "./ScheduleForm";
import { ScheduleTemplatePanel } from "./ScheduleTemplatePanel";

export function ScheduleDashboard() {
  const [selectedDate, setSelectedDate] = useState(getLocalDateString);
  const [activeTab, setActiveTab] = useState<
    "chart" | "form" | "copy" | "template"
  >("chart");
  const [refreshKey, setRefreshKey] = useState(0);

  function refreshSchedules(date: string) {
    setSelectedDate(date);
    setRefreshKey((current) => current + 1);
  }

  return (
    <div className="min-w-0 space-y-4">
      <div className="min-w-0 space-y-4">
        <label className="block rounded-lg border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
          <span className="sr-only">表示日</span>
          <input
            type="date"
            value={selectedDate}
            onChange={(event) => setSelectedDate(event.target.value)}
            className="date-input h-10 w-full max-w-full rounded-md border border-slate-300 px-3 text-sm leading-10 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          />
        </label>
        <div className="rounded-lg border border-slate-200 bg-white p-1 shadow-sm">
          <div className="grid grid-cols-4 gap-1">
            {[
              ["chart", "一覧"],
              ["form", "登録"],
              ["copy", "コピー"],
              ["template", "テンプレート"],
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
          <ScheduleForm
            key={selectedDate}
            selectedDate={selectedDate}
            onCreated={refreshSchedules}
          />
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

      {activeTab === "chart" ? (
        <ScheduleCardList selectedDate={selectedDate} refreshKey={refreshKey} />
      ) : null}
    </div>
  );
}
