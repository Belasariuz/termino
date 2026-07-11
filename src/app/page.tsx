import { createClient } from "@/lib/supabase/server";
import { SignOutButton } from "./sign-out-button";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50 px-4">
      <h1 className="text-2xl font-semibold text-gray-900">
        Welkom bij Termino
      </h1>
      <p className="text-sm text-gray-500">
        Je bent ingelogd als <span className="font-medium">{user?.email}</span>
      </p>
      <SignOutButton />
    </main>
  );
}
