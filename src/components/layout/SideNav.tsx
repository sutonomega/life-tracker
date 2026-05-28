import Link from "next/link";

const navItems = [
  { href: "/", label: "ホーム", icon: "⌂" },
  { href: "/schedule", label: "スケジュール", icon: "◷" },
  { href: "/weight", label: "体重", icon: "◇" },
  { href: "/meals", label: "食事", icon: "◎" },
  { href: "/settings", label: "設定", icon: "⚙" },
];

export function SideNav() {
  return (
    <aside className="border-b border-slate-200 bg-slate-950 text-white lg:sticky lg:top-0 lg:h-screen lg:w-64 lg:border-b-0 lg:border-r">
      <div className="flex h-full flex-col">
        <div className="hidden px-6 py-6 lg:block">
          <p className="text-sm font-semibold text-emerald-300">Life Stack</p>
          <p className="mt-1 text-xs text-slate-400">schedule / body / meals</p>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 py-3 lg:flex-col lg:gap-2 lg:px-4 lg:py-0">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex min-w-fit items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/10 hover:text-white"
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
      </div>
    </aside>
  );
}
