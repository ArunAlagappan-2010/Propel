"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireRole } from "@/lib/auth/roles";
import { createClient } from "@/lib/supabase/server";
import { sessionScoreSchema } from "@/lib/validation/schemas";
import type { ActionResult } from "@/lib/actions/community";

/** Mentor submits the post-session rubric. RLS double-checks the mentor
 *  actually owns the booking. */
export async function submitSessionScore(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const session = await requireRole(["mentor"]);

  const parsed = sessionScoreSchema.safeParse({
    bookingId: formData.get("bookingId"),
    studentId: formData.get("studentId"),
    creativityScore: Number(formData.get("creativityScore")),
    executionScore: Number(formData.get("executionScore")),
    presentationScore: Number(formData.get("presentationScore")),
    feedbackText: formData.get("feedbackText") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid scores" };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("session_scores").insert({
    booking_id: parsed.data.bookingId,
    student_id: parsed.data.studentId,
    creativity_score: parsed.data.creativityScore,
    execution_score: parsed.data.executionScore,
    presentation_score: parsed.data.presentationScore,
    feedback_text: parsed.data.feedbackText ?? null,
    submitted_by: session.userId,
  });

  if (error) {
    return {
      error:
        error.code === "23505"
          ? "You've already submitted feedback for this session."
          : "Could not save feedback — are you the mentor on this booking?",
    };
  }

  revalidatePath("/sessions");
  return undefined;
}

const finalResultSchema = z.object({
  projectId: z.uuid(),
  placement: z.coerce.number().int().min(1).max(100).optional(),
  finalScore: z.coerce.number().min(0).max(1000).optional(),
  judgeNotes: z.string().trim().max(5000).optional(),
});

/** Admin records judging-day results (upserts one row per project). */
export async function recordFinalResult(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const session = await requireRole(["admin"]);

  const parsed = finalResultSchema.safeParse({
    projectId: formData.get("projectId"),
    placement: formData.get("placement") || undefined,
    finalScore: formData.get("finalScore") || undefined,
    judgeNotes: formData.get("judgeNotes") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  if (
    parsed.data.placement === undefined &&
    parsed.data.finalScore === undefined
  ) {
    return { error: "Enter a placement, a score, or both." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("final_results").upsert(
    {
      project_id: parsed.data.projectId,
      placement: parsed.data.placement ?? null,
      final_score: parsed.data.finalScore ?? null,
      judge_notes: parsed.data.judgeNotes ?? null,
      recorded_by: session.userId,
    },
    { onConflict: "project_id" }
  );
  if (error) return { error: "Could not save the result." };

  revalidatePath("/admin/portfolio");
  revalidatePath("/admin/statistics");
  revalidatePath("/projects");
  return undefined;
}
