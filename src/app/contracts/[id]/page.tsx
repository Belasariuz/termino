import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUrgencyStatus, URGENCY_STYLES, type Contract } from "@/lib/contracts";
import { DeleteContractButton } from "./delete-contract-button";
import { ValidateButton } from "./validate-button";

function formatDatum(datum: string) {
  return new Date(datum).toLocaleDateString("nl-NL", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatBedrag(bedrag: number | null) {
  if (bedrag === null) return "-";
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
  }).format(bedrag);
}

const FIELD_LABELS: Record<string, string> = {
  partij: "Contractpartij",
  type: "Contracttype",
  begindatum: "Begindatum",
  einddatum: "Einddatum",
  opzegtermijn_dagen: "Opzegtermijn",
  verlengingswijze: "Verlengingswijze",
  contractwaarde: "Contractwaarde",
};

function formatFieldValue(contract: Contract, field: string) {
  switch (field) {
    case "begindatum":
    case "einddatum":
      return formatDatum(contract[field]);
    case "opzegtermijn_dagen":
      return `${contract.opzegtermijn_dagen} dagen`;
    case "verlengingswijze":
      return contract.verlengingswijze === "stilzwijgend" ? "Stilzwijgend" : "Actief";
    case "contractwaarde":
      return formatBedrag(contract.contractwaarde);
    default:
      return String(contract[field as keyof Contract] ?? "-");
  }
}

export default async function ContractDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: contract } = await supabase
    .from("contracts")
    .select("*")
    .eq("id", id)
    .single<Contract>();

  if (!contract) {
    notFound();
  }

  let pdfUrl: string | null = null;
  if (contract.pdf_url) {
    const { data } = await supabase.storage
      .from("contracts")
      .createSignedUrl(contract.pdf_url, 60 * 10);
    pdfUrl = data?.signedUrl ?? null;
  }

  const fieldOrder = [
    "partij",
    "type",
    "begindatum",
    "einddatum",
    "opzegtermijn_dagen",
    "verlengingswijze",
    "contractwaarde",
  ];

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <Link href="/" className="mb-4 inline-block text-sm text-gray-500 hover:text-gray-900">
        &larr; Terug naar dashboard
      </Link>

      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">{contract.partij}</h1>
        <div className="flex items-center gap-3">
          {pdfUrl && (
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Origineel PDF bekijken
            </a>
          )}
          <Link
            href={`/contracts/${contract.id}/edit`}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Bewerken
          </Link>
          <DeleteContractButton
            contractId={contract.id}
            contractPartij={contract.partij}
            pdfPath={contract.pdf_url}
          />
        </div>
      </div>

      {!contract.gevalideerd && (
        <div className="mb-4 flex items-center justify-between gap-3 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">
          <span>
            ⚠️ Dit contract is nog niet gevalideerd — de gegevens zijn automatisch
            door AI ingevuld en nog niet expliciet gecontroleerd.
          </span>
          <ValidateButton contractId={contract.id} />
        </div>
      )}

      <div className="mb-6 flex items-center justify-between rounded-md bg-white p-4 text-sm text-gray-600 shadow-sm">
        <p>
          Opzegdeadline: <span className="font-medium text-gray-900">{formatDatum(contract.opzegdeadline)}</span>
        </p>
        {(() => {
          const status = getUrgencyStatus(contract.opzegdeadline);
          const style = URGENCY_STYLES[status];
          return (
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${style.badge}`}
            >
              <span className={`h-2 w-2 rounded-full ${style.dot}`} />
              {style.label}
            </span>
          );
        })()}
      </div>

      <h2 className="mb-3 text-lg font-semibold text-gray-900">
        AI-verantwoording per veld
      </h2>
      <p className="mb-4 text-sm text-gray-500">
        Hier zie je precies hoe de AI elk veld heeft bepaald: de gekozen waarde, de
        betrouwbaarheidsscore en een toelichting op basis van het brondocument.
      </p>

      {!contract.ai_confidence && !contract.ai_reasoning ? (
        <div className="rounded-md border border-dashed border-gray-300 bg-white p-6 text-center text-sm text-gray-500">
          Dit contract is handmatig ingevoerd — er is geen AI-verantwoording beschikbaar.
        </div>
      ) : (
        <div className="space-y-3">
          {fieldOrder.map((field) => {
            const score = contract.ai_confidence?.[field];
            const explanation = contract.ai_reasoning?.[field];
            const isLow = typeof score === "number" && score < 0.7;

            return (
              <div
                key={field}
                className={`rounded-md border p-4 ${
                  isLow ? "border-amber-400 bg-amber-50" : "border-gray-200 bg-white"
                }`}
              >
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">
                    {FIELD_LABELS[field]}
                  </span>
                  {typeof score === "number" && (
                    <span
                      className={`text-xs font-medium ${
                        isLow ? "text-amber-700" : "text-gray-500"
                      }`}
                    >
                      Betrouwbaarheid: {Math.round(score * 100)}%
                    </span>
                  )}
                </div>
                <p className="mb-1 text-sm text-gray-700">
                  {formatFieldValue(contract, field)}
                </p>
                {explanation && (
                  <p className="text-sm italic text-gray-500">{explanation}</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
