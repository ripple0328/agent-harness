# Task: tech-debt

## Use When

The user wants to capture, review, or plan technical debt.

## Load

- `harness/rules/core.md`
- `harness/templates/feature-spec.md` when debt becomes a deliverable
- project-local debt register, if present

## Steps

1. Capture the debt item with evidence and impact.
2. Classify severity and affected surfaces.
3. Decide:
   - do now
   - defer
   - accept
   - convert to spec
   - convert to harness feedback
4. Add graduation criteria: what proves the debt is resolved.
5. When planning debt work, use `plan-spec`.

## Output

- debt item or updated register
- decision
- owner or next action
- linked spec or feedback event if applicable
