# Human Feedback Event

Store events in `.harness/reviews/YYYY-MM-DD-short-topic.md` or the target
project's equivalent directory.

## Metadata

**Date:** YYYY-MM-DD
**Source:** PR review / QA / user correction / production issue / local developer feedback
**Related PR / branch / spec:** link or path
**Workflow or role involved:** define / plan / implement / review / QA / PR / learn / other
**Category:** `missed-risk` / `bad-scope` / `missing-evidence` / `bad-summary` / `bad-test-plan` / `design-drift` / `rule-gap` / `hook-candidate` / `eval-candidate`
**Severity:** High / Medium / Low

## Signal

What did the human or agent notice?

## Expected Harness Behavior

What should the harness have surfaced, prevented, asked, or verified?

## Impact

How did this affect review, QA, scope, risk, or developer attention?

## Target Layer

Choose one:

- Workflow
- Role prompt
- Rule
- Template
- Script or hook
- Eval case
- Project documentation
- Product test

## Proposed Follow-up

Smallest durable improvement.

## Promotion Decision

- [ ] Keep as observation
- [ ] Update workflow / role / rule / template now
- [ ] Add hook candidate
- [ ] Add eval case
- [ ] Add project-local rule

## Outcome

Record the eventual change, commit, PR, or reason for no action.
