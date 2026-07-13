export type Category = {
  id: string;
  user_id: string;
  naam: string;
  created_at: string;
};

export type Contract = {
  id: string;
  user_id: string;
  partij: string;
  type: string;
  begindatum: string;
  einddatum: string;
  opzegtermijn_dagen: number;
  verlengingswijze: "stilzwijgend" | "actief";
  contractwaarde: number | null;
  opzegdeadline: string;
  status: string;
  pdf_url: string | null;
  ai_confidence: Record<string, number> | null;
  ai_reasoning: Record<string, string> | null;
  gevalideerd: boolean;
  created_at: string;
};

export type UrgencyStatus = "verlopen" | "urgent" | "aandacht" | "rustig";

export function getUrgencyStatus(opzegdeadline: string): UrgencyStatus {
  const deadline = new Date(opzegdeadline);
  const today = new Date();
  deadline.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  const daysUntil = Math.round(
    (deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (daysUntil < 0) return "verlopen";
  if (daysUntil <= 30) return "urgent";
  if (daysUntil <= 90) return "aandacht";
  return "rustig";
}

export const URGENCY_STYLES: Record<
  UrgencyStatus,
  { dot: string; badge: string; label: string }
> = {
  verlopen: {
    dot: "bg-[#DC2648]",
    badge: "bg-[rgba(220,38,72,0.1)] text-[#DC2648]",
    label: "Deadline verstreken",
  },
  urgent: {
    dot: "bg-[#DC2648]",
    badge: "bg-[rgba(220,38,72,0.1)] text-[#DC2648]",
    label: "Binnen 30 dagen",
  },
  aandacht: {
    dot: "bg-[#B4740E]",
    badge: "bg-[rgba(180,116,14,0.1)] text-[#B4740E]",
    label: "Binnen 90 dagen",
  },
  rustig: {
    dot: "bg-[#16A34A]",
    badge: "bg-[rgba(22,163,74,0.1)] text-[#16A34A]",
    label: "Ruim op tijd",
  },
};
