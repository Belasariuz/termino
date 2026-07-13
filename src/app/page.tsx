import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SignOutButton } from "./sign-out-button";
import { getUrgencyStatus, URGENCY_STYLES, type Contract } from "@/lib/contracts";
import { Logo } from "@/components/logo";
import { Card, primaryButtonClass } from "@/components/ui";

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

function computeStats(contracts: Contract[]) {
  const totalCount = contracts.length;
  const totalValue = contracts.reduce((sum, c) => sum + (c.contractwaarde ?? 0), 0);
  const needsValidation = contracts.filter((c) => !c.gevalideerd).length;
  const needsAttention = contracts.filter((c) => {
    const status = getUrgencyStatus(c.opzegdeadline);
    return status === "urgent" || status === "verlopen";
  }).length;

  const byCategory = new Map<string, { count: number; value: number }>();
  for (const c of contracts) {
    const key = c.type || "Onbekend";
    const entry = byCategory.get(key) ?? { count: 0, value: 0 };
    entry.count += 1;
    entry.value += c.contractwaarde ?? 0;
    byCategory.set(key, entry);
  }
  const categories = Array.from(byCategory.entries())
    .map(([type, data]) => ({ type, ...data }))
    .sort((a, b) => b.value - a.value);

  return { totalCount, totalValue, needsValidation, needsAttention, categories };
}

function StatTile({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: React.ReactNode;
  tone?: "default" | "warning" | "danger";
}) {
  const toneClass =
    tone === "warning" ? "text-[#B4740E]" : tone === "danger" ? "text-[#DC2648]" : "text-[#12141C]";
  return (
    <Card className="p-4">
      <p className="text-xs font-medium text-[#8A93A3]">{label}</p>
      <p className={`mt-1 font-display text-2xl font-bold ${toneClass}`}>{value}</p>
    </Card>
  );
}

function StatsOverview({ stats }: { stats: ReturnType<typeof computeStats> }) {
  return (
    <div className="mb-8 space-y-4">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatTile label="Totaal aantal contracten" value={stats.totalCount} />
        <StatTile label="Totale contractwaarde" value={formatBedrag(stats.totalValue)} />
        <StatTile
          label="Nog te valideren"
          value={stats.needsValidation}
          tone={stats.needsValidation > 0 ? "warning" : "default"}
        />
        <StatTile
          label="Vragen om actie (≤ 30 dagen)"
          value={stats.needsAttention}
          tone={stats.needsAttention > 0 ? "danger" : "default"}
        />
      </div>

      <Card>
        <div className="border-b border-[#EEF0F5] px-5 py-3.5">
          <h2 className="font-display text-sm font-bold text-[#12141C]">Per categorie</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#FAFBFD] text-[#8A93A3]">
              <tr>
                <th className="px-5 py-2.5 font-medium">Categorie</th>
                <th className="px-5 py-2.5 font-medium">Aantal</th>
                <th className="px-5 py-2.5 font-medium">Totale waarde</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EEF0F5]">
              {stats.categories.map((category) => (
                <tr key={category.type}>
                  <td className="px-5 py-2.5 text-[#12141C]">{category.type}</td>
                  <td className="px-5 py-2.5 text-[#6B7383]">{category.count}</td>
                  <td className="px-5 py-2.5 text-[#6B7383]">{formatBedrag(category.value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function ContractField({
  label,
  children,
  emphasize,
}: {
  label: string;
  children: React.ReactNode;
  emphasize?: boolean;
}) {
  return (
    <div className="min-w-[7rem]">
      <p className="font-mono text-[11px] uppercase tracking-wide text-[#8A93A3]">{label}</p>
      <p
        className={
          emphasize
            ? "font-mono text-sm font-semibold text-[#12141C]"
            : "text-sm text-[#6B7383]"
        }
      >
        {children}
      </p>
    </div>
  );
}

function ContractRows({ contracts }: { contracts: Contract[] }) {
  return (
    <Card className="overflow-hidden">
      {contracts.map((contract, i) => {
        const status = getUrgencyStatus(contract.opzegdeadline);
        const style = URGENCY_STYLES[status];

        return (
          <Link
            key={contract.id}
            href={`/contracts/${contract.id}`}
            className={`flex flex-wrap items-center gap-x-6 gap-y-3 px-5 py-4 hover:bg-[#FAFBFD] ${
              i !== contracts.length - 1 ? "border-b border-[#EEF0F5]" : ""
            }`}
          >
            <span className={`h-2 w-2 shrink-0 rounded-full ${style.dot}`} />

            <span className="flex min-w-[10rem] flex-1 items-center gap-1.5 font-medium text-[#12141C]">
              <span className="truncate">{contract.partij}</span>
              {!contract.gevalideerd && (
                <span
                  className="shrink-0"
                  title="Nog niet gevalideerd"
                  aria-label="Nog niet gevalideerd"
                >
                  ⚠️
                </span>
              )}
            </span>

            <ContractField label="Type">{contract.type}</ContractField>
            <ContractField label="Einddatum">{formatDatum(contract.einddatum)}</ContractField>
            <ContractField label="Opzegtermijn">
              {contract.opzegtermijn_dagen} dagen
            </ContractField>
            <ContractField label="Opzegdeadline" emphasize>
              {formatDatum(contract.opzegdeadline)}
            </ContractField>
            <ContractField label="Verlenging">
              {contract.verlengingswijze === "stilzwijgend" ? "Stilzwijgend" : "Actief"}
            </ContractField>
            <ContractField label="Waarde">{formatBedrag(contract.contractwaarde)}</ContractField>

            <span
              className={`inline-block shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${style.badge}`}
            >
              {style.label}
            </span>
          </Link>
        );
      })}
    </Card>
  );
}

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: contracts } = await supabase
    .from("contracts")
    .select("*")
    .order("opzegdeadline", { ascending: true })
    .returns<Contract[]>();

  const naam = (user?.user_metadata?.naam as string | undefined) ?? user?.email ?? "";
  const initials = naam
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-9 sm:px-8">
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Logo />
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/contracts/new" className={primaryButtonClass}>
            + Nieuw contract
          </Link>
          <Link
            href="/account"
            className="rounded-[10px] border-[1.5px] border-[#E4E7EF] bg-white px-4 py-2.5 text-sm font-semibold text-[#6B7383] hover:bg-[#FAFBFD]"
          >
            Account
          </Link>
          <SignOutButton />
          <div className="flex h-[34px] w-[34px] items-center justify-center rounded-full border border-[#E4E7EF] bg-[#F0F1F6] text-[12.5px] font-semibold text-[#6B7383]">
            {initials || "?"}
          </div>
        </div>
      </div>

      {contracts && contracts.length > 0 && (
        <StatsOverview stats={computeStats(contracts)} />
      )}

      {!contracts || contracts.length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl border-[1.5px] border-dashed border-[#D6DAE4] bg-white p-14 text-center">
          <div className="mb-5 flex h-[52px] w-[52px] items-center justify-center rounded-[13px] border border-[#E4E7EF] bg-[#F4F5F9]">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 16V4M12 4l-4 4M12 4l4 4"
                stroke="#6D5EF5"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2"
                stroke="#6D5EF5"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <h2 className="mb-1 font-display text-base font-bold text-[#12141C]">
            Nog geen contracten
          </h2>
          <p className="mb-6 max-w-sm text-sm text-[#6B7383]">
            Voeg je eerste contract toe door een PDF te uploaden — Conq haalt de
            belangrijkste velden er automatisch uit, of vul ze handmatig in.
          </p>
          <Link href="/contracts/new" className={primaryButtonClass}>
            + Eerste contract toevoegen
          </Link>
        </div>
      ) : (
        <>
          <h1 className="mb-4 font-mono text-[12.5px] font-bold uppercase tracking-[.08em] text-[#8A93A3]">
            Jouw contracten
          </h1>
          <ContractRows contracts={contracts} />
        </>
      )}
    </main>
  );
}
