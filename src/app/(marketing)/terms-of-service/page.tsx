import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The rules for using the Propel platform.",
};

export default function TermsOfServicePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight">Terms of Service</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Last updated: July 2026
      </p>

      <div className="mt-8 space-y-8 text-[15px] leading-relaxed">
        <section>
          <h2 className="text-xl font-semibold">About Propel</h2>
          <p className="mt-3 text-muted-foreground">
            Propel is a nonprofit educational program, not a commercial
            service. The platform exists to run Innovation Tank: connecting
            students, volunteer mentors, and program administrators. By
            creating an account or using the platform you agree to these
            terms. If you are a student, your parent or guardian must be
            aware of and consent to your registration.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">Community conduct</h2>
          <ul className="mt-3 list-disc space-y-2 pl-6 text-muted-foreground">
            <li>Be respectful. No harassment, bullying, hate speech, or
              personal attacks — toward anyone.</li>
            <li>
              Never share another person&apos;s personal information (name,
              school, contact details, photos) without their permission.
            </li>
            <li>
              Keep content relevant to learning, projects, and the program.
              No spam, advertising, or inappropriate material.
            </li>
            <li>
              Chat and community spaces are for program-related
              communication. Mentor–student communication should stay on the
              platform.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold">Sessions and mentorship</h2>
          <ul className="mt-3 list-disc space-y-2 pl-6 text-muted-foreground">
            <li>
              Attend booked sessions on time, or cancel/reschedule in
              advance so the slot can be reused.
            </li>
            <li>
              Video sessions are professional, educational settings. Conduct
              expectations for community spaces apply equally in sessions.
            </li>
            <li>
              Mentors volunteer their time; feedback and scores they provide
              are for educational purposes.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold">Moderation</h2>
          <p className="mt-3 text-muted-foreground">
            Program administrators may hide or remove content, restrict
            accounts, or remove users from the program if these terms are
            violated. We aim to be proportionate: a first minor violation
            usually gets a warning; serious or repeated violations may mean
            removal. Decisions can be appealed by contacting us.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">Your content</h2>
          <p className="mt-3 text-muted-foreground">
            You own what you create (posts, comments, project work). By
            posting it on the platform you give Propel permission to display
            it to other signed-in program participants and to use anonymised
            or aggregate versions (e.g. &ldquo;40 projects completed&rdquo;)
            in program reporting. Project ideas remain the students&apos;
            own.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">Prizes</h2>
          <p className="mt-3 text-muted-foreground">
            Competition prizes (e.g. the ₹15,000 Innovation Tank pool) are
            awarded by the judging panel, whose decisions are final. Prize
            distribution is handled directly with winning teams and their
            schools, outside the platform.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">Disclaimers</h2>
          <p className="mt-3 text-muted-foreground">
            The platform is provided as-is by a small nonprofit team. We work
            hard to keep it available and secure but cannot guarantee
            uninterrupted service. To the extent permitted by law, Propel is
            not liable for indirect damages arising from use of the
            platform.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">Contact</h2>
          <p className="mt-3 text-muted-foreground">
            Questions about these terms: +91 79943 26054.
          </p>
        </section>
      </div>
    </div>
  );
}
