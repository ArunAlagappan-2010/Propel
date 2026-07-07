"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireRole } from "@/lib/auth/roles";
import { createClient } from "@/lib/supabase/server";

/** Admin: toggle a specialty category tag on any mentor. */
export async function adminToggleMentorCategory(
  mentorId: string,
  categoryId: string,
  enabled: boolean
): Promise<void> {
  await requireRole(["admin"]);
  if (!z.uuid().safeParse(mentorId).success) return;
  if (!z.uuid().safeParse(categoryId).success) return;

  const supabase = await createClient();
  if (enabled) {
    await supabase
      .from("mentor_profile_categories")
      .insert({ mentor_id: mentorId, category_id: categoryId });
  } else {
    await supabase
      .from("mentor_profile_categories")
      .delete()
      .eq("mentor_id", mentorId)
      .eq("category_id", categoryId);
  }
  revalidatePath("/admin/mentors");
  revalidatePath("/mentors");
}
