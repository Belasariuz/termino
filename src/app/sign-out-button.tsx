"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function SignOutButton() {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      onClick={handleSignOut}
      className="rounded-[10px] border-[1.5px] border-[#E4E7EF] bg-white px-4 py-2.5 text-sm font-semibold text-[#6B7383] hover:bg-[#FAFBFD]"
    >
      Uitloggen
    </button>
  );
}
