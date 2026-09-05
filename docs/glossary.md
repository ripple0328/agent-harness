# Glossary

## Acceptance Criterion

A stable, testable requirement in a feature spec. Each criterion has an id such
as `AC1`.

## AC Traceability

The mapping from acceptance criteria to tests that cite them. This answers which
requirements are covered by tests.

## Feedback Event

A durable record of a human or agent-observed harness miss, including category,
expected behavior, target layer, and outcome.

## Harness

The instruction, workflow, rule, template, script, and metrics system that guides
agents and captures feedback.

## Harness Feedback

Feedback about how the agent process should improve, distinct from product-code
feedback.

## PR Attention Packet

A compact PR section that tells reviewers the intent, change shape, highest-risk
questions, evidence, and not-verified items.

## QA Impact Packet

A compact QA section that maps changed surfaces, impacted flows, risk, test
coverage, residual risk, and human QA focus.

## Retrofit On Touch

An incremental adoption rule: when a file or feature is materially changed, bring
its traceability, visual coverage, or tests up to current standards. Do not run a
large unrelated cleanup campaign.

## Role Prompt

Instructions for a specialized agent role such as implementer, reviewer, QA
verifier, or debugger.
