import { supabase } from "@/lib/supabase/client";
import type { Habit } from "@/types/app";

type HabitRow = {
  id: string | number;
  title: string | null;
  category: string | null;
};

export async function fetchActiveHabits(): Promise<Habit[]> {
  const { data, error } = await supabase
    .from("habits")
    .select("id,title,category")
    .eq("is_active", true);

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as HabitRow[])
    .filter((habit) => habit.id !== null && habit.title)
    .map((habit) => ({
      id: String(habit.id),
      title: habit.title ?? "Untitled habit",
      category: habit.category ?? "Other",
    }));
}
