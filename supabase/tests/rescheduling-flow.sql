begin;
insert into auth.users(id,raw_user_meta_data,email_confirmed_at) values
 ('a0000000-0000-4000-8000-000000000001','{"full_name":"TEST RESCHEDULE CLIENT"}',now()),
 ('a0000000-0000-4000-8000-000000000002','{"full_name":"TEST RESCHEDULE PROVIDER"}',now()),
 ('a0000000-0000-4000-8000-000000000003','{"full_name":"TEST RESCHEDULE OUTSIDER"}',now());
update public.profiles set role='prestador' where id='a0000000-0000-4000-8000-000000000002';
insert into public.service_requests(id,client_id,provider_id,profession,description,status,scheduled_for) values
 ('a1000000-0000-4000-8000-000000000001','a0000000-0000-4000-8000-000000000001','a0000000-0000-4000-8000-000000000002','Pintor','TEST pedido para reagendamento','aceito',now()+interval '1 day'),
 ('a1000000-0000-4000-8000-000000000002','a0000000-0000-4000-8000-000000000001','a0000000-0000-4000-8000-000000000002','Eletricista','TEST pedido em deslocamento','aceito',now()+interval '1 day');
insert into public.service_execution_events(request_id,actor_id,event_type) values('a1000000-0000-4000-8000-000000000002','a0000000-0000-4000-8000-000000000002','a_caminho');

set local role authenticated;
select set_config('request.jwt.claim.sub','a0000000-0000-4000-8000-000000000002',true);
select set_config('test.reschedule_time',(now()+interval '2 days')::text,true);
select set_config('test.reschedule',public.propose_service_reschedule('a1000000-0000-4000-8000-000000000001',current_setting('test.reschedule_time')::timestamptz,'TEST Ajustar a data por indisponibilidade no horário inicial.')::text,true);
select public.propose_service_reschedule('a1000000-0000-4000-8000-000000000001',current_setting('test.reschedule_time')::timestamptz,'TEST Ajustar a data por indisponibilidade no horário inicial.');
do $$begin
 if (select count(*) from public.service_schedule_changes)<>1 then raise exception 'Reschedule duplicated';end if;
 begin perform public.propose_service_reschedule('a1000000-0000-4000-8000-000000000001',now()+interval '3 days','TEST Tentativa de alterar proposta pendente.');raise exception 'Pending reschedule changed';exception when sqlstate 'RA003' then null;end;
 begin perform public.propose_service_reschedule('a1000000-0000-4000-8000-000000000001',now()-interval '1 day','TEST Data inválida no passado.');raise exception 'Past reschedule allowed';exception when sqlstate 'RA001' then null;end;
 begin perform public.decide_service_reschedule(current_setting('test.reschedule')::uuid,'aceito');raise exception 'Provider decided reschedule';exception when insufficient_privilege then null;end;
 begin perform public.mark_provider_arrival('a1000000-0000-4000-8000-000000000001','a_caminho');raise exception 'Journey started with pending reschedule';exception when sqlstate 'RA004' then null;end;
 begin insert into public.service_schedule_changes(request_id,provider_id,proposed_by,proposed_for,reason) values('a1000000-0000-4000-8000-000000000002',auth.uid(),auth.uid(),now()+interval '2 days','TEST Escrita direta indevida.');raise exception 'Direct reschedule insert allowed';exception when insufficient_privilege then null;end;
end $$;

select set_config('request.jwt.claim.sub','a0000000-0000-4000-8000-000000000001',true);
select public.decide_service_reschedule(current_setting('test.reschedule')::uuid,'aceito');
select public.decide_service_reschedule(current_setting('test.reschedule')::uuid,'aceito');
do $$begin
 if (select scheduled_for from public.service_requests where id='a1000000-0000-4000-8000-000000000001')<>current_setting('test.reschedule_time')::timestamptz then raise exception 'Accepted date not applied';end if;
 begin perform public.decide_service_reschedule(current_setting('test.reschedule')::uuid,'recusado');raise exception 'Reschedule decision changed';exception when sqlstate 'RA003' then null;end;
 begin update public.service_schedule_changes set status='recusado';raise exception 'Direct reschedule update allowed';exception when insufficient_privilege then null;end;
end $$;
select set_config('test.client_reschedule_time',(now()+interval '4 days')::text,true);
select set_config('test.client_reschedule',public.propose_service_reschedule('a1000000-0000-4000-8000-000000000001',current_setting('test.client_reschedule_time')::timestamptz,'TEST Cliente precisa ajustar a data para receber o prestador.')::text,true);
select public.propose_service_reschedule('a1000000-0000-4000-8000-000000000001',current_setting('test.client_reschedule_time')::timestamptz,'TEST Cliente precisa ajustar a data para receber o prestador.');
do $$begin
 if not exists(select 1 from public.service_schedule_changes where id=current_setting('test.client_reschedule')::uuid and proposed_by=auth.uid() and provider_id='a0000000-0000-4000-8000-000000000002') then raise exception 'Client proposal attribution missing';end if;
 begin perform public.decide_service_reschedule(current_setting('test.client_reschedule')::uuid,'aceito');raise exception 'Client decided own reschedule';exception when insufficient_privilege then null;end;
end $$;

select set_config('request.jwt.claim.sub','a0000000-0000-4000-8000-000000000002',true);
select public.decide_service_reschedule(current_setting('test.client_reschedule')::uuid,'aceito');
select public.decide_service_reschedule(current_setting('test.client_reschedule')::uuid,'aceito');
do $$begin
 if (select scheduled_for from public.service_requests where id='a1000000-0000-4000-8000-000000000001')<>current_setting('test.client_reschedule_time')::timestamptz then raise exception 'Provider acceptance did not apply client date';end if;
 if (select count(*) from public.service_schedule_changes where request_id='a1000000-0000-4000-8000-000000000001')<>2 then raise exception 'Bilateral history incomplete';end if;
 begin perform public.propose_service_reschedule('a1000000-0000-4000-8000-000000000002',now()+interval '3 days','TEST Proposta depois do início do deslocamento.');raise exception 'Reschedule after journey allowed';exception when sqlstate 'RA002' then null;end;
end $$;

select set_config('request.jwt.claim.sub','a0000000-0000-4000-8000-000000000001',true);
select set_config('test.withdraw_reschedule',public.propose_service_reschedule('a1000000-0000-4000-8000-000000000001',now()+interval '5 days','TEST Proposta que o próprio cliente precisa retirar.')::text,true);
select set_config('request.jwt.claim.sub','a0000000-0000-4000-8000-000000000002',true);
do $$begin
 begin perform public.cancel_service_reschedule(current_setting('test.withdraw_reschedule')::uuid);raise exception 'Other participant cancelled proposal';exception when insufficient_privilege then null;end;
end $$;
select set_config('request.jwt.claim.sub','a0000000-0000-4000-8000-000000000001',true);
select public.cancel_service_reschedule(current_setting('test.withdraw_reschedule')::uuid);
select public.cancel_service_reschedule(current_setting('test.withdraw_reschedule')::uuid);
do $$begin
 if not exists(select 1 from public.service_schedule_changes where id=current_setting('test.withdraw_reschedule')::uuid and status='cancelado' and decided_by=auth.uid() and decided_at is not null) then raise exception 'Withdrawal audit missing';end if;
 if exists(select 1 from public.service_schedule_changes where request_id='a1000000-0000-4000-8000-000000000001' and status='pendente') then raise exception 'Withdrawal kept request blocked';end if;
 if (select scheduled_for from public.service_requests where id='a1000000-0000-4000-8000-000000000001')<>current_setting('test.client_reschedule_time')::timestamptz then raise exception 'Withdrawal changed accepted schedule';end if;
end $$;
select set_config('request.jwt.claim.sub','a0000000-0000-4000-8000-000000000002',true);
do $$begin
 begin perform public.decide_service_reschedule(current_setting('test.withdraw_reschedule')::uuid,'aceito');raise exception 'Cancelled proposal decided';exception when sqlstate 'RA003' then null;end;
end $$;

select set_config('request.jwt.claim.sub','a0000000-0000-4000-8000-000000000003',true);
do $$begin
 if exists(select 1 from public.service_schedule_changes) then raise exception 'Outsider read reschedules';end if;
 begin perform public.decide_service_reschedule(current_setting('test.reschedule')::uuid,'recusado');raise exception 'Outsider decided reschedule';exception when insufficient_privilege then null;end;
 begin perform public.cancel_service_reschedule(current_setting('test.withdraw_reschedule')::uuid);raise exception 'Outsider cancelled reschedule';exception when insufficient_privilege then null;end;
end $$;
reset role;
rollback;
select 'rescheduling-flow: passed' as result;
