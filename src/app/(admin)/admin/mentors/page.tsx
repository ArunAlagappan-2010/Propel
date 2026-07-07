import type { Metadata } from "next";
import Link from "next/link";
import { CalendarCheck2, CalendarX2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { MentorCategoryEditor } from "@/components/admin/mentor-category-editor";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export const metadata: Metadata = { title: "Admin — Mentors" };

export default async function AdminMentorsPage() {
  const supabase = await createClient();

  const [{ data: mentors }, { data: categories }] = await Promise.all([
    supabase
      .from("profiles")
      .select(
        "id, full_name, email, bio, cal_com_username, mentor_profile_categories(category_id)"
      )
      .eq("role", "mentor")
      .order("full_name")
      .limit(300),
    supabase
      .from("community_categories")
      .select("id, name")
      .order("sort_order"),
  ]);

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
        Mentors
      </h1>
      <p className="mt-2 text-muted-foreground">
        Assign specialty categories (students filter the directory by
        these) and see who has booking set up. To promote a new mentor,
        they register with the mentor role; to make someone an admin, edit
        their row in Supabase Studio.
      </p>

      <div className="mt-8 space-y-4">
        {(mentors ?? []).map((m) => {
          const activeIds = (m.mentor_profile_categories ?? []).map(
            (t) => t.category_id
          );
          const initials =
            (m.full_name ?? "")
              .split(/\s+/)
              .slice(0, 2)
              .map((p: string) => p[0]?.toUpperCase() ?? "")
              .join("") || "M";
          return (
            <Card key={m.id}>
              <CardContent className="flex flex-col gap-4 p-5 sm:flex-row">
                <Avatar className="size-12 shrink-0">
                  <AvatarFallback className="bg-primary/10 font-semibold text-primary">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <Link
                      href={`/mentors/${m.id}`}
                      className="font-semibold hover:text-primary hover:underline"
                    >
                      {m.full_name || "Unnamed mentor"}
                    </Link>
                    <span className="text-sm text-muted-foreground">
                      {m.email}
                    </span>
                    {m.cal_com_username ? (
                      <span className="inline-flex items-center gap-1 text-xs text-primary">
                        <CalendarCheck2 className="size-3.5" aria-hidden />
                        Booking: cal.com/{m.cal_com_username}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                        <CalendarX2 className="size-3.5" aria-hidden />
                        No booking set up
                      </span>
                    )}
                  </div>
                  <div className="mt-3">
                    <MentorCategoryEditor
                      mentorId={m.id}
                      allCategories={categories ?? []}
                      activeCategoryIds={activeIds}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {(mentors ?? []).length === 0 && (
        <div className="mt-10 rounded-lg border border-dashed p-10 text-center">
          <p className="font-medium">No mentors registered yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Invite specialists to register at /register and pick the mentor
            role.
          </p>
        </div>
      )}
    </div>
  );
}
