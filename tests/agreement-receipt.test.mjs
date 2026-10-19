import {test} from 'node:test';
import assert from 'node:assert/strict';
import {buildAgreementReceipt} from '../auth-teste/agreement-receipt.js';

const contract={id:'contract-1',request_id:'request-1',quote_id:'quote-1',client_id:'client-1',provider_id:'provider-1',version:2,content_hash:'a'.repeat(64),created_at:'2026-10-19T12:00:00Z',document:{scope:'Pintura',amount_cents:5000}};
test('agreement receipt contains exact accepted version and both acceptance records',()=>{
  const receipt=buildAgreementReceipt(contract,[
    {contract_id:'contract-1',actor_id:'provider-1',decision:'aceito',created_at:'2026-10-19T12:02:00Z'},
    {contract_id:'contract-1',actor_id:'client-1',decision:'aceito',created_at:'2026-10-19T12:01:00Z'},
    {contract_id:'another',actor_id:'client-1',decision:'aceito',created_at:'2026-10-19T11:00:00Z'}
  ]);
  assert.equal(receipt.agreement.content_hash,'a'.repeat(64));
  assert.deepEqual(receipt.acceptances.map(x=>x.actor_id),['client-1','provider-1']);
  assert.match(receipt.notice,/não é assinatura digital certificada/i);
  assert.equal(receipt.agreement.document.amount_cents,5000);
});

test('agreement receipt is unavailable before bilateral acceptance',()=>{
  assert.throws(()=>buildAgreementReceipt(contract,[{contract_id:'contract-1',actor_id:'client-1',decision:'aceito',created_at:'2026-10-19T12:01:00Z'}]),/duas partes/);
});
