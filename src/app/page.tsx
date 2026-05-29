import Link from "next/link";
import { prisma } from "../lib/prisma";
import { getLocalDateString } from "../lib/utils";

export const dynamic = "force-dynamic";

const mealSections = [
  { type: "breakfast", label: "朝" },
  { type: "lunch", label: "昼" },
  { type: "dinner", label: "夜" },
  { type: "snack", label: "間食" },
];

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
      label: "摂取カロリー",
      href: "/meals",
      value: meals.length > 0 ? `${totals.calories} kcal` : "-- kcal",
      detail: goal ? `目標 ${goal.calories} kcal` : "食事記録なし",
    },
    {
      label: "PFC",
      href: "/meals",
      value: meals.length > 0 ? formatPfc(totals.proteinG, totals.fatG, totals.carbsG) : "-- / -- / --",
      detail: meals.length > 0 ? `${meals.length}件の食事を集計` : "集計待ち",
    },
  ];

  return (
    <div className="space-y-8">
      <section className="border-b border-slate-200 pb-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-emerald-700">
              Daily dashboard
            </p>
            <h2 className="mt-2 text-xl font-semibold text-slate-950 sm:text-3xl">
              今日の生活ログ
            </h2>
            <p className="mt-3 text-sm text-slate-600">
              スケジュール・体重・食事をまとめて確認できます
            </p>
          </div>
          <Link
            href="/schedule"
            className="inline-flex h-11 items-center justify-center rounded-md bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            今日の予定を見る
          </Link>
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
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {dashboardItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="group min-h-32 rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md sm:p-5"
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

      <section>
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-lg font-semibold text-slate-950">
              食事別サマリー
            </h3>
            <span className="text-sm text-slate-500">{today}</span>
          </div>
          <div className="mt-5 divide-y divide-slate-100">
            {mealSections.map((section) => {
              const sectionMeals = meals.filter(
                (meal) => meal.mealType === section.type,
              );
              const calories = sectionMeals.reduce(
                (total, meal) => total + meal.calories,
                0,
              );

              return (
                <div
                  key={section.type}
                  className="flex items-center justify-between gap-4 py-3"
                >
                  <p className="text-sm font-medium text-slate-500">
                    {section.label}
                  </p>
                  <p className="text-base font-semibold text-slate-950">
                    {sectionMeals.length > 0 ? `${calories} kcal` : "記録なし"}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
