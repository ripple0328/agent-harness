# Agent Bootstrap

This file is the project entrypoint for humans and agents.

The canonical harness is not this file. The canonical harness lives in
`harness/`. This file only tells agents how to load it.

## Load Order

For any delivery task, load context in this order:

1. `README.md`
2. `harness/README.md`
3. The relevant workflow in `harness/workflows/`
4. The relevant role in `harness/roles/`
5. Relevant generic rules in `harness/rules/` (do not load optional examples)
6. Project-local rules, if this harness has been copied into another project
7. Relevant templates in `harness/templates/`

## Task Routing

Load the matching file in `harness/tasks/` when the user invokes a named task.

- Define requirements: `harness/tasks/define-spec.md`
- Plan implementation: `harness/tasks/plan-spec.md`
- Implement a spec: `harness/tasks/implement-spec.md`
- Review a change: `harness/tasks/review.md`
- QA a feature: `harness/tasks/qa.md`
- Prepare a PR: `harness/tasks/pr.md`
- Apply a lesson: `harness/tasks/learn.md`
- Improve the harness from evidence: `harness/tasks/improve-harness.md`
- Research and evolve the harness: `harness/tasks/research-harness.md`
- Orchestrate available tools: `harness/tasks/orchestrate-tools.md`
- Validate UI against design: `examples/optional-web/tasks/visual-spec.md`
- Aggregate QA signals: `harness/tasks/qa-brief.md`

## Role Routing

- Implementation: `harness/roles/implementer.md`
- UI work: `examples/optional-web/roles/ui-specialist.md`
- QA verification: `harness/roles/qa-verifier.md`
- Code review: `harness/roles/code-reviewer.md`
- Debugging: `harness/roles/debugger.md`
- Harness improvement: `harness/roles/harness-maintainer.md`

## Optional Project Extensions

The default harness is domain and stack independent. The historical web/design
workflows live in `examples/optional-web/`; load them only for relevant work.
Use `harness/workflows/production-delivery.md` for the complete lifecycle.

## Design Knowledge (Optional)

For UI, interaction, visual, or design-system work, consult
`docs/design/README.md` and its source graph when external references would help.
Treat DesEngs and similar directories as discovery hubs, not the product's design
source of truth. Preserve project-local design systems, accessibility rules, and
approved benchmarks.

## Golden Path Tasks

- `define-spec` -> `harness/tasks/define-spec.md`
- `plan-spec` -> `harness/tasks/plan-spec.md`
- `implement-spec` -> `harness/tasks/implement-spec.md`
- `review` -> `harness/tasks/review.md`
- `qa` -> `harness/tasks/qa.md`
- `pr` -> `harness/tasks/pr.md`
- `learn` -> `harness/tasks/learn.md`
- `improve-harness` -> `harness/tasks/improve-harness.md`
- `research-harness` -> `harness/tasks/research-harness.md`
- `orchestrate-tools` -> `harness/tasks/orchestrate-tools.md`
- `visual-spec` -> `examples/optional-web/tasks/visual-spec.md`
- `qa-brief` -> `harness/tasks/qa-brief.md`

## Context, Signals and Evaluation

- Build task context: `harness/tasks/build-context.md`
- Capture feedback: `harness/tasks/capture-feedback.md`
- Evaluate improvements: `harness/tasks/evaluate-harness.md`
- Operate and maintain: `harness/tasks/operate.md`

Read `harness/workflows/continuous-context.md` at resume when durable context is
needed. Signal capture and evaluation never grant new authority or auto-promote
knowledge into rules.

## Deterministic Checks

Use scripts instead of memory for mechanical checks:

```bash
npm test
npm run qa:trace
npm run qa:trace:gate
npm run qa:brief
npm run harness:audit
npm run harness:research:check
```

## Reporting

Every iteration should report:

- files changed
- tests added or updated
- commands run and results
- acceptance criteria verified or still open
- not-verified items
- whether a harness feedback event was created
