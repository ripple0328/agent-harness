# Cross-Project Adoption And Feedback

This repository is the canonical generic harness. Other software projects adopt
only the parts relevant to their stack, risk, and delivery model.

## Adoption Loop

1. Read the target project's local instructions and current delivery workflow.
2. Compare its needs with the canonical task, workflow, rule, template, and
   deterministic-check surfaces.
3. Adopt the smallest useful end-to-end slice; record the canonical revision and
   any project-local override.
4. Verify the slice on real project work rather than on prompt compliance alone.
5. Record repeated misses or measurable gains in the target project's feedback
   event format.
6. Bring generic evidence back to this repository's `improve-harness` or
   `research-harness` task.

## Boundary

Canonical changes do not silently overwrite project-local rules. Security,
release, architecture, framework, domain, and team constraints stay in the
target project. When an upstream change conflicts with local behavior, record
the conflict and require project judgment.

## Evidence To Return

- canonical revision and adopted components
- task or change where the workflow was used
- delivery result and commands run
- human interventions and recurring corrections
- not-verified items and regressions
- recommendation: promote, keep local, revise, or remove

Daily research runs maintain the canonical workflow and may recommend adoption.
They do not sweep through and mutate every project. Adoption happens in each
project's normal delivery work so local instructions and verification remain in
control.
