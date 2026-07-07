"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/roles";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Community moderation (pin/hide). Moderation flags are deliberately not
 * client-writable (column grants exclude them), so after verifying the
 * caller is an admin we use the service-role client.
 */

export async function setPostPinned(postId: string, pinned: boolean) {
  await requireRole(["admin"]);
  const admin = createAdminClient();
  await admin.from("posts").update({ is_pinned: pinned }).eq("id", postId);
  revalidatePath("/community");
}

export async function setPostHidden(postId: string, hidden: boolean) {
  await requireRole(["admin"]);
  const admin = createAdminClient();
  await admin.from("posts").update({ is_hidden: hidden }).eq("id", postId);
  revalidatePath("/community");
}

export async function setCommentHidden(commentId: string, hidden: boolean) {
  await requireRole(["admin"]);
  const admin = createAdminClient();
  await admin
    .from("comments")
    .update({ is_hidden: hidden })
    .eq("id", commentId);
  revalidatePath("/community");
}
