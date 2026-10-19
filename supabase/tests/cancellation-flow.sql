begin;
insert into auth.users(id,raw_user_meta_data,email_confirmed_at) values
 ('50000000-0000-4000-8000-000000000001','{"full_name":"TEST CANCELLATION CLIENT"}',now()),
 ('50000000-0000-4000-8000-000000000002','{"full_name":"TEST CANCELLING PROVIDER"}',now()),
 ('50000000-0000-4000-8000-000000000003','{"full_name":"TEST REPLACEMENT PROVIDER"}',now()),
 ('50000000-0000-4000-8000-000000000004','{"full_name":"TEST CANCELLATION OUTSIDER"}',now());
update public.profiles set role='prestador',is_available=true
where id in ('50000000-0000-4000-8000-000000000002','50000000-0000-4000-8000-000000000003');
insert into public.professions(id,name) overriding system value values(-992,'TEST Cancelamento');
update public.profession_compliance_rules set classification='portfolio',reviewed_at=now() where profession_id=-992;
insert into public.provider_professions(provider_id,profession_id,verification_status) values
 ('50000000-0000-4000-8000-000000000002',-992,'verificado'),
 ('50000000-0000-4000-8000-000000000003',-992,'verificado');
insert into public.provider_service_areas(provider_id,city,state,latitude,longitude,service_radius_km) values
 ('50000000-0000-4000-8000-000000000002','Manaus','AM',-3.1,-60.0,10),
 ('50000000-0000-4000-8000-000000000003','Manaus','AM',-3.1,-60.0,10);
insert into public.service_requests(id,client_id,provider_id,profession,description,status,is_urgent,city,state,latitude,longitude,search_radius_km) values
 ('51000000-0000-4000-8000-000000000001','50000000-0000-4000-8000-000000000001','50000000-0000-4000-8000-000000000002','TEST Cancelamento','TEST Prestador precisa reencaminhar','aceito',true,'Manaus','AM',-3.1,-60.0,10),
 ('51000000-0000-4000-8000-000000000002','50000000-0000-4000-8000-000000000001',null,'TEST Cancelamento','TEST Cliente cancela pedido aberto','aberto',false,'Manaus','AM',-3.1,-60.0,10),
 ('51000000-0000-4000-8000-000000000003','50000000-0000-4000-8000-000000000001','50000000-0000-4000-8000-000000000002','TEST Cancelamento','TEST Serviço já iniciado','em_andamento',false,'Manaus','AM',-3.1,-60.0,10);

set local role authenticated;
select set_config('request.jwt.claim.sub','50000000-0000-4000-8000-000000000002',true);
select set_config('test.replacement',public.cancel_service_before_start('51000000-0000-4000-8000-000000000001','TEST indisponibilidade antes do início')::text,true);
select public.cancel_service_before_start('51000000-0000-4000-8000-000000000001','TEST repetição idempotente');
do $$begin
 if (select status from public.service_requests where id='51000000-0000-4000-8000-000000000001')<>'cancelado' then raise exception 'Original request not cancelled';end if;
 if not exists(select 1 from public.service_cancellations where request_id='51000000-0000-4000-8000-000000000001' and actor_role='prestador' and outcome='reencaminhado_prestador' and fee_status='nao_avaliada' and replacement_request_id=current_setting('test.replacement')::uuid) then raise exception 'Cancellation audit incomplete';end if;
 if exists(select 1 from public.available_requests() where request_id=current_setting('test.replacement')::uuid) then raise exception 'Cancelling provider could reclaim replacement';end if;
 begin insert into public.service_cancellations(request_id,actor_id,actor_role,reason,outcome) values('51000000-0000-4000-8000-000000000002',auth.uid(),'prestador','TEST direct insert','cancelado_cliente');raise exception 'Direct audit insert allowed';exception when insufficient_privilege then null;end;
end $$;

select set_config('request.jwt.claim.sub','50000000-0000-4000-8000-000000000003',true);
do $$begin
 if not exists(select 1 from public.available_requests() where request_id=current_setting('test.replacement')::uuid) then raise exception 'Replacement provider cannot find request';end if;
 if exists(select 1 from public.service_cancellations) then raise exception 'Unrelated provider read cancellation audit';end if;
end $$;

select set_config('request.jwt.claim.sub','50000000-0000-4000-8000-000000000001',true);
select public.cancel_service_before_start('51000000-0000-4000-8000-000000000002','TEST cliente não precisa mais do serviço');
do $$begin
 if (select count(*) from public.service_requests where replaces_request_id='51000000-0000-4000-8000-000000000001')<>1 then raise exception 'Replacement duplicated or missing';end if;
 if not exists(select 1 from public.service_requests where id=current_setting('test.replacement')::uuid and status='aberto' and provider_id is null and profession='TEST Cancelamento' and is_urgent) then raise exception 'Replacement did not preserve request';end if;
 if (select status from public.service_requests where id='51000000-0000-4000-8000-000000000002')<>'cancelado' then raise exception 'Client request not cancelled';end if;
 if not exists(select 1 from public.service_cancellations where request_id='51000000-0000-4000-8000-000000000002' and actor_role='cliente' and outcome='cancelado_cliente' and replacement_request_id is null and fee_status='nao_avaliada') then raise exception 'Client cancellation audit incomplete';end if;
 begin perform public.cancel_service_before_start('51000000-0000-4000-8000-000000000003','TEST tentativa após início');raise exception 'In-progress cancellation allowed';exception when sqlstate 'CN002' then null;end;
end $$;

select set_config('request.jwt.claim.sub','50000000-0000-4000-8000-000000000004',true);
do $$begin
 if exists(select 1 from public.service_cancellations) then raise exception 'Outsider read cancellation audit';end if;
 begin perform public.cancel_service_before_start('51000000-0000-4000-8000-000000000003','TEST tentativa de pessoa externa');raise exception 'Outsider cancelled service';exception when insufficient_privilege then null;end;
end $$;
reset role;
rollback;
select 'cancellation-flow: passed' as result;
