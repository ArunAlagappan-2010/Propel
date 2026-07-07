import type { Metadata } from "next";
import Link from "next/link";
import { Trophy } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { MILESTONE_STAGES, currentStage } from "@/lib/milestones";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const metadata: Metadata = { title: "Admin — Statistics" };

export default async function AdminStatisticsPage() {
  const supabase = await createClient();

  const [
    { data: projects },
    { data: scores },
    { data: engagement },
    { data: results },
  ] = await Promise.all([
    supabase
      .from("projects")
      .select("id, name, project_milestones(stage, completed_at)")
      .limit(300),
    supabase
      .from("session_scores")
      .select("creativity_score, execution_score, presentation_score")
      .limit(1000),
    supabase
      .from("student_engagement")
      .select("student_id, full_name, school_name, grade, posts_count, comments_count, sessions_attended")
      .order("full_name")
      .limit(500),
    supabase
      .from("final_results")
      .select("placement, final_score, project:projects(name)")
      .order("placement", { ascending: true, nullsFirst: false })
      .limit(100),
  ]);

  // Milestone stage distribution (computed in JS — trivial at pilot scale).
  const stageCounts = new Map<string, number>(
    MILESTONE_STAGES.map((s) => [s.label, 0])
  );
  let completedProjects = 0;
  for (const p of projects ?? []) {
    const stage = currentStage(p.project_milestones ?? []);
    if (stage.label === "Completed") completedProjects += 1;
    else stageCounts.set(stage.label, (stageCounts.get(stage.label) ?? 0) + 1);
  }

  // Rubric averages.
  const n = scores?.length ?? 0;
  const avg = (key: "creativity_score" | "execution_score" | "presentation_score") =>
    n === 0
      ? null
      : (
          (scores ?? []).reduce((sum, s) => sum + (s[key] ?? 0), 0) / n
        ).toFixed(1);

  const totals = (engagement ?? []).reduce(
    (acc, e) => ({
      posts: acc.posts + Number(e.posts_count ?? 0),
      comments: acc.comments + Number(e.comments_count ?? 0),
      sessions: acc.sessions + Number(e.sessions_attended ?? 0),
    }),
    { posts: 0, comments: 0, sessions: 0 }
  );

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
        Statistics
      </h1>
      <p className="mt-2 text-muted-foreground">
        Program-wide performance. Click any student for their individual
        rollup.
      </p>

      {/* Stage distribution */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">
            Where projects are right now
          </CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {[...stageCounts.entries()].map(([label, count]) => (
              <div key={label} className="rounded-lg border p-3 text-center">
                <dt className="text-xs text-muted-foreground">{label}</dt>
                <dd className="mt-1 text-2xl font-bold">{count}</dd>
              </div>
            ))}
            <div className="rounded-lg border border-primary/40 bg-primary/5 p-3 text-center">
              <dt className="text-xs text-primary">Completed</dt>
              <dd className="mt-1 text-2xl font-bold text-primary">
                {completedProjects}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      {/* Averages + engagement totals */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Average session scores{" "}
              <span className="font-normal text-muted-foreground">
                ({n} submissions)
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-3 gap-4 text-center">
              {[
                ["Creativity", avg("creativity_score")],
                ["Execution", avg("execution_score")],
                ["Presentation", avg("presentation_score")],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="text-xs text-muted-foreground">{label}</dt>
                  <dd className="mt-1 text-2xl font-bold">
                    {value ?? "—"}
                    {value && (
                      <span className="text-sm font-normal text-muted-foreground">
                        /5
                      </span>
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Community engagement</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-3 gap-4 text-center">
              {[
                ["Posts", totals.posts],
                ["Comments", totals.comments],
                ["Sessions", totals.sessions],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="text-xs text-muted-foreground">{label}</dt>
                  <dd className="mt-1 text-2xl font-bold">{value}</dd>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>
      </div>

      {/* Final placements */}
      {(results ?? []).length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Trophy className="size-4 text-primary" aria-hidden />
              Final results
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            {(results ?? []).map((r, i) => {
              const project = Array.isArray(r.project)
                ? r.project[0]
                : r.project;
              return (
                <div key={i} className="rounded-lg border px-4 py-2 text-sm">
                  <span className="font-semibold">
                    {r.placement ? `#${r.placement}` : "—"}
                  </span>{" "}
                  {project?.name}
                  {r.final_score !== null && (
                    <span className="text-muted-foreground">
                      {" "}
                      · {r.final_score}
                    </span>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Per-student engagement table */}
      <div className="mt-6 overflow-x-auto rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>School</TableHead>
              <TableHead>Posts</TableHead>
              <TableHead>Comments</TableHead>
              <TableHead>Sessions attended</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(engagement ?? []).map((e) => (
              <TableRow key={e.student_id}>
                <TableCell className="font-medium">
                  <Link
                    href={`/admin/students/${e.student_id}`}
                    className="hover:text-primary hover:underline"
                  >
                    {e.full_name || "Unnamed"}
                  </Link>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {e.school_name ?? "—"}
                </TableCell>
                <TableCell>{e.posts_count}</TableCell>
                <TableCell>{e.comments_count}</TableCell>
                <TableCell>{e.sessions_attended}</TableCell>
              </TableRow>
            ))}
            {(engagement ?? []).length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="py-10 text-center text-muted-foreground"
                >
                  No students yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
