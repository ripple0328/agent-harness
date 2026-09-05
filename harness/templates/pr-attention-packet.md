# PR Attention Packet

Use this inside every meaningful pull request or change request.

## Intent

One or two sentences describing the user-visible, operational, or harness outcome.

## Change Shape

| Area | Summary | Reviewer attention |
|---|---|---|
| Behavior and contracts | N/A | Low/Medium/High |
| State and recovery | N/A | Low/Medium/High |
| Execution and release | N/A | Low/Medium/High |
| Tests | N/A | Low/Medium/High |
| Harness/docs | N/A | Low/Medium/High |

## Highest-Risk Questions

- [ ] What behavior could regress?
- [ ] What boundary or invariant changed?
- [ ] What should a human reviewer inspect first?

## Reviewer Focus

| Priority | File or area | Why it matters |
|---|---|---|
| P1 | `path/to/file` | Highest-risk logic, contract, migration, security, or workflow decision. |

## Evidence

| Check | Result | Artifact version, run, evidence and gaps |
|---|---|---|
| Unit tests | Pass/Fail/Not run |  |
| Integration tests | Pass/Fail/Not run |  |
| End-to-end tests | Pass/Fail/Not run |  |
| Project-specific quality dimensions | Pass/Fail/Not applicable/Not run |  |
| Static analysis/lint | Pass/Fail/Not run |  |
| AC traceability | Pass/Fail/Not run |  |

## Not Verified

- Explicitly list anything important that was not verified and why.

## Harness Feedback

- Did this change reveal a repeated workflow, role, rule, template, hook, or eval
  gap?
- If yes, link the Human Feedback Event.
