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
insert into public.professions(id,name) overriding system value values(-991,'TEST Profissão');
update public.profession_compliance_rules set classification='portfolio',reviewed_at=now() where profession_id=-991;
insert into public.provider_professions(provider_id,profession_id,verification_status)
select id,-991,'verificado' from public.profiles where id in ('10000000-0000-4000-8000-000000000002','10000000-0000-4000-8000-000000000003','10000000-0000-4000-8000-000000000004');
insert into public.provider_service_areas(provider_id,city,state,latitude,longitude,service_radius_km)
select id,'Manaus','AM',-3.1,-60.0,10 from public.profiles where id in ('10000000-0000-4000-8000-000000000002','10000000-0000-4000-8000-000000000003','10000000-0000-4000-8000-000000000004');
set local role authenticated;
select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000001',true);
insert into public.service_requests(client_id,profession,description,city,state)
values(auth.uid(),'TEST Profissão','TEST Pedido de serviço para validar segurança','Manaus','AM');
select set_config('test.request_id',(select id::text from public.service_requests where description='TEST Pedido de serviço para validar segurança'),true);
do $$begin
 if public.set_provider_availability(true) then raise exception 'Client became available'; end if;
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
 if exists(select 1 from public.service_requests) then raise exception 'Unassigned provider read private request'; end if;
 select request_id into rid from public.available_requests();
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
do $$begin if (select count(*) from public.service_messages)<>1 then raise exception 'Client cannot read own conversation'; end if; end $$;
reset role;
set local role anon;
do $$begin
 begin perform public.available_requests(); raise exception 'Anon RPC allowed'; exception when insufficient_privilege then null; end;
end $$;
reset role;
rollback;
select 'security-flow: passed' as result;
