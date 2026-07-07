import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, MessagesSquare, CalendarDays } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { messageUser } from "@/lib/actions/chat";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";

export default async function MentorProfilePage({
  params,
}: {
  params: Promise<{ mentorId: string }>;
}) {
  const { mentorId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: mentor } = await supabase
    .from("profiles")
    .select(
      "id, full_name, bio, avatar_url, timezone, mentor_profile_categories(category:community_categories(id, name, slug))"
    )
    .eq("id", mentorId)
    .eq("role", "mentor")
    .single();
  if (!mentor) notFound();

  const initials =
    mentor.full_name
      .split(/\s+/)
      .slice(0, 2)
      .map((p: string) => p[0]?.toUpperCase() ?? "")
      .join("") || "M";

  const isSelf = user?.id === mentor.id;

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/mentors"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="size-4" aria-hidden />
        All mentors
      </Link>

      <Card className="mt-4">
        <CardContent className="flex flex-col gap-6 p-6 sm:flex-row sm:p-8">
          <Avatar className="size-20">
            <AvatarFallback className="bg-primary/10 text-2xl font-semibold text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold tracking-tight">
              {mentor.full_name || "Mentor"}
            </h1>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {(mentor.mentor_profile_categories ?? []).map((t) => {
                const cat = Array.isArray(t.category)
                  ? t.category[0]
                  : t.category;
                return cat ? (
                  <Badge key={cat.id} variant="secondary">
                    {cat.name}
                  </Badge>
                ) : null;
              })}
            </div>
            <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
              {mentor.bio || "This mentor hasn't added a bio yet."}
            </p>

            {!isSelf && (
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <form action={messageUser.bind(null, mentor.id)}>
                  <Button type="submit" className="w-full sm:w-auto">
                    <MessagesSquare className="mr-2 size-4" aria-hidden />
                    Message
                  </Button>
                </form>
                <Button
                  variant="outline"
                  className="w-full sm:w-auto"
                  disabled
                  title="Session booking opens once scheduling is configured"
                >
                  <CalendarDays className="mr-2 size-4" aria-hidden />
                  Book a session (coming soon)
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
