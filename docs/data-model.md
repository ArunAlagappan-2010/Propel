# Propel — Data Model Reference

Kept in sync with `supabase/migrations/`. Every table has RLS **enabled**.
Roles: `student` | `mentor` | `admin` (in `profiles.role`; admin is only
ever set manually in Supabase Studio).

## Tables

| Table | Purpose | Introduced |
|---|---|---|
| `contact_submissions` | Public contact form | 0001 |
| `profiles` | 1:1 with `auth.users`; role, school, grade, consent, timezone, `email` (synced by trigger), `cal_com_username` | 0002, 0008 |
| `community_categories` | The 8 fixed categories; doubles as mentor specialty taxonomy | 0003 |
| `posts`, `comments` | Community content; `is_pinned`/`is_hidden` moderation flags | 0003 |
| `mentor_profile_categories` | Mentor ↔ category tags | 0004 |
| `conversations`, `conversation_participants`, `messages` | 1:1 chat (Realtime on `messages`) | 0005 |
| `projects`, `project_members`, `project_milestones` | Teams + 5-stage tracker (rows auto-seeded by trigger) | 0006 |
| `final_results` | Judging-day placement/score, one row per project | 0007 |
| `mentor_bookings` | Mirror of Cal.com bookings; written **only** by the webhook via service_role | 0008 |
| `session_scores` | Post-session rubric (1–5 ×3 + text) | 0008 |
| `student_engagement` (view) | posts/comments/sessions per student, computed on read, `security_invoker` | 0009 |

## Key functions

- `is_admin()`, `current_role()` — role checks (SECURITY DEFINER).
- `handle_new_user()` — signup trigger; coerces any non-student/mentor
  role to student (privilege-escalation guard), copies email + metadata.
- `is_conversation_participant(conv)` — chat membership check.
- `find_or_create_conversation(other_user)` — the only way conversations
  are created.
- `handle_new_project()` — seeds the 5 milestone rows.
- `is_project_member(pid)`, `is_mentor_connected(pid)` — project access.
- `admin_conversation_stats()` — message counts/last-activity for admins
  without exposing bodies.

## RLS shape (per role)

- **student**: own profile (safe columns updatable; role/consent locked
  by column grants); reads mentor profiles; own posts/comments
  (create/edit/delete); own conversations/messages; own project +
  milestones/results **read-only**; own bookings/scores read-only.
- **mentor**: everything a student can, plus: manage own specialty tags,
  bio, cal username; read + update milestones for **connected** projects
  (connected = has a booking with the project or one of its members);
  submit `session_scores` only for own bookings.
- **admin**: full read/write via `is_admin()` policies; moderation flags
  set via service_role after a server-side role check.

## Deliberate decisions

1. **Admin chat oversight is metadata-only.** Admins see participants,
   message counts, and last activity — never message content. Most
   participants are minors; if the founders later decide moderation
   requires content access, add an explicit admin SELECT policy on
   `messages` in a new migration and update the Terms of Service to say
   so.
2. **`mentor_bookings` has no client write path.** Cal.com owns booking
   state; the signed webhook is the single source of truth.
3. **Engagement is computed on read** (view), not counters — no drift.
4. **Mentor emails** are visible to signed-in users who query the
   profiles table directly (mentor rows are readable for the directory).
   Mentor phone numbers are not selected anywhere client-side; student
   rows are never readable by other students.
5. **Individual student statistics** live at `/admin/students/[id]`;
   `/admin/statistics/[id]` redirects there (one canonical rollup).
