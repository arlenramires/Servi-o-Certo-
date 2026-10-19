create table public.service_disputes (
 id uuid primary key default gen_random_uuid(),
 request_id uuid not null unique references public.service_requests(id),
 opened_by uuid not null references public.profiles(id),
 category text not null check(category in ('escopo','qualidade','prazo','conduta','outro')),
 description text not null check(char_length(btrim(description)) between 20 and 2000),
 status text not null default 'aberta' check(status in ('aberta','respondida')),
 response_by uuid references public.profiles(id),
 response_body text check(response_body is null or char_length(btrim(response_body)) between 20 and 2000),
 created_at timestamptz not null default now(),
 responded_at timestamptz,
 check((status='aberta')=(response_by is null and response_body is null and responded_at is null)),
 check(response_by is null or response_by<>opened_by)
);
create index service_disputes_request_created_idx on public.service_disputes(request_id,created_at);
alter table public.service_disputes enable row level security;
revoke all on public.service_disputes from public,anon,authenticated;
grant select on public.service_disputes to authenticated;
create policy disputes_participants_read on public.service_disputes for select to authenticated
using(exists(select 1 from public.service_requests r where r.id=service_disputes.request_id
 and (r.client_id=(select auth.uid()) or r.provider_id=(select auth.uid()))));

create or replace function private.open_service_dispute(p_request_id uuid,p_category text,p_description text)
returns uuid language plpgsql security definer set search_path='' as $$
declare r public.service_requests%rowtype;existing public.service_disputes%rowtype;new_id uuid;
begin
 if auth.uid() is null then raise exception using errcode='42501',message='Authentication required';end if;
 if p_category is null or p_category not in ('escopo','qualidade','prazo','conduta','outro')
  or p_description is null or char_length(btrim(p_description)) not between 20 and 2000 then
  raise exception using errcode='DP001',message='Invalid dispute';
 end if;
 select * into r from public.service_requests where id=p_request_id for update;
 if not found or (r.client_id is distinct from auth.uid() and r.provider_id is distinct from auth.uid()) then
  raise exception using errcode='42501',message='Only service participants may open a dispute';
 end if;
 if r.status not in ('em_andamento','concluido') then
  raise exception using errcode='DP002',message='Service is not open for disputes';
 end if;
 select * into existing from public.service_disputes where request_id=r.id;
 if found then
  if existing.opened_by=auth.uid() and existing.category=p_category and existing.description=btrim(p_description) then return existing.id;end if;
  raise exception using errcode='DP003',message='Dispute record is immutable';
 end if;
 insert into public.service_disputes(request_id,opened_by,category,description)
 values(r.id,auth.uid(),p_category,btrim(p_description)) returning id into new_id;
 return new_id;
end $$;

create or replace function private.respond_service_dispute(p_dispute_id uuid,p_response text)
returns boolean language plpgsql security definer set search_path='' as $$
declare d public.service_disputes%rowtype;r public.service_requests%rowtype;
begin
 if auth.uid() is null then raise exception using errcode='42501',message='Authentication required';end if;
 if p_response is null or char_length(btrim(p_response)) not between 20 and 2000 then
  raise exception using errcode='DP001',message='Invalid dispute response';
 end if;
 select * into d from public.service_disputes where id=p_dispute_id for update;
 if not found then raise exception using errcode='42501',message='Dispute unavailable';end if;
 select * into r from public.service_requests where id=d.request_id;
 if auth.uid() not in (r.client_id,r.provider_id) or auth.uid()=d.opened_by then
  raise exception using errcode='42501',message='Only the other participant may respond';
 end if;
 if d.status='respondida' and d.response_by=auth.uid() and d.response_body=btrim(p_response) then return true;end if;
 if d.status<>'aberta' then raise exception using errcode='DP003',message='Dispute response is immutable';end if;
 update public.service_disputes set status='respondida',response_by=auth.uid(),response_body=btrim(p_response),responded_at=now() where id=d.id;
 return true;
end $$;

revoke all on function private.open_service_dispute(uuid,text,text),private.respond_service_dispute(uuid,text) from public,anon;
grant execute on function private.open_service_dispute(uuid,text,text),private.respond_service_dispute(uuid,text) to authenticated;
create or replace function public.open_service_dispute(p_request_id uuid,p_category text,p_description text)
returns uuid language sql security invoker set search_path='' as $$select private.open_service_dispute(p_request_id,p_category,p_description);$$;
create or replace function public.respond_service_dispute(p_dispute_id uuid,p_response text)
returns boolean language sql security invoker set search_path='' as $$select private.respond_service_dispute(p_dispute_id,p_response);$$;
revoke all on function public.open_service_dispute(uuid,text,text),public.respond_service_dispute(uuid,text) from public,anon;
grant execute on function public.open_service_dispute(uuid,text,text),public.respond_service_dispute(uuid,text) to authenticated;
