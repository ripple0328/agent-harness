# Release Rules

- Every meaningful change should have a review surface: spec, PR packet, or
  release note depending on size.
- PRs should list validation evidence and not-verified items.
- Rollout risks should be visible before merge.
- Feature flags, migrations, or deployment toggles need an explicit cleanup or
  follow-up plan when applicable.
- Regressions found after QA should add or update a test before the fix ships.
- Harness changes should include the feedback event or eval failure that
  motivated them.
