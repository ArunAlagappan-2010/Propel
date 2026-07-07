"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireRole } from "@/lib/auth/roles";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/lib/actions/community";

const calUsernameSchema = z
  .string()
  .trim()
  .max(100)
  .regex(/^[a-zA-Z0-9._-]*$/, "Letters, numbers, dots and dashes only");

/** Mentor self-serve: set your own Cal.com username (empty clears it). */
export async function setCalUsername(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const session = await requireRole(["mentor", "admin"]);
  const parsed = calUsernameSchema.safeParse(formData.get("calUsername"));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid username" };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ cal_com_username: parsed.data || null })
    .eq("id", session.userId);
  if (error) return { error: "Could not save. Please try again." };

  revalidatePath(`/mentors/${session.userId}`);
  return undefined;
}

/** Mentor self-serve: toggle one of your specialty category tags. */
export async function toggleOwnCategory(
  categoryId: string,
  enabled: boolean
): Promise<void> {
  const session = await requireRole(["mentor"]);
  const supabase = await createClient();

  if (enabled) {
    await supabase.from("mentor_profile_categories").insert({
      mentor_id: session.userId,
      category_id: categoryId,
    });
  } else {
    await supabase
      .from("mentor_profile_categories")
      .delete()
      .eq("mentor_id", session.userId)
      .eq("category_id", categoryId);
  }
  revalidatePath(`/mentors/${session.userId}`);
  revalidatePath("/mentors");
}

/** Mentor self-serve: update your bio. */
export async function setOwnBio(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const session = await requireRole(["mentor", "admin"]);
  const bio = z.string().trim().max(2000).safeParse(formData.get("bio"));
  if (!bio.success) return { error: "Bio is too long (2000 characters max)." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ bio: bio.data || null })
    .eq("id", session.userId);
  if (error) return { error: "Could not save. Please try again." };

  revalidatePath(`/mentors/${session.userId}`);
  return undefined;
}
