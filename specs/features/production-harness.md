# Feature: Evidence-driven production delivery harness

**Status:** done
**Parent:** User-requested portable harness upgrade
**Last Updated:** 2026-09-05

## Context

Build on the current spec/review/QA/research loop with executable feedback and
context mechanisms, honest quality decisions, and controlled learning. The
implementation baseline was preserved as a private file snapshot before Git
history was initialized. Research authority is not proof of local productivity.
Production outcomes require later measurements in adopting projects.

## Acceptance Criteria

- [x] **AC1 - Portable lifecycle.** Core instructions cover discovery through operation and retirement without assuming a product domain, framework, runtime, hosting service, or model vendor. Existing web-specific guidance is optional and outside default core loading. (risk: medium)
- [x] **AC2 - Passive observations.** An explicit command wrapper and structured adapter intake capture minimal outcome metadata, preserve command failures, reject malformed or conflicting replays, deduplicate events, support retention, and aggregate signals without storing command output, arguments, environment, or transcripts. (risk: high)
- [x] **AC3 - Continuous context.** Scoped context records retain source provenance, expire or invalidate after source changes, exclude conflicts and withdrawn knowledge, and build a deterministic bounded retrieval pack. (risk: high)
- [x] **AC4 - Honest quality gates.** Missing, malformed, stale, conflicting, wrong-run, or wrong-revision required QA evidence cannot produce a passing gate; quality dimensions remain separate and marker traceability is not called behavioral verification. (risk: high)
- [x] **AC5 - Controlled improvement.** Baseline/candidate evaluation requires motivating, regression and held-out cases, preserved invariants and budgets, and a measured improvement before recommending a canary; evidence never automatically edits policy or promotes itself. (risk: high)
- [x] **AC6 - Research and explanation.** A dated primary-source review evaluates adopt/defer/reject decisions and limitations; high-level principles, lifecycle and feedback/context diagrams, adoption steps and concrete commands explain implemented and integration-dependent behavior. (risk: medium)
- [x] **AC7 - Regression evidence.** Executable tests exercise failures, safe counterexamples, unrelated inputs and happy paths; fresh-checkout audit works, reports absent evidence honestly, and required deterministic checks pass. (risk: high)

## Implementation Plan

1. Baseline and primary-source research. Preserve snapshot; reproduce false-green and audit failures.
2. Parallel bounded implementations: passive signals and evaluation (coordinator), context builder, quality gates. One owner per file.
3. Generalize portable core and document full lifecycle, signal/context separation and evaluation gates. Retain historical research as evidence, optional specialization as examples.
4. Integrate commands and CI adapter examples. Independently inspect contributions, run meaningful tests plus existing checks, and save feedback/verification artifacts.

## Out Of Scope

Installing host agents or providers, editing other projects, collecting private chat,
enabling scheduled jobs, deployment, proving productivity from synthetic tests,
and an unsupported claim to be the universally best harness.

## Verification Plan

Tests use isolated fixtures and child processes. Compare baseline false-green and
audit behavior to candidate. Assert malformed and absent evidence cannot pass,
metadata minimization, stale/conflict context exclusion, evaluation regressions
and false alarms block canary. Review portable default load paths and Mermaid
structure. Document live adapter and production outcome validation as open.

## Final verification

All seven implementation criteria are verified within this repository's scope.
AC1 and AC6 were manually reviewed against the load paths, lifecycle, research,
documents and diagrams. AC2-AC5 and AC7 have executable regressions. The static
trace report is navigation evidence only; embedded fixture references can create
incidental links and AC6 documentation review is not a runtime test.

`npm run check` passed with 71 tests (68 new), the high-risk trace gate, research
integrity check and fresh-copy-safe audit. A real wrapped check produced one
minimal passive observation; an adapter-produced QA signal passed the strict
matching-revision/run gate. A reviewed context record produced a scoped pack.
See `docs/verification-2026-09-05.md` for the verification summary; detailed
feedback records stay private.

Not verified: real CI deployment, runtime/review/incident adapters, scheduler
coverage, actual baseline-versus-candidate agent task outcomes, cross-executor
portability, production quality or acceleration. These are explicitly outside
this implementation's measured claims and require project canaries.
