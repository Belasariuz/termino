"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function NewContractPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("Je bent niet ingelogd.");
      setSaving(false);
      return;
    }

    const { error: insertError } = await supabase.from("contracts").insert({
      user_id: user.id,
      partij: formData.get("partij"),
      type: formData.get("type"),
      begindatum: formData.get("begindatum"),
      einddatum: formData.get("einddatum"),
      opzegtermijn_dagen: Number(formData.get("opzegtermijn_dagen")),
      verlengingswijze: formData.get("verlengingswijze"),
      contractwaarde: formData.get("contractwaarde")
        ? Number(formData.get("contractwaarde"))
        : null,
    });

    if (insertError) {
      setError(insertError.message);
      setSaving(false);
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <main className="mx-auto max-w-xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-semibold text-gray-900">
        Nieuw contract
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Contractpartij
          </label>
          <input
            name="partij"
            required
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Contracttype
          </label>
          <input
            name="type"
            required
            placeholder="Bijv. huurcontract, onderhoudscontract"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Begindatum
            </label>
            <input
              type="date"
              name="begindatum"
              required
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Einddatum
            </label>
            <input
              type="date"
              name="einddatum"
              required
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Opzegtermijn (dagen)
            </label>
            <input
              type="number"
              name="opzegtermijn_dagen"
              required
              min={0}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Verlengingswijze
            </label>
            <select
              name="verlengingswijze"
              required
              defaultValue="stilzwijgend"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none"
            >
              <option value="stilzwijgend">Stilzwijgend</option>
              <option value="actief">Actief</option>
            </select>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Contractwaarde (EUR, optioneel)
          </label>
          <input
            type="number"
            step="0.01"
            name="contractwaarde"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
          >
            {saving ? "Bezig met opslaan..." : "Contract opslaan"}
          </button>
          <a
            href="/"
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Annuleren
          </a>
        </div>
      </form>
    </main>
  );
}
