"use client";

import { useEffect, useState } from "react";
import { BarChart3, ChevronDown, ChevronRight } from "lucide-react";
import { UserAvatar } from "@/components/UserAvatar";
import type { AppUser } from "@/lib/auth/assignedLogin";
import { fetchMonthlyReviewData, type ReviewDaySummary, type ReviewMonthSummary } from "@/lib/habits/review";
import { cn, getProgressColorClass, getProgressPercent } from "@/lib/utils";

const monthOptionFormatter = new Intl.DateTimeFormat("en-US", {
  month: "long",
  year: "numeric",
});

function getMonthStart(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function getPreviousMonthOptions(count = 12) {
  const currentMonth = getMonthStart(new Date());

  return Array.from({ length: count }, (_, index) => {
    const month = new Date(currentMonth);
    month.setMonth(currentMonth.getMonth() - index);

    return {
      key: `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, "0")}`,
      label: monthOptionFormatter.format(month),
      date: month,
      isCurrent: index === 0,
    };
  });
}

function ProgressLine({
  name,
  value,
  total,
  userCode,
  avatarUrl,
  warm,
}: {
  name: string;
  value: number;
  total: number;
  userCode?: string;
  avatarUrl?: string | null;
  warm?: boolean;
}) {
  const percent = getProgressPercent(value, total);
  const progressColor = warm ? "bg-[#e8d2b8]" : getProgressColorClass(value, total);

  return (
    <div className="grid grid-cols-[28px_1fr_40px] items-center gap-2">
      <div className="flex items-center">
        <UserAvatar
          name={name}
          userCode={userCode}
          avatarUrl={avatarUrl}
          tone="plain"
          size="sm"
          className={userCode === "hashim" ? "bg-[#334534]" : "bg-[#30384b]"}
        />
      </div>
      <div className="flex items-center gap-2">
        <span className="w-12 text-sm font-medium text-zinc-300 min-[390px]:w-14 min-[390px]:text-base">{name}</span>
        <div className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-zinc-700/40">
          <div
            className={cn("h-full rounded-full", progressColor)}
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>
      <span className="text-right text-sm font-medium text-zinc-200">{value}/{total}</span>
    </div>
  );
}

function ReviewDayCard({
  day,
  currentUser,
  partnerUser,
}: {
  day: ReviewDaySummary;
  currentUser: AppUser;
  partnerUser: AppUser;
}) {
  return (
    <div className="grid grid-cols-[56px_1fr_18px] items-center rounded-[17px] border border-white/10 bg-[#111722]/82 shadow-[inset_0_1px_0_rgba(255,255,255,0.035)] min-[390px]:grid-cols-[62px_1fr_20px]">
      <div className="flex min-h-[72px] flex-col justify-center border-r border-white/8 px-3">
        <p className="text-3xl font-semibold leading-none text-white">{day.day}</p>
        <p className={day.weekday === "Today" ? "mt-1.5 text-sm font-medium text-[#bedab6]" : "mt-1.5 text-sm font-medium text-zinc-500"}>
          {day.weekday}
        </p>
      </div>
      <div className="space-y-2 px-3 py-3">
        <ProgressLine
          name="Me"
          userCode={currentUser.userCode}
          avatarUrl={currentUser.avatarUrl}
          value={day.currentDone}
          total={day.total}
        />
        <ProgressLine
          name={partnerUser.displayName}
          userCode={partnerUser.userCode}
          avatarUrl={partnerUser.avatarUrl}
          value={day.partnerDone}
          total={day.total}
        />
      </div>
      <ChevronRight className="h-5 w-5 text-zinc-500" strokeWidth={2.5} aria-hidden="true" />
    </div>
  );
}

type ReviewScreenProps = {
  currentUser: AppUser;
};

export function ReviewScreen({ currentUser }: ReviewScreenProps) {
  const [selectedMonth, setSelectedMonth] = useState<Date>(() => getMonthStart(new Date()));
  const [isMonthMenuOpen, setIsMonthMenuOpen] = useState(false);
  const [reviewData, setReviewData] = useState<ReviewMonthSummary | null>(null);
  const [isLoadingReview, setIsLoadingReview] = useState(true);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const monthOptions = getPreviousMonthOptions();

  useEffect(() => {
    let isMounted = true;

    async function loadReview() {
      try {
        setIsLoadingReview(true);
        setReviewError(null);
        const data = await fetchMonthlyReviewData(currentUser, selectedMonth);

        if (isMounted) {
          setReviewData(data);
        }
      } catch (error) {
        if (isMounted) {
          setReviewError(error instanceof Error ? error.message : "Could not load review data. Please try again.");
        }
      } finally {
        if (isMounted) {
          setIsLoadingReview(false);
        }
      }
    }

    loadReview();

    return () => {
      isMounted = false;
    };
  }, [currentUser, selectedMonth]);

  const partnerName = reviewData?.partnerUser.displayName ?? "Hashim";
  const partnerUser = reviewData?.partnerUser;
  const resolvedCurrentUser = reviewData?.currentUser ?? currentUser;
  const currentTotalPossible = (reviewData?.currentDone ?? 0) + (reviewData?.currentMissed ?? 0);
  const partnerTotalPossible = (reviewData?.partnerDone ?? 0) + (reviewData?.partnerMissed ?? 0);

  return (
    <div className="space-y-4 pt-1">
      <header className="flex items-start justify-between gap-3">
        <h1 className="pt-3 text-3xl font-semibold leading-none tracking-tight text-white min-[390px]:text-4xl">Review</h1>
        <div className="relative text-right">
          <button
            type="button"
            onClick={() => setIsMonthMenuOpen((current) => !current)}
            className="flex min-h-10 items-center gap-2 rounded-xl border border-white/10 bg-[#111722]/82 px-3 text-base font-semibold text-zinc-100 min-[390px]:min-h-11"
            aria-expanded={isMonthMenuOpen}
            aria-label="Select review month"
          >
            {reviewData?.monthLabel ?? "This month"}
            <ChevronDown className="h-4 w-4 text-zinc-400" strokeWidth={2.5} aria-hidden="true" />
          </button>
          {reviewData?.hijriMonthLabel ? (
            <p className="mt-1.5 pr-1 text-xs font-medium text-zinc-600 min-[390px]:text-sm">
              {reviewData.hijriMonthLabel}
            </p>
          ) : null}
          {isMonthMenuOpen ? (
            <div className="absolute right-0 top-12 z-30 max-h-72 w-44 overflow-y-auto rounded-2xl border border-white/10 bg-[#111722] p-1.5 text-left shadow-[0_18px_50px_rgba(0,0,0,0.45)]">
              {monthOptions.map((month) => {
                const isSelected =
                  month.date.getFullYear() === selectedMonth.getFullYear() &&
                  month.date.getMonth() === selectedMonth.getMonth();

                return (
                  <button
                    key={month.key}
                    type="button"
                    onClick={() => {
                      setSelectedMonth(month.date);
                      setIsMonthMenuOpen(false);
                    }}
                    className={
                      isSelected
                        ? "flex w-full items-center gap-2 rounded-xl bg-[#58ad42] px-3 py-2 text-sm font-semibold text-white"
                        : "flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-zinc-300 hover:bg-white/5"
                    }
                  >
                    <span className={month.isCurrent ? "h-1.5 w-1.5 shrink-0 rounded-full bg-[#8be184]" : "h-1.5 w-1.5 shrink-0"} />
                    <span>{month.label}</span>
                  </button>
                );
              })}
            </div>
          ) : null}
        </div>
      </header>

      {isLoadingReview ? (
        <p className="rounded-[14px] border border-white/10 bg-[#111722]/70 px-3 py-2 text-sm text-zinc-400">
          Loading review...
        </p>
      ) : null}
      {reviewError ? (
        <p className="rounded-[14px] border border-red-300/15 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {reviewError}
        </p>
      ) : null}

      <section className="rounded-[18px] border border-white/10 bg-[#111722]/82 p-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.035)]">
        <div className="mb-3 flex items-center gap-2 text-zinc-500">
          <BarChart3 className="h-4 w-4" aria-hidden="true" />
          <p className="text-sm font-medium min-[390px]:text-base">This month</p>
        </div>

        <div className="grid grid-cols-[1fr_1px_1fr] gap-3">
          <div>
            <div className="mb-3 flex items-center gap-2.5">
              <UserAvatar
                name="Me"
                userCode={resolvedCurrentUser.userCode}
                avatarUrl={resolvedCurrentUser.avatarUrl}
                tone="plain"
                size="md"
                className="bg-[#30384b]"
              />
              <p className="text-lg font-semibold text-white min-[390px]:text-xl">Me</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-lg font-semibold text-[#bedab6] min-[390px]:text-xl">
                  {reviewData?.currentDone ?? 0}<span className="text-zinc-500">/{currentTotalPossible}</span>
                </p>
                <p className="text-xs text-zinc-500 min-[390px]:text-sm">Done</p>
              </div>
              <div>
                <p className="text-lg font-semibold text-[#d59699] min-[390px]:text-xl">{reviewData?.currentMissed ?? 0}</p>
                <p className="text-xs text-zinc-500 min-[390px]:text-sm">Missed</p>
              </div>
            </div>
          </div>

          <div className="bg-white/10" />

          <div>
            <div className="mb-3 flex items-center gap-2.5">
              <UserAvatar
                name={partnerName}
                userCode={partnerUser?.userCode}
                avatarUrl={partnerUser?.avatarUrl}
                tone="plain"
                size="md"
                className={partnerUser?.userCode === "hashim" ? "bg-[#334534]" : "bg-[#30384b]"}
              />
              <p className="text-lg font-semibold text-white min-[390px]:text-xl">{partnerName}</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-lg font-semibold text-[#bedab6] min-[390px]:text-xl">
                  {reviewData?.partnerDone ?? 0}<span className="text-zinc-500">/{partnerTotalPossible}</span>
                </p>
                <p className="text-xs text-zinc-500 min-[390px]:text-sm">Done</p>
              </div>
              <div>
                <p className="text-lg font-semibold text-[#d59699] min-[390px]:text-xl">{reviewData?.partnerMissed ?? 0}</p>
                <p className="text-xs text-zinc-500 min-[390px]:text-sm">Missed</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-2.5">
        {(reviewData?.days ?? []).map((day) => (
          <ReviewDayCard
            key={day.date}
            day={day}
            currentUser={resolvedCurrentUser}
            partnerUser={reviewData?.partnerUser ?? {
              id: "",
              userCode: "hashim",
              displayName: "Hashim",
              role: "partner",
              avatarUrl: null,
            }}
          />
        ))}
      </section>
    </div>
  );
}
