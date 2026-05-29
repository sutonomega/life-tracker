import { MealSection } from "../../components/meals/MealSection";

export default function MealsPage() {
  return (
    <div className="space-y-6">
      <section className="border-b border-slate-200 pb-6">
        <p className="text-sm font-semibold text-emerald-700">Meals</p>
        <h2 className="mt-2 text-3xl font-semibold text-slate-950">食事</h2>
        <p className="mt-3 text-sm text-slate-600">
          食事のカロリーとPFCを記録し、日別に集計します。
        </p>
      </section>

      <MealSection />
    </div>
  );
}
