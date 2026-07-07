"use client";

import { useState } from "react";
import { CalendarDays, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Embeds the mentor's Cal.com booking page. Cal.com handles availability,
 * timezone conversion for the viewer, and Google Meet link generation;
 * our webhook mirrors the result into mentor_bookings.
 */
export function BookingEmbed({ calUsername }: { calUsername: string }) {
  const [open, setOpen] = useState(false);
  const url = `https://cal.com/${encodeURIComponent(calUsername)}`;

  return (
    <div className="w-full">
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button className="w-full sm:w-auto" onClick={() => setOpen((v) => !v)}>
          <CalendarDays className="mr-2 size-4" aria-hidden />
          {open ? "Hide booking calendar" : "Book a session"}
        </Button>
        <Button asChild variant="outline" className="w-full sm:w-auto">
          <a href={url} target="_blank" rel="noopener noreferrer">
            Open in new tab
            <ExternalLink className="ml-2 size-4" aria-hidden />
          </a>
        </Button>
      </div>
      {open && (
        <div className="mt-4 overflow-hidden rounded-xl border">
          <iframe
            src={`${url}?embed=true`}
            title={`Book a session with ${calUsername}`}
            className="h-[640px] w-full"
            loading="lazy"
          />
        </div>
      )}
      <p className="mt-2 text-xs text-muted-foreground">
        Times are shown in your local timezone automatically. A Google Meet
        link is emailed to you and appears under My Sessions once confirmed.
      </p>
    </div>
  );
}
