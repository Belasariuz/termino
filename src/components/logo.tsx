export function LogoMark({ size = 32 }: { size?: number }) {
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-[9px] bg-gradient-to-br from-[#6D5EF5] to-[#5847E0] shadow-[0_4px_14px_rgba(109,94,245,0.28)]"
      style={{ width: size, height: size }}
    >
      <svg
        width={size * 0.5}
        height={size * 0.5}
        viewBox="0 0 24 24"
        fill="none"
      >
        <path
          d="M12 2L3 6v6c0 5.2 3.6 9.4 9 10.9 5.4-1.5 9-5.7 9-10.9V6l-9-4z"
          fill="#fff"
        />
      </svg>
    </div>
  );
}

export function Logo({ size = 32 }: { size?: number }) {
  return (
    <div className="flex items-center gap-2.5">
      <LogoMark size={size} />
      <span className="font-display text-lg font-bold tracking-tight text-[#12141C]">
        Conq
      </span>
    </div>
  );
}
