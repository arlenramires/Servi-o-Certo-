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
