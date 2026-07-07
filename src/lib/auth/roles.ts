import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type UserRole = "student" | "mentor" | "admin";

export type Profile = {
  id: string;
  full_name: string;
  role: UserRole;
  school_name: string | null;
  grade: number | null;
  phone: string | null;
  bio: string | null;
  avatar_url: string | null;
  timezone: string;
  created_at: string;
};

/** Current user's profile, or null when signed out. */
export async function getSessionProfile(): Promise<{
  userId: string;
  email: string | null;
  profile: Profile;
} | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "id, full_name, role, school_name, grade, phone, bio, avatar_url, timezone, created_at"
    )
    .eq("id", user.id)
    .single();
  if (!profile) return null;

  return { userId: user.id, email: user.email ?? null, profile };
}

/**
 * Gate a server page/action by role. Redirects instead of throwing:
 * signed out → /login, wrong role → /dashboard.
 */
export async function requireRole(roles: UserRole[]) {
  const session = await getSessionProfile();
  if (!session) redirect("/login");
  if (!roles.includes(session.profile.role)) redirect("/dashboard");
  return session;
}
