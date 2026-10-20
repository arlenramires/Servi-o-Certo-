create or replace function private.set_open_request_schedule(p_request_id uuid,p_scheduled_for timestamptz)
returns boolean language plpgsql security definer set search_path='' as $$
declare r public.service_requests%rowtype;
begin
  if auth.uid() is null then
    raise exception using errcode='42501',message='Authentication required';
  end if;
  if p_scheduled_for is not null and p_scheduled_for<=now() then
    raise exception using errcode='RS001',message='Schedule must be in the future';
  end if;
  select * into r from public.service_requests where id=p_request_id for update;
  if not found or r.client_id is distinct from auth.uid() then
    raise exception using errcode='42501',message='Only request client may change schedule';
  end if;
  if r.status<>'aberto' or r.provider_id is not null then
    raise exception using errcode='RS002',message='Schedule may only change while request is open';
  end if;
  update public.service_requests set scheduled_for=p_scheduled_for
  where id=r.id and scheduled_for is distinct from p_scheduled_for;
  return true;
end $$;
revoke all on function private.set_open_request_schedule(uuid,timestamptz) from public,anon;
grant execute on function private.set_open_request_schedule(uuid,timestamptz) to authenticated;

create or replace function public.set_open_request_schedule(p_request_id uuid,p_scheduled_for timestamptz)
returns boolean language sql security invoker set search_path=''
as $$select private.set_open_request_schedule(p_request_id,p_scheduled_for);$$;
revoke all on function public.set_open_request_schedule(uuid,timestamptz) from public,anon;
grant execute on function public.set_open_request_schedule(uuid,timestamptz) to authenticated;
