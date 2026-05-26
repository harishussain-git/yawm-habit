"use client";

import { useState } from "react";
import { BottomNav, type AppTab } from "@/components/BottomNav";
import { DailyScreen } from "@/components/DailyScreen";
import { LoginScreen } from "@/components/LoginScreen";
import { ReviewScreen } from "@/components/ReviewScreen";
import type { AssignedUser } from "@/lib/auth/supabase-login";

type AppShellProps = {
  initialTab?: AppTab;
};

export function AppShell({ initialTab = "daily" }: AppShellProps) {
  const [activeTab, setActiveTab] = useState<AppTab>(initialTab);
  const [currentUser, setCurrentUser] = useState<AssignedUser | null>(null);

  if (!currentUser) {
    return <LoginScreen onLogin={setCurrentUser} />;
  }

  return (
    <main className="min-h-dvh bg-[#05080d] text-zinc-50">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_12%_0%,rgba(28,72,98,0.42),transparent_34%),radial-gradient(circle_at_88%_18%,rgba(34,89,76,0.16),transparent_30%),linear-gradient(180deg,#07111d_0%,#05080d_48%,#04070b_100%)]" />

      <div className="relative mx-auto min-h-dvh w-full max-w-md px-3.5 pb-[calc(84px+env(safe-area-inset-bottom))] pt-[calc(18px+env(safe-area-inset-top))] min-[390px]:px-4">
        {activeTab === "daily" ? <DailyScreen userName={currentUser.name} /> : <ReviewScreen />}
      </div>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </main>
  );
}
