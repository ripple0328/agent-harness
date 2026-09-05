# Adoption guide

Start with [the principles](principles.md) and [one real task](getting-started.md),
then adopt in measured stages.
The goal is reliable accepted work with less human effort, not maximal process.

| Stage | Change | Evidence before expanding |
|---|---|---|
| Baseline | Select one real project/task class, existing requirements and local checks | Current accepted-delivery time, review/repair burden and important failure modes |
| Delivery | Use small specs/increments and risk-based QA | Behavior and negative cases verified for the actual artifact |
| Observe | Wrap normal commands; wire one source adapter | Failures preserved, replay safe, private fields excluded, missing source visible |
| Context | Curate a few decisions and constraints | Source change, expiry, conflict and retraction remove stale context |
| Improve | Evaluate one evidence-backed change | Baseline/candidate comparison, controls, held-outs, costs and invariant preservation |
| Canary | Use the change on bounded work | Review/repair, operational outcomes and rollback observed over a stated window |
| Expand | Promote within measured scope | Repeat across claimed task classes/executors; retire redundant instructions |

Merge the bootstrap into existing agent instructions and preserve the project's
README, tests and local decisions. Start with workflow instructions, then add
only the tools and producer adapters needed by the project. Use the
[tool reference](tool-reference.md) for those integrations; the root
`npm run check` validates this harness repository, not an arbitrary adopting
project.

Keep adapters and domain/stack conventions in the project layer. Retain current
project authority and user intent. The historical web extension and CI provider
examples are optional; external skill installation requires source, license,
permission, duplication and outcome evaluation.

A fresh installation has no active telemetry or automation. Every integration
should identify its producer, run and artifact identity, collected fields,
coverage limits, access, retention and owner. Never treat zero captured events
as proof of zero failures. Preserve source evidence and record what was not run.
