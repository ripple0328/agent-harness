# Task: list-specs

## Use When

The user wants project status across specs, epics, plans, or QA readiness.

## Load

- `docs/spec-driven-process.md`
- `harness/templates/feature-spec.md`
- spec directories configured by the project

## Steps

1. Scan feature specs, epics, plans, and ADRs.
2. Group specs by status.
3. Identify ready specs with no plan.
4. Identify in-progress specs with missing QA reports.
5. Identify stale specs whose last update is old relative to active work.
6. Report next recommended actions.

## Output

- status table
- blocked or stale specs
- suggested next commands
