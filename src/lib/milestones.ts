export const MILESTONE_STAGES = [
  { key: "problem_id", label: "Problem Identification" },
  { key: "research", label: "Research" },
  { key: "prototype", label: "Prototype" },
  { key: "pitch", label: "Pitch" },
  { key: "final", label: "Final Presentation" },
] as const;

export type MilestoneStageKey = (typeof MILESTONE_STAGES)[number]["key"];

export function stageLabel(key: string): string {
  return MILESTONE_STAGES.find((s) => s.key === key)?.label ?? key;
}

/** Human summary of where a project is, from its milestone rows. */
export function currentStage(
  milestones: { stage: string; completed_at: string | null }[]
): { label: string; completedCount: number; total: number } {
  const order = MILESTONE_STAGES.map((s) => s.key as string);
  const sorted = [...milestones].sort(
    (a, b) => order.indexOf(a.stage) - order.indexOf(b.stage)
  );
  const completedCount = sorted.filter((m) => m.completed_at).length;
  if (completedCount === sorted.length && sorted.length > 0) {
    return { label: "Completed", completedCount, total: sorted.length };
  }
  const next = sorted.find((m) => !m.completed_at);
  return {
    label: next ? stageLabel(next.stage) : "Not started",
    completedCount,
    total: sorted.length,
  };
}
