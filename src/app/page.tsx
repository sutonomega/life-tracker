import Link from "next/link";

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

const dashboardItems = [
  { label: "予定", value: "0件", detail: "スケジュール未登録" },
  { label: "体重", value: "-- kg", detail: "最新記録なし" },
  { label: "摂取カロリー", value: "-- kcal", detail: "食事記録なし" },
  { label: "PFC", value: "-- / -- / --", detail: "集計待ち" },
];

const nextActions = [
  "今日のスケジュールを登録",
  "最新の体重を入力",
  "食事とPFCを記録",
];

export default function Home() {
  return (
    <div className="space-y-8">
      <section className="border-b border-slate-200 pb-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-emerald-700">
              Daily dashboard
            </p>
            <h2 className="mt-2 text-3xl font-semibold text-slate-950">
              今日の生活ログ
            </h2>
            <p className="mt-3 text-sm text-slate-600">未登録の項目があります</p>
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
            <p className="mt-3 text-2xl font-semibold text-slate-950">
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
            <span className="text-sm text-slate-500">未登録</span>
          </div>
          <div className="mt-5 divide-y divide-slate-100">
            {["朝", "昼", "夜"].map((meal) => (
              <div
                key={meal}
                className="flex items-center justify-between gap-4 py-3"
              >
                <p className="text-sm font-medium text-slate-500">{meal}</p>
                <p className="text-base font-semibold text-slate-950">
                  記録なし
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
