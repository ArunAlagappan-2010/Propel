"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireRole } from "@/lib/auth/roles";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/lib/actions/community";

const projectSchema = z.object({
  name: z.string().trim().min(2, "Project name is too short").max(200),
  schoolName: z.string().trim().max(200).optional(),
});

export async function createProject(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  await requireRole(["admin"]);
  const parsed = projectSchema.safeParse({
    name: formData.get("name"),
    schoolName: formData.get("schoolName") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("projects").insert({
    name: parsed.data.name,
    school_name: parsed.data.schoolName ?? null,
  });
  if (error) return { error: "Could not create project." };

  revalidatePath("/admin/portfolio");
  revalidatePath("/admin");
  return undefined;
}

export async function addProjectMember(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  await requireRole(["admin"]);
  const projectId = z.uuid().safeParse(formData.get("projectId"));
  const studentId = z.uuid().safeParse(formData.get("studentId"));
  if (!projectId.success || !studentId.success) {
    return { error: "Pick a student to add." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("project_members").insert({
    project_id: projectId.data,
    student_id: studentId.data,
  });
  if (error) {
    return {
      error: error.code === "23505"
        ? "That student is already on this team."
        : "Could not add the student.",
    };
  }

  revalidatePath("/admin/portfolio");
  return undefined;
}

export async function removeProjectMember(
  projectId: string,
  studentId: string
): Promise<void> {
  await requireRole(["admin"]);
  const supabase = await createClient();
  await supabase
    .from("project_members")
    .delete()
    .eq("project_id", projectId)
    .eq("student_id", studentId);
  revalidatePath("/admin/portfolio");
}

export async function setMilestoneComplete(
  milestoneId: string,
  complete: boolean
): Promise<void> {
  // Admins here; mentors get their own gated path in Phase 6+ UI.
  const session = await requireRole(["admin", "mentor"]);
  const supabase = await createClient();
  // RLS still enforces: admins always; mentors only for connected
  // projects (policy added in migration 0008).
  await supabase
    .from("project_milestones")
    .update(
      complete
        ? { completed_at: new Date().toISOString(), marked_complete_by: session.userId }
        : { completed_at: null, marked_complete_by: null }
    )
    .eq("id", milestoneId);
  revalidatePath("/admin/portfolio");
  revalidatePath("/admin");
  revalidatePath("/projects");
}
