# QA Impact Packet

## Scope Under Test

Feature/spec: `specs/features/example-feature.md`

Changed behavior: users can create and reopen named example items.

Changed surfaces:

| Surface | Changed? | Notes |
|---|---|---|
| Public route/navigation | No | Existing example page only |
| Authentication/authorization | Yes | Items are owner-scoped |
| API contract | Yes | Create and load example item |
| Data/migration | Yes | example item storage |
| UI/responsive/accessibility | Yes | form and list |

## Impacted User Flows

| Flow | Why impacted | Current evidence |
|---|---|---|
| Create example item | Direct change | E2E example-feature flow |
| Load example item | Direct change | Integration and E2E tests |

## Acceptance-Criteria Traceability

- Criteria traced: 3/3
- Untraced high-risk criteria: none
- Untraced medium/low criteria: none

## Human QA Focus

| Priority | Scenario | Why human judgment is needed |
|---|---|---|
| P1 | Form usability with long item names | Visual and usability judgment |

## Residual Risk

- Risk: Example-item payload may grow over time.
- Impact: Large payloads could affect load time.
- Mitigation: Add payload size limit in follow-up if usage indicates need.
- Owner or next action: Product decision after beta.

## Harness Feedback

No feedback event needed.
