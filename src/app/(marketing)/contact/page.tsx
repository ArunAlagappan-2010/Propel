import type { Metadata } from "next";
import { Phone } from "lucide-react";
import { ContactForm } from "@/components/marketing/contact-form";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Partner with Propel — bring Innovation Tank to your school, volunteer as a mentor, or sponsor a program.",
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <div className="grid gap-12 lg:grid-cols-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Partner with us
          </h1>
          <p className="mt-4 max-w-lg text-muted-foreground">
            Whether you&apos;re a school that wants Innovation Tank for your
            students, a specialist willing to mentor or judge, or a sponsor
            who believes in accessible education — we&apos;d love to hear from
            you.
          </p>
          <div className="mt-8 space-y-4 text-sm">
            <p className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Phone className="size-4" aria-hidden />
              </span>
              <a
                href="tel:+917994326054"
                className="font-medium hover:text-primary"
              >
                +91 79943 26054
              </a>
            </p>
            <p className="text-muted-foreground">
              Conducted by Vairavan Subramanian &amp; Advaith Chittezhi.
            </p>
          </div>
        </div>
        <ContactForm />
      </div>
    </div>
  );
}
