import { WeightDashboard } from "../../components/weight/WeightDashboard";

export default function WeightPage() {
  return (
    <div className="space-y-6">
      <section className="border-b border-slate-200 pb-6">
        <p className="text-sm font-semibold text-emerald-700">Weight</p>
        <h2 className="mt-2 text-xl font-semibold text-slate-950 sm:text-3xl">体重</h2>
        <p className="mt-3 text-sm text-slate-600">
          日々の体重を記録して、変化を一覧で確認します。
        </p>
      </section>

      <WeightDashboard />
    </div>
  );
}
