import { appVersion } from "../../lib/appVersion";

type HeaderProps = {
  onMenuOpen: () => void;
};

export function Header({ onMenuOpen }: HeaderProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="relative flex min-h-14 items-center justify-between gap-4 px-4 py-2 sm:px-6 lg:min-h-16 lg:px-8 lg:py-3">
        <div className="min-w-0 pr-12 lg:pr-0">
          <p className="text-xs font-semibold text-emerald-700">
            Life Tracker
          </p>
          <h1 className="text-base font-semibold text-slate-950 sm:text-lg">
            生活ログ管理
          </h1>
        </div>
        <div className="hidden items-center gap-2 lg:flex">
          <div className="rounded-full border border-slate-200 px-3 py-1 text-sm text-slate-600">
            今日の記録を整える
          </div>
          <div className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-500">
            v{appVersion}
          </div>
        </div>
        <button
          type="button"
          onClick={onMenuOpen}
          className="absolute right-4 top-2 grid size-9 shrink-0 place-items-center rounded-md border border-slate-200 text-lg font-semibold text-slate-700 transition hover:bg-slate-50 sm:right-6 lg:hidden"
          aria-label="メニューを開く"
        >
          ≡
        </button>
      </div>
    </header>
  );
}
