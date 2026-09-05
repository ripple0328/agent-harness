# Task: capture-feedback

Use when collecting or triaging outcomes from normal delivery work.

Load `harness/workflows/passive-feedback.md` and the feedback signal schema.
Wrap an already authorized command or read a normalized adapter event; preserve
failure and report collection gaps. Summarize observations at a checkpoint,
verify causes at the original source, and route confirmed recurring/severe
misses to `improve-harness`. No automatic rule or context promotion.

Output: minimal events, summary with observation window/coverage limits, and
triage decision. A schedule or external adapter is configured only when in scope.
