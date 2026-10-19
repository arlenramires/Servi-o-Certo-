-- Existing public application stays unchanged. No profession is approved by this migration.
create schema if not exists private;

-- Both existing auth triggers must provision the same unprivileged role.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles(id,full_name,role,is_available)
  values(new.id,left(nullif(btrim(coalesce(new.raw_user_meta_data->>'full_name','')),''),150),'cliente',false)
  on conflict(id) do nothing;
  return new;
end $$;
revoke all on function public.handle_new_user() from public, anon, authenticated;
revoke all on function public.handle_new_service_certo_user() from public, anon, authenticated;

-- Private lookup is shared by discovery and the atomic claim. It cannot be called by API users.
create or replace function private.request_eligible(p_provider uuid,p_request uuid)
returns boolean language sql stable security definer set search_path = '' as $$
select p_provider is not null and exists (
 select 1 from public.service_requests r
 join public.professions prof on prof.normalized_name=lower(btrim(r.profession))
 join public.provider_professions pp on pp.profession_id=prof.id and pp.provider_id=p_provider and pp.verification_status='verificado'
 join public.profession_compliance_rules cr on cr.profession_id=prof.id and cr.classification<>'unreviewed' and cr.reviewed_at is not null
 join public.profiles p on p.id=p_provider and p.role='prestador' and p.is_available
 join auth.users u on u.id=p.id and u.email_confirmed_at is not null
 join public.provider_service_areas a on a.provider_id=p.id
 where r.id=p_request and r.status='aberto' and r.provider_id is null and r.client_id<>p_provider
 and lower(btrim(a.city))=lower(btrim(r.city)) and upper(btrim(a.state))=upper(btrim(r.state))
 and (
   (r.latitude is null and r.longitude is null)
   or (r.latitude is not null and r.longitude is not null and a.latitude is not null and a.longitude is not null
     and 6371 * 2 * asin(sqrt(least(1::double precision,
       power(sin(radians(r.latitude-a.latitude)/2),2)
       + cos(radians(a.latitude))*cos(radians(r.latitude))*power(sin(radians(r.longitude-a.longitude)/2),2)
     ))) <= least(a.service_radius_km,r.search_radius_km))
 )
);
$$;
revoke all on function private.request_eligible(uuid,uuid) from public,anon,authenticated;

create or replace function private.available_requests()
returns table(request_id uuid,requested_profession text,requested_at timestamptz)
language sql stable security definer set search_path = '' as $$
select r.id,r.profession,r.created_at from public.service_requests r
where private.request_eligible((select auth.uid()),r.id)
order by r.is_urgent desc,r.created_at asc limit 30;
$$;
revoke all on function private.available_requests() from public,anon;
grant execute on function private.available_requests() to authenticated;

create or replace function private.accept_request(p_request_id uuid)
returns boolean language plpgsql security definer set search_path = '' as $$
declare claimed boolean;
begin
 if auth.uid() is null then return false; end if;
 update public.service_requests r set provider_id=auth.uid(),status='aceito'
 where r.id=p_request_id and r.status='aberto' and r.provider_id is null
 and private.request_eligible(auth.uid(),r.id)
 returning true into claimed;
 return coalesce(claimed,false);
end $$;
revoke all on function private.accept_request(uuid) from public,anon;
grant execute on function private.accept_request(uuid) to authenticated;

create or replace function private.set_provider_availability(p_available boolean)
returns boolean language plpgsql security definer set search_path = '' as $$
begin
 if auth.uid() is null or p_available is null then return false; end if;
 update public.profiles p set is_available=p_available
 where p.id=auth.uid() and p.role='prestador'
 and exists(select 1 from auth.users u where u.id=p.id and u.email_confirmed_at is not null);
 return found;
end $$;
revoke all on function private.set_provider_availability(boolean) from public,anon;
grant execute on function private.set_provider_availability(boolean) to authenticated;

alter policy request_insert_own on public.service_requests to authenticated
with check (
 client_id=(select auth.uid()) and provider_id is null and status='aberto'
 and exists(select 1 from public.profiles p where p.id=(select auth.uid()) and p.role='cliente')
 and exists(select 1 from public.professions p where p.normalized_name=lower(btrim(profession)))
 and char_length(btrim(description)) between 10 and 3000
 and char_length(btrim(city)) between 2 and 100 and state ~ '^[A-Z]{2}$'
 and ((latitude is null and longitude is null) or (latitude is not null and longitude is not null))
);
-- Limit writable columns: callers cannot choose status, assignment or creation time.
revoke insert on public.service_requests from authenticated;
revoke insert(id,provider_id,status,created_at) on public.service_requests from authenticated;
grant insert(client_id,profession,description,city,state,latitude,longitude,scheduled_for,is_urgent,search_radius_km)
on public.service_requests to authenticated;

-- Exposed API functions use invoker privileges; privileged implementations stay private.
grant usage on schema private to authenticated;
create or replace function public.available_requests()
returns table(request_id uuid,requested_profession text,requested_at timestamptz)
language sql security invoker set search_path = '' as $$ select * from private.available_requests(); $$;
create or replace function public.accept_request(p_request_id uuid)
returns boolean language sql security invoker set search_path = '' as $$ select private.accept_request(p_request_id); $$;
create or replace function public.set_provider_availability(p_available boolean)
returns boolean language sql security invoker set search_path = '' as $$ select private.set_provider_availability(p_available); $$;
revoke all on function public.available_requests() from public,anon;
revoke all on function public.accept_request(uuid) from public,anon;
revoke all on function public.set_provider_availability(boolean) from public,anon;
grant execute on function public.available_requests(),public.accept_request(uuid),public.set_provider_availability(boolean) to authenticated;
