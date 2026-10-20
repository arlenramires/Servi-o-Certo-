create table public.service_progress_updates (
 id uuid primary key default gen_random_uuid(),
 request_id uuid not null references public.service_requests(id),
 provider_id uuid not null references public.profiles(id),
 progress_percent smallint not null check(progress_percent between 1 and 99),
 note text not null check(char_length(note) between 10 and 500),
 created_at timestamptz not null default now(),
 unique(request_id,progress_percent)
);

create index service_progress_updates_request_created_idx on public.service_progress_updates(request_id,created_at);
create index service_progress_updates_provider_idx on public.service_progress_updates(provider_id);
alter table public.service_progress_updates enable row level security;
revoke all on public.service_progress_updates from public,anon,authenticated;
grant select on public.service_progress_updates to authenticated;
create policy service_progress_participants_read on public.service_progress_updates for select to authenticated
using(exists(select 1 from public.service_requests r where r.id=service_progress_updates.request_id and ((select auth.uid())=r.client_id or (select auth.uid())=r.provider_id)));

create or replace function private.add_service_progress_update(p_request_id uuid,p_progress_percent integer,p_note text)
returns uuid language plpgsql security definer set search_path='' as $$
declare r public.service_requests%rowtype;existing public.service_progress_updates%rowtype;new_id uuid;clean text;latest integer;
begin
 if auth.uid() is null then raise exception using errcode='42501',message='Authentication required';end if;
 clean=nullif(btrim(p_note),'');
 if p_progress_percent not between 1 and 99 or clean is null or char_length(clean) not between 10 and 500 then
  raise exception using errcode='SP001',message='Invalid progress update';
 end if;
 select * into r from public.service_requests where id=p_request_id for update;
 if not found or r.provider_id is distinct from auth.uid() then
  raise exception using errcode='42501',message='Only assigned provider may add progress';
 end if;
 if r.status<>'em_andamento'
  or not exists(select 1 from public.service_execution_events where request_id=r.id and event_type='iniciado')
  or exists(select 1 from public.service_execution_events where request_id=r.id and event_type='conclusao_solicitada') then
  raise exception using errcode='SP003',message='Progress is unavailable in this stage';
 end if;
 select * into existing from public.service_progress_updates where request_id=r.id and progress_percent=p_progress_percent;
 if found then
  if existing.note=clean then return existing.id;end if;
  raise exception using errcode='SP002',message='Progress is immutable';
 end if;
 select coalesce(max(progress_percent),0) into latest from public.service_progress_updates where request_id=r.id;
 if p_progress_percent<=latest then raise exception using errcode='SP002',message='Progress must increase';end if;
 insert into public.service_progress_updates(request_id,provider_id,progress_percent,note)
 values(r.id,auth.uid(),p_progress_percent,clean) returning id into new_id;
 return new_id;
end $$;

revoke all on function private.add_service_progress_update(uuid,integer,text) from public,anon;
grant execute on function private.add_service_progress_update(uuid,integer,text) to authenticated;
create or replace function public.add_service_progress_update(p_request_id uuid,p_progress_percent integer,p_note text)
returns uuid language sql security invoker set search_path='' as $$select private.add_service_progress_update(p_request_id,p_progress_percent,p_note);$$;
revoke all on function public.add_service_progress_update(uuid,integer,text) from public,anon;
grant execute on function public.add_service_progress_update(uuid,integer,text) to authenticated;
