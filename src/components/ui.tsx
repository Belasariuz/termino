import Link from "next/link";

export const inputClass =
  "w-full rounded-[10px] border-[1.5px] border-[#E4E7EF] bg-white px-3.5 py-3 text-[15px] text-[#12141C] focus:border-[#6D5EF5] focus:outline-none";

export const labelClass =
  "mb-1.5 block text-[12px] font-bold uppercase tracking-wide text-[#8A93A3]";

export const primaryButtonClass =
  "rounded-[10px] bg-gradient-to-br from-[#6D5EF5] to-[#5847E0] px-5 py-3 text-[15px] font-semibold text-white shadow-[0_6px_18px_rgba(109,94,245,0.28)] transition hover:brightness-[1.08] disabled:opacity-50 disabled:hover:brightness-100";

export const secondaryButtonClass =
  "rounded-[10px] border-[1.5px] border-[#E4E7EF] bg-white px-5 py-3 text-[15px] font-semibold text-[#6B7383] transition hover:bg-[#FAFBFD] disabled:opacity-50";

export const dangerButtonClass =
  "rounded-[10px] border border-[#F3C6D0] bg-white px-4 py-2.5 text-sm font-semibold text-[#DC2648] transition hover:bg-[#FDF1F3] disabled:opacity-50";

export function BackLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-[#6B7383] hover:text-[#12141C]"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path
          d="M15 6l-6 6 6 6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {children}
    </Link>
  );
}

export function Card({
  className = "",
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`rounded-2xl border border-[#E7E9F0] bg-white shadow-[0_1px_2px_rgba(18,20,28,0.03)] ${className}`}
    >
      {children}
    </div>
  );
}
