# Task: design-token-sync

## Use When

The project has an authoritative design-token source and generated token files.

## Load

- `examples/optional-web/rules/design-validation.md`
- project-local token source instructions
- generated-file policy

## Steps

1. Read the project-local token source configuration.
2. Pull or read the authoritative token data.
3. Generate token outputs using the project-approved script.
4. Do not hand-edit generated files.
5. Run formatting and any token validation checks.
6. Report changed tokens and impacted UI surfaces.

## Output

- generated token files
- validation results
- impact summary
