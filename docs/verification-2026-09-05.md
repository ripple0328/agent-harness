# Harness upgrade verification — 2026-09-05

The portable harness now has executable local capture, context retrieval,
quality gates, improvement eligibility and honest auditing. All seven criteria
in [the spec](../specs/features/production-harness.md) are verified within the
implementation scope. Production benefit is a separate, unmeasured claim.

## What changed

| Area | Files / change | Why |
|---|---|---|
| Passive capture | `scripts/capture-signals.mjs`, feedback schema/example and workflow | Capture normal command/adapter outcomes with minimal data and replay protection |
| Context | `scripts/context-pack.mjs`, record schema/example, build task and workflow | Source-backed, scoped, expiring knowledge; invalidate changes and conflicts |
| Quality | `scripts/qa-brief.mjs`, QA schema/workflow/packet; trace checker | Required dimensions cannot pass on absent, stale, ambiguous or wrong-target evidence |
| Improvement | `scripts/evaluate-harness.mjs`, paired example, workflow/task and skill evaluation template | Reject target-independent wins, broken controls, invariants, false positives and excess cost |
| Parsing | `scripts/lib/strict-json.mjs` | Reject duplicate JSON fields and sanitize malformed-payload errors |
| Audit | `scripts/harness-audit.mjs` | Fresh-copy output creation, record-time windows, validation/deduplication and observed denominators |
| Portable lifecycle | README, bootstrap, workflows, rules and spec/plan/release/handoff templates | Cover discovery through operation and retirement without a required application stack |
| Specialization | `examples/optional-web/` and updated references | Preserve existing specialized work outside core loading |
| Research/docs | Architecture diagrams, research evaluation/note, ledger/sources, adoption guides | Explain principles, source strength, adoption choices and limitations |
| Integration | Package scripts, example config, optional CI templates, `.gitignore` | Usable commands and explicit local producer boundaries; private derived artifacts excluded |

The implementation was compared against a preserved local file snapshot before
Git history was initialized. The snapshot and its detailed change manifest are
private working artifacts; the table above summarizes the implementation scope.

## Tests and commands

Seven test files add **68 behavioral tests**; the three pre-existing research
checks are retained. **71 tests pass**, zero failed or skipped. Tests exercise
original failures, safe counterexamples, unrelated cases and the public CLIs.

| Command/check | Result |
|---|---|
| `npm test` (through `npm run check`) | 71 passed |
| `npm run qa:trace:gate` | Passed; static high-risk linkage only, not behavioral proof |
| `npm run harness:research:check` | Passed |
| `npm run harness:audit` | Passed on absent metrics/output directories; zero data explicitly insufficient |
| `npm run qa:brief` advisory | Missing evidence remains not verified; reporting alone is informational |
| Captured `npm run check` through `capture-signals.mjs run` | Exit 0; one minimal event, one unique run, no invalid records |
| Explicit QA gate with matching revision/run and required `harness-correctness` | Passed using a signal constructed from actual captured check result |
| Context builder on one reviewed README-backed fact | Exit 0; current source hash and scoped record used |
| Evaluation checker on synthetic example | Eligible for canary as a checker demo only; not agent effectiveness evidence |
| Updated Markdown links, literal core paths, fences and whitespace | Checked; date/path placeholders excluded from file existence expectations |
| Two edited optional CI YAML templates | Parsed successfully; not executed on hosted CI |
| Mermaid diagrams | Source structure/labels/fences reviewed; graphical screenshot rendering not verified |

The executable checks covered scripts, regression tests, JSON contracts, package
and example config. Documentation and spec completion edits were reviewed
separately. Detailed run output, input manifests and smoke-test records remain
private under the ignored `.harness/` directory. This report summarizes their
results; run `npm run check` to verify the checked-out implementation.

## Independent review and corrected cases

Separate agents reviewed QA, context and collector/evaluator boundaries. Review
found and tests now reject duplicate-member failure erasure, withdrawn-context
reactivation, all-failed candidate canary eligibility, contradictory termination
modes, colliding source/run identifiers and malformed-payload diagnostic leakage.
The command wrapper was also tested for SIGTERM and evidence persistence failure;
a failed command remains failed and a lost capture does not become successful.

Documentation review corrected the difference between passive events and QA
producer output, and the strict QA gate's blocked versus usage-error exit codes.
Additional model review supplied advisory ideas; independent review and
executable evidence determined the final fixes.

## Acceptance and remaining limits

| Criterion | Verified evidence |
|---|---|
| AC1 portable lifecycle | Manual review of generic defaults, full lifecycle and optional extension load paths |
| AC2 passive observations | 13 capture tests plus shared strict-parser cases and real command smoke |
| AC3 continuous context | 17 context tests and a source-backed pack smoke |
| AC4 honest quality gate | 16 QA tests, three trace tests and same-input/run gate smoke |
| AC5 controlled improvement | Seven paired-evaluation tests plus strict input parsing; explicit canary-only boundary |
| AC6 research/diagrams | Primary-source synthesis, source/ledger updates, adoption decisions, overview and architecture diagrams |
| AC7 regressions/audit | Full 71-test suite and deterministic checks; nine audit tests |

Not verified: live external or hosted CI adapters, background collection,
production incident signals, agent compliance with new prose, real paired agent
trials, cross-executor transfer, statistical reliability, percentage acceleration
or production quality improvement. No schedule, external skill bundle, account
mutation, system install, deployment or adopting-project change was performed.
The local command observation and curated context smoke do not imply those
integrations exist.

A private feedback event was created. Mechanics are applied; broader
policy/skill effectiveness remains
an experiment with project-specific tasks, independent graders, observation
windows and rollback. The next measured adoption should use one representative
project change rather than add more infrastructure without a demonstrated gap.
