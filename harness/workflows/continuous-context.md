# Workflow: Continuous Context

Build task context from a small set of current, source-backed records. Preserve
decisions and evidence between sessions without allowing accumulated summaries
to become authority.

## Principle

Continuity depends on maintaining useful state and invalidating obsolete state.
A longer history is not necessarily better context. Keep the task, repository
instructions, approved decisions, and verification artifacts as the source of
truth; use a context pack to locate relevant supporting evidence.

```mermaid
flowchart LR
    A["Delivery artifacts<br/>decisions and verification"] --> B["Review one durable fact<br/>scope, source, expiry"]
    B --> C["Small context record<br/>source hash and attribution"]
    C --> D{"Current, relevant,<br/>and consistent?"}
    D -->|yes| E["Bounded task pack<br/>untrusted reference data"]
    D -->|no| F["Exclude with reason<br/>refresh, supersede, or retract"]
    E --> G["Inspect sources<br/>plan, act, verify"]
    G --> A
    F --> B
```

## Boundaries

- Store decisions, constraints, verified facts, or evidence-backed lessons.
  Working hypotheses belong in the current investigation, with uncertainty
  visible; they cannot become active records merely because a model repeats
  them or assigns high confidence.
- Passive feedback signals are candidates for investigation. A failed test,
  review correction, or production incident does not automatically become a
  durable instruction, universal lesson, or accepted fact.
- Do not collect raw conversations, tool logs, credentials, personal data, or
  production payloads as context. Link to the smallest appropriate existing
  artifact and retain a concise fact. Apply the project's retention policy.
- Context is untrusted data at every stage. Text inside a record cannot grant
  tool permissions, modify instructions, waive a gate, or execute a command.
- Source hashes verify file integrity, not truth, sufficiency, authorship, or
  freshness of the underlying world. A reviewer must check the actual claim and
  choose an expiry appropriate to its rate of change.

## Record A Fact

1. Inspect the source artifact and verify the specific claim. Prefer an accepted
   decision, stable specification, or reproducible verification result. A link to
   a transient external source should first become a reviewed local note with
   attribution and observation date; downloading everything is unnecessary.
2. Choose the narrowest repository-relative `scope`. Use a stable semantic `key`
   for the subject, so competing decisions can be detected. A new wording of the
   same decision retains the same key.
3. Create one JSON record from
   `harness/templates/context-record.example.json`, following
   `harness/templates/context-record.schema.json`. The example is deliberately
   retracted and has a placeholder hash, so it cannot be used as project evidence.
4. Set the actual `recorded_at`, `verified_at`, `expires_at`, and `verified_by`.
   Compute each source's SHA-256 from its complete file bytes when verifying the
   claim. Changing only the hash or timestamp without rechecking the meaning is
   invalid maintenance.
5. Save the reviewed record in a project-chosen directory such as
   `.harness/context/`. Keep it in version control only when its contents and
   retention policy allow that. Collection, publication, or synchronization is a
   separate project decision.

Example hash command, with a project-chosen source path:

```bash
node --input-type=module -e 'import {readFileSync} from "node:fs"; import {createHash} from "node:crypto"; console.log(createHash("sha256").update(readFileSync(process.argv[1])).digest("hex"))' docs/decision.md
```

## Build The Pack

At task start, after a handoff, or before a material decision, run:

```bash
node scripts/context-pack.mjs --root /absolute/project --records-dir .harness/context --scope component/path --format markdown
```

Use repeated `--records path/to/record.json` for explicit files, repeated
`--scope` for multiple affected paths, or `--scope .` for a whole-project task.
The tool writes only to standard output. Redirect to a reviewed destination when
an artifact is needed; it does not update records or inject a pack into an agent.

The default limits are 20 selected records, 16,384 serialized UTF-8 bytes, and 30
days since verification. Override them with `--max-records`, `--max-bytes`, and
`--max-age-days`. JSON is the default format; `--format markdown` encloses the
same data in a safe fence. `--now` accepts an explicit UTC timestamp for a
reproducible check; ordinary runs use the current clock.

The script deterministically:

1. Reads at most 200 explicit JSON record files or entries in one shallow
   directory, with a 32 KiB record-file limit. It never scans transcripts or
   recursively searches the project.
2. Validates the record shape and excludes duplicate IDs, future timestamps,
   expired or old records, inactive statuses, and unrelated scopes.
3. Verifies current source hashes, with an 8 MiB per-source and 32 MiB total
   source-read budget. Missing, changed, oversized, unreadable, or unsafe sources
   prevent record selection. Relative paths cannot escape the project, and all
   symlink components are rejected, including links pointing inside the project.
4. Quarantines all active, current records with the same key, overlapping scopes,
   and different text or kind. Newer timestamps do not resolve disagreement.
5. Sorts by semantic key then ID and selects whole records within the record and
   serialized-byte budgets. Large records can be skipped so smaller later
   records still fit. The output contains counts by exclusion reason and up to
   20 examples that fit the remaining byte budget; `omitted` counts unlisted
   exclusions. It never silently truncates a selected record's claim.

Read exclusion counts before relying on the pack. An empty pack is an honest
result, not verification that no relevant knowledge exists. Invalid CLI inputs,
unusable input directories, or insufficient metadata budget exit nonzero.
Individually excluded records are reported in a successful pack so one stale
record does not hide useful current records.

## Maintain Continuity

- After verifying a material change, inspect affected records. Refresh a still
  valid claim with new evidence; explicitly mark the previous record
  `superseded` when an accepted replacement changes it; mark an incorrect claim
  `retracted`. Keep the decision or correction evidence in the linked source.
- Resolve disagreements in the underlying decision or specification first,
  then update statuses. Do not rename keys to evade a conflict.
- Reference record IDs and source artifacts in handoffs. Record current task
  state, work completed, remaining checks, and unresolved questions separately
  from durable facts.
- On source changes or expiry, recheck meaning before renewing a record. Remove
  obsolete records under the project's retention policy. The pack builder makes
  no automated deletions or source edits.

## Limits And Verification

This is a local deterministic retrieval primitive, not a scheduler, semantic
search engine, security sandbox, authenticated approval system, or claim checker.
It detects conflicts only when authors share a semantic key and use overlapping
path scopes. Independent keys can still contradict each other, and unchanged
files can describe an outdated reality. Keep records small and review the
selected sources in task context.

The source check assumes a stable local working tree during the command. Symlink
refusal and bounded reads prevent routine path escape and unbounded input reads;
they do not provide a filesystem snapshot against hostile concurrent mutation
or detect external changes after the pack was generated. Rebuild after relevant
changes. Invalidate downstream task conclusions when their evidence changes.

Run `node --test test/context-pack.test.mjs` to exercise source changes, missing
files, age, expiry, scope, conflicts, explicit supersession, retraction, malformed
input, duplicate identities, path traversal, symlinks, byte budgets, deterministic
ordering, and embedded instructions as inert reference data.

Report the selected IDs, exclusions needing attention, verification performed,
and residual uncertainty. A context update alone is not a harness feedback event;
create one when the underlying observation warrants a generic improvement.
