# Harness Core

This directory contains the portable harness.

## Contents

```text
roles/
  Reusable role prompts. Use them as sub-agents or prompt sections.

tasks/
  Golden path task specifications. Use these when users invoke named tasks.

rules/
  Generic rules for software delivery across domains and technology stacks.

templates/
  Standard artifacts: specs, plans, QA packets, PR packets, feedback events.

workflows/
  End-to-end process prompts for define, plan, implement, review, QA, PR, learn,
  context continuity, feedback loops, signal-triggered improvement, tool-assisted
  loops, continuous external research, QA aggregation, and AI PR review.
```

## Usage Pattern

Load in this order:

1. project request
2. relevant task if a named task was invoked
3. relevant workflow
4. relevant role
5. generic rules
6. project-local rules
7. templates

For CI or automated review jobs, load the central prompt or workflow first, then
add project-local rules and only the permissions needed for the job.

Generic rules should remain broadly reusable. If a rule names a product, team,
framework, programming language, or cloud provider, put it in the project layer
instead.

## Portable defaults

For human orientation, start with [the principles](../docs/principles.md) and
[usage guide](../docs/getting-started.md). Agents use
[production delivery](workflows/production-delivery.md) as the lifecycle map,
[continuous context](workflows/continuous-context.md) for resumable knowledge,
[passive feedback](workflows/passive-feedback.md) for observations, and
[evaluation](workflows/evaluate-improvement.md) for controlled learning.
Specialized interface guidance lives in `examples/optional-web/` at the repository
root; CI provider adapters remain under `examples/ci/`. Load them only when a
project needs them.
