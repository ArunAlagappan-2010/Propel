import type { Metadata } from "next";
import Link from "next/link";
import {
  Atom,
  Leaf,
  Binary,
  Cog,
  BookOpen,
  Palette,
  Briefcase,
  Megaphone,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = { title: "Community" };

const categoryIcons: Record<string, LucideIcon> = {
  stem: Atom,
  "biology-environment": Leaf,
  "math-computer-science": Binary,
  "physics-engineering": Cog,
  "social-sciences-humanities": BookOpen,
  "arts-design": Palette,
  "business-entrepreneurship": Briefcase,
  "general-discussion": Megaphone,
};

export default async function CommunityPage() {
  const supabase = await createClient();
  const { data: categories } = await supabase
    .from("community_categories")
    .select("id, name, slug, description, sort_order")
    .order("sort_order");

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
        Community
      </h1>
      <p className="mt-2 text-muted-foreground">
        Pick a category to read posts, ask questions, and share your project
        progress.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {(categories ?? []).map((c) => {
          const Icon = categoryIcons[c.slug] ?? Atom;
          return (
            <Link key={c.id} href={`/community/${c.slug}`} className="group">
              <Card className="h-full transition-shadow group-hover:shadow-md">
                <CardHeader>
                  <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="size-5" aria-hidden />
                  </div>
                  <CardTitle className="mt-2 flex items-center gap-1 text-base">
                    {c.name}
                    <ArrowRight
                      className="size-4 opacity-0 transition-opacity group-hover:opacity-100"
                      aria-hidden
                    />
                  </CardTitle>
                  <CardDescription>{c.description}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          );
        })}
      </div>

      {(categories ?? []).length === 0 && (
        <p className="mt-10 rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
          Categories haven&apos;t been set up yet — run the database
          migrations (see README).
        </p>
      )}
    </div>
  );
}
