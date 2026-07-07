import Link from "next/link";
import { Phone, Rocket } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-muted/40">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-2 font-bold text-primary">
            <Rocket className="size-5" aria-hidden />
            Propel
          </div>
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">
            Science to Solutions. A student-led nonprofit bridging gaps in
            access to education for grade 8–9 students in underprivileged
            schools.
          </p>
        </div>

        <div>
          <h2 className="text-sm font-semibold">Program</h2>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>
              <Link href="/#program" className="hover:text-foreground">
                What we cover
              </Link>
            </li>
            <li>
              <Link href="/#schedule" className="hover:text-foreground">
                Weekly schedule
              </Link>
            </li>
            <li>
              <Link href="/#prizes" className="hover:text-foreground">
                Prizes &amp; judging
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-foreground">
                Partner with us
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-semibold">Contact &amp; legal</h2>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <Phone className="size-4" aria-hidden />
              <a href="tel:+917994326054" className="hover:text-foreground">
                +91 79943 26054
              </a>
            </li>
            <li>
              <Link href="/privacy-policy" className="hover:text-foreground">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/terms-of-service" className="hover:text-foreground">
                Terms of Service
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t">
        <p className="mx-auto max-w-6xl px-4 py-4 text-xs text-muted-foreground sm:px-6">
          © {new Date().getFullYear()} Propel — Vairavan Subramanian &amp;
          Advaith Chittezhi. Code licensed under MIT.
        </p>
      </div>
    </footer>
  );
}
