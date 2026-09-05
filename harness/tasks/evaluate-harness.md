# Task: evaluate-harness

Use before promoting an instruction, skill, tool, context or workflow change.

Load `harness/workflows/evaluate-improvement.md`, the maintainer role, relevant
feedback evidence, and the evaluation example. Freeze the experiment and execute
paired tasks with independent graders; validate supplied results with
`scripts/evaluate-harness.mjs`. Synthetic examples only verify the checker.

Output: baseline/candidate results, retained invariants, false positives, cost,
held-out outcome, limitations, and canary/reject/defer decision with rollback.
