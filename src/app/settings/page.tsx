import { NutritionGoalForm } from "../../components/meals/NutritionGoalForm";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <section className="border-b border-slate-200 pb-6">
        <p className="text-sm font-semibold text-emerald-700">Settings</p>
        <h2 className="mt-2 text-3xl font-semibold text-slate-950">設定</h2>
        <p className="mt-3 text-sm text-slate-600">
          栄養評価に使う目標値を調整します。
        </p>
      </section>

      <div className="max-w-3xl">
        <NutritionGoalForm />
      </div>
    </div>
  );
}
