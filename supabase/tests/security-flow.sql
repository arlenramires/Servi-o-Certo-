-- Safe on the linked project too: synthetic fixtures are always rolled back.
begin;
insert into auth.users(id,raw_user_meta_data,email_confirmed_at) values
 ('10000000-0000-4000-8000-000000000001','{"full_name":"TEST CLIENT","role":"administrador","account_type":"prestador"}',now()),
 ('10000000-0000-4000-8000-000000000002','{"full_name":"TEST PROVIDER"}',now()),
 ('10000000-0000-4000-8000-000000000003','{"full_name":"TEST OTHER PROVIDER"}',now()),
 ('10000000-0000-4000-8000-000000000004','{"full_name":"TEST UNCONFIRMED"}',null);
do $$begin
 if (select count(*) from public.profiles where id::text like '10000000-%' and role='cliente')<>4 then raise exception 'Metadata role escalation or duplicate signup trigger'; end if;
end $$;
update public.profiles set role='prestador',is_available=true where id in ('10000000-0000-4000-8000-000000000002','10000000-0000-4000-8000-000000000003','10000000-0000-4000-8000-000000000004');
insert into public.professions(id,name) overriding system value values(-991,'TEST Profissão'),(-992,'TEST Outra Profissão');
update public.profession_compliance_rules set classification='portfolio',reviewed_at=now() where profession_id in (-991,-992);
insert into public.provider_professions(provider_id,profession_id,verification_status)
select id,-991,'verificado' from public.profiles where id in ('10000000-0000-4000-8000-000000000002','10000000-0000-4000-8000-000000000003','10000000-0000-4000-8000-000000000004');
insert into public.provider_service_areas(provider_id,city,state,latitude,longitude,service_radius_km)
select id,'Manaus','AM',-3.1,-60.0,10 from public.profiles where id in ('10000000-0000-4000-8000-000000000002','10000000-0000-4000-8000-000000000003','10000000-0000-4000-8000-000000000004');
set local role authenticated;
select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000001',true);
insert into public.service_requests(client_id,profession,description,city,state,latitude,longitude,is_urgent,scheduled_for)
values(auth.uid(),'TEST Profissão','TEST Pedido de serviço para validar segurança','Manaus','AM',-3.1,-60.0,true,now()+interval '1 day');
select set_config('test.request_id',(select id::text from public.service_requests where description='TEST Pedido de serviço para validar segurança'),true);
do $$begin
 if public.set_provider_availability(true) then raise exception 'Client became available'; end if;
 if not public.set_request_urgency(current_setting('test.request_id')::uuid,false) then raise exception 'Client could not remove urgency';end if;
 if (select is_urgent from public.service_requests where id=current_setting('test.request_id')::uuid) then raise exception 'Urgency was not removed';end if;
 if not public.set_request_urgency(current_setting('test.request_id')::uuid,true) then raise exception 'Client could not restore urgency';end if;
 if not (select is_urgent from public.service_requests where id=current_setting('test.request_id')::uuid) then raise exception 'Urgency was not restored';end if;
 if not public.set_open_request_schedule(current_setting('test.request_id')::uuid,now()+interval '2 days') then raise exception 'Client could not change schedule';end if;
 if (select scheduled_for<now()+interval '47 hours' from public.service_requests where id=current_setting('test.request_id')::uuid) then raise exception 'Schedule was not changed';end if;
 if not public.set_open_request_schedule(current_setting('test.request_id')::uuid,null) then raise exception 'Client could not clear schedule';end if;
 if (select scheduled_for is not null from public.service_requests where id=current_setting('test.request_id')::uuid) then raise exception 'Schedule was not cleared';end if;
 begin perform public.set_open_request_schedule(current_setting('test.request_id')::uuid,now()-interval '1 hour');raise exception 'Past schedule allowed';exception when sqlstate 'RS001' then null;end;
 perform public.set_open_request_schedule(current_setting('test.request_id')::uuid,now()+interval '2 days');
 if not public.set_open_request_description(current_setting('test.request_id')::uuid,'  TEST Descrição corrigida pelo cliente antes do aceite  ') then raise exception 'Client could not change description';end if;
 if (select description<>'TEST Descrição corrigida pelo cliente antes do aceite' from public.service_requests where id=current_setting('test.request_id')::uuid) then raise exception 'Description was not trimmed and changed';end if;
 begin perform public.set_open_request_description(current_setting('test.request_id')::uuid,'curta');raise exception 'Short description allowed';exception when sqlstate 'RE001' then null;end;
 if not public.set_open_request_location(current_setting('test.request_id')::uuid,'  Parintins  ','am') then raise exception 'Client could not change location';end if;
 if not exists(select 1 from public.service_requests where id=current_setting('test.request_id')::uuid and city='Parintins' and state='AM' and latitude is null and longitude is null) then raise exception 'Location did not change or stale coordinates remained';end if;
 begin perform public.set_open_request_location(current_setting('test.request_id')::uuid,'X','AM');raise exception 'Invalid city allowed';exception when sqlstate 'RL001' then null;end;
 perform public.set_open_request_location(current_setting('test.request_id')::uuid,'Manaus','AM');
 if not public.set_open_request_profession(current_setting('test.request_id')::uuid,'  test outra profissão  ') then raise exception 'Client could not change profession';end if;
 if (select profession<>'TEST Outra Profissão' from public.service_requests where id=current_setting('test.request_id')::uuid) then raise exception 'Profession was not canonicalized and changed';end if;
 begin perform public.set_open_request_profession(current_setting('test.request_id')::uuid,'TEST Inexistente');raise exception 'Unknown profession allowed';exception when sqlstate 'RP001' then null;end;
 perform public.set_open_request_profession(current_setting('test.request_id')::uuid,'TEST Profissão');
 if exists(select 1 from public.profiles where id<>auth.uid()) then raise exception 'Profile privacy failure'; end if;
 begin update public.profiles set role='administrador' where id=auth.uid(); raise exception 'Role escalation allowed'; exception when insufficient_privilege then null; end;
 begin insert into public.provider_applications(user_id,profession,status) values(auth.uid(),'TEST Profissão','aprovado'); raise exception 'Self approval allowed'; exception when insufficient_privilege then null; end;
 begin insert into public.service_requests(client_id,profession,description,provider_id,status) values(auth.uid(),'TEST Profissão','TEST Assignment injection','10000000-0000-4000-8000-000000000002','aceito'); raise exception 'Assignment injection allowed'; exception when insufficient_privilege then null; end;
 insert into public.provider_applications(user_id,profession) values(auth.uid(),'TEST Profissão');
end $$;
reset role;
-- Other city, far coordinates and half a coordinate pair must not be offered.
insert into public.service_requests(client_id,profession,description,city,state,latitude,longitude) values
 ('10000000-0000-4000-8000-000000000001','TEST Profissão','TEST Outra cidade','Belém','PA',null,null),
 ('10000000-0000-4000-8000-000000000001','TEST Profissão','TEST Fora do raio','Manaus','AM',-2.0,-60.0),
 ('10000000-0000-4000-8000-000000000001','TEST Profissão','TEST Coordenada incompleta','Manaus','AM',-3.1,null);
set local role authenticated;
select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000004',true);
do $$begin if exists(select 1 from public.available_requests()) then raise exception 'Unconfirmed user found work'; end if; end $$;
select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000002',true);
do $$declare rid uuid;begin
 if (select count(*) from public.available_requests())<>1 then raise exception 'Locality or radius filter failed'; end if;
 if (select count(*) from public.available_request_context())<>1 then raise exception 'Safe opportunity context changed eligibility'; end if;
 if not exists(select 1 from public.available_request_context() where city='Manaus' and state='AM' and is_urgent and scheduled_for is not null) then raise exception 'Safe opportunity context missing';end if;
 if exists(select 1 from public.service_requests) then raise exception 'Unassigned provider read private request'; end if;
 select request_id into rid from public.available_requests();
 begin perform public.set_request_urgency(rid,false);raise exception 'Provider changed client urgency';exception when insufficient_privilege then null;end;
 begin perform public.set_open_request_schedule(rid,now()+interval '2 days');raise exception 'Provider changed client schedule';exception when insufficient_privilege then null;end;
 begin perform public.set_open_request_description(rid,'Provider tried to change client request description');raise exception 'Provider changed client description';exception when insufficient_privilege then null;end;
 begin perform public.set_open_request_location(rid,'Belém','PA');raise exception 'Provider changed client location';exception when insufficient_privilege then null;end;
 begin perform public.set_open_request_profession(rid,'TEST Outra Profissão');raise exception 'Provider changed client profession';exception when insufficient_privilege then null;end;
 if not public.accept_request(rid) then raise exception 'Eligible provider could not claim'; end if;
 if public.accept_request(rid) then raise exception 'Duplicate claim succeeded'; end if;
 if (select count(*) from public.service_requests)<>1 then raise exception 'Assigned provider cannot read request'; end if;
 insert into public.service_messages(request_id,sender_id,body) values(rid,auth.uid(),'TEST mensagem entre as partes');
 begin insert into public.service_messages(request_id,sender_id,body) values(rid,'10000000-0000-4000-8000-000000000001','TEST sender spoof'); raise exception 'Sender spoof allowed'; exception when insufficient_privilege then null; end;
end $$;
select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000003',true);
do $$begin
 if exists(select 1 from public.service_requests) or exists(select 1 from public.service_messages) then raise exception 'Other provider accessed conversation'; end if;
 if public.accept_request(current_setting('test.request_id')::uuid) then raise exception 'Second provider claimed assigned request'; end if;
 begin insert into public.service_messages(request_id,sender_id,body) values(current_setting('test.request_id')::uuid,auth.uid(),'TEST intrusion'); raise exception 'Other provider sent message'; exception when insufficient_privilege then null; end;
 begin perform private.request_eligible(auth.uid(),current_setting('test.request_id')::uuid); raise exception 'Private lookup exposed'; exception when insufficient_privilege then null; end;
end $$;
reset role;
insert into public.service_requests(client_id,profession,description,city,state)
values('10000000-0000-4000-8000-000000000001','TEST Profissão','TEST Novo chamado elegível','Manaus','AM');
set local role authenticated;
do $$begin if (select count(*) from public.available_requests())<>1 then raise exception 'Qualification test needs one eligible request'; end if; end $$;
reset role;
update public.provider_professions set verification_status='pendente' where provider_id='10000000-0000-4000-8000-000000000003' and profession_id=-991;
set local role authenticated;
do $$begin if exists(select 1 from public.available_requests()) then raise exception 'Unverified professional found work'; end if; end $$;
reset role;
update public.provider_professions set verification_status='verificado' where provider_id='10000000-0000-4000-8000-000000000003' and profession_id=-991;
update public.profession_compliance_rules set reviewed_at=null where profession_id=-991;
set local role authenticated;
select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000003',true);
do $$begin if exists(select 1 from public.available_requests()) then raise exception 'Unreviewed profession found work'; end if; end $$;
select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000001',true);
do $$begin
 if (select count(*) from public.service_messages)<>1 then raise exception 'Client cannot read own conversation'; end if;
 begin perform public.set_request_urgency(current_setting('test.request_id')::uuid,false);raise exception 'Client changed urgency after acceptance';exception when sqlstate 'RU001' then null;end;
 begin perform public.set_open_request_schedule(current_setting('test.request_id')::uuid,now()+interval '2 days');raise exception 'Client changed schedule after acceptance';exception when sqlstate 'RS002' then null;end;
 begin perform public.set_open_request_description(current_setting('test.request_id')::uuid,'Client tried to change an accepted request description');raise exception 'Client changed description after acceptance';exception when sqlstate 'RE002' then null;end;
 begin perform public.set_open_request_location(current_setting('test.request_id')::uuid,'Belém','PA');raise exception 'Client changed location after acceptance';exception when sqlstate 'RL002' then null;end;
 begin perform public.set_open_request_profession(current_setting('test.request_id')::uuid,'TEST Outra Profissão');raise exception 'Client changed profession after acceptance';exception when sqlstate 'RP002' then null;end;
end $$;
reset role;
update public.profession_compliance_rules set reviewed_at=now() where profession_id=-991;
set local role authenticated;
select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000003',true);
select set_config('test.declined_request',(select request_id::text from public.available_requests() limit 1),true);
do $$begin
 if not public.decline_request(current_setting('test.declined_request')::uuid) then raise exception 'Eligible provider could not decline request';end if;
 if not public.decline_request(current_setting('test.declined_request')::uuid) then raise exception 'Decline was not idempotent';end if;
 if exists(select 1 from public.available_requests()) then raise exception 'Declined request remained visible';end if;
 if (select count(*) from public.declined_requests() where request_id=current_setting('test.declined_request')::uuid)<>1 then raise exception 'Provider cannot review own decline';end if;
 if public.accept_request(current_setting('test.declined_request')::uuid) then raise exception 'Declining provider accepted hidden request';end if;
 begin perform * from private.provider_request_declines;raise exception 'Private declines exposed';exception when insufficient_privilege then null;end;
end $$;
select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000002',true);
do $$begin
 if not exists(select 1 from public.available_requests() where request_id=current_setting('test.declined_request')::uuid) then raise exception 'Decline hid request from other provider';end if;
 if exists(select 1 from public.declined_requests()) then raise exception 'Provider saw another provider decline';end if;
 if public.restore_request_interest(current_setting('test.declined_request')::uuid) then raise exception 'Provider restored another provider decline';end if;
end $$;
select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000003',true);
do $$begin
 if not public.restore_request_interest(current_setting('test.declined_request')::uuid) then raise exception 'Provider could not restore own decline';end if;
 if not exists(select 1 from public.available_requests() where request_id=current_setting('test.declined_request')::uuid) then raise exception 'Restored request did not return';end if;
 if exists(select 1 from public.declined_requests()) then raise exception 'Restored request remained hidden';end if;
end $$;
reset role;
set local role anon;
do $$begin
 begin perform public.available_requests(); raise exception 'Anon RPC allowed'; exception when insufficient_privilege then null; end;
 begin perform public.available_request_context(); raise exception 'Anon context RPC allowed'; exception when insufficient_privilege then null; end;
 begin perform public.decline_request(current_setting('test.declined_request')::uuid); raise exception 'Anon decline allowed'; exception when insufficient_privilege then null; end;
 begin perform public.declined_requests(); raise exception 'Anon decline list allowed'; exception when insufficient_privilege then null; end;
 begin perform public.restore_request_interest(current_setting('test.declined_request')::uuid); raise exception 'Anon restore allowed'; exception when insufficient_privilege then null; end;
 begin perform public.set_request_urgency(current_setting('test.request_id')::uuid,false); raise exception 'Anon urgency update allowed'; exception when insufficient_privilege then null; end;
 begin perform public.set_open_request_schedule(current_setting('test.request_id')::uuid,now()+interval '2 days'); raise exception 'Anon schedule update allowed'; exception when insufficient_privilege then null; end;
 begin perform public.set_open_request_description(current_setting('test.request_id')::uuid,'Anonymous change to request description'); raise exception 'Anon description update allowed'; exception when insufficient_privilege then null; end;
 begin perform public.set_open_request_location(current_setting('test.request_id')::uuid,'Belém','PA'); raise exception 'Anon location update allowed'; exception when insufficient_privilege then null; end;
 begin perform public.set_open_request_profession(current_setting('test.request_id')::uuid,'TEST Outra Profissão'); raise exception 'Anon profession update allowed'; exception when insufficient_privilege then null; end;
end $$;
reset role;
rollback;
select 'security-flow: passed' as result;
