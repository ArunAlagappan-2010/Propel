import Link from "next/link";
import { notFound } from "next/navigation";
import { Pin, MessageSquare, ChevronLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { NewPostDialog } from "@/components/community/new-post-dialog";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ categorySlug: string }>;
}) {
  const { categorySlug } = await params;
  const supabase = await createClient();

  const { data: category } = await supabase
    .from("community_categories")
    .select("id, name, slug, description")
    .eq("slug", categorySlug)
    .single();
  if (!category) notFound();

  const { data: posts } = await supabase
    .from("posts")
    .select(
      "id, title, is_pinned, created_at, author:profiles!posts_author_id_fkey(full_name, role), comments(count)"
    )
    .eq("category_id", category.id)
    .order("is_pinned", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div className="mx-auto max-w-4xl">
      <Link
        href="/community"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="size-4" aria-hidden />
        All categories
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {category.name}
          </h1>
          <p className="mt-1 max-w-xl text-sm text-muted-foreground">
            {category.description}
          </p>
        </div>
        <NewPostDialog
          categoryId={category.id}
          categorySlug={category.slug}
          categoryName={category.name}
        />
      </div>

      <ul className="mt-8 space-y-3">
        {(posts ?? []).map((post) => {
          const author = Array.isArray(post.author)
            ? post.author[0]
            : post.author;
          const commentCount =
            (post.comments as unknown as { count: number }[])?.[0]?.count ?? 0;
          return (
            <li key={post.id}>
              <Link
                href={`/community/${category.slug}/${post.id}`}
                className="block rounded-xl border bg-card p-4 transition-shadow hover:shadow-md sm:p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <h2 className="font-semibold leading-snug">
                    {post.is_pinned && (
                      <Pin
                        className="mr-1.5 inline size-4 text-primary"
                        aria-label="Pinned"
                      />
                    )}
                    {post.title}
                  </h2>
                  <span className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
                    <MessageSquare className="size-3.5" aria-hidden />
                    {commentCount}
                  </span>
                </div>
                <p className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">
                    {author?.full_name ?? "Member"}
                  </span>
                  {author?.role === "mentor" && (
                    <Badge variant="secondary" className="px-1.5 py-0 text-[10px]">
                      Mentor
                    </Badge>
                  )}
                  <span>
                    {formatDistanceToNow(new Date(post.created_at), {
                      addSuffix: true,
                    })}
                  </span>
                </p>
              </Link>
            </li>
          );
        })}
      </ul>

      {(posts ?? []).length === 0 && (
        <div className="mt-10 rounded-lg border border-dashed p-10 text-center">
          <p className="font-medium">No posts here yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Be the first to start a discussion in {category.name}.
          </p>
        </div>
      )}
    </div>
  );
}
