"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { Category, Contract } from "@/lib/contracts";

const LOW_CONFIDENCE_THRESHOLD = 0.7;

export default function EditContractPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confidence, setConfidence] = useState<Record<string, number> | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);

  const [partij, setPartij] = useState("");
  const [type, setType] = useState("");
  const [begindatum, setBegindatum] = useState("");
  const [einddatum, setEinddatum] = useState("");
  const [opzegtermijnDagen, setOpzegtermijnDagen] = useState("");
  const [verlengingswijze, setVerlengingswijze] = useState<"stilzwijgend" | "actief">(
    "stilzwijgend",
  );
  const [contractwaarde, setContractwaarde] = useState("");

  useEffect(() => {
    async function loadContract() {
      const supabase = createClient();
      const [{ data, error: fetchError }, { data: categoryData }] = await Promise.all([
        supabase.from("contracts").select("*").eq("id", params.id).single<Contract>(),
        supabase
          .from("categories")
          .select("*")
          .order("naam", { ascending: true })
          .returns<Category[]>(),
      ]);

      setCategories(categoryData ?? []);

      if (fetchError || !data) {
        setError("Contract niet gevonden.");
        setLoading(false);
        return;
      }

      setPartij(data.partij);
      setType(data.type);
      setBegindatum(data.begindatum);
      setEinddatum(data.einddatum);
      setOpzegtermijnDagen(String(data.opzegtermijn_dagen));
      setVerlengingswijze(data.verlengingswijze);
      setContractwaarde(
        data.contractwaarde !== null ? String(data.contractwaarde) : "",
      );
      setConfidence(data.ai_confidence);
      setLoading(false);
    }

    loadContract();
  }, [params.id]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("contracts")
      .update({
        partij,
        type,
        begindatum,
        einddatum,
        opzegtermijn_dagen: Number(opzegtermijnDagen),
        verlengingswijze,
        contractwaarde: contractwaarde ? Number(contractwaarde) : null,
        gevalideerd: true,
      })
      .eq("id", params.id);

    if (updateError) {
      setError(updateError.message);
      setSaving(false);
      return;
    }

    router.push(`/contracts/${params.id}`);
    router.refresh();
  }

  function fieldClass(field: string) {
    const base =
      "w-full rounded-md border px-3 py-2 text-sm focus:border-gray-900 focus:outline-none";
    if (confidence && confidence[field] < LOW_CONFIDENCE_THRESHOLD) {
      return `${base} border-amber-400 bg-amber-50`;
    }
    return `${base} border-gray-300`;
  }

  if (loading) {
    return (
      <main className="mx-auto w-full max-w-xl px-4 py-10">
        <p className="text-sm text-gray-500">Bezig met laden...</p>
      </main>
    );
  }

  if (error && !partij) {
    return (
      <main className="mx-auto w-full max-w-xl px-4 py-10">
        <p className="text-sm text-red-600">{error}</p>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-xl px-4 py-10">
      <h1 className="mb-2 text-2xl font-semibold text-gray-900">Contract bewerken</h1>
      <p className="mb-6 text-sm text-gray-500">
        Pas de gegevens van dit contract aan.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Contractpartij
          </label>
          <input
            required
            value={partij}
            onChange={(e) => setPartij(e.target.value)}
            className={fieldClass("partij")}
          />
        </div>

        <div>
          <div className="mb-1 flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-700">
              Contracttype
            </label>
            <Link
              href="/categories"
              className="text-xs text-gray-500 hover:text-gray-900 hover:underline"
            >
              Categorieën beheren
            </Link>
          </div>
          <select
            required
            value={type}
            onChange={(e) => setType(e.target.value)}
            className={fieldClass("type")}
          >
            {!categories.some((c) => c.naam === type) && type && (
              <option value={type}>{type} (verwijderd)</option>
            )}
            {categories.map((category) => (
              <option key={category.id} value={category.naam}>
                {category.naam}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Begindatum
            </label>
            <input
              type="date"
              required
              value={begindatum}
              onChange={(e) => setBegindatum(e.target.value)}
              className={fieldClass("begindatum")}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Einddatum
            </label>
            <input
              type="date"
              required
              value={einddatum}
              onChange={(e) => setEinddatum(e.target.value)}
              className={fieldClass("einddatum")}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Opzegtermijn (dagen)
            </label>
            <input
              type="number"
              required
              min={0}
              value={opzegtermijnDagen}
              onChange={(e) => setOpzegtermijnDagen(e.target.value)}
              className={fieldClass("opzegtermijn_dagen")}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Verlengingswijze
            </label>
            <select
              required
              value={verlengingswijze}
              onChange={(e) =>
                setVerlengingswijze(e.target.value as "stilzwijgend" | "actief")
              }
              className={fieldClass("verlengingswijze")}
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
            value={contractwaarde}
            onChange={(e) => setContractwaarde(e.target.value)}
            className={fieldClass("contractwaarde")}
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
          >
            {saving ? "Bezig met opslaan..." : "Wijzigingen opslaan"}
          </button>
          <a
            href={`/contracts/${params.id}`}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Annuleren
          </a>
        </div>
      </form>
    </main>
  );
}
