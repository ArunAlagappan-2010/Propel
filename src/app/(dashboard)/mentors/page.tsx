import type { Metadata } from "next";
import Link from "next/link";
import { GraduationCap } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Find Mentors" };

function initials(name: string) {
  return (
    name
      .split(/\s+/)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() ?? "")
      .join("") || "M"
  );
}

export default async function MentorsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category: activeSlug } = await searchParams;
  const supabase = await createClient();

  const { data: categories } = await supabase
    .from("community_categories")
    .select("id, name, slug")
    .order("sort_order");

  // Explicit safe columns only — never select * on profiles here.
  const { data: mentors } = await supabase
    .from("profiles")
    .select(
      "id, full_name, bio, avatar_url, mentor_profile_categories(category:community_categories(id, name, slug))"
    )
    .eq("role", "mentor")
    .order("full_name")
    .limit(200);

  const filtered = (mentors ?? []).filter((m) => {
    if (!activeSlug) return true;
    return m.mentor_profile_categories?.some((t) => {
      const cat = Array.isArray(t.category) ? t.category[0] : t.category;
      return cat?.slug === activeSlug;
    });
  });

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
        Find Mentors
      </h1>
      <p className="mt-2 text-muted-foreground">
        Specialists and industrialists volunteering their time. Filter by
        field and book a session.
      </p>

      <div className="mt-6 flex flex-wrap gap-2" role="group" aria-label="Filter by category">
        <Link
          href="/mentors"
          className={cn(
            "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
            !activeSlug
              ? "border-primary bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-muted"
          )}
        >
          All
        </Link>
        {(categories ?? []).map((c) => (
          <Link
            key={c.id}
            href={`/mentors?category=${c.slug}`}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
              activeSlug === c.slug
                ? "border-primary bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted"
            )}
          >
            {c.name}
          </Link>
        ))}
      </div>

      <ul className="mt-8 grid gap-4 sm:grid-cols-2">
        {filtered.map((m) => (
          <li key={m.id}>
            <Link
              href={`/mentors/${m.id}`}
              className="flex h-full gap-4 rounded-xl border bg-card p-5 transition-shadow hover:shadow-md"
            >
              <Avatar className="size-12">
                <AvatarFallback className="bg-primary/10 font-semibold text-primary">
                  {initials(m.full_name)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <h2 className="font-semibold">{m.full_name || "Mentor"}</h2>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                  {m.bio || "This mentor hasn't added a bio yet."}
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {(m.mentor_profile_categories ?? []).map((t) => {
                    const cat = Array.isArray(t.category)
                      ? t.category[0]
                      : t.category;
                    return cat ? (
                      <Badge
                        key={cat.id}
                        variant="secondary"
                        className="text-[11px]"
                      >
                        {cat.name}
                      </Badge>
                    ) : null;
                  })}
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>

      {filtered.length === 0 && (
        <div className="mt-10 rounded-lg border border-dashed p-10 text-center">
          <GraduationCap
            className="mx-auto size-10 text-muted-foreground"
            aria-hidden
          />
          <p className="mt-3 font-medium">
            {activeSlug ? "No mentors in this category yet" : "No mentors yet"}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {activeSlug
              ? "Try another category, or check back soon."
              : "Mentors will appear here once they join."}
          </p>
        </div>
      )}
    </div>
  );
}
