"use client";

import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { cn } from "@/lib/utils";

const ONESIGNAL_APP_ID = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID;

type ReminderStatus = "idle" | "loading" | "granted" | "denied" | "unsupported";

type OneSignalApi = {
  init: (options: { appId: string; notifyButton: { enable: boolean } }) => Promise<void>;
  login?: (externalId: string) => Promise<void>;
  logout?: () => Promise<void>;
  Notifications?: {
    permission?: boolean;
    requestPermission?: () => Promise<boolean>;
  };
};

declare global {
  interface Window {
    OneSignalDeferred?: Array<(oneSignal: OneSignalApi) => void | Promise<void>>;
    __yawmOneSignalInitialized?: boolean;
    __yawmOneSignalExternalId?: string;
  }
}

function isPushSupported() {
  return (
    typeof window !== "undefined" &&
    "Notification" in window &&
    "serviceWorker" in navigator &&
    window.isSecureContext
  );
}

function getStatusLabel(status: ReminderStatus) {
  if (status === "granted") {
    return "Reminders are enabled.";
  }

  if (status === "denied") {
    return "Notifications are blocked in this browser.";
  }

  if (status === "unsupported") {
    return "Push reminders are not available here.";
  }

  return null;
}

async function initializeAndRequestPermission(currentUserId: string) {
  if (!ONESIGNAL_APP_ID) {
    return "unsupported" as const;
  }

  if (!isPushSupported()) {
    return "unsupported" as const;
  }

  return new Promise<Exclude<ReminderStatus, "idle" | "loading">>((resolve) => {
    window.OneSignalDeferred = window.OneSignalDeferred ?? [];
    window.OneSignalDeferred.push(async (OneSignal) => {
      try {
        if (!window.__yawmOneSignalInitialized) {
          await OneSignal.init({
            appId: ONESIGNAL_APP_ID,
            notifyButton: { enable: false },
          });
          window.__yawmOneSignalInitialized = true;
        }

        if (window.__yawmOneSignalExternalId !== currentUserId && typeof OneSignal.login === "function") {
          await OneSignal.login(currentUserId);
          window.__yawmOneSignalExternalId = currentUserId;
        }

        if (Notification.permission === "granted") {
          resolve("granted");
          return;
        }

        if (Notification.permission === "denied") {
          resolve("denied");
          return;
        }

        const permissionGranted =
          typeof OneSignal.Notifications?.requestPermission === "function"
            ? await OneSignal.Notifications.requestPermission()
            : (await Notification.requestPermission()) === "granted";
        const permissionAfterRequest = Notification.permission as NotificationPermission;

        resolve(permissionGranted ? "granted" : permissionAfterRequest === "denied" ? "denied" : "unsupported");
      } catch {
        resolve("unsupported");
      }
    });
  });
}

export function logoutOneSignal() {
  if (typeof window === "undefined") {
    return;
  }

  window.OneSignalDeferred = window.OneSignalDeferred ?? [];
  window.OneSignalDeferred.push(async (OneSignal) => {
    try {
      if (typeof OneSignal.logout === "function") {
        await OneSignal.logout();
      }
      window.__yawmOneSignalExternalId = undefined;
    } catch {
      // Logout should never block app logout.
    }
  });
}

export function isOneSignalReadyForPartnerNotify() {
  return (
    typeof window !== "undefined" &&
    window.__yawmOneSignalInitialized === true &&
    "Notification" in window &&
    Notification.permission === "granted"
  );
}

export function EnableReminders({ currentUserId }: { currentUserId: string }) {
  const [status, setStatus] = useState<ReminderStatus>("idle");
  const isConfigured = Boolean(ONESIGNAL_APP_ID);
  const isEnabled = status === "granted";
  const statusLabel = isConfigured ? getStatusLabel(status) : "Reminder setup is missing.";
  const isBusy = status === "loading";

  useEffect(() => {
    if (!isConfigured || typeof window === "undefined" || !("Notification" in window)) {
      return;
    }

    if (Notification.permission === "granted") {
      setStatus("granted");
    }

    if (Notification.permission === "denied") {
      setStatus("denied");
    }
  }, [isConfigured]);

  async function handleEnableReminders() {
    if (!isConfigured || isBusy) {
      return;
    }

    setStatus("loading");
    const nextStatus = await initializeAndRequestPermission(currentUserId);
    setStatus(nextStatus);
  }

  return (
    <section className="rounded-[20px] border border-white/10 bg-[#101a25]/74 px-4 py-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.035)]">
      <div className="flex items-center gap-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-2xl bg-[#16261f] text-[#83db76]">
          <Bell className="h-5 w-5" strokeWidth={2.1} aria-hidden="true" />
        </span>

        <div className="min-w-0 flex-1">
          <p className="text-base font-semibold text-zinc-100">Reminders</p>
          <p className="mt-0.5 text-xs leading-snug text-zinc-500">
            Get notified when your partner updates a habit.
          </p>
          {statusLabel ? (
            <p className={cn("mt-1.5 text-xs font-medium", isEnabled ? "text-[#8be184]" : "text-zinc-400")}>
              {isBusy ? "Checking permission..." : statusLabel}
            </p>
          ) : null}
        </div>

        <button
          type="button"
          onClick={handleEnableReminders}
          disabled={!isConfigured || isBusy}
          role="switch"
          aria-checked={isEnabled}
          aria-label="Enable reminders"
          className={cn(
            "relative h-7 w-12 shrink-0 rounded-full border transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-70",
            isEnabled
              ? "border-[#8be184]/50 bg-[#63c650]"
              : "border-white/10 bg-[#2a3440]",
          )}
        >
          <span
            className={cn(
              "absolute left-0.5 top-0.5 grid h-6 w-6 place-items-center rounded-full bg-white shadow-[0_2px_8px_rgba(0,0,0,0.25)] transition-transform duration-200",
              isEnabled ? "translate-x-5" : "translate-x-0",
            )}
          >
            {isBusy ? <span className="h-3 w-3 animate-spin rounded-full border-2 border-zinc-400 border-t-transparent" /> : null}
          </span>
          <span className="sr-only">
            {isBusy ? "Checking reminders" : isEnabled ? "Reminders enabled" : "Enable reminders"}
          </span>
        </button>
      </div>
    </section>
  );
}
