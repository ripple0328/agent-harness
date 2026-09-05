# Local tool reference

Use this page after [the daily workflow](getting-started.md) is clear. All commands
below run from the project root. The supplied tools require Node.js 20+ and no
third-party dependencies; they do not dictate the application's technology stack.

Names such as `RUN_ID` and `REVISION` are placeholders. Replace them with the
actual run/attempt and an immutable identity for the inputs being checked. A
moving branch name is insufficient; a Git commit alone also omits uncommitted
changes. A project adapter can derive a reviewed snapshot identity.

## Choose the right input

| Tool | Reads | Produces | Does not establish |
|---|---|---|---|
| `capture-signals.mjs` | Authorized command or normalized feedback JSON | Minimal observations and summaries | Root cause, test coverage or complete collection |
| `context-pack.mjs` | Reviewed context records and current source files | Bounded reference pack on stdout | Semantic truth or automatic agent context injection |
| `trace-acceptance-criteria.mjs` | Spec/test files and path configuration | Static AC marker links | Whether assertions executed or passed |
| `qa-brief.mjs` | QA producer JSON plus optional AC tracing | Per-area report and explicit gate result | Authenticity of producer claims or production approval |
| `evaluate-harness.mjs` | Paired measured baseline/candidate outcomes | Eligibility for a limited canary | Actual agent execution or causal/statistical proof |
| `harness-audit.mjs` | Timestamped run-trace/PR-metric JSONL | Windowed audit with known denominators | Outcomes from unobserved work |

Passive events, QA signals and audit run traces are separate formats. A command
wrapper creates passive events; it does not automatically create QA signals or
full audit traces.

## Capture a normal check

This repository uses `npm test`; replace that final command with the actual
check in an adopting project:

```bash
node scripts/capture-signals.mjs run --label tests --run-id RUN_ID --revision REVISION -- npm test
node scripts/capture-signals.mjs summary --days 30
```

The wrapper executes the supplied command without a shell, preserves its failure
status and saves minimal outcome metadata. It does not persist the command's
output, arguments or environment. A successful command whose event cannot be
saved exits 2. Collection coverage extends only to wrapped commands or explicit
adapter submissions.

An adapter can submit normalized metadata with:

```bash
node scripts/capture-signals.mjs record --input path/to/feedback-event.json
```

Use [the feedback schema](../harness/templates/feedback-signal.schema.json).
Choose non-sensitive identifiers. Exact replays are ignored; conflicting ones
are rejected. `summary --days` filters by age without deleting. To apply a chosen
retention period, `prune --days 30` deletes expired valid signal files. Nothing
schedules retention automatically. See
[passive feedback](../harness/workflows/passive-feedback.md) for full semantics.

## Build task context

Create at least one reviewed record using
[the record example](../harness/templates/context-record.example.json) and
[schema](../harness/templates/context-record.schema.json). Set actual source
hashes, scope, verification/expiry timestamps and status after verifying the
claim. The checked-in example is retracted and cannot supply project evidence.

```bash
node scripts/context-pack.mjs --root /absolute/project --records-dir .harness/context --scope path/to/component --format markdown
```

The command writes a pack to stdout; the agent must read it. Changed, expired,
withdrawn and conflicting records are excluded with reasons. Read those reasons
before relying on the selected material. An empty input directory is an error;
use source files directly until you have useful curated records.

[Continuous context](../harness/workflows/continuous-context.md) documents
explicit record inputs, limits and refresh/supersession behavior.

## Gate required QA evidence

Add a producer adapter around each relevant project check. Its JSON must follow
[the QA schema](../harness/templates/qa-signal.schema.json) and report the actual
status, revision, run/attempt and completion time. The
[optional CI example](../examples/ci/github-actions-qa-brief.yml) demonstrates a
producer; it is not an active integration in this repository.

Choose required areas from [the project quality policy](../harness/templates/quality-policy.md)
and pass that decision explicitly to the CLI. The policy template is not parsed
by the gate. The areas below are examples, not universal requirements:

```bash
node scripts/qa-brief.mjs --signals .harness/qa-signals --gate --revision REVISION --run-id RUN_ID --required correctness,security --max-age-hours 24 --out .harness/qa-reports/brief.md --json .harness/qa-reports/brief.json
```

This blocks until matching required evidence exists and passes. Exit 0 means the
supplied gate policy passes; exit 1 means blocked, including missing, unreadable
or malformed evidence; exit 2 means invalid usage or a top-level execution/output
error. Advisory mode without `--gate` can exit 0 while reporting missing evidence.
For projects deliberately excluding AC tracing, use `--no-trace`; required
behavioral evidence still applies.

## Evaluate a harness change

Execute representative paired tasks using
[the evaluation workflow](../harness/workflows/evaluate-improvement.md), then
validate the measured results:

```bash
node scripts/evaluate-harness.mjs --input path/to/evaluation.json
```

For a synthetic demonstration of the checker only:

```bash
node scripts/evaluate-harness.mjs --input harness/templates/harness-evaluation.example.json
```

Eligibility requires a successful improvement on a motivating case, successful
controls, retained invariants, no new false positives and declared resource
limits. The checker does not execute agents or verify the truth of referenced
evidence. Actual task outcomes, independent graders and project observation
must establish whether the proposed workflow or skill helps.

## Audit and maintain this repository

In an adopting project, run `node scripts/harness-audit.mjs --days 30` only after
configuring a producer for its expected trace schema. With no eligible records,
the audit reports insufficient evidence. A folder of passive event JSON files
is not an audit trace source.

For contributors to **this harness repository**:

```bash
npm run check
```

This runs harness tests, the trace gate, research-document checks and audit.
It relies on this repository's `test/`, `specs/` and `docs/ai-fsd/` content; copying
only the core and tools does not make the whole command suitable for another
project. Merge selected commands and use the adopting project's actual quality
checks. The old `.js` sample under `test/` is a marker fixture excluded from the
runnable harness suite.
