create table public.service_schedule_changes (
 id uuid primary key default gen_random_uuid(),
 request_id uuid not null references public.service_requests(id),
 provider_id uuid not null references public.profiles(id),
 proposed_for timestamptz not null,
 reason text not null check(char_length(reason) between 10 and 500),
 status text not null default 'pendente' check(status in ('pendente','aceito','recusado')),
 decided_by uuid references public.profiles(id),
 created_at timestamptz not null default now(),
 decided_at timestamptz,
 check((status='pendente' and decided_by is null and decided_at is null)
  or (status in ('aceito','recusado') and decided_by is not null and decided_at is not null))
);

create index service_schedule_changes_request_created_idx on public.service_schedule_changes(request_id,created_at);
create index service_schedule_changes_provider_idx on public.service_schedule_changes(provider_id);
create unique index service_schedule_changes_one_pending_idx on public.service_schedule_changes(request_id) where status='pendente';
alter table public.service_schedule_changes enable row level security;
revoke all on public.service_schedule_changes from public,anon,authenticated;
grant select on public.service_schedule_changes to authenticated;
create policy schedule_changes_participants_read on public.service_schedule_changes for select to authenticated
using(exists(select 1 from public.service_requests r where r.id=service_schedule_changes.request_id
 and ((select auth.uid())=r.client_id or (select auth.uid())=r.provider_id)));

create or replace function private.propose_service_reschedule(p_request_id uuid,p_proposed_for timestamptz,p_reason text)
returns uuid language plpgsql security definer set search_path='' as $$
declare r public.service_requests%rowtype;existing public.service_schedule_changes%rowtype;new_id uuid;clean text;
begin
 if auth.uid() is null then raise exception using errcode='42501',message='Authentication required';end if;
 clean=nullif(btrim(p_reason),'');
 if p_proposed_for is null or p_proposed_for<=now() or clean is null or char_length(clean) not between 10 and 500 then
  raise exception using errcode='RA001',message='Invalid reschedule proposal';
 end if;
 select * into r from public.service_requests where id=p_request_id for update;
 if not found or r.provider_id is distinct from auth.uid() then
  raise exception using errcode='42501',message='Only assigned provider may propose reschedule';
 end if;
 if r.status<>'aceito' or exists(select 1 from public.service_execution_events where request_id=r.id and event_type='a_caminho') then
  raise exception using errcode='RA002',message='Reschedule unavailable in this stage';
 end if;
 select * into existing from public.service_schedule_changes where request_id=r.id and status='pendente' for update;
 if found then
  if existing.proposed_for=p_proposed_for and existing.reason=clean then return existing.id;end if;
  raise exception using errcode='RA003',message='Pending reschedule is immutable';
 end if;
 insert into public.service_schedule_changes(request_id,provider_id,proposed_for,reason)
 values(r.id,auth.uid(),p_proposed_for,clean) returning id into new_id;
 return new_id;
end $$;

create or replace function private.decide_service_reschedule(p_change_id uuid,p_decision text)
returns boolean language plpgsql security definer set search_path='' as $$
declare c public.service_schedule_changes%rowtype;r public.service_requests%rowtype;
begin
 if auth.uid() is null then raise exception using errcode='42501',message='Authentication required';end if;
 if p_decision is null or p_decision not in ('aceito','recusado') then
  raise exception using errcode='RA001',message='Invalid reschedule decision';
 end if;
 select * into c from public.service_schedule_changes where id=p_change_id for update;
 if not found then raise exception using errcode='42501',message='Reschedule unavailable';end if;
 select * into r from public.service_requests where id=c.request_id for update;
 if r.client_id is distinct from auth.uid() then raise exception using errcode='42501',message='Only client may decide reschedule';end if;
 if c.status=p_decision and c.decided_by=auth.uid() then return true;end if;
 if c.status<>'pendente' then raise exception using errcode='RA003',message='Reschedule decision is immutable';end if;
 if r.status<>'aceito' or exists(select 1 from public.service_execution_events where request_id=r.id and event_type='a_caminho') then
  raise exception using errcode='RA002',message='Reschedule unavailable in this stage';
 end if;
 update public.service_schedule_changes set status=p_decision,decided_by=auth.uid(),decided_at=now() where id=c.id;
 if p_decision='aceito' then update public.service_requests set scheduled_for=c.proposed_for where id=r.id;end if;
 return true;
end $$;

revoke all on function private.propose_service_reschedule(uuid,timestamptz,text),private.decide_service_reschedule(uuid,text) from public,anon;
grant execute on function private.propose_service_reschedule(uuid,timestamptz,text),private.decide_service_reschedule(uuid,text) to authenticated;
create or replace function public.propose_service_reschedule(p_request_id uuid,p_proposed_for timestamptz,p_reason text)
returns uuid language sql security invoker set search_path='' as $$select private.propose_service_reschedule(p_request_id,p_proposed_for,p_reason);$$;
create or replace function public.decide_service_reschedule(p_change_id uuid,p_decision text)
returns boolean language sql security invoker set search_path='' as $$select private.decide_service_reschedule(p_change_id,p_decision);$$;
revoke all on function public.propose_service_reschedule(uuid,timestamptz,text),public.decide_service_reschedule(uuid,text) from public,anon;
grant execute on function public.propose_service_reschedule(uuid,timestamptz,text),public.decide_service_reschedule(uuid,text) to authenticated;
