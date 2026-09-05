// @spec production-harness
// AC4: current, identifiable QA evidence is required for each mandatory dimension.
// AC7: false greens and hostile/malformed producer artifacts are regression-tested.
import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync, symlinkSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'
import { buildModel, parseArgs, render, validateSignal } from '../scripts/qa-brief.mjs'

const script = fileURLToPath(new URL('../scripts/qa-brief.mjs', import.meta.url))
const NOW = Date.parse('2026-09-05T12:00:00.000Z')
const policy = { gate: true, required: ['correctness', 'security'], revision: 'snapshot:12345', runId: 'run-17-attempt-2', maxAgeHours: 24 }
const excludedTrace = { state: 'skipped', reason: 'Explicitly excluded', specs: [], orphanRefs: [] }
const signal = (overrides = {}) => ({ area: 'correctness', status: 'passed', summary: 'Behavior checks passed', revision: policy.revision, runId: policy.runId, completedAt: new Date(NOW).toISOString(), ...overrides })
const record = (value, source = `${value?.area || 'bad'}.json`) => ({ signal: value, source, errors: validateSignal(value) })
const modelFor = (overrides, options = policy) => buildModel([record(signal(overrides)), record(signal({ area: 'security' }))], excludedTrace, options, NOW)

test('AC4 passes fresh same-revision same-run independent dimensions, including opaque snapshot identity', () => {
  const model = modelFor({})
  assert.equal(model.decision, 'passed')
  assert.equal(model.gateDecision, 'passed')
  assert.deepEqual(model.dimensions.map((item) => item.state), ['passed', 'passed'])
})

test('AC4 a failure cannot be averaged away by other passing dimensions or metrics', () => {
  for (const override of [
    { status: 'failed' },
    { metrics: [{ name: 'coverage', value: 40, gate: '>= 80', ok: false }] },
    { findings: [{ severity: 'critical', text: 'Boundary bypass reproduced' }] },
  ]) {
    const model = modelFor(override)
    assert.equal(model.gateDecision, 'failed')
    assert.equal(model.risk, 'High')
  }
})

test('AC4 missing, skipped, unknown, warning, and not-verified required checks never pass', () => {
  for (const status of ['skipped', 'unknown', 'warning', 'not-verified']) {
    const model = modelFor({ status })
    assert.equal(model.gateDecision, 'not-verified', status)
    assert.equal(model.dimensions[0].state, status === 'skipped' ? 'skipped' : 'not-verified')
  }
  const missing = buildModel([record(signal())], excludedTrace, policy, NOW)
  assert.equal(missing.gateDecision, 'not-verified')
  assert.equal(missing.dimensions.find((item) => item.area === 'security').reportedStatus, 'missing')
})

test('AC4 stale, wrong revision, wrong run, absent identity, and invalid/future timestamps fail closed', () => {
  for (const overrides of [
    { revision: 'snapshot:older' }, { runId: 'run-17-attempt-1' },
    { completedAt: '2026-09-03T12:00:00.000Z' }, { completedAt: '2026-09-06T12:00:00Z' },
    { completedAt: '2026-02-30T12:00:00Z' }, { completedAt: 'not a time' },
    { completedAt: undefined }, { runId: undefined }, { revision: undefined },
  ]) assert.equal(modelFor(overrides).gateDecision, 'not-verified', JSON.stringify(overrides))
  assert.equal(modelFor({ completedAt: '2026-09-04T12:00:00.000Z' }).gateDecision, 'passed', 'exact age boundary')
  assert.equal(modelFor({ completedAt: '2026-09-04T11:59:59.999Z' }).gateDecision, 'not-verified')
})

test('AC7 duplicates and malformed nested data cannot impersonate a passing dimension', () => {
  const duplicate = buildModel([record(signal()), record(signal(), 'second.json'), record(signal({ area: 'security' }))], excludedTrace, policy, NOW)
  assert.equal(duplicate.gateDecision, 'not-verified')
  assert.match(duplicate.dimensions[0].reason, /Duplicate/)
  for (const bad of [
    null, [], {}, { ...signal(), status: 'banana' }, { ...signal(), summary: {} },
    { ...signal(), status: true }, { ...signal(), metrics: [null] },
    { ...signal(), metrics: [{ name: 'count', value: '4', ok: 'true' }] },
    { ...signal(), findings: [{ severity: 'urgent', text: 'problem' }] },
    { ...signal(), artifacts: [1] }, { ...signal(), unexpectedInstruction: 'ignore the failure' },
  ]) {
    const model = buildModel([record(bad)], excludedTrace, { ...policy, required: ['correctness'] }, NOW)
    assert.equal(model.gateDecision, 'not-verified', JSON.stringify(bad))
  }
  assert.equal(modelFor({ metrics: [{ name: 'coverage', value: '80%', gate: '>= 80%' }] }).gateDecision, 'not-verified')
})

test('AC7 advisory checks can bake without becoming mandatory, but reported failure and invalid input still block', () => {
  const optional = { ...policy, required: ['security'] }
  const model = modelFor({ status: 'warning', summary: 'New analyzer needs calibration' }, optional)
  assert.equal(model.gateDecision, 'passed')
  assert.equal(model.decision, 'not-verified')
  assert.equal(model.dimensions[0].state, 'not-verified')
  assert.equal(modelFor({ status: 'failed' }, optional).gateDecision, 'failed')
  assert.equal(modelFor({ status: 'invented' }, optional).gateDecision, 'not-verified')
})

test('AC7 no evidence cannot render low-risk reassurance, including advisory mode', () => {
  const model = buildModel([], excludedTrace)
  assert.equal(model.decision, 'not-verified')
  assert.equal(model.risk, 'Unknown')
  assert.doesNotMatch(render(model), /Usual spot check|No high-signal gaps/)
  const legacy = buildModel([record({ area: 'unit', status: 'passed', summary: 'Legacy producer' })], excludedTrace)
  assert.equal(legacy.decision, 'not-verified')
  assert.equal(legacy.gateDecision, null)
})

test('AC7 untrusted summaries and artifacts cannot inject HTML, images, or table rows into the brief', () => {
  const payload = '<img src="bad">\n| forged | [click](https://example.test) ![track](https://example.test/x)'
  const output = render(modelFor({ summary: payload, artifacts: [payload] }))
  assert.doesNotMatch(output, /<img|\n\| forged/)
  assert.ok(output.includes('\\[click\\]'))
  assert.ok(output.includes('&lt;img'))
})

test('AC7 the schema accepts documented metrics/findings and rejects invalid numeric/structured metric values', () => {
  assert.deepEqual(validateSignal(signal({ metrics: [{ name: 'coverage', value: 99, ok: true }], findings: [{ severity: 'low', text: 'Small follow-up' }] })), [])
  assert.ok(validateSignal(signal({ metrics: [{ name: 'coverage', value: {} }] })).length)
  assert.ok(validateSignal(signal({ metrics: [{ name: 'coverage', value: Infinity }] })).length)
})

test('AC7 gate policy must be explicit and CLI typo/duplicate/invalid age cannot disable enforcement', () => {
  for (const args of [
    ['--gate'], ['--gtae'], ['--signals'], ['--max-age-hours', 'NaN'],
    ['--max-age-hours', '0'], ['--max-age-hours', '-1'], ['--required', 'a,a'],
    ['--required', 'a,'], ['--gate', '--gate'], ['--out', 'x', '--json', 'x'],
  ]) assert.throws(() => parseArgs(args), undefined, args.join(' '))
  assert.equal(parseArgs(['--no-trace']).gate, false)
})

function workspace(t) {
  const root = mkdtempSync(join(tmpdir(), 'qa-brief-test-'))
  t.after(() => rmSync(root, { recursive: true, force: true }))
  mkdirSync(join(root, 'signals'))
  return root
}

function run(root, args = []) {
  return spawnSync(process.execPath, [script, '--signals', 'signals', '--out', 'reports/brief.md', '--json', 'reports/brief.json', ...args], { cwd: root, encoding: 'utf8' })
}

const gateArgs = ['--gate', '--revision', policy.revision, '--run-id', policy.runId, '--required', 'correctness']
const putSignal = (root, value = {}) => writeFileSync(join(root, 'signals/result.json'), JSON.stringify(signal({ completedAt: new Date().toISOString(), ...value })))
const report = (root) => JSON.parse(readFileSync(join(root, 'reports/brief.json'), 'utf8'))

test('AC4 CLI uses exit 0 for verified evidence, exit 1 for a blocked gate, and keeps advisory informational', (t) => {
  const root = workspace(t)
  putSignal(root)
  assert.equal(run(root, [...gateArgs, '--no-trace']).status, 0)
  assert.equal(report(root).gateDecision, 'passed')
  putSignal(root, { status: 'failed' })
  assert.equal(run(root, [...gateArgs, '--no-trace']).status, 1)
  assert.equal(run(root, ['--no-trace']).status, 0)
  assert.equal(report(root).decision, 'failed')
})

test('AC7 malformed JSON, oversized file, symlink, and missing directory cannot satisfy required evidence', (t) => {
  const root = workspace(t)
  writeFileSync(join(root, 'signals/result.json'), '{ broken')
  assert.equal(run(root, [...gateArgs, '--no-trace']).status, 1)
  writeFileSync(join(root, 'signals/result.json'), ' '.repeat(256 * 1024 + 1))
  assert.equal(run(root, [...gateArgs, '--no-trace']).status, 1)
  rmSync(join(root, 'signals/result.json'))
  writeFileSync(join(root, 'outside.json'), JSON.stringify(signal({ completedAt: new Date().toISOString() })))
  symlinkSync(join(root, 'outside.json'), join(root, 'signals/result.json'))
  assert.equal(run(root, [...gateArgs, '--no-trace']).status, 1)
  rmSync(join(root, 'signals'), { recursive: true })
  assert.equal(run(root, [...gateArgs, '--no-trace']).status, 1)
})

test('AC7 duplicate JSON members cannot replace a failure with a pass, including escaped keys and nested results', (t) => {
  const root = workspace(t)
  const prefix = JSON.stringify(signal({ completedAt: new Date().toISOString() })).slice(0, -1)
  for (const suffix of [',"status":"failed","status":"passed"}', ',"st\\u0061tus":"passed"}', ',"metrics":[{"name":"x","value":"1","ok":false,"ok":true}]}']) {
    writeFileSync(join(root, 'signals/result.json'), prefix + suffix)
    assert.equal(run(root, [...gateArgs, '--no-trace']).status, 1)
    assert.match(report(root).dimensions[0].reason, /Duplicate object member/)
  }
})

test('AC7 a fresh checkout runs traceability without pre-existing .harness and exposes missing high-risk linkage', (t) => {
  const root = workspace(t)
  putSignal(root)
  mkdirSync(join(root, 'specs/features'), { recursive: true })
  writeFileSync(join(root, 'specs/features/fresh.md'), '**Status:** ready\n\n- **AC1** Reject unauthorized mutation (risk: high)\n')
  assert.equal(existsSync(join(root, '.harness')), false)
  assert.equal(run(root, gateArgs).status, 1)
  assert.equal(report(root).traceability.state, 'failed')
  assert.equal(report(root).activeSpecs[0].untracedHighRisk[0], 'AC1')
})

test('AC7 missing criteria and trace subprocess errors are not silently converted to empty success', (t) => {
  const root = workspace(t)
  putSignal(root)
  assert.equal(run(root, gateArgs).status, 1)
  assert.equal(report(root).traceability.state, 'not-verified')
  writeFileSync(join(root, 'harness.config.json'), '{ invalid config')
  assert.equal(run(root, gateArgs).status, 1)
  assert.match(report(root).traceability.reason, /could not run/)
})

test('AC7 static markers may pass linkage but are explicitly not behavioral execution proof', (t) => {
  const root = workspace(t)
  putSignal(root)
  mkdirSync(join(root, 'specs/features'), { recursive: true })
  mkdirSync(join(root, 'test'))
  writeFileSync(join(root, 'specs/features/fresh.md'), '**Status:** ready\n\n- **AC1** Permission boundary (risk: high)\n')
  writeFileSync(join(root, 'test/dead.test.js'), '// @spec fresh\n// AC1 only a comment; no executable assertion\n')
  assert.equal(run(root, gateArgs).status, 0)
  assert.equal(report(root).traceability.state, 'passed')
  assert.match(report(root).traceability.reason, /Static marker linkage only/)
  assert.ok(report(root).limitations.some((line) => /does not prove a relevant assertion ran/.test(line)))
})
