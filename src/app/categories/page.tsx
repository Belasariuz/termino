"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { Category } from "@/lib/contracts";

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
    <main className="mx-auto w-full max-w-xl px-4 py-10">
      <Link href="/" className="mb-4 inline-block text-sm text-gray-500 hover:text-gray-900">
        &larr; Terug naar dashboard
      </Link>

      <h1 className="mb-2 text-2xl font-semibold text-gray-900">Categorieën</h1>
      <p className="mb-6 text-sm text-gray-500">
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
          className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none"
        />
        <button
          type="submit"
          disabled={adding || !nieuweNaam.trim()}
          className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
        >
          {adding ? "Bezig..." : "Toevoegen"}
        </button>
      </form>

      {error && (
        <p className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p>
      )}

      {loading ? (
        <p className="text-sm text-gray-500">Bezig met laden...</p>
      ) : categories.length === 0 ? (
        <p className="text-sm text-gray-500">Nog geen categorieën toegevoegd.</p>
      ) : (
        <ul className="divide-y divide-gray-100 rounded-lg border border-gray-200 bg-white">
          {categories.map((category) => (
            <li
              key={category.id}
              className="flex items-center justify-between px-4 py-3 text-sm"
            >
              <span className="text-gray-900">{category.naam}</span>
              <button
                onClick={() => handleDelete(category)}
                disabled={deletingId === category.id}
                className="text-xs font-medium text-red-600 hover:underline disabled:opacity-50"
              >
                {deletingId === category.id ? "Bezig..." : "Verwijderen"}
              </button>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
