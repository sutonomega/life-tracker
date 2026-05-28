export function Header() {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div>
          <p className="text-xs font-semibold text-emerald-700">
            Life Tracker
          </p>
          <h1 className="text-lg font-semibold text-slate-950">
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
