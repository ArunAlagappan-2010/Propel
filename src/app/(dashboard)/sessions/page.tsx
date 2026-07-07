import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays, Video } from "lucide-react";
import { formatInTimeZone } from "date-fns-tz";
import { createClient } from "@/lib/supabase/server";
import { getSessionProfile } from "@/lib/auth/roles";
import { ScoreSessionDialog } from "@/components/sessions/score-session-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = { title: "My Sessions" };

const statusStyle: Record<string, "default" | "secondary" | "destructive"> = {
  confirmed: "default",
  rescheduled: "secondary",
  completed: "secondary",
  cancelled: "destructive",
};

export default async function SessionsPage() {
  const session = await getSessionProfile();
  const supabase = await createClient();
  const tz = session?.profile.timezone || "Asia/Kolkata";
  const isMentor = session?.profile.role === "mentor";

  // RLS scopes to bookings where the user is mentor/student/initiator.
  const { data: bookings } = await supabase
    .from("mentor_bookings")
    .select(
      `id, title, scheduled_start, scheduled_end, meet_link, status,
       student_id,
       mentor:profiles!mentor_bookings_mentor_id_fkey(id, full_name),
       student:profiles!mentor_bookings_student_id_fkey(id, full_name),
       session_scores(id)`
    )
    .order("scheduled_start", { ascending: false })
    .limit(100);

  const now = Date.now();

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
        My Sessions
      </h1>
      <p className="mt-2 text-muted-foreground">
        Booked mentor sessions with Google Meet links. Times shown in{" "}
        {tz.replace("_", " ")}.
      </p>

      <div className="mt-8 space-y-4">
        {(bookings ?? []).map((b) => {
          const mentor = Array.isArray(b.mentor) ? b.mentor[0] : b.mentor;
          const student = Array.isArray(b.student) ? b.student[0] : b.student;
          const other = isMentor ? student : mentor;
          const isPast = new Date(b.scheduled_start).getTime() < now;
          const canJoin =
            b.meet_link && !isPast && b.status !== "cancelled";
          const alreadyScored = (b.session_scores ?? []).length > 0;
          const canScore =
            isMentor &&
            b.student_id &&
            (b.status === "completed" || isPast) &&
            b.status !== "cancelled" &&
            !alreadyScored;

          return (
            <Card key={b.id}>
              <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold">
                      {b.title ||
                        `Session with ${other?.full_name ?? "member"}`}
                    </span>
                    <Badge variant={statusStyle[b.status] ?? "secondary"}>
                      {b.status}
                    </Badge>
                  </p>
                  <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                    <CalendarDays className="size-4 shrink-0" aria-hidden />
                    {formatInTimeZone(
                      new Date(b.scheduled_start),
                      tz,
                      "EEE, d MMM yyyy · h:mm a"
                    )}
                    {b.scheduled_end &&
                      ` – ${formatInTimeZone(new Date(b.scheduled_end), tz, "h:mm a")}`}
                  </p>
                  {other && (
                    <p className="mt-1 text-sm text-muted-foreground">
                      {isMentor ? "Student: " : "Mentor: "}
                      <span className="font-medium text-foreground">
                        {other.full_name}
                      </span>
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 flex-col gap-2 sm:items-end">
                  {canJoin && (
                    <Button asChild size="sm">
                      <a
                        href={b.meet_link!}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Video className="mr-1.5 size-4" aria-hidden />
                        Join Google Meet
                      </a>
                    </Button>
                  )}
                  {canScore && (
                    <ScoreSessionDialog
                      bookingId={b.id}
                      studentId={b.student_id!}
                      studentName={student?.full_name ?? "the student"}
                    />
                  )}
                  {isMentor && alreadyScored && (
                    <p className="text-xs text-muted-foreground">
                      Feedback submitted ✓
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {(bookings ?? []).length === 0 && (
        <div className="mt-10 rounded-lg border border-dashed p-10 text-center">
          <CalendarDays
            className="mx-auto size-10 text-muted-foreground"
            aria-hidden
          />
          <p className="mt-3 font-medium">No sessions yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {isMentor
              ? "Sessions students book with you will appear here."
              : "Book a session from a mentor's profile and it will appear here with its Google Meet link."}
          </p>
          {!isMentor && (
            <Button asChild variant="outline" className="mt-4">
              <Link href="/mentors">Browse mentors</Link>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
