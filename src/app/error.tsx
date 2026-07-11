"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50 px-4 text-center">
      <h1 className="text-2xl font-semibold text-gray-900">Er ging iets mis</h1>
      <p className="max-w-sm text-sm text-gray-500">
        Er is een onverwachte fout opgetreden. Probeer het opnieuw, of ga terug naar
        het dashboard.
      </p>
      {error.message && (
        <p className="max-w-md rounded-md bg-red-50 px-3 py-2 text-xs text-red-700">
          {error.message}
        </p>
      )}
      <button
        onClick={() => reset()}
        className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
      >
        Probeer opnieuw
      </button>
    </main>
  );
}
