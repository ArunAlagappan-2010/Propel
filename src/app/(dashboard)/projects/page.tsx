import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, Circle, Trophy, Users } from "lucide-react";
import { format } from "date-fns";
import { createClient } from "@/lib/supabase/server";
import { getSessionProfile } from "@/lib/auth/roles";
import { MILESTONE_STAGES, stageLabel, currentStage } from "@/lib/milestones";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Projects" };

export default async function ProjectsPage() {
  const session = await getSessionProfile();
  const supabase = await createClient();

  // RLS scopes this to projects the user can see (member / connected
  // mentor / admin) — no client-side filtering by user id needed.
  const { data: projects } = await supabase
    .from("projects")
    .select(
      `id, name, school_name,
       project_members(student:profiles(id, full_name)),
       project_milestones(stage, completed_at),
       final_results(placement, final_score)`
    )
    .order("created_at", { ascending: false })
    .limit(50);

  const order = MILESTONE_STAGES.map((s) => s.key as string);
  const isMentor = session?.profile.role === "mentor";

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
        {isMentor ? "Projects you support" : "Your project"}
      </h1>
      <p className="mt-2 text-muted-foreground">
        {isMentor
          ? "Teams connected to you through sessions."
          : "Your team's journey through the five Innovation Tank stages."}
      </p>

      <div className="mt-8 space-y-6">
        {(projects ?? []).map((p) => {
          const milestones = [...(p.project_milestones ?? [])].sort(
            (a, b) => order.indexOf(a.stage) - order.indexOf(b.stage)
          );
          const stage = currentStage(milestones);
          const members = (p.project_members ?? [])
            .map((m) => (Array.isArray(m.student) ? m.student[0] : m.student))
            .filter(Boolean);
          const result = p.final_results?.[0];

          return (
            <Card key={p.id}>
              <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-2 space-y-0">
                <div>
                  <CardTitle className="text-lg">{p.name}</CardTitle>
                  <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="size-4" aria-hidden />
                    {members.map((m) => m!.full_name).join(", ") ||
                      "No teammates yet"}
                  </p>
                </div>
                <Badge
                  variant={stage.label === "Completed" ? "default" : "secondary"}
                >
                  {stage.label === "Completed"
                    ? "Completed"
                    : `Current: ${stage.label}`}
                </Badge>
              </CardHeader>
              <CardContent>
                <ol className="relative space-y-0">
                  {milestones.map((m, i) => {
                    const done = !!m.completed_at;
                    return (
                      <li key={m.stage} className="relative flex gap-4 pb-6 last:pb-0">
                        {i < milestones.length - 1 && (
                          <span
                            aria-hidden
                            className={cn(
                              "absolute left-[13px] top-8 h-full w-0.5",
                              done ? "bg-primary/40" : "bg-border"
                            )}
                          />
                        )}
                        {done ? (
                          <CheckCircle2
                            className="relative z-10 size-7 shrink-0 text-primary"
                            aria-hidden
                          />
                        ) : (
                          <Circle
                            className="relative z-10 size-7 shrink-0 text-muted-foreground/40"
                            aria-hidden
                          />
                        )}
                        <div className="pt-0.5">
                          <p
                            className={cn(
                              "text-sm font-medium",
                              !done && "text-muted-foreground"
                            )}
                          >
                            {stageLabel(m.stage)}
                          </p>
                          {done && (
                            <p className="text-xs text-muted-foreground">
                              Completed{" "}
                              {format(new Date(m.completed_at!), "d MMM yyyy")}
                            </p>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ol>

                {result && (result.placement || result.final_score !== null) && (
                  <div className="mt-4 flex items-center gap-3 rounded-lg bg-primary/5 p-4">
                    <Trophy className="size-8 text-primary" aria-hidden />
                    <div>
                      <p className="font-semibold">
                        {result.placement
                          ? `Your team placed #${result.placement}!`
                          : "Final results are in"}
                      </p>
                      {result.final_score !== null && (
                        <p className="text-sm text-muted-foreground">
                          Final score: {result.final_score}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {(projects ?? []).length === 0 && (
        <div className="mt-10 rounded-lg border border-dashed p-10 text-center">
          <p className="font-medium">
            {isMentor ? "No connected projects yet" : "No project yet"}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {isMentor
              ? "Projects appear here once you hold sessions with their teams."
              : "Your team will appear here once a program admin sets it up during Innovation Tank."}
          </p>
          {!isMentor && (
            <Link
              href="/community"
              className="mt-4 inline-block text-sm font-medium text-primary underline"
            >
              Meanwhile, explore the community
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
