"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function ValidateButton({ contractId }: { contractId: string }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  async function handleValidate() {
    setSaving(true);
    const supabase = createClient();
    await supabase.from("contracts").update({ gevalideerd: true }).eq("id", contractId);
    setSaving(false);
    router.refresh();
  }

  return (
    <button
      onClick={handleValidate}
      disabled={saving}
      className="rounded-md bg-amber-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-50"
    >
      {saving ? "Bezig..." : "Markeer als gevalideerd"}
    </button>
  );
}
