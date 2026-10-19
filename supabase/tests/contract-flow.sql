begin;
insert into auth.users(id,raw_user_meta_data,email_confirmed_at) values
 ('30000000-0000-4000-8000-000000000001','{"full_name":"TEST CONTRACT CLIENT"}',now()),
 ('30000000-0000-4000-8000-000000000002','{"full_name":"TEST CONTRACT PROVIDER"}',now()),
 ('30000000-0000-4000-8000-000000000003','{"full_name":"TEST CONTRACT OUTSIDER"}',now());
update public.profiles set role='prestador' where id='30000000-0000-4000-8000-000000000002';
insert into public.service_requests(id,client_id,provider_id,profession,description,status,scheduled_for) values
 ('31000000-0000-4000-8000-000000000001','30000000-0000-4000-8000-000000000001','30000000-0000-4000-8000-000000000002','TEST Pintor','TEST Contrato','aceito','2026-11-01T12:00:00Z');
set local role authenticated;
select set_config('request.jwt.claim.sub','30000000-0000-4000-8000-000000000002',true);
insert into public.service_quotes(request_id,provider_id,amount_cents,description)
 values('31000000-0000-4000-8000-000000000001',auth.uid(),45000,'TEST Pintura completa em três dias');
select set_config('test.contract_quote',(select id::text from public.service_quotes where description='TEST Pintura completa em três dias'),true);
select set_config('request.jwt.claim.sub','30000000-0000-4000-8000-000000000001',true);
insert into public.service_quote_decisions(quote_id,request_id,decided_by,decision)
 values(current_setting('test.contract_quote')::uuid,'31000000-0000-4000-8000-000000000001',auth.uid(),'aceita');
select set_config('test.contract_id',public.create_contract_from_accepted_quote(current_setting('test.contract_quote')::uuid)::text,true);
do $$begin
 if public.create_contract_from_accepted_quote(current_setting('test.contract_quote')::uuid)::text<>current_setting('test.contract_id') then raise exception 'Duplicate contract created'; end if;
 if (select amount_cents from public.service_contracts where id=current_setting('test.contract_id')::uuid)<>45000 then raise exception 'Contract amount differs from quote'; end if;
 if (select stages->0->>'amount_cents' from public.service_contracts where id=current_setting('test.contract_id')::uuid)<>'45000' then raise exception 'Contract stage not snapshotted'; end if;
 begin update public.service_contracts set amount_cents=1 where id=current_setting('test.contract_id')::uuid; raise exception 'Contract edited'; exception when insufficient_privilege then null; end;
end $$;
insert into public.service_contract_acceptances(contract_id,signed_by,party_role,accepted_fingerprint)
select id,auth.uid(),'cliente',content_fingerprint from public.service_contracts where id=current_setting('test.contract_id')::uuid;
do $$begin
 begin insert into public.service_contract_acceptances(contract_id,signed_by,party_role,accepted_fingerprint) select id,auth.uid(),'prestador',content_fingerprint from public.service_contracts where id=current_setting('test.contract_id')::uuid; raise exception 'Client spoofed provider role'; exception when insufficient_privilege then null; end;
 begin insert into public.service_contract_acceptances(contract_id,signed_by,party_role,accepted_fingerprint) select id,auth.uid(),'cliente','tampered' from public.service_contracts where id=current_setting('test.contract_id')::uuid; raise exception 'Acceptance of changed fingerprint'; exception when insufficient_privilege then null; end;
end $$;
select set_config('request.jwt.claim.sub','30000000-0000-4000-8000-000000000002',true);
insert into public.service_contract_acceptances(contract_id,signed_by,party_role,accepted_fingerprint)
select id,auth.uid(),'prestador',content_fingerprint from public.service_contracts where id=current_setting('test.contract_id')::uuid;
do $$begin
 if (select count(*) from public.service_contract_acceptances where contract_id=current_setting('test.contract_id')::uuid)<>2 then raise exception 'Both acceptances not recorded'; end if;
 begin delete from public.service_contract_acceptances where contract_id=current_setting('test.contract_id')::uuid; raise exception 'Acceptance deleted'; exception when insufficient_privilege then null; end;
end $$;
select set_config('request.jwt.claim.sub','30000000-0000-4000-8000-000000000003',true);
do $$begin
 if exists(select 1 from public.service_contracts) or exists(select 1 from public.service_contract_acceptances) then raise exception 'Outsider read contract'; end if;
 begin perform public.create_contract_from_accepted_quote(current_setting('test.contract_quote')::uuid); raise exception 'Outsider created contract'; exception when insufficient_privilege then null; end;
end $$;
reset role;
rollback;
select 'contract-flow: passed' as result;
