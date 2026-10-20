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
  const extrasFiles=(await readdir(dir)).filter(f=>f.endsWith('_service_extras_approval.sql'));
  assert.equal(extrasFiles.length,1);
  await db.exec(await readFile(new URL(extrasFiles[0],dir),'utf8'));
  const disputeFiles=(await readdir(dir)).filter(f=>f.endsWith('_service_disputes_intake.sql'));
  assert.equal(disputeFiles.length,1);
  await db.exec(await readFile(new URL(disputeFiles[0],dir),'utf8'));
  const inspectionFiles=(await readdir(dir)).filter(f=>f.endsWith('_prequote_inspection_proposal.sql'));
  assert.equal(inspectionFiles.length,1);
  await db.exec(await readFile(new URL(inspectionFiles[0],dir),'utf8'));
  const readFiles=(await readdir(dir)).filter(f=>f.endsWith('_conversation_unread_tracking.sql'));
  assert.equal(readFiles.length,1);
  await db.exec(await readFile(new URL(readFiles[0],dir),'utf8'));
  const arrivalFiles=(await readdir(dir)).filter(f=>f.endsWith('_provider_arrival_status.sql'));
  assert.equal(arrivalFiles.length,1);
  await db.exec(await readFile(new URL(arrivalFiles[0],dir),'utf8'));
  const arrivalStartFiles=(await readdir(dir)).filter(f=>f.endsWith('_require_arrival_before_service_start.sql'));
  assert.equal(arrivalStartFiles.length,1);
  await db.exec(await readFile(new URL(arrivalStartFiles[0],dir),'utf8'));
  const etaFiles=(await readdir(dir)).filter(f=>f.endsWith('_provider_manual_eta.sql'));
  assert.equal(etaFiles.length,1);
  await db.exec(await readFile(new URL(etaFiles[0],dir),'utf8'));
  const arrivalConfirmationFiles=(await readdir(dir)).filter(f=>f.endsWith('_client_arrival_confirmation.sql'));
  assert.equal(arrivalConfirmationFiles.length,1);
  await db.exec(await readFile(new URL(arrivalConfirmationFiles[0],dir),'utf8'));
  const completionAdjustmentFiles=(await readdir(dir)).filter(f=>f.endsWith('_completion_adjustment_review.sql'));
  assert.equal(completionAdjustmentFiles.length,1);
  await db.exec(await readFile(new URL(completionAdjustmentFiles[0],dir),'utf8'));
  const progressFiles=(await readdir(dir)).filter(f=>f.endsWith('_service_progress_updates.sql'));
  assert.equal(progressFiles.length,1);
  await db.exec(await readFile(new URL(progressFiles[0],dir),'utf8'));
  const rescheduleFiles=(await readdir(dir)).filter(f=>f.endsWith('_service_rescheduling.sql')&&!f.endsWith('_bilateral_service_rescheduling.sql'));
  assert.equal(rescheduleFiles.length,1);
  await db.exec(await readFile(new URL(rescheduleFiles[0],dir),'utf8'));
  const bilateralRescheduleFiles=(await readdir(dir)).filter(f=>f.endsWith('_bilateral_service_rescheduling.sql'));
  assert.equal(bilateralRescheduleFiles.length,1);
  await db.exec(await readFile(new URL(bilateralRescheduleFiles[0],dir),'utf8'));
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

test('PostgreSQL: provider extras require an immutable client decision before completion',async()=>{
  const db=new PGlite();
  try {
    await baseline(db);await applyDeliveries(db);
    const result=await db.exec(await readFile(new URL('../supabase/tests/extras-flow.sql',import.meta.url),'utf8'));
    assert.ok(result.some(x=>x.rows?.some(r=>r.result==='extras-flow: passed')));
  }finally{await db.close();}
});

test('PostgreSQL: participants open and answer one immutable private dispute',async()=>{
  const db=new PGlite();
  try {
    await baseline(db);await applyDeliveries(db);
    const result=await db.exec(await readFile(new URL('../supabase/tests/dispute-flow.sql',import.meta.url),'utf8'));
    assert.ok(result.some(x=>x.rows?.some(r=>r.result==='dispute-flow: passed')));
  }finally{await db.close();}
});

test('PostgreSQL: provider proposes one private pre-quote inspection for client decision',async()=>{
  const db=new PGlite();
  try {
    await baseline(db);await applyDeliveries(db);
    const result=await db.exec(await readFile(new URL('../supabase/tests/inspection-flow.sql',import.meta.url),'utf8'));
    assert.ok(result.some(x=>x.rows?.some(r=>r.result==='inspection-flow: passed')));
  }finally{await db.close();}
});

test('PostgreSQL: participants count incoming unread messages and mark conversations read',async()=>{
  const db=new PGlite();
  try {
    await baseline(db);await applyDeliveries(db);
    const result=await db.exec(await readFile(new URL('../supabase/tests/message-read-flow.sql',import.meta.url),'utf8'));
    assert.ok(result.some(x=>x.rows?.some(r=>r.result==='message-read-flow: passed')));
  }finally{await db.close();}
});

test('PostgreSQL: provider proposes and client decides an immutable pre-journey reschedule',async()=>{
  const db=new PGlite();
  try {
    await baseline(db);await applyDeliveries(db);
    const result=await db.exec(await readFile(new URL('../supabase/tests/rescheduling-flow.sql',import.meta.url),'utf8'));
    assert.ok(result.some(x=>x.rows?.some(r=>r.result==='rescheduling-flow: passed')));
  }finally{await db.close();}
});
