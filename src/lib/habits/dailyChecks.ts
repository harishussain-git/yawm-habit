import { supabase } from "@/lib/supabase/client";

export type DailyHabitCheck = {
  habitId: string;
  status: HabitStatus;
};

export type HabitStatus = "yes" | "no" | null;

type DailyHabitCheckRow = {
  habit_id: string;
  status: "yes" | "no" | null;
  checked: boolean | null;
  checked_at: string | null;
};

type FetchDailyHabitChecksParams = {
  userId: string;
  date: string;
};

type UpsertDailyHabitStatusParams = {
  userId: string;
  habitId: string;
  date: string;
  status: HabitStatus;
};

export function getTodayDateKey() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export async function fetchDailyHabitChecks({
  userId,
  date,
}: FetchDailyHabitChecksParams): Promise<DailyHabitCheck[]> {
  const { data, error } = await supabase
    .from("daily_habit_checks")
    .select("habit_id,status,checked,checked_at")
    .eq("user_id", userId)
    .eq("date", date);

  if (error) {
    throw new Error("Could not load today's checks. Please try again.");
  }

  return ((data ?? []) as DailyHabitCheckRow[]).map((check) => ({
    habitId: check.habit_id,
    status: normalizeHabitStatus(check),
  }));
}

function normalizeHabitStatus(check: DailyHabitCheckRow): HabitStatus {
  if (check.status === "yes" || check.status === "no") {
    return check.status;
  }

  if (check.checked === true) {
    return "yes";
  }

  return null;
}

export async function upsertDailyHabitStatus({
  userId,
  habitId,
  date,
  status,
}: UpsertDailyHabitStatusParams) {
  const now = new Date().toISOString();
  const payload = {
    user_id: userId,
    habit_id: habitId,
    date,
    status,
    checked: status === "yes",
    checked_at: status === "yes" ? now : null,
    updated_at: now,
  };
  const { error } = await supabase.from("daily_habit_checks").upsert(
    payload,
    {
      onConflict: "user_id,habit_id,date",
    },
  );

  if (error) {
    console.error("Daily habit status save failed", {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
      payload: {
        userId,
        habitId,
        date,
        status,
      },
    });
    throw new Error("Could not save status. Please try again.");
  }
}

export async function upsertDailyHabitCheck({
  userId,
  habitId,
  date,
  checked,
}: {
  userId: string;
  habitId: string;
  date: string;
  checked: boolean;
}) {
  return upsertDailyHabitStatus({
    userId,
    habitId,
    date,
    status: checked ? "yes" : "no",
  });
}
