create table public.service_message_reads (
  request_id uuid not null references public.service_requests(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  read_through timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (request_id,user_id)
);

alter table public.service_message_reads enable row level security;
revoke all on public.service_message_reads from public,anon,authenticated;
grant select on public.service_message_reads to authenticated;

create policy service_message_reads_select_own
on public.service_message_reads for select to authenticated
using (user_id=(select auth.uid()) and exists (
  select 1 from public.service_requests r
  where r.id=request_id and (r.client_id=(select auth.uid()) or r.provider_id=(select auth.uid()))
));

create or replace function private.mark_conversation_read(p_request_id uuid)
returns boolean language plpgsql security definer set search_path=pg_catalog,public,private as $$
declare v_user uuid:=auth.uid();
begin
  if v_user is null or not exists(
    select 1 from public.service_requests r
    where r.id=p_request_id and (r.client_id=v_user or r.provider_id=v_user)
  ) then raise insufficient_privilege using message='Conversation is not available'; end if;
  insert into public.service_message_reads(request_id,user_id,read_through,updated_at)
  values(p_request_id,v_user,now(),now())
  on conflict(request_id,user_id) do update
    set read_through=greatest(service_message_reads.read_through,excluded.read_through),updated_at=now();
  return true;
end$$;
revoke all on function private.mark_conversation_read(uuid) from public,anon,authenticated;
grant execute on function private.mark_conversation_read(uuid) to authenticated;

create or replace function public.mark_conversation_read(p_request_id uuid)
returns boolean language sql security invoker set search_path=pg_catalog,public,private as
$$select private.mark_conversation_read(p_request_id)$$;
revoke all on function public.mark_conversation_read(uuid) from public,anon;
grant execute on function public.mark_conversation_read(uuid) to authenticated;

create or replace function public.unread_service_message_counts()
returns table(request_id uuid,unread_count bigint)
language sql stable security invoker set search_path=pg_catalog,public as $$
  select r.id,count(m.id)::bigint
  from public.service_requests r
  join public.service_messages m on m.request_id=r.id and m.sender_id<>auth.uid()
  left join public.service_message_reads mr on mr.request_id=r.id and mr.user_id=auth.uid()
  where auth.uid() is not null
    and (r.client_id=auth.uid() or r.provider_id=auth.uid())
    and m.created_at>coalesce(mr.read_through,'-infinity'::timestamptz)
  group by r.id;
$$;
revoke all on function public.unread_service_message_counts() from public,anon;
grant execute on function public.unread_service_message_counts() to authenticated;
