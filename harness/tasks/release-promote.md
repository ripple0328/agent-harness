# Task: release-promote

## Use When

A verified build should move from one environment or release stage to another.

## Load

- `harness/rules/release.md`
- project-local deployment runbook
- latest QA and PR evidence

## Steps

1. Confirm source build or commit.
2. Confirm required checks passed.
3. Read the project-local promotion runbook.
4. Execute promotion steps exactly as documented.
5. Run post-promotion smoke checks.
6. Record evidence and rollback path.

## Output

- promoted version or commit
- commands run
- smoke-check results
- rollback notes

## Project Notes

The generic harness does not define production infrastructure. Projects must add
their own deployment rules.
