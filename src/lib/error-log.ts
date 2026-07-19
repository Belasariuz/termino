import { createAdminClient } from "@/lib/supabase/admin";

export async function logError(
  source: string,
  error: unknown,
  details?: Record<string, unknown>,
) {
  const message = error instanceof Error ? error.message : String(error);
  try {
    await createAdminClient()
      .from("error_log")
      .insert({ source, message, details: details ?? null });
  } catch (loggingError) {
    console.error("logError failed:", loggingError);
  }
}
