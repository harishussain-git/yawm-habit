"use client";

import { useState } from "react";
import {
  BookOpen,
  Check,
  ChevronLeft,
  ChevronRight,
  Dumbbell,
  Landmark,
  Sun,
  Sunrise,
  X,
} from "lucide-react";
import { UserAvatar } from "@/components/UserAvatar";
import { cn } from "@/lib/utils";

const checklistItems = [
  { id: "wake-before-fajr", label: "Wake before Fajr / Tahajjud", icon: Sunrise, color: "text-[#5bd269]" },
  { id: "fajr-masjid", label: "Fajr in masjid", icon: Landmark, color: "text-[#5bd269]" },
  { id: "dhuhr-masjid-1", label: "Dhuhr in masjid", icon: Sun, color: "text-[#f6c653]" },
  { id: "quran-hadith-1", label: "Qur'an & Hadith learning", icon: BookOpen, color: "text-[#61bfff]" },
  { id: "dhuhr-masjid-2", label: "Dhuhr in masjid", icon: Sun, color: "text-[#f6c653]" },
  { id: "quran-hadith-2", label: "Qur'an & Hadith learning", icon: BookOpen, color: "text-[#61bfff]" },
  { id: "walk-exercise", label: "Walk / exercise", icon: Dumbbell, color: "text-[#9d68ff]" },
];

function DateButton({ direction }: { direction: "previous" | "next" }) {
  const Icon = direction === "previous" ? ChevronLeft : ChevronRight;

  return (
    <button
      type="button"
      className="grid h-11 w-10 shrink-0 place-items-center rounded-[14px] border border-white/10 bg-[#101a25]/82 text-zinc-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] min-[390px]:h-12 min-[390px]:w-11"
    >
      <Icon className="h-5 w-5 min-[390px]:h-6 min-[390px]:w-6" strokeWidth={3} aria-hidden="true" />
      <span className="sr-only">{direction === "previous" ? "Previous day" : "Next day"}</span>
    </button>
  );
}

function ScoreCard({ name, score, tone }: { name: string; score: string; tone: "me" | "hashim" }) {
  const isMe = tone === "me";

  return (
    <div className="rounded-[18px] border border-white/10 bg-[#101a25]/82 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
      <div className="flex items-center gap-2.5">
        <UserAvatar name={name} tone={tone} size="md" />
        <div className="min-w-0">
          <p className="truncate text-base font-medium text-zinc-100 min-[390px]:text-lg">{name}</p>
          <p className={isMe ? "mt-0.5 text-base font-semibold text-[#ff5f58] min-[390px]:text-lg" : "mt-0.5 text-base font-semibold text-[#63d66a] min-[390px]:text-lg"}>
            {score}
          </p>
        </div>
      </div>
      <div className="ml-[50px] mt-3 h-1.5 overflow-hidden rounded-full bg-zinc-700/45 min-[390px]:ml-[54px]">
        <div className={isMe ? "h-full w-[40%] rounded-full bg-[#ff5f58]" : "h-full w-[70%] rounded-full bg-[#64c95d]"} />
      </div>
    </div>
  );
}

function StatusIcon({
  checked,
  square = false,
  bare = false,
  uncheckedTick = false,
}: {
  checked: boolean;
  square?: boolean;
  bare?: boolean;
  uncheckedTick?: boolean;
}) {
  const Icon = checked || uncheckedTick ? Check : X;

  if (bare) {
    return (
      <Icon
        className={cn("h-5 w-5", checked ? "text-[#8be184]" : "text-zinc-500")}
        strokeWidth={3}
        aria-hidden="true"
      />
    );
  }

  return (
    <span
      className={cn(
        "grid h-7 w-7 place-items-center border transition-colors",
        square ? "rounded-md" : "rounded-full",
        checked
          ? "border-[#69c85f]/70 bg-[#69c85f] text-white"
          : "border-white/15 bg-zinc-600/25 text-zinc-300/80",
      )}
    >
      <Icon className="h-4 w-4" strokeWidth={3} aria-hidden="true" />
    </span>
  );
}

function ChecklistItem({
  item,
  myChecked,
  hashimChecked,
  onToggleMyCheck,
}: {
  item: (typeof checklistItems)[number];
  myChecked: boolean;
  hashimChecked: boolean;
  onToggleMyCheck: () => void;
}) {
  const Icon = item.icon;

  return (
    <div className="rounded-[17px] border border-white/10 bg-[#101a25]/86 px-3.5 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.035)]">
      <div className="flex items-center gap-3">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#0b1520]/60">
          <Icon className={`h-6 w-6 ${item.color}`} strokeWidth={2.2} aria-hidden="true" />
        </div>
        <p className="min-w-0 flex-1 truncate text-sm font-medium leading-snug text-zinc-100 min-[390px]:text-base">
          {item.label}
        </p>
        <button
          type="button"
          onClick={onToggleMyCheck}
          className="rounded-md"
          aria-pressed={myChecked}
          aria-label={`Toggle ${item.label}`}
        >
          <StatusIcon checked={myChecked} square uncheckedTick />
        </button>
      </div>

      <div className="my-3 h-px bg-white/10" />

      <div className="flex items-center gap-3">
        <UserAvatar name="Hashim" tone="hashim" size="sm" />
        <p className="min-w-0 flex-1 text-sm font-medium text-zinc-100 min-[390px]:text-base">Hashim</p>
        <StatusIcon checked={hashimChecked} bare />
      </div>
    </div>
  );
}

type DailyScreenProps = {
  userName?: string;
};

export function DailyScreen({ userName = "Shafi" }: DailyScreenProps) {
  const [myChecks, setMyChecks] = useState<Record<string, boolean>>({
    "wake-before-fajr": true,
  });

  const hashimChecks: Record<string, boolean> = {
    "wake-before-fajr": true,
    "fajr-masjid": true,
    "dhuhr-masjid-1": false,
    "quran-hadith-1": true,
    "dhuhr-masjid-2": false,
    "quran-hadith-2": true,
    "walk-exercise": false,
  };

  function toggleMyCheck(habitId: string) {
    setMyChecks((current) => ({
      ...current,
      [habitId]: !current[habitId],
    }));
  }

  return (
    <div className="space-y-4">
      <header className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-zinc-400 min-[390px]:text-base">Assalamu alaikum,</p>
          <h1 className="mt-2 text-3xl font-semibold leading-none tracking-tight text-white">{userName}</h1>
        </div>
        <UserAvatar name="Shafi" tone="me" size="lg" />
      </header>

      <section className="flex items-center gap-2 pt-1">
        <DateButton direction="previous" />
        <div className="flex min-h-11 flex-1 flex-col items-center justify-center rounded-[14px] border border-white/10 bg-[#101a25]/82 px-2 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] min-[390px]:min-h-12">
          <p className="text-sm font-semibold leading-tight text-zinc-100 min-[390px]:text-base">Saturday, 25 May 2026</p>
          <p className="mt-0.5 text-xs font-medium text-zinc-500 min-[390px]:text-sm">8 Dhul-Hijjah 1447 AH</p>
        </div>
        <DateButton direction="next" />
      </section>

      <section className="grid grid-cols-2 gap-2.5">
        <ScoreCard name="Me" score="4/10" tone="me" />
        <ScoreCard name="Hashim" score="7/10" tone="hashim" />
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold tracking-tight text-white">Checklist</h2>
        <div className="space-y-2.5">
          {checklistItems.map((item) => (
            <ChecklistItem
              key={item.id}
              item={item}
              myChecked={Boolean(myChecks[item.id])}
              hashimChecked={Boolean(hashimChecks[item.id])}
              onToggleMyCheck={() => toggleMyCheck(item.id)}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
