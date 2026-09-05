#!/usr/bin/env node

import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { basename, join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

export const REQUIRED_NOTE_HEADINGS = [
  '## Run Context',
  '## Sources Reviewed',
  '## Signals',
  '## Application Decision',
  '## Learning Article',
  '## Verification',
  '## Cross-Project Feedback',
  '## Knowledge Check',
  '## Answer Key',
  '## Next Watchlist',
]

const REQUIRED_FILES = [
  'docs/ai-fsd/README.md',
  'docs/ai-fsd/sources.md',
  'docs/ai-fsd/application-ledger.md',
  'docs/ai-fsd/adoption-and-feedback.md',
  'harness/tasks/research-harness.md',
  'harness/workflows/continuous-research-improvement.md',
  'harness/templates/research-signal.md',
]

export function validateResearchNote(text, name = 'research note') {
  const errors = []
  for (const heading of REQUIRED_NOTE_HEADINGS) {
    if (!text.includes(heading)) errors.push(`${name}: missing ${heading}`)
  }
  if (!/\*\*Execution provenance:\*\*/i.test(text)) {
    errors.push(`${name}: missing execution provenance`)
  }
  if (!/\b(applied|experiment|deferred|rejected|no qualified change)\b/i.test(text)) {
    errors.push(`${name}: missing a recognized application decision`)
  }
  if (!/https?:\/\//.test(text) && !/connected X bookmarks and likes/i.test(text)) {
    errors.push(`${name}: missing a source URL or connected-source record`)
  }
  return errors
}

export function validateSourceRegistry(text) {
  const errors = []
  if (!text.includes('## Curated Sources')) errors.push('sources.md: missing curated sources section')
  if (!/\|\s*(core|watch|paused)\s*\|/i.test(text)) {
    errors.push('sources.md: missing a source priority row')
  }
  if (!/https?:\/\//.test(text)) errors.push('sources.md: missing source URLs')
  return errors
}

export function validateApplicationLedger(text) {
  const errors = []
  if (!text.includes('## Decisions')) errors.push('application-ledger.md: missing decisions section')
  if (!/\|\s*Date\s*\|\s*Signal\s*\|\s*Decision\s*\|/i.test(text)) {
    errors.push('application-ledger.md: missing decisions table header')
  }
  return errors
}

export function validateResearchKnowledge(root = process.cwd()) {
  const errors = []

  for (const relativePath of REQUIRED_FILES) {
    if (!existsSync(resolve(root, relativePath))) errors.push(`missing required file: ${relativePath}`)
  }

  const sourcesPath = resolve(root, 'docs/ai-fsd/sources.md')
  if (existsSync(sourcesPath)) errors.push(...validateSourceRegistry(readFileSync(sourcesPath, 'utf8')))

  const ledgerPath = resolve(root, 'docs/ai-fsd/application-ledger.md')
  if (existsSync(ledgerPath)) {
    errors.push(...validateApplicationLedger(readFileSync(ledgerPath, 'utf8')))
  }

  const researchDir = resolve(root, 'docs/ai-fsd/research')
  if (!existsSync(researchDir)) {
    errors.push('missing research directory: docs/ai-fsd/research')
  } else {
    const notes = readdirSync(researchDir).filter((file) => file.endsWith('.md'))
    if (notes.length === 0) errors.push('docs/ai-fsd/research: no dated research notes')
    for (const file of notes) {
      if (!/^\d{4}-\d{2}-\d{2}(?:-[a-z0-9-]+)?\.md$/.test(file)) {
        errors.push(`docs/ai-fsd/research/${file}: filename must start with YYYY-MM-DD`)
      }
      const text = readFileSync(join(researchDir, file), 'utf8')
      errors.push(...validateResearchNote(text, basename(file)))
    }
  }

  return errors
}

function main() {
  const errors = validateResearchKnowledge()
  if (errors.length > 0) {
    process.stderr.write(`Research knowledge check failed:\n${errors.map((item) => `- ${item}`).join('\n')}\n`)
    process.exitCode = 1
    return
  }
  process.stdout.write('Research knowledge check passed.\n')
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main()
