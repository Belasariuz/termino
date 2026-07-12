-- Conq: sluit gat in RLS update-policy op categories
-- Zonder "with check" kan een update de rij naar een andere user_id verplaatsen,
-- ook al mag alleen de eigenaar de update starten.
-- Plak dit script in Supabase Dashboard -> SQL Editor -> Run

drop policy if exists "Users can update their own categories" on public.categories;

create policy "Users can update their own categories"
  on public.categories for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
