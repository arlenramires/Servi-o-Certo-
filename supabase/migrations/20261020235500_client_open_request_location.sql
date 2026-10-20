create or replace function private.set_open_request_location(p_request_id uuid,p_city text,p_state text)
returns boolean language plpgsql security definer set search_path='' as $$
declare r public.service_requests%rowtype;
begin
  if auth.uid() is null then
    raise exception using errcode='42501',message='Authentication required';
  end if;
  if p_city is null or char_length(btrim(p_city))<2 or char_length(btrim(p_city))>100
    or p_state is null or upper(btrim(p_state))!~'^[A-Z]{2}$' then
    raise exception using errcode='RL001',message='City and state are invalid';
  end if;
  select * into r from public.service_requests where id=p_request_id for update;
  if not found or r.client_id is distinct from auth.uid() then
    raise exception using errcode='42501',message='Only request client may change location';
  end if;
  if r.status<>'aberto' or r.provider_id is not null then
    raise exception using errcode='RL002',message='Location may only change while request is open';
  end if;
  update public.service_requests set
    city=btrim(p_city),
    state=upper(btrim(p_state)),
    latitude=case when lower(btrim(r.city)) is distinct from lower(btrim(p_city))
      or upper(btrim(r.state)) is distinct from upper(btrim(p_state)) then null else r.latitude end,
    longitude=case when lower(btrim(r.city)) is distinct from lower(btrim(p_city))
      or upper(btrim(r.state)) is distinct from upper(btrim(p_state)) then null else r.longitude end
  where id=r.id;
  return true;
end $$;
revoke all on function private.set_open_request_location(uuid,text,text) from public,anon;
grant execute on function private.set_open_request_location(uuid,text,text) to authenticated;

create or replace function public.set_open_request_location(p_request_id uuid,p_city text,p_state text)
returns boolean language sql security invoker set search_path=''
as $$select private.set_open_request_location(p_request_id,p_city,p_state);$$;
revoke all on function public.set_open_request_location(uuid,text,text) from public,anon;
grant execute on function public.set_open_request_location(uuid,text,text) to authenticated;
