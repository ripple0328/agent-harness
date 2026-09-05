// @spec production-harness
// AC2 AC3 AC4 AC5 AC7
import test from 'node:test'
import assert from 'node:assert/strict'
import { parseStrictJson } from '../scripts/lib/strict-json.mjs'
test('duplicate evidence fields are rejected including escaped and nested keys',()=>{
  for(const text of ['{"status":"failed","status":"passed"}','{"status":"failed","st\\u0061tus":"passed"}','{"nested":{"ok":false,"ok":true}}']) assert.throws(()=>parseStrictJson(text),/Duplicate object member/)
})
test('valid arrays, nested objects and punctuation in values remain intact',()=>{
  const value={x:[{k:'commas, colons: [braces] "quoted"'},{k:'independent key'}],y:1,z:null}
  assert.deepEqual(parseStrictJson(JSON.stringify(value)),value)
})
test('syntax errors never disclose source payloads',()=>{
  assert.throws(()=>parseStrictJson('SENSITIVE_SYNTHETIC_TEST_PAYLOAD'),e=>e.message==='Invalid JSON')
})
