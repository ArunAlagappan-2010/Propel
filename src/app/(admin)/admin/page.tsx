import type { Metadata } from "next";
import Link from "next/link";
import { FolderKanban, Users, GraduationCap, Mail } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { currentStage } from "@/lib/milestones";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = { title: "Admin — Overview" };

export default async function AdminOverviewPage() {
  const supabase = await createClient();

  const [{ data: projects }, studentsCount, mentorsCount, contactCount] =
    await Promise.all([
      supabase
        .from("projects")
        .select(
          "id, name, school_name, created_at, project_members(count), project_milestones(stage, completed_at)"
        )
        .order("created_at", { ascending: false })
        .limit(200),
      supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("role", "student"),
      supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("role", "mentor"),
      supabase
        .from("contact_submissions")
        .select("id", { count: "exact", head: true }),
    ]);

  const stats = [
    {
      icon: Users,
      label: "Students",
      value: studentsCount.count ?? 0,
    },
    {
      icon: GraduationCap,
      label: "Mentors",
      value: mentorsCount.count ?? 0,
    },
    {
      icon: FolderKanban,
      label: "Projects",
      value: projects?.length ?? 0,
    },
    {
      icon: Mail,
      label: "Contact messages",
      value: contactCount.count ?? 0,
    },
  ];

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
        Overview
      </h1>
      <p className="mt-2 text-muted-foreground">
        Every project and where it stands in the Innovation Tank journey.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <s.icon className="size-5" aria-hidden />
              </div>
              <div>
                <p className="text-2xl font-bold leading-none">{s.value}</p>
                <p className="mt-1 text-xs text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 overflow-x-auto rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Project</TableHead>
              <TableHead>School</TableHead>
              <TableHead>Team size</TableHead>
              <TableHead>Current stage</TableHead>
              <TableHead>Progress</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(projects ?? []).map((p) => {
              const stage = currentStage(p.project_milestones ?? []);
              const members =
                (p.project_members as unknown as { count: number }[])?.[0]
                  ?.count ?? 0;
              return (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">
                    <Link
                      href="/admin/portfolio"
                      className="hover:text-primary hover:underline"
                    >
                      {p.name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {p.school_name ?? "—"}
                  </TableCell>
                  <TableCell>{members}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        stage.label === "Completed" ? "default" : "secondary"
                      }
                    >
                      {stage.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {stage.completedCount}/{stage.total} stages
                  </TableCell>
                </TableRow>
              );
            })}
            {(projects ?? []).length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="py-10 text-center text-muted-foreground"
                >
                  No projects yet — create one in{" "}
                  <Link
                    href="/admin/portfolio"
                    className="text-primary underline"
                  >
                    Portfolio
                  </Link>
                  .
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
