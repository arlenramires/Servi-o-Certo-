create table public.service_contracts (
 id uuid primary key default gen_random_uuid(),
 request_id uuid not null references public.service_requests(id),
 quote_id uuid not null references public.service_quotes(id),
 client_id uuid not null references public.profiles(id),
 provider_id uuid not null references public.profiles(id),
 version integer not null check(version>0),
 document jsonb not null,
 content_hash text not null check(content_hash ~ '^[a-f0-9]{64}$'),
 created_at timestamptz not null default now(),
 unique(request_id,version),check(client_id<>provider_id)
);
create table public.service_contract_decisions (
 id uuid primary key default gen_random_uuid(),
 contract_id uuid not null references public.service_contracts(id),
 actor_id uuid not null references public.profiles(id),
 decision text not null check(decision in ('aceito','recusado')),
 content_hash text not null check(content_hash ~ '^[a-f0-9]{64}$'),
 created_at timestamptz not null default now(),
 unique(contract_id,actor_id)
);
create index service_contracts_client_idx on public.service_contracts(client_id);
create index service_contracts_provider_idx on public.service_contracts(provider_id);
create index service_contracts_quote_idx on public.service_contracts(quote_id);
create index service_contract_decisions_actor_idx on public.service_contract_decisions(actor_id);
alter table public.service_contracts enable row level security;
alter table public.service_contract_decisions enable row level security;
revoke all on public.service_contracts,public.service_contract_decisions from public,anon,authenticated;
grant select on public.service_contracts,public.service_contract_decisions to authenticated;
create policy contracts_participants_read on public.service_contracts for select to authenticated
using(client_id=(select auth.uid()) or provider_id=(select auth.uid()));
create policy contract_decisions_participants_read on public.service_contract_decisions for select to authenticated
using(exists(select 1 from public.service_contracts c where c.id=service_contract_decisions.contract_id
 and (c.client_id=(select auth.uid()) or c.provider_id=(select auth.uid()))));

create or replace function private.propose_service_contract(
 p_request_id uuid,p_starts_at timestamptz,p_ends_at timestamptz,p_responsibilities text,p_stages jsonb
) returns uuid language plpgsql security definer set search_path='' set timezone='UTC' as $$
declare
 r public.service_requests%rowtype; q public.service_quotes%rowtype;
 previous public.service_contracts%rowtype;
 stage jsonb; stages jsonb='[]'::jsonb; stage_amount numeric; total numeric=0;
 doc jsonb; new_id uuid; next_version integer; client_name text; provider_name text;
begin
 if auth.uid() is null then raise exception using errcode='42501',message='Authentication required'; end if;
 select * into r from public.service_requests where id=p_request_id for update;
 if not found or r.provider_id is distinct from auth.uid() or r.client_id=auth.uid() then
  raise exception using errcode='42501',message='Only assigned provider may propose';
 end if;
 if r.status<>'aceito' then raise exception using errcode='SC001',message='Request is not ready for a contract'; end if;
 if not exists(select 1 from public.profiles p join auth.users u on u.id=p.id
   where p.id=auth.uid() and p.role='prestador' and u.email_confirmed_at is not null)
   or not exists(select 1 from auth.users u where u.id=r.client_id and u.email_confirmed_at is not null) then
  raise exception using errcode='42501',message='Verified accounts required';
 end if;
 select proposal.* into q from public.service_quotes proposal
 join public.service_quote_decisions d on d.quote_id=proposal.id and d.request_id=r.id
 where proposal.request_id=r.id and proposal.provider_id=r.provider_id
 and d.decided_by=r.client_id and d.decision='aceita';
 if not found then raise exception using errcode='SC001',message='Accepted quote required'; end if;
 select * into previous from public.service_contracts where request_id=r.id order by version desc limit 1;
 if found and not exists(select 1 from public.service_contract_decisions d where d.contract_id=previous.id and d.decision='recusado') then
  raise exception using errcode='SC002',message='Current version must be resolved before replacement';
 end if;
 next_version=coalesce(previous.version,0)+1;
 if p_starts_at is null or p_ends_at is null or not isfinite(p_starts_at) or not isfinite(p_ends_at)
  or p_starts_at<now()-interval '5 minutes' or p_ends_at<=p_starts_at
  or p_responsibilities is null or char_length(btrim(p_responsibilities)) not between 20 and 4000
  or p_stages is null or jsonb_typeof(p_stages)<>'array' then
  raise exception using errcode='SC005',message='Invalid dates, responsibilities or stages';
 end if;
 if jsonb_array_length(p_stages) not between 1 and 20 then
  raise exception using errcode='SC005',message='Invalid stage count';
 end if;
 for stage in select value from jsonb_array_elements(p_stages) loop
  if jsonb_typeof(stage)<>'object' or jsonb_typeof(stage->'amount_cents') is distinct from 'number'
   or jsonb_typeof(stage->'title') is distinct from 'string' or jsonb_typeof(stage->'due_description') is distinct from 'string'
   or char_length(btrim(stage->>'title')) not between 3 and 100
   or char_length(btrim(stage->>'due_description')) not between 3 and 200 then
   raise exception using errcode='SC005',message='Invalid stage';
  end if;
  stage_amount=(stage->>'amount_cents')::numeric;
  if stage_amount<1 or stage_amount>9007199254740991 or stage_amount<>trunc(stage_amount) then
   raise exception using errcode='SC005',message='Invalid stage amount';
  end if;
  total=total+stage_amount;
  stages=stages||jsonb_build_array(jsonb_build_object('title',btrim(stage->>'title'),
   'amount_cents',stage_amount::bigint,'due_description',btrim(stage->>'due_description')));
 end loop;
 if total<>q.amount_cents then raise exception using errcode='SC005',message='Stage sum differs from accepted quote'; end if;
 select full_name into client_name from public.profiles where id=r.client_id;
 select full_name into provider_name from public.profiles where id=r.provider_id;
 doc=jsonb_build_object('template_version','sc-homologacao-v1','version',next_version,
  'request_id',r.id,'quote_id',q.id,'client',jsonb_build_object('id',r.client_id,'name',client_name),
  'provider',jsonb_build_object('id',r.provider_id,'name',provider_name),'profession',r.profession,
  'city',r.city,'state',r.state,'scope',q.description,'amount_cents',q.amount_cents,
  'starts_at',p_starts_at,'ends_at',p_ends_at,'responsibilities',btrim(p_responsibilities),'stages',stages);
 insert into public.service_contracts(request_id,quote_id,client_id,provider_id,version,document,content_hash)
 values(r.id,q.id,r.client_id,r.provider_id,next_version,doc,encode(sha256(convert_to(doc::text,'UTF8')),'hex'))
 returning id into new_id;
 return new_id;
end $$;
revoke all on function private.propose_service_contract(uuid,timestamptz,timestamptz,text,jsonb) from public,anon;
grant execute on function private.propose_service_contract(uuid,timestamptz,timestamptz,text,jsonb) to authenticated;

create or replace function private.decide_service_contract(p_contract_id uuid,p_content_hash text,p_decision text)
returns boolean language plpgsql security definer set search_path='' as $$
declare c public.service_contracts%rowtype; r public.service_requests%rowtype; existing text;
begin
 if auth.uid() is null then raise exception using errcode='42501',message='Authentication required'; end if;
 select * into c from public.service_contracts where id=p_contract_id;
 if not found or auth.uid() not in (c.client_id,c.provider_id) then
  raise exception using errcode='42501',message='Only participants may decide';
 end if;
 -- Creation and decisions serialize on the same request, including version changes.
 select * into r from public.service_requests where id=c.request_id for update;
 if r.status<>'aceito' or r.client_id<>c.client_id or r.provider_id is distinct from c.provider_id
  or c.id is distinct from (select id from public.service_contracts where request_id=c.request_id order by version desc limit 1) then
  raise exception using errcode='SC003',message='Version is no longer current';
 end if;
 if not exists(select 1 from auth.users u where u.id=auth.uid() and u.email_confirmed_at is not null) then
  raise exception using errcode='42501',message='Confirmed account required';
 end if;
 if p_content_hash is distinct from c.content_hash then raise exception using errcode='SC004',message='Document hash mismatch'; end if;
 if p_decision is null or p_decision not in ('aceito','recusado') then raise exception using errcode='SC005',message='Invalid decision'; end if;
 select decision into existing from public.service_contract_decisions where contract_id=c.id and actor_id=auth.uid();
 if found then
  if existing=p_decision then return true; end if;
  raise exception using errcode='SC006',message='Decision is immutable';
 end if;
 if exists(select 1 from public.service_contract_decisions d where d.contract_id=c.id and d.decision='recusado') then
  raise exception using errcode='SC003',message='Version was refused';
 end if;
 insert into public.service_contract_decisions(contract_id,actor_id,decision,content_hash)
 values(c.id,auth.uid(),p_decision,c.content_hash);
 return true;
end $$;
revoke all on function private.decide_service_contract(uuid,text,text) from public,anon;
grant execute on function private.decide_service_contract(uuid,text,text) to authenticated;

create or replace function public.propose_service_contract(
 p_request_id uuid,p_starts_at timestamptz,p_ends_at timestamptz,p_responsibilities text,p_stages jsonb
) returns uuid language sql security invoker set search_path='' as $$
 select private.propose_service_contract(p_request_id,p_starts_at,p_ends_at,p_responsibilities,p_stages);
$$;
create or replace function public.decide_service_contract(p_contract_id uuid,p_content_hash text,p_decision text)
returns boolean language sql security invoker set search_path='' as $$
 select private.decide_service_contract(p_contract_id,p_content_hash,p_decision);
$$;
revoke all on function public.propose_service_contract(uuid,timestamptz,timestamptz,text,jsonb) from public,anon;
revoke all on function public.decide_service_contract(uuid,text,text) from public,anon;
grant execute on function public.propose_service_contract(uuid,timestamptz,timestamptz,text,jsonb),
 public.decide_service_contract(uuid,text,text) to authenticated;
