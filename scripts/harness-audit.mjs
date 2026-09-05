#!/usr/bin/env node
// Aggregate observed run traces and PR metrics; absence is not passing evidence.

import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { parseStrictJson } from './lib/strict-json.mjs'

const DAY = 24 * 60 * 60 * 1000
const traceSchema = JSON.parse(readFileSync(new URL('../harness/templates/harness-run-trace.schema.json', import.meta.url), 'utf8'))
const metricsSchema = {
  type: 'object',
  required: ['schema_version', 'pr_number', 'layers', 'has_attention_packet', 'has_qa_packet', 'has_feedback_event'],
  properties: {
    ...traceSchema.properties,
    schema_version: { type: 'string' }, timestamp: { type: 'string' }, date: { type: 'string' },
    pr_number: { type: 'integer', minimum: 1 }, pr_title: { type: 'string' }, author: { type: 'string' },
    layers: { type: 'array', items: { type: 'string' } },
    has_attention_packet: { type: 'boolean' }, has_qa_packet: { type: 'boolean' }, has_feedback_event: { type: 'boolean' },
  },
}
const auditTraceSchema = {
  ...traceSchema,
  properties: { ...metricsSchema.properties, ...traceSchema.properties },
}
const object = (value) => value !== null && typeof value === 'object' && !Array.isArray(value)

// This is the JSON Schema subset used by the checked-in trace schema.
function matchesSchema(value, schema, allowMissingTimestamp = false) {
  if (schema.type === 'object' && !object(value)) return false
  if (schema.type === 'array' && !Array.isArray(value)) return false
  if (schema.type === 'integer' && !Number.isInteger(value)) return false
  if (['string', 'boolean', 'number'].includes(schema.type) && typeof value !== schema.type) return false
  if (schema.minimum !== undefined && value < schema.minimum) return false
  if (schema.enum && !schema.enum.includes(value)) return false
  if (object(value)) {
    for (const key of schema.required || []) {
      if (allowMissingTimestamp && key === 'timestamp') continue
      if (!Object.hasOwn(value, key)) return false
    }
    for (const [key, item] of Object.entries(value)) {
      const property = schema.properties && Object.hasOwn(schema.properties, key) ? schema.properties[key] : undefined
      if (property && !matchesSchema(item, property)) return false
      if (!property && schema.additionalProperties === false) return false
      if (!property && object(schema.additionalProperties) && !matchesSchema(item, schema.additionalProperties)) return false
    }
  }
  if (Array.isArray(value) && schema.items && !value.every((item) => matchesSchema(item, schema.items))) return false
  return true
}

export function parseDays(value) {
  if (!/^[1-9]\d*$/.test(String(value))) throw new Error('--days must be a positive whole number')
  const days = Number(value)
  if (!Number.isSafeInteger(days) || !Number.isFinite(new Date(Date.now() - days * DAY).getTime())) throw new Error('--days is outside the supported date range')
  return days
}

function timestamp(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d(?:\.\d+)?(?:Z|[+-](?:[01]\d|2[0-3]):[0-5]\d)$/.test(value)) return NaN
  const date = new Date(`${value.slice(0, 10)}T00:00:00Z`)
  if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== value.slice(0, 10)) return NaN
  return Date.parse(value)
}

function canonical(value) {
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`
  if (object(value)) return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonical(value[key])}`).join(',')}}`
  return JSON.stringify(value)
}

function identity(record, hash) {
  for (const key of ['record_id', 'run_id', 'event_id']) {
    if (typeof record[key] === 'string' && record[key]) return canonical([key, record.repository || '', record.source || '', record.actor || '', record[key]])
  }
  if (record.pr_number) return canonical(['pr', record.repository || '', record.pr_number])
  return `content:${hash}`
}

export function collectAudit({ root = process.cwd(), metricsDir = '.harness/run-metrics', days = 30, now = Date.now() } = {}) {
  days = parseDays(days)
  if (!Number.isFinite(now) || !Number.isFinite(new Date(now - days * DAY).getTime())) throw new Error('Invalid audit observation time')
  const directory = resolve(root, metricsDir)
  const result = {
    days, now, cutoff: now - days * DAY, records: [], inputLines: 0, malformed: 0,
    unknownTime: 0, invalidTime: 0, outsideWindow: 0, future: 0, duplicates: 0, conflicts: 0,
    sourceMissing: !existsSync(directory),
  }
  if (result.sourceMissing) return result
  const candidates = new Map()
  const seen = new Set()
  for (const entry of readdirSync(directory, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    if (!entry.isFile() || !entry.name.endsWith('.jsonl')) continue
    for (const line of readFileSync(join(directory, entry.name), 'utf8').split('\n')) {
      if (!line.trim()) continue
      result.inputLines++
      let record
      try { record = parseStrictJson(line) } catch { result.malformed++; continue }
      if (!object(record)) { result.malformed++; continue }
      const schema = Object.hasOwn(record, 'workflow_or_role') || Object.hasOwn(record, 'commands_run') ? auditTraceSchema : metricsSchema
      if (!matchesSchema(record, schema, true)) { result.malformed++; continue }
      const hash = createHash('sha256').update(canonical(record)).digest('hex')
      if (seen.has(hash)) { result.duplicates++; continue }
      seen.add(hash)
      const key = identity(record, hash)
      if (candidates.has(key)) {
        // Conflicting exports cannot win according to input order or timestamp.
        if (candidates.get(key) !== null) result.conflicts++
        result.conflicts++
        candidates.set(key, null)
        continue
      }
      candidates.set(key, record)
    }
  }
  for (const record of candidates.values()) {
    if (record === null) continue
    if (!Object.hasOwn(record, 'timestamp')) { result.unknownTime++; continue }
    const time = timestamp(record.timestamp)
    if (!Number.isFinite(time)) { result.invalidTime++; continue }
    if (time > now) { result.future++; continue }
    if (time < result.cutoff) { result.outsideWindow++; continue }
    result.records.push(record)
  }
  return result
}

const rate = (n, d) => d === 0 ? 'N/A' : `${Math.round(n / d * 100)}%`
const cell = (value) => String(value).replace(/[\r\n]/g, ' ').replace(/\|/g, '\\|').replace(/</g, '&lt;').replace(/>/g, '&gt;')

function packet(record, field, name) {
  if (typeof record[field] === 'boolean') return record[field]
  if (Array.isArray(record.evidence_artifacts)) return record.evidence_artifacts.includes(name)
  return null
}

function feedback(record) {
  if (typeof record.has_feedback_event === 'boolean') return record.has_feedback_event
  if (Array.isArray(record.human_interventions)) return record.human_interventions.some((item) => Boolean(item.feedback_event_ref))
  return null
}

function signal(records, label, predicate) {
  const values = records.map(predicate)
  const denominator = values.filter((value) => value !== null).length
  const count = values.filter((value) => value === true).length
  return { label, count, denominator, unknown: records.length - denominator }
}

function counts(records, extract) {
  const result = new Map()
  for (const record of records) {
    for (const key of new Set(extract(record))) result.set(key, (result.get(key) || 0) + 1)
  }
  return [...result.entries()].sort((a, b) => b[1] - a[1] || String(a[0]).localeCompare(String(b[0])))
}

export function renderAudit(audit) {
  const { records, days, now } = audit
  const missing = (value) => value === null ? null : !value
  const signals = [
    signal(records, 'PR Attention Packet reported absent', (r) => missing(packet(r, 'has_attention_packet', 'PR Attention Packet'))),
    signal(records, 'QA Impact Packet reported absent', (r) => missing(packet(r, 'has_qa_packet', 'QA Impact Packet'))),
    signal(records, 'Feedback event reported present', feedback),
    signal(records, 'Signal-triggered improvement started', (r) => typeof r.signal_trigger?.started === 'boolean' ? r.signal_trigger.started : null),
    signal(records, 'Signal-triggered improvement completed', (r) => r.signal_trigger?.outcome ? r.signal_trigger.outcome === 'completed' : null),
    signal(records, 'Signal-triggered improvement escalated', (r) => r.signal_trigger?.outcome ? r.signal_trigger.outcome === 'escalated' : null),
    signal(records, 'Known gaps reported', (r) => Array.isArray(r.known_gaps) ? r.known_gaps.length > 0 : null),
  ]
  const out = [
    `# Harness Audit - ${new Date(now).toISOString().slice(0, 10)}`, '',
    `**Period:** last ${days} days`,
    `**Window (UTC, inclusive):** ${new Date(audit.cutoff).toISOString()} to ${new Date(now).toISOString()}`,
    `**Records reviewed:** ${records.length} unique, valid, timestamped records in the window`,
    `**Input lines:** ${audit.inputLines}`, '',
    records.length === 0 ? '**Evidence status:** insufficient evidence; no eligible records.' : '**Evidence status:** observed records only; collection completeness and production outcomes are not established.', '',
    '## Input Quality', '', '| Excluded input | Count |', '|---|---|',
    `| Malformed JSON or invalid record shape | ${audit.malformed} |`,
    `| Unknown time (missing timestamp) | ${audit.unknownTime} |`,
    `| Invalid timestamp | ${audit.invalidTime} |`,
    `| Before observation window | ${audit.outsideWindow} |`,
    `| Future timestamp | ${audit.future} |`,
    `| Exact duplicate records | ${audit.duplicates} |`,
    `| Conflicting records with the same identity | ${audit.conflicts} |`, '',
    'Excluded inputs do not enter signal denominators. Undated legacy records are not assigned the filename date.', '',
    '## Signals', '', '| Signal | Count | Observed denominator | Unknown | Rate |', '|---|---|---|---|---|',
  ]
  for (const item of signals) out.push(`| ${item.label} | ${item.count} | ${item.denominator} | ${item.unknown} | ${rate(item.count, item.denominator)} |`)
  out.push('', 'Rates describe reporting among observed records, not compliance, defect prevalence, or improvement effectiveness.', '', '## Layers', '', '| Layer | Records |', '|---|---|')
  const layers = counts(records, (r) => Array.isArray(r.layers) ? r.layers : object(r.files_changed_summary) ? Object.entries(r.files_changed_summary).filter(([, value]) => value > 0).map(([key]) => key) : [])
  for (const [key, value] of layers) out.push(`| ${cell(key)} | ${value} |`)
  if (!layers.length) out.push('| not observed | 0 |')
  out.push('', '## Feedback Categories', '', '| Category | Records |', '|---|---|')
  const categories = counts(records, (r) => [...(r.harness_follow_up || []), ...(typeof r.category === 'string' ? [r.category] : [])].filter((item) => item !== 'none'))
  for (const [key, value] of categories) out.push(`| ${cell(key)} | ${value} |`)
  if (!categories.length) out.push('| not observed | 0 |')
  out.push('', '## Actionable Findings', '')
  const findings = []
  if (!records.length) findings.push('Insufficient evidence to assess the harness. Collect timestamped records before making effectiveness claims.')
  if (audit.sourceMissing) findings.push('The metrics directory does not exist; no collection is demonstrated.')
  if (signals[0].count) findings.push(`${signals[0].count} record(s) report no PR Attention Packet. Check applicability and artifact capture before declaring a workflow miss.`)
  if (signals[1].count) findings.push(`${signals[1].count} record(s) report no QA Impact Packet. Check applicability and artifact capture before declaring a workflow miss.`)
  if (signals[2].denominator && !signals[2].count) findings.push('No feedback events were reported in the records with feedback observations. This does not establish that no corrections occurred.')
  if (audit.malformed || audit.invalidTime || audit.unknownTime) findings.push('Repair invalid or undated records at their producer; do not infer current evidence from filenames.')
  if (audit.conflicts) findings.push('Reconcile conflicting exports against the source; no conflicting version was selected for the audit.')
  if (signals.some((item) => item.unknown)) findings.push('Some signal fields are unknown. Improve capture before interpreting their absence as a failure or success.')
  if (!findings.length) findings.push('No additional findings in the available observations; this is not proof of overall harness effectiveness.')
  out.push(...findings.map((finding) => `- ${finding}`), '')
  return out.join('\n')
}

function argumentsFor(argv) {
  const args = { metricsDir: '.harness/run-metrics', days: 30, out: `.harness/audit/${new Date().toISOString().slice(0, 10)}.md` }
  const names = { '--metrics': 'metricsDir', '--days': 'days', '--out': 'out' }
  for (let i = 0; i < argv.length; i++) {
    const name = Object.hasOwn(names, argv[i]) ? names[argv[i]] : undefined
    if (!name) throw new Error(`Unknown argument: ${argv[i]}`)
    const value = argv[++i]
    if (!value || value.startsWith('--')) throw new Error(`Missing value for ${argv[i - 1]}`)
    args[name] = value
  }
  args.days = parseDays(args.days)
  return args
}

function main() {
  try {
    const args = argumentsFor(process.argv.slice(2))
    const markdown = renderAudit(collectAudit(args))
    const output = resolve(args.out)
    mkdirSync(dirname(output), { recursive: true })
    writeFileSync(output, markdown)
    process.stdout.write(`${markdown}\n`)
  } catch (error) {
    process.stderr.write(`Harness audit failed: ${error.message}\n`)
    process.exitCode = 1
  }
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) main()
