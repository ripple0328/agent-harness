# Task: review-doc

## Use When

The user wants documentation checked for accuracy, completeness, or usefulness.

## Load

- relevant docs
- related specs or ADRs
- `harness/rules/core.md`

## Steps

1. Identify the document audience and purpose.
2. Check claims against source files, specs, and current behavior.
3. Flag stale, vague, duplicated, or missing instructions.
   - For onboarding, explain the principles, show the first real task request,
     and make inputs, expected outputs and responsibilities clear.
   - Separate ordinary agent requests from shell commands and one-time setup.
   - State what is automatic, what requires an adapter, and which commands are
     specific to this repository. Check examples against their actual inputs.
4. Prefer concrete edits over broad comments.
5. If docs expose a repeated harness gap, run `learn`.

## Output

- findings with file and line references
- recommended edits
- missing source references
- harness feedback event when needed
