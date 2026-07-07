import type { Metadata } from "next";
import Link from "next/link";
import { Search } from "lucide-react";
import { format } from "date-fns";
import { createClient } from "@/lib/supabase/server";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const metadata: Metadata = { title: "Admin — Students" };

export default async function AdminStudentsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("profiles")
    .select("id, full_name, school_name, grade, created_at, parental_consent_confirmed")
    .eq("role", "student")
    .order("full_name")
    .limit(500);

  if (q) {
    query = query.or(`full_name.ilike.%${q}%,school_name.ilike.%${q}%`);
  }

  const { data: students } = await query;

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
        Students
      </h1>
      <p className="mt-2 text-muted-foreground">
        Every registered student. Click through for progress, scores, and
        engagement.
      </p>

      <form className="mt-6 flex max-w-md gap-2" action="/admin/students">
        <label htmlFor="student-search" className="sr-only">
          Search students
        </label>
        <Input
          id="student-search"
          name="q"
          defaultValue={q ?? ""}
          placeholder="Search by name or school…"
        />
        <Button type="submit" variant="outline">
          <Search className="size-4" aria-hidden />
          <span className="sr-only">Search</span>
        </Button>
      </form>

      <div className="mt-6 overflow-x-auto rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>School</TableHead>
              <TableHead>Grade</TableHead>
              <TableHead>Consent</TableHead>
              <TableHead>Joined</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(students ?? []).map((s) => (
              <TableRow key={s.id}>
                <TableCell className="font-medium">
                  <Link
                    href={`/admin/students/${s.id}`}
                    className="hover:text-primary hover:underline"
                  >
                    {s.full_name || "Unnamed"}
                  </Link>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {s.school_name ?? "—"}
                </TableCell>
                <TableCell>{s.grade ?? "—"}</TableCell>
                <TableCell>
                  {s.parental_consent_confirmed ? (
                    <span className="text-primary">Confirmed</span>
                  ) : (
                    <span className="text-destructive">Missing</span>
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {format(new Date(s.created_at), "d MMM yyyy")}
                </TableCell>
              </TableRow>
            ))}
            {(students ?? []).length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="py-10 text-center text-muted-foreground"
                >
                  {q ? `No students match “${q}”.` : "No students registered yet."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
