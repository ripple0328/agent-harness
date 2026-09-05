# Visual Coverage Ledger

Track design and visual regression coverage for changed UI surfaces.

| Surface | Spec | Design Benchmark | Approved Baseline | Status | Owner | Notes |
|---|---|---|---|---|---|---|
| `/example-feature` | `example-feature` | `example-feature-empty.png` | `example-feature-empty-desktop.png` | Covered | Team | Empty state and populated state covered. |
| `/example` | `example-feature` | Missing | Missing | Pending | Team | Needs design source before baseline can be blessed. |

## Status Values

- `Covered`: benchmark and baseline exist.
- `Pending`: UI changed, but benchmark or baseline is missing.
- `Provisional`: baseline exists but needs follow-up validation.
- `Exempt`: coverage is not useful; reason must be documented.

## Rules

- Add or update a row whenever a UI route, page, or major component changes.
- Do not delete pending rows without either adding coverage or recording why the
  surface is exempt.
- Do not update baselines solely to silence a diff.
