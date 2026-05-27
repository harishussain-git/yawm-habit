import { fetchActiveAppUsers } from "@/lib/auth/appUsers";
import type { AppUser } from "@/lib/auth/assignedLogin";
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
  weekday: "long",
});

function formatDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getMonthBounds(monthDate: Date) {
  const start = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
  const end = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);
  const today = new Date();
  const isCurrentMonth =
    today.getFullYear() === monthDate.getFullYear() && today.getMonth() === monthDate.getMonth();
  const endToShow = isCurrentMonth ? today : end;

  return {
    start,
    end: endToShow,
    startKey: formatDateKey(start),
    endKey: formatDateKey(endToShow),
  };
}

function buildDateList(start: Date, end: Date) {
  const dates: Date[] = [];
  const current = new Date(end);

  while (current >= start) {
    dates.push(new Date(current));
    current.setDate(current.getDate() - 1);
  }

  return dates;
}

function countChecked(checks: DailyCheckRow[], userId: string, date: string) {
  return checks.filter((check) => {
    if (check.user_id !== userId || check.date !== date) {
      return false;
    }

    if (check.status === "yes") {
      return true;
    }

    if (check.status === "no") {
      return false;
    }

    return check.checked === true;
  }).length;
}

export async function fetchMonthlyReviewData(
  currentUser: AppUser,
  monthDate = new Date(),
): Promise<ReviewMonthSummary> {
  const { start, end, startKey, endKey } = getMonthBounds(monthDate);
  const [habits, users] = await Promise.all([fetchActiveHabits(), fetchActiveAppUsers()]);
  const partnerUser = users.find((user) => user.id !== currentUser.id);

  if (!partnerUser) {
    throw new Error("Could not load partner user. Please try again.");
  }

  const userIds = [currentUser.id, partnerUser.id];
  const { data, error } = await supabase
    .from("daily_habit_checks")
    .select("user_id,habit_id,date,checked,status")
    .in("user_id", userIds)
    .gte("date", startKey)
    .lte("date", endKey);

  if (error) {
    throw new Error("Could not load review data. Please try again.");
  }

  const checks = (data ?? []) as DailyCheckRow[];
  const dates = buildDateList(start, end);
  const habitCount = habits.length;
  const days = dates.map((date) => {
    const dateKey = formatDateKey(date);
    const isToday = dateKey === formatDateKey(new Date());

    return {
      date: dateKey,
      day: String(date.getDate()),
      weekday: isToday ? "Today" : weekdayFormatter.format(date),
      currentDone: countChecked(checks, currentUser.id, dateKey),
      partnerDone: countChecked(checks, partnerUser.id, dateKey),
      total: habitCount,
    };
  });

  const currentDone = days.reduce((total, day) => total + day.currentDone, 0);
  const partnerDone = days.reduce((total, day) => total + day.partnerDone, 0);
  const totalPossible = habitCount * days.length;

  return {
    monthLabel: monthFormatter.format(monthDate),
    hijriMonthLabel: "Dhul-Hijjah 1446",
    currentUser,
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
