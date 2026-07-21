"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  formatBedrag,
  formatDatum,
  getUrgencyStatus,
  URGENCY_STYLES,
  type Contract,
  type UrgencyStatus,
} from "@/lib/contracts";
import { Card, inputClass } from "@/components/ui";

const selectClass = inputClass.replace("w-full", "w-auto");

type SortOption =
  | "deadline_asc"
  | "deadline_desc"
  | "waarde_desc"
  | "waarde_asc"
  | "partij_asc";

const SORT_LABELS: Record<SortOption, string> = {
  deadline_asc: "Opzegdeadline (oplopend)",
  deadline_desc: "Opzegdeadline (aflopend)",
  waarde_desc: "Waarde (hoog naar laag)",
  waarde_asc: "Waarde (laag naar hoog)",
  partij_asc: "Partij (A-Z)",
};

const STATUS_FILTER_OPTIONS: { value: UrgencyStatus | "alle"; label: string }[] = [
  { value: "alle", label: "Alle statussen" },
  { value: "verlopen", label: URGENCY_STYLES.verlopen.label },
  { value: "urgent", label: URGENCY_STYLES.urgent.label },
  { value: "aandacht", label: URGENCY_STYLES.aandacht.label },
  { value: "rustig", label: URGENCY_STYLES.rustig.label },
];

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

function sortContracts(contracts: Contract[], sort: SortOption): Contract[] {
  const sorted = [...contracts];
  switch (sort) {
    case "deadline_asc":
      return sorted.sort((a, b) => a.opzegdeadline.localeCompare(b.opzegdeadline));
    case "deadline_desc":
      return sorted.sort((a, b) => b.opzegdeadline.localeCompare(a.opzegdeadline));
    case "waarde_desc":
      return sorted.sort((a, b) => (b.contractwaarde ?? 0) - (a.contractwaarde ?? 0));
    case "waarde_asc":
      return sorted.sort((a, b) => (a.contractwaarde ?? 0) - (b.contractwaarde ?? 0));
    case "partij_asc":
      return sorted.sort((a, b) => a.partij.localeCompare(b.partij));
  }
}

export function ContractList({ contracts }: { contracts: Contract[] }) {
  const [zoekterm, setZoekterm] = useState("");
  const [categorie, setCategorie] = useState("alle");
  const [status, setStatus] = useState<UrgencyStatus | "alle">("alle");
  const [sort, setSort] = useState<SortOption>("deadline_asc");

  const categorieen = useMemo(() => {
    const types = new Set(contracts.map((c) => c.type).filter(Boolean));
    return Array.from(types).sort((a, b) => a.localeCompare(b));
  }, [contracts]);

  const gefilterd = useMemo(() => {
    const term = zoekterm.trim().toLowerCase();
    const filtered = contracts.filter((contract) => {
      if (term && !contract.partij.toLowerCase().includes(term)) return false;
      if (categorie !== "alle" && contract.type !== categorie) return false;
      if (status !== "alle" && getUrgencyStatus(contract.opzegdeadline) !== status) return false;
      return true;
    });
    return sortContracts(filtered, sort);
  }, [contracts, zoekterm, categorie, status, sort]);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-end gap-3">
        <div className="min-w-[12rem] flex-1">
          <input
            type="text"
            placeholder="Zoek op partij..."
            value={zoekterm}
            onChange={(e) => setZoekterm(e.target.value)}
            className={inputClass}
          />
        </div>

        <select
          value={categorie}
          onChange={(e) => setCategorie(e.target.value)}
          className={selectClass}
        >
          <option value="alle">Alle categorieën</option>
          {categorieen.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as UrgencyStatus | "alle")}
          className={selectClass}
        >
          {STATUS_FILTER_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortOption)}
          className={selectClass}
        >
          {Object.entries(SORT_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-mono text-[12.5px] font-bold uppercase tracking-[.08em] text-[#8A93A3]">
          Jouw contracten
        </h1>
        <p className="text-sm text-[#8A93A3]">
          {gefilterd.length} van {contracts.length}
        </p>
      </div>

      {gefilterd.length === 0 ? (
        <Card className="p-8 text-center text-sm text-[#6B7383]">
          Geen contracten gevonden voor deze filters.
        </Card>
      ) : (
        <ContractRows contracts={gefilterd} />
      )}
    </div>
  );
}
