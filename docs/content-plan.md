# Content Plan — sources and items needing founder review

## Copy already on the site and where it came from

| Site section | Source |
|---|---|
| Hero / mission ("bridging gaps in access to education…") | Founders' proposal letter |
| "What we cover" 4 pillars | Innovation Tank flyer (note: the flyer's Prototyping description was a duplicate of How to Present; it was rewritten sensibly — **review it**) |
| 6-day schedule section | "-PROPEL-" schedule PDF |
| ₹15,000 prize pool / top-3 / ₹5,000 each | "-PROPEL-" schedule PDF |
| "Participants gain" benefits | Innovation Tank flyer |
| Contact phone +91 79943 26054 | Innovation Tank flyer — **confirm this is still the preferred contact channel** |
| Tagline "Science to Solutions" | Propel logo/flyer |
| Founder names "Vairavan Subramanian & Advaith Chittezhi" | Flyer prints "Advaith Vinodh"; the site uses "Advaith Chittezhi" per the proposal letter — **confirm correct surname** |

## Draft copy written for this build — needs founder sign-off

1. **The 8 community category descriptions** — in migration
   `0003_community.sql` (and shown on /community). Edit there before
   running migrations, or update rows in Supabase Studio later.
2. **Parental-consent checkbox text** (register page) — legally
   load-bearing under the DPDP Act 2023. Current wording: *"I confirm
   that my parent or guardian is aware of and consents to my
   registration on Propel, including the processing of my data as
   described in the Privacy Policy."* Have an adult advisor review.
3. **Privacy Policy & Terms of Service** — real, DPDP-aware drafts, but
   written by an AI agent, not a lawyer. Review before wide launch;
   update the retention period (currently "up to 2 years") if policy
   differs.
4. **"Why we do this" section** — adapted from the proposal letter;
   founders may want to rewrite in their own voice.
5. **Mentor onboarding guide** — currently embedded as helper text in
   mentor settings + docs/SETUP.md §4. Consider a printable one-pager
   for volunteer mentors.

## Assets still wanted (not blockers)

- A real logo file (currently a CSS wordmark + generated "P" icons in
  `public/icons/` — replace with designed versions when available;
  regenerate via `node scripts/generate-icons.mjs`).
- Photos from an actual Innovation Tank run for the marketing site.
- A verified sending domain for Resend (see SETUP.md §2).
