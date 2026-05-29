export function Header() {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="flex min-h-16 items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <div>
          <p className="text-xs font-semibold text-emerald-700">
            Life Tracker
          </p>
          <h1 className="text-base font-semibold text-slate-950 sm:text-lg">
            生活ログ管理
          </h1>
        </div>
        <div className="hidden rounded-full border border-slate-200 px-3 py-1 text-sm text-slate-600 sm:block">
          今日の記録を整える
        </div>
      </div>
    </header>
  );
}
