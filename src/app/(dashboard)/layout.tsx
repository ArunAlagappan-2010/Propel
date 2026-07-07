import { redirect } from "next/navigation";
import { getSessionProfile } from "@/lib/auth/roles";
import { createClient } from "@/lib/supabase/server";
import { DashboardShell } from "@/components/dashboard/shell";
import type { NavItem } from "@/components/dashboard/nav";

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Home", icon: "home" },
  { href: "/community", label: "My Community", icon: "community" },
  { href: "/projects", label: "Projects", icon: "projects" },
  { href: "/mentors", label: "Find Mentors", icon: "mentors" },
  { href: "/chat", label: "Chat", icon: "chat" },
  { href: "/sessions", label: "My Sessions", icon: "sessions" },
  { href: "/contact", label: "Contact Us", icon: "contact" },
];

async function signOut() {
  "use server";
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await getSessionProfile();
  if (!session) redirect("/login");

  return (
    <DashboardShell
      items={navItems}
      userName={session.profile.full_name || (session.email ?? "Member")}
      roleLabel={session.profile.role}
      signOutAction={signOut}
    >
      {children}
    </DashboardShell>
  );
}
