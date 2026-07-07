import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Pin } from "lucide-react";
import { format } from "date-fns";
import { createClient } from "@/lib/supabase/server";
import { getSessionProfile } from "@/lib/auth/roles";
import { CommentForm } from "@/components/community/comment-form";
import { DeletePostButton } from "@/components/community/delete-post-button";
import { ModerationControls } from "@/components/community/moderation-controls";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default async function PostPage({
  params,
}: {
  params: Promise<{ categorySlug: string; postId: string }>;
}) {
  const { categorySlug, postId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const session = await getSessionProfile();
  const isAdmin = session?.profile.role === "admin";

  const { data: post } = await supabase
    .from("posts")
    .select(
      "id, title, body, is_pinned, is_hidden, created_at, author_id, author:profiles!posts_author_id_fkey(full_name, role), category:community_categories(name, slug)"
    )
    .eq("id", postId)
    .single();

  const category = Array.isArray(post?.category)
    ? post?.category[0]
    : post?.category;
  if (!post || category?.slug !== categorySlug) notFound();

  const author = Array.isArray(post.author) ? post.author[0] : post.author;

  const { data: comments } = await supabase
    .from("comments")
    .select(
      "id, body, created_at, author:profiles!comments_author_id_fkey(full_name, role)"
    )
    .eq("post_id", post.id)
    .order("created_at", { ascending: true })
    .limit(200);

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href={`/community/${categorySlug}`}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="size-4" aria-hidden />
        {category?.name}
      </Link>

      {isAdmin && (
        <div className="mt-4">
          <ModerationControls
            postId={post.id}
            isPinned={post.is_pinned}
            isHidden={post.is_hidden}
          />
        </div>
      )}

      <article className="mt-4">
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-2xl font-bold leading-tight tracking-tight">
            {post.is_pinned && (
              <Pin
                className="mr-2 inline size-5 text-primary"
                aria-label="Pinned"
              />
            )}
            {post.title}
          </h1>
          {user?.id === post.author_id && (
            <DeletePostButton postId={post.id} categorySlug={categorySlug} />
          )}
        </div>
        <p className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">
            {author?.full_name ?? "Member"}
          </span>
          {author?.role === "mentor" && (
            <Badge variant="secondary" className="px-1.5 py-0 text-[10px]">
              Mentor
            </Badge>
          )}
          <span>{format(new Date(post.created_at), "d MMM yyyy, h:mm a")}</span>
        </p>
        <div className="mt-6 whitespace-pre-wrap text-[15px] leading-relaxed">
          {post.body}
        </div>
      </article>

      <Separator className="my-8" />

      <section aria-label="Comments">
        <h2 className="font-semibold">
          Comments ({(comments ?? []).length})
        </h2>
        <ul className="mt-4 space-y-4">
          {(comments ?? []).map((c) => {
            const cAuthor = Array.isArray(c.author) ? c.author[0] : c.author;
            return (
              <li key={c.id} className="rounded-lg border bg-card p-4">
                <p className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">
                    {cAuthor?.full_name ?? "Member"}
                  </span>
                  {cAuthor?.role === "mentor" && (
                    <Badge
                      variant="secondary"
                      className="px-1.5 py-0 text-[10px]"
                    >
                      Mentor
                    </Badge>
                  )}
                  <span>
                    {format(new Date(c.created_at), "d MMM yyyy, h:mm a")}
                  </span>
                </p>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">
                  {c.body}
                </p>
              </li>
            );
          })}
        </ul>
        {(comments ?? []).length === 0 && (
          <p className="mt-4 text-sm text-muted-foreground">
            No comments yet — be the first to reply.
          </p>
        )}

        <div className="mt-6">
          <CommentForm postId={post.id} categorySlug={categorySlug} />
        </div>
      </section>
    </div>
  );
}
