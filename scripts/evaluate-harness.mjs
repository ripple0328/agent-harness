#!/usr/bin/env node
// Compares independently produced paired outcomes. It does not run an agent,
// establish the truth of graders, or authorize promotion.
import { readFileSync, lstatSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseStrictJson } from './lib/strict-json.mjs'

const nonempty = (v) => typeof v === 'string' && v.trim().length > 0
const finite = (v) => typeof v === 'number' && Number.isFinite(v) && v >= 0
function requireThat(ok, message) { if (!ok) throw new Error(message) }

export function evaluate(input) {
  const errors = [], regressions = [], improvements = [], targetImprovements = []
  try {
    requireThat(input && typeof input === 'object' && input.schema_version === '1.0', 'Unsupported evaluation')
    for (const key of ['experiment_id','baseline','candidate','executor','task_set','grader','run_ref']) requireThat(nonempty(input[key]), `Missing ${key}`)
    requireThat(input.baseline !== input.candidate, 'Baseline and candidate must be distinct frozen versions')
    requireThat(input.holdout_isolated === true, 'Held-out cases must be isolated from candidate authoring')
    requireThat(input.grader_calibrated === true, 'Grader must be calibrated against independent outcomes')
    requireThat(input.budgets && finite(input.budgets.max_duration_ms) && finite(input.budgets.max_cost_units), 'Explicit time and cost budgets required')
    requireThat(nonempty(input.budgets.cost_unit), 'cost_unit required (tokens, currency or declared unit)')
    requireThat(Number.isSafeInteger(input.min_trials) && input.min_trials >= 1, 'min_trials must be declared before evaluation')
    requireThat(Array.isArray(input.cases) && input.cases.length > 0, 'No cases')
    requireThat(input.cases.length <= 1000, 'Too many cases')
    const suites = new Set(), ids = new Set()
    for (const c of input.cases) {
      requireThat(c && nonempty(c.id) && !ids.has(c.id), 'Missing or duplicate case id')
      ids.add(c.id)
      requireThat(['motivating','regression','holdout'].includes(c.suite), `Invalid suite: ${c.id}`)
      suites.add(c.suite)
      requireThat(Array.isArray(c.trials) && c.trials.length >= input.min_trials && c.trials.length <= 100, `Insufficient or excessive trials: ${c.id}`)
      const trials = new Set()
      for (const trial of c.trials) {
        requireThat(nonempty(trial.id) && !trials.has(trial.id), `Duplicate/missing trial: ${c.id}`)
        trials.add(trial.id)
        for (const side of ['baseline','candidate']) {
          const r = trial[side]
          requireThat(r && typeof r.success === 'boolean' && typeof r.invariants_preserved === 'boolean' && typeof r.false_positive === 'boolean', `Incomplete outcome: ${c.id}/${side}`)
          requireThat(finite(r.duration_ms) && finite(r.cost_units) && nonempty(r.evidence_ref), `Missing execution evidence or resource measurement: ${c.id}/${side}`)
        }
        const b = trial.baseline, n = trial.candidate, label = `${c.id}/${trial.id}`
        if (c.suite !== 'motivating' && !n.success) regressions.push(`${label}: control did not demonstrate its required outcome`)
        if (!n.invariants_preserved) regressions.push(`${label}: candidate violates a retained invariant`)
        if (b.success && !n.success) regressions.push(`${label}: previously successful outcome regressed`)
        if (!b.false_positive && n.false_positive) regressions.push(`${label}: new false positive`)
        if (n.duration_ms > input.budgets.max_duration_ms || n.cost_units > input.budgets.max_cost_units) regressions.push(`${label}: candidate exceeds a declared resource budget`)
        if (n.success && ((!b.success) || (b.false_positive && !n.false_positive))) {
          improvements.push(label)
          if (c.suite === 'motivating') targetImprovements.push(label)
        }
      }
    }
    for (const suite of ['motivating','regression','holdout']) requireThat(suites.has(suite), `Missing ${suite} suite`)
  } catch (error) { errors.push(error.message) }
  const eligible = errors.length === 0 && regressions.length === 0 && targetImprovements.length > 0
  return {
    verdict: errors.length ? 'not-verified' : regressions.length ? 'rejected' : targetImprovements.length ? 'eligible-for-canary' : 'no-measured-improvement',
    eligible, errors, regressions, improvements, targetImprovements,
    next: eligible ? 'Review execution evidence and grader calibration; canary in an adopting project with rollback and delayed outcome monitoring. No automatic promotion.' : 'Keep the baseline; resolve evidence gaps or revise the candidate without exposing held-out answers.',
    limits: 'This validates supplied measurements, not their authenticity or causal significance. One trial proves no statistical reliability; choose repetitions and thresholds for the claim before testing. Cost-only or speed-only gains need a separate predeclared experiment.'
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const args = process.argv.slice(2)
    requireThat(args.length === 2 && args[0] === '--input', 'Usage: evaluate-harness.mjs --input evaluation.json')
    const stat = lstatSync(args[1])
    requireThat(stat.isFile() && stat.size <= 2_000_000, 'Evaluation must be a regular file no larger than 2 MB')
    const result = evaluate(parseStrictJson(readFileSync(args[1], 'utf8')))
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`)
    if (!result.eligible) process.exitCode = 1
  } catch (error) { process.stderr.write(`${error instanceof SyntaxError ? 'Invalid evaluation JSON' : error.message}\n`); process.exitCode = 2 }
}
