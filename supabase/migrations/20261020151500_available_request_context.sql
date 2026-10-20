create or replace function private.available_request_context()
returns table(
  request_id uuid,
  requested_profession text,
  requested_at timestamptz,
  city text,
  state text,
  is_urgent boolean,
  scheduled_for timestamptz
)
language sql stable security definer set search_path='' as $$
select r.id,r.profession,r.created_at,r.city,r.state,r.is_urgent,r.scheduled_for
from public.service_requests r
where private.request_eligible((select auth.uid()),r.id)
  and not exists(select 1 from public.service_cancellations c
    where c.replacement_request_id=r.id and c.actor_id=(select auth.uid()))
  and not exists(select 1 from private.provider_request_declines d
    where d.request_id=r.id and d.provider_id=(select auth.uid()))
order by r.is_urgent desc,r.created_at asc
limit 30;
$$;
revoke all on function private.available_request_context() from public,anon;
grant execute on function private.available_request_context() to authenticated;

create or replace function public.available_request_context()
returns table(
  request_id uuid,
  requested_profession text,
  requested_at timestamptz,
  city text,
  state text,
  is_urgent boolean,
  scheduled_for timestamptz
)
language sql security invoker set search_path=''
as $$select * from private.available_request_context();$$;
revoke all on function public.available_request_context() from public,anon;
grant execute on function public.available_request_context() to authenticated;
