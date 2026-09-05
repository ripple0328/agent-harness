#!/usr/bin/env node
// Maps feature-spec acceptance criteria to tests that cite them.
//
// Convention:
//   - Specs live under config.specsDir.
//   - ACs are markdown list items starting with **ACn.
//   - A test file declares the covered spec with: @spec <slug>
//   - Tests reference criteria with bare ACn tokens.
//
// Usage:
//   node scripts/trace-acceptance-criteria.mjs
//   node scripts/trace-acceptance-criteria.mjs --spec save-draft
//   node scripts/trace-acceptance-criteria.mjs --json out.json
//   node scripts/trace-acceptance-criteria.mjs --markdown out.md
//   node scripts/trace-acceptance-criteria.mjs --gate

import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync,
} from 'node:fs'
import { basename, dirname, join, relative, resolve } from 'node:path'
import { parseStrictJson } from './lib/strict-json.mjs'

const ROOT = process.cwd()

const DEFAULT_CONFIG = {
  specsDir: 'specs/features',
  terminalSpecStatuses: ['done', 'retired', 'cancelled'],
  testFiles: [
    { dir: 'src', patterns: ['\\.(test|spec)\\.[^.]+$'] },
    { dir: 'test', patterns: ['\\.[^.]+$'] },
    { dir: 'e2e', patterns: ['\\.(test|spec)\\.[^.]+$'] },
  ],
  skipDirs: [
    'node_modules',
    '.git',
    'dist',
    'build',
    'coverage',
    'test-results',
    'vendor',
  ],
  highRiskKeywords: [
    'authorization', 'permission', 'credential', 'secret', 'privacy',
    'delete', 'irreversible', 'integrity', 'concurrency', 'recovery',
    'compatibility', 'untrusted',
  ],
}

function arg(flag) {
  const i = process.argv.indexOf(flag)
  return i >= 0 ? process.argv[i + 1] : undefined
}

function loadConfig() {
  const explicit = arg('--config')
  const candidates = [
    explicit,
    'harness.config.json',
    'harness.config.example.json',
  ].filter(Boolean)

  for (const candidate of candidates) {
    const path = resolve(ROOT, candidate)
    if (!existsSync(path)) {
      if (candidate === explicit) throw new Error(`Explicit config not found: ${candidate}`)
      continue
    }
    try {
      const parsed = parseStrictJson(readFileSync(path, 'utf8'))
      return { ...DEFAULT_CONFIG, ...parsed }
    } catch (err) {
      throw new Error(`Failed to read ${candidate}: ${err.message}`)
    }
  }

  return DEFAULT_CONFIG
}

const config = loadConfig()
const SPECS_DIR = resolve(ROOT, config.specsDir)
const SKIP_DIRS = new Set(config.skipDirs || [])
const TERMINAL_STATUSES = new Set(
  (config.terminalSpecStatuses || []).map((s) => String(s).toLowerCase())
)
const HIGH_RISK_KEYWORDS = config.highRiskKeywords || []

function isDirectory(path) {
  try {
    return statSync(path).isDirectory()
  } catch {
    return false
  }
}

function walk(dir, matchers, out = []) {
  let entries
  try {
    entries = readdirSync(dir, { withFileTypes: true })
  } catch {
    return out
  }

  for (const entry of entries) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue
      walk(full, matchers, out)
      continue
    }

    if (!entry.isFile()) continue
    if (matchers.some((re) => re.test(full))) out.push(full)
  }

  return out
}

function testFiles() {
  const files = []
  for (const group of config.testFiles || []) {
    const dir = resolve(ROOT, group.dir)
    if (!isDirectory(dir)) continue
    const matchers = (group.patterns || []).map((p) => new RegExp(p))
    files.push(...walk(dir, matchers))
  }
  return [...new Set(files)]
}

function listSpecs() {
  if (!isDirectory(SPECS_DIR)) return []
  return readdirSync(SPECS_DIR)
    .filter((f) => f.endsWith('.md'))
    .map((f) => join(SPECS_DIR, f))
}

function specSlug(path) {
  return basename(path, '.md')
}

function inferRisk(line) {
  const explicit = line.match(/\(risk:\s*(high|medium|low)\)/i)
  if (explicit) return explicit[1].toLowerCase()
  const lower = line.toLowerCase()
  if (HIGH_RISK_KEYWORDS.some((keyword) => lower.includes(keyword.toLowerCase()))) {
    return 'high'
  }
  return 'medium'
}

function parseSpec(path) {
  const text = readFileSync(path, 'utf8')
  const statusMatch = text.match(/^\*\*Status:\*\*\s*(.+)$/m)
  const status = statusMatch ? statusMatch[1].trim().toLowerCase() : 'unknown'
  const criteria = []
  const lines = text.split('\n')
  const acRe = /^\s*[-*]\s*(?:\[[ xX]\]\s*)?\*\*\s*(AC\d+)\b\*{0,2}\s*(.*)$/
  const nextListOrHeadingRe = /^\s*(?:[-*]\s*(?:\[[ xX]\]\s*)?\*\*|#{1,6}\s+)/

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i]
    const match = line.match(acRe)
    if (!match) continue

    const continuation = []
    for (let j = i + 1; j < lines.length; j += 1) {
      const next = lines[j]
      if (nextListOrHeadingRe.test(next)) break
      if (next.trim() === '') break
      if (!/^\s+/.test(next)) break
      continuation.push(next.trim())
      i = j
    }

    const block = [line, ...continuation].join(' ')
    const id = match[1]
    const checked = /\[[xX]\]/.test(line)
    const body = [match[2] || '', ...continuation]
      .join(' ')
      .replace(/\*\*/g, '')
      .replace(/^[\s:.-]+/, '')
      .trim()

    criteria.push({
      id,
      text: body,
      checked,
      risk: inferRisk(block),
    })
  }

  return { status, criteria }
}

function indexTests() {
  const bySpec = new Map()
  const orphanRefs = []

  for (const file of testFiles()) {
    let text
    try {
      text = readFileSync(file, 'utf8')
    } catch {
      continue
    }

    const specMatches = [
      ...text.matchAll(/@spec\s+([a-z0-9][a-z0-9._-]*)/gi),
    ].map((m) => m[1])
    const acRefs = new Set([...text.matchAll(/\bAC(\d+)\b/g)].map((m) => `AC${m[1]}`))
    if (acRefs.size === 0) continue

    const rel = relative(ROOT, file)
    if (specMatches.length === 0) {
      orphanRefs.push({ file: rel, acs: [...acRefs].sort(compareAc) })
      continue
    }

    for (const slug of specMatches) {
      if (!bySpec.has(slug)) bySpec.set(slug, new Map())
      const acMap = bySpec.get(slug)
      for (const ac of acRefs) {
        if (!acMap.has(ac)) acMap.set(ac, new Set())
        acMap.get(ac).add(rel)
      }
    }
  }

  return { bySpec, orphanRefs }
}

function compareAc(a, b) {
  return Number(a.replace('AC', '')) - Number(b.replace('AC', ''))
}

function buildReport({ onlySpec } = {}) {
  const { bySpec, orphanRefs } = indexTests()
  const specs = []

  for (const path of listSpecs()) {
    const slug = specSlug(path)
    if (onlySpec && slug !== onlySpec) continue

    const parsed = parseSpec(path)
    if (parsed.criteria.length === 0) continue
    const acMap = bySpec.get(slug) || new Map()
    const rows = parsed.criteria.map((criterion) => {
      const tests = [...(acMap.get(criterion.id) || new Set())].sort()
      return {
        ...criterion,
        tests,
        covered: tests.length > 0,
      }
    })

    const total = rows.length
    const covered = rows.filter((row) => row.covered).length
    const untracedHighRisk = rows
      .filter((row) => !row.covered && row.risk === 'high')
      .map((row) => row.id)

    specs.push({
      slug,
      status: parsed.status,
      terminal: TERMINAL_STATUSES.has(parsed.status),
      total,
      covered,
      coverage: total ? Math.round((covered / total) * 100) : 0,
      untracedHighRisk,
      rows,
    })
  }

  return { specs, orphanRefs }
}

const RISK_ORDER = { high: 0, medium: 1, low: 2 }

function renderMarkdown(report, { onlySpec } = {}) {
  const out = []

  for (const spec of report.specs) {
    out.push(`#### \`${spec.slug}\` - ${spec.covered}/${spec.total} criteria traced (${spec.coverage}%)`)
    out.push('')

    if (spec.untracedHighRisk.length > 0 && !spec.terminal) {
      out.push(`> HIGH-RISK UNTRACED: ${spec.untracedHighRisk.join(', ')}`)
      out.push('')
    }

    const sortedRows = [...spec.rows].sort((a, b) => {
      return RISK_ORDER[a.risk] - RISK_ORDER[b.risk] || compareAc(a.id, b.id)
    })

    out.push('| AC | Risk | Traced | Tests |')
    out.push('|---|---|---|---|')
    for (const row of sortedRows) {
      const traced = row.covered ? 'yes' : row.risk === 'high' ? 'no - high risk' : 'no'
      const tests = row.tests.length ? row.tests.map((t) => `\`${t}\``).join('<br>') : '-'
      const text = row.text.length > 72 ? `${row.text.slice(0, 69)}...` : row.text
      out.push(`| **${row.id}** ${escapePipes(text)} | ${row.risk} | ${traced} | ${tests} |`)
    }
    out.push('')
  }

  if (!onlySpec && report.orphanRefs.length > 0) {
    out.push('### Orphan AC References')
    out.push('')
    out.push('These files cite AC ids but do not declare `@spec <slug>`, so they trace nothing.')
    out.push('')
    for (const orphan of report.orphanRefs) {
      out.push(`- \`${orphan.file}\` -> ${orphan.acs.join(', ')}`)
    }
    out.push('')
  }

  if (out.length === 0) {
    out.push('No acceptance criteria found.')
  }

  return out.join('\n')
}

function escapePipes(text) {
  return text.replace(/\|/g, '\\|')
}

function main() {
  const onlySpec = arg('--spec')
  const jsonOut = arg('--json')
  const mdOut = arg('--markdown')
  const gate = process.argv.includes('--gate')

  const report = buildReport({ onlySpec })

  if (jsonOut) {
    mkdirSync(dirname(resolve(ROOT, jsonOut)), { recursive: true })
    writeFileSync(resolve(ROOT, jsonOut), JSON.stringify(report, null, 2))
  }
  if (mdOut) {
    mkdirSync(dirname(resolve(ROOT, mdOut)), { recursive: true })
    writeFileSync(resolve(ROOT, mdOut), renderMarkdown(report, { onlySpec }))
  }
  if (!jsonOut && !mdOut) process.stdout.write(`${renderMarkdown(report, { onlySpec })}\n`)

  if (!gate) return

  let failed = report.specs.length === 0
  if (failed) process.stderr.write('ERROR: No acceptance criteria found for the requested scope; trace coverage is not verified.\n')
  for (const spec of report.specs) {
    if (spec.terminal) continue
    if (spec.untracedHighRisk.length === 0) continue
    process.stderr.write(
      `ERROR ${spec.slug}: high-risk acceptance criteria with no tests: ${spec.untracedHighRisk.join(', ')}\n`
    )
    failed = true
  }

  if (!onlySpec) {
    for (const orphan of report.orphanRefs) {
      process.stderr.write(
        `ERROR ${orphan.file}: cites ${orphan.acs.join(', ')} but has no @spec <slug> anchor.\n`
      )
      failed = true
    }
  }

  if (failed) process.exit(1)
}

main()
