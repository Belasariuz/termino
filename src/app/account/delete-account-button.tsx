"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function DeleteAccountButton() {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    const firstConfirm = window.confirm(
      "Weet je zeker dat je je Concq-account wilt verwijderen? Al je contracten en gegevens worden definitief gewist.",
    );
    if (!firstConfirm) return;

    const secondConfirm = window.confirm(
      "Dit kan niet ongedaan worden gemaakt. Weet je het echt zeker?",
    );
    if (!secondConfirm) return;

    setDeleting(true);
    setError(null);

    const res = await fetch("/api/account/delete", { method: "POST" });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "Verwijderen van account is mislukt.");
      setDeleting(false);
      return;
    }

    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div>
      <button
        onClick={handleDelete}
        disabled={deleting}
        className="rounded-md border border-red-300 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
      >
        {deleting ? "Bezig met verwijderen..." : "Account definitief verwijderen"}
      </button>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
