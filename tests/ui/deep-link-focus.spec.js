import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';

const mock=await readFile(new URL('./mock-supabase.js',import.meta.url),'utf8');

test.beforeEach(async({page})=>{
  await page.route('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.118.0/+esm',route=>route.fulfill({contentType:'text/javascript',body:mock}));
});

test('malformed protected links return to normal login without authentication or disclosure',async({page})=>{
  for(const value of ['<script>','a'.repeat(101)]){
    await page.goto('/auth-teste/?servico='+encodeURIComponent(value));
    await expect(page).toHaveURL('http://127.0.0.1:4173/auth-teste/');
    await expect(page.locator('#authPanel')).toBeVisible();
    await expect(page.locator('#linkedRequestHint')).toBeHidden();
    await expect(page.locator('#status')).toHaveText('Link de serviço inválido. Entre para acessar seus serviços normalmente.');
    expect(await page.evaluate(()=>window.testState.calls.length)).toBe(0);
    await expect(page.locator('body')).not.toContainText(value);
  }
});

test('authenticated link focuses the authorized service once without changing it',async({page})=>{
  await page.goto('/auth-teste/?servico=focused-service');
  await page.locator('#email').fill('teste@example.invalid');
  await page.locator('#password').fill('validpass123');
  await page.locator('#submit').click();
  await expect(page.locator('#workspace')).toBeVisible();
  await page.evaluate(()=>window.testState.requests.push({id:'focused-service',profession:'Eletricista',description:'Descrição privada permanece somente no cartão autorizado',status:'aceito',city:'Manaus',state:'AM',created_at:new Date().toISOString()}));
  const original=await page.evaluate(()=>JSON.stringify(window.testState.requests));
  await page.locator('#refresh').click();
  const card=page.locator('[data-request="focused-service"]');
  await expect(card).toBeFocused();
  await expect(card).toHaveAttribute('data-linked','true');
  await expect(page.locator('#status')).toHaveText('Serviço aberto pelo link. Confira os dados e as ações disponíveis.');
  const callsAfterFocus=await page.evaluate(()=>window.testState.calls.length);
  await page.locator('#refresh').click();
  await expect(card).not.toBeFocused();
  expect(await page.evaluate(()=>window.testState.calls.length)).toBeGreaterThan(callsAfterFocus);
  expect(await page.evaluate(()=>JSON.stringify(window.testState.requests))).toBe(original);
});

test('authenticated link returns to every authorized service without changing them',async({page})=>{
  await page.goto('/auth-teste/?servico=linked-service');
  await page.locator('#email').fill('teste@example.invalid');
  await page.locator('#password').fill('validpass123');
  await page.locator('#submit').click();
  await expect(page.locator('#workspace')).toBeVisible();
  await page.evaluate(()=>window.testState.requests.push(
    {id:'linked-service',profession:'Eletricista',description:'Serviço vindo do link',status:'aceito',city:'Manaus',state:'AM',created_at:new Date().toISOString()},
    {id:'another-service',profession:'Pintor',description:'Outro serviço autorizado',status:'aberto',city:'Boa Vista',state:'RR',created_at:new Date().toISOString()}
  ));
  const original=await page.evaluate(()=>JSON.stringify(window.testState.requests));
  await page.locator('#refresh').click();
  await expect(page.locator('#requests .service')).toHaveCount(1);
  const callsBeforeReturn=await page.evaluate(()=>window.testState.calls.length);
  await page.getByRole('button',{name:'Ver todos os serviços'}).click();
  await expect(page).toHaveURL('http://127.0.0.1:4173/auth-teste/');
  await expect(page.locator('#requestSearch')).toHaveValue('');
  await expect(page.locator('#requests .service')).toHaveCount(2);
  await expect(page.locator('#status')).toHaveText('Lista completa de serviços autorizados exibida.');
  expect(await page.evaluate(()=>window.testState.calls.length)).toBeGreaterThan(callsBeforeReturn);
  expect(await page.evaluate(()=>JSON.stringify(window.testState.requests))).toBe(original);
});

test('unavailable authenticated link returns to authorized services without revealing existence',async({page})=>{
  await page.goto('/auth-teste/?servico=unavailable-service');
  await page.locator('#email').fill('teste@example.invalid');
  await page.locator('#password').fill('validpass123');
  await page.locator('#submit').click();
  await expect(page.locator('#workspace')).toBeVisible();
  await page.evaluate(()=>window.testState.requests.push({id:'authorized-service',profession:'Pintor',description:'Serviço visível somente após retornar',status:'aceito',city:'Manaus',state:'AM',created_at:new Date().toISOString()}));
  const original=await page.evaluate(()=>JSON.stringify(window.testState.requests));
  await page.locator('#refresh').click();
  await expect(page.locator('#requests')).toContainText('Serviço não encontrado nesta conta. Confira o link ou entre com a conta participante.');
  await expect(page.locator('#requests')).not.toContainText('unavailable-service');
  await expect(page.locator('#requests .service')).toHaveCount(0);
  const callsBeforeReturn=await page.evaluate(()=>window.testState.calls.length);
  await page.getByRole('button',{name:'Ver todos os serviços'}).click();
  await expect(page).toHaveURL('http://127.0.0.1:4173/auth-teste/');
  await expect(page.locator('#requests .service')).toHaveCount(1);
  await expect(page.locator('[data-request="authorized-service"]')).toBeVisible();
  await expect(page.locator('#status')).toHaveText('Lista completa de serviços autorizados exibida.');
  expect(await page.evaluate(()=>window.testState.calls.length)).toBeGreaterThan(callsBeforeReturn);
  expect(await page.evaluate(()=>JSON.stringify(window.testState.requests))).toBe(original);
});

test('unavailable authenticated link keeps its code while changing account',async({page})=>{
  await page.goto('/auth-teste/?servico=account-switch-service');
  await page.locator('#email').fill('teste@example.invalid');
  await page.locator('#password').fill('validpass123');
  await page.locator('#submit').click();
  await expect(page.locator('#workspace')).toBeVisible();
  await page.evaluate(()=>window.testState.requests.push({id:'authorized-service',profession:'Pintor',description:'Serviço autorizado da conta atual',status:'aceito',city:'Manaus',state:'AM',created_at:new Date().toISOString()}));
  const original=await page.evaluate(()=>JSON.stringify(window.testState.requests));
  await page.locator('#refresh').click();
  await expect(page.locator('#requests')).not.toContainText('account-switch-service');
  await page.getByRole('button',{name:'Entrar com outra conta'}).click();
  await expect(page).toHaveURL('http://127.0.0.1:4173/auth-teste/?servico=account-switch-service');
  await expect(page.locator('#authPanel')).toBeVisible();
  await expect(page.locator('#workspace')).toBeHidden();
  await expect(page.locator('#requests')).toBeEmpty();
  await expect(page.locator('#linkedRequestHint')).toBeVisible();
  await expect(page.locator('#linkedRequestHint')).not.toContainText('account-switch-service');
  await expect(page.locator('#status')).toHaveText('Sessão encerrada. Entre com outra conta participante para abrir este link.');
  expect(await page.evaluate(()=>JSON.stringify(window.testState.requests))).toBe(original);
});

test('protected link can be cancelled from login without authentication or disclosure',async({page})=>{
  await page.goto('/auth-teste/?servico=cancel-link-service');
  await expect(page.locator('#authPanel')).toBeVisible();
  await expect(page.locator('#linkedRequestHint')).toBeVisible();
  await expect(page.locator('#linkedRequestHint')).not.toContainText('cancel-link-service');
  const callsBeforeCancel=await page.evaluate(()=>window.testState.calls.length);
  await page.getByRole('button',{name:'cancele a abertura do link'}).click();
  await expect(page).toHaveURL('http://127.0.0.1:4173/auth-teste/');
  await expect(page.locator('#authPanel')).toBeVisible();
  await expect(page.locator('#linkedRequestHint')).toBeHidden();
  await expect(page.locator('#status')).toHaveText('Abertura pelo link cancelada. Entre para acessar seus serviços normalmente.');
  expect(await page.evaluate(()=>window.testState.calls.length)).toBe(callsBeforeCancel);
});

test('protected link is preserved through email signup confirmation',async({page})=>{
  await page.goto('/auth-teste/?servico=signup-link-service');
  await page.locator('#action').selectOption('signup');
  await page.locator('#name').fill('Pessoa pelo link');
  await page.locator('#email').fill('novo@example.invalid');
  await page.locator('#password').fill('validpass123');
  await page.locator('#submit').click();
  const call=await page.evaluate(()=>window.testState.calls.find(item=>item.auth==='signup'));
  expect(call.values.options.emailRedirectTo).toBe('http://127.0.0.1:4173/auth-teste/?servico=signup-link-service');
  await expect(page.locator('#linkedRequestHint')).toBeVisible();
  await expect(page.locator('#linkedRequestHint')).not.toContainText('signup-link-service');
  await expect(page.locator('#status')).toContainText('Verifique seu e-mail');
});

test('protected link is preserved through password recovery',async({page})=>{
  await page.goto('/auth-teste/?servico=recovery-link-service');
  await page.locator('#action').selectOption('reset');
  await page.locator('#email').fill('pessoa@example.invalid');
  await page.locator('#submit').click();
  const call=await page.evaluate(()=>window.testState.calls.find(item=>item.auth==='reset'));
  expect(call.options.redirectTo).toBe('http://127.0.0.1:4173/auth-teste/?servico=recovery-link-service');
  await page.goto('/auth-teste/?servico=recovery-link-service&callback=test#type=recovery');
  await expect(page.locator('#recoveryPanel')).toBeVisible();
  await page.locator('#newPassword').fill('new-password123');
  await page.locator('#savePassword').click();
  await expect(page).toHaveURL('http://127.0.0.1:4173/auth-teste/?servico=recovery-link-service');
  await expect(page.locator('#authPanel')).toBeVisible();
  await expect(page.locator('#linkedRequestHint')).toBeVisible();
  await expect(page.locator('#linkedRequestHint')).not.toContainText('recovery-link-service');
  await expect(page.locator('#status')).toHaveText('Senha atualizada. Entre com sua nova senha.');
});
