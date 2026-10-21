create or replace function private.set_open_request_profession(p_request_id uuid,p_profession text)
returns boolean language plpgsql security definer set search_path='' as $$
declare
  r public.service_requests%rowtype;
  canonical_profession text;
begin
  if auth.uid() is null then
    raise exception using errcode='42501',message='Authentication required';
  end if;
  select name into canonical_profession
  from public.professions
  where normalized_name=lower(btrim(p_profession));
  if canonical_profession is null then
    raise exception using errcode='RP001',message='Profession is not in the approved catalog';
  end if;
  select * into r from public.service_requests where id=p_request_id for update;
  if not found or r.client_id is distinct from auth.uid() then
    raise exception using errcode='42501',message='Only request client may change profession';
  end if;
  if r.status<>'aberto' or r.provider_id is not null then
    raise exception using errcode='RP002',message='Profession may only change while request is open';
  end if;
  update public.service_requests set profession=canonical_profession where id=r.id;
  return true;
end $$;
revoke all on function private.set_open_request_profession(uuid,text) from public,anon;
grant execute on function private.set_open_request_profession(uuid,text) to authenticated;

create or replace function public.set_open_request_profession(p_request_id uuid,p_profession text)
returns boolean language sql security invoker set search_path=''
as $$select private.set_open_request_profession(p_request_id,p_profession);$$;
revoke all on function public.set_open_request_profession(uuid,text) from public,anon;
grant execute on function public.set_open_request_profession(uuid,text) to authenticated;
