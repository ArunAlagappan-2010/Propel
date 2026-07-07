# Propel — Science to Solutions

Platform for **Propel**, a student-led nonprofit bridging gaps in access to
education. Our first initiative, **Innovation Tank**, is a week-long program
where grade 8–9 students in underprivileged schools learn to identify
real-world problems, research solutions, prototype, and pitch to industry
specialists — with cash prizes for the top teams.

This repo contains the public website and the Propel platform:

- **Public site** — mission, program details, contact
- **Community** — categorized discussion boards for students and mentors
- **Mentor booking** — schedule sessions with automatic Google Meet links (Cal.com)
- **Chat** — realtime student ↔ mentor messaging (Supabase Realtime)
- **Progress tracking** — project milestones, mentor rubric scores, engagement stats

## Stack

Next.js (App Router) · TypeScript · Tailwind CSS v4 · shadcn/ui ·
Supabase (Postgres / Auth / Realtime) · Resend · Cal.com · Vercel

## Local development

```bash
npm install
cp .env.example .env.local   # fill in Supabase + Resend keys
npm run dev
```

## Going live

Follow **[docs/SETUP.md](docs/SETUP.md)** — a step-by-step guide for the
founders covering Supabase, Resend SMTP, Vercel, Cal.com webhooks, the
keep-alive cron, first-admin promotion, and an end-to-end verification
checklist.

Other docs:
- [docs/data-model.md](docs/data-model.md) — tables, RLS, and deliberate decisions
- [docs/content-plan.md](docs/content-plan.md) — copy sources + items needing founder review
- [docs/attribution.md](docs/attribution.md) — third-party licenses
- [AGENTS.md](AGENTS.md) — project conventions and security invariants

## Founders

Vairavan Subramanian · Advaith Vinodh

📞 +91 7994326054

## License

[MIT](LICENSE)
