import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Propel collects, uses, and protects your personal data.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Last updated: July 2026
      </p>

      <div className="prose-sm mt-8 space-y-8 text-[15px] leading-relaxed">
        <section>
          <h2 className="text-xl font-semibold">Who we are</h2>
          <p className="mt-3 text-muted-foreground">
            Propel is a student-led nonprofit educational initiative
            (&ldquo;Propel&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;) run by
            Vairavan Subramanian and Advaith Chittezhi. We operate the Propel
            platform, which supports our Innovation Tank program for grade
            8–9 students. For any privacy question or request, contact us at
            +91 79943 26054.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">What we collect</h2>
          <p className="mt-3 text-muted-foreground">
            When you register, we collect: your full name, email address,
            password (stored in hashed form only — we never see it), your
            role (student or mentor), and for students: school name, grade,
            and — because most of our student users are children under
            India&apos;s Digital Personal Data Protection Act, 2023 (DPDP
            Act) — a parental/guardian consent confirmation, and optionally a
            parent or guardian&apos;s name and contact. When you use the
            platform we also store the content you create: community posts,
            comments, chat messages, project milestones, session bookings,
            and mentor feedback. When you submit the public contact form we
            store your name, email, and message.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">Why we collect it</h2>
          <ul className="mt-3 list-disc space-y-2 pl-6 text-muted-foreground">
            <li>To create and secure your account, and let you sign in.</li>
            <li>
              To run the program: mentor matching, session scheduling with
              video links, progress tracking, and community discussion.
            </li>
            <li>
              To send essential (transactional) emails such as registration
              confirmation and booking notifications. We do not send
              marketing email.
            </li>
            <li>
              To let program administrators track student progress and
              evaluate projects — that is the purpose of the program.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold">Children&apos;s data</h2>
          <p className="mt-3 text-muted-foreground">
            Student participants are minors (typically grades 8–9). We
            require confirmation of parental/guardian awareness and consent
            at registration. We collect only what the program needs, we never
            display student personal information on public pages, and student
            data is visible only to signed-in program participants with a
            legitimate role (their mentors and program administrators).
            Parents or guardians may request access to, correction of, or
            deletion of their child&apos;s data at any time using the contact
            details above.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">Who processes your data</h2>
          <p className="mt-3 text-muted-foreground">
            We do not sell or share your data with anyone for advertising. To
            operate the platform we use trusted service providers acting as
            processors: <strong>Supabase</strong> (database, authentication,
            and file storage), <strong>Resend</strong> (transactional email
            delivery), <strong>Cal.com</strong> (session scheduling — when
            you book a session, your name, email, and chosen time are shared
            with Cal.com and the mentor&apos;s Google Calendar to create the
            meeting), and <strong>Vercel</strong> (website hosting). Each
            processes data only as needed to provide their service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">How long we keep it</h2>
          <p className="mt-3 text-muted-foreground">
            We keep account data while your account is active. When a program
            cohort ends, we retain program records (projects, scores,
            results) for up to 2 years for program continuity and reporting,
            then delete or anonymise them. You may request deletion of your
            account and associated personal data at any time; we will honour
            it within 30 days except where a legal obligation requires
            retention.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">Your rights</h2>
          <p className="mt-3 text-muted-foreground">
            Under the DPDP Act you (and for children, your parent/guardian)
            have the right to access, correct, and erase your personal data,
            to withdraw consent, and to grievance redressal. To exercise any
            of these, contact us at +91 79943 26054. We will respond within a
            reasonable time and in any case within statutory timelines.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">Security</h2>
          <p className="mt-3 text-muted-foreground">
            All traffic is encrypted in transit (HTTPS). Passwords are hashed
            with industry-standard algorithms. Database access is controlled
            by per-row security policies so each user can only reach data
            they are entitled to. Administrative access is limited to program
            administrators.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">Changes to this policy</h2>
          <p className="mt-3 text-muted-foreground">
            If we make material changes we will update this page and note the
            new date above. Continued use of the platform after a change
            means you accept the updated policy.
          </p>
        </section>
      </div>
    </div>
  );
}
