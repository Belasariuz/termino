-- Concq: sluit gat in RLS update-policy op contracts
-- Zonder "with check" kan een update de rij naar een andere user_id verplaatsen,
-- ook al mag alleen de eigenaar de update starten.
-- Plak dit script in Supabase Dashboard -> SQL Editor -> Run

drop policy if exists "Users can update their own contracts" on public.contracts;

create policy "Users can update their own contracts"
  on public.contracts for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
