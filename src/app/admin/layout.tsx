import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { Logo } from "@/components/logo";
import { SignOutButton } from "@/app/sign-out-button";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/notifications", label: "Notificaties" },
  { href: "/admin/errors", label: "Foutmeldingen" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-9 sm:px-8">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link href="/">
            <Logo />
          </Link>
          <span className="rounded-full bg-[#F0F1F6] px-2.5 py-1 font-mono text-[11px] font-semibold uppercase tracking-wide text-[#6B7383]">
            Admin
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/"
            className="rounded-[10px] border-[1.5px] border-[#E4E7EF] bg-white px-4 py-2.5 text-sm font-semibold text-[#6B7383] hover:bg-[#FAFBFD]"
          >
            Terug naar app
          </Link>
          <SignOutButton />
        </div>
      </div>

      <nav className="mb-8 flex gap-2 border-b border-[#EEF0F5]">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="px-3 py-2.5 text-sm font-medium text-[#6B7383] hover:text-[#12141C]"
          >
            {item.label}
          </Link>
        ))}
      </nav>

      {children}
    </main>
  );
}
