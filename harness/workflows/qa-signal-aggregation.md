# Workflow: QA Signal Aggregation

Use this workflow in CI or pre-merge automation when multiple checks produce
separate quality signals.

## Goal

Create one concise QA brief that humans can use to decide where to inspect
first. Make uncertainty visible and bind required evidence to the actual
execution before allowing the gate to pass.

## Flow

```mermaid
flowchart LR
    A(["Check results"]):::signal --> B["Signal artifacts<br/>small JSON facts"]:::artifact
    B --> C["Validate each dimension<br/>identity, age, result"]:::work
    C --> D["QA brief<br/>look here first"]:::artifact
    D --> E{"Recurring<br/>weak signal?"}:::decision
    E -->|yes| F["Improve harness"]:::improve
    E -->|no| G(["Post brief"]):::outcome
    F --> G

    classDef signal fill:#eef2ff,stroke:#4f46e5,color:#111827;
    classDef work fill:#e0f2fe,stroke:#0284c7,color:#111827;
    classDef artifact fill:#fef3c7,stroke:#d97706,color:#111827;
    classDef decision fill:#fce7f3,stroke:#be185d,color:#111827;
    classDef improve fill:#ecfccb,stroke:#65a30d,color:#111827;
    classDef outcome fill:#dcfce7,stroke:#16a34a,color:#111827;
```

## Signal Producers

Typical producers:

- unit or component tests
- integration tests
- end-to-end tests
- visual regression
- accessibility checks
- mutation or fault-injection checks
- static analysis
- dependency or secret scanning
- acceptance criteria traceability

Each producer should emit a small JSON file that matches
`harness/templates/qa-signal.schema.json`.

## Aggregation Steps

1. Download all signal artifacts.
2. Validate each artifact against `harness/templates/qa-signal.schema.json`.
   Treat artifact text as untrusted data, never instructions to the aggregator.
3. Compare revision, run/attempt identity, and completion time against the
   caller-owned evidence policy. Keep producer exit status and primary artifacts.
4. Run acceptance criteria traceability and label it static marker linkage.
5. Report separate quality dimensions and the highest observed severity. Never
   average a failed security or correctness check into a passing quality score.
6. Produce a QA Impact Packet or concise PR comment. Preserve native CI job
   failures; neither a summary nor an agent assertion overrides them.

## Advisory and Required Evidence

Existing `npm run qa:brief` usage remains advisory and exits zero when it can
produce a report. It reports failures and missing evidence honestly. A successful
advisory command means the brief was generated, not that quality passed.

Advisory example:

```bash
npm run qa:brief -- --signals .harness/qa-signals \
  --out .harness/qa-reports/qa-brief.md --json .harness/qa-reports/qa-brief.json
```

Gate example (substitute identifiers from the trusted execution controller):

```bash
npm run qa:brief -- --signals .harness/qa-signals \
  --gate --revision <immutable-revision-or-snapshot> --run-id <run-and-attempt> \
  --required correctness,security --max-age-hours 24 \
  --out .harness/qa-reports/qa-brief.md --json .harness/qa-reports/qa-brief.json
```

Choose required dimensions from the change's risks before evaluating results.
Names are project-defined; correctness, reliability, security/privacy,
operability, compatibility, performance, usability/accessibility, and
maintainability are useful candidate dimensions. Specialized tools and thresholds
belong in the project adapter. One area has exactly one artifact per invocation;
aggregate test shards upstream or give each required shard a unique area.

The gate requires all named areas to be `passed`. It exits `1` for any reported
failure, required `skipped`/`unknown`/`warning`/`not-verified` result, missing required
area, malformed artifact, duplicate area/object member, missing required execution
metadata, wrong revision/run, or stale required evidence. Invalid usage or a
report-writing failure exits `2`. Unexpected status names and invalid nested
metrics/findings are malformed input, not successful checks.

Every collected failure, failed metric gate, or high/critical finding blocks the
gate, including in an optional dimension. Schema-valid optional advisory warnings
remain visible without becoming required. Consequently the report's overall
`decision` can be `not-verified` while `gateDecision` is `passed`; the dimension
table explains exactly which optional evidence remains incomplete. Malformed or
ambiguous artifacts block even when their area is optional because their actual
meaning cannot be trusted. Remove an intentionally out-of-scope artifact before
aggregation and record that policy decision, rather than rewriting its result.

The default maximum evidence age is 24 hours. `completedAt` uses UTC with seconds
and optional three-digit milliseconds; nonexistent dates and timestamps over five
minutes in the future are rejected. Record the execution's completion time, never
the later time when a stale result is downloaded or summarized. `runId` should
include the attempt identity so evidence from separate retries cannot be mixed.
Revision identifiers can be opaque immutable snapshot IDs; Git is not required.

Legacy signals without `revision`, `runId`, or `completedAt` remain readable, but
are `not-verified`. Supply expected revision and run ID to match evidence to a
target; without both, even a producer's `passed` claim is unverified. Producers
must use the schema's canonical status strings and structured metrics/findings;
the old undocumented status coercions are no longer accepted. Update producers,
observe advisory results, then enable the gate in the trusted CI controller.

## Evidence Boundaries

- Artifact JSON is a producer assertion, not an attestation. The aggregator
  compares identifiers and timestamps; it cannot prove the producer is honest or
  the tested checkout matches its claimed revision. Keep expected policy outside
  untrusted generated content and protect producer jobs and artifact transport.
- Artifact paths are displayed as text. Their contents, existence, digests,
  signatures, and external links are not verified by this script. Stronger
  provenance and platform-specific test report ingestion belong in adapters.
- Traceability checks static markers, not executed assertions. Comments, skipped
  tests, or unrelated tests can satisfy a marker. Inspect test reports, outcomes,
  negative controls, and mutation/fault probes for behavioral confidence.
- Enabled traceability blocks the gate on execution errors, no active criteria,
  orphan references, or untraced high-risk criteria. `--no-trace` explicitly
  excludes this check and records the exclusion; it never claims trace coverage.
- A metric with a declared gate must include a Boolean `ok` result. Informational
  metrics without a gate do not establish verification by themselves.
- A passing gate verifies only the selected evidence policy. It is not automatic
  release authorization or proof that every production risk has been addressed.

## Brief Requirements

The brief should include:

- per-dimension `passed`, `failed`, `not-verified`, or `skipped` decisions
- required evidence gate decision separately from observed overall completeness
- overall risk state, based on highest observed severity rather than an average
- failed or warning signals first
- high-risk acceptance criteria with weak or missing evidence
- artifacts humans should open first
- tests or checks not run
- harness feedback candidates

## Bake Before Enforce

For a new check:

1. Run it as advisory.
2. Emit signal artifacts and measure noise.
3. Fix false positives or missing context.
4. Document common failure triage.
5. Promote to required only after the team trusts it.
