"use client";

import { useState } from "react";
import { BottomNav, type AppTab } from "@/components/BottomNav";
import { DailyScreen } from "@/components/DailyScreen";
import { LoginScreen } from "@/components/LoginScreen";
import { ReviewScreen } from "@/components/ReviewScreen";
import type { AppUser } from "@/lib/auth/assignedLogin";

const CURRENT_USER_STORAGE_KEY = "yawm_current_user";

type AppShellProps = {
  initialTab?: AppTab;
};

type StoredCurrentUser = {
  id: string;
  userCode: string;
  name: string;
  role: AppUser["role"];
  avatarUrl: string | null;
};

function readStoredUser(): AppUser | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const storedValue = window.localStorage.getItem(CURRENT_USER_STORAGE_KEY);

    if (!storedValue) {
      return null;
    }

    const storedUser = JSON.parse(storedValue) as Partial<StoredCurrentUser>;

    if (!storedUser.id || !storedUser.userCode || !storedUser.name || !storedUser.role) {
      window.localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
      return null;
    }

    if (storedUser.userCode !== "haris" && storedUser.userCode !== "hashim") {
      window.localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
      return null;
    }

    return {
      id: storedUser.id,
      userCode: storedUser.userCode,
      displayName: storedUser.name,
      role: storedUser.role,
      avatarUrl: storedUser.avatarUrl ?? null,
    };
  } catch {
    window.localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
    return null;
  }
}

function saveStoredUser(user: AppUser) {
  const storedUser: StoredCurrentUser = {
    id: user.id,
    userCode: user.userCode,
    name: user.displayName,
    role: user.role,
    avatarUrl: user.avatarUrl,
  };

  window.localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(storedUser));
}

export function AppShell({ initialTab = "daily" }: AppShellProps) {
  const [activeTab, setActiveTab] = useState<AppTab>(initialTab);
  const [currentUser, setCurrentUser] = useState<AppUser | null>(() => readStoredUser());
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);

  function handleLogin(user: AppUser) {
    saveStoredUser(user);
    setCurrentUser(user);
  }

  const handleLogout = () => {
    localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
    setCurrentUser(null);
  };

  if (!currentUser) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <main className="min-h-dvh bg-[#05080d] text-zinc-50">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_12%_0%,rgba(28,72,98,0.42),transparent_34%),radial-gradient(circle_at_88%_18%,rgba(34,89,76,0.16),transparent_30%),linear-gradient(180deg,#07111d_0%,#05080d_48%,#04070b_100%)]" />

      <div className="relative mx-auto min-h-dvh w-full max-w-md px-3.5 pb-[calc(84px+env(safe-area-inset-bottom))] pt-[calc(18px+env(safe-area-inset-top))] min-[390px]:px-4">
        {activeTab === "daily" ? (
          <DailyScreen currentUser={currentUser} onAvatarClick={() => setIsLogoutOpen(true)} />
        ) : (
          <ReviewScreen currentUser={currentUser} />
        )}
      </div>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

      {isLogoutOpen ? (
        <>
          <button
            type="button"
            aria-label="Close logout confirmation"
            className="fixed inset-0 z-40 bg-black/55"
            onClick={() => setIsLogoutOpen(false)}
          />
          <div className="fixed inset-x-0 bottom-0 z-50 mx-auto w-full max-w-md rounded-t-3xl border border-white/10 bg-[#0d1722] p-4 pb-[calc(16px+env(safe-area-inset-bottom))] shadow-[0_-24px_60px_rgba(0,0,0,0.45)]">
            <p className="text-base font-semibold text-white">Log out?</p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setIsLogoutOpen(false)}
                className="min-h-11 rounded-2xl border border-white/10 bg-white/5 text-sm font-semibold text-zinc-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="min-h-11 rounded-2xl bg-zinc-100 text-sm font-semibold text-zinc-950"
              >
                Log out
              </button>
            </div>
          </div>
        </>
      ) : null}
    </main>
  );
}
