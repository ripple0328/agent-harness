# Task: rebase

## Use When

A working branch should be synchronized with its base branch before planning,
implementation, review, or PR.

## Load

- project-local git policy

## Steps

1. Check current branch and working-tree status.
2. Identify the base branch.
3. Fetch latest remote refs.
4. Rebase or merge according to project policy.
5. If conflicts occur, resolve carefully and report files involved.
6. Run a targeted sanity check if conflict resolution touched code.

## Output

- base branch
- sync method
- conflicts resolved or none
- verification run
