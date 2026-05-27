import { supabase } from "@/lib/supabase/client";

export type Habit = {
  id: string;
  title: string;
  iconKey: string | null;
  sortOrder: number;
};

type HabitRow = {
  id: string;
  title: string;
  icon_key: string | null;
  sort_order: number;
};

export async function fetchActiveHabits(): Promise<Habit[]> {
  const { data, error } = await supabase
    .from("habits")
    .select("id,title,icon_key,sort_order")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) {
    throw new Error("Could not load habits. Please try again.");
  }

  return ((data ?? []) as HabitRow[]).map((habit) => ({
    id: habit.id,
    title: habit.title,
    iconKey: habit.icon_key,
    sortOrder: habit.sort_order,
  }));
}
