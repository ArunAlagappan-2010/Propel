"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, Rocket, LogOut } from "lucide-react";
import { DashboardNav, type NavItem } from "@/components/dashboard/nav";
import { Button } from "@/components/ui/button";

/**
 * Responsive authenticated shell: fixed sidebar on desktop,
 * slide-over drawer on mobile. Used by both user and admin areas
 * (nav items differ per role).
 */
export function DashboardShell({
  items,
  userName,
  roleLabel,
  signOutAction,
  children,
}: {
  items: NavItem[];
  userName: string;
  roleLabel: string;
  signOutAction: () => Promise<void>;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center gap-2 border-b px-4">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 font-bold text-primary"
          onClick={() => setOpen(false)}
        >
          <Rocket className="size-5" aria-hidden />
          Propel
        </Link>
      </div>
      <div className="flex-1 overflow-y-auto p-3">
        <DashboardNav items={items} onNavigate={() => setOpen(false)} />
      </div>
      <div className="border-t p-3">
        <p className="truncate px-3 text-sm font-medium">{userName}</p>
        <p className="px-3 text-xs capitalize text-muted-foreground">
          {roleLabel}
        </p>
        <form action={signOutAction} className="mt-2">
          <Button
            type="submit"
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 text-muted-foreground"
          >
            <LogOut className="size-4" aria-hidden />
            Sign out
          </Button>
        </form>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-dvh">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 border-r bg-sidebar md:block">
        {sidebar}
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            aria-label="Close menu"
            className="absolute inset-0 bg-black/50"
            onClick={() => setOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 w-72 max-w-[85vw] bg-background shadow-xl">
            {sidebar}
            <button
              type="button"
              aria-label="Close menu"
              className="absolute right-3 top-4 flex size-9 items-center justify-center rounded-md hover:bg-muted"
              onClick={() => setOpen(false)}
            >
              <X className="size-5" />
            </button>
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar */}
        <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur md:hidden">
          <button
            type="button"
            aria-label="Open menu"
            className="flex size-10 items-center justify-center rounded-md hover:bg-muted"
            onClick={() => setOpen(true)}
          >
            <Menu className="size-5" />
          </button>
          <Link
            href="/dashboard"
            className="flex items-center gap-2 font-bold text-primary"
          >
            <Rocket className="size-5" aria-hidden />
            Propel
          </Link>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
