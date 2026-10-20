alter table public.service_schedule_changes add column proposed_by uuid references public.profiles(id);
update public.service_schedule_changes set proposed_by=provider_id where proposed_by is null;
alter table public.service_schedule_changes alter column proposed_by set not null;
create index service_schedule_changes_proposed_by_idx on public.service_schedule_changes(proposed_by);

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
 if not found or (r.client_id is distinct from auth.uid() and r.provider_id is distinct from auth.uid()) then
  raise exception using errcode='42501',message='Only participants may propose reschedule';
 end if;
 if r.status<>'aceito' or exists(select 1 from public.service_execution_events where request_id=r.id and event_type='a_caminho') then
  raise exception using errcode='RA002',message='Reschedule unavailable in this stage';
 end if;
 select * into existing from public.service_schedule_changes where request_id=r.id and status='pendente' for update;
 if found then
  if existing.proposed_by=auth.uid() and existing.proposed_for=p_proposed_for and existing.reason=clean then return existing.id;end if;
  raise exception using errcode='RA003',message='Pending reschedule is immutable';
 end if;
 insert into public.service_schedule_changes(request_id,provider_id,proposed_by,proposed_for,reason)
 values(r.id,r.provider_id,auth.uid(),p_proposed_for,clean) returning id into new_id;
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
 if (r.client_id is distinct from auth.uid() and r.provider_id is distinct from auth.uid()) or c.proposed_by=auth.uid() then
  raise exception using errcode='42501',message='Only the other participant may decide reschedule';
 end if;
 if c.status=p_decision and c.decided_by=auth.uid() then return true;end if;
 if c.status<>'pendente' then raise exception using errcode='RA003',message='Reschedule decision is immutable';end if;
 if r.status<>'aceito' or exists(select 1 from public.service_execution_events where request_id=r.id and event_type='a_caminho') then
  raise exception using errcode='RA002',message='Reschedule unavailable in this stage';
 end if;
 update public.service_schedule_changes set status=p_decision,decided_by=auth.uid(),decided_at=now() where id=c.id;
 if p_decision='aceito' then update public.service_requests set scheduled_for=c.proposed_for where id=r.id;end if;
 return true;
end $$;

create or replace function private.mark_provider_arrival(p_request_id uuid,p_event text)
returns boolean language plpgsql security definer set search_path='' as $$
declare r public.service_requests%rowtype;c public.service_contracts%rowtype;
begin
 if auth.uid() is null then raise exception using errcode='42501',message='Authentication required';end if;
 if p_event is null or p_event not in ('a_caminho','chegou_local') then raise exception using errcode='SE008',message='Invalid arrival event';end if;
 select * into r from public.service_requests where id=p_request_id for update;
 if not found or r.provider_id is distinct from auth.uid() then raise exception using errcode='42501',message='Only assigned provider may update arrival';end if;
 if exists(select 1 from public.service_execution_events where request_id=r.id and event_type=p_event) then return true;end if;
 if r.status<>'aceito' then raise exception using errcode='SE008',message='Arrival is only available before service starts';end if;
 if p_event='a_caminho' and exists(select 1 from public.service_schedule_changes where request_id=r.id and status='pendente') then
  raise exception using errcode='RA004',message='Pending reschedule decision required';
 end if;
 select * into c from public.service_contracts where request_id=r.id order by version desc limit 1;
 if not found or exists(select 1 from public.service_contract_decisions d where d.contract_id=c.id and d.decision='recusado')
  or (select count(*) from public.service_contract_decisions d where d.contract_id=c.id and d.decision='aceito')<>2 then
  raise exception using errcode='SE002',message='Bilateral contract acceptance required';
 end if;
 if p_event='chegou_local' and not exists(select 1 from public.service_execution_events where request_id=r.id and event_type='a_caminho') then
  raise exception using errcode='SE009',message='Provider must be on the way before arrival';
 end if;
 insert into public.service_execution_events(request_id,actor_id,event_type) values(r.id,auth.uid(),p_event);
 return true;
end $$;
