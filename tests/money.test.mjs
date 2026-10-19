import {test} from 'node:test';
import assert from 'node:assert/strict';
import {parseMoneyToCents,formatCents} from '../auth-teste/money.js';
test('amounts preserve cents and reject ambiguous/unsafe inputs',()=>{
  assert.equal(parseMoneyToCents('0,29'),29);
  assert.equal(parseMoneyToCents('150.5'),15050);
  assert.equal(parseMoneyToCents(' 250,99 '),25099);
  for(const value of ['0','-1','1e3','1,001','1.000,00','','NaN','Infinity','9007199254740992'])assert.equal(parseMoneyToCents(value),null,value);
  assert.match(formatCents(25099),/250,99/);
});
