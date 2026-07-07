import type { Metadata } from "next";
import Link from "next/link";
import { Users, GraduationCap, MessagesSquare, ArrowRight } from "lucide-react";
import { getSessionProfile } from "@/lib/auth/roles";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = { title: "Dashboard" };

const quickLinks = [
  {
    href: "/community",
    icon: Users,
    title: "My Community",
    body: "Share ideas and questions across 8 subject categories.",
  },
  {
    href: "/mentors",
    icon: GraduationCap,
    title: "Find Mentors",
    body: "Browse specialists by field and book a session.",
  },
  {
    href: "/chat",
    icon: MessagesSquare,
    title: "Chat",
    body: "Message your mentors and teammates directly.",
  },
];

export default async function DashboardHomePage() {
  const session = await getSessionProfile();
  const firstName =
    session?.profile.full_name.split(" ")[0] || "there";

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
        Welcome back, {firstName}!
      </h1>
      <p className="mt-2 text-muted-foreground">
        {session?.profile.role === "mentor"
          ? "Thank you for volunteering your time. Here's your space."
          : "Ready to turn science into solutions? Pick up where you left off."}
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {quickLinks.map((q) => (
          <Link key={q.href} href={q.href} className="group">
            <Card className="h-full transition-shadow group-hover:shadow-md">
              <CardHeader>
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <q.icon className="size-5" aria-hidden />
                </div>
                <CardTitle className="mt-2 flex items-center gap-1 text-base">
                  {q.title}
                  <ArrowRight
                    className="size-4 opacity-0 transition-opacity group-hover:opacity-100"
                    aria-hidden
                  />
                </CardTitle>
                <CardDescription>{q.body}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
