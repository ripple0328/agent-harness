# Workflow: Passive feedback

Capture outcomes while work runs, so humans need not restate every failure.
Signals are evidence to investigate; they do not become facts or rules by counting.

## Available collector

`scripts/capture-signals.mjs` provides four explicit operations:

```bash
node scripts/capture-signals.mjs run --label tests --run-id run-001 --revision immutable-snapshot -- executable arg
node scripts/capture-signals.mjs record --input normalized-event.json
node scripts/capture-signals.mjs summary --days 30
node scripts/capture-signals.mjs prune --days 30
```

Run from the project root or set `--root`. `--dir` defaults to `.harness/signals`.
`run` launches the exact command argv without a shell, inherits its terminal IO,
and records status, exit code/signal, time and duration. It does not retain argv,
output, environment or working payloads. No retries are added. A failed command's
exit code is retained; if a successful command cannot save evidence, the wrapper
exits 2. A missing executable is 127. The wrapper forwards SIGINT/SIGTERM to its
child; it is not a sandbox, process-tree supervisor or crash-proof audit daemon.
A forcibly killed wrapper may leave no event. Source systems must detect missing
runs when completeness is required.

Choose non-sensitive opaque labels, run IDs and immutable revision identifiers.
In Git projects, identify the tested tree including uncommitted inputs; a branch
name or HEAD alone is insufficient for dirty working trees. Outside Git, use a
reviewed content snapshot identity. Identifier syntax validation cannot guarantee
that a human did not put a secret into a label.

`record` accepts only fields defined in
`harness/templates/feedback-signal.schema.json`. Adapter event types are
`command`, `correction`, `review_rework`, `rollback`, `escaped_defect`, and
`release`. Outcomes are `passed`, `failed`, or `unknown`. The source and event ID
form the replay identity. Exact replays are ignored; conflicting replays fail
without overwriting the first event. Files are exclusively created with private
permissions. Partial or corrupt files are explicit errors, not silently ignored.

## Adapter contract

| Boundary already producing evidence | Passive collection point | What still needs judgment |
|---|---|---|
| Command/test runner | Wrap the existing invocation | Whether a failure is product, test, environment or dependency |
| CI completion | Trusted job emits normalized metadata even on failure | Coverage, required areas and exact checked artifact |
| Review resolution | Adapter emits accepted finding/rework ID | Whether a finding is correct, severe or a recurring pattern |
| User correction | Runtime adapter emits a minimal classified event linked to the source's opaque ID | Product preference versus generic process failure |
| Release/incident system | Adapter emits release, revert, escaped defect or recovery observation | Cause, impact, ownership, and observation window |

Only the command wrapper and explicit JSON intake are implemented here. Adopting
projects wire their existing CI, runtime, review and incident systems to intake.
There is no background watcher, transcript reader, installed hook, external
connector, active schedule, or automatic conversational classifier in this repo.
Do not describe an unwired adapter as collecting signals.

## Triage and retention

1. Read `summary` at a natural checkpoint such as end of an iteration. It emits
   event counts, per-group outcome counts, independent source/run counts, invalid
   records and age exclusions. Several attempts within one run remain one run.
2. Inspect repeated failures or a single severe event in the original source.
   Group only when behavior and causes match. Retries are not automatically flaky
   tests, reversions are not automatically defects, and silence is unknown coverage.
3. Confirm the cause. Curate a project fact or decision through continuous
   context; propose a generic harness improvement only when evidence supports it.
4. Attach failure and safe-control cases to an improvement experiment. A signal
   never executes its own payload, waives a check or grants permission.
5. Apply the project's retention policy. `summary --days` filters by event time;
   it does not delete. `prune --days` explicitly deletes expired valid event files
   inside the selected project directory and reports invalid records for repair.
   Keep any evidence needed by an active experiment separately under its policy.

Intake and summaries are bounded to 8 KiB per event and 10,000 directory entries.
Symlinked or escaping output paths are refused. These controls do not authenticate
producer assertions or defend against another process with the same filesystem
permissions. Store raw source artifacts in their existing access-controlled home;
never use a telemetry dump as an instruction source.
