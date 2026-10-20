begin;
insert into auth.users(id,raw_user_meta_data,email_confirmed_at) values
 ('40000000-0000-4000-8000-000000000001','{"full_name":"TEST EXECUTION CLIENT"}',now()),
 ('40000000-0000-4000-8000-000000000002','{"full_name":"TEST EXECUTION PROVIDER"}',now()),
 ('40000000-0000-4000-8000-000000000003','{"full_name":"TEST EXECUTION OUTSIDER"}',now());
update public.profiles set role='prestador' where id='40000000-0000-4000-8000-000000000002';
insert into public.service_requests(id,client_id,provider_id,profession,description,status) values
 ('41000000-0000-4000-8000-000000000001','40000000-0000-4000-8000-000000000001','40000000-0000-4000-8000-000000000002','Pintor','TEST Execution request','aceito');
set local role authenticated;
select set_config('request.jwt.claim.sub','40000000-0000-4000-8000-000000000002',true);
insert into public.service_quotes(request_id,provider_id,amount_cents,description)
values('41000000-0000-4000-8000-000000000001',auth.uid(),10000,'TEST Pintura completa');
select set_config('test.execution_quote',(select id::text from public.service_quotes where request_id='41000000-0000-4000-8000-000000000001'),true);
select set_config('request.jwt.claim.sub','40000000-0000-4000-8000-000000000001',true);
insert into public.service_quote_decisions(quote_id,request_id,decided_by,decision)
values(current_setting('test.execution_quote')::uuid,'41000000-0000-4000-8000-000000000001',auth.uid(),'aceita');
select set_config('request.jwt.claim.sub','40000000-0000-4000-8000-000000000002',true);
select set_config('test.execution_contract',public.propose_service_contract('41000000-0000-4000-8000-000000000001',now()+interval '1 day',now()+interval '2 days','TEST Cliente fornece acesso; prestador executa todo o escopo.','[{"title":"Entrega","amount_cents":10000,"due_description":"Após conclusão"}]')::text,true);
select set_config('test.execution_hash',(select content_hash from public.service_contracts where id=current_setting('test.execution_contract')::uuid),true);
select public.decide_service_contract(current_setting('test.execution_contract')::uuid,current_setting('test.execution_hash'),'aceito');
do $$begin
 begin perform public.request_service_completion('41000000-0000-4000-8000-000000000001');raise exception 'Completion requested before start';exception when sqlstate 'SE003' then null;end;
 begin perform public.mark_provider_arrival('41000000-0000-4000-8000-000000000001','a_caminho');raise exception 'Arrival marked before bilateral acceptance';exception when sqlstate 'SE002' then null;end;
end $$;
select set_config('request.jwt.claim.sub','40000000-0000-4000-8000-000000000001',true);
do $$begin
 begin perform public.start_service('41000000-0000-4000-8000-000000000001');raise exception 'Client started service';exception when insufficient_privilege then null;end;
 begin perform public.mark_provider_arrival('41000000-0000-4000-8000-000000000001','a_caminho');raise exception 'Client marked provider arrival';exception when insufficient_privilege then null;end;
 begin perform public.set_provider_eta('41000000-0000-4000-8000-000000000001',30);raise exception 'Client set provider ETA';exception when insufficient_privilege then null;end;
end $$;
select public.decide_service_contract(current_setting('test.execution_contract')::uuid,current_setting('test.execution_hash'),'aceito');
do $$begin
 begin perform public.confirm_provider_arrival('41000000-0000-4000-8000-000000000001');raise exception 'Client confirmed arrival before provider arrived';exception when sqlstate 'SE013' then null;end;
end $$;
select set_config('request.jwt.claim.sub','40000000-0000-4000-8000-000000000002',true);
do $$begin
 begin perform public.start_service('41000000-0000-4000-8000-000000000001');raise exception 'Service started before provider arrival';exception when sqlstate 'SE010' then null;end;
 begin perform public.set_provider_eta('41000000-0000-4000-8000-000000000001',30);raise exception 'ETA set before journey';exception when sqlstate 'SE012' then null;end;
 begin perform public.mark_provider_arrival('41000000-0000-4000-8000-000000000001','localizacao_inventada');raise exception 'Invalid arrival event allowed';exception when sqlstate 'SE008' then null;end;
 begin perform public.mark_provider_arrival('41000000-0000-4000-8000-000000000001','chegou_local');raise exception 'Arrival skipped on-the-way event';exception when sqlstate 'SE009' then null;end;
end $$;
select public.mark_provider_arrival('41000000-0000-4000-8000-000000000001','a_caminho');
select public.mark_provider_arrival('41000000-0000-4000-8000-000000000001','a_caminho');
do $$begin
 begin perform public.set_provider_eta('41000000-0000-4000-8000-000000000001',17);raise exception 'Invalid ETA accepted';exception when sqlstate 'SE011' then null;end;
end $$;
select public.set_provider_eta('41000000-0000-4000-8000-000000000001',30);
select public.set_provider_eta('41000000-0000-4000-8000-000000000001',45);
do $$begin
 if (select count(*) from public.provider_arrival_estimates)<>1 then raise exception 'ETA update duplicated row';end if;
 if (select estimated_arrival_at<now()+interval '44 minutes' from public.provider_arrival_estimates) then raise exception 'ETA update was not persisted';end if;
 begin insert into public.provider_arrival_estimates(request_id,provider_id,estimated_arrival_at) values('41000000-0000-4000-8000-000000000001',auth.uid(),now());raise exception 'Direct ETA insert allowed';exception when insufficient_privilege then null;end;
end $$;
select public.mark_provider_arrival('41000000-0000-4000-8000-000000000001','chegou_local');
select public.mark_provider_arrival('41000000-0000-4000-8000-000000000001','chegou_local');
do $$begin
 begin perform public.set_provider_eta('41000000-0000-4000-8000-000000000001',30);raise exception 'ETA changed after arrival';exception when sqlstate 'SE012' then null;end;
 begin perform public.confirm_provider_arrival('41000000-0000-4000-8000-000000000001');raise exception 'Provider confirmed own arrival';exception when insufficient_privilege then null;end;
 begin perform public.start_service('41000000-0000-4000-8000-000000000001');raise exception 'Service started before client confirmed arrival';exception when sqlstate 'SE014' then null;end;
end $$;
select set_config('request.jwt.claim.sub','40000000-0000-4000-8000-000000000001',true);
select public.confirm_provider_arrival('41000000-0000-4000-8000-000000000001');
select public.confirm_provider_arrival('41000000-0000-4000-8000-000000000001');
select set_config('request.jwt.claim.sub','40000000-0000-4000-8000-000000000002',true);
select public.start_service('41000000-0000-4000-8000-000000000001');
select public.start_service('41000000-0000-4000-8000-000000000001');
do $$begin
 if (select status from public.service_requests where id='41000000-0000-4000-8000-000000000001')<>'em_andamento' then raise exception 'Service did not start';end if;
 if (select count(*) from public.service_execution_events where event_type='iniciado')<>1 then raise exception 'Start duplicated';end if;
 begin insert into public.service_execution_events(request_id,actor_id,event_type) values('41000000-0000-4000-8000-000000000001',auth.uid(),'conclusao_confirmada');raise exception 'Direct event insert allowed';exception when insufficient_privilege then null;end;
end $$;
select public.request_service_completion('41000000-0000-4000-8000-000000000001');
select public.request_service_completion('41000000-0000-4000-8000-000000000001');
select set_config('request.jwt.claim.sub','40000000-0000-4000-8000-000000000001',true);
select public.confirm_service_completion('41000000-0000-4000-8000-000000000001');
select public.confirm_service_completion('41000000-0000-4000-8000-000000000001');
do $$begin
 if (select status from public.service_requests where id='41000000-0000-4000-8000-000000000001')<>'concluido' then raise exception 'Client confirmation did not conclude';end if;
 if (select count(*) from public.service_execution_events)<>6 then raise exception 'Execution history incomplete';end if;
 begin update public.service_execution_events set event_type='iniciado';raise exception 'Event history editable';exception when insufficient_privilege then null;end;
end $$;
select set_config('test.client_rating',public.rate_completed_service('41000000-0000-4000-8000-000000000001',5,'TEST Excelente serviço')::text,true);
do $$begin
 begin perform public.rate_completed_service('41000000-0000-4000-8000-000000000001',1,'TEST Rewrite');raise exception 'Rating rewritten';exception when sqlstate 'SE007' then null;end;
 begin insert into public.service_ratings(request_id,reviewer_id,reviewee_id,score) values('41000000-0000-4000-8000-000000000001',auth.uid(),'40000000-0000-4000-8000-000000000002',1);raise exception 'Direct rating allowed';exception when insufficient_privilege then null;end;
end $$;
select set_config('request.jwt.claim.sub','40000000-0000-4000-8000-000000000002',true);
select public.rate_completed_service('41000000-0000-4000-8000-000000000001',4,'TEST Bom cliente');
do $$begin
 if (select count(*) from public.service_ratings)<>2 then raise exception 'Bilateral ratings missing';end if;
end $$;
select set_config('request.jwt.claim.sub','40000000-0000-4000-8000-000000000003',true);
do $$begin
 if exists(select 1 from public.service_execution_events) or exists(select 1 from public.service_ratings) or exists(select 1 from public.provider_arrival_estimates) then raise exception 'Outsider read execution';end if;
 begin perform public.rate_completed_service('41000000-0000-4000-8000-000000000001',5,null);raise exception 'Outsider rated';exception when insufficient_privilege then null;end;
end $$;
reset role;
rollback;
select 'execution-flow: passed' as result;
