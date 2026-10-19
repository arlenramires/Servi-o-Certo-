-- Migração aplicada: provider_applications_self_service_pending_review
create table if not exists public.provider_applications (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 profession text not null check (char_length(btrim(profession)) between 2 and 100),
 experience_summary text check (experience_summary is null or char_length(experience_summary) <= 1500),
 status text not null default 'pendente' check (status in ('pendente','em_analise','aprovado','rejeitado')),
 created_at timestamptz not null default now(),
 unique (user_id, profession)
);
alter table public.provider_applications enable row level security;
revoke all on public.provider_applications from anon, authenticated;
grant select (id,user_id,profession,experience_summary,status,created_at) on public.provider_applications to authenticated;
grant insert (user_id,profession,experience_summary) on public.provider_applications to authenticated;
create policy provider_applications_select_own on public.provider_applications
 for select to authenticated using (user_id = (select auth.uid()));
create policy provider_applications_insert_own on public.provider_applications
 for insert to authenticated with check (user_id = (select auth.uid()));
