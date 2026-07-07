import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, School, MessagesSquare, FileText } from "lucide-react";
import { format } from "date-fns";
import { createClient } from "@/lib/supabase/server";
import { currentStage, stageLabel, MILESTONE_STAGES } from "@/lib/milestones";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default async function AdminStudentDetailPage({
  params,
}: {
  params: Promise<{ studentId: string }>;
}) {
  const { studentId } = await params;
  const supabase = await createClient();

  const { data: student } = await supabase
    .from("profiles")
    .select(
      "id, full_name, school_name, grade, created_at, parental_consent_confirmed, parent_guardian_name, parent_guardian_contact"
    )
    .eq("id", studentId)
    .eq("role", "student")
    .single();
  if (!student) notFound();

  const [
    { data: memberships },
    postsCount,
    commentsCount,
    { data: scores },
  ] = await Promise.all([
    supabase
      .from("project_members")
      .select(
        "project:projects(id, name, school_name, project_milestones(stage, completed_at), final_results(placement, final_score, judge_notes))"
      )
      .eq("student_id", studentId),
    supabase
      .from("posts")
      .select("id", { count: "exact", head: true })
      .eq("author_id", studentId),
    supabase
      .from("comments")
      .select("id", { count: "exact", head: true })
      .eq("author_id", studentId),
    supabase
      .from("session_scores")
      .select(
        "id, creativity_score, execution_score, presentation_score, feedback_text, created_at"
      )
      .eq("student_id", studentId)
      .order("created_at", { ascending: false })
      .limit(50)
      .then((r) => (r.error ? { data: [] } : r)),
  ]);

  const project = memberships?.[0]
    ? Array.isArray(memberships[0].project)
      ? memberships[0].project[0]
      : memberships[0].project
    : null;

  const order = MILESTONE_STAGES.map((s) => s.key as string);
  const milestones = project
    ? [...(project.project_milestones ?? [])].sort(
        (a, b) => order.indexOf(a.stage) - order.indexOf(b.stage)
      )
    : [];
  const result = project?.final_results?.[0];

  return (
    <div className="mx-auto max-w-4xl">
      <Link
        href="/admin/students"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="size-4" aria-hidden />
        All students
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {student.full_name || "Unnamed student"}
          </h1>
          <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <School className="size-4" aria-hidden />
              {student.school_name ?? "No school"}
            </span>
            {student.grade && <span>Grade {student.grade}</span>}
            <span>Joined {format(new Date(student.created_at), "d MMM yyyy")}</span>
          </p>
        </div>
        <Badge variant={student.parental_consent_confirmed ? "default" : "destructive"}>
          {student.parental_consent_confirmed
            ? "Parental consent confirmed"
            : "Consent missing"}
        </Badge>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <p className="flex items-center gap-2 text-xs text-muted-foreground">
              <FileText className="size-4" aria-hidden /> Posts
            </p>
            <p className="mt-1 text-2xl font-bold">{postsCount.count ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="flex items-center gap-2 text-xs text-muted-foreground">
              <MessagesSquare className="size-4" aria-hidden /> Comments
            </p>
            <p className="mt-1 text-2xl font-bold">{commentsCount.count ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Session scores</p>
            <p className="mt-1 text-2xl font-bold">{scores?.length ?? 0}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg">
            {project ? project.name : "No project yet"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {project ? (
            <>
              <ol className="grid gap-2 sm:grid-cols-5">
                {milestones.map((m, i) => {
                  const done = !!m.completed_at;
                  return (
                    <li
                      key={m.stage}
                      className={cn(
                        "rounded-lg border p-2.5 text-xs font-medium",
                        done
                          ? "border-primary bg-primary/10 text-primary"
                          : "text-muted-foreground"
                      )}
                    >
                      <span className="block text-[10px] uppercase tracking-wide opacity-70">
                        Stage {i + 1}
                      </span>
                      {stageLabel(m.stage)}
                      {done && (
                        <span className="mt-1 block text-[10px] opacity-70">
                          {format(new Date(m.completed_at!), "d MMM")}
                        </span>
                      )}
                    </li>
                  );
                })}
              </ol>
              <p className="mt-3 text-sm text-muted-foreground">
                Current stage:{" "}
                <span className="font-medium text-foreground">
                  {currentStage(milestones).label}
                </span>
              </p>
              {result && (
                <p className="mt-2 text-sm">
                  Final result:{" "}
                  <span className="font-semibold">
                    {result.placement
                      ? `Placed #${result.placement}`
                      : "Participated"}
                    {result.final_score !== null
                      ? ` — score ${result.final_score}`
                      : ""}
                  </span>
                  {result.judge_notes && (
                    <span className="mt-1 block text-muted-foreground">
                      “{result.judge_notes}”
                    </span>
                  )}
                </p>
              )}
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              Assign this student to a project in{" "}
              <Link href="/admin/portfolio" className="text-primary underline">
                Portfolio
              </Link>
              .
            </p>
          )}
        </CardContent>
      </Card>

      {(scores ?? []).length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Mentor feedback</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {(scores ?? []).map((s) => (
              <div key={s.id} className="rounded-lg border p-4">
                <p className="text-sm font-medium">
                  Creativity {s.creativity_score}/5 · Execution{" "}
                  {s.execution_score}/5 · Presentation {s.presentation_score}/5
                </p>
                {s.feedback_text && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    “{s.feedback_text}”
                  </p>
                )}
                <p className="mt-2 text-xs text-muted-foreground">
                  {format(new Date(s.created_at), "d MMM yyyy")}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
