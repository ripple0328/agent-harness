#!/usr/bin/env node
// Advisory by default. --gate requires an explicit evidence policy from the caller.
import { existsSync, readFileSync, readdirSync, writeFileSync, mkdirSync, mkdtempSync, rmSync, lstatSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { tmpdir } from 'node:os'
import { fileURLToPath } from 'node:url'
import { execFileSync } from 'node:child_process'
import { parseStrictJson } from './lib/strict-json.mjs'

const HERE = dirname(fileURLToPath(import.meta.url))
const SCHEMA = JSON.parse(readFileSync(resolve(HERE, '../harness/templates/qa-signal.schema.json'), 'utf8'))
const MAX_SIGNAL_BYTES = 256 * 1024
const MAX_FUTURE_MS = 5 * 60 * 1000
const SEVERITY = { critical: 0, high: 1, medium: 2, low: 3 }

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function validTimestamp(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(value)) return false
  const time = Date.parse(value)
  return Number.isFinite(time) && new Date(time).toISOString() === (value.includes('.') ? value : value.replace('Z', '.000Z'))
}

// Validate the subset used by the checked-in schema, rather than silently coercing input.
// This is deliberately not a general JSON Schema engine.
function validate(value, schema, path = 'signal', errors = []) {
  if (Array.isArray(schema.type)) {
    const type = schema.type.find((candidate) => typeof value === candidate)
    if (!type) errors.push(`${path} must be ${schema.type.join(' or ')}`)
    else validate(value, { ...schema, type }, path, errors)
    return errors
  }
  const correctType = schema.type === 'object' ? isObject(value)
    : schema.type === 'array' ? Array.isArray(value)
      : schema.type === 'number' ? typeof value === 'number' && Number.isFinite(value)
        : typeof value === schema.type
  if (!correctType) {
    errors.push(`${path} must be ${schema.type}`)
    return errors
  }
  if (schema.enum && !schema.enum.includes(value)) errors.push(`${path} has an unknown value`)
  if (schema.type === 'object') {
    for (const key of schema.required || []) {
      if (!Object.hasOwn(value, key)) errors.push(`${path}.${key} is required`)
    }
    for (const key of Object.keys(value)) {
      if (Object.hasOwn(schema.properties || {}, key)) validate(value[key], schema.properties[key], `${path}.${key}`, errors)
      else if (schema.additionalProperties === false) errors.push(`${path}.${key} is not allowed`)
    }
  }
  if (schema.type === 'array') {
    if (schema.maxItems !== undefined && value.length > schema.maxItems) errors.push(`${path} has too many items`)
    for (const [index, item] of value.entries()) validate(item, schema.items, `${path}[${index}]`, errors)
  }
  if (schema.type === 'string') {
    if (schema.minLength !== undefined && value.trim().length < schema.minLength) errors.push(`${path} must not be empty`)
    if (schema.maxLength !== undefined && value.length > schema.maxLength) errors.push(`${path} is too long`)
    if (schema.pattern && !new RegExp(schema.pattern).test(value)) errors.push(`${path} has an invalid format`)
    if (schema.format === 'date-time' && !validTimestamp(value)) errors.push(`${path} must be a valid UTC timestamp`)
  }
  return errors
}

export function validateSignal(signal) {
  return validate(signal, SCHEMA)
}

function readSignals(root, directory) {
  const path = resolve(root, directory)
  if (!existsSync(path)) return []
  let files
  try {
    files = readdirSync(path).filter((file) => file.endsWith('.json')).sort()
  } catch {
    return [{ source: directory, errors: ['Signal directory could not be read'] }]
  }
  return files.map((file) => {
    try {
      const signalPath = join(path, file)
      const stat = lstatSync(signalPath)
      if (!stat.isFile() || stat.size > MAX_SIGNAL_BYTES) return { source: file, errors: ['Signal must be a regular file no larger than 256 KiB'] }
      const json = readFileSync(signalPath, 'utf8')
      const signal = parseStrictJson(json)
      return { source: file, signal, errors: validateSignal(signal) }
    } catch (error) {
      return { source: file, errors: [error.message === 'Duplicate object member in JSON' ? error.message : 'Signal file could not be read or parsed'] }
    }
  })
}

function traceability(root, enabled) {
  if (!enabled) return { state: 'skipped', reason: 'Explicitly excluded with --no-trace; marker coverage is not test execution.', specs: [], orphanRefs: [] }
  let temporary
  try {
    temporary = mkdtempSync(join(tmpdir(), 'harness-qa-trace-'))
    const output = join(temporary, 'trace.json')
    execFileSync(process.execPath, [resolve(HERE, 'trace-acceptance-criteria.mjs'), '--json', output], {
      cwd: root, stdio: 'pipe', timeout: 30_000,
    })
    const trace = JSON.parse(readFileSync(output, 'utf8'))
    if (!Array.isArray(trace.specs) || !Array.isArray(trace.orphanRefs)) throw new Error('Malformed trace report')
    const active = trace.specs.filter((spec) => !spec.terminal && spec.total > 0)
    const gaps = active.some((spec) => spec.untracedHighRisk.length > 0) || trace.orphanRefs.length > 0
    return { ...trace, state: gaps ? 'failed' : active.length ? 'passed' : 'not-verified', reason: active.length ? 'Static marker linkage only; no assertions were executed by this check.' : 'No active acceptance criteria found; test execution is not verified.' }
  } catch {
    return { state: 'not-verified', reason: 'Traceability could not run or its report was invalid. Run qa:trace to diagnose.', specs: [], orphanRefs: [] }
  } finally {
    if (temporary) rmSync(temporary, { recursive: true, force: true })
  }
}

export function buildModel(records, trace, policy = {}, now = Date.now()) {
  const required = new Set(policy.required || [])
  const findings = []
  const dimensions = []
  const areas = new Map()
  const addFinding = (severity, text) => findings.push({ severity, text })
  for (const record of records) {
    const area = record.signal?.area
    if (typeof area === 'string') areas.set(area, (areas.get(area) || 0) + 1)
  }

  for (const record of records) {
    const signal = record.signal
    const errors = [...record.errors]
    const area = typeof signal?.area === 'string' ? signal.area : `invalid:${record.source}`
    if (areas.get(area) > 1) errors.push(`Duplicate area ${area}; evidence is ambiguous`)
    if (errors.length === 0) {
      for (const key of ['revision', 'runId', 'completedAt']) {
        if (!signal[key]) errors.push(`Missing ${key}; evidence is not bound to an identifiable execution`)
      }
      if (policy.revision && signal.revision !== policy.revision) errors.push('Revision does not match the expected revision')
      if (policy.runId && signal.runId !== policy.runId) errors.push('Run ID does not match the expected run')
      if (!policy.revision || !policy.runId) errors.push('Expected revision and run ID were not both supplied; evidence is not matched to the target')
      if (signal.completedAt) {
        const age = now - Date.parse(signal.completedAt)
        if (age > (policy.maxAgeHours ?? 24) * 3_600_000) errors.push('Evidence is stale')
        if (age < -MAX_FUTURE_MS) errors.push('Evidence timestamp is in the future beyond five minutes of clock tolerance')
      }
      if ((signal.metrics || []).some((metric) => metric.gate && metric.ok === undefined)) errors.push('A declared metric gate has no result')
    }

    const valid = record.errors.length === 0
    const metrics = valid ? signal.metrics || [] : []
    const reportedFindings = valid ? signal.findings || [] : []
    const reportedFailure = valid && (signal.status === 'failed' || metrics.some((metric) => metric.ok === false) || reportedFindings.some((finding) => ['critical', 'high'].includes(finding.severity)))
    const state = reportedFailure ? 'failed' : errors.length ? 'not-verified'
      : signal.status === 'passed' ? 'passed' : signal.status === 'skipped' ? 'skipped' : 'not-verified'
    const reason = errors.length ? errors.join('; ') : signal.reason || signal.summary
    dimensions.push({ area, state, required: required.has(area), invalid: !valid || areas.get(area) > 1, source: record.source, reportedStatus: valid ? signal.status : 'invalid', reason, metrics, artifacts: valid ? signal.artifacts || [] : [] })
    if (state === 'failed') addFinding('high', `${area}: ${valid ? signal.summary : 'failed evidence'}`)
    else if (state !== 'passed') addFinding('medium', `${area}: ${reason}`)
    for (const metric of metrics.filter((metric) => metric.ok === false)) addFinding('high', `${area}: ${metric.name} ${metric.value} missed gate ${metric.gate || '(unspecified)'}`)
    for (const finding of reportedFindings) addFinding(finding.severity, `${area}: ${finding.text}`)
  }

  for (const area of required) {
    if (areas.has(area)) continue
    dimensions.push({ area, state: 'not-verified', required: true, source: null, reportedStatus: 'missing', reason: 'Required evidence is missing', metrics: [], artifacts: [] })
    addFinding('medium', `${area}: required evidence is missing`)
  }

  const activeSpecs = trace.specs.filter((spec) => !spec.terminal && spec.total > 0)
  for (const spec of activeSpecs) {
    for (const id of spec.untracedHighRisk) addFinding('high', `${spec.slug}: high-risk criterion ${id} has no traced test.`)
  }
  for (const orphan of trace.orphanRefs) addFinding('medium', `${orphan.file}: cites ${orphan.acs.join(', ')} without a spec anchor.`)
  if (trace.state === 'not-verified') addFinding('medium', trace.reason)
  const failure = dimensions.some((dimension) => dimension.state === 'failed') || trace.state === 'failed'
  const unverified = dimensions.length === 0 || dimensions.some((dimension) => dimension.state === 'not-verified' || dimension.state === 'skipped') || trace.state === 'not-verified'
  const decision = failure ? 'failed' : unverified ? 'not-verified' : 'passed'
  const gateUnverified = required.size === 0 || dimensions.some((dimension) => dimension.invalid || (dimension.required && dimension.state !== 'passed')) || trace.state === 'not-verified'
  const gateDecision = policy.gate ? failure ? 'failed' : gateUnverified ? 'not-verified' : 'passed' : null
  const highest = findings.reduce((rank, finding) => Math.min(rank, SEVERITY[finding.severity] ?? 4), 4)
  const risk = highest <= 1 ? 'High' : highest === 2 ? 'Medium' : decision === 'passed' ? 'Low' : 'Unknown'
  return {
    decision, gateDecision, risk, mode: policy.gate ? 'gate' : 'advisory',
    policy: { required: [...required], revision: policy.revision || null, runId: policy.runId || null, maxAgeHours: policy.maxAgeHours ?? 24 },
    dimensions, traceability: trace, activeSpecs, findings,
    limitations: ['Signal JSON contains producer claims, not cryptographic attestations. Use trusted producers and caller-owned policy.', 'Revision and run equality do not prove checkout cleanliness, artifact integrity, test quality, or behavioral coverage.', 'Traceability scans static markers; a match does not prove a relevant assertion ran or passed.'],
  }
}

function escapeMarkdown(value) {
  return String(value).replace(/[\r\n]+/g, ' ').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/[\\`*_[\]|]/g, '\\$&')
}

export function render(model) {
  const out = ['## QA Brief', '', `**Evidence decision:** ${model.decision} (${model.mode})`, '', `**Risk:** ${model.risk} — highest observed severity; not a quality score.`, '', '### Quality Dimensions', '', '| Area | Required | Decision | Reported status | Evidence / gap |', '|---|---|---|---|---|']
  if (model.gateDecision) out.splice(4, 0, `**Required evidence gate:** ${model.gateDecision}`, '')
  for (const dimension of model.dimensions) out.push(`| ${[dimension.area, dimension.required ? 'yes' : 'no', dimension.state, dimension.reportedStatus, dimension.reason].map(escapeMarkdown).join(' | ')} |`)
  if (!model.dimensions.length) out.push('| none | - | not-verified | missing | No signal files found. |')
  out.push(`| traceability | ${model.traceability.state === 'skipped' ? 'excluded' : 'included'} | ${model.traceability.state} | static linkage | ${escapeMarkdown(model.traceability.reason)} |`, '')
  if (model.policy.revision || model.policy.runId) out.push(`Expected revision: ${escapeMarkdown(model.policy.revision || '(unspecified)')}. Run: ${escapeMarkdown(model.policy.runId || '(unspecified)')}. Maximum age: ${model.policy.maxAgeHours} hours.`, '')
  const metricRows = model.dimensions.flatMap((dimension) => dimension.metrics.map((metric) => [dimension.area, metric.name, metric.value, metric.gate || '-', metric.ok === true ? 'pass' : metric.ok === false ? 'fail' : 'not-verified']))
  if (metricRows.length) {
    out.push('### Metrics', '', '| Area | Metric | Value | Gate | Result |', '|---|---|---|---|---|')
    for (const row of metricRows) out.push(`| ${row.map(escapeMarkdown).join(' | ')} |`)
    out.push('')
  }
  out.push('### Look Here First', '')
  if (!model.findings.length) out.push(model.decision === 'passed' ? 'No reported gaps in the collected evidence. This is not a production approval.' : 'Evidence is insufficient to decide quality.')
  for (const finding of [...model.findings].sort((a, b) => (SEVERITY[a.severity] ?? 4) - (SEVERITY[b.severity] ?? 4))) out.push(`- ${finding.severity.toUpperCase()}: ${escapeMarkdown(finding.text)}`)
  out.push('')
  if (model.activeSpecs.length) {
    out.push('### Acceptance-Criteria Traceability', '', '| Spec | Markers traced | Untraced high-risk |', '|---|---|---|')
    for (const spec of model.activeSpecs) out.push(`| ${escapeMarkdown(spec.slug)} | ${spec.covered}/${spec.total} | ${escapeMarkdown(spec.untracedHighRisk.join(', ') || 'none')} |`)
    out.push('')
  }
  const artifacts = model.dimensions.flatMap((dimension) => dimension.artifacts.map((artifact) => `${dimension.area}: ${artifact}`))
  if (artifacts.length) out.push('### Producer Artifact References', '', ...artifacts.map((artifact) => `- ${escapeMarkdown(artifact)}`), '', 'References are reported by producers; availability and contents have not been verified.', '')
  out.push('### Limits and Human QA Focus', '', ...model.limitations.map((limitation) => `- ${limitation}`), '- Inspect failed, skipped, and not-verified dimensions; record the reason, substitute evidence, residual risk, and owner.', '', '### Harness Feedback', '', '- Capture repeated evidence gaps as candidate feedback; verify a preventive change before promoting it.', '')
  return out.join('\n')
}

export function parseArgs(argv) {
  const options = { signals: '.harness/qa-signals', gate: false, trace: true, required: [], maxAgeHours: 24 }
  const seen = new Set()
  const values = { '--signals': 'signals', '--out': 'out', '--json': 'json', '--revision': 'revision', '--run-id': 'runId', '--required': 'required', '--max-age-hours': 'maxAgeHours' }
  for (let index = 0; index < argv.length; index += 1) {
    const flag = argv[index]
    if (seen.has(flag)) throw new Error(`Duplicate option: ${flag}`)
    seen.add(flag)
    if (flag === '--gate') options.gate = true
    else if (flag === '--no-trace') options.trace = false
    else if (flag === '--help') options.help = true
    else if (Object.hasOwn(values, flag)) {
      const value = argv[++index]
      if (!value?.trim() || value.startsWith('--')) throw new Error(`Missing value for ${flag}`)
      options[values[flag]] = value
    } else throw new Error(`Unknown option: ${flag}`)
  }
  if (typeof options.required === 'string') {
    options.required = options.required.split(',').map((area) => area.trim())
    if (options.required.some((area) => !/^[a-z0-9][a-z0-9._-]*$/.test(area))) throw new Error('--required must contain comma-separated area identifiers')
    if (new Set(options.required).size !== options.required.length) throw new Error('--required contains duplicate areas')
  }
  options.maxAgeHours = Number(options.maxAgeHours)
  if (!Number.isFinite(options.maxAgeHours) || options.maxAgeHours <= 0) throw new Error('--max-age-hours must be positive and finite')
  if (options.gate && !options.help && (!options.revision || !options.runId || options.required.length === 0)) throw new Error('--gate requires --revision, --run-id, and a nonempty --required list')
  if (options.out && options.json && resolve(options.out) === resolve(options.json)) throw new Error('--out and --json must use different paths')
  return options
}

function main() {
  try {
    const policy = parseArgs(process.argv.slice(2))
    if (policy.help) {
      process.stdout.write('Usage: qa-brief.mjs [--signals DIR] [--out FILE] [--json FILE] [--no-trace]\n  [--gate --revision EXACT_REVISION --run-id RUN --required AREA,AREA]\n  [--max-age-hours HOURS] (default 24)\nAdvisory by default; gate exits 1 for failed or unverified evidence, 2 for invalid usage.\n')
      return
    }
    const root = process.cwd()
    const model = buildModel(readSignals(root, policy.signals), traceability(root, policy.trace), policy)
    const write = (path, content) => {
      const output = resolve(root, path)
      mkdirSync(dirname(output), { recursive: true })
      writeFileSync(output, content)
    }
    if (policy.out) write(policy.out, render(model))
    else process.stdout.write(`${render(model)}\n`)
    if (policy.json) write(policy.json, `${JSON.stringify(model, null, 2)}\n`)
    if (policy.gate && model.gateDecision !== 'passed') process.exitCode = 1
  } catch (error) {
    process.stderr.write(`QA brief error: ${error.message}\n`)
    process.exitCode = 2
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main()
