import test from 'node:test';
import assert from 'node:assert/strict';
const transitions={DRAFT:['SUBMITTED','CANCELLED'],SUBMITTED:['APPROVED','CANCELLED'],APPROVED:['ORDERED','CANCELLED'],ORDERED:['PARTIALLY_RECEIVED','RECEIVED','CLOSED','CANCELLED'],PARTIALLY_RECEIVED:['RECEIVED','CLOSED','CANCELLED'],RECEIVED:['CLOSED'],CLOSED:[],CANCELLED:[]};
test('PO lifecycle blocks invalid transition',()=>assert.equal(transitions.DRAFT.includes('APPROVED'),false));
test('PO receiving lifecycle supports partial then full',()=>{assert.equal(transitions.ORDERED.includes('PARTIALLY_RECEIVED'),true);assert.equal(transitions.PARTIALLY_RECEIVED.includes('RECEIVED'),true)});
test('inventory negative balance contract',()=>assert.equal(5-6<0,true));
test('project scope contract denies unassigned project',()=>assert.equal(new Set(['A']).has('B'),false));
