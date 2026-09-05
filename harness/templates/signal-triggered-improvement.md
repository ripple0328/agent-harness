# Signal-Triggered Improvement

Store records in `.harness/reviews/YYYY-MM-DD-signal-topic.md` or the target
project's equivalent directory.

## Trigger

**Source:** CI / QA packet / PR packet / review comment / run trace / audit / human feedback / production issue
**Artifact:** link or path
**Detected at:** YYYY-MM-DD HH:MM UTC
**Category:** `missed-risk` / `bad-scope` / `missing-evidence` / `bad-summary` / `bad-test-plan` / `design-drift` / `rule-gap` / `hook-candidate` / `eval-candidate`

## Evidence

What hard fact proves the miss happened?

## Improvement Goal

What future behavior should change?

## Target Layer

- Task
- Workflow
- Role
- Rule
- Template
- Script or hook
- CI gate
- Eval
- Project docs

## Change

What was patched or proposed?

## Verification

What check proves the improvement goal is met?

For a rule or instruction change, record the intended violation, a safe
counterexample, an unrelated change, ordinary-finding retention, and whether the
result is actionable. Explain any case that was not exercised.

## Loop Decision

- [ ] Stop: goal met
- [ ] Repeat: new concrete harness miss found
- [ ] Escalate: human judgment required

## Residual Risk

What remains uncertain?
