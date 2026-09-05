# Task Catalog

This directory contains the golden path tasks for the harness.

Each task tells an agent what workflow, role, rules, and templates to load before
acting. Humans can ask for these tasks by name, and agents should treat the files
here as the canonical task surface.

## Relationship To Workflows

`harness/workflows/` describes the process.

`harness/tasks/` describes the work entrypoints agents and humans can invoke.

A task usually points to one workflow, one role, the rules to load, and the
artifacts it should create.

## Core Tasks

| Task | Purpose |
|---|---|
| `define-epic` | Create an initiative-level spec container. |
| `define-spec` | Create a feature spec with acceptance criteria and a test plan. |
| `define-adr` | Capture an architecture decision. |
| `list-specs` | Report spec status and next actions. |
| `plan-spec` | Produce a file-by-file implementation plan. |
| `implement-spec` | Implement an approved spec. |
| `review` | Review changes against rules and the spec. |
| `qa` | Verify acceptance criteria with evidence. |
| `learn` | Apply human or QA feedback to the harness. |
| `tech-debt` | Capture and triage technical debt. |
| `orchestrate-tools` | Map available agent-tool capabilities into a bounded workflow. |
| `review-doc` | Review docs for accuracy and actionability. |
| `external-artifact-sync` | Sync external artifacts into the repo. |
| `flag-cleanup` | Remove completed feature flags safely. |
| `release-promote` | Promote a verified build between environments. |
| `rebase` | Synchronize a branch with its base. |
| `commit` | Create a structured commit. |
| `pr` | Prepare a pull request with an attention packet. |
| `improve-harness` | Turn a concrete signal into a verified harness improvement. |
| `research-harness` | Research external AI-first delivery signals and run one bounded harness experiment. |
| `qa-brief` | Aggregate QA signals into a concise review packet. |

## Task Rule

Keep task files short. Put sequence in workflows, responsibility in roles,
constraints in rules, and output shape in templates.

## Evidence and continuity tasks

| Task | Purpose |
|---|---|
| `build-context` | Build a scoped pack from current source-backed records. |
| `capture-feedback` | Capture minimal normal-work observations and triage evidence. |
| `evaluate-harness` | Compare baseline and candidate before canary adoption. |
| `operate` | Observe releases, investigate incidents and maintain or retire software. |

Web/design tasks are optional examples in `examples/optional-web/tasks/`.
