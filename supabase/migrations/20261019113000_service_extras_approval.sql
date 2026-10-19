create table public.service_extras (
 id uuid primary key default gen_random_uuid(),
 request_id uuid not null references public.service_requests(id),
 provider_id uuid not null references public.profiles(id),
 description text not null check(char_length(btrim(description)) between 10 and 1000),
 amount_cents bigint not null check(amount_cents between 1 and 9007199254740991),
 status text not null default 'proposto' check(status in ('proposto','aceito','recusado')),
 decided_by uuid references public.profiles(id),
 created_at timestamptz not null default now(),
 decided_at timestamptz,
 check((status='proposto')=(decided_by is null and decided_at is null))
);
create unique index service_extras_one_pending_idx on public.service_extras(request_id) where status='proposto';
create index service_extras_request_created_idx on public.service_extras(request_id,created_at);
alter table public.service_extras enable row level security;
revoke all on public.service_extras from public,anon,authenticated;
grant select on public.service_extras to authenticated;
create policy extras_participants_read on public.service_extras for select to authenticated
using(exists(select 1 from public.service_requests r where r.id=service_extras.request_id
 and (r.client_id=(select auth.uid()) or r.provider_id=(select auth.uid()))));

create or replace function private.propose_service_extra(p_request_id uuid,p_amount_cents bigint,p_description text)
returns uuid language plpgsql security definer set search_path='' as $$
declare r public.service_requests%rowtype;new_id uuid;
begin
 if auth.uid() is null then raise exception using errcode='42501',message='Authentication required';end if;
 if p_amount_cents is null or p_amount_cents not between 1 and 9007199254740991
  or p_description is null or char_length(btrim(p_description)) not between 10 and 1000 then
  raise exception using errcode='EX001',message='Invalid extra';
 end if;
 select * into r from public.service_requests where id=p_request_id for update;
 if not found or r.provider_id is distinct from auth.uid() then raise exception using errcode='42501',message='Only assigned provider may propose extra';end if;
 if r.status<>'em_andamento' or exists(select 1 from public.service_execution_events where request_id=r.id and event_type='conclusao_solicitada') then
  raise exception using errcode='EX002',message='Service is not open for extras';
 end if;
 if exists(select 1 from public.service_extras where request_id=r.id and status='proposto') then
  raise exception using errcode='EX003',message='Pending extra must be decided';
 end if;
 insert into public.service_extras(request_id,provider_id,description,amount_cents)
 values(r.id,auth.uid(),btrim(p_description),p_amount_cents) returning id into new_id;
 return new_id;
end $$;

create or replace function private.decide_service_extra(p_extra_id uuid,p_decision text)
returns boolean language plpgsql security definer set search_path='' as $$
declare e public.service_extras%rowtype;r public.service_requests%rowtype;next_status text;
begin
 if auth.uid() is null then raise exception using errcode='42501',message='Authentication required';end if;
 if p_decision is null or p_decision not in ('aceito','recusado') then raise exception using errcode='EX001',message='Invalid decision';end if;
 select * into e from public.service_extras where id=p_extra_id for update;
 if not found then raise exception using errcode='42501',message='Extra unavailable';end if;
 select * into r from public.service_requests where id=e.request_id for update;
 if r.client_id<>auth.uid() then raise exception using errcode='42501',message='Only client may decide extra';end if;
 next_status=p_decision;
 if e.status=next_status and e.decided_by=auth.uid() then return true;end if;
 if e.status<>'proposto' then raise exception using errcode='EX003',message='Extra decision is immutable';end if;
 if r.status<>'em_andamento' then raise exception using errcode='EX002',message='Service is not open for extras';end if;
 update public.service_extras set status=next_status,decided_by=auth.uid(),decided_at=now() where id=e.id;
 return true;
end $$;

-- Completion waits until the client resolves every scope addition.
create or replace function private.request_service_completion(p_request_id uuid)
returns boolean language plpgsql security definer set search_path='' as $$
declare r public.service_requests%rowtype;
begin
 if auth.uid() is null then raise exception using errcode='42501',message='Authentication required';end if;
 select * into r from public.service_requests where id=p_request_id for update;
 if not found or r.provider_id is distinct from auth.uid() then raise exception using errcode='42501',message='Only assigned provider may request completion';end if;
 if r.status<>'em_andamento' then raise exception using errcode='SE003',message='Service is not in progress';end if;
 if exists(select 1 from public.service_extras where request_id=r.id and status='proposto') then
  raise exception using errcode='EX004',message='Pending extra must be decided before completion';
 end if;
 if exists(select 1 from public.service_execution_events where request_id=r.id and event_type='conclusao_solicitada') then return true;end if;
 insert into public.service_execution_events(request_id,actor_id,event_type) values(r.id,auth.uid(),'conclusao_solicitada');
 return true;
end $$;

revoke all on function private.propose_service_extra(uuid,bigint,text),private.decide_service_extra(uuid,text) from public,anon;
grant execute on function private.propose_service_extra(uuid,bigint,text),private.decide_service_extra(uuid,text) to authenticated;
create or replace function public.propose_service_extra(p_request_id uuid,p_amount_cents bigint,p_description text)
returns uuid language sql security invoker set search_path='' as $$select private.propose_service_extra(p_request_id,p_amount_cents,p_description);$$;
create or replace function public.decide_service_extra(p_extra_id uuid,p_decision text)
returns boolean language sql security invoker set search_path='' as $$select private.decide_service_extra(p_extra_id,p_decision);$$;
revoke all on function public.propose_service_extra(uuid,bigint,text),public.decide_service_extra(uuid,text) from public,anon;
grant execute on function public.propose_service_extra(uuid,bigint,text),public.decide_service_extra(uuid,text) to authenticated;
