create table public.service_completion_adjustments (
 id uuid primary key default gen_random_uuid(),
 request_id uuid not null unique references public.service_requests(id),
 client_id uuid not null references public.profiles(id),
 provider_id uuid not null references public.profiles(id),
 description text not null check(char_length(description) between 10 and 500),
 status text not null default 'pendente' check(status in ('pendente','respondido')),
 provider_response text check(provider_response is null or char_length(provider_response) between 10 and 500),
 created_at timestamptz not null default now(),
 responded_at timestamptz,
 check((status='pendente' and provider_response is null and responded_at is null)
  or (status='respondido' and provider_response is not null and responded_at is not null))
);

create index service_completion_adjustments_client_idx on public.service_completion_adjustments(client_id);
create index service_completion_adjustments_provider_idx on public.service_completion_adjustments(provider_id);
alter table public.service_completion_adjustments enable row level security;
revoke all on public.service_completion_adjustments from public,anon,authenticated;
grant select on public.service_completion_adjustments to authenticated;
create policy completion_adjustments_participants_read on public.service_completion_adjustments for select to authenticated
using(client_id=(select auth.uid()) or provider_id=(select auth.uid()));

create or replace function private.request_completion_adjustment(p_request_id uuid,p_description text)
returns uuid language plpgsql security definer set search_path='' as $$
declare r public.service_requests%rowtype;existing public.service_completion_adjustments%rowtype;new_id uuid;clean text;
begin
 if auth.uid() is null then raise exception using errcode='42501',message='Authentication required';end if;
 clean=nullif(btrim(p_description),'');
 if clean is null or char_length(clean) not between 10 and 500 then
  raise exception using errcode='SE015',message='Invalid completion adjustment';
 end if;
 select * into r from public.service_requests where id=p_request_id for update;
 if not found or r.client_id is distinct from auth.uid() then
  raise exception using errcode='42501',message='Only client may request completion adjustment';
 end if;
 if r.status<>'em_andamento'
  or not exists(select 1 from public.service_execution_events where request_id=r.id and event_type='conclusao_solicitada')
  or exists(select 1 from public.service_execution_events where request_id=r.id and event_type='conclusao_confirmada') then
  raise exception using errcode='SE015',message='Provider completion request required';
 end if;
 select * into existing from public.service_completion_adjustments where request_id=r.id;
 if found then
  if existing.description=clean then return existing.id;end if;
  raise exception using errcode='SE018',message='Completion adjustment is immutable';
 end if;
 insert into public.service_completion_adjustments(request_id,client_id,provider_id,description)
 values(r.id,r.client_id,r.provider_id,clean) returning id into new_id;
 return new_id;
end $$;

create or replace function private.respond_completion_adjustment(p_request_id uuid,p_response text)
returns boolean language plpgsql security definer set search_path='' as $$
declare r public.service_requests%rowtype;a public.service_completion_adjustments%rowtype;clean text;
begin
 if auth.uid() is null then raise exception using errcode='42501',message='Authentication required';end if;
 clean=nullif(btrim(p_response),'');
 if clean is null or char_length(clean) not between 10 and 500 then
  raise exception using errcode='SE017',message='Invalid completion adjustment response';
 end if;
 select * into r from public.service_requests where id=p_request_id for update;
 if not found or r.provider_id is distinct from auth.uid() then
  raise exception using errcode='42501',message='Only assigned provider may respond to completion adjustment';
 end if;
 select * into a from public.service_completion_adjustments where request_id=r.id for update;
 if not found or r.status<>'em_andamento' then
  raise exception using errcode='SE017',message='Pending completion adjustment required';
 end if;
 if a.status='respondido' then
  if a.provider_response=clean then return true;end if;
  raise exception using errcode='SE018',message='Completion adjustment response is immutable';
 end if;
 update public.service_completion_adjustments set status='respondido',provider_response=clean,responded_at=now() where id=a.id;
 return true;
end $$;

create or replace function private.confirm_service_completion(p_request_id uuid)
returns boolean language plpgsql security definer set search_path='' as $$
declare r public.service_requests%rowtype;
begin
 if auth.uid() is null then raise exception using errcode='42501',message='Authentication required';end if;
 select * into r from public.service_requests where id=p_request_id for update;
 if not found or r.client_id<>auth.uid() then raise exception using errcode='42501',message='Only client may confirm completion';end if;
 if r.status='concluido' and exists(select 1 from public.service_execution_events where request_id=r.id and event_type='conclusao_confirmada') then return true;end if;
 if r.status<>'em_andamento' or not exists(select 1 from public.service_execution_events where request_id=r.id and event_type='conclusao_solicitada') then
  raise exception using errcode='SE004',message='Provider completion request required';
 end if;
 if exists(select 1 from public.service_completion_adjustments where request_id=r.id and status='pendente') then
  raise exception using errcode='SE016',message='Completion adjustment response required';
 end if;
 update public.service_requests set status='concluido' where id=r.id;
 insert into public.service_execution_events(request_id,actor_id,event_type) values(r.id,auth.uid(),'conclusao_confirmada');
 return true;
end $$;

revoke all on function private.request_completion_adjustment(uuid,text),private.respond_completion_adjustment(uuid,text),
 private.confirm_service_completion(uuid) from public,anon;
grant execute on function private.request_completion_adjustment(uuid,text),private.respond_completion_adjustment(uuid,text),
 private.confirm_service_completion(uuid) to authenticated;
create or replace function public.request_completion_adjustment(p_request_id uuid,p_description text)
returns uuid language sql security invoker set search_path='' as $$select private.request_completion_adjustment(p_request_id,p_description);$$;
create or replace function public.respond_completion_adjustment(p_request_id uuid,p_response text)
returns boolean language sql security invoker set search_path='' as $$select private.respond_completion_adjustment(p_request_id,p_response);$$;
revoke all on function public.request_completion_adjustment(uuid,text),public.respond_completion_adjustment(uuid,text) from public,anon;
grant execute on function public.request_completion_adjustment(uuid,text),public.respond_completion_adjustment(uuid,text) to authenticated;
