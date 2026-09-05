# Project quality policy

**Owner:** <decision owner>
**Applies to:** <change classes and release scope>
**Version / reviewed at:** <identity and date>

Choose dimensions from actual risk; rename them to the project's stable producer
areas. Each required area must produce one normalized QA signal for the expected
immutable artifact and run/attempt identity. Never derive required areas from
only the files that happened to arrive.

| Dimension | Risk/behavior | Required when | Check and independent oracle | Threshold | Owner |
|---|---|---|---|---|---|
| correctness | Required outcomes and rejection | Behavior changes | <command> | <pass condition> | <owner> |
| compatibility | Boundary/state invariants | Contract changes | <command> | <pass condition> | <owner> |
| security | Authority/privacy/misuse | Trust-boundary change | <command> | <pass condition> | <owner> |
| reliability | Failure and recovery | Recovery affected | <command> | <pass condition> | <owner> |
| resources | Latency/capacity/cost | Resource-sensitive path | <command> | <local budget> | <owner> |
| usability | Human task completion | Human interface changes | <observation> | <pass condition> | <owner> |
| maintainability | Complexity/change safety | Structural changes | <review/check> | <pass condition> | <owner> |
| operability | Release/observe/recover | Shipped artifact changes | <command/observation> | <pass condition> | <owner> |

**Required areas for this run:** <explicit list>
**Expected revision:** <tested artifact identity>
**Expected run/attempt:** <identity>
**Evidence age limit:** <hours>

A skipped or unknown required check blocks the strict gate. An accepted exception
needs a specific scope, reason, owner, expiry, substitute evidence and explicit
project release decision; it does not turn a missing check into a pass. Report
static AC links separately from behavioral test outcomes and risk completeness.
