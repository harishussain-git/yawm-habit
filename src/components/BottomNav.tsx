"use client";

import { BarChart3, CalendarCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export type AppTab = "daily" | "review";

const navItems = [
  { id: "daily" as const, label: "Daily", icon: CalendarCheck },
  { id: "review" as const, label: "Review", icon: BarChart3 },
] satisfies Array<{ id: AppTab; label: string; icon: typeof CalendarCheck }>;

type BottomNavProps = {
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
};

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 bg-[#05080d]/35 pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto grid max-w-md grid-cols-2 overflow-hidden rounded-t-[22px] border-x border-t border-white/10 bg-[#0b131d]/92 shadow-[0_-18px_55px_rgba(2,6,12,0.5)] backdrop-blur-xl">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = activeTab === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onTabChange(item.id)}
              className={cn(
                "relative flex min-h-[64px] flex-col items-center justify-center gap-1 text-sm font-semibold transition",
                active ? "bg-emerald-500/[0.04] text-[#56d66a]" : "text-zinc-500",
              )}
            >
              {active && <span className="absolute top-0 h-1 w-20 rounded-b-full bg-[#63d66a]" />}
              <Icon className="h-6 w-6" strokeWidth={active ? 2.25 : 2} aria-hidden="true" />
              {item.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
