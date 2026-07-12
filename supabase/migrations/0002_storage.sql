-- Conq: storage bucket voor contract-PDF's + Row Level Security
-- Plak dit script in Supabase Dashboard -> SQL Editor -> Run

insert into storage.buckets (id, name, public)
values ('contracts', 'contracts', false)
on conflict (id) do nothing;

-- Bestandspad-conventie: {user_id}/{bestandsnaam}.pdf
-- Zo kan RLS controleren of de eerste map van het pad overeenkomt met de ingelogde gebruiker

create policy "Users can upload their own contract PDFs"
  on storage.objects for insert
  with check (
    bucket_id = 'contracts'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can view their own contract PDFs"
  on storage.objects for select
  using (
    bucket_id = 'contracts'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can delete their own contract PDFs"
  on storage.objects for delete
  using (
    bucket_id = 'contracts'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
