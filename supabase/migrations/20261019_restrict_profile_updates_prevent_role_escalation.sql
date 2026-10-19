-- Migração aplicada no Supabase: restrict_profile_updates_prevent_role_escalation
-- Impede que um cliente mude o próprio papel para administrador ou prestador.
revoke update on table public.profiles from authenticated;
grant update (full_name, phone) on table public.profiles to authenticated;
drop policy if exists profile_update_self on public.profiles;
create policy profile_update_self on public.profiles for update to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);
