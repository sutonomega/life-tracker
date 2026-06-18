import Link from "next/link";
import { appVersion } from "../../lib/appVersion";

const navItems = [
  { href: "/", label: "ホーム", icon: "⌂" },
  { href: "/schedule", label: "スケジュール", icon: "◷" },
  { href: "/weight", label: "体重", icon: "◇" },
  { href: "/meals", label: "食事", icon: "◎" },
  { href: "/settings", label: "設定", icon: "⚙" },
];

type SideNavProps = {
  onNavigate?: () => void;
};

export function SideNav({ onNavigate }: SideNavProps) {
  return (
    <aside className="h-full bg-slate-950 text-white lg:sticky lg:top-0 lg:h-screen lg:w-64 lg:border-r lg:border-slate-800">
      <div className="flex h-full flex-col">
        <div className="hidden px-6 py-6 lg:block">
          <p className="text-sm font-semibold text-emerald-300">Life Tracker</p>
          <p className="mt-1 text-xs text-slate-400">schedule / body / meals</p>
        </div>
        <nav className="flex flex-col gap-2 px-4 py-4 lg:py-0">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/10 hover:text-white"
            >
              <span
                aria-hidden="true"
                className="grid size-7 place-items-center rounded bg-white/10 text-sm"
              >
                {item.icon}
              </span>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto px-6 py-5 text-xs font-semibold text-slate-500">
          v{appVersion}
        </div>
      </div>
    </aside>
  );
}
