"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { Category, Contract } from "@/lib/contracts";
import { BackLink, inputClass, labelClass, primaryButtonClass, secondaryButtonClass } from "@/components/ui";

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
    const {
      data: { user },
    } = await supabase.auth.getUser();
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
        gevalideerd_op: new Date().toISOString(),
        gevalideerd_door: user?.id ?? null,
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
    if (confidence && confidence[field] < LOW_CONFIDENCE_THRESHOLD) {
      return `${inputClass} !border-amber-400 !bg-amber-50`;
    }
    return inputClass;
  }

  if (loading) {
    return (
      <main className="mx-auto w-full max-w-xl px-4 py-10">
        <p className="text-sm text-[#6B7383]">Bezig met laden...</p>
      </main>
    );
  }

  if (error && !partij) {
    return (
      <main className="mx-auto w-full max-w-xl px-4 py-10">
        <p className="text-sm text-[#DC2648]">{error}</p>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-xl px-4 py-10 sm:px-8">
      <BackLink href={`/contracts/${params.id}`}>Terug naar contract</BackLink>
      <h1 className="mb-2 font-display text-2xl font-bold tracking-tight text-[#12141C]">
        Contract bewerken
      </h1>
      <p className="mb-7 text-sm text-[#6B7383]">
        Pas de gegevens van dit contract aan.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className={labelClass}>Contractpartij</label>
          <input
            required
            value={partij}
            onChange={(e) => setPartij(e.target.value)}
            className={fieldClass("partij")}
          />
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label className={labelClass + " !mb-0"}>Contracttype</label>
            <Link
              href="/categories"
              className="text-xs text-[#6B7383] hover:text-[#12141C] hover:underline"
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
            <label className={labelClass}>Begindatum</label>
            <input
              type="date"
              required
              value={begindatum}
              onChange={(e) => setBegindatum(e.target.value)}
              className={fieldClass("begindatum")}
            />
          </div>
          <div>
            <label className={labelClass}>Einddatum</label>
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
            <label className={labelClass}>Opzegtermijn (dagen)</label>
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
            <label className={labelClass}>Verlengingswijze</label>
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
          <label className={labelClass}>Contractwaarde (EUR, optioneel)</label>
          <input
            type="number"
            step="0.01"
            value={contractwaarde}
            onChange={(e) => setContractwaarde(e.target.value)}
            className={fieldClass("contractwaarde")}
          />
        </div>

        {error && <p className="text-sm text-[#DC2648]">{error}</p>}

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={saving} className={primaryButtonClass}>
            {saving ? "Bezig met opslaan..." : "Wijzigingen opslaan"}
          </button>
          <a href={`/contracts/${params.id}`} className={secondaryButtonClass}>
            Annuleren
          </a>
        </div>
      </form>
    </main>
  );
}
