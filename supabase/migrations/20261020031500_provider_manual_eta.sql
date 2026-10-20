create table public.provider_arrival_estimates (
 id uuid primary key default gen_random_uuid(),
 request_id uuid not null unique references public.service_requests(id),
 provider_id uuid not null references public.profiles(id),
 estimated_arrival_at timestamptz not null,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);

create index provider_arrival_estimates_provider_idx on public.provider_arrival_estimates(provider_id);
alter table public.provider_arrival_estimates enable row level security;
revoke all on public.provider_arrival_estimates from public,anon,authenticated;
grant select on public.provider_arrival_estimates to authenticated;
create policy arrival_estimates_participants_read on public.provider_arrival_estimates for select to authenticated
using(exists(select 1 from public.service_requests r where r.id=provider_arrival_estimates.request_id
 and (r.client_id=(select auth.uid()) or r.provider_id=(select auth.uid()))));

create or replace function private.set_provider_eta(p_request_id uuid,p_minutes integer)
returns timestamptz language plpgsql security definer set search_path='' as $$
declare r public.service_requests%rowtype;eta timestamptz;
begin
 if auth.uid() is null then raise exception using errcode='42501',message='Authentication required';end if;
 if p_minutes is null or p_minutes not in (10,20,30,45,60,90) then
  raise exception using errcode='SE011',message='Invalid arrival estimate';
 end if;
 select * into r from public.service_requests where id=p_request_id for update;
 if not found or r.provider_id is distinct from auth.uid() then
  raise exception using errcode='42501',message='Only assigned provider may set arrival estimate';
 end if;
 if r.status<>'aceito'
  or not exists(select 1 from public.service_execution_events where request_id=r.id and event_type='a_caminho')
  or exists(select 1 from public.service_execution_events where request_id=r.id and event_type='chegou_local') then
  raise exception using errcode='SE012',message='Arrival estimate is only available while provider is on the way';
 end if;
 eta=now()+p_minutes*interval '1 minute';
 insert into public.provider_arrival_estimates(request_id,provider_id,estimated_arrival_at)
 values(r.id,auth.uid(),eta)
 on conflict(request_id) do update set estimated_arrival_at=excluded.estimated_arrival_at,updated_at=now();
 return eta;
end $$;

revoke all on function private.set_provider_eta(uuid,integer) from public,anon;
grant execute on function private.set_provider_eta(uuid,integer) to authenticated;
create or replace function public.set_provider_eta(p_request_id uuid,p_minutes integer)
returns timestamptz language sql security invoker set search_path='' as $$select private.set_provider_eta(p_request_id,p_minutes);$$;
revoke all on function public.set_provider_eta(uuid,integer) from public,anon;
grant execute on function public.set_provider_eta(uuid,integer) to authenticated;
