import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SignOutButton } from "./sign-out-button";
import { getUrgencyStatus, URGENCY_STYLES, type Contract } from "@/lib/contracts";

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

function StatsOverview({ stats }: { stats: ReturnType<typeof computeStats> }) {
  return (
    <div className="mb-8 space-y-4">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-xs font-medium text-gray-500">Totaal aantal contracten</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900">{stats.totalCount}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-xs font-medium text-gray-500">Totale contractwaarde</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900">
            {formatBedrag(stats.totalValue)}
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-xs font-medium text-gray-500">Nog te valideren</p>
          <p
            className={`mt-1 text-2xl font-semibold ${
              stats.needsValidation > 0 ? "text-amber-600" : "text-gray-900"
            }`}
          >
            {stats.needsValidation}
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-xs font-medium text-gray-500">Vragen om actie (≤ 30 dagen)</p>
          <p
            className={`mt-1 text-2xl font-semibold ${
              stats.needsAttention > 0 ? "text-red-600" : "text-gray-900"
            }`}
          >
            {stats.needsAttention}
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white">
        <div className="border-b border-gray-100 px-4 py-3">
          <h2 className="text-sm font-semibold text-gray-900">Per categorie</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="px-4 py-2 font-medium">Categorie</th>
                <th className="px-4 py-2 font-medium">Aantal</th>
                <th className="px-4 py-2 font-medium">Totale waarde</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {stats.categories.map((category) => (
                <tr key={category.type}>
                  <td className="px-4 py-2 text-gray-900">{category.type}</td>
                  <td className="px-4 py-2 text-gray-600">{category.count}</td>
                  <td className="px-4 py-2 text-gray-600">{formatBedrag(category.value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
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
      <p className="text-[11px] uppercase tracking-wide text-gray-400">{label}</p>
      <p className={emphasize ? "text-sm font-medium text-gray-900" : "text-sm text-gray-600"}>
        {children}
      </p>
    </div>
  );
}

function ContractRows({ contracts }: { contracts: Contract[] }) {
  return (
    <div className="space-y-3">
      {contracts.map((contract) => {
        const status = getUrgencyStatus(contract.opzegdeadline);
        const style = URGENCY_STYLES[status];

        return (
          <Link
            key={contract.id}
            href={`/contracts/${contract.id}`}
            className="flex flex-wrap items-center gap-x-6 gap-y-3 rounded-lg border border-gray-200 bg-white p-4 hover:bg-gray-50"
          >
            <span
              className={`inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${style.badge}`}
            >
              <span className={`h-2 w-2 rounded-full ${style.dot}`} />
              {style.label}
            </span>

            <span className="flex min-w-[10rem] flex-1 items-center gap-1.5 font-medium text-gray-900">
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
          </Link>
        );
      })}
    </div>
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

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10">
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Termino</h1>
          <p className="text-sm text-gray-500">
            Ingelogd als{" "}
            {(user?.user_metadata?.naam as string | undefined) ?? user?.email}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/contracts/new"
            className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
          >
            + Nieuw contract
          </Link>
          <Link
            href="/account"
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Account
          </Link>
          <SignOutButton />
        </div>
      </div>

      {contracts && contracts.length > 0 && (
        <StatsOverview stats={computeStats(contracts)} />
      )}

      {!contracts || contracts.length === 0 ? (
        <div className="flex flex-col items-center rounded-lg border border-dashed border-gray-300 bg-white p-12 text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-2xl">
            📄
          </div>
          <h2 className="mb-1 text-base font-semibold text-gray-900">
            Nog geen contracten
          </h2>
          <p className="mb-6 max-w-sm text-sm text-gray-500">
            Voeg je eerste contract toe door een PDF te uploaden — Termino haalt de
            belangrijkste velden er automatisch uit, of vul ze handmatig in.
          </p>
          <Link
            href="/contracts/new"
            className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
          >
            + Eerste contract toevoegen
          </Link>
        </div>
      ) : (
        <ContractRows contracts={contracts} />
      )}
    </main>
  );
}
