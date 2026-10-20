alter table public.service_execution_events
 drop constraint service_execution_events_event_type_check,
 add constraint service_execution_events_event_type_check
 check(event_type in ('a_caminho','chegou_local','chegada_confirmada_cliente','iniciado','conclusao_solicitada','conclusao_confirmada'));

create or replace function private.confirm_provider_arrival(p_request_id uuid)
returns boolean language plpgsql security definer set search_path='' as $$
declare r public.service_requests%rowtype;
begin
 if auth.uid() is null then raise exception using errcode='42501',message='Authentication required';end if;
 select * into r from public.service_requests where id=p_request_id for update;
 if not found or r.client_id is distinct from auth.uid() then
  raise exception using errcode='42501',message='Only client may confirm provider arrival';
 end if;
 if exists(select 1 from public.service_execution_events where request_id=r.id and event_type='chegada_confirmada_cliente') then return true;end if;
 if r.status<>'aceito' or not exists(select 1 from public.service_execution_events where request_id=r.id and event_type='chegou_local') then
  raise exception using errcode='SE013',message='Provider arrival required before client confirmation';
 end if;
 insert into public.service_execution_events(request_id,actor_id,event_type)
 values(r.id,auth.uid(),'chegada_confirmada_cliente');
 return true;
end $$;

create or replace function private.start_service(p_request_id uuid)
returns boolean language plpgsql security definer set search_path='' as $$
declare r public.service_requests%rowtype;c public.service_contracts%rowtype;
begin
 if auth.uid() is null then raise exception using errcode='42501',message='Authentication required';end if;
 select * into r from public.service_requests where id=p_request_id for update;
 if not found or r.provider_id is distinct from auth.uid() then raise exception using errcode='42501',message='Only assigned provider may start';end if;
 if r.status='em_andamento' and exists(select 1 from public.service_execution_events where request_id=r.id and event_type='iniciado') then return true;end if;
 if r.status<>'aceito' then raise exception using errcode='SE001',message='Request is not ready to start';end if;
 select * into c from public.service_contracts where request_id=r.id order by version desc limit 1;
 if not found or exists(select 1 from public.service_contract_decisions d where d.contract_id=c.id and d.decision='recusado')
  or (select count(*) from public.service_contract_decisions d where d.contract_id=c.id and d.decision='aceito')<>2 then
  raise exception using errcode='SE002',message='Bilateral contract acceptance required';
 end if;
 if not exists(select 1 from public.service_execution_events where request_id=r.id and event_type='chegou_local') then
  raise exception using errcode='SE010',message='Provider arrival required before start';
 end if;
 if not exists(select 1 from public.service_execution_events where request_id=r.id and event_type='chegada_confirmada_cliente') then
  raise exception using errcode='SE014',message='Client arrival confirmation required before start';
 end if;
 update public.service_requests set status='em_andamento' where id=r.id;
 insert into public.service_execution_events(request_id,actor_id,event_type) values(r.id,auth.uid(),'iniciado');
 return true;
end $$;

revoke all on function private.confirm_provider_arrival(uuid),private.start_service(uuid) from public,anon;
grant execute on function private.confirm_provider_arrival(uuid),private.start_service(uuid) to authenticated;
create or replace function public.confirm_provider_arrival(p_request_id uuid)
returns boolean language sql security invoker set search_path='' as $$select private.confirm_provider_arrival(p_request_id);$$;
revoke all on function public.confirm_provider_arrival(uuid) from public,anon;
grant execute on function public.confirm_provider_arrival(uuid) to authenticated;
