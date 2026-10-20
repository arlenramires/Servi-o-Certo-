alter table public.service_schedule_changes drop constraint service_schedule_changes_status_check;
alter table public.service_schedule_changes drop constraint service_schedule_changes_check;
alter table public.service_schedule_changes
 add constraint service_schedule_changes_status_check check(status in ('pendente','aceito','recusado','cancelado')),
 add constraint service_schedule_changes_decision_check check(
  (status='pendente' and decided_by is null and decided_at is null)
  or (status in ('aceito','recusado','cancelado') and decided_by is not null and decided_at is not null)
 );

create or replace function private.cancel_service_reschedule(p_change_id uuid)
returns boolean language plpgsql security definer set search_path='' as $$
declare c public.service_schedule_changes%rowtype;r public.service_requests%rowtype;
begin
 if auth.uid() is null then raise exception using errcode='42501',message='Authentication required';end if;
 select * into c from public.service_schedule_changes where id=p_change_id for update;
 if not found then raise exception using errcode='42501',message='Reschedule unavailable';end if;
 select * into r from public.service_requests where id=c.request_id;
 if c.proposed_by is distinct from auth.uid()
  or (r.client_id is distinct from auth.uid() and r.provider_id is distinct from auth.uid()) then
  raise exception using errcode='42501',message='Only proposer may cancel reschedule';
 end if;
 if c.status='cancelado' and c.decided_by=auth.uid() then return true;end if;
 if c.status<>'pendente' then raise exception using errcode='RA003',message='Reschedule decision is immutable';end if;
 update public.service_schedule_changes
 set status='cancelado',decided_by=auth.uid(),decided_at=now()
 where id=c.id;
 return true;
end $$;

revoke all on function private.cancel_service_reschedule(uuid) from public,anon;
grant execute on function private.cancel_service_reschedule(uuid) to authenticated;

create or replace function public.cancel_service_reschedule(p_change_id uuid)
returns boolean language sql security invoker set search_path=''
as $$select private.cancel_service_reschedule(p_change_id);$$;
revoke all on function public.cancel_service_reschedule(uuid) from public,anon;
grant execute on function public.cancel_service_reschedule(uuid) to authenticated;
