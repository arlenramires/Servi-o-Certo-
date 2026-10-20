create or replace function private.set_open_request_description(p_request_id uuid,p_description text)
returns boolean language plpgsql security definer set search_path='' as $$
declare r public.service_requests%rowtype;
begin
  if auth.uid() is null then
    raise exception using errcode='42501',message='Authentication required';
  end if;
  if p_description is null or char_length(btrim(p_description))<10 or char_length(btrim(p_description))>3000 then
    raise exception using errcode='RE001',message='Description must contain 10 to 3000 characters';
  end if;
  select * into r from public.service_requests where id=p_request_id for update;
  if not found or r.client_id is distinct from auth.uid() then
    raise exception using errcode='42501',message='Only request client may change description';
  end if;
  if r.status<>'aberto' or r.provider_id is not null then
    raise exception using errcode='RE002',message='Description may only change while request is open';
  end if;
  update public.service_requests set description=btrim(p_description)
  where id=r.id and description is distinct from btrim(p_description);
  return true;
end $$;
revoke all on function private.set_open_request_description(uuid,text) from public,anon;
grant execute on function private.set_open_request_description(uuid,text) to authenticated;

create or replace function public.set_open_request_description(p_request_id uuid,p_description text)
returns boolean language sql security invoker set search_path=''
as $$select private.set_open_request_description(p_request_id,p_description);$$;
revoke all on function public.set_open_request_description(uuid,text) from public,anon;
grant execute on function public.set_open_request_description(uuid,text) to authenticated;
