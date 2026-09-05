# Testing Rules

## Behavior Over Existence

Tests should verify behavior through a public interface:

- user action and visible result
- API request and response
- service input and output
- data state after a command

Avoid tests that only prove a component rendered, a function was called, or a file
exists unless that is the actual requirement.

## Acceptance-Criteria Traceability

- Every test file covering a spec declares `@spec <slug>`.
- Each test references the criteria it covers with `ACn`.
- High-risk untraced criteria block QA approval unless explicitly accepted.
- Retrofit on touch: when modifying a relevant test, add missing traceability for
  the criteria touched.

## Test Layer Selection

- Unit tests cover pure logic, branching, validation, and state transitions.
- Integration tests cover real boundaries between modules or services.
- End-to-end tests cover critical user journeys and cross-layer access boundaries.
- Accessibility tests cover semantic structure and keyboard behavior.
- Visual checks cover design drift when UI design references exist.

## Quality Filter

Before adding a test, name the bug it would catch. If the test would pass when
that bug exists, rewrite it.

## Mutation And Fault-Injection Probes

For high-risk behavior, consider a probe that intentionally breaks the important
path and confirms the test suite notices.

Good candidates:

- authorization and ownership checks
- critical validation branches
- data-loss or irreversible actions
- contract boundaries
- async retry, duplicate, timeout, and ordering behavior
- bug fixes where the previous test suite missed the bug

Record whether the probe was run, skipped, or infeasible in the QA Impact Packet.
If the same probe is repeatedly useful, promote it into a project-local command,
hook, CI job, or eval.

## Not Verified

If a test cannot run, report:

- command attempted
- reason it could not run
- substitute evidence
- residual risk

## Evidence validity and testing economics

Static `@spec`/AC markers establish possible linkage only: they do not execute
assertions, detect skipped tests, or prove that the oracle exercises the claim.
Record actual results for the exact checked artifact and run. Required evidence
that is missing, stale, malformed or conflicting cannot pass a quality gate.

Choose unit, boundary integration, contract, property/metamorphic, system,
mutation and failure/recovery checks by the failure they can expose, not a
universal ratio. Record flaky failures before retry and assign quarantine an
owner, expiry and substitute evidence. Preserve independent expected outcomes;
never change an oracle merely to make generated implementation pass.
