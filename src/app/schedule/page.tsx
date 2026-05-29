import { ScheduleDashboard } from "../../components/schedule/ScheduleDashboard";

export default function SchedulePage() {
  return (
    <div className="space-y-6">
      <section className="border-b border-slate-200 pb-6">
        <p className="text-sm font-semibold text-emerald-700">Schedule</p>
        <h2 className="mt-2 text-xl font-semibold text-slate-950 sm:text-3xl">
          スケジュール
        </h2>
        <p className="mt-3 text-sm text-slate-600">
          今日の予定や生活ログに残したい行動を登録します。
        </p>
      </section>

      <ScheduleDashboard />
    </div>
  );
}
