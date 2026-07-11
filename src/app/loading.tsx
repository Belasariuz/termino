export default function Loading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="flex items-center gap-3 text-sm text-gray-500">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900" />
        Bezig met laden...
      </div>
    </main>
  );
}
