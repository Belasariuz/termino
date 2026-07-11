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
  created_at: string;
};
