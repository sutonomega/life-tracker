"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { appVersion } from "../../lib/appVersion";
import { Header } from "./Header";
import { SideNav } from "./SideNav";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 lg:flex">
      <div className="hidden lg:block">
        <SideNav />
      </div>

      <div className="min-w-0 flex-1">
        <Header onMenuOpen={() => setIsMenuOpen(true)} />
        <main className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
          {children}
        </main>
      </div>

      {isMenuOpen ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-slate-950/50"
            aria-label="メニューを閉じる"
            onClick={() => setIsMenuOpen(false)}
          />
          <div className="absolute right-0 top-0 h-full w-[min(82vw,320px)] bg-slate-950 text-white shadow-xl">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <div>
                <p className="text-sm font-semibold text-emerald-300">
                  Life Tracker
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  schedule / body / meals
                </p>
                <p className="mt-1 text-xs font-semibold text-slate-500">
                  v{appVersion}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsMenuOpen(false)}
                className="grid size-10 place-items-center rounded-md border border-white/10 text-xl font-semibold text-white transition hover:bg-white/10"
                aria-label="メニューを閉じる"
              >
                ×
              </button>
            </div>
            <SideNav onNavigate={() => setIsMenuOpen(false)} />
          </div>
        </div>
      ) : null}
    </div>
  );
}
