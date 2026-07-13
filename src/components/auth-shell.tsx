import { Logo } from "./logo";

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm rounded-2xl border border-[#E7E9F0] bg-white p-8 shadow-[0_1px_2px_rgba(18,20,28,0.03)]">
        <div className="mb-6 flex justify-center">
          <Logo />
        </div>
        <h1 className="mb-2 text-center font-display text-xl font-bold tracking-tight text-[#12141C]">
          {title}
        </h1>
        <p className="mb-6 text-center text-sm text-[#6B7383]">{subtitle}</p>
        {children}
        {footer && (
          <p className="mt-6 text-center text-sm text-[#6B7383]">{footer}</p>
        )}
      </div>
    </main>
  );
}
