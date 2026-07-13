"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Category } from "@/lib/contracts";
import { BackLink, Card, inputClass, primaryButtonClass } from "@/components/ui";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [nieuweNaam, setNieuweNaam] = useState("");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function loadCategories() {
    const supabase = createClient();
    const { data } = await supabase
      .from("categories")
      .select("*")
      .order("naam", { ascending: true })
      .returns<Category[]>();
    setCategories(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    loadCategories();
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const naam = nieuweNaam.trim();
    if (!naam) return;

    setAdding(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("Je bent niet ingelogd.");
      setAdding(false);
      return;
    }

    const { error: insertError } = await supabase
      .from("categories")
      .insert({ user_id: user.id, naam });

    if (insertError) {
      setError(
        insertError.code === "23505"
          ? "Deze categorie bestaat al."
          : insertError.message,
      );
      setAdding(false);
      return;
    }

    setNieuweNaam("");
    setAdding(false);
    await loadCategories();
  }

  async function handleDelete(category: Category) {
    setError(null);

    const supabase = createClient();
    const { count } = await supabase
      .from("contracts")
      .select("id", { count: "exact", head: true })
      .eq("type", category.naam);

    if (count && count > 0) {
      setError(
        `"${category.naam}" is nog in gebruik bij ${count} contract${count === 1 ? "" : "en"} en kan niet verwijderd worden.`,
      );
      return;
    }

    const confirmed = window.confirm(`Categorie "${category.naam}" verwijderen?`);
    if (!confirmed) return;

    setDeletingId(category.id);
    const { error: deleteError } = await supabase
      .from("categories")
      .delete()
      .eq("id", category.id);

    if (deleteError) {
      setError(deleteError.message);
    } else {
      await loadCategories();
    }
    setDeletingId(null);
  }

  return (
    <main className="mx-auto w-full max-w-xl px-4 py-10 sm:px-8">
      <BackLink href="/">Terug naar dashboard</BackLink>

      <h1 className="mb-2 font-display text-2xl font-bold tracking-tight text-[#12141C]">
        Categorieën
      </h1>
      <p className="mb-7 text-sm text-[#6B7383]">
        Beheer de contractcategorieën die je bij het invoeren van een contract kunt
        kiezen. Een categorie die nog in gebruik is bij een contract kan niet
        verwijderd worden.
      </p>

      <form onSubmit={handleAdd} className="mb-6 flex gap-2">
        <input
          type="text"
          placeholder="Nieuwe categorie, bijv. Facilitaire dienst"
          value={nieuweNaam}
          onChange={(e) => setNieuweNaam(e.target.value)}
          className={inputClass + " flex-1"}
        />
        <button
          type="submit"
          disabled={adding || !nieuweNaam.trim()}
          className={primaryButtonClass}
        >
          {adding ? "Bezig..." : "Toevoegen"}
        </button>
      </form>

      {error && (
        <p className="mb-4 rounded-[11px] bg-[rgba(220,38,72,0.1)] p-3.5 text-sm text-[#DC2648]">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-sm text-[#6B7383]">Bezig met laden...</p>
      ) : categories.length === 0 ? (
        <p className="text-sm text-[#6B7383]">Nog geen categorieën toegevoegd.</p>
      ) : (
        <Card className="divide-y divide-[#EEF0F5] overflow-hidden">
          {categories.map((category) => (
            <div
              key={category.id}
              className="flex items-center justify-between px-5 py-3.5 text-sm"
            >
              <span className="text-[#12141C]">{category.naam}</span>
              <button
                onClick={() => handleDelete(category)}
                disabled={deletingId === category.id}
                className="text-xs font-semibold text-[#DC2648] hover:underline disabled:opacity-50"
              >
                {deletingId === category.id ? "Bezig..." : "Verwijderen"}
              </button>
            </div>
          ))}
        </Card>
      )}
    </main>
  );
}
