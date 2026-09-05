// @spec production-harness
// AC4 AC7
import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { spawnSync } from 'node:child_process'
const script = resolve('scripts/trace-acceptance-criteria.mjs')
function fixture(t) {const dir=mkdtempSync(join(tmpdir(),'trace-'));t.after(()=>rmSync(dir,{recursive:true,force:true}));return dir}
test('gate rejects absent specs and nonexistent requested scope', t=>{
  const cwd=fixture(t)
  assert.equal(spawnSync(process.execPath,[script,'--gate'],{cwd}).status,1)
  mkdirSync(join(cwd,'specs/features'),{recursive:true})
  writeFileSync(join(cwd,'specs/features/one.md'),'**Status:** ready\n- **AC1** Required behavior. (risk: high)')
  assert.equal(spawnSync(process.execPath,[script,'--spec','missing','--gate'],{cwd}).status,1)
})
test('JSON output creates parent directories and explicit missing config fails',t=>{
  const cwd=fixture(t)
  assert.equal(spawnSync(process.execPath,[script,'--json','.harness/report.json'],{cwd}).status,0)
  assert.deepEqual(JSON.parse(readFileSync(join(cwd,'.harness/report.json'))).specs,[])
  assert.notEqual(spawnSync(process.execPath,[script,'--config','missing.json','--gate'],{cwd}).status,0)
})
test('markers link a high-risk criterion but do not execute its test',t=>{
  const cwd=fixture(t)
  mkdirSync(join(cwd,'specs/features'),{recursive:true});mkdirSync(join(cwd,'test'))
  writeFileSync(join(cwd,'specs/features/one.md'),'**Status:** ready\n- **AC1** Required behavior. (risk: high)')
  assert.equal(spawnSync(process.execPath,[script,'--gate'],{cwd}).status,1)
  writeFileSync(join(cwd,'test/example.js'),'// @spec one\n// AC1\nthrow new Error("This is deliberately not executed by static tracing")')
  assert.equal(spawnSync(process.execPath,[script,'--gate'],{cwd}).status,0)
})
