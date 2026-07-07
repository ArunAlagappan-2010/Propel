import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyCalSignature } from "@/lib/cal/webhook-verify";

/**
 * Cal.com webhook receiver — the ONLY write path into mentor_bookings.
 * Subscribed events: BOOKING_CREATED, BOOKING_RESCHEDULED,
 * BOOKING_CANCELLED, MEETING_ENDED.
 *
 * Attribution: organizer email → mentor profile; first attendee email →
 * student/initiator profile (matched case-insensitively). Optional
 * booking-form metadata (studentId / projectId) wins over email matching.
 */

type CalAttendee = { email?: string; timeZone?: string };
type CalPayload = {
  uid?: string;
  bookingId?: number;
  title?: string;
  startTime?: string;
  endTime?: string;
  organizer?: { email?: string; timeZone?: string };
  attendees?: CalAttendee[];
  videoCallData?: { url?: string };
  metadata?: { videoCallUrl?: string; studentId?: string; projectId?: string };
  responses?: Record<string, { value?: unknown }>;
};

const statusByEvent: Record<string, string> = {
  BOOKING_CREATED: "confirmed",
  BOOKING_RESCHEDULED: "rescheduled",
  BOOKING_CANCELLED: "cancelled",
  MEETING_ENDED: "completed",
};

export async function POST(request: Request) {
  const rawBody = await request.text();

  const ok = verifyCalSignature(
    rawBody,
    request.headers.get("x-cal-signature-256"),
    process.env.CALCOM_WEBHOOK_SECRET
  );
  if (!ok) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let event: { triggerEvent?: string; payload?: CalPayload };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const trigger = event.triggerEvent ?? "";
  const status = statusByEvent[trigger];
  const payload = event.payload;
  const uid = payload?.uid;

  // Ignore events we don't track (PING etc.) — respond 200 so Cal.com
  // doesn't retry.
  if (!status || !payload || !uid) {
    return NextResponse.json({ ok: true, ignored: trigger || "unknown" });
  }

  const admin = createAdminClient();

  const organizerEmail = payload.organizer?.email?.toLowerCase();
  const attendeeEmail = payload.attendees?.[0]?.email?.toLowerCase();

  async function profileIdByEmail(email?: string): Promise<string | null> {
    if (!email) return null;
    const { data } = await admin
      .from("profiles")
      .select("id")
      .ilike("email", email)
      .limit(1)
      .maybeSingle();
    return data?.id ?? null;
  }

  const [mentorId, attendeeId] = await Promise.all([
    profileIdByEmail(organizerEmail),
    profileIdByEmail(attendeeEmail),
  ]);

  const metaStudentId = payload.metadata?.studentId;
  const metaProjectId = payload.metadata?.projectId;

  const row: Record<string, unknown> = {
    cal_com_booking_uid: uid,
    title: payload.title ?? null,
    status,
    updated_at: new Date().toISOString(),
  };
  if (payload.startTime) row.scheduled_start = payload.startTime;
  if (payload.endTime) row.scheduled_end = payload.endTime;
  if (payload.organizer?.timeZone) row.mentor_timezone = payload.organizer.timeZone;
  if (payload.attendees?.[0]?.timeZone) {
    row.attendee_timezone = payload.attendees[0].timeZone;
  }
  const meetLink =
    payload.videoCallData?.url ?? payload.metadata?.videoCallUrl ?? null;
  if (meetLink) row.meet_link = meetLink;
  if (mentorId) row.mentor_id = mentorId;
  if (metaStudentId) {
    row.student_id = metaStudentId;
    if (attendeeId) row.initiated_by = attendeeId;
  } else if (attendeeId) {
    row.student_id = attendeeId;
    row.initiated_by = attendeeId;
  }
  if (metaProjectId) row.project_id = metaProjectId;

  const { error } = await admin
    .from("mentor_bookings")
    .upsert(row, { onConflict: "cal_com_booking_uid" });

  if (error) {
    console.error("cal-webhook upsert failed:", error.message);
    return NextResponse.json({ error: "Storage failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
