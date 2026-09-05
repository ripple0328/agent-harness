# Task: flag-cleanup

## Use When

A feature flag or rollout toggle has served its purpose and should be removed.

## Load

- project-local release and flag conventions
- related specs and tests
- `harness/rules/release.md`

## Steps

1. Confirm the flag is fully rolled out or intentionally retired.
2. Find all flag reads, writes, config, tests, and docs.
3. Remove dead branches and preserve the active behavior.
4. Update tests to assert the permanent behavior.
5. Remove stale docs and config.
6. Run affected tests and static checks.

## Output

- cleanup changes
- verification commands
- removed config list
- residual rollout risk
