-- Espelho da migração aplicada no Supabase: provision_customer_profiles_securely
-- Cadastro cria somente cliente. Nunca confiar no requested_role do navegador.
create or replace function public.handle_new_service_certo_user()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, role, is_available)
  values (new.id, left(nullif(btrim(coalesce(new.raw_user_meta_data->>'full_name','')), ''), 150), 'cliente', false)
  on conflict (id) do nothing;
  return new;
end;
$$;
revoke all on function public.handle_new_service_certo_user() from public, anon, authenticated;
drop trigger if exists on_service_certo_auth_user_created on auth.users;
create trigger on_service_certo_auth_user_created
  after insert on auth.users for each row execute function public.handle_new_service_certo_user();
drop policy if exists "service_certo_profile_read_self" on public.profiles;
create policy "service_certo_profile_read_self" on public.profiles
  for select to authenticated using ((select auth.uid()) = id);
