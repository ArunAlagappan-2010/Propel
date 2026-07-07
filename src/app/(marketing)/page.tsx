import Link from "next/link";
import {
  Lightbulb,
  Hammer,
  Presentation,
  Handshake,
  Trophy,
  Users,
  MessagesSquare,
  Target,
  CalendarDays,
  IndianRupee,
  ArrowRight,
  Rocket,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const covers = [
  {
    icon: Lightbulb,
    title: "How to Apply Knowledge",
    body: "Sessions on converting classroom knowledge into solutions for real-world issues — students learn to identify problems and research their way to ideas.",
  },
  {
    icon: Hammer,
    title: "Prototyping",
    body: "Guided prototype development: turning an idea into something you can demonstrate, with practical planning and financial basics.",
  },
  {
    icon: Presentation,
    title: "How to Present",
    body: "Sessions on presenting and communicating projects using business models — pitching with clarity and confidence.",
  },
  {
    icon: Handshake,
    title: "Connections + Cash Prizes",
    body: "Direct connections to industrialists and field specialists for invaluable feedback — plus a real prize pool for winning teams.",
  },
];

const gains = [
  {
    icon: Target,
    title: "Real-world skill development",
    body: "Critical thinking, problem-solving, and innovation practiced on genuine problems, not textbook exercises.",
  },
  {
    icon: Users,
    title: "Collaboration & communication",
    body: "Students work in teams through the full arc of a project — from problem to pitch.",
  },
  {
    icon: MessagesSquare,
    title: "Access to specialists",
    body: "Present projects directly to industry experts and receive professional feedback.",
  },
  {
    icon: Trophy,
    title: "Cash prizes for winners",
    body: "A ₹15,000 prize pool, split ₹5,000 each among the top 3 teams.",
  },
];

const schedule = [
  {
    day: "Day 1",
    title: "Orientation + group formation",
    detail:
      "Students learn to identify problems and research solutions. Guest specialist address. (2 hours)",
  },
  {
    day: "Day 2",
    title: "Presentation, prototype & financial planning guide",
    detail: "How to shape an idea into a pitch-ready project. (1 hour)",
  },
  {
    day: "Days 3–4",
    title: "Team preparation",
    detail: "Groups develop their proposals — independently or in school.",
  },
  {
    day: "Day 5",
    title: "Mock session + feedback",
    detail: "A full practice run with detailed feedback. (2 hours)",
  },
  {
    day: "Day 6",
    title: "Final presentations + valedictory ceremony",
    detail:
      "Teams pitch to a panel of industrialists and specialists. Winners announced. (2 hours)",
  },
];

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background">
        <div className="mx-auto max-w-6xl px-4 pb-20 pt-16 sm:px-6 sm:pt-24">
          <div className="mx-auto max-w-3xl text-center">
            <p className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
              <Rocket className="size-4" aria-hidden />
              Innovation Tank — our first initiative
            </p>
            <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Science to <span className="text-primary">Solutions</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
              Propel is a student-led nonprofit bridging gaps in access to
              education. Innovation Tank gives grade 8–9 students in
              underprivileged schools one week to turn classroom knowledge
              into real-world project proposals — with expert guidance and
              cash prizes.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link href="/contact">
                  Partner with us
                  <ArrowRight className="ml-1 size-4" aria-hidden />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="w-full sm:w-auto"
              >
                <Link href="/#program">See the program</Link>
              </Button>
            </div>
          </div>

          {/* Stats strip */}
          <dl className="mx-auto mt-16 grid max-w-3xl grid-cols-1 gap-6 sm:grid-cols-3">
            {[
              { dt: "Program length", dd: "1 week, ~7 hours" },
              { dt: "Prize pool", dd: "₹15,000" },
              { dt: "Expert judges", dd: "3+ industrialists" },
            ].map((s) => (
              <div
                key={s.dt}
                className="rounded-xl border bg-card p-5 text-center shadow-sm"
              >
                <dt className="text-sm text-muted-foreground">{s.dt}</dt>
                <dd className="mt-1 text-2xl font-bold text-primary">
                  {s.dd}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* What we cover */}
      <section id="program" className="scroll-mt-20 py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              What we cover
            </h2>
            <p className="mt-4 text-muted-foreground">
              Four pillars that take students from a classroom concept to a
              pitch in front of real specialists.
            </p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            {covers.map((c) => (
              <div
                key={c.title}
                className="rounded-xl border bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <c.icon className="size-5" aria-hidden />
                </div>
                <h3 className="mt-4 text-lg font-semibold">{c.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {c.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Schedule */}
      <section id="schedule" className="scroll-mt-20 bg-muted/40 py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              One working week. Six days. One pitch.
            </h2>
            <p className="mt-4 text-muted-foreground">
              About 7 hours total, spread over one working week and a finale —
              designed to fit around the school day.
            </p>
          </div>
          <ol className="mx-auto mt-12 max-w-3xl space-y-0">
            {schedule.map((s, i) => (
              <li key={s.day} className="relative flex gap-5 pb-10 last:pb-0">
                {i < schedule.length - 1 && (
                  <span
                    className="absolute left-[22px] top-12 h-full w-px bg-border"
                    aria-hidden
                  />
                )}
                <span className="flex size-11 shrink-0 items-center justify-center rounded-full border-2 border-primary/30 bg-background text-sm font-bold text-primary">
                  {i + 1}
                </span>
                <div className="pt-1.5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                    {s.day}
                  </p>
                  <h3 className="mt-0.5 font-semibold">{s.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {s.detail}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Participants gain */}
      <section id="benefits" className="scroll-mt-20 py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              What participants gain
            </h2>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {gains.map((g) => (
              <div key={g.title} className="rounded-xl border bg-card p-6">
                <div className="flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <g.icon className="size-5" aria-hidden />
                </div>
                <h3 className="mt-4 font-semibold">{g.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {g.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Prize callout */}
      <section id="prizes" className="scroll-mt-20 pb-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="overflow-hidden rounded-2xl bg-primary px-6 py-12 text-primary-foreground sm:px-12">
            <div className="grid items-center gap-8 md:grid-cols-2">
              <div>
                <h2 className="text-3xl font-bold tracking-tight">
                  Real judges. Real stakes.
                </h2>
                <p className="mt-4 text-primary-foreground/90">
                  Final presentations are judged by a panel of industrialists
                  and field specialists. The top three teams share a
                  ₹15,000 prize pool — ₹5,000 each — and every team gets
                  professional feedback they can build on.
                </p>
                <Button
                  asChild
                  size="lg"
                  variant="secondary"
                  className="mt-6"
                >
                  <Link href="/contact">
                    Bring Innovation Tank to your school
                  </Link>
                </Button>
              </div>
              <dl className="grid grid-cols-2 gap-4">
                <div className="rounded-xl bg-primary-foreground/10 p-5">
                  <dt className="flex items-center gap-2 text-sm text-primary-foreground/80">
                    <IndianRupee className="size-4" aria-hidden /> Prize pool
                  </dt>
                  <dd className="mt-1 text-3xl font-bold">₹15,000</dd>
                </div>
                <div className="rounded-xl bg-primary-foreground/10 p-5">
                  <dt className="flex items-center gap-2 text-sm text-primary-foreground/80">
                    <Trophy className="size-4" aria-hidden /> Winning teams
                  </dt>
                  <dd className="mt-1 text-3xl font-bold">Top 3</dd>
                </div>
                <div className="col-span-2 rounded-xl bg-primary-foreground/10 p-5">
                  <dt className="flex items-center gap-2 text-sm text-primary-foreground/80">
                    <CalendarDays className="size-4" aria-hidden /> Judged at
                  </dt>
                  <dd className="mt-1 text-xl font-semibold">
                    Final presentations &amp; valedictory ceremony
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </section>

      {/* Founders / mission close */}
      <section className="border-t bg-muted/40 py-16">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Why we do this
          </h2>
          <p className="mt-4 text-muted-foreground">
            At Propel, we firmly believe in increasing access to opportunities
            beyond the classroom for all students. Innovation Tank is our
            first step: an engaging, productive opportunity for future
            innovators — conducted by founders Vairavan Subramanian and
            Advaith Chittezhi.
          </p>
          <Button asChild size="lg" className="mt-8">
            <Link href="/contact">
              Join the mission
              <ArrowRight className="ml-1 size-4" aria-hidden />
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
}
