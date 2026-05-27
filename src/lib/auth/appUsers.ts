import { supabase } from "@/lib/supabase/client";
import type { AppUser } from "@/lib/auth/assignedLogin";

type AppUserRow = {
  id: string;
  user_code: string;
  display_name: string;
  role: "me" | "partner";
  avatar_url: string | null;
};

export async function fetchActiveAppUsers(): Promise<AppUser[]> {
  const { data, error } = await supabase
    .from("app_users")
    .select("id,user_code,display_name,role,avatar_url")
    .eq("is_active", true);

  if (error) {
    throw new Error("Could not load users. Please try again.");
  }

  return ((data ?? []) as AppUserRow[]).map((user) => ({
    id: user.id,
    userCode: user.user_code,
    displayName: user.display_name,
    role: user.role,
    avatarUrl: user.avatar_url,
  }));
}
