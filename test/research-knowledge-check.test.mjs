import test from 'node:test'
import assert from 'node:assert/strict'

import {
  validateApplicationLedger,
  validateResearchNote,
  validateSourceRegistry,
} from '../scripts/research-knowledge-check.mjs'

const completeNote = `
## Run Context
**Execution provenance:** agent and runtime recorded
## Sources Reviewed
https://example.com/release
## Signals
## Application Decision
Decision: no qualified change
## Learning Article
## Verification
## Cross-Project Feedback
## Knowledge Check
## Answer Key
## Next Watchlist
`

test('accepts a complete research note', () => {
  assert.deepEqual(validateResearchNote(completeNote), [])
})

test('reports missing research-note sections', () => {
  const errors = validateResearchNote('Decision: applied', 'broken.md')
  assert.ok(errors.some((error) => error.includes('## Sources Reviewed')))
  assert.ok(errors.some((error) => error.includes('## Learning Article')))
  assert.ok(errors.some((error) => error.includes('## Knowledge Check')))
  assert.ok(errors.some((error) => error.includes('missing execution provenance')))
  assert.ok(errors.some((error) => error.includes('missing a source URL')))
})

test('validates source priorities and ledger headers', () => {
  assert.deepEqual(
    validateSourceRegistry('## Curated Sources\n| core | https://example.com |'),
    []
  )
  assert.deepEqual(
    validateApplicationLedger('## Decisions\n| Date | Signal | Decision |'),
    []
  )
})
