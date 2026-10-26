import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';

const mock=await readFile(new URL('./mock-supabase.js',import.meta.url),'utf8');

test.beforeEach(async({page})=>{
  await page.route('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.118.0/+esm',route=>route.fulfill({contentType:'text/javascript',body:mock}));
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
