# Third-Party Attribution

Propel's own code is MIT-licensed (see root `LICENSE`). It depends on the
following open-source software, each under its own license (verified
against package.json and each project's repository):

| Dependency | License | Use |
|---|---|---|
| Next.js, React, React DOM | MIT | Framework |
| Tailwind CSS v4 (+ @tailwindcss/postcss) | MIT | Styling |
| shadcn/ui (vendored components in `src/components/ui/`) | MIT | UI components |
| Radix UI primitives (via shadcn) | MIT | Accessible primitives |
| Lucide (lucide-react) | ISC | Icons |
| @supabase/supabase-js, @supabase/ssr | MIT | Database/auth client |
| Resend SDK | MIT | Email |
| Zod | MIT | Validation |
| date-fns, date-fns-tz | MIT | Dates/timezones |
| class-variance-authority, clsx, tailwind-merge, tw-animate-css | MIT | Styling utilities |
| Geist font (next/font) | SIL OFL 1.1 | Typography |
| TypeScript, ESLint | Apache-2.0 / MIT | Tooling (dev only) |

Services (not code): Supabase, Vercel, Resend, Cal.com, GitHub Actions —
each under their own terms of service; see docs/SETUP.md.

If a dependency is added, add its license here in the same PR.
