import { redirect } from "next/navigation";

// Individual statistics live on the student detail page — one canonical
// rollup view instead of two near-identical pages.
export default async function StatisticsStudentRedirect({
  params,
}: {
  params: Promise<{ studentId: string }>;
}) {
  const { studentId } = await params;
  redirect(`/admin/students/${studentId}`);
}
