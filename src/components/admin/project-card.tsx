"use client";

import { useActionState, useTransition } from "react";
import { Loader2, Trophy, UserMinus, UserPlus } from "lucide-react";
import {
  addProjectMember,
  removeProjectMember,
  setMilestoneComplete,
} from "@/lib/actions/projects";
import type { ActionResult } from "@/lib/actions/community";
import { MILESTONE_STAGES, stageLabel } from "@/lib/milestones";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

type Student = {
  id: string;
  full_name: string;
  school_name: string | null;
  grade: number | null;
};

type Milestone = {
  id: string;
  stage: string;
  completed_at: string | null;
  notes: string | null;
};

type Project = {
  id: string;
  name: string;
  school_name: string | null;
  project_members: { student: Student | Student[] | null }[];
  project_milestones: Milestone[];
  final_results: { placement: number | null; final_score: number | null }[] | null;
};

export function ProjectCard({
  project,
  allStudents,
}: {
  project: Project;
  allStudents: Student[];
}) {
  const [addState, addAction, addPending] = useActionState<
    ActionResult,
    FormData
  >(addProjectMember, undefined);
  const [pending, startTransition] = useTransition();

  const members = project.project_members
    .map((m) => (Array.isArray(m.student) ? m.student[0] : m.student))
    .filter((s): s is Student => !!s);

  const memberIds = new Set(members.map((m) => m.id));
  const addable = allStudents.filter((s) => !memberIds.has(s.id));

  const order = MILESTONE_STAGES.map((s) => s.key as string);
  const milestones = [...project.project_milestones].sort(
    (a, b) => order.indexOf(a.stage) - order.indexOf(b.stage)
  );

  const result = project.final_results?.[0];

  return (
    <Card>
      <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-2 space-y-0">
        <div>
          <CardTitle className="text-lg">{project.name}</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            {project.school_name ?? "No school set"}
          </p>
        </div>
        {result && (result.placement || result.final_score !== null) && (
          <Badge className="gap-1">
            <Trophy className="size-3" aria-hidden />
            {result.placement
              ? `Placed #${result.placement}`
              : `Score ${result.final_score}`}
          </Badge>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Milestone tracker */}
        <div>
          <h3 className="text-sm font-semibold">Milestones</h3>
          <ol className="mt-3 grid gap-2 sm:grid-cols-5">
            {milestones.map((m, i) => {
              const done = !!m.completed_at;
              return (
                <li key={m.id}>
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() =>
                      startTransition(() =>
                        setMilestoneComplete(m.id, !done)
                      )
                    }
                    aria-pressed={done}
                    title={
                      done
                        ? `Completed ${new Date(m.completed_at!).toLocaleDateString()} — click to un-complete`
                        : "Click to mark complete"
                    }
                    className={cn(
                      "w-full rounded-lg border p-2.5 text-left text-xs font-medium transition-colors",
                      done
                        ? "border-primary bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted"
                    )}
                  >
                    <span className="block text-[10px] uppercase tracking-wide opacity-70">
                      Stage {i + 1}
                    </span>
                    {stageLabel(m.stage)}
                  </button>
                </li>
              );
            })}
          </ol>
        </div>

        {/* Team members */}
        <div>
          <h3 className="text-sm font-semibold">Team</h3>
          <ul className="mt-3 flex flex-wrap gap-2">
            {members.map((m) => (
              <li
                key={m.id}
                className="flex items-center gap-2 rounded-full border bg-muted/50 py-1 pl-3 pr-1 text-sm"
              >
                {m.full_name}
                {m.grade && (
                  <span className="text-xs text-muted-foreground">
                    G{m.grade}
                  </span>
                )}
                <button
                  type="button"
                  aria-label={`Remove ${m.full_name}`}
                  disabled={pending}
                  onClick={() =>
                    startTransition(() =>
                      removeProjectMember(project.id, m.id)
                    )
                  }
                  className="flex size-6 items-center justify-center rounded-full hover:bg-destructive/10 hover:text-destructive"
                >
                  <UserMinus className="size-3.5" aria-hidden />
                </button>
              </li>
            ))}
            {members.length === 0 && (
              <li className="text-sm text-muted-foreground">
                No students assigned yet.
              </li>
            )}
          </ul>

          <form action={addAction} className="mt-3 flex items-end gap-2">
            <input type="hidden" name="projectId" value={project.id} />
            <div className="flex-1">
              <label htmlFor={`add-student-${project.id}`} className="sr-only">
                Add student
              </label>
              <Select name="studentId">
                <SelectTrigger
                  id={`add-student-${project.id}`}
                  className="w-full"
                >
                  <SelectValue placeholder="Add a student…" />
                </SelectTrigger>
                <SelectContent>
                  {addable.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.full_name}
                      {s.school_name ? ` — ${s.school_name}` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" variant="outline" disabled={addPending}>
              {addPending ? (
                <Loader2 className="size-4 animate-spin" aria-hidden />
              ) : (
                <>
                  <UserPlus className="mr-1.5 size-4" aria-hidden />
                  Add
                </>
              )}
            </Button>
          </form>
          {addState?.error && (
            <p className="mt-2 text-sm text-destructive" role="alert">
              {addState.error}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
