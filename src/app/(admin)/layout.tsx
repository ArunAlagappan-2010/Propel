import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/roles";
import { createClient } from "@/lib/supabase/server";
import { DashboardShell } from "@/components/dashboard/shell";
import type { NavItem } from "@/components/dashboard/nav";

const adminNavItems: NavItem[] = [
  { href: "/admin", label: "Overview", icon: "overview" },
  { href: "/admin/portfolio", label: "Portfolio", icon: "portfolio" },
  { href: "/admin/students", label: "Students", icon: "students" },
  { href: "/admin/schedule", label: "Schedule", icon: "sessions" },
  { href: "/admin/statistics", label: "Statistics", icon: "statistics" },
  { href: "/admin/mentors", label: "Mentors", icon: "mentors" },
  { href: "/admin/chats", label: "Chats", icon: "chat" },
];

async function signOut() {
  "use server";
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // proxy.ts already redirects non-admins; this is defense in depth.
  const session = await requireRole(["admin"]);

  return (
    <DashboardShell
      items={adminNavItems}
      userName={session.profile.full_name || (session.email ?? "Admin")}
      roleLabel="admin"
      signOutAction={signOut}
    >
      {children}
    </DashboardShell>
  );
}
