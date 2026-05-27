"use client";

import { useEffect, useState } from "react";
import {
  BookOpen,
  ClipboardCheck,
  ChevronLeft,
  ChevronRight,
  Dumbbell,
  Landmark,
  Sun,
  Sunrise,
} from "lucide-react";
import { UserAvatar } from "@/components/UserAvatar";
import { fetchActiveAppUsers } from "@/lib/auth/appUsers";
import type { AppUser } from "@/lib/auth/assignedLogin";
import {
  fetchDailyHabitChecks,
  getTodayDateKey,
  type HabitStatus,
  upsertDailyHabitStatus,
} from "@/lib/habits/dailyChecks";
import { fetchActiveHabits, type Habit } from "@/lib/habits/habits";
import { fetchActiveRememberItems, type RememberItem } from "@/lib/remember/rememberItems";
import { cn } from "@/lib/utils";

const iconMap = {
  sunrise: { icon: Sunrise, color: "text-[#5bd269]" },
  masjid: { icon: Landmark, color: "text-[#5bd269]" },
  sun: { icon: Sun, color: "text-[#f6c653]" },
  book: { icon: BookOpen, color: "text-[#61bfff]" },
  walk: { icon: Dumbbell, color: "text-[#9d68ff]" },
  gym: { icon: Dumbbell, color: "text-[#9d68ff]" },
} as const;

function getHabitIcon(iconKey: string | null) {
  return iconKey && iconKey in iconMap ? iconMap[iconKey as keyof typeof iconMap] : { icon: ClipboardCheck, color: "text-[#8be184]" };
}

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

function ScoreCard({
  name,
  score,
  tone,
  userCode,
  avatarUrl,
}: {
  name: string;
  score: string;
  tone: "me" | "hashim";
  userCode?: string;
  avatarUrl?: string | null;
}) {
  const isMe = tone === "me";

  return (
    <div className="rounded-[18px] border border-white/10 bg-[#101a25]/82 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
      <div className="flex items-center gap-2.5">
        <UserAvatar name={name} userCode={userCode} avatarUrl={avatarUrl} tone={tone} size="md" />
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

function ChecklistItem({
  item,
  myStatus,
  partnerName,
  partnerUserCode,
  partnerAvatarUrl,
  partnerStatus,
  onSetMyStatus,
}: {
  item: Habit;
  myStatus: HabitStatus;
  partnerName: string;
  partnerUserCode: string;
  partnerAvatarUrl?: string | null;
  partnerStatus: HabitStatus;
  onSetMyStatus: (status: Exclude<HabitStatus, null>) => void;
}) {
  const { icon: Icon, color } = getHabitIcon(item.iconKey);

  return (
    <div className="rounded-[17px] border border-white/10 bg-[#101a25]/86 px-3.5 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.035)]">
      <div className="flex items-center gap-3">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#0b1520]/60">
          <Icon className={`h-6 w-6 ${color}`} strokeWidth={2.2} aria-hidden="true" />
        </div>
        <p className="min-w-0 flex-1 truncate text-sm font-medium leading-snug text-zinc-100 min-[390px]:text-base">
          {item.title}
        </p>
        <div className="flex shrink-0 gap-1.5">
          <StatusButton status="yes" selected={myStatus === "yes"} onClick={() => onSetMyStatus("yes")} />
          <StatusButton status="no" selected={myStatus === "no"} onClick={() => onSetMyStatus("no")} />
        </div>
      </div>

      <div className="my-3 h-px bg-white/10" />

      <div className="flex items-center gap-3">
        <UserAvatar
          name={partnerName}
          userCode={partnerUserCode}
          avatarUrl={partnerAvatarUrl}
          tone={partnerUserCode === "hashim" ? "hashim" : "me"}
          size="sm"
        />
        <p className="min-w-0 flex-1 text-sm font-medium text-zinc-100 min-[390px]:text-base">{partnerName}</p>
        <PartnerStatusText status={partnerStatus} />
      </div>
    </div>
  );
}

function StatusButton({
  status,
  selected,
  onClick,
}: {
  status: "yes" | "no";
  selected: boolean;
  onClick: () => void;
}) {
  const isYes = status === "yes";

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "h-9 w-[58px] rounded-xl border text-sm font-semibold transition-colors min-[390px]:w-16",
        selected && isYes
          ? "border-[#63d66a] bg-[#58ad42] text-white"
          : selected
            ? "border-[#ff6b66] bg-[#b83e3a] text-white"
            : isYes
              ? "border-[#63d66a]/45 bg-[#1b332a]/55 text-[#9ee6a1]"
              : "border-[#ff6b66]/45 bg-[#3a2026]/55 text-[#ff918d]",
      )}
    >
      {isYes ? "Yes" : "No"}
    </button>
  );
}

function PartnerStatusText({ status }: { status: HabitStatus }) {
  if (status === "yes") {
    return <span className="text-sm font-semibold text-[#8be184] min-[390px]:text-base">Yes</span>;
  }

  if (status === "no") {
    return <span className="text-sm font-semibold text-[#ff7e78] min-[390px]:text-base">No</span>;
  }

  return <span className="text-sm font-semibold text-zinc-500 min-[390px]:text-base">—</span>;
}

function RememberCard({ item }: { item: RememberItem }) {
  return (
    <div className="flex items-center gap-3 rounded-[15px] border border-white/10 bg-[#101a25]/72 px-3.5 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.025)]">
      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#8be184]" />
      <p className="min-w-0 flex-1 text-sm font-medium leading-snug text-zinc-200 min-[390px]:text-base">
        {item.title}
      </p>
    </div>
  );
}

function toStatusMap(checks: { habitId: string; status: HabitStatus }[]) {
  return checks.reduce<Record<string, HabitStatus>>((statuses, check) => {
    statuses[check.habitId] = check.status;
    return statuses;
  }, {});
}

type DailyScreenProps = {
  currentUser: AppUser;
  onAvatarClick: () => void;
};

export function DailyScreen({ currentUser, onAvatarClick }: DailyScreenProps) {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [rememberItems, setRememberItems] = useState<RememberItem[]>([]);
  const [partnerUser, setPartnerUser] = useState<AppUser | null>(null);
  const [isLoadingHabits, setIsLoadingHabits] = useState(true);
  const [habitsError, setHabitsError] = useState<string | null>(null);
  const [rememberError, setRememberError] = useState<string | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [myStatuses, setMyStatuses] = useState<Record<string, HabitStatus>>({});
  const [partnerStatuses, setPartnerStatuses] = useState<Record<string, HabitStatus>>({});
  const [selectedDateKey] = useState(() => getTodayDateKey());

  const partnerUserCode = partnerUser?.userCode ?? (currentUser.userCode === "hashim" ? "haris" : "hashim");
  const partnerName = partnerUser?.displayName ?? (currentUser.userCode === "hashim" ? "Haris" : "Hashim");
  const currentScore = `${habits.filter((habit) => myStatuses[habit.id] === "yes").length}/${habits.length || 0}`;
  const partnerScore = `${habits.filter((habit) => partnerStatuses[habit.id] === "yes").length}/${habits.length || 0}`;

  useEffect(() => {
    let isMounted = true;

    async function loadHabits() {
      try {
        setIsLoadingHabits(true);
        setHabitsError(null);
        setRememberError(null);
        setStatusError(null);

        const [habitsResult, rememberResult, usersResult, myChecksResult] = await Promise.allSettled([
          fetchActiveHabits(),
          fetchActiveRememberItems(),
          fetchActiveAppUsers(),
          fetchDailyHabitChecks({ userId: currentUser.id, date: selectedDateKey }),
        ]);

        if (isMounted) {
          if (habitsResult.status === "fulfilled") {
            setHabits(habitsResult.value);
          } else {
            setHabitsError(habitsResult.reason instanceof Error ? habitsResult.reason.message : "Could not load habits. Please try again.");
          }

          if (rememberResult.status === "fulfilled") {
            setRememberItems(rememberResult.value);
          } else {
            setRememberError(rememberResult.reason instanceof Error ? rememberResult.reason.message : "Could not load remember items. Please try again.");
          }

          if (usersResult.status === "fulfilled") {
            const loadedPartnerUser = usersResult.value.find((user) => user.id !== currentUser.id) ?? null;
            setPartnerUser(loadedPartnerUser);

            if (loadedPartnerUser) {
              try {
                const partnerChecks = await fetchDailyHabitChecks({ userId: loadedPartnerUser.id, date: selectedDateKey });

                if (isMounted) {
                  setPartnerStatuses(toStatusMap(partnerChecks));
                }
              } catch (error) {
                if (isMounted) {
                  setStatusError(error instanceof Error ? error.message : "Could not load partner status. Please try again.");
                }
              }
            }
          } else {
            setStatusError(usersResult.reason instanceof Error ? usersResult.reason.message : "Could not load users. Please try again.");
          }

          if (myChecksResult.status === "fulfilled") {
            setMyStatuses(toStatusMap(myChecksResult.value));
          } else {
            setStatusError(myChecksResult.reason instanceof Error ? myChecksResult.reason.message : "Could not load today's checks. Please try again.");
          }
        }
      } catch (error) {
        if (isMounted) {
          setHabitsError(error instanceof Error ? error.message : "Could not load habits. Please try again.");
          setRememberError(error instanceof Error ? error.message : "Could not load remember items. Please try again.");
        }
      } finally {
        if (isMounted) {
          setIsLoadingHabits(false);
        }
      }
    }

    loadHabits();

    return () => {
      isMounted = false;
    };
  }, [currentUser.id, selectedDateKey]);

  async function setMyHabitStatus(habitId: string, status: Exclude<HabitStatus, null>) {
    if (myStatuses[habitId] === status) {
      return;
    }

    const previousStatus = myStatuses[habitId] ?? null;
    setStatusError(null);
    setMyStatuses((current) => ({
      ...current,
      [habitId]: status,
    }));

    try {
      await upsertDailyHabitStatus({
        userId: currentUser.id,
        habitId,
        date: selectedDateKey,
        status,
      });
    } catch (error) {
      setMyStatuses((current) => ({
        ...current,
        [habitId]: previousStatus,
      }));
      setStatusError(error instanceof Error ? error.message : "Could not save status. Please try again.");
    }
  }

  return (
    <div className="space-y-4">
      <header className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-zinc-400 min-[390px]:text-base">Assalamu alaikum,</p>
          <h1 className="mt-2 text-3xl font-semibold leading-none tracking-tight text-white">{currentUser.displayName}</h1>
        </div>
        <button type="button" onClick={onAvatarClick} className="rounded-full" aria-label="Open account options">
          <UserAvatar
            name={currentUser.displayName}
            userCode={currentUser.userCode}
            avatarUrl={currentUser.avatarUrl}
            tone={currentUser.userCode === "hashim" ? "hashim" : "me"}
            size="lg"
          />
        </button>
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
        <ScoreCard
          name="Me"
          score={currentScore}
          tone="me"
          userCode={currentUser.userCode}
          avatarUrl={currentUser.avatarUrl}
        />
        <ScoreCard
          name={partnerName}
          score={partnerScore}
          tone={partnerUserCode === "hashim" ? "hashim" : "me"}
          userCode={partnerUserCode}
        />
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold tracking-tight text-white">Checklist</h2>
        {isLoadingHabits ? (
          <p className="rounded-[14px] border border-white/10 bg-[#101a25]/70 px-3 py-2 text-sm text-zinc-400">
            Loading habits...
          </p>
        ) : null}
        {habitsError ? (
          <p className="rounded-[14px] border border-red-300/15 bg-red-500/10 px-3 py-2 text-sm text-red-200">
            {habitsError}
          </p>
        ) : null}
        {statusError ? (
          <p className="rounded-[14px] border border-red-300/15 bg-red-500/10 px-3 py-2 text-sm text-red-200">
            {statusError}
          </p>
        ) : null}
        <div className="space-y-2.5">
          {habits.map((item) => (
            <ChecklistItem
              key={item.id}
              item={item}
              myStatus={myStatuses[item.id] ?? null}
              partnerName={partnerName}
              partnerUserCode={partnerUserCode}
              partnerAvatarUrl={partnerUser?.avatarUrl}
              partnerStatus={partnerStatuses[item.id] ?? null}
              onSetMyStatus={(status) => setMyHabitStatus(item.id, status)}
            />
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold tracking-tight text-white">Remember</h2>
        {rememberError ? (
          <p className="rounded-[14px] border border-amber-300/15 bg-amber-500/10 px-3 py-2 text-sm text-amber-100">
            {rememberError}
          </p>
        ) : null}
        <div className="space-y-2.5">
          {rememberItems.map((item) => (
            <RememberCard key={item.id} item={item} />
          ))}
        </div>
      </section>
    </div>
  );
}
