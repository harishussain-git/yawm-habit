import { fetchActiveAppUsers } from "@/lib/auth/appUsers";
import type { AppUser } from "@/lib/auth/assignedLogin";
import { getDateKey } from "@/lib/date/dateUtils";
import { formatHijriMonthYear } from "@/lib/date/hijriDate";
import { fetchActiveHabits } from "@/lib/habits/habits";
import { supabase } from "@/lib/supabase/client";

export type ReviewDaySummary = {
  date: string;
  day: string;
  weekday: string;
  currentDone: number;
  partnerDone: number;
  total: number;
};

export type ReviewMonthSummary = {
  monthLabel: string;
  hijriMonthLabel: string;
  currentUser: AppUser;
  partnerUser: AppUser;
  habitCount: number;
  daysShown: number;
  currentDone: number;
  currentMissed: number;
  partnerDone: number;
  partnerMissed: number;
  days: ReviewDaySummary[];
};

type DailyCheckRow = {
  user_id: string;
  habit_id: string;
  date: string;
  checked: boolean | null;
  status: "yes" | "no" | null;
};

const monthFormatter = new Intl.DateTimeFormat("en-US", {
  month: "long",
  year: "numeric",
});

const weekdayFormatter = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
});

function getMonthBounds(monthDate: Date) {
  const start = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
  const end = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);
  const today = new Date();
  const isCurrentMonth =
    today.getFullYear() === monthDate.getFullYear() && today.getMonth() === monthDate.getMonth();
  const isFutureMonth =
    monthDate.getFullYear() > today.getFullYear() ||
    (monthDate.getFullYear() === today.getFullYear() && monthDate.getMonth() > today.getMonth());
  const endToShow = isFutureMonth ? new Date(start.getFullYear(), start.getMonth(), 0) : isCurrentMonth ? today : end;

  return {
    start,
    end: endToShow,
    startKey: getDateKey(start),
    endKey: getDateKey(endToShow),
  };
}

function buildDateList(start: Date, end: Date) {
  const dates: Date[] = [];

  if (end < start) {
    return dates;
  }

  const current = new Date(end);

  while (current >= start) {
    dates.push(new Date(current));
    current.setDate(current.getDate() - 1);
  }

  return dates;
}

function isDone(check: DailyCheckRow) {
  return check.status === "yes" || (check.status === null && check.checked === true);
}

function countChecked(checks: DailyCheckRow[], userId: string, date: string, activeHabitIds: Set<string>) {
  return checks.filter((check) => {
    if (check.user_id !== userId || check.date !== date || !activeHabitIds.has(check.habit_id)) {
      return false;
    }

    return isDone(check);
  }).length;
}

export async function fetchMonthlyReviewData(
  currentUser: AppUser,
  monthDate = new Date(),
): Promise<ReviewMonthSummary> {
  const { start, end, startKey, endKey } = getMonthBounds(monthDate);
  const [habits, users] = await Promise.all([fetchActiveHabits(), fetchActiveAppUsers()]);
  const resolvedCurrentUser = users.find((user) => user.userCode === currentUser.userCode) ?? currentUser;
  const partnerUserCode = resolvedCurrentUser.userCode === "hashim" ? "haris" : "hashim";
  const partnerUser = users.find((user) => user.userCode === partnerUserCode);

  if (!partnerUser) {
    throw new Error("Could not load partner user. Please try again.");
  }

  const userIds = [resolvedCurrentUser.id, partnerUser.id];
  const activeHabitIds = new Set(habits.map((habit) => habit.id));
  const { data, error } = await supabase
    .from("daily_habit_checks")
    .select("user_id,habit_id,date,checked,status")
    .in("user_id", userIds)
    .gte("date", startKey)
    .lte("date", endKey);

  if (error) {
    console.error("Monthly review fetch failed", {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
    });
    throw new Error("Could not load review data. Please try again.");
  }

  const checks = (data ?? []) as DailyCheckRow[];
  const dates = buildDateList(start, end);
  const habitCount = habits.length;
  const days = dates.map((date) => {
    const dateKey = getDateKey(date);
    const isToday = dateKey === getDateKey(new Date());

    return {
      date: dateKey,
      day: String(date.getDate()),
      weekday: isToday ? "Today" : weekdayFormatter.format(date),
      currentDone: countChecked(checks, resolvedCurrentUser.id, dateKey, activeHabitIds),
      partnerDone: countChecked(checks, partnerUser.id, dateKey, activeHabitIds),
      total: habitCount,
    };
  });

  const currentDone = days.reduce((total, day) => total + day.currentDone, 0);
  const partnerDone = days.reduce((total, day) => total + day.partnerDone, 0);
  const totalPossible = habitCount * days.length;

  return {
    monthLabel: monthFormatter.format(monthDate),
    hijriMonthLabel: formatHijriMonthYear(monthDate),
    currentUser: resolvedCurrentUser,
    partnerUser,
    habitCount,
    daysShown: days.length,
    currentDone,
    currentMissed: totalPossible - currentDone,
    partnerDone,
    partnerMissed: totalPossible - partnerDone,
    days,
  };
}
