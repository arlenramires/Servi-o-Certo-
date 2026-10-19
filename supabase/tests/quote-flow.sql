begin;
insert into auth.users(id,raw_user_meta_data,email_confirmed_at) values
 ('20000000-0000-4000-8000-000000000001','{"full_name":"TEST QUOTE CLIENT"}',now()),
 ('20000000-0000-4000-8000-000000000002','{"full_name":"TEST OTHER CLIENT"}',now()),
 ('20000000-0000-4000-8000-000000000003','{"full_name":"TEST QUOTE PROVIDER"}',now()),
 ('20000000-0000-4000-8000-000000000004','{"full_name":"TEST OTHER PROVIDER"}',now());
update public.profiles set role='prestador' where id in ('20000000-0000-4000-8000-000000000003','20000000-0000-4000-8000-000000000004');
insert into public.service_requests(id,client_id,provider_id,profession,description,status) values
 ('21000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000003','TEST Profissão','TEST Orçamento do primeiro cliente','aceito'),
 ('21000000-0000-4000-8000-000000000002','20000000-0000-4000-8000-000000000002','20000000-0000-4000-8000-000000000004','TEST Profissão','TEST Orçamento de outro cliente','aceito');
set local role authenticated;
select set_config('request.jwt.claim.sub','20000000-0000-4000-8000-000000000003',true);
insert into public.service_quotes(request_id,provider_id,amount_cents,description)
values('21000000-0000-4000-8000-000000000001',auth.uid(),29,'TEST Primeira proposta com escopo e prazo');
select set_config('test.quote1',(select id::text from public.service_quotes where description='TEST Primeira proposta com escopo e prazo'),true);
insert into public.service_quotes(request_id,provider_id,amount_cents,description)
values('21000000-0000-4000-8000-000000000001',auth.uid(),30000,'TEST Segunda proposta negociada');
select set_config('test.quote2',(select id::text from public.service_quotes where description='TEST Segunda proposta negociada'),true);
insert into public.service_quotes(request_id,provider_id,amount_cents,description)
values('21000000-0000-4000-8000-000000000001',auth.uid(),35000,'TEST Terceira proposta ainda sem decisão');
select set_config('test.quote3',(select id::text from public.service_quotes where description='TEST Terceira proposta ainda sem decisão'),true);
do $$begin
 begin insert into public.service_quote_decisions(quote_id,request_id,decided_by,decision) values(current_setting('test.quote1')::uuid,'21000000-0000-4000-8000-000000000001',auth.uid(),'aceita'); raise exception 'Provider approved own quote'; exception when insufficient_privilege then null; end;
 begin insert into public.service_quotes(request_id,provider_id,amount_cents,description,status) values('21000000-0000-4000-8000-000000000001',auth.uid(),100,'TEST Status spoof','aceita'); raise exception 'Provider set accepted status'; exception when insufficient_privilege then null; end;
 begin insert into public.service_quotes(request_id,provider_id,amount_cents,description) values('21000000-0000-4000-8000-000000000001',auth.uid(),0,'TEST Zero value'); raise exception 'Zero quote accepted'; exception when insufficient_privilege then null; end;
 begin update public.service_quotes set amount_cents=999 where id=current_setting('test.quote1')::uuid; raise exception 'Quote edited after submission'; exception when insufficient_privilege then null; end;
end $$;
select set_config('request.jwt.claim.sub','20000000-0000-4000-8000-000000000004',true);
do $$begin
 if exists(select 1 from public.service_quotes) then raise exception 'Other provider read quotes'; end if;
 begin insert into public.service_quotes(request_id,provider_id,amount_cents,description) values('21000000-0000-4000-8000-000000000001',auth.uid(),100,'TEST Foreign request'); raise exception 'Other provider submitted quote'; exception when insufficient_privilege then null; end;
end $$;
select set_config('request.jwt.claim.sub','20000000-0000-4000-8000-000000000001',true);
do $$begin
 if (select count(*) from public.service_quotes)<>3 then raise exception 'Client cannot see negotiated quotes'; end if;
 begin insert into public.service_quote_decisions(quote_id,request_id,decided_by,decision) values(current_setting('test.quote1')::uuid,'21000000-0000-4000-8000-000000000002',auth.uid(),'recusada'); raise exception 'Quote decision bound to foreign request'; exception when insufficient_privilege then null; end;
 begin insert into public.service_quote_decisions(quote_id,request_id,decided_by,decision) values(current_setting('test.quote1')::uuid,'21000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000002','recusada'); raise exception 'Decision author spoofed'; exception when insufficient_privilege then null; end;
end $$;
insert into public.service_quote_decisions(quote_id,request_id,decided_by,decision)
values(current_setting('test.quote1')::uuid,'21000000-0000-4000-8000-000000000001',auth.uid(),'recusada');
insert into public.service_quote_decisions(quote_id,request_id,decided_by,decision)
values(current_setting('test.quote2')::uuid,'21000000-0000-4000-8000-000000000001',auth.uid(),'aceita');
do $$begin
 begin insert into public.service_quote_decisions(quote_id,request_id,decided_by,decision) values(current_setting('test.quote3')::uuid,'21000000-0000-4000-8000-000000000001',auth.uid(),'aceita'); raise exception 'Two different quotes accepted'; exception when unique_violation then null; end;
 begin insert into public.service_quote_decisions(quote_id,request_id,decided_by,decision) values(current_setting('test.quote1')::uuid,'21000000-0000-4000-8000-000000000001',auth.uid(),'aceita'); raise exception 'Repeated decision allowed'; exception when unique_violation then null; end;
 begin update public.service_quote_decisions set decision='recusada' where quote_id=current_setting('test.quote2')::uuid; raise exception 'Decision edited'; exception when insufficient_privilege then null; end;
 if (select amount_cents from public.service_quotes where id=current_setting('test.quote1')::uuid)<>29 then raise exception 'Cents changed'; end if;
 if (select count(*) from public.service_quote_decisions)<>2 then raise exception 'Decision history missing'; end if;
end $$;
select set_config('request.jwt.claim.sub','20000000-0000-4000-8000-000000000003',true);
do $$begin
 if (select count(*) from public.service_quote_decisions)<>2 then raise exception 'Provider cannot see client decision'; end if;
 begin insert into public.service_quotes(request_id,provider_id,amount_cents,description) values('21000000-0000-4000-8000-000000000001',auth.uid(),100,'TEST After acceptance'); raise exception 'New quote after acceptance'; exception when insufficient_privilege then null; end;
end $$;
select set_config('request.jwt.claim.sub','20000000-0000-4000-8000-000000000002',true);
do $$begin
 if exists(select 1 from public.service_quotes) or exists(select 1 from public.service_quote_decisions) then raise exception 'Other client read negotiation'; end if;
end $$;
reset role;
rollback;
select 'quote-flow: passed' as result;
