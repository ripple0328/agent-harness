// @spec production-harness
// AC7: audits retain uncertainty and exclude invalid, stale, and duplicate evidence.
import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { collectAudit, parseDays, renderAudit } from '../scripts/harness-audit.mjs'

const script = fileURLToPath(new URL('../scripts/harness-audit.mjs', import.meta.url))
const now = Date.parse('2026-09-05T12:00:00Z')
function fixture(t) {
  const root = mkdtempSync(join(tmpdir(), 'harness-audit-'))
  t.after(() => rmSync(root, { recursive: true, force: true }))
  mkdirSync(join(root, 'metrics'))
  return root
}
function trace(overrides = {}) {
  return {
    schema_version: '1.0', timestamp: '2026-09-05T10:00:00Z', actor: 'test-runner',
    workflow_or_role: 'qa', task_type: 'qa', output_refs: ['qa-output'],
    commands_run: [{ command: 'project-check', result: 'pass' }],
    known_gaps: [], harness_follow_up: ['none'], ...overrides,
  }
}
function write(root, filename, records) {
  writeFileSync(join(root, 'metrics', filename), records.map((r) => typeof r === 'string' ? r : JSON.stringify(r)).join('\n') + '\n')
}
function collect(root, options = {}) { return collectAudit({ root, metricsDir: 'metrics', days: 30, now, ...options }) }

test('AC7: an empty source creates nested output and reports insufficient evidence', (t) => {
  const root = fixture(t)
  const result = spawnSync(process.execPath, [script, '--metrics', 'absent', '--out', 'nested/audit/result.md'], { cwd: root, encoding: 'utf8' })
  assert.equal(result.status, 0, result.stderr)
  const markdown = readFileSync(join(root, 'nested/audit/result.md'), 'utf8')
  assert.match(markdown, /Records reviewed:\*\* 0 unique/)
  assert.match(markdown, /insufficient evidence/)
  assert.match(markdown, /metrics directory does not exist/)
  assert.doesNotMatch(markdown, /No actionable findings/)
  assert.match(markdown, /\| Known gaps reported \| 0 \| 0 \| 0 \| N\/A \|/)
})

test('AC7: malformed JSON and schema-invalid records never inflate the denominator', (t) => {
  const root = fixture(t)
  write(root, 'records.jsonl', [trace({ has_attention_packet: false, has_qa_packet: true }), '{broken', 'null', '[]', '{}', trace({ commands_run: [{ command: 'check', result: 'probably' }] }), trace({ known_gaps: 'none' }), trace({ has_attention_packet: 'false' })])
  const audit = collect(root)
  assert.equal(audit.records.length, 1)
  assert.equal(audit.malformed, 7)
  assert.match(renderAudit(audit), /\| PR Attention Packet reported absent \| 1 \| 1 \| 0 \| 100% \|/)
})

test('AC7: timestamp windows operate per record rather than per filename', (t) => {
  const root = fixture(t)
  write(root, '2020-01-01.jsonl', [trace({ timestamp: '2026-09-04T10:00:00-02:00' })])
  write(root, '2026-09-05.jsonl', [trace({ timestamp: '2026-08-01T00:00:00Z' }), trace({ timestamp: '2026-09-05T12:00:01Z' }), trace({ timestamp: '2026-08-06T12:00:00Z' }), trace({ timestamp: '2026-09-05T12:00:00Z' })])
  const audit = collect(root)
  assert.equal(audit.records.length, 3)
  assert.equal(audit.outsideWindow, 1)
  assert.equal(audit.future, 1)
})

test('AC7: undated legacy PR metrics and undated traces remain unknown', (t) => {
  const root = fixture(t)
  const legacy = { schema_version: '1.0', date: '2026-09-05', pr_number: 1, layers: [], has_attention_packet: true, has_qa_packet: true, has_feedback_event: false }
  const undated = trace()
  delete undated.timestamp
  write(root, '2026-09-05.jsonl', [legacy, undated, trace({ timestamp: '2026-02-30T10:00:00Z' }), trace({ timestamp: '2026-09-05' })])
  const audit = collect(root)
  assert.equal(audit.records.length, 0)
  assert.equal(audit.unknownTime, 2)
  assert.equal(audit.invalidTime, 2)
  assert.match(renderAudit(audit), /insufficient evidence/)
})

test('AC7: reordered duplicate exports count once and conflicting identities count neither', (t) => {
  const root = fixture(t)
  const repeated = trace({ run_id: 'run-1', has_attention_packet: false })
  const reordered = Object.fromEntries(Object.entries(repeated).reverse())
  write(root, 'a.jsonl', [repeated, reordered, trace({ run_id: 'conflict', has_attention_packet: false })])
  write(root, 'b.jsonl', [trace({ run_id: 'conflict', has_attention_packet: true }), trace({ run_id: 'conflict', has_attention_packet: true })])
  const audit = collect(root)
  assert.equal(audit.records.length, 1)
  assert.equal(audit.duplicates, 2)
  assert.equal(audit.conflicts, 2)
  assert.match(renderAudit(audit), /\| PR Attention Packet reported absent \| 1 \| 1 \| 0 \| 100% \|/)
})

test('AC7: unavailable packet and trigger fields remain unknown rather than missing', (t) => {
  const root = fixture(t)
  write(root, 'records.jsonl', [trace(), trace({ timestamp: '2026-09-04T10:00:00Z', has_attention_packet: true, evidence_artifacts: ['QA Impact Packet'] })])
  const markdown = renderAudit(collect(root))
  assert.match(markdown, /\| PR Attention Packet reported absent \| 0 \| 1 \| 1 \| 0% \|/)
  assert.match(markdown, /\| QA Impact Packet reported absent \| 0 \| 1 \| 1 \| 0% \|/)
  assert.match(markdown, /\| Signal-triggered improvement started \| 0 \| 0 \| 2 \| N\/A \|/)
  assert.doesNotMatch(markdown, /missed a PR Attention Packet/)
})

test('AC7: per-record categories are deduplicated and trace-schema extension errors are excluded', (t) => {
  const root = fixture(t)
  write(root, 'records.jsonl', [trace({ harness_follow_up: ['rule-gap', 'rule-gap'], files_changed_summary: { core: 2 } }), trace({ signal_trigger: { started: true, unexpected: 'invalid' } }), trace({ human_interventions: [null] })])
  const audit = collect(root)
  assert.equal(audit.records.length, 1)
  assert.equal(audit.malformed, 2)
  assert.match(renderAudit(audit), /\| rule-gap \| 1 \|/)
})

test('AC7: timestamped legacy metrics remain supported and shared optional fields are validated', (t) => {
  const root = fixture(t)
  const metrics = { schema_version: '1.0', timestamp: '2026-09-05T09:00:00Z', pr_number: 1, layers: ['core'], has_attention_packet: true, has_qa_packet: false, has_feedback_event: false }
  write(root, 'records.jsonl', [metrics, { ...metrics, pr_number: 2, harness_follow_up: {} }, trace({ signal_trigger: JSON.parse('{"__proto__": true}') }), trace({ layers: [null] })])
  const audit = collect(root)
  assert.equal(audit.records.length, 1)
  assert.equal(audit.malformed, 3)
  assert.match(renderAudit(audit), /\| QA Impact Packet reported absent \| 1 \| 1 \| 0 \| 100% \|/)
})

test('AC7: invalid day windows fail clearly without producing a misleading report', (t) => {
  const root = fixture(t)
  for (const value of ['0', '-1', '1.5', 'NaN', 'Infinity', '9007199254740991', '']) assert.throws(() => parseDays(value), /--days/)
  assert.equal(parseDays('30'), 30)
  for (const args of [['--days', '0'], ['--days'], ['--days', '--out', 'wrong.md']]) {
    const result = spawnSync(process.execPath, [script, ...args], { cwd: root, encoding: 'utf8' })
    assert.equal(result.status, 1)
    assert.match(result.stderr, /Harness audit failed:/)
    assert.equal(result.stdout, '')
  }
})
