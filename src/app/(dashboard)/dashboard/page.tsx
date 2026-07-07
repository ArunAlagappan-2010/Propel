import type { Metadata } from "next";
import Link from "next/link";
import {
  Users,
  GraduationCap,
  MessagesSquare,
  ArrowRight,
  Trophy,
  CalendarDays,
  Video,
} from "lucide-react";
import { formatInTimeZone } from "date-fns-tz";
import { getSessionProfile } from "@/lib/auth/roles";
import { createClient } from "@/lib/supabase/server";
import { currentStage } from "@/lib/milestones";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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
  const isStudent = session?.profile.role === "student";
  const tz = session?.profile.timezone || "Asia/Kolkata";

  const supabase = await createClient();

  // Student progress card (RLS scopes to their own project) + everyone's
  // next upcoming session.
  const [{ data: projects }, { data: nextSessions }] = await Promise.all([
    isStudent
      ? supabase
          .from("projects")
          .select(
            "id, name, project_milestones(stage, completed_at), final_results(placement, final_score)"
          )
          .limit(1)
      : Promise.resolve({ data: null }),
    supabase
      .from("mentor_bookings")
      .select("id, title, scheduled_start, meet_link, status")
      .gte("scheduled_start", new Date().toISOString())
      .neq("status", "cancelled")
      .order("scheduled_start", { ascending: true })
      .limit(1),
  ]);

  const project = projects?.[0] ?? null;
  const stage = project ? currentStage(project.project_milestones ?? []) : null;
  const result = project?.final_results?.[0];
  const nextSession = nextSessions?.[0] ?? null;

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

      {(project || nextSession) && (
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {project && stage && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Trophy className="size-4 text-primary" aria-hidden />
                  {project.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {result?.placement
                    ? `Your team placed #${result.placement}! 🎉`
                    : stage.label === "Completed"
                      ? "All stages complete — great work!"
                      : `Current stage: ${stage.label}`}
                </p>
                <div
                  className="mt-3 h-2 overflow-hidden rounded-full bg-muted"
                  role="progressbar"
                  aria-valuenow={stage.completedCount}
                  aria-valuemin={0}
                  aria-valuemax={stage.total}
                  aria-label="Project progress"
                >
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{
                      width: `${stage.total ? (stage.completedCount / stage.total) * 100 : 0}%`,
                    }}
                  />
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {stage.completedCount} of {stage.total} stages complete
                </p>
                <Button asChild size="sm" variant="outline" className="mt-3">
                  <Link href="/projects">View project</Link>
                </Button>
              </CardContent>
            </Card>
          )}

          {nextSession && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <CalendarDays className="size-4 text-primary" aria-hidden />
                  Next session
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-medium">
                  {nextSession.title ?? "Mentor session"}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {formatInTimeZone(
                    new Date(nextSession.scheduled_start),
                    tz,
                    "EEE, d MMM yyyy · h:mm a"
                  )}
                </p>
                <div className="mt-3 flex gap-2">
                  {nextSession.meet_link && (
                    <Button asChild size="sm">
                      <a
                        href={nextSession.meet_link}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Video className="mr-1.5 size-4" aria-hidden />
                        Join Meet
                      </a>
                    </Button>
                  )}
                  <Button asChild size="sm" variant="outline">
                    <Link href="/sessions">All sessions</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

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
