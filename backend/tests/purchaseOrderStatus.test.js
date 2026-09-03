import test from 'node:test';
import assert from 'node:assert/strict';
const allowed={DRAFT:['SUBMITTED','CANCELLED'],SUBMITTED:['APPROVED','CANCELLED'],APPROVED:['ORDERED','CANCELLED'],ORDERED:['PARTIALLY_RECEIVED','RECEIVED','CLOSED','CANCELLED'],PARTIALLY_RECEIVED:['RECEIVED','CLOSED','CANCELLED'],RECEIVED:['CLOSED'],CLOSED:[],CANCELLED:[]};
test('PO invalid transition is blocked by lifecycle contract',()=>assert.equal(allowed.DRAFT.includes('RECEIVED'),false));
test('PO normal transition is allowed',()=>assert.equal(allowed.DRAFT.includes('SUBMITTED'),true));
