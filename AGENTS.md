<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Propel — project conventions

Propel is a nonprofit running "Innovation Tank": week-long project-based
learning programs for grade 8–9 students in underprivileged schools in India.
This repo is the public site + platform (community, mentor booking, chat,
progress tracking). Pilot scale: ~50–300 users. Budget: free tiers only.

## Verified Next.js 16 conventions (do not regress to older patterns)
- `src/proxy.ts`, exporting `proxy()` — NOT `middleware.ts`/`middleware()`.
- `cookies()`, `headers()`, `params`, `searchParams` are all async — always `await`.
- Tailwind v4: config lives in `src/app/globals.css` (`@import "tailwindcss"`, `@theme`), no `tailwind.config.ts`.

## Stack (locked decisions — do not substitute)
- Next.js App Router + TypeScript + Tailwind v4 + shadcn/ui, deployed on Vercel (free).
- Supabase: Postgres, Auth (email confirm via Resend SMTP — NOT Supabase's built-in mailer), Realtime (chat), Storage.
- Cal.com Cloud free plan for mentor booking + auto Google Meet links (embed widget + webhooks → `bookings` table). No raw Google Calendar/Meet API code.
- Resend for all transactional email (free tier: 100/day).

## Security invariants (check on every change)
- Every table gets RLS policies per role (student / mentor / admin). No table ships without RLS enabled.
- `SUPABASE_SERVICE_ROLE_KEY` is server-only; only via `src/lib/supabase/admin.ts` (guarded by `server-only` import).
- No IDOR: queries scope by `auth.uid()` via RLS, never trust client-supplied IDs for ownership.
- Students are minors (grade 8–9): collect minimal PII, never expose student personal data on public pages.

## Supabase client usage
- Browser: `createClient()` from `src/lib/supabase/client.ts`
- Server Components / Actions / Route Handlers: `await createClient()` from `src/lib/supabase/server.ts`
- Admin (bypasses RLS, server-only): `createAdminClient()` from `src/lib/supabase/admin.ts`
- Session refresh + route protection: `src/proxy.ts` → `src/lib/supabase/proxy.ts`

## Roles
`student` | `mentor` | `admin`, stored in `profiles.role`, mirrored into JWT
custom claims for RLS. User dashboard at `/dashboard`, admin at `/admin`.
