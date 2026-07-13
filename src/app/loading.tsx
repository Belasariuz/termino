export default function Loading() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="flex items-center gap-3 text-sm text-[#6B7383]">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#E4E7EF] border-t-[#6D5EF5]" />
        Bezig met laden...
      </div>
    </main>
  );
}
