"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { dangerButtonClass } from "@/components/ui";

export function DeleteContractButton({
  contractId,
  contractPartij,
  pdfPath,
}: {
  contractId: string;
  contractPartij: string;
  pdfPath: string | null;
}) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    const confirmed = window.confirm(
      `Weet je zeker dat je het contract met "${contractPartij}" wilt verwijderen? Dit kan niet ongedaan worden gemaakt.`,
    );
    if (!confirmed) return;

    setDeleting(true);
    setError(null);

    const supabase = createClient();

    const { error: deleteError } = await supabase
      .from("contracts")
      .delete()
      .eq("id", contractId);

    if (deleteError) {
      setError(deleteError.message);
      setDeleting(false);
      return;
    }

    if (pdfPath) {
      await supabase.storage.from("contracts").remove([pdfPath]);
    }

    router.push("/");
    router.refresh();
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button onClick={handleDelete} disabled={deleting} className={dangerButtonClass}>
        {deleting ? "Bezig met verwijderen..." : "Contract verwijderen"}
      </button>
      {error && <p className="text-xs text-[#DC2648]">{error}</p>}
    </div>
  );
}
