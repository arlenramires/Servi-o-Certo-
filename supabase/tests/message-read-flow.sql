begin;
insert into auth.users(id,raw_user_meta_data,email_confirmed_at) values
 ('90000000-0000-4000-8000-000000000001','{"full_name":"TEST READ CLIENT"}',now()),
 ('90000000-0000-4000-8000-000000000002','{"full_name":"TEST READ PROVIDER"}',now()),
 ('90000000-0000-4000-8000-000000000003','{"full_name":"TEST READ OUTSIDER"}',now());
update public.profiles set role='prestador' where id='90000000-0000-4000-8000-000000000002';
insert into public.service_requests(id,client_id,provider_id,profession,description,status) values
 ('91000000-0000-4000-8000-000000000001','90000000-0000-4000-8000-000000000001','90000000-0000-4000-8000-000000000002','Pintor','TEST conversa com mensagens não lidas','aceito');
insert into public.service_messages(request_id,sender_id,body,created_at) values
 ('91000000-0000-4000-8000-000000000001','90000000-0000-4000-8000-000000000002','TEST primeira mensagem',now()-interval '2 minutes'),
 ('91000000-0000-4000-8000-000000000001','90000000-0000-4000-8000-000000000002','TEST segunda mensagem',now()-interval '1 minute'),
 ('91000000-0000-4000-8000-000000000001','90000000-0000-4000-8000-000000000001','TEST mensagem própria',now());

set local role authenticated;
select set_config('request.jwt.claim.sub','90000000-0000-4000-8000-000000000001',true);
do $$begin
 if (select unread_count from public.unread_service_message_counts() where request_id='91000000-0000-4000-8000-000000000001')<>2 then raise exception 'Incoming unread count is wrong';end if;
 begin insert into public.service_message_reads(request_id,user_id) values('91000000-0000-4000-8000-000000000001',auth.uid());raise exception 'Direct marker insert allowed';exception when insufficient_privilege then null;end;
end$$;
select public.mark_conversation_read('91000000-0000-4000-8000-000000000001');
select public.mark_conversation_read('91000000-0000-4000-8000-000000000001');
do $$begin if exists(select 1 from public.unread_service_message_counts()) then raise exception 'Read messages still counted';end if;end$$;
reset role;
insert into public.service_messages(request_id,sender_id,body,created_at) values
 ('91000000-0000-4000-8000-000000000001','90000000-0000-4000-8000-000000000002','TEST mensagem posterior',now()+interval '1 second');
set local role authenticated;
select set_config('request.jwt.claim.sub','90000000-0000-4000-8000-000000000001',true);
do $$begin if (select unread_count from public.unread_service_message_counts())<>1 then raise exception 'Later message not counted';end if;end$$;
select set_config('request.jwt.claim.sub','90000000-0000-4000-8000-000000000003',true);
do $$begin
 if exists(select 1 from public.unread_service_message_counts()) or exists(select 1 from public.service_message_reads) then raise exception 'Outsider read private state';end if;
 begin perform public.mark_conversation_read('91000000-0000-4000-8000-000000000001');raise exception 'Outsider marked conversation';exception when insufficient_privilege then null;end;
end$$;
reset role;
rollback;
select 'message-read-flow: passed' as result;
