import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { NewProjectDialog } from "@/components/admin/new-project-dialog";
import { ProjectCard } from "@/components/admin/project-card";

export const metadata: Metadata = { title: "Admin — Portfolio" };

export default async function AdminPortfolioPage() {
  const supabase = await createClient();

  const [{ data: projects }, { data: students }] = await Promise.all([
    supabase
      .from("projects")
      .select(
        `id, name, school_name, created_at,
         project_members(student:profiles(id, full_name, school_name, grade)),
         project_milestones(id, stage, completed_at, notes),
         final_results(placement, final_score)`
      )
      .order("created_at", { ascending: false })
      .limit(200),
    supabase
      .from("profiles")
      .select("id, full_name, school_name, grade")
      .eq("role", "student")
      .order("full_name")
      .limit(500),
  ]);

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Portfolio
          </h1>
          <p className="mt-2 text-muted-foreground">
            Create teams, assign students, and mark Innovation Tank stages
            complete as they progress.
          </p>
        </div>
        <NewProjectDialog />
      </div>

      <div className="mt-8 space-y-6">
        {(projects ?? []).map((p) => (
          <ProjectCard key={p.id} project={p} allStudents={students ?? []} />
        ))}
        {(projects ?? []).length === 0 && (
          <div className="rounded-lg border border-dashed p-10 text-center">
            <p className="font-medium">No projects yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Create the first team to start tracking milestones.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
