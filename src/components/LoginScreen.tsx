"use client";

import { FormEvent, useState } from "react";
import {
  CalendarCheck,
  CheckCircle2,
  Eye,
  EyeOff,
  LockKeyhole,
  Moon,
  ShieldCheck,
  User,
} from "lucide-react";
import { loginWithAssignedPin, type AppUser } from "@/lib/auth/assignedLogin";

type LoginScreenProps = {
  onLogin: (user: AppUser) => void;
};

function Illustration() {
  return (
    <div className="relative mx-auto h-[238px] w-full max-w-[300px]">
      <div className="absolute inset-x-14 top-4 h-40 rounded-t-[96px] border border-[#b5d487]/30 bg-[#9bbd7a]/10 shadow-[0_0_44px_rgba(122,175,105,0.12)]">
        <div className="absolute inset-3 rounded-t-[78px] border border-[#b5d487]/35 bg-[#12251f]/70" />
        <Moon className="absolute left-16 top-16 h-10 w-10 rotate-[-18deg] fill-[#d8c77b] text-[#d8c77b]" aria-hidden="true" />
        <span className="absolute left-[116px] top-[78px] h-1 w-1 rounded-full bg-[#d8c77b]" />
        <span className="absolute left-[148px] top-[100px] h-1 w-1 rounded-full bg-[#d8c77b]" />
        <div className="absolute bottom-4 left-10 h-12 w-20 rounded-t-full bg-[#07111d]" />
        <div className="absolute bottom-4 right-12 h-20 w-4 rounded-t-full bg-[#07111d]" />
      </div>

      <div className="absolute bottom-5 left-9 h-20 w-11 rounded-t-full border border-[#e6c56e]/30 bg-[#111923]">
        <div className="mx-auto mt-8 h-8 w-5 rounded-full bg-[#f3d675] shadow-[0_0_22px_rgba(243,214,117,0.55)]" />
        <div className="absolute -top-7 left-3 h-8 w-5 rounded-full border border-[#6b8f64]/40" />
      </div>

      <div className="absolute bottom-1 left-16 h-12 w-44 rotate-[-5deg] rounded-sm border border-[#b5a866]/30 bg-[#19251f]/70" />

      <div className="absolute bottom-8 right-8 h-28 w-24 rotate-[6deg] rounded-xl border border-white/10 bg-[#121b27] shadow-[0_22px_35px_rgba(0,0,0,0.35)]">
        {[0, 1, 2].map((item) => (
          <div key={item} className="mx-4 mt-4 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-[#87c86c]" aria-hidden="true" />
            <div className="h-1.5 flex-1 rounded-full bg-[#7d8b72]/40" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [userId, setUserId] = useState("");
  const [pin, setPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const result = await loginWithAssignedPin(userId, pin);

      if (result.error || !result.user) {
        setError(result.error ?? "Invalid user ID or PIN.");
        return;
      }

      onLogin(result.user);
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Could not validate login. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-dvh overflow-y-auto bg-[#05080d] text-zinc-50">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_50%_8%,rgba(41,103,98,0.22),transparent_28%),radial-gradient(circle_at_50%_72%,rgba(28,72,98,0.18),transparent_34%),linear-gradient(180deg,#07111d_0%,#05080d_48%,#04070b_100%)]" />

      <div className="relative mx-auto flex min-h-dvh w-full max-w-md flex-col px-6 pb-8 pt-[calc(34px+env(safe-area-inset-top))]">
        <section className="flex flex-col items-center text-center">
          <CalendarCheck className="h-16 w-16 text-[#67c653]" strokeWidth={2.2} aria-hidden="true" />
          <h1 className="mt-5 text-4xl font-semibold tracking-tight text-white">Yawm Checklist</h1>
          <p className="mt-4 text-2xl font-medium text-zinc-400">Welcome back</p>
        </section>

        <section className="mt-8">
          <Illustration />
        </section>

        <form
          onSubmit={handleSubmit}
          className="mt-7 rounded-[26px] border border-white/12 bg-[#0d1722]/82 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_30px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl"
        >
          <label className="flex min-h-14 items-center gap-4 rounded-2xl border border-white/10 bg-[#101a25]/78 px-4">
            <User className="h-7 w-7 shrink-0 text-[#67c653]" strokeWidth={2.2} aria-hidden="true" />
            <input
              value={userId}
              onChange={(event) => setUserId(event.target.value)}
              className="min-w-0 flex-1 bg-transparent text-lg font-medium text-white outline-none placeholder:text-zinc-500"
              placeholder="User ID"
              autoCapitalize="none"
              autoComplete="username"
            />
          </label>

          <label className="mt-4 flex min-h-14 items-center gap-4 rounded-2xl border border-white/10 bg-[#101a25]/78 px-4">
            <LockKeyhole className="h-7 w-7 shrink-0 text-[#67c653]" strokeWidth={2.2} aria-hidden="true" />
            <input
              value={pin}
              onChange={(event) => setPin(event.target.value)}
              className="min-w-0 flex-1 bg-transparent text-lg font-medium text-white outline-none placeholder:text-zinc-500"
              placeholder="PIN Number"
              type={showPin ? "text" : "password"}
              inputMode="numeric"
              autoComplete="current-password"
            />
            <button type="button" onClick={() => setShowPin((current) => !current)} className="text-zinc-400">
              {showPin ? <EyeOff className="h-6 w-6" aria-hidden="true" /> : <Eye className="h-6 w-6" aria-hidden="true" />}
              <span className="sr-only">{showPin ? "Hide PIN" : "Show PIN"}</span>
            </button>
          </label>

          {error ? <p className="mt-3 text-sm font-medium text-red-300">{error}</p> : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-5 min-h-14 w-full rounded-2xl bg-[#58ad42] text-xl font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_16px_36px_rgba(72,157,62,0.22)] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? "Checking..." : "Login"}
          </button>

          <p className="mt-6 flex items-center justify-center gap-3 text-base font-medium text-zinc-400">
            <ShieldCheck className="h-5 w-5 text-[#67c653]" aria-hidden="true" />
            Use your assigned ID and PIN
          </p>
        </form>
      </div>
    </main>
  );
}
