import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
const mock=await readFile(new URL('./mock-supabase.js',import.meta.url),'utf8');
test.beforeEach(async({page})=>{
  await page.route('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.118.0/+esm',route=>route.fulfill({contentType:'text/javascript',body:mock}));
});
async function login(page){await page.goto('/auth-teste/');await page.locator('#email').fill('teste@example.invalid');await page.locator('#password').fill('validpass123');await page.locator('#submit').click();await expect(page.locator('#workspace')).toBeVisible();}

test('login errors do not open workspace',async({page})=>{
  await page.goto('/auth-teste/');await page.locator('#email').fill('teste@example.invalid');await page.locator('#password').fill('wrongpass');await page.locator('#submit').click();await expect(page.locator('#status')).toHaveText('E-mail ou senha incorretos.');await expect(page.locator('#workspace')).toBeHidden();
});
test('signup requires email confirmation and sends no authoritative role',async({page})=>{
  await page.goto('/auth-teste/');await page.locator('#action').selectOption('signup');await page.locator('#name').fill('Pessoa de teste');await page.locator('#role').selectOption('prestador');await page.locator('#email').fill('teste@example.invalid');await page.locator('#password').fill('validpass123');await page.locator('#submit').click();await expect(page.locator('#status')).toContainText('Verifique seu e-mail');
  const call=await page.evaluate(()=>window.testState.calls.find(x=>x.auth==='signup'));expect(call.values.options.data).toEqual({full_name:'Pessoa de teste',requested_role:'prestador'});expect(call.values.options.emailRedirectTo).toBe('http://127.0.0.1:4173/auth-teste/');await expect(page.locator('#accountPanel')).toBeHidden();
});
test('password reset gives generic confirmation and supports recovery callback',async({page})=>{
  await page.goto('/auth-teste/');await page.locator('#action').selectOption('reset');await page.locator('#email').fill('unknown@example.invalid');await page.locator('#submit').click();await expect(page.locator('#status')).toContainText('Se o e-mail estiver cadastrado');
  await page.goto('/auth-teste/?callback=test#type=recovery');await expect(page.locator('#recoveryPanel')).toBeVisible();await expect(page.locator('#accountPanel')).toBeHidden();await page.locator('#newPassword').fill('new-password123');await page.locator('#savePassword').click();await expect(page.locator('#status')).toHaveText('Senha atualizada. Entre com sua nova senha.');await expect(page.locator('#authPanel')).toBeVisible();expect(page.url()).not.toContain('#');
});
test('client creates persisted request, safe text chat and logout clears data',async({page})=>{
  await login(page);await expect(page.locator('#providerPanel')).toBeHidden();await expect(page.locator('#adminPanel')).toBeHidden();await page.locator('#serviceProfession').selectOption('Pintor');await page.locator('#description').fill('<img src=x onerror="window.injected=true"> Pintar sala');await page.locator('#createRequest').click();await expect(page.locator('#requests')).toContainText('Pintar sala');expect(await page.evaluate(()=>window.injected)).toBeUndefined();await expect(page.locator('#requests img')).toHaveCount(0);
  await page.evaluate(()=>window.testState.requests[0].status='aceito');await page.locator('#refresh').click();await page.getByRole('button',{name:'Abrir conversa'}).click();await page.locator('#message').fill('Podemos negociar o orçamento?');await page.locator('#sendMessage').click();await expect(page.locator('#messages')).toContainText('Podemos negociar o orçamento?');await page.locator('#logout').click();await expect(page.locator('#authPanel')).toBeVisible();await expect(page.locator('#requests')).toBeEmpty();await expect(page.locator('#messages')).toBeEmpty();
});
test('client marks a request urgent and sees the persisted priority',async({page})=>{
  await login(page);await page.locator('#serviceProfession').selectOption('Eletricista');await page.locator('#description').fill('Reparo imediato no quadro elétrico da residência.');await page.locator('#urgent').check();await page.locator('#createRequest').click();
  await expect(page.locator('#status')).toContainText('Pedido urgente registrado');await expect(page.locator('#requests')).toContainText('Atendimento urgente');await expect(page.locator('#urgent')).not.toBeChecked();
  expect(await page.evaluate(()=>window.testState.calls.find(c=>c.table==='service_requests'&&c.operation==='insert').payload)).toMatchObject({profession:'Eletricista',is_urgent:true,city:'Manaus',state:'AM'});
});
test('client changes urgency while an unassigned request remains open',async({page})=>{
  await login(page);await page.locator('#serviceProfession').selectOption('Pintor');await page.locator('#description').fill('Pintura completa da sala e acabamento das paredes.');await page.locator('#createRequest').click();
  const card=page.locator('#requests .service').first();await card.getByRole('button',{name:'Marcar como urgente'}).click();await expect(card).toContainText('Atendimento urgente');await expect(page.locator('#status')).toContainText('marcado como urgente');
  await card.getByRole('button',{name:'Remover urgência'}).click();await expect(card).not.toContainText('Atendimento urgente');await expect(page.locator('#status')).toContainText('Urgência removida');
  expect(await page.evaluate(()=>window.testState.calls.filter(c=>c.rpc==='set_request_urgency').map(c=>c.args))).toEqual([{p_request_id:expect.any(String),p_urgent:true},{p_request_id:expect.any(String),p_urgent:false}]);
});
test('client updates and removes the schedule while a request remains open',async({page})=>{
  await login(page);await page.locator('#serviceProfession').selectOption('Pintor');await page.locator('#description').fill('Pintura da sala com preferência de horário para atendimento.');await page.locator('#createRequest').click();
  const card=page.locator('#requests .service').first(),schedule=card.getByLabel('Horário preferido');
  await schedule.fill('2027-01-15T14:30');await card.getByRole('button',{name:'Atualizar horário'}).click();
  await expect(page.locator('#status')).toContainText('Horário preferido atualizado');await expect(card).toContainText('Horário preferido:');await expect(card).not.toContainText('Agendado:');
  await card.getByLabel('Horário preferido').fill('');await card.getByRole('button',{name:'Atualizar horário'}).click();
  await expect(page.locator('#status')).toContainText('Horário preferido removido');await expect(card).not.toContainText('Horário preferido:');
  expect(await page.evaluate(()=>window.testState.calls.filter(c=>c.rpc==='set_open_request_schedule').map(c=>c.args))).toEqual([{p_request_id:expect.any(String),p_scheduled_for:expect.any(String)},{p_request_id:expect.any(String),p_scheduled_for:null}]);
});
test('client corrects the description while a request remains open',async({page})=>{
  await login(page);await page.locator('#serviceProfession').selectOption('Eletricista');await page.locator('#description').fill('Trocar tomada antiga da sala.');await page.locator('#createRequest').click();
  const card=page.locator('#requests .service').first(),description=card.getByLabel('Descrição do pedido');
  await description.fill('Trocar duas tomadas antigas da sala e revisar a fiação próxima.');await card.getByRole('button',{name:'Atualizar descrição'}).click();
  await expect(page.locator('#status')).toContainText('Descrição do pedido atualizada');await expect(card).toContainText('Trocar duas tomadas antigas');
  expect(await page.evaluate(()=>window.testState.calls.find(c=>c.rpc==='set_open_request_description').args)).toEqual({p_request_id:expect.any(String),p_description:'Trocar duas tomadas antigas da sala e revisar a fiação próxima.'});
});
test('client changes the region while a request remains open',async({page})=>{
  await login(page);await page.locator('#serviceProfession').selectOption('Eletricista');await page.locator('#description').fill('Instalar iluminação em uma residência.');await page.locator('#createRequest').click();
  const card=page.locator('#requests .service').first();await card.getByLabel('Cidade do pedido').fill('Parintins');await card.getByLabel('UF do pedido').fill('am');await card.getByRole('button',{name:'Atualizar região'}).click();
  await expect(page.locator('#status')).toContainText('Região do pedido atualizada');await expect(card).toContainText('Parintins / AM');
  expect(await page.evaluate(()=>window.testState.calls.find(c=>c.rpc==='set_open_request_location').args)).toEqual({p_request_id:expect.any(String),p_city:'Parintins',p_state:'AM'});
});
test('client changes the profession while a request remains open',async({page})=>{
  await login(page);await page.locator('#serviceProfession').selectOption('Pintor');await page.locator('#description').fill('Pintura de uma sala com correção do acabamento.');await page.locator('#createRequest').click();
  const card=page.locator('#requests .service').first();await card.getByLabel('Profissão do pedido').selectOption('Eletricista');await card.getByRole('button',{name:'Atualizar profissão'}).click();
  await expect(page.locator('#status')).toContainText('Profissão do pedido atualizada');await expect(card.getByRole('heading')).toHaveText('Eletricista');
  expect(await page.evaluate(()=>window.testState.calls.find(c=>c.rpc==='set_open_request_profession').args)).toEqual({p_request_id:expect.any(String),p_profession:'Eletricista'});
});
test('incoming messages show an unread count that clears when conversation opens',async({page})=>{
  await login(page);
  await page.evaluate(()=>{
    const now=Date.now();
    window.testState.requests.push({id:'unread-service',client_id:'10000000-0000-4000-8000-000000000001',provider_id:'provider-id',profession:'Pintor',description:'Pintura com conversa',status:'aceito',city:'Manaus',state:'AM',created_at:new Date(now-3000).toISOString()});
    window.testState.messages.push(
      {id:'incoming-1',request_id:'unread-service',sender_id:'provider-id',body:'Primeira mensagem',created_at:new Date(now-2000).toISOString()},
      {id:'incoming-2',request_id:'unread-service',sender_id:'provider-id',body:'Segunda mensagem',created_at:new Date(now-1000).toISOString()},
      {id:'own',request_id:'unread-service',sender_id:'10000000-0000-4000-8000-000000000001',body:'Mensagem própria',created_at:new Date(now).toISOString()}
    );
  });
  await page.locator('#refresh').click();
  const card=page.locator('[data-request="unread-service"]');
  await expect(card).toContainText('2 novas mensagens');
  await card.getByRole('button',{name:'Abrir conversa'}).click();
  await expect(card.locator('.unread-count')).toHaveCount(0);
  expect(await page.evaluate(()=>window.testState.messageReads)).toEqual([expect.objectContaining({request_id:'unread-service',user_id:'10000000-0000-4000-8000-000000000001'})]);
});
test('client filters services with unread messages and refreshes the count after reading',async({page})=>{
  await login(page);
  await page.evaluate(()=>{
    const now=Date.now(),client='10000000-0000-4000-8000-000000000001';
    window.testState.requests.push(
      {id:'unread-filter-service',client_id:client,provider_id:'provider-id',profession:'Eletricista',description:'Serviço com mensagem nova',status:'aceito',city:'Manaus',state:'AM',created_at:new Date(now-2000).toISOString()},
      {id:'read-filter-service',client_id:client,provider_id:'provider-id',profession:'Pintor',description:'Serviço sem mensagem nova',status:'aceito',city:'Manaus',state:'AM',created_at:new Date(now-1000).toISOString()}
    );
    window.testState.messages.push({id:'unread-filter-message',request_id:'unread-filter-service',sender_id:'provider-id',body:'Posso chegar pela manhã.',created_at:new Date(now).toISOString()});
  });
  await page.locator('#refresh').click();
  await expect(page.locator('#requestFilter option[value="unread"]')).toHaveText('Mensagens novas (1)');
  await page.locator('#requestFilter').selectOption('unread');
  await expect(page.locator('#requests .service')).toHaveCount(1);
  await expect(page.locator('#requests')).toContainText('Serviço com mensagem nova');
  await expect(page.locator('#requests')).not.toContainText('Serviço sem mensagem nova');
  await page.getByRole('button',{name:'Abrir conversa'}).click();
  await page.locator('#refresh').click();
  await expect(page.locator('#requestFilter option[value="unread"]')).toHaveText('Mensagens novas (0)');
  await expect(page.locator('#requests .service')).toHaveCount(0);
  await expect(page.locator('#requests')).toContainText('Nenhum serviço nesta categoria.');
});
test('client filters urgent services and combines the category with search',async({page})=>{
  await login(page);await page.evaluate(()=>window.testState.requests.push(
    {id:'urgent-electrician',profession:'Eletricista',description:'Trocar quadro com risco',status:'aberto',city:'Manaus',state:'AM',is_urgent:true,created_at:'2026-10-21T10:00:00.000Z'},
    {id:'urgent-painter',profession:'Pintor',description:'Pintura urgente após infiltração',status:'concluido',city:'Manaus',state:'AM',is_urgent:true,created_at:'2026-10-20T10:00:00.000Z'},
    {id:'regular-electrician',profession:'Eletricista',description:'Revisão preventiva',status:'aceito',city:'Manaus',state:'AM',is_urgent:false,created_at:'2026-10-19T10:00:00.000Z'}
  ));
  await page.locator('#refresh').click();await expect(page.locator('#requestFilter option[value="urgent"]')).toHaveText('Urgentes (2)');await page.locator('#requestFilter').selectOption('urgent');
  await expect(page.locator('#requests .service')).toHaveCount(2);await expect(page.locator('#requests')).toContainText('Trocar quadro com risco');await expect(page.locator('#requests')).toContainText('Pintura urgente');await expect(page.locator('#requests')).not.toContainText('Revisão preventiva');
  await page.locator('#requestSearch').fill('eletricista');await page.locator('#searchRequests').click();await expect(page.locator('#requests .service')).toHaveCount(1);await expect(page.locator('#requests')).toContainText('Trocar quadro com risco');expect(await page.evaluate(()=>window.testState.requests.map(r=>r.id))).toEqual(['urgent-electrician','urgent-painter','regular-electrician']);
});
test('client filters services with a preferred time without implying confirmation',async({page})=>{
  await login(page);await page.evaluate(()=>window.testState.requests.push(
    {id:'scheduled-electrician',profession:'Eletricista',description:'Instalação com horário indicado',status:'aberto',city:'Manaus',state:'AM',scheduled_for:'2026-10-23T14:00:00.000Z',created_at:'2026-10-21T11:00:00.000Z'},
    {id:'scheduled-painter',profession:'Pintor',description:'Pintura com preferência de manhã',status:'concluido',city:'Manaus',state:'AM',scheduled_for:'2026-10-20T12:00:00.000Z',created_at:'2026-10-20T11:00:00.000Z'},
    {id:'unscheduled-electrician',profession:'Eletricista',description:'Revisão sem horário',status:'aceito',city:'Manaus',state:'AM',scheduled_for:null,created_at:'2026-10-19T11:00:00.000Z'}
  ));
  await page.locator('#refresh').click();await expect(page.locator('#requestFilter option[value="scheduled"]')).toHaveText('Com horário preferido (2)');await page.locator('#requestFilter').selectOption('scheduled');
  await expect(page.locator('#requests .service')).toHaveCount(2);await expect(page.locator('#requests')).toContainText('Instalação com horário indicado');await expect(page.locator('#requests')).toContainText('Pintura com preferência');await expect(page.locator('#requests')).not.toContainText('Revisão sem horário');
  await page.locator('#requestSearch').fill('pintor');await page.locator('#searchRequests').click();await expect(page.locator('#requests .service')).toHaveCount(1);await expect(page.locator('#requests')).toContainText('Pintura com preferência');expect(await page.evaluate(()=>window.testState.requests.map(r=>r.id))).toEqual(['scheduled-electrician','scheduled-painter','unscheduled-electrician']);
});
test('provider handles an already claimed opportunity without false success',async({page})=>{
  await page.addInitScript(()=>window.testRole='prestador');await login(page);await expect(page.locator('#clientPanel')).toBeHidden();await expect(page.locator('#providerApply')).toBeHidden();await page.getByRole('button',{name:'Aceitar chamado'}).click();await expect(page.locator('#status')).toContainText('não está mais disponível');
});
test('provider sees safe location, urgency and schedule context before accepting',async({page})=>{
  await page.addInitScript(()=>window.testRole='prestador');await login(page);const opportunities=page.locator('#opportunities');
  await expect(opportunities).toContainText('Urgente · Manaus / AM');await expect(opportunities).toContainText('Preferência:');
  await expect(opportunities).not.toContainText('cliente');await expect(opportunities).not.toContainText('coordenada');
  expect(await page.evaluate(()=>window.testState.calls.some(c=>c.rpc==='available_request_context'))).toBe(true);
});
test('provider declines an opportunity without removing it for others',async({page})=>{
  await page.addInitScript(()=>window.testRole='prestador');await login(page);await page.getByRole('button',{name:'Não tenho interesse'}).click();
  await expect(page.locator('#status')).toContainText('Outros profissionais ainda podem aceitá-lo');await expect(page.locator('#opportunities')).toContainText('Nenhum chamado compatível');
  expect(await page.evaluate(()=>({declined:window.testState.declinedRequests,call:window.testState.calls.find(c=>c.rpc==='decline_request').args}))).toEqual({declined:['open-request'],call:{p_request_id:'open-request'}});
});
test('provider restores a personally hidden opportunity',async({page})=>{
  await page.addInitScript(()=>window.testRole='prestador');await login(page);await page.getByRole('button',{name:'Não tenho interesse'}).click();
  await expect(page.getByRole('heading',{name:'Ocultados por você'})).toBeVisible();await page.getByRole('button',{name:'Mostrar novamente'}).click();
  await expect(page.locator('#status')).toContainText('devolvido à sua lista');await expect(page.getByRole('button',{name:'Aceitar chamado'})).toBeVisible();
  expect(await page.evaluate(()=>({declined:window.testState.declinedRequests,call:window.testState.calls.find(c=>c.rpc==='restore_request_interest').args}))).toEqual({declined:[],call:{p_request_id:'open-request'}});
});
test('missing server profile keeps workspace closed',async({page})=>{
  await page.addInitScript(()=>window.missingProfile=true);await page.goto('/auth-teste/');await page.locator('#email').fill('teste@example.invalid');await page.locator('#password').fill('validpass123');await page.locator('#submit').click();await expect(page.locator('#status')).toContainText('permanece bloqueado');await expect(page.locator('#workspace')).toBeHidden();
});
test('layout fits viewport',async({page})=>{
  await login(page);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});

test('client reuses a finished request only after reviewing a new form',async({page})=>{
  await login(page);await page.evaluate(()=>window.testState.requests.push(
    {id:'repeat-cancelled',client_id:'10000000-0000-4000-8000-000000000001',profession:'Pintor',description:'Pintar novamente a sala e corrigir o acabamento.',status:'cancelado',city:'Parintins',state:'AM',scheduled_for:'2026-10-20T15:00:00.000Z',is_urgent:true,created_at:new Date().toISOString()},
    {id:'repeat-completed',client_id:'10000000-0000-4000-8000-000000000001',profession:'Eletricista',description:'Revisar instalação elétrica concluída anteriormente.',status:'concluido',city:'Manaus',state:'AM',created_at:new Date(Date.now()-1000).toISOString()}
  ));
  await page.locator('#refresh').click();await expect(page.getByRole('button',{name:'Solicitar novamente'})).toHaveCount(2);
  const original=page.locator('[data-request="repeat-cancelled"]');await original.getByRole('button',{name:'Solicitar novamente'}).click();
  await expect(page.locator('#status')).toContainText('Revise as informações');await expect(page.locator('#serviceProfession')).toHaveValue('Pintor');await expect(page.locator('#description')).toHaveValue('Pintar novamente a sala e corrigir o acabamento.');await expect(page.locator('#city')).toHaveValue('Parintins');await expect(page.locator('#state')).toHaveValue('AM');await expect(page.locator('#scheduled')).toHaveValue('');await expect(page.locator('#urgent')).not.toBeChecked();
  await page.locator('#createRequest').click();await expect(page.locator('#status')).toContainText('Pedido registrado');
  const result=await page.evaluate(()=>({original:window.testState.requests.find(r=>r.id==='repeat-cancelled'),created:window.testState.requests.at(-1)}));
  expect(result).toMatchObject({original:{status:'cancelado'},created:{status:'aberto',profession:'Pintor',description:'Pintar novamente a sala e corrigir o acabamento.',city:'Parintins',state:'AM',scheduled_for:null,is_urgent:false}});expect(result.created).not.toHaveProperty('provider_id');
});

test('client filters active services and history without changing requests',async({page})=>{
  await login(page);await page.evaluate(()=>window.testState.requests.push(
    {id:'filter-open',profession:'Pintor',description:'Pedido aberto',status:'aberto',city:'Manaus',state:'AM',created_at:new Date().toISOString()},
    {id:'filter-accepted',profession:'Eletricista',description:'Pedido aceito',status:'aceito',city:'Manaus',state:'AM',created_at:new Date(Date.now()-1000).toISOString()},
    {id:'filter-completed',profession:'Pintor',description:'Pedido concluído',status:'concluido',city:'Manaus',state:'AM',created_at:new Date(Date.now()-2000).toISOString()},
    {id:'filter-cancelled',profession:'Eletricista',description:'Pedido cancelado',status:'cancelado',city:'Manaus',state:'AM',created_at:new Date(Date.now()-3000).toISOString()}
  ));
  await page.locator('#refresh').click();await expect(page.locator('#requests .service')).toHaveCount(4);
  await page.locator('#requestFilter').selectOption('active');await expect(page.locator('#requests .service')).toHaveCount(2);await expect(page.locator('#requests')).toContainText('Pedido aberto');await expect(page.locator('#requests')).toContainText('Pedido aceito');await expect(page.locator('#requests')).not.toContainText('Pedido concluído');
  await page.locator('#requestFilter').selectOption('history');await expect(page.locator('#requests .service')).toHaveCount(2);await expect(page.locator('#requests')).toContainText('Pedido concluído');await expect(page.locator('#requests')).toContainText('Pedido cancelado');await expect(page.locator('#requests')).not.toContainText('Pedido aberto');
  await page.locator('#requestFilter').selectOption('all');await expect(page.locator('#requests .service')).toHaveCount(4);expect(await page.evaluate(()=>window.testState.requests.map(r=>r.status))).toEqual(['aberto','aceito','concluido','cancelado']);
});

test('client filters requests waiting for a professional without changing them',async({page})=>{
  await login(page);await page.evaluate(()=>window.testState.requests.push(
    {id:'waiting-electrician',profession:'Eletricista',description:'Revisar quadro aguardando profissional',status:'aberto',city:'Manaus',state:'AM',created_at:'2026-10-21T12:00:00.000Z'},
    {id:'waiting-painter',profession:'Pintor',description:'Pintar sala aguardando profissional',status:'aberto',city:'Manaus',state:'AM',created_at:'2026-10-20T12:00:00.000Z'},
    {id:'accepted-electrician',profession:'Eletricista',description:'Instalação já aceita',status:'aceito',city:'Manaus',state:'AM',created_at:'2026-10-19T12:00:00.000Z'}
  ));
  await page.locator('#refresh').click();await expect(page.locator('#requestFilter option[value="waiting"]')).toHaveText('Aguardando profissional (2)');await page.locator('#requestFilter').selectOption('waiting');
  await expect(page.locator('#requests .service')).toHaveCount(2);await expect(page.locator('#requests')).not.toContainText('Instalação já aceita');
  await page.locator('#requestSearch').fill('eletricista');await page.locator('#searchRequests').click();await expect(page.locator('#requests .service')).toHaveCount(1);await expect(page.locator('#requests')).toContainText('Revisar quadro aguardando profissional');
  expect(await page.evaluate(()=>window.testState.requests.map(r=>r.id))).toEqual(['waiting-electrician','waiting-painter','accepted-electrician']);
});

test('client filters services being attended without changing them',async({page})=>{
  await login(page);await page.evaluate(()=>window.testState.requests.push(
    {id:'servicing-accepted',profession:'Eletricista',description:'Instalação com profissional aceito',status:'aceito',city:'Manaus',state:'AM',created_at:'2026-10-21T12:00:00.000Z'},
    {id:'servicing-progress',profession:'Pintor',description:'Pintura em andamento',status:'em_andamento',city:'Manaus',state:'AM',created_at:'2026-10-20T12:00:00.000Z'},
    {id:'servicing-open',profession:'Pintor',description:'Pintura ainda aguardando',status:'aberto',city:'Manaus',state:'AM',created_at:'2026-10-19T12:00:00.000Z'}
  ));
  await page.locator('#refresh').click();await expect(page.locator('#requestFilter option[value="servicing"]')).toHaveText('Em atendimento (2)');await page.locator('#requestFilter').selectOption('servicing');
  await expect(page.locator('#requests .service')).toHaveCount(2);await expect(page.locator('#requests')).not.toContainText('Pintura ainda aguardando');
  await page.locator('#requestSearch').fill('pintor');await page.locator('#searchRequests').click();await expect(page.locator('#requests .service')).toHaveCount(1);await expect(page.locator('#requests')).toContainText('Pintura em andamento');
  expect(await page.evaluate(()=>window.testState.requests.map(r=>r.id))).toEqual(['servicing-accepted','servicing-progress','servicing-open']);
});

test('client filters completed services without mixing cancelled history',async({page})=>{
  await login(page);await page.evaluate(()=>window.testState.requests.push(
    {id:'completed-electrician',profession:'Eletricista',description:'Instalação finalizada',status:'concluido',city:'Manaus',state:'AM',created_at:'2026-10-21T12:00:00.000Z'},
    {id:'completed-painter',profession:'Pintor',description:'Pintura finalizada',status:'concluido',city:'Manaus',state:'AM',created_at:'2026-10-20T12:00:00.000Z'},
    {id:'cancelled-painter',profession:'Pintor',description:'Pintura cancelada',status:'cancelado',city:'Manaus',state:'AM',created_at:'2026-10-19T12:00:00.000Z'}
  ));
  await page.locator('#refresh').click();await expect(page.locator('#requestFilter option[value="completed"]')).toHaveText('Concluídos (2)');await page.locator('#requestFilter').selectOption('completed');
  await expect(page.locator('#requests .service')).toHaveCount(2);await expect(page.locator('#requests')).not.toContainText('Pintura cancelada');
  await page.locator('#requestSearch').fill('pintor');await page.locator('#searchRequests').click();await expect(page.locator('#requests .service')).toHaveCount(1);await expect(page.locator('#requests')).toContainText('Pintura finalizada');
  expect(await page.evaluate(()=>window.testState.requests.map(r=>r.id))).toEqual(['completed-electrician','completed-painter','cancelled-painter']);
});

test('client searches services by profession or description and combines status filter',async({page})=>{
  await login(page);await page.evaluate(()=>window.testState.requests.push(
    {id:'search-active',profession:'Eletricista',description:'Revisar fiação da cozinha',status:'aberto',city:'Manaus',state:'AM',created_at:new Date().toISOString()},
    {id:'search-history',profession:'Eletricista',description:'Trocar disjuntor antigo',status:'concluido',city:'Manaus',state:'AM',created_at:new Date(Date.now()-1000).toISOString()},
    {id:'search-painter',profession:'Pintor',description:'Pintura completa da sala',status:'cancelado',city:'Manaus',state:'AM',created_at:new Date(Date.now()-2000).toISOString()}
  ));
  await page.locator('#refresh').click();
  await page.locator('#requestSearch').fill('ELETRICISTA');await page.locator('#searchRequests').click();await expect(page.locator('#requests .service')).toHaveCount(2);await expect(page.locator('#requests')).not.toContainText('Pintura completa');
  await page.locator('#requestFilter').selectOption('history');await expect(page.locator('#requests .service')).toHaveCount(1);await expect(page.locator('#requests')).toContainText('Trocar disjuntor antigo');
  await page.locator('#requestSearch').fill('fiacao');await page.locator('#searchRequests').click();await expect(page.locator('#requests')).toContainText('Nenhum serviço corresponde à busca');
  await page.locator('#requestFilter').selectOption('active');await expect(page.locator('#requests .service')).toHaveCount(1);await expect(page.locator('#requests')).toContainText('Revisar fiação da cozinha');
  await page.locator('#clearRequestSearch').click();await expect(page.locator('#requestSearch')).toHaveValue('');await expect(page.locator('#requestFilter')).toHaveValue('active');await expect(page.locator('#requests .service')).toHaveCount(1);
  expect(await page.evaluate(()=>window.testState.requests.map(r=>r.id))).toEqual(['search-active','search-history','search-painter']);
});

test('client orders services by date or urgency without changing requests',async({page})=>{
  await login(page);await page.evaluate(()=>window.testState.requests.push(
    {id:'sort-oldest',profession:'Pintor',description:'Primeiro pedido comum',status:'concluido',city:'Manaus',state:'AM',is_urgent:false,created_at:'2026-10-18T12:00:00.000Z'},
    {id:'sort-urgent',profession:'Eletricista',description:'Segundo pedido urgente',status:'aberto',city:'Manaus',state:'AM',is_urgent:true,created_at:'2026-10-19T12:00:00.000Z'},
    {id:'sort-newest',profession:'Encanador',description:'Terceiro pedido comum',status:'aceito',city:'Manaus',state:'AM',is_urgent:false,created_at:'2026-10-20T12:00:00.000Z'}
  ));
  const order=()=>page.locator('#requests .service').evaluateAll(cards=>cards.map(card=>card.dataset.request));
  await page.locator('#refresh').click();expect(await order()).toEqual(['sort-newest','sort-urgent','sort-oldest']);
  await page.locator('#requestSort').selectOption('oldest');expect(await order()).toEqual(['sort-oldest','sort-urgent','sort-newest']);
  await page.locator('#requestSort').selectOption('urgent');expect(await order()).toEqual(['sort-urgent','sort-newest','sort-oldest']);
  await page.locator('#requestFilter').selectOption('active');expect(await order()).toEqual(['sort-urgent','sort-newest']);
  expect(await page.evaluate(()=>window.testState.requests.map(r=>r.id))).toEqual(['sort-oldest','sort-urgent','sort-newest']);
});

test('client orders preferred times first without changing requests',async({page})=>{
  await login(page);await page.evaluate(()=>window.testState.requests.push(
    {id:'schedule-later',profession:'Pintor',description:'Pintura com preferência posterior',status:'concluido',city:'Manaus',state:'AM',scheduled_for:'2026-10-25T14:00:00.000Z',created_at:'2026-10-21T12:00:00.000Z'},
    {id:'schedule-none',profession:'Eletricista',description:'Instalação sem horário indicado',status:'aberto',city:'Manaus',state:'AM',scheduled_for:null,created_at:'2026-10-22T12:00:00.000Z'},
    {id:'schedule-earlier',profession:'Encanador',description:'Reparo com preferência anterior',status:'aceito',city:'Manaus',state:'AM',scheduled_for:'2026-10-23T09:00:00.000Z',created_at:'2026-10-20T12:00:00.000Z'}
  ));
  const order=()=>page.locator('#requests .service').evaluateAll(cards=>cards.map(card=>card.dataset.request));
  await page.locator('#refresh').click();await page.locator('#requestSort').selectOption('schedule');
  expect(await order()).toEqual(['schedule-earlier','schedule-later','schedule-none']);
  await page.locator('#requestFilter').selectOption('scheduled');expect(await order()).toEqual(['schedule-earlier','schedule-later']);
  expect(await page.evaluate(()=>window.testState.requests.map(r=>r.id))).toEqual(['schedule-later','schedule-none','schedule-earlier']);
});

test('client clears search, status filter and ordering without changing services',async({page})=>{
  await login(page);await page.evaluate(()=>window.testState.requests.push(
    {id:'clear-oldest',profession:'Pintor',description:'Pintura antiga',status:'concluido',city:'Manaus',state:'AM',is_urgent:false,created_at:'2026-10-18T12:00:00.000Z'},
    {id:'clear-urgent',profession:'Eletricista',description:'Reparo elétrico urgente',status:'aberto',city:'Manaus',state:'AM',is_urgent:true,created_at:'2026-10-19T12:00:00.000Z'},
    {id:'clear-newest',profession:'Encanador',description:'Reparo hidráulico recente',status:'aceito',city:'Manaus',state:'AM',is_urgent:false,created_at:'2026-10-20T12:00:00.000Z'}
  ));
  const order=()=>page.locator('#requests .service').evaluateAll(cards=>cards.map(card=>card.dataset.request));
  await page.locator('#refresh').click();await page.locator('#requestFilter').selectOption('history');await page.locator('#requestSort').selectOption('oldest');await page.locator('#requestSearch').fill('pintura');await page.locator('#searchRequests').click();
  await expect(page.locator('#requests .service')).toHaveCount(1);expect(await order()).toEqual(['clear-oldest']);
  await page.locator('#clearRequestFilters').click();await expect(page.locator('#requestSearch')).toHaveValue('');await expect(page.locator('#requestFilter')).toHaveValue('all');await expect(page.locator('#requestSort')).toHaveValue('recent');
  await expect(page.locator('#requests .service')).toHaveCount(3);expect(await order()).toEqual(['clear-newest','clear-urgent','clear-oldest']);expect(await page.evaluate(()=>window.testState.requests.map(r=>r.id))).toEqual(['clear-oldest','clear-urgent','clear-newest']);
});

test('service summary counts active, history and currently displayed requests',async({page})=>{
  await login(page);await page.evaluate(()=>window.testState.requests.push(
    {id:'summary-open',profession:'Pintor',description:'Pintura ativa',status:'aberto',city:'Manaus',state:'AM',created_at:new Date().toISOString()},
    {id:'summary-progress',profession:'Eletricista',description:'Instalação em andamento',status:'em_andamento',city:'Manaus',state:'AM',created_at:new Date(Date.now()-1000).toISOString()},
    {id:'summary-done',profession:'Pintor',description:'Pintura concluída',status:'concluido',city:'Manaus',state:'AM',created_at:new Date(Date.now()-2000).toISOString()},
    {id:'summary-cancelled',profession:'Encanador',description:'Reparo cancelado',status:'cancelado',city:'Manaus',state:'AM',created_at:new Date(Date.now()-3000).toISOString()}
  ));
  await page.locator('#refresh').click();await expect(page.locator('#requestSummary')).toHaveText('Exibindo 4 de 4 serviços · 2 ativos · 2 no histórico · 0 com mensagens novas.');
  await expect(page.locator('#requestFilter option[value="active"]')).toHaveText('Ativos (2)');await expect(page.locator('#requestFilter option[value="history"]')).toHaveText('Histórico (2)');
  await page.locator('#requestFilter').selectOption('history');await expect(page.locator('#requestSummary')).toHaveText('Exibindo 2 de 4 serviços · 2 ativos · 2 no histórico · 0 com mensagens novas.');
  await page.locator('#requestSearch').fill('pintura');await page.locator('#searchRequests').click();await expect(page.locator('#requestSummary')).toHaveText('Exibindo 1 de 4 serviços · 2 ativos · 2 no histórico · 0 com mensagens novas.');
  expect(await page.evaluate(()=>window.testState.requests.map(r=>r.status))).toEqual(['aberto','em_andamento','concluido','cancelado']);
});

test('client cancels an open request with an audited reason and no fee claim',async({page})=>{
  await login(page);
  await page.evaluate(()=>window.testState.requests.push({id:'client-cancellation',client_id:'10000000-0000-4000-8000-000000000001',profession:'Pintor',description:'Pedido que não é mais necessário',status:'aberto',city:'Manaus',state:'AM',created_at:new Date().toISOString()}));
  await page.locator('#refresh').click();await page.getByRole('button',{name:'Cancelar pedido'}).click();await expect(page.locator('#cancellationPanel')).toBeVisible();
  await page.locator('#cancellationReason').fill('O serviço não será mais necessário');await page.locator('#confirmCancellation').click();
  await expect(page.locator('#status')).toContainText('Nenhuma taxa foi cobrada');await expect(page.locator('#requests')).toContainText('Cancelado');
  expect(await page.evaluate(()=>({request:window.testState.requests[0].status,audit:window.testState.cancellations[0]}))).toMatchObject({request:'cancelado',audit:{actor_role:'cliente',reason:'O serviço não será mais necessário',outcome:'cancelado_cliente',fee_status:'nao_avaliada'}});
});

test('provider cancellation creates a new open request for another professional',async({page})=>{
  await page.addInitScript(()=>window.testRole='prestador');await login(page);
  await page.evaluate(()=>window.testState.requests.push({id:'provider-cancellation',client_id:'client-id',provider_id:'10000000-0000-4000-8000-000000000001',profession:'Pintor',description:'Pedido a ser reencaminhado',status:'aceito',city:'Manaus',state:'AM',created_at:new Date().toISOString()}));
  await page.locator('#refresh').click();await page.getByRole('button',{name:'Cancelar e reencaminhar'}).click();await page.locator('#cancellationReason').fill('Tive um imprevisto antes do início');await page.locator('#confirmCancellation').click();
  await expect(page.locator('#status')).toContainText('novo chamado criado');
  expect(await page.evaluate(()=>window.testState.requests.map(r=>({id:r.id,status:r.status,provider_id:r.provider_id,replaces_request_id:r.replaces_request_id})))).toEqual([
    {id:'provider-cancellation',status:'cancelado',provider_id:'10000000-0000-4000-8000-000000000001',replaces_request_id:undefined},
    expect.objectContaining({status:'aberto',provider_id:null,replaces_request_id:'provider-cancellation'})
  ]);
});

async function seedAcceptedService(page){
  await page.evaluate(()=>window.testState.requests.push({id:'accepted-service',profession:'Pintor',description:'Pintar sala com escopo definido',status:'aceito',city:'Manaus',state:'AM',created_at:new Date().toISOString()}));
  await page.locator('#refresh').click();await page.getByRole('button',{name:'Abrir conversa'}).click();
}
test('provider submits exact cents and cannot see client decision controls',async({page})=>{
  await page.addInitScript(()=>window.testRole='prestador');await login(page);await seedAcceptedService(page);
  await page.locator('#quoteAmount').fill('0,29');await page.locator('#quoteDescription').fill('Pintar sala em dois dias, material incluso');await page.locator('#sendQuote').click();
  await expect(page.locator('#quotes')).toContainText('0,29');await expect(page.getByRole('button',{name:'Aceitar orçamento'})).toHaveCount(0);
  expect(await page.evaluate(()=>window.testState.quotes[0].amount_cents)).toBe(29);
  await page.locator('#quoteAmount').fill('1,001');await page.locator('#quoteDescription').fill('Proposta inválida');await page.locator('#sendQuote').click();await expect(page.locator('#status')).toContainText('até duas casas');expect(await page.evaluate(()=>window.testState.quotes.length)).toBe(1);
});
test('client rejects one proposal then accepts another and sees immutable history',async({page})=>{
  await login(page);await seedAcceptedService(page);
  await page.evaluate(()=>window.testState.quotes.push(...['q1','q2'].map((id,i)=>({id,request_id:'accepted-service',provider_id:'provider-id',amount_cents:20000+i*5000,description:i?'Pintura completa em dois dias':'<img src=x onerror="window.quoteInjected=true"> Proposta inicial',status:'proposta',created_at:new Date().toISOString()}))));
  await page.locator('#refresh').click();await expect(page.locator('#quotes')).toContainText('200,00');await expect(page.locator('#quotes img')).toHaveCount(0);
  await page.locator('[data-quote="q1"]').getByRole('button',{name:'Recusar orçamento'}).click();await expect(page.locator('[data-quote="q1"]')).toContainText('Recusado pelo cliente');
  await page.locator('[data-quote="q2"]').getByRole('button',{name:'Aceitar orçamento'}).click();await expect(page.locator('[data-quote="q2"]')).toContainText('Aceito pelo cliente');await expect(page.getByRole('button',{name:'Aceitar orçamento'})).toHaveCount(0);await expect(page.locator('#quoteForm')).toBeHidden();await expect(page.locator('#status')).toContainText('Ainda não houve pagamento');
  expect(await page.evaluate(()=>window.testState.decisions.map(d=>({quote_id:d.quote_id,request_id:d.request_id,decision:d.decision})))).toEqual([{quote_id:'q1',request_id:'accepted-service',decision:'recusada'},{quote_id:'q2',request_id:'accepted-service',decision:'aceita'}]);
  await page.locator('#logout').click();await expect(page.locator('#quotes')).toBeEmpty();
});

async function seedContractContext(page,{provider=false,contract=false,refused=false}={}) {
  await page.evaluate(({provider,contract,refused})=>{
    const me='10000000-0000-4000-8000-000000000001',client_id=provider?'client-id':me,provider_id=provider?me:'provider-id';
    const r={id:'contract-service',client_id,provider_id,profession:'Pintor',description:'Pintura da sala',status:'aceito',city:'Manaus',state:'AM'};
    window.testState.requests.push(r);
    window.testState.quotes.push({id:'contract-quote',request_id:r.id,provider_id,amount_cents:5000,description:'Pintura da sala em dois dias',status:'proposta'});
    window.testState.decisions.push({quote_id:'contract-quote',request_id:r.id,decision:'aceita'});
    if(contract) {
      const doc={version:1,scope:'Pintura da sala em dois dias',amount_cents:5000,client:{id:client_id,name:'Cliente de teste'},provider:{id:provider_id,name:'Prestador de teste'},starts_at:new Date(Date.now()+86400000).toISOString(),ends_at:new Date(Date.now()+172800000).toISOString(),responsibilities:'Cliente fornece acesso; prestador fornece material e executa a pintura.',stages:[{title:'Entrega completa',amount_cents:5000,due_description:'Após conclusão'}]};
      window.testState.contracts.push({id:'contract-1',request_id:r.id,quote_id:'contract-quote',client_id,provider_id,version:1,document:doc,content_hash:'a'.repeat(64)});
      window.testState.contractDecisions.push({contract_id:'contract-1',actor_id:provider_id,decision:'aceito',created_at:new Date().toISOString()});
      if(refused){
        window.testState.contractDecisions.push({contract_id:'contract-1',actor_id:client_id,decision:'recusado',created_at:new Date().toISOString()});
        window.testState.contracts.push({id:'contract-2',request_id:r.id,quote_id:'contract-quote',client_id,provider_id,version:2,document:{...doc,version:2,responsibilities:'Nova versão: cliente fornece acesso; prestador executa a pintura.'},content_hash:'b'.repeat(64)});
      }
    }
  },{provider,contract,refused});
  await page.locator('#refresh').click();await page.getByRole('button',{name:'Abrir conversa'}).click();await expect(page.locator('#contractSection')).toBeVisible();
}
test('provider proposes a contract with validated stage total and snapshot',async({page})=>{
  await page.addInitScript(()=>window.testRole='prestador');await login(page);await seedContractContext(page,{provider:true});
  await page.locator('#contractStarts').fill(new Date(Date.now()+86400000).toISOString().slice(0,16));await page.locator('#contractEnds').fill(new Date(Date.now()+172800000).toISOString().slice(0,16));await page.locator('#contractResponsibilities').fill('Cliente fornece acesso; prestador fornece material e executa a pintura.');
  await page.locator('[data-stage="amount"]').fill('49,99');await page.locator('#proposeContract').click();await expect(page.locator('#status')).toContainText('soma das etapas');expect(await page.evaluate(()=>window.testState.contracts.length)).toBe(0);
  await page.locator('[data-stage="amount"]').fill('50,00');await page.locator('#proposeContract').click();await expect(page.locator('#contracts')).toContainText('Acordo — versão 1');await expect(page.locator('#contracts')).toContainText('R$ 50,00');await expect(page.locator('#contractForm')).toBeHidden();
  expect(await page.evaluate(()=>window.testState.contracts[0].document.stages[0].amount_cents)).toBe(5000);
});
test('client explicitly accepts exact contract version, separately from provider',async({page})=>{
  await login(page);await seedContractContext(page,{contract:true});const accept=page.getByRole('button',{name:'Aceitar esta versão'});await expect(accept).toBeDisabled();await page.getByRole('checkbox',{name:'Li esta versão e concordo'}).check();await accept.click();await expect(page.locator('#contracts')).toContainText('aceito por ambas as partes');await expect(page.getByRole('button',{name:'Aceitar esta versão'})).toHaveCount(0);
  const call=await page.evaluate(()=>window.testState.calls.find(c=>c.rpc==='decide_service_contract'));expect(call.args).toEqual({p_contract_id:'contract-1',p_content_hash:'a'.repeat(64),p_decision:'aceito'});
  await page.locator('#logout').click();await expect(page.locator('#contracts')).toBeEmpty();
});
test('bilaterally accepted agreement downloads a verifiable receipt',async({page})=>{
  await login(page);await seedContractContext(page,{contract:true});
  await page.evaluate(()=>{const s=window.testState,c=s.contracts[0];s.contractDecisions.push({contract_id:c.id,actor_id:c.client_id,decision:'aceito',created_at:'2026-10-19T12:01:00Z'});});
  await page.locator('#refresh').click();
  const downloadPromise=page.waitForEvent('download');await page.getByRole('button',{name:'Baixar comprovante do acordo'}).click();const download=await downloadPromise;
  expect(download.suggestedFilename()).toBe('acordo-contract-service-v1.json');
  const receipt=JSON.parse(await readFile(await download.path(),'utf8'));
  expect(receipt).toMatchObject({receipt_type:'servico_certo_agreement_acceptance',agreement:{id:'contract-1',request_id:'contract-service',version:1,content_hash:'a'.repeat(64)}});
  expect(receipt.acceptances.map(x=>x.actor_id)).toEqual(['10000000-0000-4000-8000-000000000001','provider-id']);
  expect(receipt.notice).toContain('Não é assinatura digital certificada');
  await expect(page.locator('#status')).toContainText('Guarde o arquivo em local seguro');
});
test('a revised contract requires fresh acceptance and preserves refused version',async({page})=>{
  await login(page);await seedContractContext(page,{contract:true,refused:true});await expect(page.locator('[data-contract="contract-1"]')).toContainText('Esta versão foi recusada');await expect(page.locator('[data-contract="contract-1"] button')).toHaveCount(0);
  await expect(page.locator('[data-contract="contract-2"]')).toContainText('Cliente: aguardando decisão');await expect(page.getByRole('button',{name:'Aceitar esta versão'})).toBeDisabled();await page.getByRole('button',{name:'Recusar esta versão'}).click();await expect(page.locator('[data-contract="contract-2"]')).toContainText('Esta versão foi recusada');expect(await page.evaluate(()=>window.testState.contractDecisions.filter(d=>d.contract_id==='contract-1').length)).toBe(2);
});

test('provider starts a bilaterally accepted service and requests completion',async({page})=>{
  await page.addInitScript(()=>window.testRole='prestador');await login(page);await seedContractContext(page,{provider:true,contract:true});
  await page.evaluate(()=>{const c=window.testState.contracts[0];window.testState.contractDecisions.push({contract_id:c.id,actor_id:c.client_id,decision:'aceito',created_at:new Date().toISOString()});});
  await page.locator('#refresh').click();await expect(page.getByRole('button',{name:'Iniciar serviço'})).toHaveCount(0);
  await page.getByRole('button',{name:'Estou a caminho'}).click();await expect(page.getByRole('button',{name:'Iniciar serviço'})).toHaveCount(0);
  await page.getByRole('button',{name:'Cheguei ao local'}).click();await expect(page.locator('#execution')).toContainText('Aguardando confirmação do cliente');await expect(page.getByRole('button',{name:'Iniciar serviço'})).toHaveCount(0);
  await page.evaluate(()=>{const s=window.testState,r=s.requests[0];s.executionEvents.push({request_id:r.id,actor_id:r.client_id,event_type:'chegada_confirmada_cliente',created_at:new Date().toISOString()});});
  await page.locator('#refresh').click();await page.getByRole('button',{name:'Iniciar serviço'}).click();await expect(page.locator('#execution')).toContainText('Serviço em andamento');
  await page.getByRole('button',{name:'Solicitar confirmação de conclusão'}).click();await expect(page.locator('#execution')).toContainText('Aguardando confirmação do cliente');
  expect(await page.evaluate(()=>window.testState.executionEvents.map(e=>e.event_type))).toEqual(['a_caminho','chegou_local','chegada_confirmada_cliente','iniciado','conclusao_solicitada']);
});
test('provider registers increasing progress visible in the execution timeline',async({page})=>{
  await page.addInitScript(()=>window.testRole='prestador');await login(page);await seedContractContext(page,{provider:true,contract:true});
  await page.evaluate(()=>{const s=window.testState,c=s.contracts[0],r=s.requests[0];s.contractDecisions.push({contract_id:c.id,actor_id:c.client_id,decision:'aceito',created_at:new Date().toISOString()});r.status='em_andamento';s.executionEvents.push({request_id:r.id,actor_id:r.provider_id,event_type:'iniciado',created_at:new Date().toISOString()});});
  await page.locator('#refresh').click();await page.getByLabel('Andamento do serviço').selectOption('25');await page.getByLabel('Resumo do andamento').fill('Preparação e proteção do ambiente concluídas.');await page.getByRole('button',{name:'Registrar andamento'}).click();
  await expect(page.locator('#execution')).toContainText('25% — Preparação e proteção do ambiente concluídas.');await expect(page.getByLabel('Andamento do serviço')).not.toHaveValue('25');
  await page.getByLabel('Andamento do serviço').selectOption('50');await page.getByLabel('Resumo do andamento').fill('Primeira etapa da pintura concluída.');await page.getByRole('button',{name:'Registrar andamento'}).click();
  expect(await page.evaluate(()=>window.testState.calls.filter(c=>c.rpc==='add_service_progress_update').map(c=>c.args))).toEqual([
    {p_request_id:'contract-service',p_progress_percent:25,p_note:'Preparação e proteção do ambiente concluídas.'},
    {p_request_id:'contract-service',p_progress_percent:50,p_note:'Primeira etapa da pintura concluída.'}
  ]);
});
test('client sees provider progress without receiving progress controls',async({page})=>{
  await login(page);await seedContractContext(page,{contract:true});
  await page.evaluate(()=>{const s=window.testState,r=s.requests[0];r.status='em_andamento';s.executionEvents.push({request_id:r.id,actor_id:r.provider_id,event_type:'iniciado',created_at:new Date().toISOString()});s.progressUpdates.push({request_id:r.id,provider_id:r.provider_id,progress_percent:50,note:'Primeira etapa da pintura concluída.',created_at:new Date().toISOString()});});
  await page.locator('#refresh').click();await expect(page.locator('#execution')).toContainText('50% — Primeira etapa da pintura concluída.');await expect(page.getByLabel('Andamento do serviço')).toHaveCount(0);await expect(page.getByRole('button',{name:'Registrar andamento'})).toHaveCount(0);
});
test('provider proposes a reschedule before starting the journey',async({page})=>{
  await page.addInitScript(()=>window.testRole='prestador');await login(page);await seedContractContext(page,{provider:true,contract:true});
  const proposed=new Date(Date.now()+172800000);await page.getByLabel('Nova data proposta').fill(proposed.toISOString().slice(0,16));await page.getByLabel('Motivo do reagendamento').fill('Indisponibilidade no horário inicialmente combinado.');await page.getByRole('button',{name:'Propor reagendamento'}).click();
  await expect(page.locator('#execution')).toContainText('aguardando decisão da outra parte');await expect(page.getByLabel('Nova data proposta')).toHaveCount(0);
  expect(await page.evaluate(()=>window.testState.calls.find(c=>c.rpc==='propose_service_reschedule').args)).toMatchObject({p_request_id:'contract-service',p_reason:'Indisponibilidade no horário inicialmente combinado.'});
});
test('client accepts a provider proposed date and updates the schedule',async({page})=>{
  await login(page);await seedContractContext(page,{contract:true});const proposed=new Date(Date.now()+172800000).toISOString();
  await page.evaluate(proposed=>{const s=window.testState,r=s.requests[0];s.scheduleChanges.push({id:'schedule-1',request_id:r.id,provider_id:r.provider_id,proposed_by:r.provider_id,proposed_for:proposed,reason:'Indisponibilidade no horário inicialmente combinado.',status:'pendente',created_at:new Date().toISOString(),decided_at:null});},proposed);
  await page.locator('#refresh').click();await expect(page.getByLabel('Nova data proposta')).toHaveCount(0);await page.getByRole('button',{name:'Aceitar nova data'}).click();await expect(page.locator('#execution')).toContainText('aceito pela outra parte');
  expect(await page.evaluate(()=>({date:window.testState.requests[0].scheduled_for,call:window.testState.calls.find(c=>c.rpc==='decide_service_reschedule').args}))).toEqual({date:proposed,call:{p_change_id:'schedule-1',p_decision:'aceito'}});
});
test('client proposes a reschedule and waits for the provider decision',async({page})=>{
  await login(page);await seedContractContext(page,{contract:true});const proposed=new Date(Date.now()+259200000);
  await page.getByLabel('Nova data proposta').fill(proposed.toISOString().slice(0,16));await page.getByLabel('Motivo do reagendamento').fill('Preciso ajustar a data para receber o prestador no local.');await page.getByRole('button',{name:'Propor reagendamento'}).click();
  await expect(page.locator('#execution')).toContainText('proposto por você');await expect(page.locator('#execution')).toContainText('aguardando decisão da outra parte');await expect(page.getByRole('button',{name:'Aceitar nova data'})).toHaveCount(0);
  expect(await page.evaluate(()=>window.testState.scheduleChanges[0])).toMatchObject({proposed_by:'10000000-0000-4000-8000-000000000001',reason:'Preciso ajustar a data para receber o prestador no local.',status:'pendente'});
});
test('proposer withdraws a pending reschedule and releases the journey',async({page})=>{
  await page.addInitScript(()=>window.testRole='prestador');await login(page);await seedContractContext(page,{provider:true,contract:true});
  await page.evaluate(()=>{const s=window.testState,c=s.contracts[0];s.contractDecisions.push({contract_id:c.id,actor_id:c.client_id,decision:'aceito',created_at:new Date().toISOString()});});
  await page.locator('#refresh').click();await expect(page.getByRole('button',{name:'Estou a caminho'})).toBeVisible();
  const proposed=new Date(Date.now()+259200000);await page.getByLabel('Nova data proposta').fill(proposed.toISOString().slice(0,16));await page.getByLabel('Motivo do reagendamento').fill('Preciso retirar esta proposta se a disponibilidade mudar.');await page.getByRole('button',{name:'Propor reagendamento'}).click();
  await expect(page.getByRole('button',{name:'Estou a caminho'})).toHaveCount(0);await page.getByRole('button',{name:'Retirar proposta'}).click();
  await expect(page.locator('#execution')).toContainText('retirado por você');await expect(page.getByRole('button',{name:'Estou a caminho'})).toBeVisible();
  const result=await page.evaluate(()=>({change:window.testState.scheduleChanges[0],call:window.testState.calls.find(c=>c.rpc==='cancel_service_reschedule').args}));
  expect(result.change).toMatchObject({status:'cancelado',decided_by:'10000000-0000-4000-8000-000000000001'});expect(result.call).toEqual({p_change_id:result.change.id});
});
test('provider decides a client proposal before starting the journey',async({page})=>{
  await page.addInitScript(()=>window.testRole='prestador');await login(page);await seedContractContext(page,{provider:true,contract:true});const proposed=new Date(Date.now()+259200000).toISOString();
  await page.evaluate(proposed=>{const s=window.testState,c=s.contracts[0],r=s.requests[0];s.contractDecisions.push({contract_id:c.id,actor_id:c.client_id,decision:'aceito',created_at:new Date().toISOString()});s.scheduleChanges.push({id:'schedule-client',request_id:r.id,provider_id:r.provider_id,proposed_by:r.client_id,proposed_for:proposed,reason:'Cliente precisa ajustar a data para receber o prestador.',status:'pendente',created_at:new Date().toISOString(),decided_at:null});},proposed);
  await page.locator('#refresh').click();await expect(page.getByRole('button',{name:'Estou a caminho'})).toHaveCount(0);await page.getByRole('button',{name:'Aceitar nova data'}).click();await expect(page.locator('#execution')).toContainText('aceito pela outra parte');await expect(page.getByRole('button',{name:'Estou a caminho'})).toBeVisible();
  expect(await page.evaluate(()=>window.testState.requests[0].scheduled_for)).toBe(proposed);
});
test('provider reports ordered on-the-way and arrival statuses to the client',async({page})=>{
  await page.addInitScript(()=>window.testRole='prestador');await login(page);await seedContractContext(page,{provider:true,contract:true});
  await page.evaluate(()=>{const s=window.testState,c=s.contracts[0];s.contractDecisions.push({contract_id:c.id,actor_id:c.client_id,decision:'aceito',created_at:new Date().toISOString()});});
  await page.locator('#refresh').click();await page.getByRole('button',{name:'Estou a caminho'}).click();await expect(page.locator('#execution')).toContainText('Prestador está a caminho');
  await page.getByRole('button',{name:'Cheguei ao local'}).click();await expect(page.locator('#execution')).toContainText('Aguardando confirmação do cliente');
  expect(await page.evaluate(()=>window.testState.executionEvents.map(e=>e.event_type))).toEqual(['a_caminho','chegou_local']);
  const calls=await page.evaluate(()=>window.testState.calls.filter(c=>c.rpc==='mark_provider_arrival').map(c=>c.args));
  expect(calls).toEqual([{p_request_id:'contract-service',p_event:'a_caminho'},{p_request_id:'contract-service',p_event:'chegou_local'}]);
});
test('provider updates a manual arrival estimate only while on the way',async({page})=>{
  await page.addInitScript(()=>window.testRole='prestador');await login(page);await seedContractContext(page,{provider:true,contract:true});
  await page.evaluate(()=>{const s=window.testState,c=s.contracts[0];s.contractDecisions.push({contract_id:c.id,actor_id:c.client_id,decision:'aceito',created_at:new Date().toISOString()});});
  await page.locator('#refresh').click();await expect(page.getByLabel('Previsão de chegada')).toHaveCount(0);await page.getByRole('button',{name:'Estou a caminho'}).click();
  await page.getByLabel('Previsão de chegada').selectOption('30');await page.getByRole('button',{name:'Informar previsão'}).click();await expect(page.locator('#execution')).toContainText('Previsão informada:');
  await page.getByLabel('Previsão de chegada').selectOption('45');await page.getByRole('button',{name:'Atualizar previsão'}).click();
  expect(await page.evaluate(()=>window.testState.calls.filter(c=>c.rpc==='set_provider_eta').map(c=>c.args))).toEqual([{p_request_id:'contract-service',p_minutes:30},{p_request_id:'contract-service',p_minutes:45}]);
  expect(await page.evaluate(()=>window.testState.arrivalEstimates)).toHaveLength(1);
});
test('client confirms provider arrival without receiving provider controls',async({page})=>{
  await login(page);await seedContractContext(page,{contract:true});
  await page.evaluate(()=>{const s=window.testState,c=s.contracts[0],r=s.requests[0];s.contractDecisions.push({contract_id:c.id,actor_id:c.client_id,decision:'aceito',created_at:new Date().toISOString()});s.executionEvents.push({request_id:r.id,actor_id:r.provider_id,event_type:'a_caminho',created_at:new Date().toISOString()},{request_id:r.id,actor_id:r.provider_id,event_type:'chegou_local',created_at:new Date().toISOString()});});
  await page.locator('#refresh').click();await expect(page.locator('#execution')).toContainText('Confirme somente se ele estiver no local');
  await expect(page.getByRole('button',{name:'Estou a caminho'})).toHaveCount(0);await expect(page.getByRole('button',{name:'Cheguei ao local'})).toHaveCount(0);
  await expect(page.getByRole('button',{name:'Iniciar serviço'})).toHaveCount(0);await page.getByRole('button',{name:'Confirmar chegada do prestador'}).click();
  await expect(page.locator('#execution')).toContainText('Cliente confirmou a chegada');
  expect(await page.evaluate(()=>window.testState.calls.find(c=>c.rpc==='confirm_provider_arrival').args)).toEqual({p_request_id:'contract-service'});
});
test('client sees the manual ETA without provider controls',async({page})=>{
  await login(page);await seedContractContext(page,{contract:true});
  await page.evaluate(()=>{const s=window.testState,c=s.contracts[0],r=s.requests[0];s.contractDecisions.push({contract_id:c.id,actor_id:c.client_id,decision:'aceito',created_at:new Date().toISOString()});s.executionEvents.push({request_id:r.id,actor_id:r.provider_id,event_type:'a_caminho',created_at:new Date().toISOString()});s.arrivalEstimates.push({request_id:r.id,provider_id:r.provider_id,estimated_arrival_at:new Date(Date.now()+1800000).toISOString(),updated_at:new Date().toISOString()});});
  await page.locator('#refresh').click();await expect(page.locator('#execution')).toContainText('Previsão informada:');await expect(page.getByLabel('Previsão de chegada')).toHaveCount(0);await expect(page.getByRole('button',{name:/previsão/i})).toHaveCount(0);
});

test('client requests one adjustment before confirming completion',async({page})=>{
  await login(page);await seedContractContext(page,{contract:true});
  await page.evaluate(()=>{const s=window.testState,r=s.requests.find(x=>x.id==='contract-service');r.status='em_andamento';s.executionEvents.push({request_id:r.id,actor_id:r.provider_id,event_type:'iniciado',created_at:new Date().toISOString()},{request_id:r.id,actor_id:r.provider_id,event_type:'conclusao_solicitada',created_at:new Date().toISOString()});});
  await page.locator('#refresh').click();await page.getByLabel('Ajuste necessário antes da conclusão').fill('Corrigir o acabamento próximo à janela antes da confirmação.');await page.getByRole('button',{name:'Solicitar ajuste'}).click();
  await expect(page.locator('#execution')).toContainText('Cliente solicitou um ajuste');await expect(page.getByRole('button',{name:'Confirmar serviço concluído'})).toHaveCount(0);
  expect(await page.evaluate(()=>window.testState.completionAdjustments[0])).toMatchObject({request_id:'contract-service',description:'Corrigir o acabamento próximo à janela antes da confirmação.',status:'pendente'});
});

test('provider records the requested adjustment for client review',async({page})=>{
  await page.addInitScript(()=>window.testRole='prestador');await login(page);await seedContractContext(page,{provider:true,contract:true});
  await page.evaluate(()=>{const s=window.testState,r=s.requests.find(x=>x.id==='contract-service');r.status='em_andamento';s.executionEvents.push({request_id:r.id,actor_id:r.provider_id,event_type:'iniciado',created_at:new Date().toISOString()},{request_id:r.id,actor_id:r.provider_id,event_type:'conclusao_solicitada',created_at:new Date().toISOString()});s.completionAdjustments.push({id:'adjustment-1',request_id:r.id,client_id:r.client_id,provider_id:r.provider_id,description:'Corrigir o acabamento próximo à janela antes da confirmação.',status:'pendente',provider_response:null,created_at:new Date().toISOString(),responded_at:null});});
  await page.locator('#refresh').click();await page.getByLabel('Como o ajuste foi atendido').fill('Acabamento corrigido e revisado com o cliente no local.');await page.getByRole('button',{name:'Registrar ajuste realizado'}).click();
  await expect(page.locator('#execution')).toContainText('Prestador respondeu ao ajuste');await expect(page.locator('#execution')).toContainText('Acabamento corrigido');
  expect(await page.evaluate(()=>window.testState.completionAdjustments[0])).toMatchObject({status:'respondido',provider_response:'Acabamento corrigido e revisado com o cliente no local.'});
});

test('client confirms completion and submits one immutable rating without payment claim',async({page})=>{
  await login(page);await seedContractContext(page,{contract:true});
  await page.evaluate(()=>{const s=window.testState,c=s.contracts[0],r=s.requests.find(r=>r.id==='contract-service');s.contractDecisions.push({contract_id:c.id,actor_id:c.client_id,decision:'aceito',created_at:new Date().toISOString()});r.status='em_andamento';s.executionEvents.push({request_id:r.id,actor_id:r.provider_id,event_type:'iniciado',created_at:new Date().toISOString()},{request_id:r.id,actor_id:r.provider_id,event_type:'conclusao_solicitada',created_at:new Date().toISOString()});});
  await page.locator('#refresh').click();await page.getByRole('button',{name:'Confirmar serviço concluído'}).click();await expect(page.locator('#execution')).toContainText('Nenhum pagamento ou repasse');
  await page.locator('#ratingScore').selectOption('5');await page.locator('#ratingComment').fill('Serviço bem executado');await page.locator('#saveRating').click();await expect(page.locator('#ratings')).toContainText('5/5');await expect(page.locator('#ratingForm')).toBeHidden();
  expect(await page.evaluate(()=>window.testState.ratings.map(r=>({score:r.score,comment:r.comment})))).toEqual([{score:5,comment:'Serviço bem executado'}]);
});

test('provider proposes an exact-cent service extra without creating a charge',async({page})=>{
  await page.addInitScript(()=>window.testRole='prestador');await login(page);await seedContractContext(page,{provider:true,contract:true});
  await page.evaluate(()=>{const s=window.testState,r=s.requests.find(r=>r.id==='contract-service');r.status='em_andamento';s.executionEvents.push({request_id:r.id,actor_id:r.provider_id,event_type:'iniciado',created_at:new Date().toISOString()});});
  await page.locator('#refresh').click();await page.locator('#extraAmount').fill('25,50');await page.locator('#extraDescription').fill('Pintura adicional da parede externa');await page.locator('#proposeExtra').click();
  await expect(page.locator('#status')).toContainText('Nenhuma cobrança foi criada');await expect(page.locator('#extras')).toContainText('R$ 25,50');await expect(page.locator('#extraForm')).toBeHidden();
  expect(await page.evaluate(()=>window.testState.extras.map(x=>({amount_cents:x.amount_cents,description:x.description,status:x.status})))).toEqual([{amount_cents:2550,description:'Pintura adicional da parede externa',status:'proposto'}]);
});

test('client accepts a pending extra explicitly and keeps the decision visible',async({page})=>{
  await login(page);await seedContractContext(page,{contract:true});
  await page.evaluate(()=>{const s=window.testState,r=s.requests.find(r=>r.id==='contract-service');r.status='em_andamento';s.executionEvents.push({request_id:r.id,actor_id:r.provider_id,event_type:'iniciado',created_at:new Date().toISOString()});s.extras.push({id:'extra-pending',request_id:r.id,provider_id:r.provider_id,description:'Instalação adicional de acabamento',amount_cents:3000,status:'proposto',decided_by:null,created_at:new Date().toISOString(),decided_at:null});});
  await page.locator('#refresh').click();await page.getByRole('button',{name:'Aceitar serviço extra'}).click();await expect(page.locator('#status')).toContainText('não realizou cobrança');await expect(page.locator('[data-extra="extra-pending"]')).toContainText('Aceito pelo cliente');await expect(page.getByRole('button',{name:'Recusar serviço extra'})).toHaveCount(0);
  expect(await page.evaluate(()=>window.testState.extras[0].status)).toBe('aceito');
});

test('client opens a categorized dispute without implying a decision or charge',async({page})=>{
  await login(page);await seedContractContext(page,{contract:true});
  await page.evaluate(()=>{const r=window.testState.requests.find(r=>r.id==='contract-service');r.status='em_andamento';});
  await page.locator('#refresh').click();await page.locator('#disputeCategory').selectOption('qualidade');await page.locator('#disputeDescription').fill('O acabamento ficou diferente do escopo combinado.');await page.locator('#openDispute').click();
  await expect(page.locator('#status')).toContainText('Nenhuma decisão ou cobrança');await expect(page.locator('#disputes')).toContainText('Qualidade');await expect(page.locator('#disputes')).toContainText('Aguardando manifestação');await expect(page.locator('#disputeForm')).toBeHidden();
  expect(await page.evaluate(()=>window.testState.disputes.map(d=>({category:d.category,description:d.description,status:d.status})))).toEqual([{category:'qualidade',description:'O acabamento ficou diferente do escopo combinado.',status:'aberta'}]);
});

test('other participant answers a dispute once and sees pending administrative analysis',async({page})=>{
  await login(page);await seedContractContext(page,{contract:true});
  await page.evaluate(()=>{const s=window.testState,r=s.requests.find(r=>r.id==='contract-service');r.status='em_andamento';s.disputes.push({id:'dispute-open',request_id:r.id,opened_by:r.provider_id,category:'prazo',description:'O prazo precisa ser revisto pelas partes envolvidas.',status:'aberta',response_by:null,response_body:null,created_at:new Date().toISOString(),responded_at:null});});
  await page.locator('#refresh').click();await page.locator('#disputeResponse').fill('O cliente informa que manteve o acesso na data combinada.');await page.locator('#respondDispute').click();
  await expect(page.locator('#status')).toContainText('depende de análise administrativa');await expect(page.locator('[data-dispute="dispute-open"]')).toContainText('O cliente informa');await expect(page.locator('[data-dispute="dispute-open"]')).toContainText('ainda não há decisão administrativa');await expect(page.locator('#disputeResponseForm')).toBeHidden();
  expect(await page.evaluate(()=>window.testState.disputes[0].status)).toBe('respondida');
});

test('provider proposes a pre-quote inspection without creating a charge',async({page})=>{
  await page.addInitScript(()=>window.testRole='prestador');await login(page);await seedAcceptedService(page);
  const future=new Date(Date.now()+172800000).toISOString().slice(0,16);
  await page.locator('#inspectionPurpose').fill('Avaliar a estrutura antes de elaborar o orçamento completo.');await page.locator('#inspectionScheduled').fill(future);await page.locator('#inspectionFee').fill('75,00');await page.locator('#proposeInspection').click();
  await expect(page.locator('#status')).toContainText('Nenhuma cobrança ou confirmação');await expect(page.locator('#inspections')).toContainText('R$ 75,00');await expect(page.locator('#inspections')).toContainText('Aguardando decisão');await expect(page.locator('#inspectionForm')).toBeHidden();
  expect(await page.evaluate(()=>window.testState.inspections.map(i=>({fee_cents:i.fee_cents,purpose:i.purpose,status:i.status})))).toEqual([{fee_cents:7500,purpose:'Avaliar a estrutura antes de elaborar o orçamento completo.',status:'proposta'}]);
});

test('client accepts inspection proposal as pending payment, not confirmed appointment',async({page})=>{
  await login(page);await seedAcceptedService(page);
  await page.evaluate(()=>{const s=window.testState,r=s.requests.find(r=>r.id==='accepted-service');s.inspections.push({id:'inspection-pending',request_id:r.id,provider_id:r.provider_id,purpose:'Avaliar o local antes de elaborar o orçamento completo.',scheduled_for:new Date(Date.now()+172800000).toISOString(),fee_cents:7500,status:'proposta',decided_by:null,created_at:new Date().toISOString(),decided_at:null});});
  await page.locator('#refresh').click();await page.getByRole('button',{name:'Aceitar proposta de vistoria'}).click();await expect(page.locator('#status')).toContainText('só será confirmada após integração de pagamento em sandbox');await expect(page.locator('[data-inspection="inspection-pending"]')).toContainText('pagamento e confirmação ainda pendentes');await expect(page.getByRole('button',{name:'Recusar proposta de vistoria'})).toHaveCount(0);
  expect(await page.evaluate(()=>window.testState.inspections[0].status)).toBe('aceita_pendente_pagamento');
});
