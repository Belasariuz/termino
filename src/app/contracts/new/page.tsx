"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { Category } from "@/lib/contracts";

type Confidence = {
  partij: number;
  type: number;
  begindatum: number;
  einddatum: number;
  opzegtermijn_dagen: number;
  verlengingswijze: number;
  contractwaarde: number;
};

type Reasoning = {
  partij: string;
  type: string;
  begindatum: string;
  einddatum: string;
  opzegtermijn_dagen: string;
  verlengingswijze: string;
  contractwaarde: string;
};

type ExtractedFields = {
  partij: string;
  type: string;
  begindatum: string;
  einddatum: string;
  opzegtermijn_dagen: number;
  verlengingswijze: "stilzwijgend" | "actief";
  contractwaarde: number | null;
  confidence: Confidence;
  reasoning: Reasoning;
};

const LOW_CONFIDENCE_THRESHOLD = 0.7;

export default function NewContractPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [pdfPath, setPdfPath] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [confidence, setConfidence] = useState<Confidence | null>(null);
  const [reasoning, setReasoning] = useState<Reasoning | null>(null);
  const [reviewConfirmed, setReviewConfirmed] = useState(false);

  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

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
    async function loadCategories() {
      const supabase = createClient();
      const { data } = await supabase
        .from("categories")
        .select("*")
        .order("naam", { ascending: true })
        .returns<Category[]>();
      setCategories(data ?? []);
      if (data && data.length > 0) {
        setType((current) => current || data[0].naam);
      }
      setCategoriesLoading(false);
    }
    loadCategories();
  }, []);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setFileName(file.name);

    if (file.type !== "application/pdf") {
      setError("Alleen PDF-bestanden worden ondersteund.");
      e.target.value = "";
      setFileName(null);
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setError("Het bestand is groter dan 20 MB. Upload een kleinere PDF.");
      e.target.value = "";
      setFileName(null);
      return;
    }

    setExtracting(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/extract-contract", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      // De PDF kan al geupload zijn, ook als de AI-extractie zelf mislukte.
      // Bewaar het pad zodat het bestand niet kwijtraakt en het contract
      // alsnog handmatig kan worden opgeslagen met de PDF eraan gekoppeld.
      if (data.pdf_url) {
        setPdfPath(data.pdf_url);
      }

      if (!res.ok) {
        throw new Error(data.error ?? "AI-extractie is mislukt.");
      }
      const fields: ExtractedFields = data.fields;
      setPartij(fields.partij ?? "");
      const matchedCategory = categories.find(
        (c) => c.naam.toLowerCase() === fields.type?.toLowerCase(),
      );
      if (matchedCategory) {
        setType(matchedCategory.naam);
      }
      setBegindatum(fields.begindatum ?? "");
      setEinddatum(fields.einddatum ?? "");
      setOpzegtermijnDagen(String(fields.opzegtermijn_dagen ?? ""));
      setVerlengingswijze(fields.verlengingswijze ?? "stilzwijgend");
      setContractwaarde(
        fields.contractwaarde !== null && fields.contractwaarde !== undefined
          ? String(fields.contractwaarde)
          : "",
      );
      setConfidence(fields.confidence ?? null);
      setReasoning(fields.reasoning ?? null);
      setReviewConfirmed(false);
    } catch (err) {
      setError(
        err instanceof Error
          ? `AI-extractie mislukt: ${err.message}. Vul de velden handmatig in.`
          : "AI-extractie is mislukt. Vul de velden handmatig in.",
      );
    } finally {
      setExtracting(false);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError(null);

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
      partij,
      type,
      begindatum,
      einddatum,
      opzegtermijn_dagen: Number(opzegtermijnDagen),
      verlengingswijze,
      contractwaarde: contractwaarde ? Number(contractwaarde) : null,
      pdf_url: pdfPath,
      ai_confidence: confidence,
      ai_reasoning: reasoning,
      gevalideerd: confidence ? reviewConfirmed : true,
    });

    if (insertError) {
      setError(insertError.message);
      setSaving(false);
      return;
    }

    router.push("/");
    router.refresh();
  }

  function fieldClass(field: keyof Confidence) {
    const base =
      "w-full rounded-md border px-3 py-2 text-sm focus:border-gray-900 focus:outline-none";
    if (confidence && confidence[field] < LOW_CONFIDENCE_THRESHOLD) {
      return `${base} border-amber-400 bg-amber-50`;
    }
    return `${base} border-gray-300`;
  }

  return (
    <main className="mx-auto w-full max-w-xl px-4 py-10">
      <h1 className="mb-2 text-2xl font-semibold text-gray-900">Nieuw contract</h1>
      <p className="mb-6 text-sm text-gray-500">
        Upload een PDF om de velden automatisch te laten invullen, of vul ze handmatig in.
      </p>

      <label
        htmlFor="contract-pdf-input"
        className={`mb-6 flex cursor-pointer flex-col items-center gap-1 rounded-md border border-dashed border-gray-300 bg-white p-6 text-center hover:bg-gray-50 ${
          extracting ? "pointer-events-none opacity-60" : ""
        }`}
      >
        <span className="text-sm font-medium text-gray-700">Contract-PDF uploaden</span>
        <span className="text-sm text-gray-500">
          {fileName ?? "Klik om een PDF te kiezen"}
        </span>
        <input
          id="contract-pdf-input"
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
          disabled={extracting}
          className="sr-only"
        />
        {extracting && (
          <p className="mt-2 text-sm text-gray-500">
            Bezig met analyseren van het contract...
          </p>
        )}
        {confidence && (
          <p className="mt-2 text-sm text-amber-700">
            Velden met een gele achtergrond hebben een lage betrouwbaarheidsscore —
            controleer deze extra goed.
          </p>
        )}
      </label>

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
          {categoriesLoading ? (
            <p className="text-sm text-gray-500">Bezig met laden...</p>
          ) : categories.length === 0 ? (
            <p className="text-sm text-amber-700">
              Je hebt nog geen categorieën.{" "}
              <Link href="/categories" className="underline">
                Voeg er eerst een toe
              </Link>
              .
            </p>
          ) : (
            <select
              required
              value={type}
              onChange={(e) => setType(e.target.value)}
              className={fieldClass("type")}
            >
              {categories.map((category) => (
                <option key={category.id} value={category.naam}>
                  {category.naam}
                </option>
              ))}
            </select>
          )}
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

        {confidence && !reviewConfirmed && (
          <div className="flex items-start justify-between gap-2 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">
            <div className="flex items-start gap-2">
              <span aria-hidden>⚠️</span>
              <span>
                Controleer de automatisch ingevulde velden voordat je opslaat,
                vooral de velden met een gele achtergrond. Je kunt het contract
                ook later nog aanpassen via de contractpagina.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setReviewConfirmed(true)}
              className="shrink-0 text-xs font-medium text-amber-700 underline hover:text-amber-900"
            >
              Verbergen
            </button>
          </div>
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={saving || extracting || categories.length === 0}
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
