"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";

const links = [
  { href: "/#program", label: "The Program" },
  { href: "/#benefits", label: "Why Join" },
  { href: "/#schedule", label: "Schedule" },
  { href: "/contact", label: "Contact" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav
        className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6"
        aria-label="Main navigation"
      >
        <Link
          href="/"
          className="flex items-center gap-2 font-bold text-lg text-primary"
        >
          <Rocket className="size-6" aria-hidden />
          <span>
            Propel
            <span className="ml-2 hidden text-xs font-medium text-muted-foreground sm:inline">
              Science to Solutions
            </span>
          </span>
        </Link>

        <div className="hidden items-center gap-6 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {l.label}
            </Link>
          ))}
          <Button asChild size="sm">
            <Link href="/login">Sign in</Link>
          </Button>
        </div>

        <button
          type="button"
          className="inline-flex size-11 items-center justify-center rounded-md md:hidden"
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </nav>

      {open && (
        <div className="border-t bg-background md:hidden">
          <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-3">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                onClick={() => setOpen(false)}
              >
                {l.label}
              </Link>
            ))}
            <Button asChild className="mt-2">
              <Link href="/login" onClick={() => setOpen(false)}>
                Sign in
              </Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
