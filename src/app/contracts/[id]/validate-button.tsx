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
      className="rounded-[10px] bg-[#B4740E] px-3.5 py-2 text-sm font-semibold text-white hover:brightness-105 disabled:opacity-50"
    >
      {saving ? "Bezig..." : "Markeer als gevalideerd"}
    </button>
  );
}
