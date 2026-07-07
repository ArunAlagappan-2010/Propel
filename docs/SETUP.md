# Propel — Go-Live Setup Guide

Everything the founders must do to take this code from GitHub to a live
platform. The code is complete; these are the account/config steps that
require a human. Do them in order — later steps depend on earlier ones.

---

## 1. Supabase (database + auth) — ~20 min

1. Create a free project at [supabase.com](https://supabase.com)
   (choose the **Mumbai / South Asia region**).
2. In **SQL Editor**, paste and run each file from `supabase/migrations/`
   **in numeric order** (0001 → 0009). Each should say "Success".
3. Collect from **Project Settings → API**:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` `public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` ⚠️ **secret — never
     expose in the browser or commit it**
4. **Authentication → URL Configuration**: set Site URL to your live URL
   (e.g. `https://propel.vercel.app`) and add
   `https://YOUR-DOMAIN/confirm` to Redirect URLs.
5. **Authentication → Rate Limits**: review and set sane values (e.g.
   signups 10/hour, password resets 5/hour) — don't leave defaults
   unexamined.

## 2. Resend (email) — ~15 min + domain

1. Create a free account at [resend.com](https://resend.com) (3,000
   emails/month, 100/day).
2. Create an API key → `RESEND_API_KEY`.
3. **Verify a domain** (Settings → Domains, add the DNS records). Until
   then Resend only delivers to your own account email — fine for
   testing, not for real users. A cheap domain (~₹800/yr) is required
   for real signups.
4. **Wire Resend into Supabase Auth** (critical — Supabase's built-in
   mailer is capped at ~2 emails/hour and will break signups):
   Supabase Dashboard → **Authentication → SMTP Settings** → enable
   custom SMTP:
   - Host: `smtp.resend.com`, Port: `465`
   - Username: `resend`
   - Password: your Resend API key
   - Sender: `noreply@your-verified-domain.org`

## 3. Vercel (hosting) — ~10 min

1. Create a free account at [vercel.com](https://vercel.com), **Import**
   the `ArunAlagappan-2010/Propel` GitHub repo.
2. Add Environment Variables (Settings → Environment Variables) — all of
   these, from `.env.example`:
   `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
   `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`,
   `CALCOM_WEBHOOK_SECRET` (from step 4), `NEXT_PUBLIC_SITE_URL`
   (your live URL), `CRON_SECRET` (any long random string —
   `openssl rand -hex 32` or a password generator).
3. Deploy. Every push to `main` now auto-deploys.

## 4. Cal.com (mentor booking + Google Meet) — ~10 min + per-mentor

1. Founders create a free account at [cal.com](https://cal.com) to
   administer; **each mentor also creates their own free account**.
2. Each mentor (one-time, ~5 min):
   - Connects Google Calendar: **Settings → Apps → Google Calendar**.
   - Sets **Google Meet** as the location for their event type.
   - Sets their availability (in their own timezone — Cal.com converts
     for whoever books).
   - Enters their Cal.com username in Propel: sign in → Find Mentors →
     their own profile → "Your mentor settings".
3. Webhook (founders, once): Cal.com **Settings → Developer → Webhooks →
   New**:
   - Subscriber URL: `https://YOUR-DOMAIN/api/cal-webhook`
   - Events: Booking Created, Booking Rescheduled, Booking Cancelled,
     Meeting Ended
   - Secret: generate a random string → this is `CALCOM_WEBHOOK_SECRET`
     (add to Vercel env and redeploy).

## 5. GitHub Actions keep-alive (prevents free-tier DB pause) — ~5 min

Repo → **Settings → Secrets and variables → Actions** → add:
- `SITE_URL` = your live URL (no trailing slash)
- `CRON_SECRET` = same value as in Vercel

Then Actions tab → "Supabase keep-alive" → **Run workflow** once to
verify it passes.

## 6. Create the first admin — ~2 min

1. Register normally on the site (as a mentor role is fine).
2. Supabase Dashboard → **Table Editor → profiles** → find your row →
   change `role` to `admin`. (Admin can never be self-registered — this
   manual step is deliberate.)

## 7. Verification checklist (run through once everything is wired)

- [ ] Register a test student with a real inbox → confirmation email
      arrives (from your domain via Resend) → link lands on
      `/login?confirmed=true` → login works → `/dashboard` loads.
- [ ] The test student visiting `/admin` is bounced to `/dashboard`.
- [ ] Post in 2–3 community categories; comment; both appear instantly.
- [ ] Message a mentor from a second browser; reply appears in the first
      browser **without refreshing** (Realtime works).
- [ ] Book a real session via a mentor profile → it appears in Cal.com,
      a Meet link is generated, and within seconds the booking shows on
      `/sessions` (webhook works). Reschedule + cancel each update the
      same row.
- [ ] As admin: create a project, add the student, mark a milestone —
      the student sees it on `/projects`.
- [ ] As the mentor, after the session: submit rubric feedback → it
      appears on the admin student detail page and in Statistics.
- [ ] Add the site to a phone home screen — it installs as a PWA.

## Ongoing operations

- **Backups**: Supabase free tier has none. Monthly, run Database →
  Backups → or `pg_dump` with the connection string, keep the file safe.
- **Email cap**: 100/day on Resend free — ample for the pilot; watch it
  during registration drives.
- **Supabase pause**: the GitHub Action pings daily; if the repo is ever
  disabled/archived, the DB will pause after 7 idle days (unpause is one
  click in the dashboard, no data loss).
