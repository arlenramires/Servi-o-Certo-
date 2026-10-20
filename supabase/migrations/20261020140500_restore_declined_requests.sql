create or replace function private.declined_requests()
returns table(request_id uuid,requested_profession text,requested_at timestamptz,declined_at timestamptz)
language sql stable security definer set search_path='' as $$
select r.id,r.profession,r.created_at,d.created_at
from private.provider_request_declines d
join public.service_requests r on r.id=d.request_id
where d.provider_id=(select auth.uid())
  and private.request_eligible((select auth.uid()),r.id)
order by d.created_at desc
limit 30;
$$;
revoke all on function private.declined_requests() from public,anon;
grant execute on function private.declined_requests() to authenticated;

create or replace function private.restore_request_interest(p_request_id uuid)
returns boolean language plpgsql security definer set search_path='' as $$
declare restored boolean;
begin
  if auth.uid() is null then return false;end if;
  delete from private.provider_request_declines
  where provider_id=auth.uid() and request_id=p_request_id
  returning true into restored;
  return coalesce(restored,false);
end $$;
revoke all on function private.restore_request_interest(uuid) from public,anon;
grant execute on function private.restore_request_interest(uuid) to authenticated;

create or replace function public.declined_requests()
returns table(request_id uuid,requested_profession text,requested_at timestamptz,declined_at timestamptz)
language sql security invoker set search_path=''
as $$select * from private.declined_requests();$$;

create or replace function public.restore_request_interest(p_request_id uuid)
returns boolean language sql security invoker set search_path=''
as $$select private.restore_request_interest(p_request_id);$$;

revoke all on function public.declined_requests() from public,anon;
revoke all on function public.restore_request_interest(uuid) from public,anon;
grant execute on function public.declined_requests() to authenticated;
grant execute on function public.restore_request_interest(uuid) to authenticated;
