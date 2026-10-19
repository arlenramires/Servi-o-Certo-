begin;
insert into auth.users(id,raw_user_meta_data,email_confirmed_at) values
 ('30000000-0000-4000-8000-000000000001','{"full_name":"TEST CONTRACT CLIENT"}',now()),
 ('30000000-0000-4000-8000-000000000002','{"full_name":"TEST CONTRACT PROVIDER"}',now()),
 ('30000000-0000-4000-8000-000000000003','{"full_name":"TEST CONTRACT OUTSIDER"}',now());
update public.profiles set role='prestador' where id='30000000-0000-4000-8000-000000000002';
insert into public.service_requests(id,client_id,provider_id,profession,description,status) values
 ('31000000-0000-4000-8000-000000000001','30000000-0000-4000-8000-000000000001','30000000-0000-4000-8000-000000000002','Pintor','TEST Agreement request','aceito'),
 ('31000000-0000-4000-8000-000000000002','30000000-0000-4000-8000-000000000001','30000000-0000-4000-8000-000000000002','Pintor','TEST Request without accepted quote','aceito');
set local role authenticated;
select set_config('request.jwt.claim.sub','30000000-0000-4000-8000-000000000002',true);
insert into public.service_quotes(request_id,provider_id,amount_cents,description)
values('31000000-0000-4000-8000-000000000001',auth.uid(),5000,'TEST Pintar sala em dois dias, materiais inclusos');
select set_config('test.contract_quote',(select id::text from public.service_quotes where request_id='31000000-0000-4000-8000-000000000001'),true);
select set_config('request.jwt.claim.sub','30000000-0000-4000-8000-000000000001',true);
insert into public.service_quote_decisions(quote_id,request_id,decided_by,decision)
values(current_setting('test.contract_quote')::uuid,'31000000-0000-4000-8000-000000000001',auth.uid(),'aceita');
do $$begin
 begin perform public.propose_service_contract('31000000-0000-4000-8000-000000000001',now()+interval '1 day',now()+interval '2 days','TEST Responsabilidades acordadas entre as partes','[{"title":"Entrega","amount_cents":5000,"due_description":"Ao concluir"}]'); raise exception 'Client proposed contract as provider'; exception when insufficient_privilege then null; end;
end $$;
select set_config('request.jwt.claim.sub','30000000-0000-4000-8000-000000000002',true);
do $$begin
 begin perform public.propose_service_contract('31000000-0000-4000-8000-000000000002',now()+interval '1 day',now()+interval '2 days','TEST Responsabilidades acordadas entre as partes','[{"title":"Entrega","amount_cents":5000,"due_description":"Ao concluir"}]'); raise exception 'Contract without accepted quote'; exception when sqlstate 'SC001' then null; end;
 begin perform public.propose_service_contract('31000000-0000-4000-8000-000000000001',now()+interval '1 day',now()+interval '2 days','TEST Responsabilidades acordadas entre as partes','[{"title":"Entrega","amount_cents":4999,"due_description":"Ao concluir"}]'); raise exception 'Stage total mismatch allowed'; exception when sqlstate 'SC005' then null; end;
 begin perform public.propose_service_contract('31000000-0000-4000-8000-000000000001',now()+interval '2 days',now()+interval '1 day','TEST Responsabilidades acordadas entre as partes','[{"title":"Entrega","amount_cents":5000,"due_description":"Ao concluir"}]'); raise exception 'Reversed dates allowed'; exception when sqlstate 'SC005' then null; end;
 begin perform public.propose_service_contract('31000000-0000-4000-8000-000000000001',now()+interval '1 day',now()+interval '2 days','TEST Responsabilidades acordadas entre as partes','[{"title":"Entrega","amount_cents":0.5,"due_description":"Ao concluir"}]'); raise exception 'Fractional cents allowed'; exception when sqlstate 'SC005' then null; end;
end $$;
select set_config('test.contract1',public.propose_service_contract('31000000-0000-4000-8000-000000000001',now()+interval '1 day',now()+interval '2 days','TEST Cliente garante acesso; prestador fornece materiais e executa o escopo aprovado.',
 '[{"title":"Entrada","amount_cents":2500,"due_description":"No início"},{"title":"Entrega","amount_cents":2500,"due_description":"Após conclusão"}]')::text,true);
select set_config('test.hash1',(select content_hash from public.service_contracts where id=current_setting('test.contract1')::uuid),true);
do $$declare c public.service_contracts%rowtype;begin
 select * into c from public.service_contracts where id=current_setting('test.contract1')::uuid;
 if (c.document->>'amount_cents')::bigint<>5000 or c.document->>'scope'<>'TEST Pintar sala em dois dias, materiais inclusos' or c.quote_id<>current_setting('test.contract_quote')::uuid then raise exception 'Snapshot differs from accepted quote'; end if;
 if c.content_hash<>encode(sha256(convert_to(c.document::text,'UTF8')),'hex') then raise exception 'Hash does not match snapshot'; end if;
 begin update public.service_contracts set document='{}' where id=c.id; raise exception 'Contract was editable'; exception when insufficient_privilege then null; end;
 begin insert into public.service_contract_decisions(contract_id,actor_id,decision,content_hash) values(c.id,c.client_id,'aceito',c.content_hash); raise exception 'Direct forged acceptance allowed'; exception when insufficient_privilege then null; end;
 begin perform public.decide_service_contract(c.id,repeat('0',64),'aceito'); raise exception 'Tampered hash accepted'; exception when sqlstate 'SC004' then null; end;
 if not public.decide_service_contract(c.id,c.content_hash,'aceito') then raise exception 'Provider acceptance failed'; end if;
 if not public.decide_service_contract(c.id,c.content_hash,'aceito') then raise exception 'Idempotent acceptance failed'; end if;
 if (select count(*) from public.service_contract_decisions where contract_id=c.id)<>1 then raise exception 'Repeated acceptance duplicated'; end if;
 begin perform public.propose_service_contract(c.request_id,now()+interval '1 day',now()+interval '2 days','TEST Responsabilidades acordadas entre as partes','[{"title":"Entrega","amount_cents":5000,"due_description":"Ao concluir"}]'); raise exception 'Unsigned contract silently replaced'; exception when sqlstate 'SC002' then null; end;
end $$;
select set_config('request.jwt.claim.sub','30000000-0000-4000-8000-000000000003',true);
do $$begin
 if exists(select 1 from public.service_contracts) or exists(select 1 from public.service_contract_decisions) then raise exception 'Outsider read contract'; end if;
 begin perform public.decide_service_contract(current_setting('test.contract1')::uuid,current_setting('test.hash1'),'aceito'); raise exception 'Outsider signed contract'; exception when insufficient_privilege then null; end;
end $$;
select set_config('request.jwt.claim.sub','30000000-0000-4000-8000-000000000001',true);
select public.decide_service_contract(current_setting('test.contract1')::uuid,current_setting('test.hash1'),'recusado');
do $$begin
 begin perform public.decide_service_contract(current_setting('test.contract1')::uuid,current_setting('test.hash1'),'aceito'); raise exception 'Refusal rewritten'; exception when sqlstate 'SC006' then null; end;
end $$;
select set_config('request.jwt.claim.sub','30000000-0000-4000-8000-000000000002',true);
select set_config('test.contract2',public.propose_service_contract('31000000-0000-4000-8000-000000000001',now()+interval '2 days',now()+interval '3 days','TEST Nova versão com prazo revisto e responsabilidades acordadas.',
 '[{"title":"Entrega completa","amount_cents":5000,"due_description":"Após conclusão"}]')::text,true);
select set_config('test.hash2',(select content_hash from public.service_contracts where id=current_setting('test.contract2')::uuid),true);
do $$begin
 if (select count(*) from public.service_contracts)<>2 then raise exception 'Version history missing'; end if;
 if (select version from public.service_contracts where id=current_setting('test.contract2')::uuid)<>2 then raise exception 'Version not incremented'; end if;
 if current_setting('test.hash1')=current_setting('test.hash2') then raise exception 'Version hash unchanged'; end if;
 if exists(select 1 from public.service_contract_decisions where contract_id=current_setting('test.contract2')::uuid) then raise exception 'Old signature carried forward'; end if;
 begin perform public.decide_service_contract(current_setting('test.contract1')::uuid,current_setting('test.hash1'),'aceito'); raise exception 'Old version signed'; exception when sqlstate 'SC003' then null; end;
end $$;
select public.decide_service_contract(current_setting('test.contract2')::uuid,current_setting('test.hash2'),'aceito');
select set_config('request.jwt.claim.sub','30000000-0000-4000-8000-000000000001',true);
select public.decide_service_contract(current_setting('test.contract2')::uuid,current_setting('test.hash2'),'aceito');
select public.decide_service_contract(current_setting('test.contract2')::uuid,current_setting('test.hash2'),'aceito');
do $$begin
 if (select count(*) from public.service_contract_decisions where contract_id=current_setting('test.contract2')::uuid and decision='aceito')<>2 then raise exception 'Bilateral acceptance not preserved'; end if;
 begin update public.service_contract_decisions set decision='recusado' where contract_id=current_setting('test.contract2')::uuid; raise exception 'Acceptance editable'; exception when insufficient_privilege then null; end;
 if (select status from public.service_requests where id='31000000-0000-4000-8000-000000000001')<>'aceito' then raise exception 'Contract started work or payment prematurely'; end if;
end $$;
reset role;
set local role anon;
do $$begin
 begin perform public.decide_service_contract(current_setting('test.contract2')::uuid,current_setting('test.hash2'),'aceito'); raise exception 'Anonymous signature allowed'; exception when insufficient_privilege then null; end;
end $$;
reset role;
rollback;
select 'contract-flow: passed' as result;
