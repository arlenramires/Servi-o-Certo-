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
test('provider handles an already claimed opportunity without false success',async({page})=>{
  await page.addInitScript(()=>window.testRole='prestador');await login(page);await expect(page.locator('#clientPanel')).toBeHidden();await expect(page.locator('#providerApply')).toBeHidden();await page.getByRole('button',{name:'Aceitar chamado'}).click();await expect(page.locator('#status')).toContainText('não está mais disponível');
});
test('missing server profile keeps workspace closed',async({page})=>{
  await page.addInitScript(()=>window.missingProfile=true);await page.goto('/auth-teste/');await page.locator('#email').fill('teste@example.invalid');await page.locator('#password').fill('validpass123');await page.locator('#submit').click();await expect(page.locator('#status')).toContainText('permanece bloqueado');await expect(page.locator('#workspace')).toBeHidden();
});
test('layout fits viewport',async({page})=>{
  await login(page);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
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
test('a revised contract requires fresh acceptance and preserves refused version',async({page})=>{
  await login(page);await seedContractContext(page,{contract:true,refused:true});await expect(page.locator('[data-contract="contract-1"]')).toContainText('Esta versão foi recusada');await expect(page.locator('[data-contract="contract-1"] button')).toHaveCount(0);
  await expect(page.locator('[data-contract="contract-2"]')).toContainText('Cliente: aguardando decisão');await expect(page.getByRole('button',{name:'Aceitar esta versão'})).toBeDisabled();await page.getByRole('button',{name:'Recusar esta versão'}).click();await expect(page.locator('[data-contract="contract-2"]')).toContainText('Esta versão foi recusada');expect(await page.evaluate(()=>window.testState.contractDecisions.filter(d=>d.contract_id==='contract-1').length)).toBe(2);
});
