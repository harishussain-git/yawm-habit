import { supabase } from "@/lib/supabase/client";

export type AppUser = {
  id: string;
  userCode: string;
  displayName: string;
  role: "me" | "partner";
  avatarUrl: string | null;
};

type AppUserRow = {
  id: string;
  user_code: string;
  display_name: string;
  role: "me" | "partner";
  avatar_url: string | null;
};

type AssignedLoginResult = {
  user: AppUser | null;
  error: string | null;
};

export async function loginWithAssignedPin(userCode: string, pin: string): Promise<AssignedLoginResult> {
  const normalizedUserCode = userCode.trim().toLowerCase();

  if (!normalizedUserCode || !pin) {
    return {
      user: null,
      error: "Enter your assigned ID and PIN.",
    };
  }

  const { data, error } = await supabase
    .from("app_users")
    .select("id,user_code,display_name,role,avatar_url")
    .eq("user_code", normalizedUserCode)
    .eq("pin", pin)
    .eq("is_active", true)
    .maybeSingle();

  if (error) {
    return {
      user: null,
      error: "Could not validate login. Please try again.",
    };
  }

  if (!data) {
    return {
      user: null,
      error: "Invalid user ID or PIN.",
    };
  }

  const user = data as AppUserRow;

  return {
    user: {
      id: user.id,
      userCode: user.user_code,
      displayName: user.display_name,
      role: user.role,
      avatarUrl: user.avatar_url,
    },
    error: null,
  };
}
