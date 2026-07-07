import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays, ExternalLink, Video } from "lucide-react";
import { formatInTimeZone } from "date-fns-tz";
import { createClient } from "@/lib/supabase/server";
import { getSessionProfile } from "@/lib/auth/roles";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = { title: "Admin — Schedule" };

const statusStyle: Record<string, "default" | "secondary" | "destructive"> = {
  confirmed: "default",
  rescheduled: "secondary",
  completed: "secondary",
  cancelled: "destructive",
};

export default async function AdminSchedulePage() {
  const session = await getSessionProfile();
  const tz = session?.profile.timezone || "Asia/Kolkata";
  const supabase = await createClient();

  const [{ data: bookings }, { data: mentors }] = await Promise.all([
    supabase
      .from("mentor_bookings")
      .select(
        `id, title, scheduled_start, scheduled_end, meet_link, status,
         mentor:profiles!mentor_bookings_mentor_id_fkey(full_name),
         student:profiles!mentor_bookings_student_id_fkey(full_name)`
      )
      .order("scheduled_start", { ascending: false })
      .limit(300),
    supabase
      .from("profiles")
      .select("id, full_name, cal_com_username")
      .eq("role", "mentor")
      .order("full_name"),
  ]);

  const bookable = (mentors ?? []).filter((m) => m.cal_com_username);

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
        Schedule
      </h1>
      <p className="mt-2 text-muted-foreground">
        Every booked session across the program. Times in {tz.replace("_", " ")}.
      </p>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">Book on a student&apos;s behalf</CardTitle>
          <CardDescription>
            Open a mentor&apos;s booking page and enter the student&apos;s
            details as the attendee — the session lands in both calendars
            and appears here via webhook.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {bookable.map((m) => (
            <a
              key={m.id}
              href={`https://cal.com/${m.cal_com_username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium hover:bg-muted"
            >
              <CalendarDays className="size-4 text-primary" aria-hidden />
              {m.full_name}
              <ExternalLink className="size-3 text-muted-foreground" aria-hidden />
            </a>
          ))}
          {bookable.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No mentors have connected Cal.com yet. They can do it from
              their own profile page under{" "}
              <Link href="/mentors" className="text-primary underline">
                Find Mentors
              </Link>
              .
            </p>
          )}
        </CardContent>
      </Card>

      <div className="mt-6 overflow-x-auto rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>When</TableHead>
              <TableHead>Mentor</TableHead>
              <TableHead>Student</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Meet</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(bookings ?? []).map((b) => {
              const mentor = Array.isArray(b.mentor) ? b.mentor[0] : b.mentor;
              const student = Array.isArray(b.student)
                ? b.student[0]
                : b.student;
              return (
                <TableRow key={b.id}>
                  <TableCell className="whitespace-nowrap">
                    {formatInTimeZone(
                      new Date(b.scheduled_start),
                      tz,
                      "d MMM yyyy · h:mm a"
                    )}
                  </TableCell>
                  <TableCell>{mentor?.full_name ?? "—"}</TableCell>
                  <TableCell>{student?.full_name ?? "—"}</TableCell>
                  <TableCell>
                    <Badge variant={statusStyle[b.status] ?? "secondary"}>
                      {b.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {b.meet_link ? (
                      <a
                        href={b.meet_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-primary hover:underline"
                      >
                        <Video className="size-4" aria-hidden />
                        Link
                      </a>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
            {(bookings ?? []).length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="py-10 text-center text-muted-foreground"
                >
                  No sessions booked yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
