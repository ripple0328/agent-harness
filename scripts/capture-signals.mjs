#!/usr/bin/env node
// Project-local metadata collection. Never executes instructions from events.
import { spawn } from 'node:child_process'
import { createHash, randomUUID } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, readdirSync, lstatSync, realpathSync, unlinkSync, writeFileSync } from 'node:fs'
import { isAbsolute, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseStrictJson } from './lib/strict-json.mjs'

const TYPES = new Set(['command', 'correction', 'review_rework', 'rollback', 'escaped_defect', 'release'])
const OUTCOMES = new Set(['passed', 'failed', 'unknown'])
const FIELDS = new Set(['schema_version', 'event_id', 'source', 'run_id', 'revision', 'type', 'label', 'outcome', 'timestamp', 'duration_ms', 'exit_code', 'signal'])
const ID = /^[a-zA-Z0-9][a-zA-Z0-9._:-]{0,127}$/
const iso = (v) => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(v) && Number.isFinite(Date.parse(v))

export function validateEvent(event, now = Date.now()) {
  if (!event || typeof event !== 'object' || Array.isArray(event)) throw new Error('Event must be an object')
  if (Object.keys(event).some((key) => !FIELDS.has(key))) throw new Error('Unexpected event field; raw text and payloads are not accepted')
  if (event.schema_version !== '1.0') throw new Error('Unsupported schema_version')
  for (const field of ['event_id', 'source', 'run_id', 'revision', 'label']) {
    if (typeof event[field] !== 'string' || !ID.test(event[field])) throw new Error(`Invalid ${field}; use a non-sensitive opaque identifier`)
  }
  if (!TYPES.has(event.type) || !OUTCOMES.has(event.outcome)) throw new Error('Invalid type or outcome')
  if (!iso(event.timestamp) || Date.parse(event.timestamp) > now + 300_000) throw new Error('Invalid or future timestamp')
  if (event.duration_ms !== undefined && (!Number.isSafeInteger(event.duration_ms) || event.duration_ms < 0)) throw new Error('Invalid duration_ms')
  if (event.exit_code !== undefined && event.exit_code !== null && (!Number.isInteger(event.exit_code) || event.exit_code < 0 || event.exit_code > 255)) throw new Error('Invalid exit_code')
  if (event.signal !== undefined && event.signal !== null && !/^SIG[A-Z0-9]+$/.test(event.signal)) throw new Error('Invalid signal')
  if (event.type === 'command') {
    if (event.duration_ms === undefined || event.exit_code === undefined || event.signal === undefined) throw new Error('Command evidence is incomplete')
    if (!((Number.isInteger(event.exit_code) && event.signal === null) || (event.exit_code === null && typeof event.signal === 'string'))) throw new Error('Command must have exactly one termination mode')
    const passed = event.exit_code === 0 && event.signal === null
    if ((passed && event.outcome !== 'passed') || (!passed && event.outcome !== 'failed')) throw new Error('Command outcome contradicts exit evidence')
  }
  return event
}

function canonical(event) {
  return JSON.stringify(Object.fromEntries(Object.keys(event).sort().map((k) => [k, event[k]])))
}

// Disallow links at every segment. These are local project artifacts, not an
// authentication mechanism against another process running as the same user.
function directory(root, dir, create = false) {
  const base = realpathSync(root)
  const target = resolve(base, dir)
  const rel = relative(base, target)
  if (!rel || rel.startsWith('..') || isAbsolute(rel)) throw new Error('Signal directory must be inside project root')
  let current = base
  for (const segment of rel.split('/')) {
    current = join(current, segment)
    if (existsSync(current) || (() => { try { return lstatSync(current).isSymbolicLink() } catch { return false } })()) {
      const info = lstatSync(current)
      if (info.isSymbolicLink() || !info.isDirectory()) throw new Error('Unsafe signal directory')
    } else if (create) mkdirSync(current, { mode: 0o700 })
    else return null
  }
  return target
}

export function capture(root, dir, event) {
  validateEvent(event)
  const target = directory(root, dir, true)
  const key = createHash('sha256').update(`${event.source}\0${event.event_id}`).digest('hex')
  const path = join(target, `${key}.json`)
  const data = `${canonical(event)}\n`
  try {
    // Exclusive creation prevents overwriting a replay or following a link.
    writeFileSync(path, data, { flag: 'wx', mode: 0o600 })
    return { captured: true, event_id: event.event_id }
  } catch (error) {
    if (error.code !== 'EEXIST') throw error
    if (!lstatSync(path).isFile() || lstatSync(path).isSymbolicLink() || lstatSync(path).size > 8192) throw new Error('Unsafe existing event')
    const prior = validateEvent(parseStrictJson(readFileSync(path, 'utf8')))
    if (canonical(prior) !== canonical(event)) throw new Error('Conflicting replay for source and event_id')
    return { captured: false, event_id: event.event_id }
  }
}

export function loadEvents(root, dir, { now = Date.now(), days = 30 } = {}) {
  if (!Number.isFinite(days) || days <= 0) throw new Error('days must be positive')
  const target = directory(root, dir)
  const records = [], invalid = [], expired = []
  if (!target) return { records, invalid, expired }
  const files = readdirSync(target).filter((f) => f.endsWith('.json')).sort()
  if (files.length > 10000) throw new Error('Event limit exceeded; use a narrower directory or retention policy')
  const seen = new Map()
  for (const file of files) {
    try {
      const path = join(target, file), stat = lstatSync(path)
      if (stat.isSymbolicLink() || !stat.isFile() || stat.size > 8192) throw new Error('Unsafe or oversized event')
      const event = validateEvent(parseStrictJson(readFileSync(path, 'utf8')), now)
      const key = `${event.source}\0${event.event_id}`
      if (seen.has(key)) throw new Error('Duplicate identity in event directory')
      seen.set(key, true)
      if (Date.parse(event.timestamp) < now - days * 86400000) expired.push(file)
      else records.push(event)
    } catch (error) { invalid.push({ file, reason: error instanceof SyntaxError ? 'Invalid JSON' : error.message }) }
  }
  return { records, invalid, expired }
}

export function summarize(loaded) {
  const { records, invalid, expired } = loaded
  const groups = new Map()
  for (const e of records) {
    const key = `${e.type}:${e.label}`
    if (!groups.has(key)) groups.set(key, { type: e.type, label: e.label, observations: 0, passed: 0, failed: 0, unknown: 0, runs: new Set() })
    const row = groups.get(key)
    row.observations++; row[e.outcome]++; row.runs.add(JSON.stringify([e.source, e.run_id]))
  }
  return {
    evidence: invalid.length ? 'incomplete' : records.length ? 'observed' : 'unavailable',
    observations: records.length,
    unique_runs: new Set(records.map((e) => JSON.stringify([e.source, e.run_id]))).size,
    groups: [...groups.values()].map(({ runs, ...row }) => ({ ...row, unique_runs: runs.size })).sort((a,b) => `${a.type}:${a.label}`.localeCompare(`${b.type}:${b.label}`)),
    invalid, expired_count: expired.length,
    interpretation: 'Counts are observations, not causes, failure rates for unobserved work, or permission to change rules. Adapters determine coverage; absent feedback is unknown.'
  }
}

async function run(args) {
  const verb = args.shift()
  const split = args.indexOf('--'), command = split >= 0 ? args.slice(split + 1) : []
  const opts = split >= 0 ? args.slice(0, split) : args
  const allowed = new Set(['--root', '--dir', '--input', '--label', '--run-id', '--revision', '--days'])
  const values = {}
  for (let i = 0; i < opts.length; i += 2) {
    if (!allowed.has(opts[i]) || !opts[i+1] || values[opts[i]] !== undefined) throw new Error('Invalid CLI option')
    values[opts[i]] = opts[i+1]
  }
  const root = resolve(values['--root'] || process.cwd()), dir = values['--dir'] || '.harness/signals'
  if (verb === 'record') {
    if (!values['--input']) throw new Error('record requires --input JSON-file')
    const input = resolve(root, values['--input'])
    const stat = lstatSync(input)
    if (!stat.isFile() || stat.size > 8192) throw new Error('Input must be a regular JSON file no larger than 8 KiB')
    process.stdout.write(`${JSON.stringify(capture(root, dir, parseStrictJson(readFileSync(input, 'utf8'))))}\n`)
  } else if (verb === 'summary' || verb === 'prune') {
    const loaded = loadEvents(root, dir, { days: Number(values['--days'] || 30) })
    if (verb === 'summary') process.stdout.write(`${JSON.stringify(summarize(loaded), null, 2)}\n`)
    else {
      if (!values['--days']) throw new Error('prune requires explicit --days retention')
      const target = directory(root, dir)
      for (const file of loaded.expired) unlinkSync(join(target, file))
      process.stdout.write(`${JSON.stringify({ removed: loaded.expired.length, invalid: loaded.invalid })}\n`)
    }
    if (loaded.invalid.length) process.exitCode = 2
  } else if (verb === 'run') {
    if (!command.length) throw new Error('run requires -- executable arg...')
    const start = Date.now()
    const event = { schema_version: '1.0', event_id: randomUUID(), source: 'command-wrapper', run_id: values['--run-id'], revision: values['--revision'], type: 'command', label: values['--label'], outcome: 'passed', timestamp: new Date(start).toISOString(), duration_ms: 0, exit_code: 0, signal: null }
    validateEvent(event)
    directory(root, dir, true) // Validate before running the authorized command.
    const child = spawn(command[0], command.slice(1), { cwd: root, shell: false, stdio: 'inherit' })
    const handlers = ['SIGINT', 'SIGTERM'].map((signal) => {
      const handler = () => child.kill(signal)
      process.on(signal, handler)
      return [signal, handler]
    })
    let spawnError = false
    child.on('error', () => { spawnError = true })
    await new Promise((done) => child.on('close', (code, signal) => {
      for (const [name, handler] of handlers) process.off(name, handler)
      event.duration_ms = Date.now() - start
      event.exit_code = spawnError ? 127 : code
      event.signal = signal
      event.outcome = event.exit_code === 0 && !signal ? 'passed' : 'failed'
      let evidenceFailed = false
      try { capture(root, dir, event) } catch (error) { evidenceFailed = true; process.stderr.write(`Signal capture failed: ${error.message}\n`) }
      process.exitCode = event.exit_code || (signal === 'SIGINT' ? 130 : signal === 'SIGTERM' ? 143 : signal ? 1 : evidenceFailed ? 2 : 0)
      done()
    }))
  } else throw new Error('Use run, record, summary, or prune')
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  run(process.argv.slice(2)).catch((error) => { process.stderr.write(`${error instanceof SyntaxError ? 'Invalid JSON' : error.message}\n`); process.exitCode = 2 })
}
