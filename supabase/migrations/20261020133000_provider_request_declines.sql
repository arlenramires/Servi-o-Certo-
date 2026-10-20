create table private.provider_request_declines (
 provider_id uuid not null references public.profiles(id),
 request_id uuid not null references public.service_requests(id) on delete cascade,
 created_at timestamptz not null default now(),
 primary key(provider_id,request_id)
);
revoke all on private.provider_request_declines from public,anon,authenticated;

create or replace function private.decline_request(p_request_id uuid)
returns boolean language plpgsql security definer set search_path='' as $$
begin
 if auth.uid() is null then return false;end if;
 perform 1 from public.service_requests where id=p_request_id for update;
 if not found or not private.request_eligible(auth.uid(),p_request_id) then return false;end if;
 insert into private.provider_request_declines(provider_id,request_id)
 values(auth.uid(),p_request_id) on conflict do nothing;
 return true;
end $$;
revoke all on function private.decline_request(uuid) from public,anon;
grant execute on function private.decline_request(uuid) to authenticated;

create or replace function private.available_requests()
returns table(request_id uuid,requested_profession text,requested_at timestamptz)
language sql stable security definer set search_path='' as $$
select r.id,r.profession,r.created_at from public.service_requests r
where private.request_eligible((select auth.uid()),r.id)
 and not exists(select 1 from public.service_cancellations c
  where c.replacement_request_id=r.id and c.actor_id=(select auth.uid()))
 and not exists(select 1 from private.provider_request_declines d
  where d.request_id=r.id and d.provider_id=(select auth.uid()))
order by r.is_urgent desc,r.created_at asc limit 30;
$$;

create or replace function private.accept_request(p_request_id uuid)
returns boolean language plpgsql security definer set search_path='' as $$
declare claimed boolean;
begin
 if auth.uid() is null then return false;end if;
 update public.service_requests r set provider_id=auth.uid(),status='aceito'
 where r.id=p_request_id and r.status='aberto' and r.provider_id is null
 and private.request_eligible(auth.uid(),r.id)
 and not exists(select 1 from private.provider_request_declines d where d.request_id=r.id and d.provider_id=auth.uid())
 returning true into claimed;
 return coalesce(claimed,false);
end $$;

create or replace function public.decline_request(p_request_id uuid)
returns boolean language sql security invoker set search_path=''
as $$select private.decline_request(p_request_id);$$;
revoke all on function public.decline_request(uuid) from public,anon;
grant execute on function public.decline_request(uuid) to authenticated;
