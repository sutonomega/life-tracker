import Link from "next/link";
import { ensureDatabase } from "../lib/database";
import { prisma } from "../lib/prisma";

export const dynamic = "force-dynamic";

const featureLinks = [
  {
    href: "/schedule",
    label: "スケジュール",
    value: "今日の予定",
    accent: "bg-emerald-100 text-emerald-800",
    icon: "◷",
  },
  {
    href: "/weight",
    label: "体重",
    value: "記録を確認",
    accent: "bg-sky-100 text-sky-800",
    icon: "◇",
  },
  {
    href: "/meals",
    label: "食事",
    value: "栄養を集計",
    accent: "bg-amber-100 text-amber-800",
    icon: "◎",
  },
  {
    href: "/settings",
    label: "設定",
    value: "目標を調整",
    accent: "bg-rose-100 text-rose-800",
    icon: "⚙",
  },
];

const mealSections = [
  { type: "breakfast", label: "朝" },
  { type: "lunch", label: "昼" },
  { type: "dinner", label: "夜" },
  { type: "snack", label: "間食" },
];

function getToday() {
  return new Date().toISOString().slice(0, 10);
}

function formatPfc(proteinG: number, fatG: number, carbsG: number) {
  return `${proteinG.toFixed(1)} / ${fatG.toFixed(1)} / ${carbsG.toFixed(1)}g`;
}

export default async function Home() {
  await ensureDatabase();

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
      value: `${schedules.length}件`,
      detail: schedules[0]
        ? `${schedules[0].startTime} ${schedules[0].title}`
        : "スケジュール未登録",
    },
    {
      label: "体重",
      value: latestWeightLog ? `${latestWeightLog.weightKg.toFixed(1)} kg` : "-- kg",
      detail: latestWeightLog ? latestWeightLog.date : "最新記録なし",
    },
    {
      label: "摂取カロリー",
      value: meals.length > 0 ? `${totals.calories} kcal` : "-- kcal",
      detail: goal ? `目標 ${goal.calories} kcal` : "食事記録なし",
    },
    {
      label: "PFC",
      value: meals.length > 0 ? formatPfc(totals.proteinG, totals.fatG, totals.carbsG) : "-- / -- / --",
      detail: meals.length > 0 ? `${meals.length}件の食事を集計` : "集計待ち",
    },
  ];

  const nextActions = [
    schedules.length === 0 ? "今日のスケジュールを登録" : "次の予定を確認",
    latestWeightLog?.date === today ? "体重記録を確認" : "最新の体重を入力",
    meals.length === 0 ? "食事とPFCを記録" : "栄養サマリーを確認",
  ];

  return (
    <div className="space-y-8">
      <section className="border-b border-slate-200 pb-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-emerald-700">
              Daily dashboard
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950 sm:text-3xl">
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

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {dashboardItems.map((item) => (
          <article
            key={item.label}
            className="min-h-32 rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
          >
            <p className="text-sm font-medium text-slate-500">{item.label}</p>
            <p className="mt-3 break-words text-xl font-semibold text-slate-950 sm:text-2xl">
              {item.value}
            </p>
            <p className="mt-2 text-sm text-slate-500">{item.detail}</p>
          </article>
        ))}
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between gap-4">
          <h3 className="text-xl font-semibold text-slate-950">機能</h3>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {featureLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group flex min-h-36 flex-col justify-between rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
            >
              <div className="flex items-center justify-between gap-3">
                <span
                  className={`grid size-11 place-items-center rounded-md text-lg ${item.accent}`}
                  aria-hidden="true"
                >
                  {item.icon}
                </span>
                <span className="text-sm font-semibold text-slate-400 transition group-hover:text-slate-600">
                  開く
                </span>
              </div>
              <div>
                <p className="text-lg font-semibold text-slate-950">
                  {item.label}
                </p>
                <p className="mt-1 text-sm text-slate-500">{item.value}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_2fr]">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-950">次の記録</h3>
          <div className="mt-4 space-y-3">
            {nextActions.map((action, index) => (
              <div key={action} className="flex items-center gap-3">
                <span className="grid size-8 place-items-center rounded-md bg-slate-100 text-sm font-semibold text-slate-700">
                  {index + 1}
                </span>
                <span className="text-sm text-slate-700">{action}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-lg font-semibold text-slate-950">
              今日のサマリー
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
