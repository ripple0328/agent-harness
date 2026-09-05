# Implementation Plan: <Feature>

**Spec:** `specs/features/<feature>.md`
**Last Updated:** YYYY-MM-DD

## 1. Summary

One paragraph describing what this plan delivers and why.

## 2. Dependencies And Prerequisites

- specs or decisions that must land first
- services or local environment needed
- configuration required
- design references required
- known blockers

## 3. Phases Applied And Skipped

| Phase | Applies? | Reason |
|---|---|---|
| Contracts and invariants | Yes/No |  |
| Behavior increment | Yes/No |  |
| Boundary integration and recovery | Yes/No |  |
| Verification and release preparation | Yes | Scope to risk |

## 4. Implementation Phases

### Phase 1: <Title>

**Tests that ship with this phase:**

- <Exact tests and behaviors.>

**Verification commands:**

```bash
<command>
```

| Step | File | Action | Details | AC refs |
|---|---|---|---|---|
| 1 | `path/to/file` | Create/Modify | <details> | AC1 |

**End of phase report:**

- files changed
- tests added or updated
- commands run
- remaining gaps

### Phase N: Finalize

**Tests that ship with this phase:** N/A - no new behavior introduced.

**Verification commands:**

```bash
<full verification commands>
node scripts/trace-acceptance-criteria.mjs --spec <slug>
```

| Step | File | Action | Details | AC refs |
|---|---|---|---|---|
| 1 | `specs/features/<feature>.md` | Modify | Update verification report and status. | All |

## 5. Key Decisions And Risks

| Decision or Risk | Recommendation | Owner |
|---|---|---|
| <risk> | <recommendation> | <owner> |

## 6. Estimated File Count

| Type | Count |
|---|---|
| Create | 0 |
| Modify | 0 |
| Delete | 0 |
