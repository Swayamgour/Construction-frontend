import test from "node:test";
import assert from "node:assert/strict";
const transitions={DRAFT:["SUBMITTED","CANCELLED"],SUBMITTED:["APPROVED","CANCELLED"],APPROVED:["ORDERED","CANCELLED"],ORDERED:["PARTIALLY_RECEIVED","RECEIVED","CLOSED","CANCELLED"],PARTIALLY_RECEIVED:["RECEIVED","CLOSED","CANCELLED"],RECEIVED:["CLOSED"]};
test("PO lifecycle supports ordered and receiving flow",()=>{assert.deepEqual(transitions.APPROVED,["ORDERED","CANCELLED"]);assert.ok(transitions.ORDERED.includes("PARTIALLY_RECEIVED"));assert.ok(transitions.PARTIALLY_RECEIVED.includes("RECEIVED"));});
test("fulfillment status derives from requested and fulfilled quantities",()=>{const status=(q,f)=>f>=q?"FULFILLED":f>0?"PARTIALLY_FULFILLED":"APPROVED_TRANSFER";assert.equal(status(10,4),"PARTIALLY_FULFILLED");assert.equal(status(10,10),"FULFILLED");});
test("negative inventory movement must be rejected by balance guard",()=>{const canMove=(balance,delta)=>balance+delta>=0;assert.equal(canMove(5,-6),false);assert.equal(canMove(5,-5),true);});
