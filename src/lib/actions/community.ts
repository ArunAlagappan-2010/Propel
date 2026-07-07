"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { postSchema, commentSchema } from "@/lib/validation/schemas";

export type ActionResult = { error?: string } | undefined;

export async function createPost(
  categorySlug: string,
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const parsed = postSchema.safeParse({
    title: formData.get("title"),
    body: formData.get("body"),
    categoryId: formData.get("categoryId"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { data: inserted, error } = await supabase
    .from("posts")
    .insert({
      category_id: parsed.data.categoryId,
      author_id: user.id,
      title: parsed.data.title,
      body: parsed.data.body,
    })
    .select("id")
    .single();

  if (error || !inserted) {
    return { error: "Could not create the post. Please try again." };
  }

  revalidatePath(`/community/${categorySlug}`);
  redirect(`/community/${categorySlug}/${inserted.id}`);
}

export async function createComment(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const parsed = commentSchema.safeParse({
    body: formData.get("body"),
    postId: formData.get("postId"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { error } = await supabase.from("comments").insert({
    post_id: parsed.data.postId,
    author_id: user.id,
    body: parsed.data.body,
  });

  if (error) {
    return { error: "Could not post the comment. Please try again." };
  }

  const categorySlug = formData.get("categorySlug");
  revalidatePath(`/community/${categorySlug}/${parsed.data.postId}`);
  return undefined;
}

export async function deleteOwnPost(
  postId: string,
  categorySlug: string
): Promise<void> {
  const supabase = await createClient();
  // RLS restricts the delete to the author or an admin.
  await supabase.from("posts").delete().eq("id", postId);
  revalidatePath(`/community/${categorySlug}`);
  redirect(`/community/${categorySlug}`);
}
