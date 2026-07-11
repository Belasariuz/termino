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
    dot: "bg-red-600",
    badge: "bg-red-100 text-red-800",
    label: "Deadline verstreken",
  },
  urgent: {
    dot: "bg-red-500",
    badge: "bg-red-100 text-red-700",
    label: "Binnen 30 dagen",
  },
  aandacht: {
    dot: "bg-amber-500",
    badge: "bg-amber-100 text-amber-800",
    label: "Binnen 90 dagen",
  },
  rustig: {
    dot: "bg-green-500",
    badge: "bg-green-100 text-green-800",
    label: "Ruim op tijd",
  },
};
