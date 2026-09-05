// @spec production-harness
// AC2 AC7
import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, mkdirSync, readFileSync, readdirSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { spawnSync } from 'node:child_process'
import { capture, loadEvents, summarize, validateEvent } from '../scripts/capture-signals.mjs'
const script = resolve('scripts/capture-signals.mjs')
function fixture(t) { const root = mkdtempSync(join(tmpdir(), 'signals-')); t.after(() => rmSync(root,{recursive:true,force:true})); return root }
function event(overrides = {}) { return { schema_version:'1.0', event_id:'event-1', source:'ci', run_id:'run-1', revision:'snapshot-1', type:'review_rework', label:'contract', outcome:'failed', timestamp:new Date().toISOString(), ...overrides } }

test('replays are idempotent and conflicting replay never overwrites evidence', t => {
  const root = fixture(t), e = event()
  assert.equal(capture(root,'.harness/signals',e).captured,true)
  assert.equal(capture(root,'.harness/signals',e).captured,false)
  assert.throws(() => capture(root,'.harness/signals',{...e,outcome:'passed'}), /Conflicting/)
  const report = summarize(loadEvents(root,'.harness/signals'))
  assert.equal(report.observations,1); assert.equal(report.groups[0].failed,1)
})
test('untrusted extra fields, invalid outcomes and contradictory exit codes are rejected', () => {
  for (const e of [event({body:'secret'}),event({outcome:'great'}),event({timestamp:'tomorrow'}),event({label:'token=secret'}),event({type:'command',duration_ms:1,exit_code:0,signal:null,outcome:'failed'})]) assert.throws(() => validateEvent(e))
})
test('wrapper preserves failure and only saves minimal metadata, never output argv or environment', t => {
  const root = fixture(t)
  const run = spawnSync(process.execPath,[script,'run','--root',root,'--label','tests','--run-id','one','--revision','snapshot','--',process.execPath,'-e','console.log("private-payload"); process.exit(7)'],{encoding:'utf8',env:{...process.env,PRIVATE_ENV:'private-env'}})
  assert.equal(run.status,7); assert.match(run.stdout,/private-payload/)
  const dir = join(root,'.harness/signals'), content = readFileSync(join(dir,readdirSync(dir)[0]),'utf8')
  assert.doesNotMatch(content,/private-payload|private-env|console\.log|argv|environment/)
  assert.equal(JSON.parse(content).exit_code,7)
})
test('successful command and spawn failure retain distinct exit evidence', t => {
  const root = fixture(t)
  const base = [script,'run','--root',root,'--label','tests','--run-id','one','--revision','snapshot','--']
  assert.equal(spawnSync(process.execPath,[...base,process.execPath,'-e','process.exit(0)']).status,0)
  assert.equal(spawnSync(process.execPath,[...base,'/missing-executable']).status,127)
  const report = summarize(loadEvents(root,'.harness/signals'))
  assert.equal(report.groups[0].failed,1); assert.equal(report.groups[0].passed,1)
})
test('empty evidence stays unavailable and malformed records make summary incomplete', t => {
  const root = fixture(t)
  assert.equal(summarize(loadEvents(root,'.harness/signals')).evidence,'unavailable')
  capture(root,'.harness/signals',event())
  writeFileSync(join(root,'.harness/signals','bad.json'),'{bad')
  assert.equal(summarize(loadEvents(root,'.harness/signals')).evidence,'incomplete')
  assert.equal(spawnSync(process.execPath,[script,'summary','--root',root]).status,2)
})
test('retention excludes old timestamps regardless of filenames and prune removes only expired valid events', t => {
  const root = fixture(t)
  capture(root,'.harness/signals',event({event_id:'old',timestamp:'2020-01-01T00:00:00Z'}))
  capture(root,'.harness/signals',event())
  assert.equal(loadEvents(root,'.harness/signals').records.length,1)
  const result = spawnSync(process.execPath,[script,'prune','--root',root,'--days','30'],{encoding:'utf8'})
  assert.equal(result.status,0); assert.equal(JSON.parse(result.stdout).removed,1)
})
test('paths cannot escape root or follow symlink directories or records', t => {
  const root = fixture(t), external = fixture(t)
  assert.throws(() => capture(root,'../outside',event()),/inside/)
  symlinkSync(external,join(root,'linked'))
  assert.throws(() => capture(root,'linked/signals',event()),/Unsafe/)
  mkdirSync(join(root,'signals')); writeFileSync(join(external,'event.json'),JSON.stringify(event()))
  symlinkSync(join(external,'event.json'),join(root,'signals','event.json'))
  assert.equal(loadEvents(root,'signals').invalid.length,1)
})
test('multiple retries in one run do not become independent-run counts', t => {
  const root = fixture(t)
  for (let i=0;i<4;i++) capture(root,'signals',event({event_id:`e${i}`}))
  const report = summarize(loadEvents(root,'signals'))
  assert.equal(report.observations,4); assert.equal(report.unique_runs,1)
})
test('missing and contradictory termination evidence are invalid', () => {
  for (const fields of [{exit_code:null,signal:null},{exit_code:7,signal:'SIGTERM'}]) {
    assert.throws(()=>validateEvent(event({type:'command',duration_ms:1,...fields})),/termination/)
  }
})
test('opaque IDs containing separators retain distinct run identities',t=>{
  const root=fixture(t)
  capture(root,'signals',event({source:'a:b',run_id:'c'}))
  capture(root,'signals',event({source:'a',run_id:'b:c'}))
  const result=summarize(loadEvents(root,'signals'))
  assert.equal(result.unique_runs,2);assert.equal(result.groups[0].unique_runs,2)
})
test('malformed payload content is absent from diagnostics',t=>{
  const root=fixture(t);mkdirSync(join(root,'signals'));writeFileSync(join(root,'signals/bad.json'),'SENSITIVE_SYNTHETIC_TEST_PAYLOAD')
  const result=JSON.stringify(summarize(loadEvents(root,'signals')))
  assert.doesNotMatch(result,/SENSITIVE/);assert.match(result,/Invalid JSON/)
  const cli=spawnSync(process.execPath,[script,'record','--root',root,'--input','signals/bad.json'],{encoding:'utf8'})
  assert.doesNotMatch(cli.stderr,/SENSITIVE/)
})
test('failed evidence persistence cannot mask a command failure or become a successful check',t=>{
  for(const code of [0,7]) {
    const root=fixture(t)
    const command=`const fs=require('fs');fs.rmSync('.harness/signals',{recursive:true});fs.writeFileSync('.harness/signals','blocked');process.exit(${code})`
    const result=spawnSync(process.execPath,[script,'run','--root',root,'--label','test','--run-id','r','--revision','v','--',process.execPath,'-e',command],{encoding:'utf8'})
    assert.equal(result.status,code===0?2:7);assert.match(result.stderr,/Signal capture failed/)
  }
})
test('signal termination and duplicate-member adapter inputs preserve uncertainty',t=>{
  const root=fixture(t)
  const result=spawnSync(process.execPath,[script,'run','--root',root,'--label','test','--run-id','r','--revision','v','--',process.execPath,'-e',"process.kill(process.pid,'SIGTERM')"],{encoding:'utf8'})
  assert.equal(result.status,143)
  const e=loadEvents(root,'.harness/signals').records[0];assert.equal(e.exit_code,null);assert.equal(e.signal,'SIGTERM')
  writeFileSync(join(root,'duplicate.json'),JSON.stringify(event()).replace('"outcome":"failed"','"outcome":"failed","outcome":"passed"'))
  const duplicate=spawnSync(process.execPath,[script,'record','--root',root,'--input','duplicate.json'],{encoding:'utf8'})
  assert.equal(duplicate.status,2);assert.match(duplicate.stderr,/Duplicate object member/)
})
