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
test('authorized user copies a visible service code after modern clipboard permission is denied',async({page})=>{
  await page.addInitScript(()=>{
    Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async()=>{window.modernClipboardAttempts=(window.modernClipboardAttempts||0)+1;throw new DOMException('Permission denied','NotAllowedError');}}});
    document.execCommand=command=>{if(command!=='copy')return false;window.copiedServiceCode=document.querySelector('textarea[readonly]')?.value;return true;};
  });
  await login(page);await page.evaluate(()=>window.testState.requests.push({id:'service-reference-123',profession:'Eletricista',description:'Serviço com código para atendimento',status:'aceito',city:'Manaus',state:'AM',created_at:new Date().toISOString()}));
  const original=await page.evaluate(()=>JSON.stringify(window.testState.requests));await page.locator('#refresh').click();const card=page.locator('[data-request="service-reference-123"]');
  await expect(card.locator('.service-code')).toHaveText('Código: service-reference-123');await card.getByRole('button',{name:'Copiar código'}).click();
  await expect(page.locator('#status')).toHaveText('Código do serviço copiado: service-reference-123');expect(await page.evaluate(()=>window.modernClipboardAttempts)).toBe(1);expect(await page.evaluate(()=>window.copiedServiceCode)).toBe('service-reference-123');expect(await page.evaluate(()=>JSON.stringify(window.testState.requests))).toBe(original);
});
test('authenticated service link locates only an authorized request and can be copied',async({page})=>{
  await page.addInitScript(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async value=>{window.copiedServiceLink=value;}}}));
  await page.goto('/auth-teste/?servico=linked-service-123');await page.locator('#email').fill('teste@example.invalid');await page.locator('#password').fill('validpass123');await page.locator('#submit').click();await expect(page.locator('#workspace')).toBeVisible();
  await expect(page.locator('#requestSearch')).toHaveValue('linked-service-123');await page.evaluate(()=>window.testState.requests.push(
    {id:'linked-service-123',profession:'Eletricista',description:'Serviço autorizado pelo link',status:'aceito',city:'Manaus',state:'AM',created_at:new Date().toISOString()},
    {id:'different-service',profession:'Pintor',description:'Outro serviço autorizado',status:'aceito',city:'Manaus',state:'AM',created_at:new Date().toISOString()},
    {id:'description-match',profession:'Pedreiro',description:'Referência textual linked-service-123',status:'aceito',city:'Manaus',state:'AM',created_at:new Date().toISOString()}
  ));
  const original=await page.evaluate(()=>JSON.stringify(window.testState.requests));await page.locator('#refresh').click();await expect(page.locator('#requests .service')).toHaveCount(1);
  const card=page.locator('[data-request="linked-service-123"]');await expect(card).toBeVisible();await expect(page.locator('[data-request="different-service"]')).toHaveCount(0);await expect(page.locator('[data-request="description-match"]')).toHaveCount(0);const callsBeforeCopy=await page.evaluate(()=>window.testState.calls.length);await card.getByRole('button',{name:'Copiar link'}).click();
  await expect(page.locator('#status')).toHaveText('Link do serviço copiado. O acesso continua protegido pela conta.');expect(await page.evaluate(()=>window.copiedServiceLink)).toBe('http://127.0.0.1:4173/auth-teste/?servico=linked-service-123');expect(await page.evaluate(()=>window.testState.calls.length)).toBe(callsBeforeCopy);expect(await page.evaluate(()=>JSON.stringify(window.testState.requests))).toBe(original);
  await page.locator('#clearRequestSearch').click();await expect(page).toHaveURL('http://127.0.0.1:4173/auth-teste/');await expect(page.locator('#requestSearch')).toHaveValue('');await expect(page.locator('#requests .service')).toHaveCount(3);expect(await page.evaluate(()=>JSON.stringify(window.testState.requests))).toBe(original);
});
test('authenticated service link hides whether an unavailable code exists',async({page})=>{
  await page.goto('/auth-teste/?servico=not-authorized-here');await page.locator('#email').fill('teste@example.invalid');await page.locator('#password').fill('validpass123');await page.locator('#submit').click();await expect(page.locator('#workspace')).toBeVisible();
  await page.evaluate(()=>window.testState.requests.push({id:'authorized-service',profession:'Eletricista',description:'Serviço disponível nesta conta',status:'aceito',city:'Manaus',state:'AM',created_at:new Date().toISOString()}));const original=await page.evaluate(()=>JSON.stringify(window.testState.requests));await page.locator('#refresh').click();
  await expect(page.locator('#requests .service')).toHaveCount(0);await expect(page.locator('#requests')).toHaveText('Serviço não encontrado nesta conta. Confira o link ou entre com a conta participante.');expect(await page.evaluate(()=>JSON.stringify(window.testState.requests))).toBe(original);
});
test('authorized user copies a safe service summary without private description',async({page})=>{
  await page.addInitScript(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async value=>{window.copiedServiceSummary=value;}}}));await login(page);
  await page.evaluate(()=>window.testState.requests.push({id:'summary-service',profession:'Eletricista',description:'Detalhe privado que não deve ser copiado',status:'aceito',city:'Manaus',state:'AM',is_urgent:true,scheduled_for:'2026-10-26T15:00:00.000Z',created_at:'2026-10-24T20:00:00.000Z'}));
  const original=await page.evaluate(()=>JSON.stringify(window.testState.requests));await page.locator('#refresh').click();const callsBeforeCopy=await page.evaluate(()=>window.testState.calls.length);await page.locator('[data-request="summary-service"]').getByRole('button',{name:'Copiar resumo'}).click();await expect(page.locator('#status')).toHaveText('Resumo do serviço copiado sem descrição ou dados dos participantes.');
  const copied=await page.evaluate(()=>window.copiedServiceSummary),dates=await page.evaluate(()=>({created:new Date('2026-10-24T20:00:00.000Z').toLocaleString('pt-BR'),scheduled:new Date('2026-10-26T15:00:00.000Z').toLocaleString('pt-BR')}));expect(copied).toBe(`Serviço Certo\nCódigo: summary-service\nProfissão: Eletricista\nSituação: Profissional aceitou\nRegião: Manaus / AM\nUrgente: Sim\nSolicitado em: ${dates.created}\nHorário preferido: ${dates.scheduled}\nLink autenticado: http://127.0.0.1:4173/auth-teste/?servico=summary-service`);expect(copied).not.toContain('Detalhe privado');expect(await page.evaluate(()=>window.testState.calls.length)).toBe(callsBeforeCopy);expect(await page.evaluate(()=>JSON.stringify(window.testState.requests))).toBe(original);
});
test('authorized user previews and hides the safe service summary',async({page})=>{
  await login(page);await page.evaluate(()=>window.testState.requests.push({id:'summary-preview',profession:'Encanador',description:'Telefone e endereço privados não devem aparecer',status:'aceito',city:'Manaus',state:'AM',is_urgent:false,created_at:'2026-10-24T23:00:00.000Z'}));
  const original=await page.evaluate(()=>JSON.stringify(window.testState.requests));await page.locator('#refresh').click();const callsBeforePreview=await page.evaluate(()=>window.testState.calls.length),card=page.locator('[data-request="summary-preview"]'),toggle=card.locator('[aria-controls="request-summary-summary-preview"]'),preview=card.locator('#request-summary-summary-preview');
  await expect(preview).toBeHidden();await expect(toggle).toHaveText('Ver resumo');await expect(toggle).toHaveAttribute('aria-expanded','false');await toggle.click();await expect(preview).toBeVisible();await expect(toggle).toHaveText('Ocultar resumo');await expect(toggle).toHaveAttribute('aria-expanded','true');await expect(preview).toContainText('Código: summary-preview');await expect(preview).toContainText('Situação: Profissional aceitou');await expect(preview).toContainText('Região: Manaus / AM');await expect(preview).not.toContainText('Telefone e endereço privados');
  await toggle.click();await expect(preview).toBeHidden();await expect(toggle).toHaveText('Ver resumo');await expect(toggle).toHaveAttribute('aria-expanded','false');expect(await page.evaluate(()=>window.testState.calls.length)).toBe(callsBeforePreview);expect(await page.evaluate(()=>JSON.stringify(window.testState.requests))).toBe(original);
});
test('authorized user downloads the safe service summary as text',async({page})=>{
  await login(page);await page.evaluate(()=>window.testState.requests.push({id:'summary-download',profession:'Pintor',description:'Endereço e detalhes privados não devem sair no arquivo',status:'em_andamento',city:'Boa Vista',state:'RR',is_urgent:false,scheduled_for:null,created_at:'2026-10-24T21:00:00.000Z'}));
  const original=await page.evaluate(()=>JSON.stringify(window.testState.requests));await page.locator('#refresh').click();const callsBeforeDownload=await page.evaluate(()=>window.testState.calls.length),downloadPromise=page.waitForEvent('download');await page.locator('[data-request="summary-download"]').getByRole('button',{name:'Baixar resumo'}).click();const download=await downloadPromise;
  expect(download.suggestedFilename()).toBe('servico-summary-download-resumo.txt');const content=await readFile(await download.path(),'utf8'),created=await page.evaluate(()=>new Date('2026-10-24T21:00:00.000Z').toLocaleString('pt-BR'));expect(content).toBe(`Serviço Certo\nCódigo: summary-download\nProfissão: Pintor\nSituação: Em andamento\nRegião: Boa Vista / RR\nUrgente: Não\nSolicitado em: ${created}\nLink autenticado: http://127.0.0.1:4173/auth-teste/?servico=summary-download`);expect(content).not.toContain('Endereço e detalhes privados');await expect(page.locator('#status')).toHaveText('Resumo seguro preparado em servico-summary-download-resumo.txt.');expect(await page.evaluate(()=>window.testState.calls.length)).toBe(callsBeforeDownload);expect(await page.evaluate(()=>JSON.stringify(window.testState.requests))).toBe(original);
});
test('authorized user shares the safe service summary with the device',async({page})=>{
  await page.addInitScript(()=>Object.defineProperty(navigator,'share',{configurable:true,value:async data=>{window.sharedServiceSummary=data;}}));await login(page);await page.evaluate(()=>window.testState.requests.push({id:'summary-share',profession:'Eletricista',description:'Informação privada fora do compartilhamento',status:'aceito',city:'Manaus',state:'AM',is_urgent:true,created_at:'2026-10-24T22:00:00.000Z'}));
  const original=await page.evaluate(()=>JSON.stringify(window.testState.requests));await page.locator('#refresh').click();const callsBeforeShare=await page.evaluate(()=>window.testState.calls.length);await page.locator('[data-request="summary-share"]').getByRole('button',{name:'Compartilhar resumo'}).click();await expect(page.locator('#status')).toHaveText('Resumo seguro enviado ao compartilhamento do aparelho.');
  const shared=await page.evaluate(()=>window.sharedServiceSummary),created=await page.evaluate(()=>new Date('2026-10-24T22:00:00.000Z').toLocaleString('pt-BR'));expect(shared).toEqual({title:'Serviço Certo — Eletricista',text:`Serviço Certo\nCódigo: summary-share\nProfissão: Eletricista\nSituação: Profissional aceitou\nRegião: Manaus / AM\nUrgente: Sim\nSolicitado em: ${created}\nLink autenticado: http://127.0.0.1:4173/auth-teste/?servico=summary-share`});expect(shared.text).not.toContain('Informação privada');expect(await page.evaluate(()=>window.testState.calls.length)).toBe(callsBeforeShare);expect(await page.evaluate(()=>JSON.stringify(window.testState.requests))).toBe(original);
});
test('authorized user shares the safe service summary as a text file when supported',async({page})=>{
  await page.addInitScript(()=>{Object.defineProperty(navigator,'canShare',{configurable:true,value:data=>data.files?.length===1});Object.defineProperty(navigator,'share',{configurable:true,value:async data=>{const file=data.files[0];window.sharedServiceSummaryFile={title:data.title,text:data.text,name:file.name,type:file.type,content:await file.text()};}});});await login(page);await page.evaluate(()=>window.testState.requests.push({id:'summary-file-share',profession:'Encanador',description:'Telefone privado fora do arquivo',status:'em_andamento',city:'Manaus',state:'AM',is_urgent:false,created_at:'2026-10-25T04:30:00.000Z'}));
  const original=await page.evaluate(()=>JSON.stringify(window.testState.requests));await page.locator('#refresh').click();const callsBeforeShare=await page.evaluate(()=>window.testState.calls.length);await page.locator('[data-request="summary-file-share"]').getByRole('button',{name:'Compartilhar resumo'}).click();await expect(page.locator('#status')).toHaveText('Arquivo de resumo seguro enviado ao compartilhamento do aparelho.');
  const shared=await page.evaluate(()=>window.sharedServiceSummaryFile);expect(shared).toMatchObject({title:'Serviço Certo — Encanador',text:'Resumo seguro do serviço em arquivo de texto.',name:'servico-summary-file-share-resumo.txt',type:'text/plain;charset=utf-8'});expect(shared.content).toContain('Código: summary-file-share');expect(shared.content).toContain('Situação: Em andamento');expect(shared.content).not.toContain('Telefone privado');expect(await page.evaluate(()=>window.testState.calls.length)).toBe(callsBeforeShare);expect(await page.evaluate(()=>JSON.stringify(window.testState.requests))).toBe(original);
});
test('file sharing rejection retries the safe summary as text',async({page})=>{
  await page.addInitScript(()=>{window.shareAttempts=[];Object.defineProperty(navigator,'canShare',{configurable:true,value:data=>data.files?.length===1});Object.defineProperty(navigator,'share',{configurable:true,value:async data=>{window.shareAttempts.push({hasFiles:Boolean(data.files?.length),text:data.text});if(data.files?.length)throw new TypeError('File target unavailable');window.sharedTextAfterFileRejection=data.text;}});});await login(page);await page.evaluate(()=>window.testState.requests.push({id:'summary-file-retry',profession:'Eletricista',description:'Endereço privado fora das tentativas',status:'aceito',city:'Boa Vista',state:'RR',is_urgent:true,created_at:'2026-10-25T05:40:00.000Z'}));
  const original=await page.evaluate(()=>JSON.stringify(window.testState.requests));await page.locator('#refresh').click();const callsBeforeShare=await page.evaluate(()=>window.testState.calls.length);await page.locator('[data-request="summary-file-retry"]').getByRole('button',{name:'Compartilhar resumo'}).click();await expect(page.locator('#status')).toHaveText('Resumo seguro enviado ao compartilhamento do aparelho.');
  const result=await page.evaluate(()=>({attempts:window.shareAttempts,text:window.sharedTextAfterFileRejection}));expect(result.attempts).toHaveLength(2);expect(result.attempts[0]).toMatchObject({hasFiles:true,text:'Resumo seguro do serviço em arquivo de texto.'});expect(result.attempts[1].hasFiles).toBe(false);expect(result.text).toContain('Código: summary-file-retry');expect(result.text).not.toContain('Endereço privado');expect(await page.evaluate(()=>window.testState.calls.length)).toBe(callsBeforeShare);expect(await page.evaluate(()=>JSON.stringify(window.testState.requests))).toBe(original);
});
test('native sharing rejection copies the safe summary automatically',async({page})=>{
  await page.addInitScript(()=>{Object.defineProperty(navigator,'share',{configurable:true,value:async()=>{throw new TypeError('Share target unavailable');}});Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async value=>{window.copiedAfterShareRejection=value;}}});});await login(page);await page.evaluate(()=>window.testState.requests.push({id:'summary-share-rejected',profession:'Eletricista',description:'Contato privado não pode ser copiado',status:'aceito',city:'Boa Vista',state:'RR',is_urgent:false,created_at:'2026-10-25T07:30:00.000Z'}));
  const original=await page.evaluate(()=>JSON.stringify(window.testState.requests));await page.locator('#refresh').click();const callsBeforeShare=await page.evaluate(()=>window.testState.calls.length);await page.locator('[data-request="summary-share-rejected"]').getByRole('button',{name:'Compartilhar resumo'}).click();await expect(page.locator('#status')).toHaveText('Compartilhamento recusado. Resumo seguro copiado.');const copied=await page.evaluate(()=>window.copiedAfterShareRejection);expect(copied).toContain('Código: summary-share-rejected');expect(copied).toContain('Região: Boa Vista / RR');expect(copied).not.toContain('Contato privado');expect(await page.evaluate(()=>window.testState.calls.length)).toBe(callsBeforeShare);expect(await page.evaluate(()=>JSON.stringify(window.testState.requests))).toBe(original);
});
test('native sharing cancellation does not copy without user intent',async({page})=>{
  await page.addInitScript(()=>{Object.defineProperty(navigator,'share',{configurable:true,value:async()=>{throw new DOMException('Cancelled','AbortError');}});Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async value=>{window.copiedAfterShareCancellation=value;}}});});await login(page);await page.evaluate(()=>window.testState.requests.push({id:'summary-share-cancelled',profession:'Pintor',description:'Descrição privada fora da ação',status:'aceito',city:'Manaus',state:'AM',is_urgent:false,created_at:'2026-10-25T07:35:00.000Z'}));
  const original=await page.evaluate(()=>JSON.stringify(window.testState.requests));await page.locator('#refresh').click();const callsBeforeShare=await page.evaluate(()=>window.testState.calls.length);await page.locator('[data-request="summary-share-cancelled"]').getByRole('button',{name:'Compartilhar resumo'}).click();await expect(page.locator('#status')).toHaveText('Compartilhamento cancelado.');expect(await page.evaluate(()=>window.copiedAfterShareCancellation)).toBeUndefined();expect(await page.evaluate(()=>window.testState.calls.length)).toBe(callsBeforeShare);expect(await page.evaluate(()=>JSON.stringify(window.testState.requests))).toBe(original);
});
test('sharing falls back to copying the safe summary when native sharing is unavailable',async({page})=>{
  await page.addInitScript(()=>{Object.defineProperty(navigator,'share',{configurable:true,value:undefined});Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async value=>{window.sharedSummaryFallback=value;}}});});await login(page);await page.evaluate(()=>window.testState.requests.push({id:'summary-share-fallback',profession:'Pintor',description:'Descrição privada não pode ser copiada',status:'concluido',city:'Manaus',state:'AM',is_urgent:false,created_at:'2026-10-24T22:10:00.000Z'}));
  const original=await page.evaluate(()=>JSON.stringify(window.testState.requests));await page.locator('#refresh').click();const callsBeforeShare=await page.evaluate(()=>window.testState.calls.length);await page.locator('[data-request="summary-share-fallback"]').getByRole('button',{name:'Compartilhar resumo'}).click();await expect(page.locator('#status')).toHaveText('Compartilhamento indisponível. Resumo seguro copiado.');const copied=await page.evaluate(()=>window.sharedSummaryFallback);expect(copied).toContain('Código: summary-share-fallback');expect(copied).toContain('Situação: Concluído');expect(copied).not.toContain('Descrição privada');expect(await page.evaluate(()=>window.testState.calls.length)).toBe(callsBeforeShare);expect(await page.evaluate(()=>JSON.stringify(window.testState.requests))).toBe(original);
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
test('client filters services without unread messages and combines the category with search',async({page})=>{
  await login(page);
  await page.evaluate(()=>{
    const now=Date.now(),client='10000000-0000-4000-8000-000000000001';
    window.testState.requests.push(
      {id:'without-unread-electrician',client_id:client,provider_id:'provider-id',profession:'Eletricista',description:'Revisão sem mensagem nova',status:'aceito',city:'Manaus',state:'AM',created_at:new Date(now-3000).toISOString()},
      {id:'without-unread-painter',client_id:client,provider_id:'provider-id',profession:'Pintor',description:'Pintura já conferida',status:'concluido',city:'Manaus',state:'AM',created_at:new Date(now-2000).toISOString()},
      {id:'with-unread-electrician',client_id:client,provider_id:'provider-id',profession:'Eletricista',description:'Instalação com mensagem nova',status:'aceito',city:'Manaus',state:'AM',created_at:new Date(now-1000).toISOString()}
    );
    window.testState.messages.push({id:'without-unread-filter-message',request_id:'with-unread-electrician',sender_id:'provider-id',body:'Preciso confirmar o horário.',created_at:new Date(now).toISOString()});
  });
  await page.locator('#refresh').click();
  await expect(page.locator('#requestFilter option[value="withoutUnread"]')).toHaveText('Sem mensagens novas (2)');
  await page.locator('#requestFilter').selectOption('withoutUnread');
  await expect(page.locator('#requests .service')).toHaveCount(2);
  await expect(page.locator('#requests')).not.toContainText('Instalação com mensagem nova');
  await page.locator('#requestSearch').fill('eletricista');await page.locator('#searchRequests').click();
  await expect(page.locator('#requests .service')).toHaveCount(1);
  await expect(page.locator('#requests')).toContainText('Revisão sem mensagem nova');
  expect(await page.evaluate(()=>window.testState.requests.map(r=>r.id))).toEqual(['without-unread-electrician','without-unread-painter','with-unread-electrician']);
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
test('client filters future preferred times without implying confirmed appointments',async({page})=>{
  await login(page);await page.evaluate(()=>{const hour=60*60*1000;window.testState.requests.push(
    {id:'upcoming-electrician',profession:'Eletricista',description:'Instalação com preferência futura',status:'aberto',city:'Manaus',state:'AM',scheduled_for:new Date(Date.now()+24*hour).toISOString(),created_at:new Date(Date.now()-hour).toISOString()},
    {id:'upcoming-painter',profession:'Pintor',description:'Pintura com preferência futura',status:'aceito',city:'Manaus',state:'AM',scheduled_for:new Date(Date.now()+48*hour).toISOString(),created_at:new Date(Date.now()-2*hour).toISOString()},
    {id:'past-preference',profession:'Eletricista',description:'Preferência já passada',status:'concluido',city:'Manaus',state:'AM',scheduled_for:new Date(Date.now()-hour).toISOString(),created_at:new Date(Date.now()-3*hour).toISOString()},
    {id:'invalid-preference',profession:'Pedreiro',description:'Preferência inválida',status:'aberto',city:'Manaus',state:'AM',scheduled_for:'data-invalida',created_at:new Date(Date.now()-4*hour).toISOString()},
    {id:'no-preference',profession:'Encanador',description:'Serviço sem preferência',status:'aberto',city:'Manaus',state:'AM',scheduled_for:null,created_at:new Date(Date.now()-5*hour).toISOString()}
  );});
  const original=await page.evaluate(()=>JSON.stringify(window.testState.requests));await page.locator('#refresh').click();
  await page.locator('#requestFilter').selectOption('upcoming');await expect(page.locator('#requestFilter option[value="upcoming"]')).toHaveText('Horário preferido futuro (2)');
  await expect(page.locator('#requests .service')).toHaveCount(2);await expect(page.locator('#requests')).toContainText('Instalação com preferência futura');await expect(page.locator('#requests')).toContainText('Pintura com preferência futura');await expect(page.locator('#requests')).not.toContainText('Preferência já passada');
  await page.locator('#requestSearch').fill('eletricista');await page.locator('#searchRequests').click();await expect(page.locator('#requests .service')).toHaveCount(1);await expect(page.locator('#requests .service')).toHaveAttribute('data-request','upcoming-electrician');
  await expect(page.locator('#requests')).toContainText('Horário preferido:');expect(await page.evaluate(()=>JSON.stringify(window.testState.requests))).toBe(original);
});
test('client filters past preferred times without implying confirmed appointments',async({page})=>{
  await login(page);await page.evaluate(()=>{const hour=60*60*1000;window.testState.requests.push(
    {id:'past-preferred-electrician',profession:'Eletricista',description:'Revisão com preferência anterior',status:'aceito',city:'Manaus',state:'AM',created_at:new Date().toISOString(),scheduled_for:new Date(Date.now()-hour).toISOString()},
    {id:'past-preferred-painter',profession:'Pintor',description:'Pintura com preferência anterior',status:'concluido',city:'Manaus',state:'AM',created_at:new Date(Date.now()-1000).toISOString(),scheduled_for:new Date(Date.now()-2*hour).toISOString()},
    {id:'future-preferred-plumber',profession:'Encanador',description:'Reparo com preferência futura',status:'aberto',city:'Manaus',state:'AM',created_at:new Date(Date.now()-2000).toISOString(),scheduled_for:new Date(Date.now()+hour).toISOString()},
    {id:'invalid-past-preferred',profession:'Pedreiro',description:'Preferência inválida',status:'cancelado',city:'Manaus',state:'AM',created_at:new Date(Date.now()-3000).toISOString(),scheduled_for:'data-invalida'},
    {id:'missing-past-preferred',profession:'Marceneiro',description:'Sem preferência',status:'cancelado',city:'Manaus',state:'AM',created_at:new Date(Date.now()-4000).toISOString(),scheduled_for:null}
  );});
  const original=await page.evaluate(()=>JSON.stringify(window.testState.requests));await page.locator('#refresh').click();
  await page.locator('#requestFilter').selectOption('pastPreferred');await expect(page.locator('#requestFilter option[value="pastPreferred"]')).toHaveText('Horário preferido passado (2)');
  await expect(page.locator('#requests .service')).toHaveCount(2);await expect(page.locator('#requests')).toContainText('Revisão com preferência anterior');await expect(page.locator('#requests')).toContainText('Pintura com preferência anterior');
  await page.locator('#requestSearch').fill('eletricista');await page.locator('#searchRequests').click();await expect(page.locator('#requests .service')).toHaveCount(1);await expect(page.locator('#requests .service')).toHaveAttribute('data-request','past-preferred-electrician');
  expect(await page.locator('#requests').innerText()).not.toContain('Agendado');expect(await page.evaluate(()=>JSON.stringify(window.testState.requests))).toBe(original);
});
test('client filters preferred times for the local day without implying confirmed appointments',async({page})=>{
  await login(page);await page.evaluate(()=>{const todayMorning=new Date(),todayEvening=new Date(),yesterday=new Date(),tomorrow=new Date();
    todayMorning.setHours(8,30,0,0);todayEvening.setHours(18,15,0,0);yesterday.setDate(yesterday.getDate()-1);yesterday.setHours(23,59,0,0);tomorrow.setDate(tomorrow.getDate()+1);tomorrow.setHours(0,1,0,0);
    window.testState.requests.push(
      {id:'preferred-today-electrician',profession:'Eletricista',description:'Revisão com preferência hoje cedo',status:'aberto',city:'Manaus',state:'AM',created_at:new Date().toISOString(),scheduled_for:todayMorning.toISOString()},
      {id:'preferred-today-painter',profession:'Pintor',description:'Pintura com preferência hoje à tarde',status:'aceito',city:'Manaus',state:'AM',created_at:new Date(Date.now()-1000).toISOString(),scheduled_for:todayEvening.toISOString()},
      {id:'preferred-yesterday',profession:'Pedreiro',description:'Preferência de ontem',status:'concluido',city:'Manaus',state:'AM',created_at:new Date(Date.now()-2000).toISOString(),scheduled_for:yesterday.toISOString()},
      {id:'preferred-tomorrow',profession:'Encanador',description:'Preferência de amanhã',status:'aberto',city:'Manaus',state:'AM',created_at:new Date(Date.now()-3000).toISOString(),scheduled_for:tomorrow.toISOString()},
      {id:'preferred-invalid-today',profession:'Marceneiro',description:'Preferência inválida',status:'cancelado',city:'Manaus',state:'AM',created_at:new Date(Date.now()-4000).toISOString(),scheduled_for:'data-invalida'}
    );
  });
  const original=await page.evaluate(()=>JSON.stringify(window.testState.requests));await page.locator('#refresh').click();
  await page.locator('#requestFilter').selectOption('preferredToday');await expect(page.locator('#requestFilter option[value="preferredToday"]')).toHaveText('Horário preferido hoje (2)');
  await expect(page.locator('#requests .service')).toHaveCount(2);await expect(page.locator('#requests')).toContainText('Revisão com preferência hoje cedo');await expect(page.locator('#requests')).toContainText('Pintura com preferência hoje à tarde');await expect(page.locator('#requests')).not.toContainText('Preferência de ontem');await expect(page.locator('#requests')).not.toContainText('Preferência de amanhã');
  await page.locator('#requestSearch').fill('eletricista');await page.locator('#searchRequests').click();await expect(page.locator('#requests .service')).toHaveCount(1);await expect(page.locator('#requests .service')).toHaveAttribute('data-request','preferred-today-electrician');
  await expect(page.locator('#requests')).toContainText('Horário preferido:');expect(await page.locator('#requests').innerText()).not.toContain('Agendado');expect(await page.evaluate(()=>JSON.stringify(window.testState.requests))).toBe(original);
});
test('client filters preferred times for tomorrow in the local day without changing requests',async({page})=>{
  await login(page);await page.evaluate(()=>{const todayEvening=new Date(),tomorrowMorning=new Date(),tomorrowEvening=new Date(),dayAfterTomorrow=new Date();
    todayEvening.setHours(23,59,0,0);tomorrowMorning.setDate(tomorrowMorning.getDate()+1);tomorrowMorning.setHours(0,1,0,0);tomorrowEvening.setDate(tomorrowEvening.getDate()+1);tomorrowEvening.setHours(22,30,0,0);dayAfterTomorrow.setDate(dayAfterTomorrow.getDate()+2);dayAfterTomorrow.setHours(0,0,0,0);
    window.testState.requests.push(
      {id:'preferred-tomorrow-electrician',profession:'Eletricista',description:'Revisão com preferência amanhã cedo',status:'aberto',city:'Manaus',state:'AM',created_at:new Date().toISOString(),scheduled_for:tomorrowMorning.toISOString()},
      {id:'preferred-tomorrow-painter',profession:'Pintor',description:'Pintura com preferência amanhã à noite',status:'aceito',city:'Manaus',state:'AM',created_at:new Date(Date.now()-1000).toISOString(),scheduled_for:tomorrowEvening.toISOString()},
      {id:'preferred-today-limit',profession:'Pedreiro',description:'Preferência ainda hoje',status:'concluido',city:'Manaus',state:'AM',created_at:new Date(Date.now()-2000).toISOString(),scheduled_for:todayEvening.toISOString()},
      {id:'preferred-after-tomorrow',profession:'Encanador',description:'Preferência depois de amanhã',status:'aberto',city:'Manaus',state:'AM',created_at:new Date(Date.now()-3000).toISOString(),scheduled_for:dayAfterTomorrow.toISOString()},
      {id:'preferred-invalid-tomorrow',profession:'Marceneiro',description:'Preferência inválida',status:'cancelado',city:'Manaus',state:'AM',created_at:new Date(Date.now()-4000).toISOString(),scheduled_for:'data-invalida'}
    );
  });
  const original=await page.evaluate(()=>JSON.stringify(window.testState.requests));await page.locator('#refresh').click();
  await page.locator('#requestFilter').selectOption('preferredTomorrow');await expect(page.locator('#requestFilter option[value="preferredTomorrow"]')).toHaveText('Horário preferido amanhã (2)');
  await expect(page.locator('#requests .service')).toHaveCount(2);await expect(page.locator('#requests')).toContainText('Revisão com preferência amanhã cedo');await expect(page.locator('#requests')).toContainText('Pintura com preferência amanhã à noite');await expect(page.locator('#requests')).not.toContainText('Preferência ainda hoje');await expect(page.locator('#requests')).not.toContainText('Preferência depois de amanhã');
  await page.locator('#requestSearch').fill('eletricista');await page.locator('#searchRequests').click();await expect(page.locator('#requests .service')).toHaveCount(1);await expect(page.locator('#requests .service')).toHaveAttribute('data-request','preferred-tomorrow-electrician');
  await expect(page.locator('#requests')).toContainText('Horário preferido:');expect(await page.locator('#requests').innerText()).not.toContain('Agendado');expect(await page.evaluate(()=>JSON.stringify(window.testState.requests))).toBe(original);
});
test('client filters preferred times in the next seven days without changing requests',async({page})=>{
  await login(page);await page.evaluate(()=>{const hour=60*60*1000,day=24*hour;window.testState.requests.push(
    {id:'preferred-week-electrician',profession:'Eletricista',description:'Revisão com preferência em uma hora',status:'aberto',city:'Manaus',state:'AM',created_at:new Date().toISOString(),scheduled_for:new Date(Date.now()+hour).toISOString()},
    {id:'preferred-week-painter',profession:'Pintor',description:'Pintura com preferência em seis dias',status:'aceito',city:'Manaus',state:'AM',created_at:new Date(Date.now()-1000).toISOString(),scheduled_for:new Date(Date.now()+6*day).toISOString()},
    {id:'preferred-after-week',profession:'Encanador',description:'Preferência depois da janela',status:'aberto',city:'Manaus',state:'AM',created_at:new Date(Date.now()-2000).toISOString(),scheduled_for:new Date(Date.now()+7*day+hour).toISOString()},
    {id:'preferred-week-past',profession:'Pedreiro',description:'Preferência já passada',status:'concluido',city:'Manaus',state:'AM',created_at:new Date(Date.now()-3000).toISOString(),scheduled_for:new Date(Date.now()-hour).toISOString()},
    {id:'preferred-week-invalid',profession:'Marceneiro',description:'Preferência inválida',status:'cancelado',city:'Manaus',state:'AM',created_at:new Date(Date.now()-4000).toISOString(),scheduled_for:'data-invalida'}
  );});
  const original=await page.evaluate(()=>JSON.stringify(window.testState.requests));await page.locator('#refresh').click();
  await page.locator('#requestFilter').selectOption('preferredWeek');await expect(page.locator('#requestFilter option[value="preferredWeek"]')).toHaveText('Horário preferido nos próximos 7 dias (2)');
  await expect(page.locator('#requests .service')).toHaveCount(2);await expect(page.locator('#requests')).toContainText('Revisão com preferência em uma hora');await expect(page.locator('#requests')).toContainText('Pintura com preferência em seis dias');await expect(page.locator('#requests')).not.toContainText('Preferência depois da janela');await expect(page.locator('#requests')).not.toContainText('Preferência já passada');
  await page.locator('#requestSearch').fill('eletricista');await page.locator('#searchRequests').click();await expect(page.locator('#requests .service')).toHaveCount(1);await expect(page.locator('#requests .service')).toHaveAttribute('data-request','preferred-week-electrician');
  await expect(page.locator('#requests')).toContainText('Horário preferido:');expect(await page.locator('#requests').innerText()).not.toContain('Agendado');expect(await page.evaluate(()=>JSON.stringify(window.testState.requests))).toBe(original);
});
test('client filters preferred times after seven days without changing requests',async({page})=>{
  await login(page);await page.evaluate(()=>{const hour=60*60*1000,day=24*hour;window.testState.requests.push(
    {id:'preferred-later-electrician',profession:'Eletricista',description:'Revisão com preferência em oito dias',status:'aberto',city:'Manaus',state:'AM',created_at:new Date().toISOString(),scheduled_for:new Date(Date.now()+8*day).toISOString()},
    {id:'preferred-later-painter',profession:'Pintor',description:'Pintura com preferência em dez dias',status:'aceito',city:'Manaus',state:'AM',created_at:new Date(Date.now()-1000).toISOString(),scheduled_for:new Date(Date.now()+10*day).toISOString()},
    {id:'preferred-inside-week',profession:'Encanador',description:'Preferência ainda dentro da janela',status:'aberto',city:'Manaus',state:'AM',created_at:new Date(Date.now()-2000).toISOString(),scheduled_for:new Date(Date.now()+7*day-hour).toISOString()},
    {id:'preferred-later-past',profession:'Pedreiro',description:'Preferência já passada',status:'concluido',city:'Manaus',state:'AM',created_at:new Date(Date.now()-3000).toISOString(),scheduled_for:new Date(Date.now()-hour).toISOString()},
    {id:'preferred-later-invalid',profession:'Marceneiro',description:'Preferência inválida',status:'cancelado',city:'Manaus',state:'AM',created_at:new Date(Date.now()-4000).toISOString(),scheduled_for:'data-invalida'}
  );});
  const original=await page.evaluate(()=>JSON.stringify(window.testState.requests));await page.locator('#refresh').click();
  await page.locator('#requestFilter').selectOption('preferredLater');await expect(page.locator('#requestFilter option[value="preferredLater"]')).toHaveText('Horário preferido após 7 dias (2)');
  await expect(page.locator('#requests .service')).toHaveCount(2);await expect(page.locator('#requests')).toContainText('Revisão com preferência em oito dias');await expect(page.locator('#requests')).toContainText('Pintura com preferência em dez dias');await expect(page.locator('#requests')).not.toContainText('Preferência ainda dentro da janela');await expect(page.locator('#requests')).not.toContainText('Preferência já passada');
  await page.locator('#requestSearch').fill('eletricista');await page.locator('#searchRequests').click();await expect(page.locator('#requests .service')).toHaveCount(1);await expect(page.locator('#requests .service')).toHaveAttribute('data-request','preferred-later-electrician');
  await expect(page.locator('#requests')).toContainText('Horário preferido:');expect(await page.locator('#requests').innerText()).not.toContain('Agendado');expect(await page.evaluate(()=>JSON.stringify(window.testState.requests))).toBe(original);
});
test('client filters services without a preferred time without changing requests',async({page})=>{
  await login(page);await page.evaluate(()=>window.testState.requests.push(
    {id:'without-preferred-electrician',profession:'Eletricista',description:'Revisão sem preferência definida',status:'aberto',city:'Manaus',state:'AM',created_at:new Date().toISOString(),scheduled_for:null},
    {id:'without-preferred-painter',profession:'Pintor',description:'Pintura sem preferência definida',status:'concluido',city:'Manaus',state:'AM',created_at:new Date(Date.now()-1000).toISOString()},
    {id:'with-preferred-electrician',profession:'Eletricista',description:'Instalação com preferência definida',status:'aceito',city:'Manaus',state:'AM',created_at:new Date(Date.now()-2000).toISOString(),scheduled_for:new Date(Date.now()+60*60*1000).toISOString()},
    {id:'invalid-preferred-plumber',profession:'Encanador',description:'Preferência preenchida mas inválida',status:'cancelado',city:'Manaus',state:'AM',created_at:new Date(Date.now()-3000).toISOString(),scheduled_for:'data-invalida'}
  ));
  const original=await page.evaluate(()=>JSON.stringify(window.testState.requests));await page.locator('#refresh').click();
  await page.locator('#requestFilter').selectOption('withoutPreferred');await expect(page.locator('#requestFilter option[value="withoutPreferred"]')).toHaveText('Sem horário preferido (2)');
  await expect(page.locator('#requests .service')).toHaveCount(2);await expect(page.locator('#requests')).toContainText('Revisão sem preferência definida');await expect(page.locator('#requests')).toContainText('Pintura sem preferência definida');await expect(page.locator('#requests')).not.toContainText('Instalação com preferência definida');
  await page.locator('#requestSearch').fill('eletricista');await page.locator('#searchRequests').click();await expect(page.locator('#requests .service')).toHaveCount(1);await expect(page.locator('#requests .service')).toHaveAttribute('data-request','without-preferred-electrician');
  await expect(page.locator('#requests')).not.toContainText('Horário preferido:');expect(await page.evaluate(()=>JSON.stringify(window.testState.requests))).toBe(original);
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

test('client separates accepted services from services already in progress',async({page})=>{
  await login(page);await page.evaluate(()=>window.testState.requests.push(
    {id:'stage-accepted-electrician',profession:'Eletricista',description:'Instalação aceita aguardando início',status:'aceito',city:'Manaus',state:'AM',created_at:'2026-10-22T12:00:00.000Z'},
    {id:'stage-accepted-painter',profession:'Pintor',description:'Pintura aceita aguardando início',status:'aceito',city:'Manaus',state:'AM',created_at:'2026-10-21T12:00:00.000Z'},
    {id:'stage-progress-electrician',profession:'Eletricista',description:'Instalação elétrica em execução',status:'em_andamento',city:'Manaus',state:'AM',created_at:'2026-10-20T12:00:00.000Z'},
    {id:'stage-completed',profession:'Pintor',description:'Pintura já concluída',status:'concluido',city:'Manaus',state:'AM',created_at:'2026-10-19T12:00:00.000Z'}
  ));
  const original=await page.evaluate(()=>JSON.stringify(window.testState.requests));await page.locator('#refresh').click();
  await expect(page.locator('#requestFilter option[value="accepted"]')).toHaveText('Aceitos (2)');await expect(page.locator('#requestFilter option[value="inProgress"]')).toHaveText('Em andamento (1)');
  await page.locator('#requestFilter').selectOption('accepted');await expect(page.locator('#requests .service')).toHaveCount(2);await expect(page.locator('#requests')).not.toContainText('Instalação elétrica em execução');
  await page.locator('#requestSearch').fill('eletricista');await page.locator('#searchRequests').click();await expect(page.locator('#requests .service')).toHaveCount(1);await expect(page.locator('#requests .service')).toHaveAttribute('data-request','stage-accepted-electrician');
  await page.locator('#requestSearch').fill('');await page.locator('#searchRequests').click();await page.locator('#requestFilter').selectOption('inProgress');await expect(page.locator('#requests .service')).toHaveCount(1);await expect(page.locator('#requests .service')).toHaveAttribute('data-request','stage-progress-electrician');
  expect(await page.evaluate(()=>JSON.stringify(window.testState.requests))).toBe(original);
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

test('client filters cancelled services without mixing completed history',async({page})=>{
  await login(page);await page.evaluate(()=>window.testState.requests.push(
    {id:'cancelled-electrician',profession:'Eletricista',description:'Instalação cancelada',status:'cancelado',city:'Manaus',state:'AM',created_at:'2026-10-21T12:00:00.000Z'},
    {id:'cancelled-painter',profession:'Pintor',description:'Pintura cancelada pelo cliente',status:'cancelado',city:'Manaus',state:'AM',created_at:'2026-10-20T12:00:00.000Z'},
    {id:'completed-painter',profession:'Pintor',description:'Pintura concluída',status:'concluido',city:'Manaus',state:'AM',created_at:'2026-10-19T12:00:00.000Z'}
  ));
  await page.locator('#refresh').click();await expect(page.locator('#requestFilter option[value="cancelled"]')).toHaveText('Cancelados (2)');await page.locator('#requestFilter').selectOption('cancelled');
  await expect(page.locator('#requests .service')).toHaveCount(2);await expect(page.locator('#requests')).not.toContainText('Pintura concluída');
  await page.locator('#requestSearch').fill('pintor');await page.locator('#searchRequests').click();await expect(page.locator('#requests .service')).toHaveCount(1);await expect(page.locator('#requests')).toContainText('Pintura cancelada pelo cliente');
  expect(await page.evaluate(()=>window.testState.requests.map(r=>r.id))).toEqual(['cancelled-electrician','cancelled-painter','completed-painter']);
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

test('client locates an authorized service by its code without changing requests',async({page})=>{
  await login(page);await page.evaluate(()=>window.testState.requests.push(
    {id:'service-code-8f31',profession:'Eletricista',description:'Revisar instalação da cozinha',status:'aberto',city:'Manaus',state:'AM',created_at:new Date().toISOString()},
    {id:'service-code-42ac',profession:'Eletricista',description:'Revisar instalação da sala',status:'aceito',city:'Manaus',state:'AM',created_at:new Date(Date.now()-1000).toISOString()}
  ));
  const original=await page.evaluate(()=>window.testState.requests.map(r=>r.id));await page.locator('#refresh').click();
  await expect(page.locator('label[for="requestSearch"]')).toHaveText('Buscar por código, profissão, descrição, região, situação ou data da solicitação/preferência');
  await page.locator('#requestSearch').fill('8F31');await page.locator('#searchRequests').click();
  await expect(page.locator('#requests .service')).toHaveCount(1);await expect(page.locator('#requests .service')).toHaveAttribute('data-request','service-code-8f31');
  await expect(page.locator('#requests')).toContainText('Código: service-code-8f31');await expect(page.locator('#requests')).not.toContainText('Código: service-code-42ac');
  expect(await page.evaluate(()=>window.testState.requests.map(r=>r.id))).toEqual(original);
});

test('client searches authorized services by city or state without changing requests',async({page})=>{
  await login(page);await page.evaluate(()=>window.testState.requests.push(
    {id:'region-sao-paulo',profession:'Eletricista',description:'Revisar instalação residencial',status:'aberto',city:'São Paulo',state:'SP',created_at:new Date().toISOString()},
    {id:'region-boa-vista',profession:'Eletricista',description:'Revisar instalação residencial',status:'aceito',city:'Boa Vista',state:'RR',created_at:new Date(Date.now()-1000).toISOString()}
  ));
  const original=await page.evaluate(()=>window.testState.requests.map(r=>r.id));await page.locator('#refresh').click();
  await expect(page.locator('label[for="requestSearch"]')).toHaveText('Buscar por código, profissão, descrição, região, situação ou data da solicitação/preferência');
  await page.locator('#requestSearch').fill('sao paulo');await page.locator('#searchRequests').click();await expect(page.locator('#requests .service')).toHaveCount(1);await expect(page.locator('#requests .service')).toHaveAttribute('data-request','region-sao-paulo');
  await page.locator('#requestSearch').fill('RR');await page.locator('#searchRequests').click();await expect(page.locator('#requests .service')).toHaveCount(1);await expect(page.locator('#requests .service')).toHaveAttribute('data-request','region-boa-vista');
  expect(await page.evaluate(()=>window.testState.requests.map(r=>r.id))).toEqual(original);
});

test('client searches authorized services by exact status without changing requests',async({page})=>{
  await login(page);await page.evaluate(()=>window.testState.requests.push(
    {id:'status-accepted',profession:'Eletricista',description:'Revisar instalação residencial',status:'aceito',city:'Manaus',state:'AM',created_at:new Date().toISOString()},
    {id:'status-progress',profession:'Eletricista',description:'Revisar instalação residencial',status:'em_andamento',city:'Manaus',state:'AM',created_at:new Date(Date.now()-1000).toISOString()},
    {id:'status-completed',profession:'Eletricista',description:'Revisar instalação residencial',status:'concluido',city:'Manaus',state:'AM',created_at:new Date(Date.now()-2000).toISOString()}
  ));
  const original=await page.evaluate(()=>window.testState.requests.map(r=>r.id));await page.locator('#refresh').click();
  await page.locator('#requestSearch').fill('aceito');await page.locator('#searchRequests').click();await expect(page.locator('#requests .service')).toHaveCount(1);await expect(page.locator('#requests .service')).toHaveAttribute('data-request','status-accepted');
  await page.locator('#requestSearch').fill('em andamento');await page.locator('#searchRequests').click();await expect(page.locator('#requests .service')).toHaveCount(1);await expect(page.locator('#requests .service')).toHaveAttribute('data-request','status-progress');
  await page.locator('#requestSearch').fill('concluido');await page.locator('#searchRequests').click();await expect(page.locator('#requests .service')).toHaveCount(1);await expect(page.locator('#requests .service')).toHaveAttribute('data-request','status-completed');
  expect(await page.evaluate(()=>window.testState.requests.map(r=>r.id))).toEqual(original);
});

test('client sees when an authorized service was requested without changing it',async({page})=>{
  await login(page);await page.evaluate(()=>window.testState.requests.push(
    {id:'requested-at-service',profession:'Eletricista',description:'Revisar instalação residencial',status:'aceito',city:'Manaus',state:'AM',created_at:'2026-10-19T12:30:00.000Z'}
  ));
  const original=await page.evaluate(()=>JSON.stringify(window.testState.requests));await page.locator('#refresh').click();
  const requestedAt=page.locator('[data-request="requested-at-service"] time.request-created');
  await expect(requestedAt).toBeVisible();await expect(requestedAt).toHaveAttribute('datetime','2026-10-19T12:30:00.000Z');await expect(requestedAt).toContainText('Solicitado em');
  expect(await page.evaluate(()=>JSON.stringify(window.testState.requests))).toBe(original);
});

test('client searches authorized services by request date without changing them',async({page})=>{
  await login(page);await page.evaluate(()=>window.testState.requests.push(
    {id:'date-october-19',profession:'Eletricista',description:'Revisão residencial',status:'aceito',city:'Manaus',state:'AM',created_at:'2026-10-19T12:30:00.000Z'},
    {id:'date-october-20',profession:'Pintor',description:'Pintura residencial',status:'concluido',city:'Manaus',state:'AM',created_at:'2026-10-20T12:30:00.000Z'}
  ));
  const original=await page.evaluate(()=>JSON.stringify(window.testState.requests));await page.locator('#refresh').click();
  await page.locator('#requestSearch').fill('19/10/2026');await page.locator('#searchRequests').click();await expect(page.locator('#requests .service')).toHaveCount(1);await expect(page.locator('#requests .service')).toHaveAttribute('data-request','date-october-19');
  await page.locator('#requestSearch').fill('2026-10-20');await page.locator('#searchRequests').click();await expect(page.locator('#requests .service')).toHaveCount(1);await expect(page.locator('#requests .service')).toHaveAttribute('data-request','date-october-20');
  expect(await page.evaluate(()=>JSON.stringify(window.testState.requests))).toBe(original);
});

test('client searches authorized services by preferred date without changing them',async({page})=>{
  await login(page);await page.evaluate(()=>window.testState.requests.push(
    {id:'preferred-april-15',profession:'Eletricista',description:'Revisão residencial',status:'aceito',city:'Manaus',state:'AM',created_at:'2026-10-19T12:30:00.000Z',scheduled_for:'2030-04-15T18:00:00.000Z'},
    {id:'preferred-may-20',profession:'Pintor',description:'Pintura residencial',status:'concluido',city:'Manaus',state:'AM',created_at:'2026-10-20T12:30:00.000Z',scheduled_for:'2030-05-20T18:00:00.000Z'},
    {id:'preferred-invalid',profession:'Pedreiro',description:'Registro com preferência inválida',status:'cancelado',city:'Manaus',state:'AM',created_at:'2026-10-21T12:30:00.000Z',scheduled_for:'data-invalida'}
  ));
  const original=await page.evaluate(()=>JSON.stringify(window.testState.requests));await page.locator('#refresh').click();
  const localizedPreferredDate=await page.evaluate(()=>new Date('2030-04-15T18:00:00.000Z').toLocaleDateString('pt-BR'));
  await page.locator('#requestSearch').fill(localizedPreferredDate);await page.locator('#searchRequests').click();await expect(page.locator('#requests .service')).toHaveCount(1);await expect(page.locator('#requests .service')).toHaveAttribute('data-request','preferred-april-15');
  await page.locator('#requestFilter').selectOption('scheduled');await page.locator('#requestSearch').fill('2030-05-20');await page.locator('#searchRequests').click();await expect(page.locator('#requests .service')).toHaveCount(1);await expect(page.locator('#requests .service')).toHaveAttribute('data-request','preferred-may-20');
  expect(await page.evaluate(()=>JSON.stringify(window.testState.requests))).toBe(original);
});

test('client filters services requested in the last seven days without changing them',async({page})=>{
  await login(page);await page.evaluate(()=>{const day=24*60*60*1000;window.testState.requests.push(
    {id:'recent-request',profession:'Eletricista',description:'Revisão elétrica recente',status:'aceito',city:'Manaus',state:'AM',created_at:new Date(Date.now()-6*day).toISOString()},
    {id:'old-request',profession:'Eletricista',description:'Revisão elétrica antiga',status:'concluido',city:'Manaus',state:'AM',created_at:new Date(Date.now()-8*day).toISOString()},
    {id:'undated-request',profession:'Pintor',description:'Registro legado sem data',status:'cancelado',city:'Manaus',state:'AM'}
  );});
  const original=await page.evaluate(()=>JSON.stringify(window.testState.requests));await page.locator('#refresh').click();
  await page.locator('#requestFilter').selectOption('recent');await expect(page.locator('#requestFilter option[value="recent"]')).toHaveText('Solicitados nos últimos 7 dias (1)');
  await expect(page.locator('#requests .service')).toHaveCount(1);await expect(page.locator('#requests .service')).toHaveAttribute('data-request','recent-request');
  await page.locator('#requestSearch').fill('eletricista');await page.locator('#searchRequests').click();await expect(page.locator('#requests .service')).toHaveCount(1);
  expect(await page.evaluate(()=>JSON.stringify(window.testState.requests))).toBe(original);
});

test('client filters services requested in the last thirty days without changing them',async({page})=>{
  await login(page);await page.evaluate(()=>{const day=24*60*60*1000;window.testState.requests.push(
    {id:'month-electrician',profession:'Eletricista',description:'Revisão solicitada neste mês',status:'aceito',city:'Manaus',state:'AM',created_at:new Date(Date.now()-29*day).toISOString()},
    {id:'month-painter',profession:'Pintor',description:'Pintura solicitada recentemente',status:'concluido',city:'Manaus',state:'AM',created_at:new Date(Date.now()-10*day).toISOString()},
    {id:'older-than-month',profession:'Eletricista',description:'Revisão antiga',status:'cancelado',city:'Manaus',state:'AM',created_at:new Date(Date.now()-31*day).toISOString()},
    {id:'future-month',profession:'Encanador',description:'Registro futuro inválido',status:'aberto',city:'Manaus',state:'AM',created_at:new Date(Date.now()+day).toISOString()},
    {id:'undated-month',profession:'Pedreiro',description:'Registro legado sem data',status:'cancelado',city:'Manaus',state:'AM'}
  );});
  const original=await page.evaluate(()=>JSON.stringify(window.testState.requests));await page.locator('#refresh').click();
  await page.locator('#requestFilter').selectOption('month');await expect(page.locator('#requestFilter option[value="month"]')).toHaveText('Solicitados nos últimos 30 dias (2)');
  await expect(page.locator('#requests .service')).toHaveCount(2);await expect(page.locator('#requests')).toContainText('Revisão solicitada neste mês');await expect(page.locator('#requests')).toContainText('Pintura solicitada recentemente');
  await page.locator('#requestSearch').fill('eletricista');await page.locator('#searchRequests').click();await expect(page.locator('#requests .service')).toHaveCount(1);await expect(page.locator('#requests .service')).toHaveAttribute('data-request','month-electrician');
  expect(await page.evaluate(()=>JSON.stringify(window.testState.requests))).toBe(original);
});

test('client filters services requested more than thirty days ago without changing them',async({page})=>{
  await login(page);await page.evaluate(()=>{const day=24*60*60*1000;window.testState.requests.push(
    {id:'older-electrician',profession:'Eletricista',description:'Revisão solicitada há dois meses',status:'concluido',city:'Manaus',state:'AM',created_at:new Date(Date.now()-60*day).toISOString()},
    {id:'older-painter',profession:'Pintor',description:'Pintura solicitada há trinta e um dias',status:'cancelado',city:'Manaus',state:'AM',created_at:new Date(Date.now()-31*day).toISOString()},
    {id:'within-month',profession:'Eletricista',description:'Revisão solicitada recentemente',status:'aceito',city:'Manaus',state:'AM',created_at:new Date(Date.now()-29*day).toISOString()},
    {id:'future-older',profession:'Encanador',description:'Registro futuro inválido',status:'aberto',city:'Manaus',state:'AM',created_at:new Date(Date.now()+day).toISOString()},
    {id:'undated-older',profession:'Pedreiro',description:'Registro legado sem data',status:'cancelado',city:'Manaus',state:'AM'}
  );});
  const original=await page.evaluate(()=>JSON.stringify(window.testState.requests));await page.locator('#refresh').click();
  await page.locator('#requestFilter').selectOption('older');await expect(page.locator('#requestFilter option[value="older"]')).toHaveText('Solicitados há mais de 30 dias (2)');
  await expect(page.locator('#requests .service')).toHaveCount(2);await expect(page.locator('#requests')).toContainText('Revisão solicitada há dois meses');await expect(page.locator('#requests')).toContainText('Pintura solicitada há trinta e um dias');
  await page.locator('#requestSearch').fill('eletricista');await page.locator('#searchRequests').click();await expect(page.locator('#requests .service')).toHaveCount(1);await expect(page.locator('#requests .service')).toHaveAttribute('data-request','older-electrician');
  expect(await page.evaluate(()=>JSON.stringify(window.testState.requests))).toBe(original);
});

test('client filters services requested today and combines the result with search',async({page})=>{
  await login(page);await page.evaluate(()=>{const now=new Date(),todayStart=new Date(now);todayStart.setHours(0,0,0,0);const today=new Date(todayStart.getTime()+Math.max(1,Math.floor((now.getTime()-todayStart.getTime())/2))),yesterday=new Date(todayStart.getTime()-1);window.testState.requests.push(
    {id:'today-electrician',profession:'Eletricista',description:'Revisão solicitada hoje',status:'aceito',city:'Manaus',state:'AM',created_at:today.toISOString()},
    {id:'yesterday-painter',profession:'Pintor',description:'Pintura solicitada ontem',status:'concluido',city:'Manaus',state:'AM',created_at:yesterday.toISOString()},
    {id:'today-undated',profession:'Encanador',description:'Registro antigo sem data',status:'cancelado',city:'Manaus',state:'AM'}
  );});
  const original=await page.evaluate(()=>JSON.stringify(window.testState.requests));await page.locator('#refresh').click();
  await page.locator('#requestFilter').selectOption('today');await expect(page.locator('#requestFilter option[value="today"]')).toHaveText('Solicitados hoje (1)');
  await expect(page.locator('#requests .service')).toHaveCount(1);await expect(page.locator('#requests .service')).toHaveAttribute('data-request','today-electrician');
  await page.locator('#requestSearch').fill('eletricista');await page.locator('#searchRequests').click();await expect(page.locator('#requests .service')).toHaveCount(1);
  await page.locator('#requestSearch').fill('pintor');await page.locator('#searchRequests').click();await expect(page.locator('#requests .service')).toHaveCount(0);
  expect(await page.evaluate(()=>JSON.stringify(window.testState.requests))).toBe(original);
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

test('client orders services alphabetically by profession with recent ties first',async({page})=>{
  await login(page);await page.evaluate(()=>window.testState.requests.push(
    {id:'profession-painter',profession:'Pintor',description:'Pintura residencial',status:'concluido',city:'Manaus',state:'AM',created_at:'2026-10-20T12:00:00.000Z'},
    {id:'profession-electrician-old',profession:'Eletricista',description:'Instalação antiga',status:'aceito',city:'Manaus',state:'AM',created_at:'2026-10-19T12:00:00.000Z'},
    {id:'profession-butcher',profession:'Açougueiro',description:'Preparação profissional',status:'aberto',city:'Manaus',state:'AM',created_at:'2026-10-18T12:00:00.000Z'},
    {id:'profession-electrician-new',profession:'Eletricista',description:'Instalação recente',status:'aberto',city:'Manaus',state:'AM',created_at:'2026-10-21T12:00:00.000Z'}
  ));
  const original=await page.evaluate(()=>JSON.stringify(window.testState.requests)),order=()=>page.locator('#requests .service').evaluateAll(cards=>cards.map(card=>card.dataset.request));await page.locator('#refresh').click();
  await page.locator('#requestSort').selectOption('profession');expect(await order()).toEqual(['profession-butcher','profession-electrician-new','profession-electrician-old','profession-painter']);
  await page.locator('#requestFilter').selectOption('active');expect(await order()).toEqual(['profession-butcher','profession-electrician-new','profession-electrician-old']);
  await page.locator('#requestSearch').fill('eletricista');await page.locator('#searchRequests').click();expect(await order()).toEqual(['profession-electrician-new','profession-electrician-old']);
  expect(await page.evaluate(()=>JSON.stringify(window.testState.requests))).toBe(original);
});

test('client orders services alphabetically by city and state with recent ties first',async({page})=>{
  await login(page);await page.evaluate(()=>window.testState.requests.push(
    {id:'region-sao-luis',profession:'Pintor',description:'Pintura maranhense',status:'cancelado',city:'São Luís',state:'MA',created_at:'2026-10-23T12:00:00.000Z'},
    {id:'region-manaus-old',profession:'Eletricista',description:'Instalação antiga em Manaus',status:'aceito',city:'Manaus',state:'AM',created_at:'2026-10-19T12:00:00.000Z'},
    {id:'region-belem',profession:'Encanador',description:'Reparo paraense',status:'concluido',city:'Belém',state:'PA',created_at:'2026-10-22T12:00:00.000Z'},
    {id:'region-acailandia',profession:'Pedreiro',description:'Obra maranhense',status:'aberto',city:'Açailândia',state:'MA',created_at:'2026-10-18T12:00:00.000Z'},
    {id:'region-manaus-new',profession:'Eletricista',description:'Instalação recente em Manaus',status:'aberto',city:'Manaus',state:'AM',created_at:'2026-10-21T12:00:00.000Z'}
  ));
  const original=await page.evaluate(()=>JSON.stringify(window.testState.requests)),order=()=>page.locator('#requests .service').evaluateAll(cards=>cards.map(card=>card.dataset.request));await page.locator('#refresh').click();
  await page.locator('#requestSort').selectOption('region');expect(await order()).toEqual(['region-acailandia','region-belem','region-manaus-new','region-manaus-old','region-sao-luis']);
  await page.locator('#requestFilter').selectOption('active');expect(await order()).toEqual(['region-acailandia','region-manaus-new','region-manaus-old']);
  await page.locator('#requestSearch').fill('eletricista');await page.locator('#searchRequests').click();expect(await order()).toEqual(['region-manaus-new','region-manaus-old']);
  expect(await page.evaluate(()=>JSON.stringify(window.testState.requests))).toBe(original);
});

test('client orders conversations by unread message count with recent ties first',async({page})=>{
  await login(page);await page.evaluate(()=>{
    const client='10000000-0000-4000-8000-000000000001',requests=[
      {id:'unread-sort-none',client_id:client,provider_id:'provider-id',profession:'Pintor',description:'Conversa sem novidade',status:'concluido',city:'Manaus',state:'AM',created_at:'2026-10-23T12:00:00.000Z'},
      {id:'unread-sort-one',client_id:client,provider_id:'provider-id',profession:'Encanador',description:'Conversa com uma novidade',status:'aceito',city:'Manaus',state:'AM',created_at:'2026-10-22T12:00:00.000Z'},
      {id:'unread-sort-old',client_id:client,provider_id:'provider-id',profession:'Eletricista',description:'Conversa antiga com duas novidades',status:'aceito',city:'Manaus',state:'AM',created_at:'2026-10-19T12:00:00.000Z'},
      {id:'unread-sort-new',client_id:client,provider_id:'provider-id',profession:'Eletricista',description:'Conversa recente com duas novidades',status:'aberto',city:'Manaus',state:'AM',created_at:'2026-10-21T12:00:00.000Z'}
    ];
    window.testState.requests.push(...requests);
    for(const request of requests.slice(1))window.testState.messages.push({id:'message-'+request.id+'-1',request_id:request.id,sender_id:'provider-id',body:'Mensagem recebida',created_at:'2026-10-23T13:00:00.000Z'});
    for(const request of requests.slice(2))window.testState.messages.push({id:'message-'+request.id+'-2',request_id:request.id,sender_id:'provider-id',body:'Outra mensagem recebida',created_at:'2026-10-23T13:01:00.000Z'});
  });
  const original=await page.evaluate(()=>JSON.stringify(window.testState.requests)),order=()=>page.locator('#requests .service').evaluateAll(cards=>cards.map(card=>card.dataset.request));await page.locator('#refresh').click();
  await page.locator('#requestSort').selectOption('unread');expect(await order()).toEqual(['unread-sort-new','unread-sort-old','unread-sort-one','unread-sort-none']);
  await page.locator('#requestFilter').selectOption('active');expect(await order()).toEqual(['unread-sort-new','unread-sort-old','unread-sort-one']);
  await page.locator('#requestSearch').fill('eletricista');await page.locator('#searchRequests').click();expect(await order()).toEqual(['unread-sort-new','unread-sort-old']);
  expect(await page.evaluate(()=>JSON.stringify(window.testState.requests))).toBe(original);
});

test('client orders services by workflow stage with recent ties first',async({page})=>{
  await login(page);await page.evaluate(()=>window.testState.requests.push(
    {id:'status-completed',profession:'Pintor',description:'Etapa concluída',status:'concluido',city:'Manaus',state:'AM',created_at:'2026-10-22T12:00:00.000Z'},
    {id:'status-open-old',profession:'Eletricista',description:'Chamado antigo',status:'aberto',city:'Manaus',state:'AM',created_at:'2026-10-19T12:00:00.000Z'},
    {id:'status-progress',profession:'Encanador',description:'Etapa em andamento',status:'em_andamento',city:'Manaus',state:'AM',created_at:'2026-10-21T12:00:00.000Z'},
    {id:'status-accepted',profession:'Eletricista',description:'Etapa aceita',status:'aceito',city:'Manaus',state:'AM',created_at:'2026-10-20T12:00:00.000Z'},
    {id:'status-cancelled',profession:'Pedreiro',description:'Etapa cancelada',status:'cancelado',city:'Manaus',state:'AM',created_at:'2026-10-23T12:00:00.000Z'},
    {id:'status-open-new',profession:'Eletricista',description:'Chamado recente',status:'aberto',city:'Manaus',state:'AM',created_at:'2026-10-22T13:00:00.000Z'}
  ));
  const original=await page.evaluate(()=>JSON.stringify(window.testState.requests)),order=()=>page.locator('#requests .service').evaluateAll(cards=>cards.map(card=>card.dataset.request));await page.locator('#refresh').click();
  await page.locator('#requestSort').selectOption('status');expect(await order()).toEqual(['status-open-new','status-open-old','status-accepted','status-progress','status-completed','status-cancelled']);
  await page.locator('#requestFilter').selectOption('active');expect(await order()).toEqual(['status-open-new','status-open-old','status-accepted','status-progress']);
  await page.locator('#requestSearch').fill('eletricista');await page.locator('#searchRequests').click();expect(await order()).toEqual(['status-open-new','status-open-old','status-accepted']);
  expect(await page.evaluate(()=>JSON.stringify(window.testState.requests))).toBe(original);
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

test('client orders valid preferred times from farthest to nearest and keeps invalid or absent values last',async({page})=>{
  await login(page);await page.evaluate(()=>window.testState.requests.push(
    {id:'schedule-middle',profession:'Pintor',description:'Pintura com preferência intermediária',status:'concluido',city:'Manaus',state:'AM',scheduled_for:'2026-10-25T14:00:00.000Z',created_at:'2026-10-21T12:00:00.000Z'},
    {id:'schedule-invalid',profession:'Marceneiro',description:'Reparo com preferência inválida',status:'aberto',city:'Manaus',state:'AM',scheduled_for:'data-invalida',created_at:'2026-10-24T12:00:00.000Z'},
    {id:'schedule-absent',profession:'Eletricista',description:'Instalação sem horário indicado',status:'aberto',city:'Manaus',state:'AM',scheduled_for:null,created_at:'2026-10-23T12:00:00.000Z'},
    {id:'schedule-farthest',profession:'Encanador',description:'Reparo com preferência mais distante',status:'aceito',city:'Manaus',state:'AM',scheduled_for:'2026-11-05T09:00:00.000Z',created_at:'2026-10-20T12:00:00.000Z'},
    {id:'schedule-nearest',profession:'Pedreiro',description:'Reparo com preferência mais próxima',status:'aceito',city:'Manaus',state:'AM',scheduled_for:'2026-10-23T09:00:00.000Z',created_at:'2026-10-22T12:00:00.000Z'}
  ));
  const order=()=>page.locator('#requests .service').evaluateAll(cards=>cards.map(card=>card.dataset.request));
  await page.locator('#refresh').click();await page.locator('#requestSort').selectOption('scheduleDesc');
  expect(await order()).toEqual(['schedule-farthest','schedule-middle','schedule-nearest','schedule-invalid','schedule-absent']);
  await page.locator('#requestSearch').fill('reparo');await page.locator('#searchRequests').click();
  expect(await order()).toEqual(['schedule-farthest','schedule-nearest','schedule-invalid']);
  expect(await page.evaluate(()=>window.testState.requests.map(r=>r.id))).toEqual(['schedule-middle','schedule-invalid','schedule-absent','schedule-farthest','schedule-nearest']);
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

test('client progressively loads a long service list without changing requests',async({page})=>{
  await login(page);await page.evaluate(()=>{
    for(let index=0;index<15;index++)window.testState.requests.push({id:`page-${index}`,client_id:'10000000-0000-4000-8000-000000000001',provider_id:'provider-id',profession:index%2?'Pintor':'Eletricista',description:`Serviço acumulado ${index}`,status:index<12?'aceito':'concluido',city:'Manaus',state:'AM',created_at:new Date(Date.UTC(2026,9,22,12,index)).toISOString()});
  });
  const original=await page.evaluate(()=>window.testState.requests.map(r=>r.id));await page.locator('#refresh').click();
  await expect(page.locator('#requests .service')).toHaveCount(10);await expect(page.locator('#requestSummary')).toContainText('Exibindo 10 de 15 correspondentes');await expect(page.locator('#requestMore')).toHaveText('Mostrar mais (5 restantes)');
  await page.locator('#requestMore').click();await expect(page.locator('#requests .service')).toHaveCount(15);await expect(page.locator('#requestMore')).toBeHidden();
  await page.locator('#requestFilter').selectOption('completed');await expect(page.locator('#requests .service')).toHaveCount(3);await expect(page.locator('#requestMore')).toBeHidden();
  await page.locator('#requestFilter').selectOption('all');await expect(page.locator('#requests .service')).toHaveCount(10);await expect(page.locator('#requestMore')).toHaveText('Mostrar mais (5 restantes)');expect(await page.evaluate(()=>window.testState.requests.map(r=>r.id))).toEqual(original);
});

test('client collapses an expanded service list without losing its current view',async({page})=>{
  await login(page);await page.evaluate(()=>{
    for(let index=0;index<15;index++)window.testState.requests.push({id:`collapse-${index}`,client_id:'10000000-0000-4000-8000-000000000001',provider_id:'provider-id',profession:index%2?'Pintor':'Eletricista',description:`Serviço para recolher ${index}`,status:'aceito',city:'Manaus',state:'AM',created_at:new Date(Date.UTC(2026,9,22,13,index)).toISOString()});
  });
  const original=await page.evaluate(()=>window.testState.requests.map(r=>r.id));await page.locator('#refresh').click();
  await expect(page.locator('#requestCollapse')).toBeHidden();await page.locator('#requestMore').click();
  await expect(page.locator('#requests .service')).toHaveCount(15);await expect(page.locator('#requestCollapse')).toBeVisible();
  await page.locator('#requestCollapse').click();await expect(page.locator('#requests .service')).toHaveCount(10);
  await expect(page.locator('#requestCollapse')).toBeHidden();await expect(page.locator('#requestMore')).toHaveText('Mostrar mais (5 restantes)');
  await expect(page.locator('#requestFilter')).toHaveValue('all');await expect(page.locator('#requestSort')).toHaveValue('recent');expect(await page.evaluate(()=>window.testState.requests.map(r=>r.id))).toEqual(original);
});

test('client chooses how many services to show per step without changing requests',async({page})=>{
  await login(page);await page.evaluate(()=>{
    for(let index=0;index<30;index++)window.testState.requests.push({id:`page-size-${index}`,client_id:'10000000-0000-4000-8000-000000000001',provider_id:'provider-id',profession:'Eletricista',description:`Serviço por etapa ${index}`,status:'aceito',city:'Manaus',state:'AM',created_at:new Date(Date.UTC(2026,9,22,14,index)).toISOString()});
  });
  const original=await page.evaluate(()=>window.testState.requests.map(r=>r.id));await page.locator('#refresh').click();
  await expect(page.locator('#requests .service')).toHaveCount(10);await page.locator('#requestPageSize').selectOption('25');
  await expect(page.locator('#requests .service')).toHaveCount(25);await expect(page.locator('#requestMore')).toHaveText('Mostrar mais (5 restantes)');
  await page.locator('#requestMore').click();await expect(page.locator('#requests .service')).toHaveCount(30);
  await page.locator('#requestCollapse').click();await expect(page.locator('#requests .service')).toHaveCount(25);await expect(page.locator('#requestPageSize')).toHaveValue('25');
  expect(await page.evaluate(()=>window.testState.requests.map(r=>r.id))).toEqual(original);
});

test('client downloads every filtered safe summary beyond visible pagination',async({page})=>{
  await login(page);await page.evaluate(()=>{
    window.testState.requests.push({id:'summary-batch-active',profession:'Eletricista',description:'Descrição ativa que deve ficar fora',status:'aceito',city:'Manaus',state:'AM',created_at:'2026-10-25T07:00:00.000Z'});
    for(let index=0;index<12;index++)window.testState.requests.push({id:`summary-batch-${index}`,profession:'Pintor',description:`Descrição privada em lote ${index}`,status:'concluido',city:'Boa Vista',state:'RR',is_urgent:index===0,created_at:new Date(Date.UTC(2026,9,25,6,index)).toISOString()});
  });
  const original=await page.evaluate(()=>JSON.stringify(window.testState.requests));await page.locator('#refresh').click();await page.locator('#requestFilter').selectOption('completed');await page.locator('#requestSort').selectOption('oldest');await page.locator('#requestSearch').fill('Pintor');await page.locator('#searchRequests').click();await expect(page.locator('#requests .service')).toHaveCount(10);const callsBeforeDownload=await page.evaluate(()=>window.testState.calls.length),[download]=await Promise.all([page.waitForEvent('download'),page.locator('#downloadRequestSummaries').click()]);
  const localDay=await page.evaluate(()=>{const now=new Date();return [now.getFullYear(),String(now.getMonth()+1).padStart(2,'0'),String(now.getDate()).padStart(2,'0')].join('-');}),filename=`servico-certo-resumos-seguros-concluidos-pintor-mais-antigos-${localDay}.txt`;expect(download.suggestedFilename()).toBe(filename);await expect(page.locator('#status')).toHaveText(`12 resumos seguros preparados em ${filename}.`);const content=await readFile(await download.path(),'utf8');expect(content).toContain('Contexto dos resumos seguros\nFiltro: Concluídos\nBusca aplicada: Sim\nOrdenação: Mais antigos\nQuantidade: 12');expect(content).not.toContain('Busca: Pintor');expect(content.match(/Serviço Certo/g)).toHaveLength(12);expect(content).toContain('Código: summary-batch-0');expect(content).toContain('Código: summary-batch-11');expect(content).toContain('Região: Boa Vista / RR');expect(content).not.toContain('summary-batch-active');expect(content).not.toContain('Descrição privada em lote');expect(await page.evaluate(()=>window.testState.calls.length)).toBe(callsBeforeDownload);expect(await page.evaluate(()=>JSON.stringify(window.testState.requests))).toBe(original);
});

test('client previews and hides every filtered safe summary beyond visible pagination',async({page})=>{
  await login(page);await page.evaluate(()=>{
    window.testState.requests.push({id:'preview-batch-active',profession:'Eletricista',description:'Descrição ativa que deve ficar fora',status:'aceito',city:'Manaus',state:'AM',created_at:'2026-10-25T07:00:00.000Z'});
    for(let index=0;index<12;index++)window.testState.requests.push({id:`preview-batch-${index}`,profession:'Pintor',description:`Descrição privada na prévia ${index}`,status:'concluido',city:'Boa Vista',state:'RR',created_at:new Date(Date.UTC(2026,9,25,6,index)).toISOString()});
  });
  const original=await page.evaluate(()=>JSON.stringify(window.testState.requests));await page.locator('#refresh').click();await page.locator('#requestFilter').selectOption('completed');await expect(page.locator('#requests .service')).toHaveCount(10);const callsBeforePreview=await page.evaluate(()=>window.testState.calls.length),toggle=page.locator('#previewRequestSummaries'),preview=page.locator('#requestSummariesPreview');
  await expect(preview).toBeHidden();await expect(toggle).toHaveText('Ver resumos');await expect(toggle).toHaveAttribute('aria-expanded','false');await toggle.click();await expect(preview).toBeVisible();await expect(toggle).toHaveText('Ocultar resumos');await expect(toggle).toHaveAttribute('aria-expanded','true');await expect(preview).toContainText('Filtro: Concluídos');await expect(preview).toContainText('Busca aplicada: Não');await expect(preview).toContainText('Ordenação: Mais recentes');await expect(preview).toContainText('Quantidade: 12');await expect(preview).toContainText('Código: preview-batch-0');await expect(preview).toContainText('Código: preview-batch-11');await expect(preview).not.toContainText('preview-batch-active');await expect(preview).not.toContainText('Descrição privada na prévia');expect(await preview.textContent()).toContain('Região: Boa Vista / RR');expect((await preview.textContent()).match(/Serviço Certo/g)).toHaveLength(12);
  await toggle.click();await expect(preview).toBeHidden();await expect(toggle).toHaveText('Ver resumos');await expect(toggle).toHaveAttribute('aria-expanded','false');expect(await page.evaluate(()=>window.testState.calls.length)).toBe(callsBeforePreview);expect(await page.evaluate(()=>JSON.stringify(window.testState.requests))).toBe(original);
});

test('client copies every filtered safe summary beyond visible pagination',async({page})=>{
  await page.addInitScript(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async value=>{window.copiedRequestSummaries=value;}}}));
  await login(page);await page.evaluate(()=>{
    window.testState.requests.push({id:'copy-summary-active',profession:'Eletricista',description:'Descrição ativa que deve ficar fora',status:'aceito',city:'Manaus',state:'AM',created_at:'2026-10-25T07:00:00.000Z'});
    for(let index=0;index<12;index++)window.testState.requests.push({id:`copy-summary-${index}`,profession:'Pintor',description:`Descrição privada para cópia ${index}`,status:'concluido',city:'Boa Vista',state:'RR',is_urgent:index===0,created_at:new Date(Date.UTC(2026,9,25,6,index)).toISOString()});
  });
  const original=await page.evaluate(()=>JSON.stringify(window.testState.requests));await page.locator('#refresh').click();await page.locator('#requestFilter').selectOption('completed');await expect(page.locator('#requests .service')).toHaveCount(10);
  const callsBeforeCopy=await page.evaluate(()=>window.testState.calls.length);await page.locator('#copyRequestSummaries').click();await expect(page.locator('#status')).toHaveText('12 resumos seguros copiados da lista filtrada.');const content=await page.evaluate(()=>window.copiedRequestSummaries);
  expect(content).toContain('Filtro: Concluídos\nBusca aplicada: Não\nOrdenação: Mais recentes\nQuantidade: 12');expect(content.match(/Serviço Certo/g)).toHaveLength(12);expect(content).toContain('Código: copy-summary-0');expect(content).toContain('Código: copy-summary-11');expect(content).toContain('Região: Boa Vista / RR');expect(content).not.toContain('copy-summary-active');expect(content).not.toContain('Descrição privada para cópia');expect(await page.evaluate(()=>window.testState.calls.length)).toBe(callsBeforeCopy);expect(await page.evaluate(()=>JSON.stringify(window.testState.requests))).toBe(original);
});

test('client shares every filtered safe summary as one text file',async({page})=>{
  await page.addInitScript(()=>{
    Object.defineProperty(navigator,'canShare',{configurable:true,value:data=>Boolean(data.files?.length)});
    Object.defineProperty(navigator,'share',{configurable:true,value:async data=>{window.sharedRequestSummaries={title:data.title,text:data.text,name:data.files[0].name,content:await data.files[0].text()};}});
  });
  await login(page);await page.evaluate(()=>{
    window.testState.requests.push({id:'share-summary-active',profession:'Eletricista',description:'Descrição ativa que deve ficar fora',status:'aceito',city:'Manaus',state:'AM',created_at:'2026-10-25T07:00:00.000Z'});
    for(let index=0;index<12;index++)window.testState.requests.push({id:`share-summary-${index}`,profession:'Pintor',description:`Descrição privada para compartilhar ${index}`,status:'concluido',city:'Boa Vista',state:'RR',created_at:new Date(Date.UTC(2026,9,25,6,index)).toISOString()});
  });
  const original=await page.evaluate(()=>JSON.stringify(window.testState.requests));await page.locator('#refresh').click();await page.locator('#requestFilter').selectOption('completed');await expect(page.locator('#requests .service')).toHaveCount(10);const callsBeforeShare=await page.evaluate(()=>window.testState.calls.length);await page.locator('#shareRequestSummaries').click();const localDay=await page.evaluate(()=>{const now=new Date();return [now.getFullYear(),String(now.getMonth()+1).padStart(2,'0'),String(now.getDate()).padStart(2,'0')].join('-');}),filename=`servico-certo-resumos-seguros-concluidos-${localDay}.txt`;
  await expect(page.locator('#status')).toHaveText(`12 resumos seguros compartilhados em ${filename}.`);const shared=await page.evaluate(()=>window.sharedRequestSummaries);expect(shared).toMatchObject({title:'Serviço Certo — resumos seguros',text:'12 resumos seguros em arquivo de texto.',name:filename});expect(shared.content).toContain('Filtro: Concluídos\nBusca aplicada: Não\nOrdenação: Mais recentes\nQuantidade: 12');expect(shared.content.match(/Serviço Certo/g)).toHaveLength(12);expect(shared.content).toContain('Código: share-summary-0');expect(shared.content).toContain('Código: share-summary-11');expect(shared.content).not.toContain('share-summary-active');expect(shared.content).not.toContain('Descrição privada para compartilhar');expect(await page.evaluate(()=>window.testState.calls.length)).toBe(callsBeforeShare);expect(await page.evaluate(()=>JSON.stringify(window.testState.requests))).toBe(original);
});

test('batch file sharing rejection retries the safe summaries as text',async({page})=>{
  await page.addInitScript(()=>{window.batchShareAttempts=[];Object.defineProperty(navigator,'canShare',{configurable:true,value:data=>Boolean(data.files?.length)});Object.defineProperty(navigator,'share',{configurable:true,value:async data=>{window.batchShareAttempts.push({hasFiles:Boolean(data.files?.length),text:data.text});if(data.files?.length)throw new TypeError('File target unavailable');window.sharedBatchTextAfterFileRejection=data.text;}});});
  await login(page);await page.evaluate(()=>{window.testState.requests.push({id:'batch-file-retry-active',profession:'Eletricista',description:'Descrição ativa fora do compartilhamento',status:'aceito',city:'Manaus',state:'AM',created_at:'2026-10-25T07:00:00.000Z'});for(let index=0;index<12;index++)window.testState.requests.push({id:`batch-file-retry-${index}`,profession:'Pintor',description:`Descrição privada para recuperação ${index}`,status:'concluido',city:'Boa Vista',state:'RR',created_at:new Date(Date.UTC(2026,9,25,6,index)).toISOString()});});
  const original=await page.evaluate(()=>JSON.stringify(window.testState.requests));await page.locator('#refresh').click();await page.locator('#requestFilter').selectOption('completed');await expect(page.locator('#requests .service')).toHaveCount(10);const callsBeforeShare=await page.evaluate(()=>window.testState.calls.length);await page.locator('#shareRequestSummaries').click();await expect(page.locator('#status')).toHaveText('Arquivo recusado. 12 resumos seguros enviados como texto.');
  const result=await page.evaluate(()=>({attempts:window.batchShareAttempts,text:window.sharedBatchTextAfterFileRejection}));expect(result.attempts).toHaveLength(2);expect(result.attempts[0]).toMatchObject({hasFiles:true,text:'12 resumos seguros em arquivo de texto.'});expect(result.attempts[1].hasFiles).toBe(false);expect(result.text).toContain('Filtro: Concluídos\nBusca aplicada: Não\nOrdenação: Mais recentes\nQuantidade: 12');expect(result.text.match(/Serviço Certo/g)).toHaveLength(12);expect(result.text).toContain('Código: batch-file-retry-0');expect(result.text).toContain('Código: batch-file-retry-11');expect(result.text).not.toContain('batch-file-retry-active');expect(result.text).not.toContain('Descrição privada para recuperação');expect(await page.evaluate(()=>window.testState.calls.length)).toBe(callsBeforeShare);expect(await page.evaluate(()=>JSON.stringify(window.testState.requests))).toBe(original);
});

test('batch file and text sharing rejections copy the safe summaries',async({page})=>{
  await page.addInitScript(()=>{window.batchRejectedShareAttempts=[];Object.defineProperty(navigator,'canShare',{configurable:true,value:data=>Boolean(data.files?.length)});Object.defineProperty(navigator,'share',{configurable:true,value:async data=>{window.batchRejectedShareAttempts.push({hasFiles:Boolean(data.files?.length),text:data.text});throw new TypeError('Share target unavailable');}});Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async value=>{window.copiedBatchAfterShareRejections=value;}}});});
  await login(page);await page.evaluate(()=>{window.testState.requests.push({id:'batch-copy-active',profession:'Eletricista',description:'Descrição ativa fora da cópia',status:'aceito',city:'Manaus',state:'AM',created_at:'2026-10-25T07:00:00.000Z'});for(let index=0;index<12;index++)window.testState.requests.push({id:`batch-copy-retry-${index}`,profession:'Pintor',description:`Descrição privada fora da recuperação ${index}`,status:'concluido',city:'Boa Vista',state:'RR',created_at:new Date(Date.UTC(2026,9,25,6,index)).toISOString()});});
  const original=await page.evaluate(()=>JSON.stringify(window.testState.requests));await page.locator('#refresh').click();await page.locator('#requestFilter').selectOption('completed');await expect(page.locator('#requests .service')).toHaveCount(10);const callsBeforeShare=await page.evaluate(()=>window.testState.calls.length);await page.locator('#shareRequestSummaries').click();await expect(page.locator('#status')).toHaveText('Arquivo e texto recusados. 12 resumos seguros copiados.');
  const result=await page.evaluate(()=>({attempts:window.batchRejectedShareAttempts,text:window.copiedBatchAfterShareRejections}));expect(result.attempts).toHaveLength(2);expect(result.attempts[0]).toMatchObject({hasFiles:true,text:'12 resumos seguros em arquivo de texto.'});expect(result.attempts[1].hasFiles).toBe(false);expect(result.text).toContain('Filtro: Concluídos\nBusca aplicada: Não\nOrdenação: Mais recentes\nQuantidade: 12');expect(result.text.match(/Serviço Certo/g)).toHaveLength(12);expect(result.text).toContain('Código: batch-copy-retry-0');expect(result.text).toContain('Código: batch-copy-retry-11');expect(result.text).not.toContain('batch-copy-active');expect(result.text).not.toContain('Descrição privada fora da recuperação');expect(await page.evaluate(()=>window.testState.calls.length)).toBe(callsBeforeShare);expect(await page.evaluate(()=>JSON.stringify(window.testState.requests))).toBe(original);
});

test('batch summary sharing copies safe content when native sharing is unavailable',async({page})=>{
  await page.addInitScript(()=>{Object.defineProperty(navigator,'share',{configurable:true,value:undefined});Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async value=>{window.copiedSharedSummaries=value;}}});});
  await login(page);await page.evaluate(()=>window.testState.requests.push({id:'share-copy-fallback',profession:'Pintor',description:'Descrição privada fora da cópia',status:'concluido',city:'Boa Vista',state:'RR',created_at:'2026-10-25T06:00:00.000Z'}));const original=await page.evaluate(()=>JSON.stringify(window.testState.requests));await page.locator('#refresh').click();await page.locator('#requestFilter').selectOption('completed');const callsBeforeShare=await page.evaluate(()=>window.testState.calls.length);await page.locator('#shareRequestSummaries').click();await expect(page.locator('#status')).toHaveText('1 resumo seguro copiado porque o compartilhamento não está disponível.');const content=await page.evaluate(()=>window.copiedSharedSummaries);expect(content).toContain('Código: share-copy-fallback');expect(content).not.toContain('Descrição privada fora da cópia');expect(await page.evaluate(()=>window.testState.calls.length)).toBe(callsBeforeShare);expect(await page.evaluate(()=>JSON.stringify(window.testState.requests))).toBe(original);
});

test('client downloads filtered services with readable dates as safe CSV',async({page})=>{
  await page.addInitScript(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async value=>{window.copiedRequestCodes=value;}}}));
  await login(page);await page.evaluate(()=>{
    window.testState.requests.push(
      {id:'export-active',profession:'Eletricista',description:'Serviço ainda ativo',status:'aceito',city:'Manaus',state:'AM',created_at:'2026-10-22T12:00:00.000Z'},
      {id:'export-completed-one',profession:'Pintor',description:'=IMPORTXML("https://example.invalid")',status:'concluido',city:'Manaus',state:'AM',is_urgent:true,created_at:'2026-10-22T11:00:00.000Z'},
      {id:'export-completed-two',profession:'Encanador',description:'Reparo concluído',status:'concluido',city:'Manaus',state:'AM',scheduled_for:'2026-10-23T15:00:00.000Z',created_at:'2026-10-22T10:00:00.000Z'}
    );
    window.testState.messages.push({id:'export-unread-message',request_id:'export-completed-one',sender_id:'provider-id',body:'Mensagem para acompanhamento',created_at:'2026-10-22T11:30:00.000Z'});
    for(let index=0;index<10;index++)window.testState.requests.push({id:`export-extra-${index}`,profession:'Pintor',description:`Resultado adicional ${index}`,status:'concluido',city:'Manaus',state:'AM',created_at:new Date(Date.UTC(2026,9,21,12,index)).toISOString()});
  });
  const original=await page.evaluate(()=>JSON.stringify({requests:window.testState.requests,messages:window.testState.messages}));
  const localDates=await page.evaluate(()=>({scheduled:new Date('2026-10-23T15:00:00.000Z').toLocaleString('pt-BR',{dateStyle:'short',timeStyle:'short'}),createdOne:new Date('2026-10-22T11:00:00.000Z').toLocaleString('pt-BR',{dateStyle:'short',timeStyle:'short'}),createdTwo:new Date('2026-10-22T10:00:00.000Z').toLocaleString('pt-BR',{dateStyle:'short',timeStyle:'short'})}));
  await page.locator('#refresh').click();await page.locator('#requestFilter').selectOption('completed');
  await expect(page.locator('#requests .service')).toHaveCount(10);
  const callsBeforeCopy=await page.evaluate(()=>window.testState.calls.length);await page.locator('#copyRequestCodes').click();await expect(page.locator('#status')).toHaveText('12 códigos copiados da lista filtrada.');
  const copiedCodes=await page.evaluate(()=>window.copiedRequestCodes.split('\n'));expect(copiedCodes).toEqual(['export-completed-one','export-completed-two',...Array.from({length:10},(_,index)=>`export-extra-${9-index}`)]);expect(copiedCodes).not.toContain('export-active');expect(await page.evaluate(()=>window.testState.calls.length)).toBe(callsBeforeCopy);
  const [download]=await Promise.all([page.waitForEvent('download'),page.locator('#exportRequests').click()]);
  const localDay=await page.evaluate(()=>{const now=new Date();return [now.getFullYear(),String(now.getMonth()+1).padStart(2,'0'),String(now.getDate()).padStart(2,'0')].join('-');}),defaultFilename=`servicos-concluidos-${localDay}.csv`;expect(download.suggestedFilename()).toBe(defaultFilename);await expect(page.locator('#status')).toHaveText(`Download preparado: 12 serviços em ${defaultFilename}.`);const stream=await download.createReadStream(),chunks=[];for await(const chunk of stream)chunks.push(chunk);const csv=Buffer.concat(chunks).toString('utf8');
  expect(csv.split('\r\n')).toHaveLength(13);expect(csv).toContain('\ufeff"Código","Profissão","Situação","Situação (código)","Meu papel","Mensagens novas","Descrição"');expect(csv).toContain('"Horário preferido","Horário preferido (ISO)","Solicitado em","Solicitado em (ISO)"');expect(csv).toContain(`"export-completed-one","Pintor","Concluído","concluido","Cliente","1","'=IMPORTXML(""https://example.invalid"")","Manaus","AM","Sim","","","${localDates.createdOne}","2026-10-22T11:00:00.000Z"`);expect(csv).toContain(`"export-completed-two","Encanador","Concluído","concluido","Cliente","0","Reparo concluído","Manaus","AM","Não","${localDates.scheduled}","2026-10-23T15:00:00.000Z","${localDates.createdTwo}","2026-10-22T10:00:00.000Z"`);expect(csv).toContain('"export-extra-9"');expect(csv).not.toContain('"export-active"');expect(csv).not.toContain('Serviço ainda ativo');
  expect(csv.indexOf('"export-completed-one","Pintor","Concluído","concluido","Cliente","1","\'=IMPORTXML')).toBeLessThan(csv.indexOf('"export-completed-two","Encanador","Concluído","concluido","Cliente","0","Reparo concluído"'));
  const [jsonDownload]=await Promise.all([page.waitForEvent('download'),page.locator('#exportRequestsJson').click()]),jsonFilename=`servicos-concluidos-${localDay}.json`;expect(jsonDownload.suggestedFilename()).toBe(jsonFilename);await expect(page.locator('#status')).toHaveText(`JSON preparado: 12 serviços em ${jsonFilename}.`);const jsonStream=await jsonDownload.createReadStream(),jsonChunks=[];for await(const chunk of jsonStream)jsonChunks.push(chunk);const exported=JSON.parse(Buffer.concat(jsonChunks).toString('utf8'));
  expect(exported).toMatchObject({version:1,context:{filter:'Concluídos',search:'',sort:'Mais recentes',role:'Cliente'}});expect(exported.exportedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);expect(exported.services).toHaveLength(12);expect(exported.services.find(r=>r.id==='export-completed-one')).toMatchObject({status:'concluido',statusLabel:'Concluído',role:'Cliente',unreadMessages:1,urgent:true});expect(exported.services.some(r=>r.id==='export-active')).toBe(false);
  expect(await page.evaluate(()=>JSON.stringify({requests:window.testState.requests,messages:window.testState.messages}))).toBe(original);
  await page.locator('#requestSort').selectOption('oldest');await page.locator('#requestSearch').fill('Reparo concluído');await page.locator('#searchRequests').click();await expect(page.locator('#requests .service')).toHaveCount(1);
  const [searchedDownload]=await Promise.all([page.waitForEvent('download'),page.locator('#exportRequests').click()]),searchedFilename=`servicos-concluidos-reparo-concluido-mais-antigos-${localDay}.csv`;expect(searchedDownload.suggestedFilename()).toBe(searchedFilename);await expect(page.locator('#status')).toHaveText(`Download preparado: 1 serviço em ${searchedFilename}.`);const searchedStream=await searchedDownload.createReadStream(),searchedChunks=[];for await(const chunk of searchedStream)searchedChunks.push(chunk);const searchedCsv=Buffer.concat(searchedChunks).toString('utf8');expect(searchedCsv.split('\r\n')).toHaveLength(2);expect(searchedCsv).toContain('"export-completed-two"');expect(searchedCsv).not.toContain('"export-completed-one"');expect(await page.evaluate(()=>JSON.stringify({requests:window.testState.requests,messages:window.testState.messages}))).toBe(original);
  await page.locator('#requestSearch').fill('sem resultado');await page.locator('#searchRequests').click();await expect(page.locator('#copyRequestCodes')).toBeDisabled();await expect(page.locator('#previewRequestSummaries')).toBeDisabled();await expect(page.locator('#copyRequestSummaries')).toBeDisabled();await expect(page.locator('#downloadRequestSummaries')).toBeDisabled();await expect(page.locator('#shareRequestSummaries')).toBeDisabled();await expect(page.locator('#exportRequests')).toBeDisabled();await expect(page.locator('#exportRequestsJson')).toBeDisabled();
});

test('provider export identifies their role without changing the service',async({page})=>{
  await page.addInitScript(()=>{window.testRole='prestador';Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async value=>{window.copiedRequestCodes=value;}}});});await login(page);await page.evaluate(()=>window.testState.requests.push({id:'provider-export',client_id:'client-id',provider_id:'10000000-0000-4000-8000-000000000001',profession:'Eletricista',description:'Instalação atendida pelo profissional',status:'aceito',city:'Manaus',state:'AM',created_at:'2026-10-22T12:00:00.000Z'}));
  const original=await page.evaluate(()=>JSON.stringify(window.testState.requests));await page.locator('#refresh').click();
  const callsBeforeCopy=await page.evaluate(()=>window.testState.calls.length);await page.locator('#copyRequestCodes').click();await expect(page.locator('#status')).toHaveText('1 código copiado da lista filtrada.');expect(await page.evaluate(()=>window.copiedRequestCodes)).toBe('provider-export');expect(await page.evaluate(()=>window.testState.calls.length)).toBe(callsBeforeCopy);
  const [download]=await Promise.all([page.waitForEvent('download'),page.locator('#exportRequests').click()]),stream=await download.createReadStream(),chunks=[];for await(const chunk of stream)chunks.push(chunk);const csv=Buffer.concat(chunks).toString('utf8');
  expect(csv).toContain('"Código","Profissão","Situação","Situação (código)","Meu papel","Mensagens novas"');expect(csv).toContain('"provider-export","Eletricista","Profissional aceitou","aceito","Prestador","0"');
  const [jsonDownload]=await Promise.all([page.waitForEvent('download'),page.locator('#exportRequestsJson').click()]),jsonStream=await jsonDownload.createReadStream(),jsonChunks=[];for await(const chunk of jsonStream)jsonChunks.push(chunk);const exported=JSON.parse(Buffer.concat(jsonChunks).toString('utf8'));expect(exported.context.role).toBe('Prestador');expect(exported.services).toEqual([expect.objectContaining({id:'provider-export',status:'aceito',statusLabel:'Profissional aceitou',role:'Prestador'})]);expect(await page.evaluate(()=>JSON.stringify(window.testState.requests))).toBe(original);
});

test('client loads every authorized service in deterministic batches',async({page})=>{
  await login(page);await page.evaluate(()=>{
    for(let index=0;index<205;index++)window.testState.requests.push({id:`batch-${String(index).padStart(3,'0')}`,profession:'Eletricista',description:`Serviço autorizado ${index}`,status:'concluido',city:'Manaus',state:'AM',created_at:new Date(Date.UTC(2026,9,22,12)-index*60000).toISOString()});
  });
  await page.locator('#refresh').click();await expect(page.locator('#requests .service')).toHaveCount(10);await expect(page.locator('#requestSummary')).toContainText('Exibindo 10 de 205 correspondentes');
  const ranges=await page.evaluate(()=>window.testState.calls.filter(call=>call.table==='service_requests'&&call.operation==='select'&&call.range).slice(-3).map(call=>call.range));
  expect(ranges).toEqual([[0,99],[100,199],[200,299]]);await expect(page.locator('#requestMore')).toHaveText('Mostrar mais (195 restantes)');
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
