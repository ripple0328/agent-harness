# Publication privacy review — 2026-09-05

The publication set contains the reusable harness, synthetic examples and public
research sources. Private originals and detailed evidence remain outside Git.

## Changes

- Removed personal attribution, private account activity and saved-source
  associations from historical research notes and the source registry.
- Removed local execution fingerprints, schedules, workspace paths and links to
  private run artifacts. Retained public citations and research limitations.
- Excluded all local evidence, context, reviews, reports and backups under
  `.harness/`, plus environment files, keyfiles and editor backups.
- Removed automatic raw-evidence publication from optional CI examples. Shared
  metadata is selected explicitly and retained for at most seven days; full
  reports and improvement drafts stay in the runner workspace.
- Added publication review and private-provenance handling to the security,
  research and PR instructions.

## Verification

The initial publication was reviewed with manual inspection and pattern checks
of the exact staged files for credential formats, private keys, account/client
identifiers, private addresses, personal paths and private artifact references.
No embedded credentials or client/private-domain identifiers were found in the
reviewed publication set. Public research/vendor links and synthetic fixtures
were retained deliberately. This is a scoped review, not a guarantee that every
possible sensitive value is detectable.

`npm run check` passed: **71 tests**, acceptance trace gate, research knowledge
check and audit. All six optional CI examples parsed successfully, and artifact
retention and raw-evidence publication boundaries were inspected. No runtime
code or test cases changed in this privacy pass. The optional CI workflows have
not been installed or executed on GitHub.

A private harness feedback event records the publication gap and its correction.
For later releases, repeat the staged-file review and inspect any history being
published; ignore rules do not remove files that Git already tracks.
