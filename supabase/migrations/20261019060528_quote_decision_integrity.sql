-- A decision must belong to the quote's actual request, never a caller-chosen unrelated request.
alter policy client_only_quote_decision on public.service_quote_decisions
to authenticated with check (
 decided_by=(select auth.uid())
 and exists (
  select 1 from public.service_quotes q
  join public.service_requests r on r.id=q.request_id
  where q.id=service_quote_decisions.quote_id
   and q.request_id=service_quote_decisions.request_id
   and r.client_id=(select auth.uid()) and r.provider_id=q.provider_id
   and r.status in ('aceito','em_andamento') and q.status='proposta'
 )
);

-- An accepted quote ends this negotiation. Subsequent work changes require a separate extras flow.
alter policy quotes_provider_submit on public.service_quotes
to authenticated with check (
 provider_id=(select auth.uid()) and status='proposta'
 and amount_cents between 1 and 9007199254740991
 and exists(select 1 from public.profiles p where p.id=(select auth.uid()) and p.role='prestador')
 and exists(select 1 from public.service_requests r where r.id=service_quotes.request_id
   and r.provider_id=(select auth.uid()) and r.status in ('aceito','em_andamento'))
 and not exists(select 1 from public.service_quote_decisions d
   where d.request_id=service_quotes.request_id and d.decision='aceita')
);

-- Keep quote contents and decisions immutable for API users; server sets IDs/timestamps/status.
revoke insert,update,delete on public.service_quotes from anon,authenticated;
revoke insert(id,status,created_at),update(id,request_id,provider_id,amount_cents,description,status,created_at)
on public.service_quotes from anon,authenticated;
grant insert(request_id,provider_id,amount_cents,description) on public.service_quotes to authenticated;
revoke insert,update,delete on public.service_quote_decisions from anon,authenticated;
revoke insert(id,created_at),update(id,quote_id,request_id,decided_by,decision,created_at)
on public.service_quote_decisions from anon,authenticated;
grant insert(quote_id,request_id,decided_by,decision) on public.service_quote_decisions to authenticated;
