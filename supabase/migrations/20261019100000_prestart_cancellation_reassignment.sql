alter table public.service_requests add column replaces_request_id uuid references public.service_requests(id);
create unique index service_requests_one_replacement_idx on public.service_requests(replaces_request_id) where replaces_request_id is not null;
grant select(replaces_request_id) on public.service_requests to authenticated;

create table public.service_cancellations (
 id uuid primary key default gen_random_uuid(),
 request_id uuid not null unique references public.service_requests(id),
 actor_id uuid not null references public.profiles(id),
 actor_role text not null check(actor_role in ('cliente','prestador')),
 reason text not null check(char_length(btrim(reason)) between 10 and 500),
 outcome text not null check(outcome in ('cancelado_cliente','reencaminhado_prestador')),
 replacement_request_id uuid unique references public.service_requests(id),
 fee_status text not null default 'nao_avaliada' check(fee_status='nao_avaliada'),
 created_at timestamptz not null default now(),
 check((outcome='reencaminhado_prestador')=(replacement_request_id is not null))
);
create index service_cancellations_actor_idx on public.service_cancellations(actor_id);
alter table public.service_cancellations enable row level security;
revoke all on public.service_cancellations from public,anon,authenticated;
grant select on public.service_cancellations to authenticated;
create policy cancellation_participants_read on public.service_cancellations for select to authenticated
using(exists(select 1 from public.service_requests r where r.id=service_cancellations.request_id
 and (r.client_id=(select auth.uid()) or r.provider_id=(select auth.uid()))));

create or replace function private.cancel_service_before_start(p_request_id uuid,p_reason text)
returns uuid language plpgsql security definer set search_path='' as $$
declare r public.service_requests%rowtype;replacement uuid;role_name text;result_name text;
begin
 if auth.uid() is null then raise exception using errcode='42501',message='Authentication required';end if;
 if p_reason is null or char_length(btrim(p_reason)) not between 10 and 500 then raise exception using errcode='CN001',message='Invalid reason';end if;
 select * into r from public.service_requests where id=p_request_id for update;
 if not found then raise exception using errcode='42501',message='Request unavailable';end if;
 if r.status='cancelado' then
  select replacement_request_id into replacement from public.service_cancellations where request_id=r.id and actor_id=auth.uid();
  if found then return replacement;end if;
  raise exception using errcode='42501',message='Cancellation already recorded';
 end if;
 if auth.uid()<>r.client_id and auth.uid() is distinct from r.provider_id then
  raise exception using errcode='42501',message='Request unavailable';
 end if;
 if auth.uid()=r.client_id and r.status in ('aberto','aceito') then role_name='cliente';result_name='cancelado_cliente';
 elsif auth.uid()=r.provider_id and r.status='aceito' then role_name='prestador';result_name='reencaminhado_prestador';
 else raise exception using errcode='CN002',message='Cancellation not allowed at this stage';end if;
 update public.service_requests set status='cancelado' where id=r.id;
 if role_name='prestador' then
  insert into public.service_requests(client_id,profession,description,status,is_urgent,city,state,latitude,longitude,scheduled_for,search_radius_km,replaces_request_id)
  values(r.client_id,r.profession,r.description,'aberto',r.is_urgent,r.city,r.state,r.latitude,r.longitude,r.scheduled_for,r.search_radius_km,r.id)
  returning id into replacement;
 end if;
 insert into public.service_cancellations(request_id,actor_id,actor_role,reason,outcome,replacement_request_id)
 values(r.id,auth.uid(),role_name,btrim(p_reason),result_name,replacement);
 return replacement;
end $$;
revoke all on function private.cancel_service_before_start(uuid,text) from public,anon;
grant execute on function private.cancel_service_before_start(uuid,text) to authenticated;

-- The provider who caused an automatic reassignment cannot immediately reclaim its replacement.
create or replace function private.available_requests()
returns table(request_id uuid,requested_profession text,requested_at timestamptz)
language sql stable security definer set search_path='' as $$
select r.id,r.profession,r.created_at from public.service_requests r
where private.request_eligible((select auth.uid()),r.id)
 and not exists(select 1 from public.service_cancellations c
  where c.replacement_request_id=r.id and c.actor_id=(select auth.uid()))
order by r.is_urgent desc,r.created_at asc limit 30;
$$;

create or replace function public.cancel_service_before_start(p_request_id uuid,p_reason text)
returns uuid language sql security invoker set search_path='' as $$select private.cancel_service_before_start(p_request_id,p_reason);$$;
revoke all on function public.cancel_service_before_start(uuid,text) from public,anon;
grant execute on function public.cancel_service_before_start(uuid,text) to authenticated;
