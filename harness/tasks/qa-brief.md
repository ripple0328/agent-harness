# Task: QA Brief

Use when multiple checks or CI jobs need to be compressed into one high-signal QA
summary.

## Load

- `harness/workflows/qa-signal-aggregation.md`
- `harness/templates/qa-impact-packet.md`
- `harness/templates/qa-signal.schema.json`
- `harness/rules/testing.md`

## Steps

1. Collect QA signal artifacts.
2. Normalize statuses and sort failures first.
3. Run or read acceptance criteria traceability.
4. Highlight high-risk criteria with missing or weak evidence.
5. Link artifacts humans should inspect first.
6. Record not-run checks and residual risks.
7. Add harness feedback candidates when a recurring miss appears.

## Output

- QA brief or QA Impact Packet
- optional feedback event
