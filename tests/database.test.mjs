import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';

// Snapshot is a test fixture of the linked project's affected tables, not a production restore.
const fixture = JSON.parse(await readFile(new URL('../supabase/tests/schema-snapshot.json',import.meta.url)));
const quote = s => '"'+s.replaceAll('"','""')+'"';
export async function baseline(db) {
  await db.exec(`create role anon; create role authenticated;
    create schema auth;
    create table auth.users(id uuid primary key,raw_user_meta_data jsonb default '{}',email_confirmed_at timestamptz);
    create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
    grant usage on schema auth,public to anon,authenticated;
    grant execute on function auth.uid() to anon,authenticated;`);
  for (const t of fixture.tables) await db.exec(`create table public.${quote(t.relname)}(${t.columns});`);
  for (const c of fixture.constraints) await db.exec(`alter table public.${quote(c.tbl)} add constraint ${quote(c.conname)} ${c.definition};`);
  for (const index of fixture.indexes||[]) await db.exec(index);
  for (const f of fixture.functions) await db.exec(f);
  for (const t of fixture.triggers) await db.exec(t);
  for (const t of fixture.tables) if(t.relrowsecurity) await db.exec(`alter table public.${quote(t.relname)} enable row level security;`);
  for (const p of fixture.policies) {
    await db.exec(`create policy ${quote(p.policyname)} on public.${quote(p.tablename)} as ${p.permissive} for ${p.cmd} to ${p.roles.map(quote).join(',')}${p.qual?' using ('+p.qual+')':''}${p.with_check?' with check ('+p.with_check+')':''};`);
  }
  for(const g of fixture.grants) await db.exec(`grant ${g.privilege_type}(${quote(g.column_name)}) on public.${quote(g.table_name)} to authenticated;`);
}

async function applyDeliveries(db) {
  const dir=new URL('../supabase/migrations/',import.meta.url);
  for(const suffix of ['_secure_matching_and_signup.sql','_quote_decision_integrity.sql']) {
    const files=(await readdir(dir)).filter(f=>f.endsWith(suffix));
    assert.equal(files.length,1);
    await db.exec(await readFile(new URL(files[0],dir),'utf8'));
  }
  if(process.env.SC_CONTRACT_MIGRATION) await db.exec(await readFile(process.env.SC_CONTRACT_MIGRATION,'utf8'));
  else {
    const contractFiles=(await readdir(dir)).filter(f=>f.endsWith('_versioned_service_contracts.sql'));
    assert.equal(contractFiles.length,1);
    await db.exec(await readFile(new URL(contractFiles[0],dir),'utf8'));
  }
  const executionFiles=(await readdir(dir)).filter(f=>f.endsWith('_service_execution_completion_ratings.sql'));
  assert.equal(executionFiles.length,1);
  await db.exec(await readFile(new URL(executionFiles[0],dir),'utf8'));
  const cancellationFiles=(await readdir(dir)).filter(f=>f.endsWith('_prestart_cancellation_reassignment.sql'));
  assert.equal(cancellationFiles.length,1);
  await db.exec(await readFile(new URL(cancellationFiles[0],dir),'utf8'));
}

test('PostgreSQL: signup, RLS, locality, qualification, atomic claim and chat',async()=>{
  const db=new PGlite();
  try {
    await baseline(db);
    await applyDeliveries(db);
    const sql=await readFile(new URL('../supabase/tests/security-flow.sql',import.meta.url),'utf8');
    const result=await db.exec(sql);
    assert.ok(result.some(x=>x.rows?.some(r=>r.result==='security-flow: passed')));
  } finally { await db.close(); }
});

test('PostgreSQL: contract snapshot, stages, versions and bilateral immutable acceptance',async()=>{
  const db=new PGlite();
  try {
    await baseline(db);await applyDeliveries(db);
    const result=await db.exec(await readFile(new URL('../supabase/tests/contract-flow.sql',import.meta.url),'utf8'));
    assert.ok(result.some(x=>x.rows?.some(r=>r.result==='contract-flow: passed')));
  }finally{await db.close();}
});

test('PostgreSQL: quote privacy, correct request, immutable decisions and single acceptance',async()=>{
  const db=new PGlite();
  try {
    await baseline(db);await applyDeliveries(db);
    const result=await db.exec(await readFile(new URL('../supabase/tests/quote-flow.sql',import.meta.url),'utf8'));
    assert.ok(result.some(x=>x.rows?.some(r=>r.result==='quote-flow: passed')));
  }finally{await db.close();}
});

test('PostgreSQL: bilateral start, provider completion request, client confirmation and ratings',async()=>{
  const db=new PGlite();
  try {
    await baseline(db);await applyDeliveries(db);
    const result=await db.exec(await readFile(new URL('../supabase/tests/execution-flow.sql',import.meta.url),'utf8'));
    assert.ok(result.some(x=>x.rows?.some(r=>r.result==='execution-flow: passed')));
  }finally{await db.close();}
});

test('PostgreSQL: pre-start cancellation, audit and safe provider reassignment',async()=>{
  const db=new PGlite();
  try {
    await baseline(db);await applyDeliveries(db);
    const result=await db.exec(await readFile(new URL('../supabase/tests/cancellation-flow.sql',import.meta.url),'utf8'));
    assert.ok(result.some(x=>x.rows?.some(r=>r.result==='cancellation-flow: passed')));
  }finally{await db.close();}
});
