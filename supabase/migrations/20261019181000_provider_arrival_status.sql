alter table public.service_execution_events
 drop constraint service_execution_events_event_type_check,
 add constraint service_execution_events_event_type_check
 check(event_type in ('a_caminho','chegou_local','iniciado','conclusao_solicitada','conclusao_confirmada'));

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

revoke all on function private.mark_provider_arrival(uuid,text) from public,anon;
grant execute on function private.mark_provider_arrival(uuid,text) to authenticated;
create or replace function public.mark_provider_arrival(p_request_id uuid,p_event text)
returns boolean language sql security invoker set search_path='' as $$select private.mark_provider_arrival(p_request_id,p_event);$$;
revoke all on function public.mark_provider_arrival(uuid,text) from public,anon;
grant execute on function public.mark_provider_arrival(uuid,text) to authenticated;
