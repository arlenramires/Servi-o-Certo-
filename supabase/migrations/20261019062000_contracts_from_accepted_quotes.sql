-- Immutable, versioned contract snapshots are created only from an accepted quote.
create table if not exists public.service_contracts (
 id uuid primary key default gen_random_uuid(),
 request_id uuid not null references public.service_requests(id),
 quote_id uuid not null unique references public.service_quotes(id),
 client_id uuid not null references auth.users(id),
 provider_id uuid not null references auth.users(id),
 profession text not null,
 scope_and_deadline text not null check (char_length(btrim(scope_and_deadline)) between 5 and 3000),
 amount_cents bigint not null check (amount_cents between 1 and 9007199254740991),
 scheduled_for timestamptz,
 stages jsonb not null,
 terms_version integer not null default 1 check (terms_version=1),
 terms_text text not null,
 content_fingerprint text not null,
 created_at timestamptz not null default now()
);

create table if not exists public.service_contract_acceptances (
 id uuid primary key default gen_random_uuid(),
 contract_id uuid not null references public.service_contracts(id),
 signed_by uuid not null references auth.users(id),
 party_role text not null check (party_role in ('cliente','prestador')),
 accepted_fingerprint text not null,
 accepted_at timestamptz not null default now(),
 unique(contract_id,signed_by),
 unique(contract_id,party_role)
);

alter table public.service_contracts enable row level security;
alter table public.service_contract_acceptances enable row level security;

create policy contract_participants_read on public.service_contracts
 for select to authenticated using ((select auth.uid()) in (client_id,provider_id));

create policy contract_acceptances_participants_read on public.service_contract_acceptances
 for select to authenticated using (exists(
  select 1 from public.service_contracts c
  where c.id=service_contract_acceptances.contract_id
   and (select auth.uid()) in (c.client_id,c.provider_id)
 ));

create policy contract_acceptances_own_insert on public.service_contract_acceptances
 for insert to authenticated with check (
  signed_by=(select auth.uid())
  and accepted_fingerprint=(select c.content_fingerprint from public.service_contracts c where c.id=contract_id)
  and party_role=(select case when c.client_id=(select auth.uid()) then 'cliente'
                              when c.provider_id=(select auth.uid()) then 'prestador' end
                  from public.service_contracts c where c.id=contract_id)
 );

revoke all on public.service_contracts from anon,authenticated;
grant select on public.service_contracts to authenticated;
revoke all on public.service_contract_acceptances from anon,authenticated;
grant select on public.service_contract_acceptances to authenticated;
grant insert(contract_id,signed_by,party_role,accepted_fingerprint)
 on public.service_contract_acceptances to authenticated;

create or replace function public.create_contract_from_accepted_quote(p_quote_id uuid)
returns uuid language plpgsql security definer set search_path='' as $$
declare
 v_contract_id uuid;
 v_uid uuid := auth.uid();
 v_quote public.service_quotes%rowtype;
 v_request public.service_requests%rowtype;
 v_stages jsonb;
 v_terms constant text := 'Versão 1: cliente e prestador confirmam o escopo, o valor, o prazo e as etapas registrados. Pagamento, garantia, adicionais, cancelamento e emissão fiscal exigem fluxos próprios da plataforma.';
 v_fingerprint text;
begin
 if v_uid is null then raise exception 'Authentication required' using errcode='42501'; end if;
 select * into v_quote from public.service_quotes where id=p_quote_id;
 if not found then raise exception 'Accepted quote not found' using errcode='P0002'; end if;
 select * into v_request from public.service_requests where id=v_quote.request_id;
 if v_uid not in (v_request.client_id,v_request.provider_id) then
  raise exception 'Not a contract participant' using errcode='42501';
 end if;
 if v_request.provider_id is null or v_request.provider_id<>v_quote.provider_id
    or v_request.status not in ('aceito','em_andamento')
    or not exists(select 1 from public.service_quote_decisions d
      where d.quote_id=v_quote.id and d.request_id=v_request.id and d.decision='aceita') then
  raise exception 'Quote is not accepted for this service' using errcode='42501';
 end if;
 select id into v_contract_id from public.service_contracts where quote_id=p_quote_id;
 if found then return v_contract_id; end if;
 v_stages=jsonb_build_array(jsonb_build_object('sequence',1,'title','Execução do escopo aprovado','amount_cents',v_quote.amount_cents));
 v_fingerprint=md5(concat_ws('|','1',v_request.id,v_quote.id,v_request.client_id,v_quote.provider_id,
   v_request.profession,v_quote.description,v_quote.amount_cents,coalesce(v_request.scheduled_for::text,''),v_stages::text,v_terms));
 begin
  insert into public.service_contracts(request_id,quote_id,client_id,provider_id,profession,
    scope_and_deadline,amount_cents,scheduled_for,stages,terms_text,content_fingerprint)
  values(v_request.id,v_quote.id,v_request.client_id,v_quote.provider_id,v_request.profession,
    v_quote.description,v_quote.amount_cents,v_request.scheduled_for,v_stages,v_terms,v_fingerprint)
  returning id into v_contract_id;
 exception when unique_violation then
  select id into v_contract_id from public.service_contracts where quote_id=p_quote_id;
 end;
 return v_contract_id;
end $$;

revoke all on function public.create_contract_from_accepted_quote(uuid) from public,anon;
grant execute on function public.create_contract_from_accepted_quote(uuid) to authenticated;
