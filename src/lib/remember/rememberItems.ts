import { supabase } from "@/lib/supabase/client";

export type RememberItem = {
  id: string;
  title: string;
  sortOrder: number;
};

type RememberItemRow = {
  id: string;
  title: string;
  sort_order: number;
};

export async function fetchActiveRememberItems(): Promise<RememberItem[]> {
  const { data, error } = await supabase
    .from("remember_items")
    .select("id,title,sort_order")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) {
    throw new Error("Could not load remember items. Please try again.");
  }

  return ((data ?? []) as RememberItemRow[]).map((item) => ({
    id: item.id,
    title: item.title,
    sortOrder: item.sort_order,
  }));
}
