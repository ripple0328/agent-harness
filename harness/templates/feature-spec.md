# Feature: <Title>

**Status:** draft
**Parent:** <initiative or N/A>
**Last Updated:** YYYY-MM-DD

## Intent and success

Who needs what outcome, why now, and how will useful success be observed?
State constraints, assumptions, scope and explicit non-goals. Reuse the project's
existing requirements rather than writing duplicate artifacts.

## Acceptance criteria

- [ ] **AC1 - <short title>.** Given <state>, when <action>, then <observable result>. (risk: medium)

Use stable AC ids, do not renumber after references exist, and mark high risk
explicitly. Text matching is a coverage hint, not evidence the behavior passed.

## Boundaries and decisions

| Affected capability or boundary | Contract/invariant | Compatibility or recovery | Decision/source |
|---|---|---|---|
| <project surface> | <input, output, state, failure> | <limit or N/A> | <reference> |

Record authority, privacy and misuse concerns; include interaction and
accessibility requirements when there is a human interface. Domain-specific
schemas, protocols, screens and implementation details belong in project notes.

## Evidence plan

| Criterion | Risk and plausible failure | Check/layer | Independent oracle | Required? |
|---|---|---|---|---|
| AC1 | <failure> | <exact project command or observation> | <expected outcome> | yes |

Include successful behavior, rejection, boundary values, regression and recovery
where relevant. For high risk, use a discriminating mutation, fault or negative
case. Identify test data, assumptions, dependencies and checks that cannot run.

## Delivery and operation

- Smallest useful increment and dependencies:
- Release/acceptance owner and artifact identity:
- Observable success/failure indicators and observation window:
- Rollback/recovery and cleanup when applicable:

## Verification and handoff

| Criterion | Verdict | Artifact version, run, command, result | Gaps/owner |
|---|---|---|---|
| AC1 | verified / deviation / missing | <evidence> | <next action> |

Record implementation deviations, relevant context updates and feedback events.
