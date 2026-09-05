# Metrics and audits

Measure useful accepted work, its human effort and its operational consequences.
No universal score can substitute for these dimensions.

| Question | Candidate measure | Required interpretation |
|---|---|---|
| Is useful work faster? | Time from accepted scope to accepted change | Task mix, waiting time and scope changes |
| Is human effort lower? | Review plus repair time per accepted change | Rejected/reopened work included |
| Is quality retained? | Escaped defects, rollback and recovery observations | Releases/users/window denominator and severity |
| Are checks trustworthy? | Flake burden, false positives and missed failures | First failures preserved, calibrated independent labels |
| Is assistance economical? | Useful successful outcomes per declared time/cost | Executor, tools, retries, evaluation and maintenance cost |
| Is context useful? | Stale/conflict exclusions and corrections after retrieval | Coverage and curation effort; counts do not prove truth |

Choose measures and thresholds before a harness experiment. Never combine
incompatible task populations, rank individual developers by these proxies or
claim causal improvement from uncontrolled trend changes.

## Local tools

- `signals:summary -- --days 30` reports normalized observations and distinct
  source/run counts. It does not infer causes or complete production rates.
- `harness:audit -- --days 30` reads `.harness/run-metrics` trace JSONL, validates
  records, filters by actual record timestamp, deduplicates, and creates its
  output directory. It reports malformed, unknown-time, stale and conflicting
  evidence outside valid denominators. Empty evidence is insufficient.
- `qa:brief` separates dimension evidence from the strict required-area gate.
- `harness:evaluate` validates a supplied paired comparison before a canary.

Feedback observations and full run traces are separate schemas. Do not point
the audit at signal files or infer that a command observation includes a QA
packet. Source adapters determine collection coverage and record presence.

## Audit decisions

Inspect the evidence behind a repeated or severe miss. Identify whether the
cause belongs to product behavior, project tooling, execution environment,
context or a generic harness layer. Choose the smallest useful fix and verify it
against the original miss, safe controls and unrelated work. Preserve raw
observations under their access/retention policy; promote only curated lessons.
