create table public.service_inspections (
 id uuid primary key default gen_random_uuid(),
 request_id uuid not null unique references public.service_requests(id),
 provider_id uuid not null references public.profiles(id),
 purpose text not null check(char_length(btrim(purpose)) between 20 and 1000),
 scheduled_for timestamptz not null,
 fee_cents bigint not null check(fee_cents between 1 and 9007199254740991),
 status text not null default 'proposta' check(status in ('proposta','aceita_pendente_pagamento','recusada')),
 decided_by uuid references public.profiles(id),
 created_at timestamptz not null default now(),
 decided_at timestamptz,
 check((status='proposta')=(decided_by is null and decided_at is null))
);
create index service_inspections_request_created_idx on public.service_inspections(request_id,created_at);
alter table public.service_inspections enable row level security;
revoke all on public.service_inspections from public,anon,authenticated;
grant select on public.service_inspections to authenticated;
create policy inspections_participants_read on public.service_inspections for select to authenticated
using(exists(select 1 from public.service_requests r where r.id=service_inspections.request_id
 and (r.client_id=(select auth.uid()) or r.provider_id=(select auth.uid()))));

create or replace function private.propose_service_inspection(p_request_id uuid,p_fee_cents bigint,p_scheduled_for timestamptz,p_purpose text)
returns uuid language plpgsql security definer set search_path='' as $$
declare r public.service_requests%rowtype;existing public.service_inspections%rowtype;new_id uuid;
begin
 if auth.uid() is null then raise exception using errcode='42501',message='Authentication required';end if;
 if p_fee_cents is null or p_fee_cents not between 1 and 9007199254740991
  or p_scheduled_for is null or p_scheduled_for<=now()
  or p_purpose is null or char_length(btrim(p_purpose)) not between 20 and 1000 then
  raise exception using errcode='VI001',message='Invalid inspection proposal';
 end if;
 select * into r from public.service_requests where id=p_request_id for update;
 if not found or r.provider_id is distinct from auth.uid() then
  raise exception using errcode='42501',message='Only assigned provider may propose an inspection';
 end if;
 if r.status<>'aceito' or exists(select 1 from public.service_quotes where request_id=r.id) then
  raise exception using errcode='VI002',message='Inspection must precede the quote';
 end if;
 select * into existing from public.service_inspections where request_id=r.id;
 if found then
  if existing.provider_id=auth.uid() and existing.fee_cents=p_fee_cents and existing.scheduled_for=p_scheduled_for
   and existing.purpose=btrim(p_purpose) then return existing.id;end if;
  raise exception using errcode='VI003',message='Inspection proposal is immutable';
 end if;
 insert into public.service_inspections(request_id,provider_id,purpose,scheduled_for,fee_cents)
 values(r.id,auth.uid(),btrim(p_purpose),p_scheduled_for,p_fee_cents) returning id into new_id;
 return new_id;
end $$;

create or replace function private.decide_service_inspection(p_inspection_id uuid,p_decision text)
returns boolean language plpgsql security definer set search_path='' as $$
declare i public.service_inspections%rowtype;r public.service_requests%rowtype;next_status text;
begin
 if auth.uid() is null then raise exception using errcode='42501',message='Authentication required';end if;
 if p_decision is null or p_decision not in ('aceita_pendente_pagamento','recusada') then
  raise exception using errcode='VI001',message='Invalid inspection decision';
 end if;
 select * into i from public.service_inspections where id=p_inspection_id for update;
 if not found then raise exception using errcode='42501',message='Inspection unavailable';end if;
 select * into r from public.service_requests where id=i.request_id for update;
 if r.client_id is distinct from auth.uid() then raise exception using errcode='42501',message='Only client may decide inspection';end if;
 next_status=p_decision;
 if i.status=next_status and i.decided_by=auth.uid() then return true;end if;
 if i.status<>'proposta' then raise exception using errcode='VI003',message='Inspection decision is immutable';end if;
 if r.status<>'aceito' then raise exception using errcode='VI002',message='Inspection is no longer open for decision';end if;
 update public.service_inspections set status=next_status,decided_by=auth.uid(),decided_at=now() where id=i.id;
 return true;
end $$;

revoke all on function private.propose_service_inspection(uuid,bigint,timestamptz,text),private.decide_service_inspection(uuid,text) from public,anon;
grant execute on function private.propose_service_inspection(uuid,bigint,timestamptz,text),private.decide_service_inspection(uuid,text) to authenticated;
create or replace function public.propose_service_inspection(p_request_id uuid,p_fee_cents bigint,p_scheduled_for timestamptz,p_purpose text)
returns uuid language sql security invoker set search_path='' as $$select private.propose_service_inspection(p_request_id,p_fee_cents,p_scheduled_for,p_purpose);$$;
create or replace function public.decide_service_inspection(p_inspection_id uuid,p_decision text)
returns boolean language sql security invoker set search_path='' as $$select private.decide_service_inspection(p_inspection_id,p_decision);$$;
revoke all on function public.propose_service_inspection(uuid,bigint,timestamptz,text),public.decide_service_inspection(uuid,text) from public,anon;
grant execute on function public.propose_service_inspection(uuid,bigint,timestamptz,text),public.decide_service_inspection(uuid,text) to authenticated;
