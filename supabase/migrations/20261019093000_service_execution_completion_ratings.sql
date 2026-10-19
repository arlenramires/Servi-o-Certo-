create table public.service_execution_events (
 id uuid primary key default gen_random_uuid(),
 request_id uuid not null references public.service_requests(id),
 actor_id uuid not null references public.profiles(id),
 event_type text not null check(event_type in ('iniciado','conclusao_solicitada','conclusao_confirmada')),
 created_at timestamptz not null default now(),
 unique(request_id,event_type)
);
create table public.service_ratings (
 id uuid primary key default gen_random_uuid(),
 request_id uuid not null references public.service_requests(id),
 reviewer_id uuid not null references public.profiles(id),
 reviewee_id uuid not null references public.profiles(id),
 score smallint not null check(score between 1 and 5),
 comment text check(comment is null or char_length(comment)<=500),
 created_at timestamptz not null default now(),
 unique(request_id,reviewer_id),check(reviewer_id<>reviewee_id)
);
create index service_execution_events_actor_idx on public.service_execution_events(actor_id);
create index service_ratings_reviewee_idx on public.service_ratings(reviewee_id);
alter table public.service_execution_events enable row level security;
alter table public.service_ratings enable row level security;
revoke all on public.service_execution_events,public.service_ratings from public,anon,authenticated;
grant select on public.service_execution_events,public.service_ratings to authenticated;
create policy execution_participants_read on public.service_execution_events for select to authenticated
using(exists(select 1 from public.service_requests r where r.id=service_execution_events.request_id
 and (r.client_id=(select auth.uid()) or r.provider_id=(select auth.uid()))));
create policy ratings_participants_read on public.service_ratings for select to authenticated
using(exists(select 1 from public.service_requests r where r.id=service_ratings.request_id
 and (r.client_id=(select auth.uid()) or r.provider_id=(select auth.uid()))));

create or replace function private.start_service(p_request_id uuid)
returns boolean language plpgsql security definer set search_path='' as $$
declare r public.service_requests%rowtype;c public.service_contracts%rowtype;
begin
 if auth.uid() is null then raise exception using errcode='42501',message='Authentication required';end if;
 select * into r from public.service_requests where id=p_request_id for update;
 if not found or r.provider_id is distinct from auth.uid() then raise exception using errcode='42501',message='Only assigned provider may start';end if;
 if r.status='em_andamento' and exists(select 1 from public.service_execution_events where request_id=r.id and event_type='iniciado') then return true;end if;
 if r.status<>'aceito' then raise exception using errcode='SE001',message='Request is not ready to start';end if;
 select * into c from public.service_contracts where request_id=r.id order by version desc limit 1;
 if not found or exists(select 1 from public.service_contract_decisions d where d.contract_id=c.id and d.decision='recusado')
  or (select count(*) from public.service_contract_decisions d where d.contract_id=c.id and d.decision='aceito')<>2 then
  raise exception using errcode='SE002',message='Bilateral contract acceptance required';
 end if;
 update public.service_requests set status='em_andamento' where id=r.id;
 insert into public.service_execution_events(request_id,actor_id,event_type) values(r.id,auth.uid(),'iniciado');
 return true;
end $$;

create or replace function private.request_service_completion(p_request_id uuid)
returns boolean language plpgsql security definer set search_path='' as $$
declare r public.service_requests%rowtype;
begin
 if auth.uid() is null then raise exception using errcode='42501',message='Authentication required';end if;
 select * into r from public.service_requests where id=p_request_id for update;
 if not found or r.provider_id is distinct from auth.uid() then raise exception using errcode='42501',message='Only assigned provider may request completion';end if;
 if r.status<>'em_andamento' then raise exception using errcode='SE003',message='Service is not in progress';end if;
 if exists(select 1 from public.service_execution_events where request_id=r.id and event_type='conclusao_solicitada') then return true;end if;
 insert into public.service_execution_events(request_id,actor_id,event_type) values(r.id,auth.uid(),'conclusao_solicitada');
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
 update public.service_requests set status='concluido' where id=r.id;
 insert into public.service_execution_events(request_id,actor_id,event_type) values(r.id,auth.uid(),'conclusao_confirmada');
 return true;
end $$;

create or replace function private.rate_completed_service(p_request_id uuid,p_score integer,p_comment text default null)
returns uuid language plpgsql security definer set search_path='' as $$
declare r public.service_requests%rowtype;reviewee uuid;new_id uuid;
begin
 if auth.uid() is null then raise exception using errcode='42501',message='Authentication required';end if;
 select * into r from public.service_requests where id=p_request_id;
 if not found or auth.uid() not in (r.client_id,r.provider_id) then raise exception using errcode='42501',message='Only participants may rate';end if;
 if r.status<>'concluido' then raise exception using errcode='SE005',message='Completed service required';end if;
 if p_score not between 1 and 5 or p_comment is not null and char_length(p_comment)>500 then raise exception using errcode='SE006',message='Invalid rating';end if;
 reviewee=case when auth.uid()=r.client_id then r.provider_id else r.client_id end;
 if exists(select 1 from public.service_ratings where request_id=r.id and reviewer_id=auth.uid()) then
  raise exception using errcode='SE007',message='Rating is immutable';
 end if;
 insert into public.service_ratings(request_id,reviewer_id,reviewee_id,score,comment)
 values(r.id,auth.uid(),reviewee,p_score,nullif(btrim(p_comment),'')) returning id into new_id;
 return new_id;
end $$;

revoke all on function private.start_service(uuid),private.request_service_completion(uuid),
 private.confirm_service_completion(uuid),private.rate_completed_service(uuid,integer,text) from public,anon;
grant execute on function private.start_service(uuid),private.request_service_completion(uuid),
 private.confirm_service_completion(uuid),private.rate_completed_service(uuid,integer,text) to authenticated;
create or replace function public.start_service(p_request_id uuid) returns boolean language sql security invoker set search_path='' as $$select private.start_service(p_request_id);$$;
create or replace function public.request_service_completion(p_request_id uuid) returns boolean language sql security invoker set search_path='' as $$select private.request_service_completion(p_request_id);$$;
create or replace function public.confirm_service_completion(p_request_id uuid) returns boolean language sql security invoker set search_path='' as $$select private.confirm_service_completion(p_request_id);$$;
create or replace function public.rate_completed_service(p_request_id uuid,p_score integer,p_comment text default null) returns uuid language sql security invoker set search_path='' as $$select private.rate_completed_service(p_request_id,p_score,p_comment);$$;
revoke all on function public.start_service(uuid),public.request_service_completion(uuid),
 public.confirm_service_completion(uuid),public.rate_completed_service(uuid,integer,text) from public,anon;
grant execute on function public.start_service(uuid),public.request_service_completion(uuid),
 public.confirm_service_completion(uuid),public.rate_completed_service(uuid,integer,text) to authenticated;
