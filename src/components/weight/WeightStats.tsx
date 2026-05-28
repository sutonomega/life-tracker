export type WeightLog = {
  id: number;
  date: string;
  weightKg: number;
  memo: string | null;
};

type WeightStatsProps = {
  logs: WeightLog[];
  isLoading: boolean;
  error: string;
};

function formatDate(date: string) {
  return new Intl.DateTimeFormat("ja-JP", {
    month: "numeric",
    day: "numeric",
    weekday: "short",
  }).format(new Date(`${date}T00:00:00`));
}

export function WeightStats({ logs, isLoading, error }: WeightStatsProps) {
  const latestLog = logs[0];
  const previousLog = logs[1];
  const diff = (() => {
    if (!latestLog || !previousLog) {
      return null;
    }

    return latestLog.weightKg - previousLog.weightKg;
  })();

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-2 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-950">体重記録</h3>
          <p className="mt-1 text-sm text-slate-500">新しい日付順で表示</p>
        </div>
        <span className="text-sm font-semibold text-slate-500">
          {logs.length}件
        </span>
      </div>

      {isLoading ? (
        <p className="py-8 text-sm text-slate-500">読み込み中...</p>
      ) : null}

      {error ? (
        <p className="py-8 text-sm font-medium text-rose-700">{error}</p>
      ) : null}

      {!isLoading && !error && logs.length === 0 ? (
        <div className="py-8">
          <p className="text-sm font-medium text-slate-700">
            体重記録はまだありません。
          </p>
          <p className="mt-2 text-sm text-slate-500">
            左のフォームから今日の体重を登録できます。
          </p>
        </div>
      ) : null}

      {!isLoading && !error && logs.length > 0 ? (
        <div>
          <div className="grid gap-4 border-b border-slate-100 py-5 sm:grid-cols-3">
            <div>
              <p className="text-sm text-slate-500">最新体重</p>
              <p className="mt-2 text-2xl font-semibold text-slate-950">
                {latestLog.weightKg.toFixed(1)} kg
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-500">前回差分</p>
              <p className="mt-2 text-2xl font-semibold text-slate-950">
                {diff === null
                  ? "--"
                  : `${diff > 0 ? "+" : ""}${diff.toFixed(1)} kg`}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-500">最新日付</p>
              <p className="mt-2 text-2xl font-semibold text-slate-950">
                {formatDate(latestLog.date)}
              </p>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {logs.map((log) => (
              <article
                key={log.id}
                className="grid gap-2 py-4 sm:grid-cols-[120px_120px_1fr]"
              >
                <p className="text-sm font-medium text-slate-500">
                  {formatDate(log.date)}
                </p>
                <p className="text-base font-semibold text-slate-950">
                  {log.weightKg.toFixed(1)} kg
                </p>
                <p className="text-sm text-slate-500">
                  {log.memo || "メモなし"}
                </p>
              </article>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
