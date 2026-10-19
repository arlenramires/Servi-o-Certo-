begin;
insert into auth.users(id,raw_user_meta_data,email_confirmed_at) values
 ('70000000-0000-4000-8000-000000000001','{"full_name":"TEST DISPUTE CLIENT"}',now()),
 ('70000000-0000-4000-8000-000000000002','{"full_name":"TEST DISPUTE PROVIDER"}',now()),
 ('70000000-0000-4000-8000-000000000003','{"full_name":"TEST DISPUTE OUTSIDER"}',now());
update public.profiles set role='prestador' where id='70000000-0000-4000-8000-000000000002';
insert into public.service_requests(id,client_id,provider_id,profession,description,status) values
 ('71000000-0000-4000-8000-000000000001','70000000-0000-4000-8000-000000000001','70000000-0000-4000-8000-000000000002','Pintor','TEST serviço em disputa','em_andamento'),
 ('71000000-0000-4000-8000-000000000002','70000000-0000-4000-8000-000000000001','70000000-0000-4000-8000-000000000002','Pintor','TEST serviço antes da execução','aceito');

set local role authenticated;
select set_config('request.jwt.claim.sub','70000000-0000-4000-8000-000000000001',true);
select set_config('test.dispute',public.open_service_dispute('71000000-0000-4000-8000-000000000001','qualidade','TEST acabamento ficou diferente do escopo combinado')::text,true);
select public.open_service_dispute('71000000-0000-4000-8000-000000000001','qualidade','TEST acabamento ficou diferente do escopo combinado');
do $$begin
 if not exists(select 1 from public.service_disputes where id=current_setting('test.dispute')::uuid and status='aberta' and opened_by=auth.uid()) then raise exception 'Dispute snapshot missing';end if;
 begin perform public.open_service_dispute('71000000-0000-4000-8000-000000000001','prazo','TEST tentativa de trocar o registro original');raise exception 'Dispute changed';exception when sqlstate 'DP003' then null;end;
 begin perform public.open_service_dispute('71000000-0000-4000-8000-000000000002','prazo','TEST serviço ainda não iniciou e não aceita disputa');raise exception 'Pre-start dispute allowed';exception when sqlstate 'DP002' then null;end;
 begin perform public.respond_service_dispute(current_setting('test.dispute')::uuid,'TEST autor tentou responder a própria contestação');raise exception 'Author answered own dispute';exception when insufficient_privilege then null;end;
 begin insert into public.service_disputes(request_id,opened_by,category,description) values('71000000-0000-4000-8000-000000000002',auth.uid(),'outro','TEST escrita direta não deve ser permitida');raise exception 'Direct dispute insert allowed';exception when insufficient_privilege then null;end;
end $$;

select set_config('request.jwt.claim.sub','70000000-0000-4000-8000-000000000002',true);
select public.respond_service_dispute(current_setting('test.dispute')::uuid,'TEST o prestador registra sua manifestação sem editar o relato');
select public.respond_service_dispute(current_setting('test.dispute')::uuid,'TEST o prestador registra sua manifestação sem editar o relato');
do $$begin
 if not exists(select 1 from public.service_disputes where id=current_setting('test.dispute')::uuid and status='respondida' and response_by=auth.uid() and responded_at is not null) then raise exception 'Response missing';end if;
 begin perform public.respond_service_dispute(current_setting('test.dispute')::uuid,'TEST tentativa de substituir uma resposta que já foi registrada');raise exception 'Response changed';exception when sqlstate 'DP003' then null;end;
 begin update public.service_disputes set description='TEST alteração direta';raise exception 'Direct dispute update allowed';exception when insufficient_privilege then null;end;
end $$;

select set_config('request.jwt.claim.sub','70000000-0000-4000-8000-000000000003',true);
do $$begin
 if exists(select 1 from public.service_disputes) then raise exception 'Outsider read disputes';end if;
 begin perform public.respond_service_dispute(current_setting('test.dispute')::uuid,'TEST terceiro tentou responder uma contestação privada');raise exception 'Outsider answered dispute';exception when insufficient_privilege then null;end;
end $$;
reset role;
rollback;
select 'dispute-flow: passed' as result;
