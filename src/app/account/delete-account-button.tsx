"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { dangerButtonClass, inputClass, labelClass } from "@/components/ui";

export function DeleteAccountButton() {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [wachtwoord, setWachtwoord] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function startConfirm() {
    const firstConfirm = window.confirm(
      "Weet je zeker dat je je Conq-account wilt verwijderen? Al je contracten en gegevens worden definitief gewist.",
    );
    if (!firstConfirm) return;

    const secondConfirm = window.confirm(
      "Dit kan niet ongedaan worden gemaakt. Weet je het echt zeker?",
    );
    if (!secondConfirm) return;

    setError(null);
    setConfirming(true);
  }

  async function handleDelete() {
    setDeleting(true);
    setError(null);

    const res = await fetch("/api/account/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ wachtwoord }),
    });
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

  if (!confirming) {
    return (
      <div>
        <button onClick={startConfirm} className={dangerButtonClass}>
          Account definitief verwijderen
        </button>
      </div>
    );
  }

  return (
    <div>
      <label className={labelClass}>Wachtwoord ter bevestiging</label>
      <input
        type="password"
        value={wachtwoord}
        onChange={(e) => setWachtwoord(e.target.value)}
        className={inputClass + " mb-3"}
        autoFocus
      />
      <div className="flex gap-2">
        <button
          onClick={handleDelete}
          disabled={deleting || wachtwoord.length === 0}
          className={dangerButtonClass}
        >
          {deleting ? "Bezig met verwijderen..." : "Bevestig verwijdering"}
        </button>
        <button
          onClick={() => {
            setConfirming(false);
            setWachtwoord("");
            setError(null);
          }}
          disabled={deleting}
          className="rounded-[10px] border-[1.5px] border-[#E4E7EF] bg-white px-4 py-2.5 text-sm font-semibold text-[#6B7383] transition hover:bg-[#FAFBFD] disabled:opacity-50"
        >
          Annuleren
        </button>
      </div>
      {error && <p className="mt-2 text-sm text-[#DC2648]">{error}</p>}
    </div>
  );
}
