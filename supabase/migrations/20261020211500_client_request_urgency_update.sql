create or replace function private.set_request_urgency(p_request_id uuid,p_urgent boolean)
returns boolean language plpgsql security definer set search_path='' as $$
declare r public.service_requests%rowtype;
begin
  if auth.uid() is null then
    raise exception using errcode='42501',message='Authentication required';
  end if;
  if p_urgent is null then
    raise exception using errcode='23514',message='Urgency must be true or false';
  end if;
  select * into r from public.service_requests where id=p_request_id for update;
  if not found or r.client_id is distinct from auth.uid() then
    raise exception using errcode='42501',message='Only request client may change urgency';
  end if;
  if r.status<>'aberto' or r.provider_id is not null then
    raise exception using errcode='RU001',message='Urgency may only change while request is open';
  end if;
  update public.service_requests set is_urgent=p_urgent where id=r.id and is_urgent is distinct from p_urgent;
  return true;
end $$;
revoke all on function private.set_request_urgency(uuid,boolean) from public,anon;
grant execute on function private.set_request_urgency(uuid,boolean) to authenticated;

create or replace function public.set_request_urgency(p_request_id uuid,p_urgent boolean)
returns boolean language sql security invoker set search_path=''
as $$select private.set_request_urgency(p_request_id,p_urgent);$$;
revoke all on function public.set_request_urgency(uuid,boolean) from public,anon;
grant execute on function public.set_request_urgency(uuid,boolean) to authenticated;
