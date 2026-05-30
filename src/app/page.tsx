import Link from "next/link";
import { prisma } from "../lib/prisma";
import { getLocalDateString } from "../lib/utils";

export const dynamic = "force-dynamic";

function getToday() {
  return getLocalDateString();
}

function formatPfc(proteinG: number, fatG: number, carbsG: number) {
  return `${proteinG.toFixed(1)} / ${fatG.toFixed(1)} / ${carbsG.toFixed(1)}g`;
}

export default async function Home() {
  const today = getToday();
  const [schedules, latestWeightLog, meals, goal] = await Promise.all([
    prisma.schedule.findMany({
      where: { date: today },
      include: { category: true },
      orderBy: { startTime: "asc" },
    }),
    prisma.weightLog.findFirst({
      orderBy: { date: "desc" },
    }),
    prisma.meal.findMany({
      where: { date: today },
      orderBy: { id: "asc" },
    }),
    prisma.nutritionGoal.findFirst({
      orderBy: { id: "asc" },
    }),
  ]);

  const totals = meals.reduce(
    (total, meal) => ({
      calories: total.calories + meal.calories,
      proteinG: total.proteinG + meal.proteinG,
      fatG: total.fatG + meal.fatG,
      carbsG: total.carbsG + meal.carbsG,
    }),
    { calories: 0, proteinG: 0, fatG: 0, carbsG: 0 },
  );

  const dashboardItems = [
    {
      label: "予定",
      href: "/schedule",
      value: `${schedules.length}件`,
      detail: schedules[0]
        ? `${schedules[0].startTime} ${schedules[0].title}`
        : "スケジュール未登録",
    },
    {
      label: "体重",
      href: "/weight",
      value: latestWeightLog ? `${latestWeightLog.weightKg.toFixed(1)} kg` : "-- kg",
      detail: latestWeightLog ? latestWeightLog.date : "最新記録なし",
    },
    {
      label: "食事",
      href: "/meals",
      value: meals.length > 0 ? `${totals.calories} kcal` : "-- kcal",
      detail: meals.length > 0
        ? `PFC ${formatPfc(totals.proteinG, totals.fatG, totals.carbsG)}`
        : goal
          ? `目標 ${goal.calories} kcal`
          : "食事記録なし",
    },
  ];

  return (
    <div className="space-y-5 sm:space-y-8">
      <section className="border-b border-slate-200 pb-5 sm:pb-6">
        <div>
          <p className="text-sm font-semibold text-emerald-700">
            Daily dashboard
          </p>
          <h2 className="mt-2 text-xl font-semibold text-slate-950 sm:text-3xl">
            今日の生活ログ
          </h2>
          <p className="mt-2 text-sm text-slate-600 sm:mt-3">
            今日の予定・体重・食事をまとめて確認できます
          </p>
        </div>
      </section>

      <section>
        <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-950">
              今日のサマリー
            </h3>
            <p className="mt-1 text-sm text-slate-500">{today}</p>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {dashboardItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="group rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md sm:p-5"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-slate-500">
                  {item.label}
                </p>
                <span className="text-xs font-semibold text-slate-400 transition group-hover:text-slate-700">
                  開く
                </span>
              </div>
              <p className="mt-3 break-words text-xl font-semibold text-slate-950 sm:text-2xl">
                {item.value}
              </p>
              <p className="mt-2 text-sm text-slate-500">{item.detail}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
