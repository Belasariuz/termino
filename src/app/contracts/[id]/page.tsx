import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUrgencyStatus, URGENCY_STYLES, type Contract } from "@/lib/contracts";
import { DeleteContractButton } from "./delete-contract-button";
import { ValidateButton } from "./validate-button";
import { BackLink, Card, secondaryButtonClass } from "@/components/ui";

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

  const status = getUrgencyStatus(contract.opzegdeadline);
  const style = URGENCY_STYLES[status];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-9 sm:px-8">
      <BackLink href="/">Terug naar overzicht</BackLink>

      <div className="mb-1 flex items-start justify-between gap-4">
        <div>
          <div className="mb-1.5 font-mono text-xs font-bold uppercase tracking-wide text-[#8A93A3]">
            {contract.type}
          </div>
          <h1 className="min-w-0 truncate font-display text-2xl font-bold tracking-tight text-[#12141C] sm:text-[26px]">
            {contract.partij}
          </h1>
        </div>
        <span
          className={`inline-block shrink-0 whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-semibold ${style.badge}`}
        >
          {style.label}
        </span>
      </div>

      <div className="mb-6 mt-4 flex flex-wrap items-center gap-3">
        {pdfUrl && (
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={secondaryButtonClass + " !px-3.5 !py-2 text-sm"}
          >
            Origineel PDF bekijken
          </a>
        )}
        <a href={`/contracts/${contract.id}/edit`} className={secondaryButtonClass + " !px-3.5 !py-2 text-sm"}>
          Bewerken
        </a>
        <DeleteContractButton
          contractId={contract.id}
          contractPartij={contract.partij}
          pdfPath={contract.pdf_url}
        />
      </div>

      {!contract.gevalideerd && (
        <div className="mb-6 flex items-center justify-between gap-3 rounded-[11px] border border-amber-300 bg-amber-50 p-3.5 text-sm text-amber-800">
          <span>
            ⚠️ Dit contract is nog niet gevalideerd — de gegevens zijn automatisch
            door AI ingevuld en nog niet expliciet gecontroleerd.
          </span>
          <ValidateButton contractId={contract.id} />
        </div>
      )}

      <Card className="mb-8 grid grid-cols-1 gap-x-7 gap-y-5 p-6 sm:grid-cols-2 sm:p-7">
        <div>
          <div className="mb-1 text-xs uppercase tracking-wide text-[#8A93A3]">Einddatum</div>
          <div className="font-mono text-[15px] font-semibold text-[#12141C]">
            {formatDatum(contract.einddatum)}
          </div>
        </div>
        <div>
          <div className="mb-1 text-xs uppercase tracking-wide text-[#8A93A3]">Opzegdeadline</div>
          <div className="font-mono text-[15px] font-semibold text-[#12141C]">
            {formatDatum(contract.opzegdeadline)}
          </div>
        </div>
        <div>
          <div className="mb-1 text-xs uppercase tracking-wide text-[#8A93A3]">Opzegtermijn</div>
          <div className="text-[15px] font-semibold text-[#12141C]">
            {contract.opzegtermijn_dagen} dagen
          </div>
        </div>
        <div>
          <div className="mb-1 text-xs uppercase tracking-wide text-[#8A93A3]">Verlengingswijze</div>
          <div className="text-[15px] font-semibold text-[#12141C]">
            {contract.verlengingswijze === "stilzwijgend" ? "Stilzwijgend" : "Actief"}
          </div>
        </div>
        <div>
          <div className="mb-1 text-xs uppercase tracking-wide text-[#8A93A3]">Contractwaarde</div>
          <div className="font-mono text-[15px] font-semibold text-[#12141C]">
            {formatBedrag(contract.contractwaarde)}
          </div>
        </div>
      </Card>

      <h2 className="mb-3 font-display text-lg font-bold text-[#12141C]">
        AI-verantwoording per veld
      </h2>
      <p className="mb-4 text-sm text-[#6B7383]">
        Hier zie je precies hoe de AI elk veld heeft bepaald: de gekozen waarde, de
        betrouwbaarheidsscore en een toelichting op basis van het brondocument.
      </p>

      {!contract.ai_confidence && !contract.ai_reasoning ? (
        <div className="rounded-2xl border-[1.5px] border-dashed border-[#D6DAE4] bg-white p-6 text-center text-sm text-[#6B7383]">
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
                className={`rounded-[14px] border p-4 ${
                  isLow ? "border-amber-400 bg-amber-50" : "border-[#E7E9F0] bg-white"
                }`}
              >
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-sm font-medium text-[#12141C]">
                    {FIELD_LABELS[field]}
                  </span>
                  {typeof score === "number" && (
                    <span
                      className={`text-xs font-medium ${
                        isLow ? "text-amber-700" : "text-[#8A93A3]"
                      }`}
                    >
                      Betrouwbaarheid: {Math.round(score * 100)}%
                    </span>
                  )}
                </div>
                <p className="mb-1 text-sm text-[#3A3F4B]">
                  {formatFieldValue(contract, field)}
                </p>
                {explanation && (
                  <p className="text-sm italic text-[#8A93A3]">{explanation}</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
