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
