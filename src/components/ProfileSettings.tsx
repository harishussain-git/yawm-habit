"use client";

import { ArrowLeft, LogOut } from "lucide-react";
import { EnableReminders } from "@/components/EnableReminders";
import { UserAvatar } from "@/components/UserAvatar";
import type { AppUser } from "@/lib/auth/assignedLogin";

type ProfileSettingsProps = {
  currentUser: AppUser;
  onBack: () => void;
  onLogout: () => void;
};

export function ProfileSettings({ currentUser, onBack, onLogout }: ProfileSettingsProps) {
  const avatarTone = currentUser.userCode === "hashim" ? "hashim" : "me";

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="relative flex min-h-12 items-center justify-center">
        <button
          type="button"
          onClick={onBack}
          className="absolute left-0 grid h-11 w-11 place-items-center rounded-full border border-white/10 bg-white/[0.04] text-[#78d66d] shadow-[inset_0_1px_0_rgba(255,255,255,0.035)]"
          aria-label="Back to app"
        >
          <ArrowLeft className="h-5 w-5" strokeWidth={2.6} aria-hidden="true" />
        </button>
        <h1 className="text-lg font-semibold text-white">Profile</h1>
      </header>

      <section className="flex flex-col items-center pt-9">
        <div className="rounded-full border border-[#89e078]/70 bg-[#0b1b16] p-1 shadow-[0_0_54px_rgba(88,173,66,0.26)]">
          <UserAvatar
            name={currentUser.displayName}
            userCode={currentUser.userCode}
            avatarUrl={currentUser.avatarUrl}
            tone={avatarTone}
            size="lg"
            className="h-32 w-32 border-[#9beb89]/60 min-[390px]:h-36 min-[390px]:w-36"
          />
        </div>
        <p className="mt-4 text-base font-semibold text-zinc-100">{currentUser.displayName}</p>
      </section>

      <section className="mt-9 space-y-4">
        <EnableReminders currentUserId={currentUser.id} />

        <button
          type="button"
          onClick={onLogout}
          className="flex min-h-[68px] w-full items-center gap-4 rounded-[20px] border border-red-400/25 bg-red-500/[0.035] px-4 text-left text-red-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.025)]"
        >
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-red-500/10">
            <LogOut className="h-5 w-5" strokeWidth={2.2} aria-hidden="true" />
          </span>
          <span className="text-base font-semibold">Logout</span>
        </button>
      </section>
    </div>
  );
}
