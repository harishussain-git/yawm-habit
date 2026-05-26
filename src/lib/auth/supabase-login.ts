import { supabase } from "@/lib/supabase/client";

export type AssignedUser = {
  id: string;
  name: string;
  role: "me" | "partner";
};

type AssignedUserRow = {
  user_id: string;
  name: string;
  role: "me" | "partner" | null;
};

export async function validateAssignedLogin(userId: string, pin: string): Promise<AssignedUser | null> {
  const normalizedId = userId.trim().toLowerCase();

  if (!normalizedId || !pin) {
    return null;
  }

  const { data, error } = await supabase
    .from("app_users")
    .select("user_id,name,role")
    .eq("user_id", normalizedId)
    .eq("pin", pin)
    .eq("is_active", true)
    .maybeSingle();

  if (error) {
    throw new Error("Could not validate login. Please try again.");
  }

  if (!data) {
    return null;
  }

  const user = data as AssignedUserRow;

  return {
    id: user.user_id,
    name: user.name,
    role: user.role ?? "partner",
  };
}
