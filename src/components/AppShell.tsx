"use client";

import { useState } from "react";
import { BottomNav, type AppTab } from "@/components/BottomNav";
import { DailyScreen } from "@/components/DailyScreen";
import { logoutOneSignal } from "@/components/EnableReminders";
import { LoginScreen } from "@/components/LoginScreen";
import { ProfileSettings } from "@/components/ProfileSettings";
import { ReviewScreen } from "@/components/ReviewScreen";
import type { AppUser } from "@/lib/auth/assignedLogin";

const CURRENT_USER_STORAGE_KEY = "yawm_current_user";

type AppShellProps = {
  initialTab?: AppTab;
};

type CurrentView = "app" | "profile";

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
  const [currentView, setCurrentView] = useState<CurrentView>("app");

  function handleLogin(user: AppUser) {
    saveStoredUser(user);
    setCurrentUser(user);
    setCurrentView("app");
  }

  const handleLogout = () => {
    logoutOneSignal();
    localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
    setCurrentView("app");
    setCurrentUser(null);
  };

  if (!currentUser) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <main className="min-h-dvh bg-[#05080d] text-zinc-50">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_12%_0%,rgba(28,72,98,0.42),transparent_34%),radial-gradient(circle_at_88%_18%,rgba(34,89,76,0.16),transparent_30%),linear-gradient(180deg,#07111d_0%,#05080d_48%,#04070b_100%)]" />

      {currentView === "profile" ? (
        <div className="relative mx-auto min-h-dvh w-full max-w-md px-3.5 pb-[calc(18px+env(safe-area-inset-bottom))] pt-[calc(18px+env(safe-area-inset-top))] min-[390px]:px-4">
          <ProfileSettings
            currentUser={currentUser}
            onBack={() => setCurrentView("app")}
            onLogout={handleLogout}
          />
        </div>
      ) : (
        <>
          <div className="relative mx-auto min-h-dvh w-full max-w-md px-3.5 pb-[calc(84px+env(safe-area-inset-bottom))] pt-[calc(18px+env(safe-area-inset-top))] min-[390px]:px-4">
            {activeTab === "daily" ? (
              <DailyScreen currentUser={currentUser} onAvatarClick={() => setCurrentView("profile")} />
            ) : (
              <ReviewScreen currentUser={currentUser} />
            )}
          </div>

          <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
        </>
      )}
    </main>
  );
}
