# QA Impact Packet

Use this before the detailed acceptance-criteria verdict.

## Scope Under Test

Feature/spec:

Changed behavior:

Changed surfaces:

| Surface | Changed? | Notes |
|---|---|---|
| User/operator interaction | Yes/No |  |
| Identity/access/trust boundary | Yes/No |  |
| Interface/contract | Yes/No |  |
| State/persistence/migration | Yes/No |  |
| Concurrency/background/external dependency | Yes/No |  |
| Usability/accessibility | Yes/No |  |
| Build/distribution/rollout/recovery | Yes/No |  |
| Harness/docs | Yes/No |  |

## Evidence Identity and Quality Decision

Expected immutable revision or workspace snapshot:

Execution ID and attempt:

Evidence completion time and maximum permitted age:

Required dimensions and why they apply (selected before inspecting results):

| Dimension | Required? | Decision | Producer/run evidence | Gap, residual risk, and owner |
|---|---|---|---|---|
| Correctness / reliability / security / operability / other | Yes/No | Passed/Failed/Not-verified/Skipped | Command result and artifact |  |

Required evidence gate decision:

Overall evidence completeness:

Use separate decisions for each dimension. A passing average cannot offset a
failed boundary. Skipped, stale, missing, wrong-revision, or wrong-run evidence is
not a pass. Record reasons for exclusions and qualification; release authorization
remains separate from evidence aggregation.

## Impacted User Flows

| Flow | Why impacted | Current evidence |
|---|---|---|
| <flow> | Direct change / dependency | Test, browser check, API check, or static proof |

## Risk By Acceptance Criterion

Rank criteria highest-risk first.

| AC | Risk | Evidence strength | Notes |
|---|---|---|---|
| AC1 | High/Medium/Low | Strong/Weak/None/N/A |  |

## Risk x Evidence Matrix

Use `strong`, `weak`, `none`, or `n/a`.

| AC | Risk | Unit | Integration | E2E | Mutation/Fault | Security | Visual | A11y | Manual |
|---|---|---|---|---|---|---|---|---|---|
| AC1 | High/Medium/Low | strong/weak/none/n/a |  |  |  |  |  |  |  |

## Acceptance-Criteria Traceability

Run:

```bash
node scripts/trace-acceptance-criteria.mjs --spec <slug>
```

Record:

- Criteria traced: N/total
- Untraced high-risk criteria: list or none
- Untraced medium/low criteria: list or none
- Orphan AC references: list or none
- Marker linkage limitations: static linkage does not prove assertions executed
  or behavior passed; link actual test outcomes separately

## Test Coverage Map

| Criterion or risk | Existing coverage | New coverage | Gap |
|---|---|---|---|
| AC1 | Test name / none | Test name / none | Missing edge/e2e/a11y/etc. |

## Advanced Confidence Probes

Use this section for checks that test whether the tests and boundaries are
actually meaningful.

| Probe | Target risk | Result | Evidence | Follow-up |
|---|---|---|---|---|
| Mutation/fault/security/accessibility/other | AC or risk name | Pass/Fail/Not-verified/Skipped | Command, artifact, or note | Action or none |

## Human QA Focus

| Priority | Scenario | Why human judgment is needed |
|---|---|---|
| P1 | <scenario> | Product judgment, visual quality, exploratory path, external dependency, or ambiguity |

## Recommended New Tests

| Priority | Test | Layer | Reason |
|---|---|---|---|
| P1 | <test case> | Unit/integration/e2e/a11y/manual | <reason> |

## Residual Risk

- Risk:
- Impact:
- Mitigation:
- Owner or next action:

## Harness Feedback

- Did QA need to infer something the harness should have surfaced?
- Did the test plan miss a repeated risk category?
- If yes, add or link a Human Feedback Event.
